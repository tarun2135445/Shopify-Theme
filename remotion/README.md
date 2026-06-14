# ONI THEORY — Remotion Brand Trailer

A frame-driven, cinematic brand trailer for **ONI THEORY** built with
[Remotion](https://remotion.dev). It matches the store's visual language:
Anton display type, the 鬼 kanji, Oni-red / cyber-cyan / oni-purple neon haze,
CRT scanlines, film grain, drifting sakura petals, and chromatic-aberration
glitch text.

## What's in the video

`src/Video.tsx` renders a 5-scene sequence (~14s, 1920×1080, 30fps):

1. **Summon** — the 鬼 kanji glows in over a neon haze + "Tokyo Midnight Division".
2. **Wordmark** — `ONI / THEORY` slams in with red/cyan glitch slices.
3. **Manifesto** — typewriter "Anime Streetwear — Forged After Dark" + spec tags.
4. **The Drops** — staggered product cards (Cyber Samurai / Dragon Spirit / Yokai Ghost).
5. **CTA** — "Shop The Drop" glitch headline + pulsing "Shop Now →" button.

All motion is driven by `useCurrentFrame()` (no CSS animation), so it renders
deterministically.

## Preview & render

This folder is a **self-contained Remotion project** — install and render:

```bash
cd remotion
npm install
npm run studio    # interactive preview at http://localhost:3000
npm run render    # export out/oni-theory.mp4 (composition id: Main)
```

The composition is registered in [`src/Root.tsx`](./src/Root.tsx). Remotion does
**not** auto-detect the `calculateMetadata` export from `Video.tsx` — it must be
passed to `<Composition>` as a prop (alongside fallback dimensions), which is
already wired up here:

```tsx
import {Composition} from 'remotion';
import Video, {calculateMetadata} from './Video';

<Composition
  id="Main"
  component={Video}
  calculateMetadata={calculateMetadata}
  durationInFrames={424}
  fps={30}
  width={1920}
  height={1080}
/>
```

> **Headless Chromium:** Remotion downloads its own Chrome on first render. In a
> locked-down or CI environment that blocks that download, point it at an
> existing Chrome **headless-shell** binary instead:
> `npm run render -- --browser-executable=/path/to/headless_shell`

### Fonts

The composition uses a system display stack (`'Anton', 'Oswald', 'Arial
Narrow', 'DejaVu Sans', Impact, sans-serif`) so it renders anywhere with no
font dependency. To match the storefront's exact **Anton** headings in the
exported MP4, install and load it:

```bash
npm i @remotion/google-fonts
```

```tsx
import {loadFont} from '@remotion/google-fonts/Anton';
const DISPLAY = loadFont().fontFamily; // replace the DISPLAY constant
```

## Use it in the store

Render to `oni-theory.mp4`, upload it in **Shopify admin → Content → Files**
(or to the theme's `assets/`), then add the **Oni promo video** section
(`sections/oni-promo-video.liquid`) to any page and paste the file URL. The
section overlays the brand headline, kanji, scanlines and CTA buttons on top of
the looping video, and falls back to an animated neon backdrop if no video is set.

> Note: this `remotion/` folder is source only and is excluded from theme
> deploys via `.shopifyignore`.
