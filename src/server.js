import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client } from '@gradio/client';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 12 * 1024 * 1024 } });

const GRADIO_SPACE = 'hf-applications/background-removal';
let gradioClient = null;
let apiInfo = null;

async function initGradio() {
  try {
    gradioClient = await Client.connect(GRADIO_SPACE, { token: process.env.HF_TOKEN });
    try {
      apiInfo = await gradioClient.view_api();
      console.log('Space API info loaded.');
    } catch (err) {
      console.warn('view_api failed (non-fatal):', err?.message || err);
    }
  } catch (err) {
    console.error('Failed to connect to Gradio client:', err?.message || err);
  }
}

await initGradio();

app.use(express.static(path.join(__dirname, '..', 'public')));

app.post('/api/remove', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
  if (!allowed.includes(req.file.mimetype)) {
    return res.status(400).json({ error: 'Bad file type. Allowed: PNG, JPG, WEBP, GIF' });
  }

  if (!gradioClient) return res.status(503).json({ error: 'Service not ready. Try again shortly.' });

  try {
    // Inspect API info if available to build payload correctly.
    let endpoint = '/predict';
    let inputName = null;
    if (apiInfo) {
      // apiInfo may be an array or object depending on gradio-client version
      const first = Array.isArray(apiInfo) ? apiInfo[0] : apiInfo;
      if (first && first.name) endpoint = first.name;
      if (first && Array.isArray(first.inputs) && first.inputs.length > 0) inputName = first.inputs[0].name;
    }

    // Build base64 data URL from the uploaded file.
    const dataUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    let payload;
    if (inputName) payload = { [inputName]: dataUrl };
    else payload = [dataUrl];

    const result = await gradioClient.predict(endpoint, payload);

    // Try to find image output in common locations
    let out = null;
    if (result && typeof result === 'object') {
      if (Array.isArray(result.data) && result.data.length > 0) out = result.data[0];
      else if (Array.isArray(result) && result.length > 0) out = result[0];
    }

    if (typeof out === 'string' && out.startsWith('data:')) {
      return res.json({ image: out });
    }

    // If we received an http URL (hf space may return an upload URL), fetch and return as data URL
    if (typeof out === 'string' && out.startsWith('http')) {
      const fetchRes = await fetch(out);
      if (!fetchRes.ok) throw new Error('Failed to fetch image from space output URL');
      const buf = Buffer.from(await fetchRes.arrayBuffer());
      const base64 = 'data:image/png;base64,' + buf.toString('base64');
      return res.json({ image: base64 });
    }

    return res.status(500).json({ error: 'Unexpected response from Space', raw: result });
  } catch (err) {
    console.error('Remove error:', err);
    const msg = err?.message || String(err);
    if (msg.toLowerCase().includes('sleep') || msg.toLowerCase().includes('wake')) {
      return res.status(503).json({ error: 'The Hugging Face Space is asleep or busy. Try again in a moment.' });
    }
    return res.status(500).json({ error: 'Failed to remove background', detail: msg });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
