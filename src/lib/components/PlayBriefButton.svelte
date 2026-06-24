<script lang="ts">
  import Play from "~icons/solar/play-circle-bold-duotone";

  let { onplay }: { onplay: () => void } = $props();
</script>

<button class="cta liquid-glass" onclick={onplay}>
  <Play style="font-size:22px" />
  <span class="label">Lancer le brief</span>
</button>

<style>
  .cta {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    height: 44px;
    padding: 0 20px 0 16px;
    border-radius: var(--r-pill);
    color: var(--ink);
    font-family: "Goga", sans-serif;
    font-weight: 700;
    font-size: 0.95rem;
    white-space: nowrap;
    transition: transform 0.3s var(--ease-soft);
  }

  .cta :global(svg) {
    color: var(--accent);
  }

  .cta:hover {
    transform: scale(1.04);
  }

  .cta:active {
    transform: scale(0.97);
  }

  .label {
    letter-spacing: -0.01em;
  }
</style>
