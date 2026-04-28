# Staffton Admin (frontend)

Vite + React admin app.

## Netlify

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Environment variable:** `VITE_API_BASE_URL` — full API base URL (must include `/api/v1`, e.g. `https://your-api.com/api/v1`)

See `.env.example`. SPA routing uses `public/_redirects` and `netlify.toml`.

## Local

```bash
npm install
npm run dev
```
