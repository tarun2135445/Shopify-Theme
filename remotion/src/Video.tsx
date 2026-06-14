import {
  AbsoluteFill,
  interpolate,
  spring,
  random,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {wipe} from '@remotion/transitions/wipe';

const DISPLAY = "'Anton', 'Oswald', 'Arial Narrow', 'DejaVu Sans', Impact, sans-serif";
const DWEIGHT = 800;
const MONO = "'Anonymous Pro', ui-monospace, 'SFMono-Regular', 'DejaVu Sans Mono', Menlo, Consolas, monospace";

const C = {
  bg: '#0b0b10',
  deep: '#06060a',
  panel: '#14141b',
  ink: '#f2efe9',
  sub: '#b9b4ab',
  red: '#ff3346',
  cyan: '#00f5ff',
  purple: '#bf5fff',
  border: '#2a2a33',
};

const FPS = 30;
const SCN = [78, 98, 96, 114, 104];
const TRN = [16, 16, 18, 16];

export const calculateMetadata = () => ({
  durationInFrames: SCN.reduce((a, b) => a + b, 0) - TRN.reduce((a, b) => a + b, 0),
  fps: FPS,
  width: 1920,
  height: 1080,
});

/* ---------------- Reusable FX ---------------- */

const Scanlines = ({opacity = 0.4}) => {
  const frame = useCurrentFrame();
  const flicker = interpolate(Math.sin(frame * 0.8), [-1, 1], [0.82, 1]);
  return (
    <AbsoluteFill
      style={{
        backgroundImage:
          'repeating-linear-gradient(to bottom, rgba(242,239,233,0.06) 0px, rgba(242,239,233,0.06) 1px, transparent 1px, transparent 4px)',
        backgroundPositionY: `${frame % 6}px`,
        mixBlendMode: 'overlay',
        opacity: opacity * flicker,
      }}
    />
  );
};

const Grain = ({opacity = 0.06}) => (
  <AbsoluteFill style={{opacity, mixBlendMode: 'overlay'}}>
    <svg width="100%" height="100%">
      <filter id="g">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#g)" />
    </svg>
  </AbsoluteFill>
);

const Haze = () => {
  const frame = useCurrentFrame();
  const x = interpolate(Math.sin(frame * 0.02), [-1, 1], [-4, 4]);
  const y = interpolate(Math.cos(frame * 0.017), [-1, 1], [-3, 3]);
  const s = interpolate(Math.sin(frame * 0.013), [-1, 1], [1, 1.12]);
  return (
    <AbsoluteFill
      style={{
        transform: `translate(${x}%, ${y}%) scale(${s})`,
        background:
          'radial-gradient(38% 46% at 22% 80%, rgba(255,51,70,0.30), transparent 70%), radial-gradient(34% 40% at 82% 16%, rgba(0,245,255,0.16), transparent 70%), radial-gradient(55% 60% at 60% 95%, rgba(191,95,255,0.22), transparent 72%)',
        filter: 'blur(40px)',
      }}
    />
  );
};

const Kanji = ({char = '鬼'}) => {
  const frame = useCurrentFrame();
  const {height} = useVideoConfig();
  const rot = interpolate(Math.sin(frame * 0.02), [-1, 1], [-2.4, 2.4]);
  const dy = interpolate(Math.sin(frame * 0.015), [-1, 1], [-1.5, 1.5]);
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      <div
        style={{
          fontFamily: DISPLAY, fontWeight: DWEIGHT,
          fontSize: height * 0.66,
          lineHeight: 1,
          color: 'rgba(255,51,70,0.07)',
          WebkitTextStroke: '1px rgba(255,51,70,0.16)',
          transform: `translateY(${dy}%) rotate(${rot}deg)`,
        }}
      >
        {char}
      </div>
    </AbsoluteFill>
  );
};

const Petals = ({count = 16}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  return (
    <AbsoluteFill>
      {new Array(count).fill(0).map((_, i) => {
        const seed = i + 7;
        const x0 = random(`x${seed}`) * width;
        const dur = 150 + random(`d${seed}`) * 160;
        const p = ((frame + random(`o${seed}`) * dur) % dur) / dur;
        const y = interpolate(p, [0, 1], [-40, height + 40]);
        const sway = Math.sin(p * Math.PI * 2 + seed) * (30 + random(`s${seed}`) * 50);
        const rot = interpolate(p, [0, 1], [0, 360 + random(`r${seed}`) * 360]);
        const sz = 7 + random(`z${seed}`) * 11;
        const op = interpolate(p, [0, 0.12, 0.85, 1], [0, 0.85, 0.6, 0]);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x0 + sway,
              top: y,
              width: sz,
              height: sz,
              background: 'rgba(255,51,70,0.55)',
              borderRadius: '80% 0 80% 0',
              transform: `rotate(${rot}deg)`,
              opacity: op,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const Glitch = ({text, size, color = C.ink, weight = 1}) => {
  const frame = useCurrentFrame();
  const n = random(`g${Math.floor(frame / 3)}`);
  const burst = n > 0.8 ? (n - 0.8) / 0.2 : 0;
  const off = 2 + burst * 11 * weight;
  const jx = (random(`j${frame}`) - 0.5) * burst * 16 * weight;
  const base = {
    position: 'absolute',
    top: 0,
    left: 0,
    fontFamily: DISPLAY, fontWeight: DWEIGHT,
    fontSize: size,
    lineHeight: 0.92,
    letterSpacing: '0.01em',
    textTransform: 'uppercase',
    whiteSpace: 'pre',
  };
  return (
    <div style={{position: 'relative', display: 'inline-block'}}>
      <div style={{...base, position: 'relative', color, opacity: 0}}>{text}</div>
      <div style={{...base, color: C.red, mixBlendMode: 'screen', transform: `translate(${-off + jx}px, ${burst * 2}px)`}}>{text}</div>
      <div style={{...base, color: C.cyan, mixBlendMode: 'screen', transform: `translate(${off + jx}px, ${-burst * 2}px)`}}>{text}</div>
      <div style={{...base, color, transform: `translate(${jx}px, 0)`}}>{text}</div>
    </div>
  );
};

const Kicker = ({children, delay = 0, align = 'center', color = C.red}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const o = spring({frame, fps, delay, config: {damping: 200}});
  return (
    <div
      style={{
        fontFamily: MONO,
        fontSize: 22,
        letterSpacing: '0.5em',
        textTransform: 'uppercase',
        color,
        opacity: o,
        transform: `translateY(${interpolate(o, [0, 1], [10, 0])}px)`,
        textAlign: align,
        paddingLeft: '0.5em',
      }}
    >
      {children}
    </div>
  );
};

const Stage = ({children, petals = false, kanji = false, kanjiChar = '鬼'}) => (
  <AbsoluteFill style={{backgroundColor: C.bg, overflow: 'hidden'}}>
    <AbsoluteFill style={{background: `radial-gradient(120% 120% at 50% -10%, #14141d 0%, ${C.bg} 48%, ${C.deep} 100%)`}} />
    <Haze />
    {kanji ? <Kanji char={kanjiChar} /> : null}
    {petals ? <Petals /> : null}
    {children}
    <Scanlines />
    <Grain />
    <AbsoluteFill style={{boxShadow: 'inset 0 0 260px 70px rgba(0,0,0,0.9)'}} />
  </AbsoluteFill>
);

/* ---------------- Scenes ---------------- */

const Scene1 = () => {
  const frame = useCurrentFrame();
  const {fps, height} = useVideoConfig();
  const enter = spring({frame, fps, config: {damping: 14, stiffness: 90}, durationInFrames: 45});
  const scale = interpolate(enter, [0, 1], [1.5, 1]);
  const op = interpolate(frame, [0, 16], [0, 1], {extrapolateRight: 'clamp'});
  const ruleW = interpolate(spring({frame, fps, delay: 20, config: {damping: 200}}), [0, 1], [0, 420]);
  const glow = interpolate(Math.sin(frame * 0.2), [-1, 1], [0.55, 1]);
  return (
    <Stage>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 30}}>
        <div
          style={{
            fontFamily: DISPLAY, fontWeight: DWEIGHT,
            fontSize: height * 0.42,
            lineHeight: 1,
            color: C.ink,
            transform: `scale(${scale})`,
            opacity: op,
            textShadow: `0 0 ${40 * glow}px rgba(255,51,70,${0.7 * glow}), 0 0 ${90 * glow}px rgba(255,51,70,${0.4 * glow})`,
          }}
        >
          鬼
        </div>
        <div style={{width: ruleW, height: 2, background: `linear-gradient(90deg, transparent, ${C.cyan}, transparent)`, opacity: op}} />
        <Kicker delay={26}>新着 — Tokyo Midnight Division</Kicker>
      </AbsoluteFill>
    </Stage>
  );
};

const Scene2 = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const e1 = spring({frame, fps, delay: 4, config: {damping: 16, stiffness: 120}});
  const e2 = spring({frame, fps, delay: 14, config: {damping: 16, stiffness: 120}});
  const sub = spring({frame, fps, delay: 30, config: {damping: 200}});
  const barH = interpolate(spring({frame, fps, config: {damping: 200}}), [0, 1], [0, 300]);
  return (
    <Stage kanji>
      <AbsoluteFill style={{justifyContent: 'center', paddingLeft: 170}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 46}}>
          <div style={{width: 10, height: barH, background: C.red, boxShadow: `0 0 24px ${C.red}`}} />
          <div>
            <div style={{marginBottom: 16}}>
              <Kicker align="left">鬼 — Est. Tokyo · Drop 01</Kicker>
            </div>
            <div style={{transform: `translateX(${interpolate(e1, [0, 1], [-60, 0])}px)`, opacity: e1}}>
              <Glitch text="ONI" size={210} />
            </div>
            <div style={{transform: `translateX(${interpolate(e2, [0, 1], [-60, 0])}px)`, opacity: e2, marginTop: -22}}>
              <Glitch text="THEORY" size={210} />
            </div>
            <div
              style={{
                marginTop: 28,
                fontFamily: MONO,
                fontSize: 25,
                letterSpacing: '0.14em',
                color: C.sub,
                opacity: sub,
                transform: `translateY(${interpolate(sub, [0, 1], [14, 0])}px)`,
                maxWidth: 760,
              }}
            >
              Anime streetwear forged after dark — heavyweight hoodies &amp; graphic tees, summoned in limited runs.
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </Stage>
  );
};

const Scene3 = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const full = 'Forged After Dark.';
  const chars = Math.min(full.length, Math.max(0, Math.floor((frame - 12) / 2)));
  const cursor = interpolate(frame % 16, [0, 8, 16], [1, 0, 1]);
  const tags = ['Heavyweight Cotton', 'Limited Runs', 'Tokyo Aftermidnight'];
  return (
    <Stage petals kanji kanjiChar="夜">
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 26}}>
        <Kicker delay={2}>The Manifesto</Kicker>
        <div style={{fontFamily: DISPLAY, fontWeight: DWEIGHT, fontSize: 118, color: C.ink, textTransform: 'uppercase', lineHeight: 1}}>Anime Streetwear</div>
        <div style={{fontFamily: DISPLAY, fontWeight: DWEIGHT, fontSize: 118, color: C.red, textTransform: 'uppercase', lineHeight: 1, textShadow: '0 0 36px rgba(255,51,70,0.5)'}}>
          {full.slice(0, chars)}
          <span style={{opacity: cursor, color: C.cyan}}>▌</span>
        </div>
        <div style={{display: 'flex', gap: 18, marginTop: 22}}>
          {tags.map((t, i) => {
            const o = spring({frame, fps, delay: 36 + i * 8, config: {damping: 200}});
            return (
              <div
                key={t}
                style={{
                  fontFamily: MONO,
                  fontSize: 18,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: C.sub,
                  border: `1px solid ${C.border}`,
                  padding: '10px 18px',
                  opacity: o,
                  transform: `translateY(${interpolate(o, [0, 1], [16, 0])}px)`,
                }}
              >
                {t}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </Stage>
  );
};

const DROPS = [
  {n: '01', name: 'Cyber Samurai', tag: 'Heavyweight Hoodie', accent: C.cyan, glyph: '侍'},
  {n: '02', name: 'Dragon Spirit', tag: 'Oversized Tee', accent: C.red, glyph: '龍'},
  {n: '03', name: 'Yokai Ghost', tag: 'Graphic Tee', accent: C.purple, glyph: '幽'},
];

const Scene4 = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const head = spring({frame, fps, config: {damping: 200}});
  return (
    <Stage>
      <AbsoluteFill style={{padding: '90px 120px', flexDirection: 'column', justifyContent: 'center'}}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 28, marginBottom: 50, opacity: head, transform: `translateY(${interpolate(head, [0, 1], [20, 0])}px)`}}>
          <div style={{fontFamily: DISPLAY, fontWeight: DWEIGHT, fontSize: 96, color: C.ink, textTransform: 'uppercase', lineHeight: 1}}>The Drops</div>
          <div style={{fontFamily: MONO, fontSize: 22, letterSpacing: '0.3em', color: C.red, textTransform: 'uppercase'}}>/ SS01</div>
        </div>
        <div style={{display: 'flex', gap: 30}}>
          {DROPS.map((d, i) => {
            const s = spring({frame, fps, delay: 10 + i * 9, config: {damping: 18, stiffness: 110}});
            const sweep = interpolate(frame, [18 + i * 9, 52 + i * 9], [-120, 460], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            return (
              <div
                key={d.name}
                style={{
                  flex: 1,
                  height: 430,
                  background: `linear-gradient(180deg, ${C.panel}, #0d0d13)`,
                  border: `1px solid ${C.border}`,
                  position: 'relative',
                  overflow: 'hidden',
                  padding: 30,
                  opacity: s,
                  transform: `translateY(${interpolate(s, [0, 1], [80, 0])}px)`,
                }}
              >
                <div style={{position: 'absolute', left: 0, right: 0, top: sweep, height: 90, background: `linear-gradient(180deg, transparent, ${d.accent}22, transparent)`}} />
                <div style={{position: 'absolute', right: 16, bottom: -16, fontFamily: DISPLAY, fontWeight: DWEIGHT, fontSize: 250, lineHeight: 1, color: `${d.accent}1f`}}>{d.glyph}</div>
                <div style={{fontFamily: MONO, fontSize: 20, letterSpacing: '0.3em', color: d.accent}}>{d.n}</div>
                <div style={{position: 'absolute', left: 30, bottom: 86, fontFamily: DISPLAY, fontWeight: DWEIGHT, fontSize: 52, color: C.ink, textTransform: 'uppercase', lineHeight: 1}}>{d.name}</div>
                <div style={{position: 'absolute', left: 30, bottom: 48, fontFamily: MONO, fontSize: 18, letterSpacing: '0.2em', color: C.sub, textTransform: 'uppercase'}}>{d.tag}</div>
                <div style={{position: 'absolute', left: 30, right: 30, bottom: 36, height: 1, background: C.border}} />
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </Stage>
  );
};

const Scene5 = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const e = spring({frame, fps, config: {damping: 16, stiffness: 110}});
  const sub = spring({frame, fps, delay: 14, config: {damping: 200}});
  const btn = spring({frame, fps, delay: 26, config: {damping: 12, stiffness: 120}});
  const pulse = interpolate(Math.sin(frame * 0.15), [-1, 1], [0.5, 1]);
  return (
    <Stage petals kanji>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 26}}>
        <Kicker delay={0}>Enter The Dojo</Kicker>
        <div style={{transform: `scale(${interpolate(e, [0, 1], [0.8, 1])})`, opacity: e}}>
          <Glitch text="Shop The Drop" size={150} weight={1.3} />
        </div>
        <div style={{fontFamily: MONO, fontSize: 24, letterSpacing: '0.2em', color: C.sub, textTransform: 'uppercase', opacity: sub}}>
          Heavyweight hoodies &amp; tees · limited runs
        </div>
        <div style={{marginTop: 22, opacity: btn, transform: `scale(${interpolate(btn, [0, 1], [0.7, 1])})`}}>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 24,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: C.bg,
              background: C.red,
              padding: '20px 44px',
              fontWeight: 700,
              boxShadow: `0 0 ${30 * pulse}px rgba(255,51,70,${0.85 * pulse})`,
            }}
          >
            Shop Now →
          </div>
        </div>
        <div style={{position: 'absolute', bottom: 60, fontFamily: DISPLAY, fontWeight: DWEIGHT, fontSize: 30, letterSpacing: '0.3em', color: C.ink, textTransform: 'uppercase', opacity: sub}}>
          鬼 Oni Theory
        </div>
      </AbsoluteFill>
    </Stage>
  );
};

/* ---------------- Composition ---------------- */

export default function Video() {
  return (
    <AbsoluteFill style={{backgroundColor: C.deep}}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SCN[0]}>
          <Scene1 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: TRN[0]})} />
        <TransitionSeries.Sequence durationInFrames={SCN[1]}>
          <Scene2 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({direction: 'from-bottom'})} timing={linearTiming({durationInFrames: TRN[1]})} />
        <TransitionSeries.Sequence durationInFrames={SCN[2]}>
          <Scene3 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({direction: 'from-left'})} timing={linearTiming({durationInFrames: TRN[2]})} />
        <TransitionSeries.Sequence durationInFrames={SCN[3]}>
          <Scene4 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: TRN[3]})} />
        <TransitionSeries.Sequence durationInFrames={SCN[4]}>
          <Scene5 />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
}
