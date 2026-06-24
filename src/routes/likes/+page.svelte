<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { library } from "$lib/library.svelte";
  import FeedCard from "$lib/components/FeedCard.svelte";
  import type { FeedItem } from "$lib/types";
  import ArrowLeft from "~icons/lucide/arrow-left";
  import Heart from "~icons/solar/heart-bold-duotone";

  const likes = $derived<FeedItem[]>(library.likes);
  const count = $derived(likes.length);
  const isEmpty = $derived(count === 0);

  onMount(async () => {
    if (!library.loaded) await library.load();
  });
</script>

<svelte:head>
  <title>Aimés — Aurore</title>
</svelte:head>

<main class="scroll">
  <div class="page">
    <header class="head">
      <button class="liquid-glass back" onclick={() => goto("/")} aria-label="Retour au fil">
        <ArrowLeft />
      </button>
      <h1 class="title">
        Aimés
        {#if !isEmpty}<span class="count">{count}</span>{/if}
      </h1>
    </header>

    {#if isEmpty}
      <div class="empty">
        <div class="empty-icon"><Heart /></div>
        <p class="empty-msg">Aucun article aimé pour le moment.</p>
        <p class="empty-hint">Aimez des articles depuis votre fil.</p>
      </div>
    {:else}
      <div class="list">
        {#each likes as item (item.id)}
          <FeedCard {item} />
        {/each}
      </div>
    {/if}
  </div>
</main>

<style>
  main {
    position: relative;
    width: 100%;
    height: 100vh;
    background: var(--paper);
  }

  .page {
    max-width: 900px;
    margin: 0 auto;
    padding: 60px 28px 72px;
  }

  .head {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 14px 4px 26px;
  }

  .back {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: var(--r-pill);
    color: var(--ink);
    cursor: pointer;
    font-size: 1.15rem;
    flex-shrink: 0;
    transition: transform 0.3s var(--ease-soft);
  }
  .back:hover {
    transform: scale(1.06);
  }

  .title {
    display: flex;
    align-items: baseline;
    gap: 10px;
    font-weight: 700;
    font-size: 2.1rem;
    letter-spacing: -0.02em;
    color: var(--ink);
    line-height: 1;
  }
  .count {
    font-size: 1.05rem;
    font-weight: 500;
    color: var(--ink-soft);
    letter-spacing: 0;
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 8px;
    padding: 18vh 24px 0;
  }
  .empty-icon {
    font-size: 3rem;
    color: var(--accent);
    margin-bottom: 8px;
  }
  .empty-msg {
    font-size: 1.05rem;
    font-weight: 500;
    color: var(--ink-soft);
  }
  .empty-hint {
    font-size: 0.92rem;
    color: var(--ink-faint);
  }

  @media (max-width: 720px) {
    .title {
      font-size: 1.8rem;
    }
  }
</style>
