# Data Pipeline

How bird plumage palettes are built.

## Overview

```
Species list (BirdNET taxonomy)
    → photo resolver (BirdNET / iNaturalist)
    → background removal (@imgly)
    → pixel color extraction
    → theme + similar birds
    → dataset.json + public/data/
```

## Key commands

```bash
npm run build:birds              # full rebuild from photos
npm run build:birds -- --limit 50  # smoke test
npm run add:custom-birds           # merge curated photos from public/birds/
npm run refresh-colors             # re-extract colors only
npm run refresh-photos             # re-fetch photos only
```

## Custom / research birds

1. Add image to `public/birds/{slug}.webp`
2. Define entry in `scripts/custom-birds.ts`
3. Run `npm run add:custom-birds`

Example: juvenile Gray Heron at `/birds/ardea-cinerea-juvenile`.

## Output files

| File | Purpose |
|------|---------|
| `prisma/seed/dataset.json` | Master bird records |
| `public/data/search-index.json` | Client search (~18 MB) |
| `public/data/pages/page-*.json` | Paginated grid summaries |
| `public/data/manifest.json` | Page count metadata |

## Color extraction

Implemented in `src/lib/color/extract-photo.ts` and `src/lib/color/plumage.ts`:

- Background flood-fill from image borders
- Per-family clustering with ΔE deduplication
- Proportional share % per swatch
- Theme tokens derived from dominant plumage families
