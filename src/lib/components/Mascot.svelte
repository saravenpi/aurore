<script lang="ts">
  let { speaking = false, level = 0 }: { speaking?: boolean; level?: number } =
    $props();

  const SAMPLES = 28;
  const VIEW_W = 200;
  const VIEW_H = 80;
  const MID = VIEW_H / 2;

  let points = $state<number[]>(new Array(SAMPLES).fill(MID));
  let smoothed = $state(0);
  let blinking = $state(false);

  let raf = 0;
  let phase = 0;

  function quantize(value: number, step: number): number {
    return Math.round(value / step) * step;
  }

  $effect(() => {
    let mounted = true;

    function frame() {
      if (!mounted) return;

      const target = speaking ? Math.max(0, Math.min(1, level)) : 0;
      smoothed += (target - smoothed) * 0.18;

      phase += speaking ? 0.32 : 0.06;

      const base = speaking ? 4 : 1.2;
      const amp = base + smoothed * (MID - 8);

      const next: number[] = [];
      for (let i = 0; i < SAMPLES; i++) {
        const t = i / (SAMPLES - 1);
        const wobble =
          Math.sin(t * 7 + phase) * 0.7 +
          Math.sin(t * 13 - phase * 1.7) * 0.3;
        const envelope = Math.sin(t * Math.PI);
        const y = MID - wobble * amp * envelope;
        next.push(quantize(y, 2));
      }
      points = next;

      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);

    return () => {
      mounted = false;
      cancelAnimationFrame(raf);
    };
  });

  $effect(() => {
    let timer: ReturnType<typeof setTimeout>;

    function scheduleBlink() {
      const wait = 2400 + Math.random() * 3600;
      timer = setTimeout(() => {
        blinking = true;
        setTimeout(() => {
          blinking = false;
          scheduleBlink();
        }, 130);
      }, wait);
    }

    scheduleBlink();

    return () => clearTimeout(timer);
  });

  const polyline = $derived(
    points
      .map((y, i) => `${(i / (SAMPLES - 1)) * VIEW_W},${y}`)
      .join(" ")
  );
</script>

<div class="mascot" class:speaking>
  <div class="screen">
    <div class="face">
      <div class="eyes" class:blink={blinking}>
        <span class="eye"></span>
        <span class="eye"></span>
      </div>
      <svg
        class="mouth"
        viewBox="0 0 {VIEW_W} {VIEW_H}"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <polyline points={polyline} />
      </svg>
    </div>
    <div class="vignette"></div>
    <div class="scanlines"></div>
    <div class="flicker"></div>
  </div>
</div>

<style>
  .mascot {
    width: 100%;
    max-width: 320px;
    margin: 0 auto;
  }

  .screen {
    position: relative;
    width: 100%;
    height: 150px;
    border-radius: var(--r-lg, 20px);
    background: #050607;
    overflow: hidden;
    isolation: isolate;
    image-rendering: pixelated;
  }

  .face {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 18px;
    color: #eafdff;
    filter: drop-shadow(0 0 4px rgba(180, 255, 250, 0.55))
      drop-shadow(0 0 10px rgba(120, 230, 220, 0.25));
  }

  .eyes {
    display: flex;
    gap: 34px;
  }

  .eye {
    display: block;
    width: 16px;
    height: 26px;
    border-radius: 6px;
    background: #eafdff;
    transition: transform 0.07s steps(2, end);
    transform-origin: center;
    will-change: transform;
  }

  .eyes.blink .eye {
    transform: scaleY(0.08);
  }

  .mouth {
    width: 64%;
    height: 38px;
    display: block;
  }

  .mouth polyline {
    fill: none;
    stroke: #eafdff;
    stroke-width: 3.5;
    stroke-linecap: square;
    stroke-linejoin: miter;
    vector-effect: non-scaling-stroke;
  }

  .vignette {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(
      120% 120% at 50% 50%,
      transparent 55%,
      rgba(0, 0, 0, 0.55) 100%
    );
    z-index: 2;
  }

  .scanlines {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: repeating-linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 0px,
      rgba(0, 0, 0, 0) 2px,
      rgba(0, 0, 0, 0.28) 3px,
      rgba(0, 0, 0, 0.28) 4px
    );
    mix-blend-mode: multiply;
    opacity: 0.7;
    z-index: 3;
  }

  .flicker {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: rgba(200, 255, 250, 0.03);
    z-index: 4;
    animation: flicker 4.2s steps(12, end) infinite;
  }

  @keyframes flicker {
    0%,
    100% {
      opacity: 0.5;
    }
    25% {
      opacity: 0.62;
    }
    50% {
      opacity: 0.46;
    }
    75% {
      opacity: 0.58;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .flicker {
      animation: none;
      opacity: 0.5;
    }
    .eye {
      transition: none;
    }
  }
</style>
