<script lang="ts">
  import { fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { relativeTime } from "$lib/time";
  import type { Slide, FeedItem } from "$lib/types";
  import Letter from "~icons/solar/letter-bold-duotone";

  let { slide }: { slide: Slide } = $props();

  const items = $derived(slide.items ?? []);
  const unread = $derived(items.filter((i) => i.unread).length);

  function initial(item: FeedItem): string {
    const s = (item.author || item.sourceName || "?").trim();
    return s.charAt(0).toUpperCase() || "?";
  }

  function sender(item: FeedItem): string {
    return item.author || item.sourceName || "Expéditeur";
  }
</script>

<section class="emails">
  <header in:fly={{ y: 20, duration: 480, delay: 40, easing: cubicOut }}>
    <span class="head-icon"><Letter style="font-size:30px" /></span>
    <h2>Votre courrier</h2>
    {#if unread > 0}
      <span class="count">{unread} non lu{unread > 1 ? "s" : ""}</span>
    {/if}
  </header>

  <div class="list scroll">
    {#each items as item, i (item.id)}
      <article
        class="row liquid-glass-dark"
        in:fly={{ y: 24, duration: 460, delay: 140 + i * 80, easing: cubicOut }}
      >
        <div class="avatar" class:unread={item.unread}>{initial(item)}</div>
        <div class="body">
          <div class="top">
            <span class="sender">{sender(item)}</span>
            {#if item.published}
              <span class="time">{relativeTime(item.published)}</span>
            {/if}
          </div>
          <p class="subject">{item.title}</p>
        </div>
      </article>
    {/each}
  </div>
</section>

<style>
  .emails {
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

  .count {
    margin-left: auto;
    padding: 6px 14px;
    border-radius: var(--r-pill);
    background: rgba(255, 158, 69, 0.32);
    font-size: 13px;
    font-weight: 500;
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
    align-items: center;
    gap: 16px;
    padding: 14px 18px;
    border-radius: var(--r-lg);
    color: #fff;
  }

  .avatar {
    flex: 0 0 auto;
    width: 46px;
    height: 46px;
    border-radius: var(--r-pill);
    display: grid;
    place-items: center;
    font-size: 18px;
    font-weight: 700;
    background: rgba(255, 255, 255, 0.18);
  }

  .avatar.unread {
    background: linear-gradient(135deg, var(--dawn-amber), var(--dawn-coral));
    color: #43413b;
  }

  .body {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
    flex: 1;
  }

  .top {
    display: flex;
    align-items: baseline;
    gap: 10px;
  }

  .sender {
    font-size: 16px;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .time {
    margin-left: auto;
    flex: 0 0 auto;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.62);
  }

  .subject {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.82);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
