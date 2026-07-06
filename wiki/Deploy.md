# Deploy

Production hosting for Bird Palette.

## Live URL

https://birdpalette.web.app

## Stack

- **Frontend:** Next.js static export → Firebase Hosting
- **Functions:** `photoSample`, `birdSound` (Cloud Functions v2)
- **Data:** Static JSON in `public/data/` (not Firestore in production)
- **CI:** GitHub Actions on push to `main`

## Local deploy

```bash
npm run deploy:hosting
```

Deploys hosting + `photoSample` + `birdSound` + Firestore rules.

Requires `firebase login` or a service account JSON.

## CI

Workflow: `.github/workflows/firebase-hosting.yml`

On push to `main`:

1. Build static site
2. Deploy hosting + photoSample + firestore rules (with retry)

`birdSound` uses `XENO_CANTO_API_KEY` — set in Firebase / `functions/.env`.

## Environment

See `.env.example` and [docs/DEPLOY.md](../docs/DEPLOY.md).

## Post-deploy SEO

After deploy, verify:

- https://birdpalette.web.app/sitemap.xml
- https://birdpalette.web.app/robots.txt
- https://birdpalette.web.app/llms.txt
- Open Graph preview (Twitter Card Validator, Facebook Debugger)
