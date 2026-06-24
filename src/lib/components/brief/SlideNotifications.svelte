<script lang="ts">
  import { fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { relativeTime } from "$lib/time";
  import type { Slide } from "$lib/types";
  import Bell from "~icons/solar/bell-bold-duotone";

  let { slide }: { slide: Slide } = $props();

  const items = $derived(slide.items ?? []);
</script>

<section class="notifs">
  <header in:fly={{ y: 20, duration: 480, delay: 40, easing: cubicOut }}>
    <span class="head-icon"><Bell style="font-size:30px" /></span>
    <h2>Notifications</h2>
  </header>

  <div class="list scroll">
    {#each items as item, i (item.id)}
      <article
        class="row liquid-glass-dark"
        in:fly={{ y: 24, duration: 460, delay: 140 + i * 80, easing: cubicOut }}
      >
        <div class="top">
          <span class="chip">{item.sourceName}</span>
          {#if item.published}
            <span class="time">{relativeTime(item.published)}</span>
          {/if}
        </div>
        <h3 class="title">{item.title}</h3>
        {#if item.summary}
          <p class="summary">{item.summary}</p>
        {/if}
      </article>
    {/each}
  </div>
</section>

<style>
  .notifs {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 100%;
    max-width: 720px;
    max-height: 70vh;
    padding: 0 24px;
  }

  header {
    display: flex;
    align-items: center;
    gap: 12px;
    color: #fff;
  }

  .head-icon {
    color: var(--dawn-gold);
    display: inline-flex;
  }

  h2 {
    font-size: clamp(28px, 4vw, 40px);
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow-y: auto;
    padding: 2px;
  }

  .row {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 16px 20px;
    border-radius: var(--r-lg);
    color: #fff;
  }

  .top {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .chip {
    padding: 4px 12px;
    border-radius: var(--r-pill);
    background: rgba(177, 150, 232, 0.34);
    font-size: 12px;
    font-weight: 500;
  }

  .time {
    margin-left: auto;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.62);
  }

  .title {
    font-size: 18px;
    font-weight: 700;
    line-height: 1.25;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .summary {
    font-size: 14px;
    line-height: 1.45;
    color: rgba(255, 255, 255, 0.78);
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
