<script lang="ts">
  import { feed } from "$lib/feed.svelte";
  import Logo from "./Logo.svelte";
  import Refresh from "~icons/solar/refresh-bold-duotone";
  import Settings from "~icons/solar/settings-minimalistic-bold-duotone";

  let { onsettings }: { onsettings: () => void } = $props();

  function refresh() {
    if (!feed.loading) feed.refresh();
  }
</script>

<header class="titlebar" data-tauri-drag-region>
  <div class="left" data-tauri-drag-region>
    <span class="traffic" data-tauri-drag-region></span>
    <Logo size={20} />
  </div>

  <div class="right">
    <button
      class="iconbtn liquid-glass"
      data-tauri-drag-region="false"
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
      data-tauri-drag-region="false"
      onclick={onsettings}
      aria-label="Réglages"
      title="Réglages"
    >
      <Settings style="font-size:20px" />
    </button>
  </div>
</header>

<style>
  .titlebar {
    position: sticky;
    top: 0;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 52px;
    padding: 0 14px;
    background: rgba(247, 246, 242, 0.55);
    -webkit-backdrop-filter: blur(14px) saturate(160%);
    backdrop-filter: blur(14px) saturate(160%);
    border-bottom: 1px solid var(--hair);
  }

  .left {
    display: flex;
    align-items: center;
  }

  .traffic {
    width: 72px;
    height: 1px;
    flex-shrink: 0;
  }

  .right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .iconbtn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border-radius: var(--r-pill);
    color: var(--ink);
    transition:
      transform 0.3s var(--ease-soft),
      box-shadow 0.3s var(--ease-soft);
  }

  .iconbtn:hover {
    transform: translateY(-2px);
    box-shadow:
      0 10px 24px rgba(40, 38, 32, 0.18),
      inset 0 1px 0.5px rgba(255, 255, 255, 0.95);
  }

  .iconbtn:active {
    transform: translateY(0) scale(0.96);
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
