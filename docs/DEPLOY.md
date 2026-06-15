# Deploy to Firebase Hosting

Live URL: [https://nature-colorpalette.web.app](https://nature-colorpalette.web.app)

Every push to `main` builds a static site and deploys to Firebase Hosting via GitHub Actions.

## One-time setup (you do this once)

### 1. GitHub secret for Firebase deploy

The workflow needs your Firebase service account JSON as a GitHub secret.

1. Open [GitHub → Nature-color-palette → Settings → Secrets and variables → Actions](https://github.com/heymachineni/Nature-color-palette/settings/secrets/actions)
2. Click **New repository secret**
3. Name: `FIREBASE_SERVICE_ACCOUNT_NATURE_COLORPALETTE`
4. Value: paste the **entire contents** of your file  
   `nature-colorpalette-firebase-adminsdk-fbsvc-70838260b8.json`  
   (the whole `{ "type": "service_account", ... }` JSON)
5. Click **Add secret**

### 2. Firebase Hosting (first deploy)

If Hosting isn’t enabled yet:

1. [Firebase Console](https://console.firebase.google.com) → **nature-colorpalette**
2. **Build** → **Hosting** → **Get started**
3. You can skip the CLI wizard — GitHub Actions deploys for you

### 3. Connect custom domain (if needed)

1. **Hosting** → **Add custom domain**
2. Use `nature-colorpalette.web.app` (usually automatic for same project)

### 4. Trigger first deploy

Push to `main` (or re-run the workflow in GitHub → Actions):

```bash
git push origin main
```

Watch progress: GitHub → **Actions** → **Deploy to Firebase Hosting**

---

## How it works

```
git push origin main
       ↓
GitHub Actions
  npm ci
  npm run build:hosting   ← static export from dataset.json
       ↓
firebase deploy --only hosting   ← uploads out/ folder
       ↓
https://nature-colorpalette.web.app
```

- **GitHub** = source code
- **Firestore** = bird database (update with `npm run seed:firestore`)
- **Static site** = built from `prisma/seed/dataset.json` at deploy time
- **Images** = `public/birds/` (included in deploy, no Storage needed)

After updating palettes locally:

```bash
npm run refresh-colors      # re-extract colors
npm run seed:firestore      # sync Firestore
git add prisma/seed/dataset.json
git commit -m "Update bird palettes"
git push origin main        # auto-deploys
```

---

## Manual deploy (optional)

```bash
npm install -g firebase-tools
firebase login
npm run deploy:hosting
```

Requires Firebase CLI logged in with access to `nature-colorpalette`.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Action fails: missing secret | Add `FIREBASE_SERVICE_ACCOUNT_NATURE_COLORPALETTE` (see step 1) |
| Action fails: permission denied | Service account needs **Firebase Hosting Admin** role in Google Cloud IAM |
| Site loads but no birds | Re-run build; ensure `dataset.json` is committed |
| Old content after push | Check Actions tab — rollout must finish with green check |
