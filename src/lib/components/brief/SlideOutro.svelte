<script lang="ts">
  import { fly, fade } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { feed } from "$lib/feed.svelte";
  import type { Slide } from "$lib/types";
  import CheckCircle from "~icons/solar/check-circle-bold-duotone";

  let { slide }: { slide: Slide } = $props();

  const newsCount = $derived(feed.news.length);
  const emailCount = $derived(feed.emails.length);
  const unread = $derived(feed.unreadCount);
</script>

<section class="outro">
  <div class="icon" in:fly={{ y: 26, duration: 540, delay: 80, easing: cubicOut }}>
    <CheckCircle style="font-size:88px" />
  </div>

  <h1 in:fly={{ y: 24, duration: 520, delay: 180, easing: cubicOut }}>
    Bonne journée.
  </h1>

  <p class="recap" in:fade={{ duration: 600, delay: 360 }}>
    {newsCount} actus · {emailCount} mails · {unread} non lus
  </p>
</section>

<style>
  .outro {
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
    font-size: clamp(44px, 7vw, 72px);
    line-height: 1.02;
    letter-spacing: -0.02em;
    color: var(--ink);
  }

  .recap {
    font-size: clamp(15px, 2vw, 19px);
    font-weight: 500;
    color: var(--ink-soft);
  }
</style>
