# SEO

How Bird Palette is optimized for search engines.

## Target queries

Primary:

- bird palette / birdpalette
- colors of birds
- bird plumage / bird plumage colors
- color combination of birds / bird color combinations

Secondary:

- nature color palette
- ornithology colors
- bird colors hex
- biodiversity colors

## On-page SEO (no visible UI changes)

| Layer | Implementation |
|-------|----------------|
| Title & description | `src/lib/seo.ts` + per-page `metadata` |
| Keywords | Meta keywords on all pages |
| Canonical URLs | `alternates.canonical` per route |
| Open Graph / Twitter | Shared OG image at `/og.png` |
| JSON-LD | `WebSite`, `WebApplication`, `SearchAction`, `CreativeWork` |
| Web manifest | `src/app/manifest.ts` |
| `llms.txt` | `public/llms.txt` for AI crawlers |

## Sitemap

`/sitemap.xml` includes:

- Home, perch, case study, privacy, terms
- **All bird URLs** — `/birds/{slug}` (~10,000+ entries)

Generated at build time from `public/data/search-index.json`.

## Robots

`/robots.txt` allows all crawlers and points to the sitemap.

## Deep links

`/birds/{slug}` rewrites to the home app and opens the bird modal client-side. Google can crawl URLs from the sitemap and execute JavaScript to index species-level pages.

## GitHub SEO

- README with keyword-rich description
- Repository topics: `birds`, `colors`, `palette`, `nature`, `ornithology`, `design`, `color-palette`, `biodiversity`, `plumage`
- Wiki pages mirroring project docs

## What actually moves rankings

Metadata gets you indexed; **ranking #1** also needs:

1. **Google Search Console** — verify `birdpalette.web.app`, submit sitemap
2. **Backlinks** — ornithology blogs, design communities, Reddit, Hacker News
3. **Content** — case study, perch page, research collaborations (e.g. juvenile herons)
4. **Performance** — already static CDN; Core Web Vitals help
5. **Brand searches** — "bird palette" strengthens as people share the site

## Search Console setup

1. https://search.google.com/search-console
2. Add property: `https://birdpalette.web.app`
3. Verify via DNS or HTML tag
4. Submit: `https://birdpalette.web.app/sitemap.xml`
