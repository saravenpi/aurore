<script lang="ts">
  import { fly, fade, scale } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { brief } from "$lib/brief.svelte";
  import { timeLabel } from "$lib/time";

  import SlideGreeting from "./SlideGreeting.svelte";
  import SlideWeather from "./SlideWeather.svelte";
  import SlideNews from "./SlideNews.svelte";
  import SlideEmails from "./SlideEmails.svelte";
  import SlideNotifications from "./SlideNotifications.svelte";
  import SlideOutro from "./SlideOutro.svelte";

  import Sunrise from "~icons/solar/sunrise-bold-duotone";
  import ArrowLeft from "~icons/lucide/chevron-left";
  import ArrowRight from "~icons/lucide/chevron-right";
  import Play from "~icons/lucide/play";
  import Pause from "~icons/lucide/pause";
  import Close from "~icons/lucide/x";

  const slideComponents = {
    greeting: SlideGreeting,
    weather: SlideWeather,
    news: SlideNews,
    emails: SlideEmails,
    notifications: SlideNotifications,
    outro: SlideOutro,
  };

  const current = $derived(brief.current);
  const Active = $derived(current ? slideComponents[current.kind] : null);

  let now = $state(timeLabel());

  $effect(() => {
    const id = setInterval(() => {
      now = timeLabel();
    }, 1000);
    return () => clearInterval(id);
  });

  function segmentFill(i: number): number {
    if (i < brief.index) return 100;
    if (i === brief.index) return Math.min(100, brief.progress * 100);
    return 0;
  }

  function onKeydown(e: KeyboardEvent) {
    if (!brief.open) return;
    if (e.key === " ") {
      e.preventDefault();
      brief.toggle();
    } else if (e.key === "ArrowRight") {
      brief.next();
    } else if (e.key === "ArrowLeft") {
      brief.prev();
    } else if (e.key === "Escape") {
      brief.stop();
    }
  }
</script>

<svelte:window onkeydown={onKeydown} />

{#if current}
  <div
    class="diaporama"
    transition:scale={{ duration: 420, start: 0.96, opacity: 0, easing: cubicOut }}
  >
    <div class="top-ui">
      <div class="bars">
        {#each Array(brief.count) as _, i}
          <div class="bar-track">
            <div
              class="bar-fill"
              class:instant={i !== brief.index}
              style="width:{segmentFill(i)}%"
            ></div>
          </div>
        {/each}
      </div>

      <header class="head">
        <div class="brand">
          <Sunrise style="font-size:18px" />
          <span>Aurore</span>
        </div>
        <span class="clock">{now}</span>
      </header>
    </div>

    <button class="zone zone-prev" aria-label="Précédent" onclick={() => brief.prev()}></button>
    <button class="zone zone-next" aria-label="Suivant" onclick={() => brief.next()}></button>

    <div class="stage">
      {#key brief.index}
        <div
          class="slide-wrap"
          in:fly={{ y: 24, duration: 480, easing: cubicOut }}
          out:fade={{ duration: 180 }}
        >
          {#if Active}
            <Active slide={current} />
          {/if}
        </div>
      {/key}
    </div>

    <div class="controls liquid-glass" role="toolbar" aria-label="Contrôles du diaporama">
      <button class="ctrl" aria-label="Précédent" onclick={() => brief.prev()}>
        <ArrowLeft style="font-size:22px" />
      </button>
      <button class="ctrl play" aria-label={brief.playing ? "Pause" : "Lecture"} onclick={() => brief.toggle()}>
        {#if brief.playing}
          <Pause style="font-size:20px" />
        {:else}
          <Play style="font-size:20px" />
        {/if}
      </button>
      <button class="ctrl" aria-label="Suivant" onclick={() => brief.next()}>
        <ArrowRight style="font-size:22px" />
      </button>
      <button class="ctrl close" aria-label="Fermer" onclick={() => brief.stop()}>
        <Close style="font-size:20px" />
      </button>
    </div>
  </div>
{/if}

<style>
  .diaporama {
    position: fixed;
    inset: 0;
    z-index: 100;
    overflow: hidden;
    background: var(--paper);
  }

  .top-ui {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 30;
    padding: 30px 22px 0;
    pointer-events: none;
  }

  .bars {
    display: flex;
    gap: 6px;
  }

  .bar-track {
    flex: 1;
    height: 3.5px;
    border-radius: var(--r-pill);
    background: var(--hair);
    overflow: hidden;
  }

  .bar-fill {
    height: 100%;
    border-radius: var(--r-pill);
    background: var(--accent);
    transition: width 0.12s linear;
  }

  .bar-fill.instant {
    transition: none;
  }

  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 12px;
    padding: 0 4px;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.01em;
    color: var(--ink);
  }

  .brand :global(svg) {
    color: var(--accent);
  }

  .clock {
    font-size: 14px;
    font-weight: 500;
    color: var(--ink-soft);
  }

  .zone {
    position: absolute;
    top: 0;
    bottom: 0;
    z-index: 10;
    background: none;
    border: none;
    cursor: pointer;
  }

  .zone-prev {
    left: 0;
    width: 30%;
  }

  .zone-next {
    left: 30%;
    width: 70%;
  }

  .stage {
    position: absolute;
    inset: 0;
    z-index: 20;
    display: grid;
    place-items: center;
    padding: 120px 0 130px;
    pointer-events: none;
  }

  .slide-wrap {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .slide-wrap :global(a),
  .slide-wrap :global(.scroll) {
    pointer-events: auto;
  }

  .controls {
    position: absolute;
    bottom: 28px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 40;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px;
    border-radius: var(--r-pill);
  }

  .ctrl {
    display: grid;
    place-items: center;
    width: 48px;
    height: 48px;
    border-radius: var(--r-pill);
    color: var(--ink);
    transition:
      transform 0.22s var(--ease-soft),
      background 0.22s var(--ease-soft);
  }

  .ctrl:hover {
    transform: scale(1.08);
    background: var(--accent-soft);
  }

  .ctrl:active {
    transform: scale(0.97);
  }

  .ctrl.play {
    background: var(--accent-soft);
    color: var(--accent-ink);
  }

  .ctrl.play:hover {
    background: var(--accent-soft);
  }

  .ctrl.close {
    color: var(--ink-soft);
  }
</style>
