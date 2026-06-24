<script lang="ts">
  import { fly, fade, scale } from "svelte/transition";
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
  <div class="halo" in:scale={{ duration: 720, start: 0.6, easing: cubicOut }}></div>

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

  .halo {
    position: absolute;
    top: -110px;
    width: 340px;
    height: 340px;
    border-radius: var(--r-pill);
    background: radial-gradient(
      circle,
      rgba(255, 224, 122, 0.5) 0%,
      rgba(255, 141, 107, 0.24) 42%,
      rgba(255, 122, 156, 0) 72%
    );
    filter: blur(8px);
    animation: float-soft 7s var(--ease-soft) infinite;
    pointer-events: none;
  }

  .icon {
    color: var(--dawn-gold);
    filter: drop-shadow(0 8px 28px rgba(255, 182, 56, 0.45));
    animation: float-soft 6s var(--ease-soft) infinite;
  }

  h1 {
    font-weight: 700;
    font-size: clamp(44px, 7vw, 72px);
    line-height: 1.02;
    letter-spacing: -0.02em;
    color: #fff;
    text-shadow: 0 4px 30px rgba(20, 16, 40, 0.3);
  }

  .recap {
    font-size: clamp(15px, 2vw, 19px);
    font-weight: 500;
    color: rgba(255, 255, 255, 0.78);
  }
</style>
