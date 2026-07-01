# Bird Palette - Launch Film

A cinematic ~58s launch film for Bird Palette, built with [Remotion](https://www.remotion.dev).
1920x1080, 60fps. Story-first: "Nature has already solved color harmony; Bird Palette makes those relationships discoverable."

## Quick start

```bash
cd launch-film
npm install
npm run dev      # opens Remotion Studio at http://localhost:3000
```

Render the final MP4:

```bash
npm run render   # -> out/bird-palette-launch.mp4
```

The film previews end-to-end **without any assets** (placeholders + silence).
Drop in the real assets below to reach final quality.

## Asset manifest

Place files in `public/`:

### Hero bird cutouts (transparent PNG, high-res)
- `birds/peacock.png`
- `birds/macaw.png`
- `birds/kingfisher.png`
- `birds/goldfinch.png`
- `birds/flamingo.png`

### Reveal grid + ending mosaic
- `grid/grid-01.png` ... `grid/grid-24.png` (square crops or transparent cutouts)

### Audio (calm, premium; no epic trailer music)
- `audio/ambient-birds.mp3` - continuous ambient bird bed
- `audio/atmosphere-pad.mp3` - soft cinematic drone
- `audio/riser-reveal.mp3` - gentle riser under the Act 2 title
- `audio/riser-hex.mp3` - riser as the HEX value locks in (Act 5)
- `audio/chime-copy.mp3` - subtle confirmation on the copy interaction (Act 6)

Audio is auto-detected: missing files simply stay silent (no errors).

## Architecture

- `src/Root.tsx` - registers the `BirdPaletteLaunch` composition.
- `src/BirdPaletteLaunch.tsx` - master timeline (7 acts + soundtrack).
- `src/timing.ts` - single source of truth for act timing (60fps).
- `src/theme/` - color and typography systems.
- `src/motion/` - easings, springs, primitives, transitions, `useBeat`.
- `src/components/` - shared building blocks (Stage, BirdGrid, ColorBloom, HeroBird, ColorWheel, ParticleField, SearchBar, ...).
- `src/acts/` - one component per act.

Bird palettes in `src/theme/colors.ts` are seeded from the product dataset
(`public/data/v2/birds.json` in the main app). Kingfisher/Flamingo palettes are
tasteful placeholders and can be swapped once cutouts are finalized.
