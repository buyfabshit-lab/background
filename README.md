# background

**Knockout**: background removal for DTF and print art. It runs entirely in your browser, so nothing is uploaded and there are no fees.

## Use it
- **Website:** turn on GitHub Pages (Settings → Pages → Branch: `main`, folder `/ (root)` → Save), then open https://buyfabshit-lab.github.io/background/
- **Offline:** download `index.html` and open it in Chrome, Edge or Safari.

## What it does
- **AI matte** for photos and busy art (BiRefNet-lite, MIT license, runs on your GPU). The first run downloads the model, then it's cached.
- **Color key** for flat art: it auto-detects the background from the corners, or you can click the image to pick a color.
- **Opens** PNG, JPG, WEBP, SVG, PDF and AI (PDF-compatible) files.
- **DTF cleanup:** hard edges (no ghosting), choke to remove halos, and trim to the art.
- **Resolution:** 2×, 4×, or exact 300 DPI at your print width.
- **Separate logos:** saves each island of art as its own PNG.
- **Background preview:** shirt colors or any color, with an option to bake the color into the download.
