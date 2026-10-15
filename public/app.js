const fileInput = document.getElementById('file');
const preview = document.getElementById('preview');
const removeBtn = document.getElementById('remove');
const statusEl = document.getElementById('status');
const errorEl = document.getElementById('error');
const resultImg = document.getElementById('resultImg');
const downloadBtn = document.getElementById('downloadBtn');

let selectedFile = null;

fileInput.addEventListener('change', (ev)=>{
  const f = ev.target.files && ev.target.files[0];
  selectedFile = f || null;
  errorEl.textContent = '';
  resultImg.src = '';
  downloadBtn.style.display = 'none';
  if (!f) { preview.src = ''; return; }
  const url = URL.createObjectURL(f);
  preview.src = url;
});

removeBtn.addEventListener('click', async ()=>{
  errorEl.textContent = '';
  statusEl.textContent = '';
  resultImg.src = '';
  downloadBtn.style.display = 'none';

  if (!selectedFile) { errorEl.textContent = 'Please select a file first.'; return; }
  const fd = new FormData();
  fd.append('image', selectedFile, selectedFile.name);

  try {
    statusEl.textContent = 'Uploading and processing...';
    const resp = await fetch('/api/remove', { method: 'POST', body: fd });
    if (!resp.ok) {
      const body = await resp.json().catch(()=>null);
      errorEl.textContent = body?.error || `Server error: ${resp.status}`;
      statusEl.textContent = '';
      return;
    }
    const body = await resp.json();
    if (body?.image) {
      resultImg.src = body.image;
      downloadBtn.style.display = 'inline-block';
      downloadBtn.onclick = ()=>{
        const a = document.createElement('a');
        a.href = body.image;
        a.download = 'result.png';
        a.click();
      };
      statusEl.textContent = 'Done.';
    } else {
      errorEl.textContent = 'Unexpected response from server';
      statusEl.textContent = '';
    }
  } catch (err) {
    console.error(err);
    errorEl.textContent = 'Network error or the Space may be asleep/busy.';
    statusEl.textContent = '';
  }
});
