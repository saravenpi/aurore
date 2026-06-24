<script lang="ts">
  import { fly, fade } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { config } from "$lib/config.svelte";
  import { greeting, longDateLabel, briefMoment } from "$lib/time";
  import type { Slide } from "$lib/types";
  import Sunrise from "~icons/solar/sunrise-bold-duotone";

  let { slide }: { slide: Slide } = $props();

  const name = $derived(config.data.brief.greetingName.trim());
  const hello = $derived(greeting());
  const date = $derived(longDateLabel());
  const moment = $derived(briefMoment());
</script>

<section class="greeting">
  <div class="icon" in:fly={{ y: 28, duration: 560, delay: 80, easing: cubicOut }}>
    <Sunrise style="font-size:96px" />
  </div>

  <h1 in:fly={{ y: 26, duration: 520, delay: 180, easing: cubicOut }}>
    {hello}{#if name}{" "}<span class="name">{name}</span>{/if}
  </h1>

  <p class="date" in:fly={{ y: 22, duration: 520, delay: 300, easing: cubicOut }}>
    {date}
  </p>

  <p class="lede" in:fade={{ duration: 600, delay: 460 }}>
    Voici votre brief {moment}.
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

  .icon {
    color: var(--accent);
    animation: float-soft 6s var(--ease-soft) infinite;
  }

  h1 {
    font-weight: 700;
    font-size: clamp(44px, 7vw, 76px);
    line-height: 1.02;
    letter-spacing: -0.02em;
    color: var(--ink);
  }

  .name {
    color: var(--accent);
  }

  .date {
    font-size: clamp(18px, 2.4vw, 24px);
    font-weight: 500;
    color: var(--ink);
  }

  .lede {
    font-size: clamp(15px, 1.8vw, 18px);
    color: var(--ink-soft);
  }
</style>
