<script lang="ts">
  import { fly, fade, scale } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { config } from "$lib/config.svelte";
  import { greeting, longDateLabel } from "$lib/time";
  import type { Slide } from "$lib/types";
  import Sunrise from "~icons/solar/sunrise-bold-duotone";

  let { slide }: { slide: Slide } = $props();

  const name = $derived(config.data.brief.greetingName.trim());
  const hello = $derived(greeting());
  const date = $derived(longDateLabel());
</script>

<section class="greeting">
  <div class="halo" in:scale={{ duration: 720, start: 0.6, easing: cubicOut }}></div>

  <div class="icon" in:fly={{ y: 28, duration: 560, delay: 80, easing: cubicOut }}>
    <Sunrise style="font-size:96px" />
  </div>

  <h1 in:fly={{ y: 26, duration: 520, delay: 180, easing: cubicOut }}>
    {hello}{#if name}<span class="name"> {name}</span>{/if}
  </h1>

  <p class="date" in:fly={{ y: 22, duration: 520, delay: 300, easing: cubicOut }}>
    {date}
  </p>

  <p class="lede" in:fade={{ duration: 600, delay: 460 }}>
    Voici votre brief du matin.
  </p>
</section>

<style>
  .greeting {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 18px;
    max-width: 720px;
    padding: 0 24px;
  }

  .halo {
    position: absolute;
    top: -120px;
    width: 360px;
    height: 360px;
    border-radius: var(--r-pill);
    background: radial-gradient(
      circle,
      rgba(255, 224, 122, 0.55) 0%,
      rgba(255, 182, 56, 0.28) 40%,
      rgba(255, 141, 107, 0) 72%
    );
    filter: blur(8px);
    animation: float-soft 7s var(--ease-soft) infinite;
    pointer-events: none;
  }

  .icon {
    color: var(--dawn-gold);
    filter: drop-shadow(0 8px 28px rgba(255, 182, 56, 0.45));
    animation: float-soft 6s var(--ease-soft) infinite;
  }

  h1 {
    font-weight: 700;
    font-size: clamp(44px, 7vw, 76px);
    line-height: 1.02;
    letter-spacing: -0.02em;
    color: #fff;
    text-shadow: 0 4px 30px rgba(20, 16, 40, 0.3);
  }

  .name {
    background: linear-gradient(120deg, #fff 0%, var(--dawn-gold) 70%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .date {
    font-size: clamp(18px, 2.4vw, 24px);
    font-weight: 500;
    color: rgba(255, 255, 255, 0.92);
  }

  .lede {
    font-size: clamp(15px, 1.8vw, 18px);
    color: rgba(255, 255, 255, 0.72);
  }
</style>
