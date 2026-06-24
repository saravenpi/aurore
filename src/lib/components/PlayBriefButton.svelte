<script lang="ts">
  import PlayCircle from "~icons/solar/play-circle-bold-duotone";

  let { onplay }: { onplay: () => void } = $props();
</script>

<button class="cta" onclick={onplay}>
  <span class="icon">
    <PlayCircle style="font-size:38px" />
  </span>
  <span class="text">
    <span class="label">Lancer le brief</span>
    <span class="sub">Votre résumé du matin</span>
  </span>
</button>

<style>
  .cta {
    display: flex;
    align-items: center;
    gap: 16px;
    width: 100%;
    min-height: 64px;
    padding: 12px 26px;
    border-radius: var(--r-pill);
    background: linear-gradient(135deg, var(--dawn-amber), var(--dawn-coral));
    color: #fff;
    text-align: left;
    box-shadow:
      0 12px 30px rgba(255, 141, 107, 0.4),
      inset 0 1px 1px rgba(255, 255, 255, 0.4);
    transition:
      transform 0.35s var(--ease-soft),
      box-shadow 0.35s var(--ease-soft),
      filter 0.35s var(--ease-soft);
  }

  .cta:hover {
    transform: translateY(-3px);
    filter: brightness(1.05);
    box-shadow:
      0 20px 44px rgba(255, 141, 107, 0.5),
      inset 0 1px 1px rgba(255, 255, 255, 0.5);
  }

  .cta:active {
    transform: translateY(-1px) scale(0.985);
  }

  .icon {
    display: inline-flex;
    align-items: center;
    filter: drop-shadow(0 2px 6px rgba(40, 38, 32, 0.25));
  }

  .text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .label {
    font-family: "Goga", sans-serif;
    font-weight: 700;
    font-size: 1.15rem;
    line-height: 1.1;
  }

  .sub {
    font-size: 0.82rem;
    opacity: 0.85;
  }
</style>
