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

## Preview & render locally

This folder holds only the composition source. To preview or export an MP4,
drop it into a Remotion project:

```bash
# one-time: create a Remotion project and copy this source in
npm create video@latest -- --template blank oni-trailer
cp src/Video.tsx oni-trailer/src/
cd oni-trailer
npm i @remotion/transitions @remotion/google-fonts

# register the composition in src/Root.tsx, then:
npx remotion studio          # interactive preview
npx remotion render Video out/oni-theory.mp4   # export MP4
```

`calculateMetadata()` in `Video.tsx` sets duration/fps/size automatically, so
the registered `<Composition>` only needs an id and the component.

## Use it in the store

Render to `oni-theory.mp4`, upload it in **Shopify admin → Content → Files**
(or to the theme's `assets/`), then add the **Oni promo video** section
(`sections/oni-promo-video.liquid`) to any page and paste the file URL. The
section overlays the brand headline, kanji, scanlines and CTA buttons on top of
the looping video, and falls back to an animated neon backdrop if no video is set.

> Note: this `remotion/` folder is source only and is excluded from theme
> deploys via `.shopifyignore`.
