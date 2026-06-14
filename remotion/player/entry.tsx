import React, {useEffect, useRef, useState} from 'react';
import {createRoot, Root} from 'react-dom/client';
import {Player, PlayerRef} from '@remotion/player';
import {HeroLoop, LOOP, FPS} from '../src/HeroLoop';

const COMP_W = 1920;
const COMP_H = 1080;

// Size the player so the 16:9 composition COVERS the host box (no letterboxing).
function useCoverSize(host: HTMLElement) {
  const [size, setSize] = useState(() => ({
    w: host.clientWidth || COMP_W,
    h: host.clientHeight || COMP_H,
  }));
  useEffect(() => {
    const update = () => {
      const cw = host.clientWidth;
      const ch = host.clientHeight;
      if (!cw || !ch) return;
      const scale = Math.max(cw / COMP_W, ch / COMP_H);
      setSize({w: Math.ceil(COMP_W * scale), h: Math.ceil(COMP_H * scale)});
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(host);
    return () => ro.disconnect();
  }, [host]);
  return size;
}

const PlayerApp: React.FC<{host: HTMLElement; kanji: string}> = ({host, kanji}) => {
  const ref = useRef<PlayerRef>(null);
  const {w, h} = useCoverSize(host);

  // Drive the timeline ourselves with rAF + seekTo. This is more reliable than
  // the Player's internal autoplay clock across browsers, loops seamlessly, and
  // lets us cheaply freeze when the hero is scrolled out of view.
  useEffect(() => {
    const p = ref.current;
    if (!p) return;

    let raf = 0;
    let visible = true;
    let start = performance.now();

    const tick = () => {
      if (visible) {
        const elapsed = performance.now() - start;
        const frame = Math.floor((elapsed / 1000) * FPS) % LOOP;
        p.seekTo(frame);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    let io: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting && !visible) {
              // Resume smoothly from the frame we froze on.
              const cur = p.getCurrentFrame ? p.getCurrentFrame() : 0;
              start = performance.now() - (cur / FPS) * 1000;
              visible = true;
            } else if (!e.isIntersecting) {
              visible = false;
            }
          }
        },
        {threshold: 0.01}
      );
      io.observe(host);
    }

    return () => {
      cancelAnimationFrame(raf);
      io?.disconnect();
    };
  }, [host]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Player
        ref={ref}
        component={HeroLoop}
        durationInFrames={LOOP}
        compositionWidth={COMP_W}
        compositionHeight={COMP_H}
        fps={FPS}
        numberOfSharedAudioTags={0}
        controls={false}
        clickToPlay={false}
        doubleClickToFullscreen={false}
        showVolumeControls={false}
        inputProps={{kanji}}
        style={{width: w, height: h}}
      />
    </div>
  );
};

class OniMotion extends HTMLElement {
  private root?: Root;

  connectedCallback() {
    if (this.root) return;

    // Respect reduced motion: leave the CSS fallback in place, mount nothing.
    if (
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const mount = document.createElement('div');
    mount.style.position = 'absolute';
    mount.style.inset = '0';
    this.appendChild(mount);

    const kanji = this.getAttribute('data-kanji') || '鬼';
    this.root = createRoot(mount);
    this.root.render(<PlayerApp host={this} kanji={kanji} />);
    this.setAttribute('data-mounted', 'true');
  }

  disconnectedCallback() {
    if (this.root) {
      this.root.unmount();
      this.root = undefined;
    }
    this.removeAttribute('data-mounted');
  }
}

if (!customElements.get('oni-motion')) {
  customElements.define('oni-motion', OniMotion);
}
