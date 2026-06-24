<script lang="ts">
  import type { FeedItem } from "$lib/types";
  import { relativeTime } from "$lib/time";
  import { reader } from "$lib/reader.svelte";
  import SourceChip from "./SourceChip.svelte";
  import ArrowUp from "~icons/solar/arrow-right-up-bold";

  let { item }: { item: FeedItem } = $props();

  let imageBroken = $state(false);

  const showImage = $derived(!!item.image && !imageBroken);
  const clickable = $derived(!!item.link);

  function open() {
    if (item.link) reader.show(item);
  }

  function onKey(e: KeyboardEvent) {
    if (item.link && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      open();
    }
  }
</script>

<div
  class="card liquid-glass"
  class:clickable
  class:unread={item.unread}
  role="link"
  tabindex={clickable ? 0 : -1}
  onclick={clickable ? open : undefined}
  onkeydown={clickable ? onKey : undefined}
>
  <div class="body">
    <div class="top">
      <SourceChip kind={item.source} name={item.sourceName} />
      <div class="meta">
        {#if item.unread}<span class="dot" aria-label="Non lu"></span>{/if}
        {#if item.published}
          <time class="time">{relativeTime(item.published)}</time>
        {/if}
      </div>
    </div>

    <h3 class="title">{item.title}</h3>

    {#if item.summary}
      <p class="summary">{item.summary}</p>
    {/if}
  </div>

  {#if showImage}
    <div class="thumb">
      <img
        src={item.image}
        alt=""
        loading="lazy"
        onerror={() => (imageBroken = true)}
      />
    </div>
  {/if}

  {#if clickable && !showImage}
    <span class="ext" aria-hidden="true">
      <ArrowUp style="font-size:16px" />
    </span>
  {/if}
</div>

<style>
  .card {
    position: relative;
    display: flex;
    gap: 16px;
    align-items: flex-start;
    padding: 18px;
    height: 100%;
    border-radius: var(--r-lg);
    transition:
      transform 0.4s var(--ease-soft),
      border-color 0.4s var(--ease-soft);
  }

  .card.clickable {
    cursor: pointer;
  }

  .card.clickable:hover {
    transform: scale(1.02);
    border-color: var(--accent);
  }

  .card.clickable:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .meta {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: var(--r-pill);
    background: var(--accent);
  }

  .time {
    font-size: 0.74rem;
    color: var(--ink-faint);
    white-space: nowrap;
  }

  .title {
    font-family: "Goga", sans-serif;
    font-weight: 700;
    font-size: 1.05rem;
    line-height: 1.3;
    color: var(--ink);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .summary {
    font-size: 0.86rem;
    line-height: 1.5;
    color: var(--ink-soft);
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .thumb {
    flex-shrink: 0;
    width: 84px;
    height: 84px;
    border-radius: var(--r-md);
    overflow: hidden;
    background: var(--accent-soft);
  }

  .thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .ext {
    position: absolute;
    top: 14px;
    right: 14px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: var(--r-pill);
    background: var(--accent-soft);
    color: var(--accent-ink);
    opacity: 0;
    transform: translateY(4px);
    transition:
      opacity 0.3s var(--ease-soft),
      transform 0.3s var(--ease-soft);
    pointer-events: none;
  }

  .card.clickable:hover .ext {
    opacity: 1;
    transform: translateY(0);
  }
</style>
