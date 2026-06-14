import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, NeonHaze, GlitchKanji, Petals, ScanBeam, Scanlines, Grain} from './fx';

export const FPS = 30;
export const LOOP = 300; // 10s seamless loop @ 30fps

// Derive metadata so the Player/Studio get the right size + duration.
export const calculateMetadata = () => ({
  durationInFrames: LOOP,
  fps: FPS,
  width: 1920,
  height: 1080,
});

export type HeroLoopProps = {
  kanji?: string;
};

export const HeroLoop: React.FC<HeroLoopProps> = ({kanji = '鬼'}) => {
  const frame = useCurrentFrame();
  const t = (frame % LOOP) / LOOP; // normalized 0..1 loop time

  return (
    <AbsoluteFill style={{backgroundColor: C.bg, overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(120% 120% at 50% -10%, #14141d 0%, ${C.bg} 48%, ${C.deep} 100%)`,
        }}
      />
      <NeonHaze t={t} />
      <GlitchKanji t={t} char={kanji} />
      <Petals t={t} count={18} />
      <ScanBeam t={t} />
      <Scanlines t={t} />
      <Grain />
      {/* vignette */}
      <AbsoluteFill
        style={{boxShadow: 'inset 0 0 260px 70px rgba(0,0,0,0.9)', pointerEvents: 'none'}}
      />
    </AbsoluteFill>
  );
};

export default HeroLoop;
