<script lang="ts">
  import Sunrise from "~icons/solar/sunrise-bold-duotone";

  let { size = 22, compact = false }: { size?: number; compact?: boolean } =
    $props();

  const badge = $derived(Math.round(size * 1.5));
  const icon = $derived(Math.round(size * 1.05));
  const word = $derived(size);
</script>

<div class="logo" style="gap:{Math.round(size * 0.5)}px">
  <span
    class="badge"
    style="width:{badge}px;height:{badge}px;border-radius:30%"
  >
    <Sunrise style="font-size:{icon}px;color:#fff" />
  </span>
  {#if !compact}
    <span class="word" style="font-size:{word}px">Aurore</span>
  {/if}
</div>

<style>
  .logo {
    display: inline-flex;
    align-items: center;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: linear-gradient(135deg, var(--dawn-gold), var(--dawn-amber));
    box-shadow:
      0 4px 12px rgba(255, 158, 69, 0.35),
      inset 0 1px 1px rgba(255, 255, 255, 0.6);
  }

  .word {
    font-family: "Goga", sans-serif;
    font-weight: 700;
    letter-spacing: -0.01em;
    color: var(--ink);
    line-height: 1;
  }
</style>
