# Bird Palette

**Bird plumage colors & palettes from nature — 10,000+ species**

[![Live site](https://img.shields.io/badge/live-birdpalette.web.app-4A7C59?style=for-the-badge)](https://birdpalette.web.app)
[![License](https://img.shields.io/badge/license-educational%20use-stone?style=for-the-badge)](#license)

**[birdpalette.web.app](https://birdpalette.web.app)** — search bird plumage by name, species, or hex code. Real color combinations from nature for design, art, and ornithology.

---

## What is Bird Palette?

Bird Palette is a visual catalog of **bird plumage color palettes**. Every entry is a **color combination pulled from a real bird photograph** — not a generic palette generator.

- **10,000+ birds** with extracted plumage colors
- **Proportional color bars**, named swatches, share %, copy-ready hex codes
- **Search** by common name, scientific name, color family, or exact `#RRGGBB`
- **Bird detail modal** — Wikipedia summary, palette study, photo color sampling, related palettes, field recordings
- **Research entries** — e.g. juvenile Gray & Purple Heron palettes from contributor photos

> Keywords people search: *bird palette*, *birdpalette*, *colors of birds*, *bird color combinations*, *bird plumage*, *nature color palette*

---

## Quick links

| | |
|---|---|
| **Live app** | https://birdpalette.web.app |
| **About** | [/perch](https://birdpalette.web.app/perch) |
| **Case study** | [/casestudy](https://birdpalette.web.app/casestudy) |
| **Privacy** | [/privacy](https://birdpalette.web.app/privacy) |
| **Contact** | heymachineni@gmail.com |

---

## How it works

```
BirdNET / iNaturalist  →  species photos
        ↓
  background removal + pixel scan  →  plumage palette per bird
        ↓
  dataset.json + public/data/ (static JSON)
        ↓
  Next.js static export  →  Firebase Hosting + Cloud Functions
```

1. **Build** — `npm run build:birds` extracts colors from photos and writes the dataset.
2. **Deploy** — `npm run build:hosting` exports static files to `out/`.
3. **Runtime** — static JSON in the browser; photo sampling via `/api/photo-sample`; bird sounds via `/api/bird-sound`.

---

## Developer setup

```bash
git clone https://github.com/heymachineni/bird-palette.git
cd bird-palette
npm install
npm run dev
```

Open http://localhost:3000

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local dev (`USE_JSON_DATA=true`) |
| `npm run build:birds` | Full dataset rebuild from photos |
| `npm run add:custom-birds` | Merge curated birds from `public/birds/` |
| `npm run build:hosting` | Production static export |
| `npm run deploy:hosting` | Build + deploy to Firebase |

See [docs/DEPLOY.md](docs/DEPLOY.md) for CI and Firebase.

---

## Data sources

- [BirdNET](https://birdnet.cornell.edu/) — taxonomy & photos
- [iNaturalist](https://www.inaturalist.org/) — photos (fallback)
- [Wikipedia](https://www.wikipedia.org/) — species summaries
- [Xeno-canto](https://xeno-canto.org/) — field recordings

---

## GitHub topics

Add these topics on the repo for discoverability:

`birds` `colors` `palette` `nature` `ornithology` `design` `color-palette` `biodiversity` `plumage` `birding` `nextjs` `firebase` `color-inspiration` `web-app`

Or run:

```bash
gh repo edit --add-topic birds --add-topic colors --add-topic palette \
  --add-topic nature --add-topic ornithology --add-topic design \
  --add-topic color-palette --add-topic biodiversity --add-topic plumage
```

---

## Wiki

Wiki source pages live in [`wiki/`](wiki/). Enable **GitHub Wiki** on the repo and copy pages from that folder, or browse them in-repo.

| Page | Description |
|------|-------------|
| [Home](wiki/Home.md) | Project overview |
| [About](wiki/About.md) | Mission & features |
| [SEO](wiki/SEO.md) | How the site is optimized for search |
| [Data pipeline](wiki/Data-Pipeline.md) | Build & color extraction |
| [Deploy](wiki/Deploy.md) | Firebase hosting & CI |

---

## SEO

- Metadata & Open Graph on all pages
- JSON-LD (`WebSite`, `WebApplication`, `SearchAction`)
- `sitemap.xml` with **10,000+ bird URLs** (`/birds/{slug}`)
- `robots.txt`, `llms.txt`, web manifest
- Canonical URLs on every page

Details: [wiki/SEO.md](wiki/SEO.md)

---

## License & use

Educational and exploratory — **not for commercial use**. See [/terms](https://birdpalette.web.app/terms).

---

## Author

Built by **[Chandu Machineni](https://chandumachineni.com/)** · [GitHub](https://github.com/heymachineni) · heymachineni@gmail.com
