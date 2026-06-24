<script lang="ts">
  import { feed } from "$lib/feed.svelte";
  import Refresh from "~icons/solar/refresh-bold-duotone";
  import Settings from "~icons/solar/settings-minimalistic-bold-duotone";

  let { onsettings }: { onsettings: () => void } = $props();

  function refresh() {
    if (!feed.loading) feed.refresh();
  }
</script>

<div class="dragstrip" data-tauri-drag-region></div>

<div class="floating">
  <button
    class="iconbtn liquid-glass"
    onclick={refresh}
    aria-label="Actualiser"
    title="Actualiser"
  >
    <span class="spin" class:spinning={feed.loading}>
      <Refresh style="font-size:20px" />
    </span>
  </button>
  <button
    class="iconbtn liquid-glass"
    onclick={onsettings}
    aria-label="Réglages"
    title="Réglages"
  >
    <Settings style="font-size:20px" />
  </button>
</div>

<style>
  .dragstrip {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 52px;
    z-index: 15;
  }

  .floating {
    position: fixed;
    top: 12px;
    right: 16px;
    z-index: 30;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .iconbtn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: var(--r-pill);
    color: var(--ink);
    transition:
      transform 0.3s var(--ease-soft),
      background 0.3s var(--ease-soft);
  }

  .iconbtn:hover {
    transform: scale(1.08);
    background: var(--accent-soft);
  }

  .iconbtn:active {
    transform: scale(0.97);
  }

  .spin {
    display: inline-flex;
  }

  .spinning {
    animation: titlebar-spin 0.9s linear infinite;
  }

  @keyframes titlebar-spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
