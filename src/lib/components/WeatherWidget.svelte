<script lang="ts">
  import { feed } from "$lib/feed.svelte";
  import { weatherLabel, weatherBucket } from "$lib/time";
  import MapPoint from "~icons/solar/map-point-bold-duotone";
  import Temperature from "~icons/solar/temperature-bold-duotone";
  import Wind from "~icons/solar/wind-bold-duotone";

  import Sun from "~icons/solar/sun-bold-duotone";
  import Moon from "~icons/solar/moon-bold-duotone";
  import CloudSun from "~icons/solar/cloud-sun-bold-duotone";
  import MoonStars from "~icons/solar/moon-stars-bold-duotone";
  import Cloud from "~icons/solar/cloud-bold-duotone";
  import Fog from "~icons/solar/fog-bold-duotone";
  import CloudRain from "~icons/solar/cloud-rain-bold-duotone";
  import CloudSnow from "~icons/solar/cloud-snowfall-bold-duotone";
  import CloudStorm from "~icons/solar/cloud-storm-bold-duotone";

  const w = $derived(feed.weather);

  const icons = {
    clear: [Sun, Moon],
    partly: [CloudSun, MoonStars],
    cloud: [Cloud, Cloud],
    fog: [Fog, Fog],
    drizzle: [CloudRain, CloudRain],
    rain: [CloudRain, CloudRain],
    snow: [CloudSnow, CloudSnow],
    storm: [CloudStorm, CloudStorm],
  } as const;

  const Icon = $derived.by(() => {
    if (!w) return Sun;
    const bucket = weatherBucket(w.now.code);
    return icons[bucket][w.now.isDay ? 0 : 1];
  });
</script>

{#if w}
  <section class="weather liquid-glass">
    <div class="wash"></div>

    <div class="main">
      <div class="figure">
        <Icon style="font-size:64px" />
      </div>
      <div class="readout">
        <div class="temp">{Math.round(w.now.tempC)}<span class="deg">°</span></div>
        <div class="label">{weatherLabel(w.now.code)}</div>
        <div class="place">
          <MapPoint style="font-size:14px" />
          <span>{w.place}</span>
        </div>
      </div>
    </div>

    <div class="stats">
      <span class="stat">
        <span class="k">Max / Min</span>
        <span class="v">{Math.round(w.today.maxC)}° / {Math.round(w.today.minC)}°</span>
      </span>
      <span class="stat">
        <Temperature style="font-size:14px" />
        <span class="k">Ressenti</span>
        <span class="v">{Math.round(w.now.feelsLikeC)}°</span>
      </span>
      <span class="stat">
        <Wind style="font-size:14px" />
        <span class="k">Vent</span>
        <span class="v">{Math.round(w.now.windKmh)} km/h</span>
      </span>
    </div>
  </section>
{:else}
  <section class="weather placeholder liquid-glass">
    <div class="figure muted">
      <Cloud style="font-size:48px" />
    </div>
    <p>{feed.weatherLoading ? "Météo en cours…" : "Météo indisponible"}</p>
  </section>
{/if}

<style>
  .weather {
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 18px;
    padding: 22px;
    border-radius: var(--r-lg);
  }

  .wash {
    position: absolute;
    inset: 0;
    z-index: -1;
    background: var(--sky-warm);
    opacity: 0.7;
    border-radius: inherit;
    pointer-events: none;
  }

  .main {
    display: flex;
    align-items: center;
    gap: 18px;
  }

  .figure {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--accent-ink);
    filter: drop-shadow(0 6px 14px rgba(255, 158, 69, 0.3));
    animation: float-soft 6s var(--ease-soft) infinite;
  }

  .figure.muted {
    color: var(--ink-faint);
    animation: none;
  }

  .readout {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .temp {
    font-family: "Goga", sans-serif;
    font-weight: 700;
    font-size: 3.1rem;
    line-height: 1;
    color: var(--ink);
  }

  .deg {
    color: var(--accent);
  }

  .label {
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--ink);
  }

  .place {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-top: 4px;
    font-size: 0.8rem;
    color: var(--ink-soft);
  }

  .place span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .stats {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .stat {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 13px;
    border-radius: var(--r-pill);
    background: rgba(255, 255, 255, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.6);
    font-size: 0.78rem;
    color: var(--ink);
  }

  .stat .k {
    color: var(--ink-soft);
  }

  .stat .v {
    font-weight: 600;
  }

  .placeholder {
    align-items: center;
    justify-content: center;
    min-height: 150px;
    text-align: center;
  }

  .placeholder p {
    color: var(--ink-soft);
    font-size: 0.9rem;
  }
</style>
