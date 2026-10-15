# background — Background removal app (feature/bg-removal-app branch)

This branch adds a minimal Node/Express frontend + backend that calls the Hugging Face Space hf-applications/background-removal through the Gradio client. It provides a single page where you can upload an image, call the Space to remove the background, preview the transparent PNG, and download it.

Important: HF_TOKEN (if used) is read only on the server from the HF_TOKEN environment variable and is never sent to the browser.

Files in this branch
- package.json
- src/server.js
- public/index.html
- public/app.js
- .env.example
- .gitignore
- Procfile
- README.md (this file — note: it will replace the repo README in this branch)

Quick local run (beginner-friendly)
1. Clone the repo and check out this branch:
   git clone git@github.com:buyfabshit-lab/background.git
   cd background
   git checkout feature/bg-removal-app

2. Create a local .env file (optional):
   cp .env.example .env
   # If you have an HF token (optional, may increase quota), put it in .env as HF_TOKEN=hf_...

3. Install dependencies and start the server:
   npm install
   npm start

4. Open http://localhost:3000 in your browser. Upload an image and click "Remove background".

Railway deploy steps
1. In Railway, create a new project → Deploy from GitHub and connect the buyfabshit-lab/background repo.
2. Select the branch feature/bg-removal-app.
3. Set environment variables in Railway:
   - HF_TOKEN (optional) — your Hugging Face token if you want to authenticate; leave empty for unauthenticated usage.
4. Railway will detect Node and run `npm start` (Procfile provided). If needed, set the start command to `node src/server.js`.

Error handling notes
- The server checks file type and size (12 MB limit). If the file is too large or a bad type you'll get a clear error message.
- If the Space is asleep or busy, the server returns a 503 with an explanatory message.

Security
- HF_TOKEN is only read server-side. Do not commit a real token; use .env and .env.example is provided.

License & credits
- This code is a simple wrapper around the Hugging Face Space hf-applications/background-removal. Review that Space's license and terms if you plan to deploy publicly.
