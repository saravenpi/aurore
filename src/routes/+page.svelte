<script lang="ts">
  import { onMount } from "svelte";
  import { fly, fade } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { config } from "$lib/config.svelte";
  import { feed } from "$lib/feed.svelte";
  import { brief } from "$lib/brief.svelte";
  import { greeting, longDateLabel } from "$lib/time";
  import TitleBar from "$lib/components/TitleBar.svelte";
  import WeatherWidget from "$lib/components/WeatherWidget.svelte";
  import PlayBriefButton from "$lib/components/PlayBriefButton.svelte";
  import FeedCard from "$lib/components/FeedCard.svelte";
  import EmptyState from "$lib/components/EmptyState.svelte";
  import Settings from "$lib/components/Settings.svelte";
  import Diaporama from "$lib/components/brief/Diaporama.svelte";

  let settingsOpen = $state(false);
  let now = $state(new Date());

  onMount(() => {
    (async () => {
      await config.load();
      await feed.refresh();
    })();
    const t = setInterval(() => (now = new Date()), 30_000);
    return () => clearInterval(t);
  });

  const hasItems = $derived(feed.items.length > 0);
  const showEmpty = $derived(!hasItems && (feed.loading || feed.lastUpdated !== null));
</script>

<svelte:head>
  <title>Aurore</title>
</svelte:head>

<TitleBar onsettings={() => (settingsOpen = true)} />

<main class="scroll">
  <div class="glow" aria-hidden="true"></div>

  <div class="page">
    <header class="hero" in:fly={{ y: 16, duration: 520, easing: cubicOut }}>
      <p class="greet">{greeting(now)}{config.data.brief.greetingName ? ` ${config.data.brief.greetingName}` : ""}.</p>
      <p class="date">{longDateLabel(now)}</p>
    </header>

    <div class="cta" in:fly={{ y: 18, duration: 560, delay: 60, easing: cubicOut }}>
      <PlayBriefButton onplay={() => brief.start()} />
    </div>

    <div class="weather" in:fly={{ y: 18, duration: 560, delay: 120, easing: cubicOut }}>
      <WeatherWidget />
    </div>

    <section class="feed">
      <h2 class="section-title">Votre fil</h2>

      {#if showEmpty}
        <EmptyState loading={feed.loading} />
      {:else if hasItems}
        <div class="grid">
          {#each feed.items as item, i (item.id)}
            <div in:fade={{ duration: 320, delay: Math.min(i * 24, 360) }}>
              <FeedCard {item} />
            </div>
          {/each}
        </div>
      {:else}
        <EmptyState loading={true} />
      {/if}
    </section>
  </div>
</main>

{#if brief.open}
  <Diaporama />
{/if}

<Settings bind:open={settingsOpen} />

<style>
  main {
    position: relative;
    width: 100%;
    height: 100vh;
    background: var(--paper);
  }

  .glow {
    position: fixed;
    top: -260px;
    left: 50%;
    transform: translateX(-50%);
    width: 920px;
    height: 620px;
    pointer-events: none;
    background: radial-gradient(
      55% 60% at 50% 30%,
      rgba(255, 182, 56, 0.22) 0%,
      rgba(255, 141, 107, 0.12) 38%,
      rgba(247, 246, 242, 0) 72%
    );
    z-index: 0;
  }

  .page {
    position: relative;
    z-index: 1;
    max-width: 900px;
    margin: 0 auto;
    padding: 8px 28px 72px;
  }

  .hero {
    padding: 18px 4px 26px;
  }
  .greet {
    font-size: 2.4rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--ink);
    line-height: 1.05;
  }
  .date {
    margin-top: 6px;
    font-size: 1.05rem;
    color: var(--ink-soft);
    font-weight: 500;
  }

  .cta {
    margin-bottom: 18px;
  }
  .weather {
    margin-bottom: 30px;
  }

  .section-title {
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--ink);
    margin: 4px 4px 16px;
    letter-spacing: -0.01em;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  @media (max-width: 720px) {
    .grid {
      grid-template-columns: 1fr;
    }
    .greet {
      font-size: 2rem;
    }
  }
</style>
