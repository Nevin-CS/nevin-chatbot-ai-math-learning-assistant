# Day 4 deployment checklist

## A. Update the existing GitHub Pages frontend
1. Upload **all files and folders in this package** to the repository root.
2. Replace the old `index.html`, `style.css`, `script.js`, `README.md`, and `.nojekyll` when prompted.
3. Keep GitHub Pages configured as `main` + `/(root)`.
4. Wait for deployment, then test the live URL in a private/incognito window.

## B. Deploy the secure AI backend
GitHub Pages is static hosting and must not contain OpenAI or Gemini API secrets.

1. Open `backend/cloudflare-worker/README.md`.
2. Deploy the Worker and add `OPENAI_API_KEY` and/or `GEMINI_API_KEY` as server-side secrets.
3. Copy the public Worker URL into root `config.js` as `apiBaseUrl`.
4. Commit and push that public URL to GitHub. Never commit API keys.

## C. Verify after deployment
- Arithmetic local mode works.
- Linear-equation local mode works.
- OpenAI mode works after the Worker is configured.
- Gemini mode works after the Worker is configured.
- Auto mode falls back between providers.
- Timeout/provider failure produces a friendly error or local fallback.
- Keyboard-only navigation works.
- Mobile layout is usable.
- Privacy and Accessibility pages open.
- `robots.txt` and `sitemap.xml` open publicly.

## Cost note
The public site has no account, payment, or credit-card flow for students and teachers. External AI providers may still charge the project owner according to their API pricing and quota policies.
