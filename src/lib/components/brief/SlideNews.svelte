<script lang="ts">
  import { fly, fade } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { relativeTime } from "$lib/time";
  import type { Slide } from "$lib/types";
  import Feed from "~icons/solar/feed-bold-duotone";

  let { slide }: { slide: Slide } = $props();

  const items = $derived(slide.items ?? []);
</script>

<section class="news">
  <header in:fly={{ y: 20, duration: 480, delay: 40, easing: cubicOut }}>
    <span class="head-icon"><Feed style="font-size:30px" /></span>
    <h2>Les actus</h2>
  </header>

  <div class="list scroll">
    {#each items as item, i (item.id)}
      <article
        class="card"
        in:fly={{ y: 26, duration: 480, delay: 140 + i * 90, easing: cubicOut }}
      >
        <div class="body">
          <div class="meta">
            <span class="chip">{item.sourceName}</span>
            {#if item.published}
              <span class="time">{relativeTime(item.published)}</span>
            {/if}
          </div>
          <h3 class="title">{item.title}</h3>
          {#if item.summary}
            <p class="summary">{item.summary}</p>
          {/if}
        </div>
        {#if item.image}
          <div class="thumb">
            <img src={item.image} alt="" loading="lazy" />
          </div>
        {/if}
      </article>
    {/each}
  </div>
</section>

<style>
  .news {
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
    color: var(--ink);
  }

  .head-icon {
    color: var(--accent);
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
    gap: 14px;
    overflow-y: auto;
    padding: 2px;
  }

  .card {
    display: flex;
    gap: 16px;
    padding: 18px 20px;
    border-radius: var(--r-lg);
    background: #fff;
    border: 1px solid var(--hair);
    color: var(--ink);
  }

  .body {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
    flex: 1;
  }

  .meta {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .chip {
    padding: 4px 12px;
    border-radius: var(--r-pill);
    background: var(--accent-soft);
    color: var(--accent-ink);
    font-size: 12px;
    font-weight: 500;
  }

  .time {
    font-size: 12px;
    color: var(--ink-soft);
  }

  .title {
    font-size: 19px;
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
    color: var(--ink-soft);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .thumb {
    flex: 0 0 auto;
    width: 96px;
    height: 96px;
    border-radius: var(--r-md);
    overflow: hidden;
  }

  .thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
</style>
