<script lang="ts">
  import { fade } from "svelte/transition";
  import Sunrise from "~icons/solar/sunrise-bold-duotone";

  let { loading = false }: { loading?: boolean } = $props();
</script>

<div class="empty" in:fade={{ duration: 400 }}>
  <span class="icon" class:pulse={loading}>
    <Sunrise style="font-size:64px" />
  </span>
  {#if loading}
    <p class="msg shimmer-text">Préparation de votre brief…</p>
  {:else}
    <p class="msg">Rien à afficher pour le moment.</p>
    <p class="hint">Ajoutez des sources dans les réglages.</p>
  {/if}
</div>

<style>
  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 64px 24px;
    text-align: center;
  }

  .icon {
    color: var(--dawn-amber);
  }

  .icon.pulse {
    animation: float-soft 5s var(--ease-soft) infinite;
  }

  .msg {
    font-family: "Goga", sans-serif;
    font-weight: 500;
    font-size: 1.02rem;
    color: var(--ink-soft);
  }

  .hint {
    font-size: 0.86rem;
    color: var(--ink-faint);
  }

  .shimmer-text {
    color: var(--ink-soft);
    animation: float-soft 3.2s var(--ease-soft) infinite;
  }
</style>
