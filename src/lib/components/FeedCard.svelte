<script lang="ts">
  import type { FeedItem } from "$lib/types";
  import { relativeTime } from "$lib/time";
  import { reader } from "$lib/reader.svelte";
  import { library } from "$lib/library.svelte";
  import SourceChip from "./SourceChip.svelte";
  import HeartFilled from "~icons/solar/heart-bold";
  import HeartOutline from "~icons/solar/heart-linear";

  let { item }: { item: FeedItem } = $props();

  let imageBroken = $state(false);

  const showImage = $derived(!!item.image && !imageBroken);
  const clickable = $derived(!!item.link);
  const seen = $derived(library.isSeen(item.id));
  const liked = $derived(library.isLiked(item.id));

  function open() {
    if (item.link) {
      library.markSeen(item.id);
      reader.show(item);
    }
  }

  function onKey(e: KeyboardEvent) {
    if (item.link && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      open();
    }
  }

  function like(e: MouseEvent) {
    e.stopPropagation();
    library.toggleLike(item);
  }
</script>

<div
  class="card liquid-glass"
  class:clickable
  class:seen
  role="link"
  tabindex={clickable ? 0 : -1}
  onclick={clickable ? open : undefined}
  onkeydown={clickable ? onKey : undefined}
>
  <div class="body">
    <div class="top">
      <SourceChip kind={item.source} name={item.sourceName} />
      <div class="meta">
        {#if item.published}
          <time class="time">{relativeTime(item.published)}</time>
        {/if}
      </div>
    </div>

    <h3 class="title">{item.title}</h3>

    {#if item.summary}
      <p class="summary">{item.summary}</p>
    {/if}

    <div class="footer">
      <button
        class="like"
        class:on={liked}
        onclick={like}
        aria-label={liked ? "Retirer des aimés" : "Aimer"}
        title={liked ? "Retirer des aimés" : "Aimer"}
      >
        {#if liked}
          <HeartFilled style="font-size:18px" />
        {:else}
          <HeartOutline style="font-size:18px" />
        {/if}
      </button>
    </div>
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
</div>

<style>
  .card {
    position: relative;
    display: flex;
    gap: 16px;
    align-items: flex-start;
    padding: 18px;
    width: 100%;
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

  .card.seen .title,
  .card.seen .summary,
  .card.seen .thumb {
    opacity: 0.5;
  }

  .body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .footer {
    margin-top: 4px;
    margin-left: -6px;
    display: flex;
    align-items: center;
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

  .time {
    font-size: 0.74rem;
    color: var(--ink-faint);
    white-space: nowrap;
  }

  .like {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: var(--r-pill);
    color: var(--ink-soft);
    transition:
      transform 0.25s var(--ease-soft),
      background 0.25s var(--ease-soft),
      color 0.25s var(--ease-soft);
  }

  .like:hover {
    transform: scale(1.12);
    background: var(--accent-soft);
  }

  .like.on {
    color: var(--accent);
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
</style>
