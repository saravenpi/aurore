<script lang="ts">
  import { reader } from "$lib/reader.svelte";
  import { relativeTime } from "$lib/time";
  import { openUrl } from "@tauri-apps/plugin-opener";
  import { fade, scale } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import X from "~icons/lucide/x";
  import ExternalLink from "~icons/lucide/external-link";
  import LoaderCircle from "~icons/lucide/loader-circle";
  import BookOpen from "~icons/lucide/book-open";

  const sourceLabel = $derived(
    reader.article?.siteName ?? reader.item?.sourceName ?? "",
  );

  function openOriginal() {
    if (reader.item?.link) openUrl(reader.item.link);
  }

  function onProseClick(e: MouseEvent) {
    const a = (e.target as HTMLElement).closest("a");
    if (a && a.getAttribute("href")) {
      e.preventDefault();
      openUrl(a.href);
    }
  }
</script>

<svelte:window
  onkeydown={(e) => {
    if (e.key === "Escape") reader.close();
  }}
/>

<div class="root">
  <button
    class="backdrop"
    aria-label="Fermer"
    onclick={() => reader.close()}
    transition:fade={{ duration: 200 }}
  ></button>

  <div
    class="panel"
    transition:scale={{ start: 0.96, duration: 320, easing: cubicOut }}
  >
    <div class="bar">
      <span class="bar-source">{sourceLabel}</span>
      <div class="bar-actions">
        {#if reader.item?.link}
          <button
            class="icon liquid-glass"
            aria-label="Ouvrir l'original"
            title="Ouvrir l'original"
            onclick={openOriginal}
          >
            <ExternalLink style="font-size:18px" />
          </button>
        {/if}
        <button
          class="icon liquid-glass"
          aria-label="Fermer"
          title="Fermer"
          onclick={() => reader.close()}
        >
          <X style="font-size:20px" />
        </button>
      </div>
    </div>

    <div class="body scroll">
      {#if reader.loading}
        <div class="state">
          <span class="spin"><LoaderCircle style="font-size:34px" /></span>
          <p class="state-text">Chargement de l'article…</p>
        </div>
      {:else if reader.error}
        <div class="state">
          <BookOpen style="font-size:38px" />
          {#if reader.item?.title}
            <h2 class="state-title">{reader.item.title}</h2>
          {/if}
          <p class="state-text">{reader.error}</p>
          {#if reader.item?.link}
            <button class="pill" onclick={openOriginal}>
              Ouvrir dans le navigateur
            </button>
          {/if}
        </div>
      {:else if reader.article}
        <article class="article">
          <h1 class="title">{reader.article.title}</h1>
          <p class="meta">
            {#if reader.article.byline}<span>{reader.article.byline}</span>{/if}
            {#if reader.item?.published}<span
                >{relativeTime(reader.item.published)}</span
              >{/if}
            {#if reader.article.siteName}<span>{reader.article.siteName}</span
              >{/if}
          </p>
          <div class="prose" role="document" onclick={onProseClick}>
            {@html reader.article.content}
          </div>
        </article>
      {/if}
    </div>
  </div>
</div>

<style>
  .root {
    position: fixed;
    inset: 0;
    z-index: 120;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .backdrop {
    position: absolute;
    inset: 0;
    border: none;
    cursor: default;
    background: rgba(247, 246, 242, 0.6);
    -webkit-backdrop-filter: blur(20px) saturate(120%);
    backdrop-filter: blur(20px) saturate(120%);
  }

  .panel {
    position: relative;
    z-index: 1;
    width: 92%;
    max-width: 760px;
    max-height: 88vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--paper);
    border: 1px solid var(--hair);
    border-radius: var(--r-xl);
  }

  .bar {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 18px;
    border-bottom: 1px solid var(--hair);
  }

  .bar-source {
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--ink-soft);
    letter-spacing: -0.01em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .bar-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border-radius: var(--r-pill);
    color: var(--ink);
    transition:
      transform 0.22s var(--ease-soft),
      color 0.22s var(--ease-soft);
  }

  .icon:hover {
    transform: scale(1.06);
    color: var(--accent-ink);
  }

  .body {
    flex: 1;
    min-height: 0;
    padding: 32px 40px 48px;
  }

  .state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    min-height: 320px;
    text-align: center;
    color: var(--ink-soft);
  }

  .state-title {
    font-weight: 700;
    font-size: 1.25rem;
    color: var(--ink);
    letter-spacing: -0.02em;
    max-width: 40ch;
  }

  .state-text {
    font-size: 1rem;
    color: var(--ink-soft);
    max-width: 36ch;
  }

  .spin {
    display: inline-flex;
    color: var(--accent);
    animation: reader-spin 0.9s linear infinite;
  }

  @keyframes reader-spin {
    to {
      transform: rotate(360deg);
    }
  }

  .pill {
    margin-top: 6px;
    padding: 12px 22px;
    border-radius: var(--r-pill);
    background: var(--accent);
    color: #fff;
    font-weight: 500;
    font-size: 0.95rem;
    transition: transform 0.22s var(--ease-soft);
  }

  .pill:hover {
    transform: scale(1.06);
  }

  .title {
    font-weight: 700;
    font-size: 2rem;
    line-height: 1.15;
    letter-spacing: -0.02em;
    color: var(--ink);
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5em;
    margin-top: 12px;
    font-size: 0.88rem;
    color: var(--ink-soft);
  }

  .meta span:not(:first-child)::before {
    content: "·";
    margin-right: 0.5em;
    color: var(--ink-faint);
  }

  .prose {
    margin-top: 28px;
    font-size: 1.05rem;
    line-height: 1.75;
    color: var(--ink);
    max-width: 68ch;
  }

  .prose :global(p) {
    margin-bottom: 1em;
  }

  .prose :global(h1),
  .prose :global(h2),
  .prose :global(h3) {
    font-weight: 700;
    color: var(--ink);
    letter-spacing: -0.02em;
    margin: 1.4em 0 0.5em;
    line-height: 1.25;
  }

  .prose :global(h1) {
    font-size: 1.6rem;
  }
  .prose :global(h2) {
    font-size: 1.35rem;
  }
  .prose :global(h3) {
    font-size: 1.15rem;
  }

  .prose :global(a) {
    color: var(--accent-ink);
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .prose :global(img) {
    max-width: 100%;
    height: auto;
    border-radius: var(--r-md);
    margin: 1em 0;
  }

  .prose :global(blockquote) {
    border-left: 3px solid var(--hair);
    padding-left: 1em;
    margin: 1em 0;
    color: var(--ink-soft);
    font-style: italic;
  }

  .prose :global(ul),
  .prose :global(ol) {
    padding-left: 1.4em;
    margin-bottom: 1em;
  }

  .prose :global(li) {
    margin-bottom: 0.35em;
  }

  .prose :global(pre) {
    background: var(--accent-soft);
    border-radius: var(--r-md);
    padding: 14px 16px;
    margin: 1em 0;
    overflow-x: auto;
    font-size: 0.9rem;
  }

  .prose :global(code) {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.9em;
  }

  .prose :global(figure) {
    margin: 1em 0;
  }

  .prose :global(figcaption) {
    font-size: 0.82rem;
    color: var(--ink-faint);
    margin-top: 0.5em;
  }

  .prose :global(hr) {
    border: none;
    border-top: 1px solid var(--hair);
    margin: 1.6em 0;
  }
</style>
