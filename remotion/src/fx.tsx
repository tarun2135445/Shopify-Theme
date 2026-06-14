import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  random,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

// Brand tokens (mirrors the storefront color schemes / fonts)
export const C = {
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

export const DISPLAY =
  "'Anton', 'Oswald', 'Arial Narrow', 'DejaVu Sans', Impact, sans-serif";
export const DWEIGHT = 800;
export const MONO =
  "'Anonymous Pro', ui-monospace, 'SFMono-Regular', 'DejaVu Sans Mono', Menlo, Consolas, monospace";

// Seamless oscillation: value at t=0 equals value at t=1 (integer cycles `k`).
const osc = (t: number, k: number, a: number, b: number, phase = 0) =>
  interpolate(Math.sin(2 * Math.PI * k * t + phase), [-1, 1], [a, b]);

export const NeonHaze: React.FC<{t: number}> = ({t}) => {
  const x = osc(t, 1, -4, 4);
  const y = osc(t, 1, -3, 3, Math.PI / 2);
  const s = osc(t, 1, 1, 1.12);
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

export const GlitchKanji: React.FC<{t: number; char: string}> = ({t, char}) => {
  const frame = useCurrentFrame();
  const {height} = useVideoConfig();
  const size = height * 0.62;
  const rot = osc(t, 1, -2.2, 2.2);
  const dy = osc(t, 1, -1.6, 1.6, Math.PI / 2);
  const n = random(`k${Math.floor(frame / 4)}`);
  const burst = n > 0.86 ? (n - 0.86) / 0.14 : 0;
  const off = 6 + burst * 26;
  const box: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    fontFamily: DISPLAY,
    fontWeight: DWEIGHT,
    fontSize: size,
    lineHeight: 1,
    userSelect: 'none',
  };
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      <div style={{transform: `translateY(${dy}%) rotate(${rot}deg)`}}>
        <div style={{position: 'relative', display: 'inline-block'}}>
          <div
            style={{
              ...box,
              position: 'relative',
              color: 'rgba(242,239,233,0.10)',
              WebkitTextStroke: '1px rgba(255,51,70,0.22)',
            }}
          >
            {char}
          </div>
          <div
            style={{
              ...box,
              color: 'rgba(255,51,70,0.5)',
              mixBlendMode: 'screen',
              transform: `translateX(${-off}px)`,
            }}
          >
            {char}
          </div>
          <div
            style={{
              ...box,
              color: 'rgba(0,245,255,0.45)',
              mixBlendMode: 'screen',
              transform: `translateX(${off}px)`,
            }}
          >
            {char}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Petals: React.FC<{t: number; count?: number}> = ({t, count = 18}) => {
  const {width, height} = useVideoConfig();
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      {new Array(count).fill(0).map((_, i) => {
        const seed = i + 3;
        const phase = random(`ph${seed}`);
        const cycles = 1 + Math.floor(random(`cy${seed}`) * 2); // 1..2 falls per loop
        const p = (t * cycles + phase) % 1;
        const x0 = random(`x${seed}`) * width;
        const sway = Math.sin(2 * Math.PI * p + seed) * (30 + random(`s${seed}`) * 60);
        const y = interpolate(p, [0, 1], [-0.06 * height, 1.06 * height]);
        const spins = 1 + Math.floor(random(`sp${seed}`) * 2);
        const rot = 360 * spins * p;
        const sz = 7 + random(`z${seed}`) * 12;
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

export const ScanBeam: React.FC<{t: number}> = ({t}) => {
  const {height} = useVideoConfig();
  const top = interpolate(t, [0, 1], [-0.1 * height, height]);
  const op = interpolate(t, [0, 0.1, 0.9, 1], [0, 0.5, 0.5, 0]);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top,
          height: 140,
          background:
            'linear-gradient(180deg, transparent, rgba(0,245,255,0.10), transparent)',
          opacity: op,
        }}
      />
    </AbsoluteFill>
  );
};

export const Scanlines: React.FC<{t: number}> = ({t}) => {
  const shift = (t * 60) % 6; // 60 is a multiple of 6 -> seamless
  const flicker = osc(t, 8, 0.84, 1);
  return (
    <AbsoluteFill
      style={{
        backgroundImage:
          'repeating-linear-gradient(to bottom, rgba(242,239,233,0.06) 0px, rgba(242,239,233,0.06) 1px, transparent 1px, transparent 4px)',
        backgroundPositionY: `${shift}px`,
        mixBlendMode: 'overlay',
        opacity: 0.4 * flicker,
        pointerEvents: 'none',
      }}
    />
  );
};

export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.06}) => (
  <AbsoluteFill style={{opacity, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
    <svg width="100%" height="100%">
      <filter id="oni-grain">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.85"
          numOctaves="2"
          stitchTiles="stitch"
        />
      </filter>
      <rect width="100%" height="100%" filter="url(#oni-grain)" />
    </svg>
  </AbsoluteFill>
);
