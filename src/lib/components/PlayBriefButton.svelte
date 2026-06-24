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
    background: var(--dawn-amber);
    color: #fff;
    text-align: left;
    transition:
      transform 0.35s var(--ease-soft),
      filter 0.35s var(--ease-soft);
  }

  .cta:hover {
    transform: scale(1.03);
    filter: brightness(1.04);
  }

  .cta:active {
    transform: scale(0.97);
  }

  .icon {
    display: inline-flex;
    align-items: center;
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
