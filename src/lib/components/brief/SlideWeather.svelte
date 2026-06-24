<script lang="ts">
  import { fly, fade } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { feed } from "$lib/feed.svelte";
  import { weatherLabel, weatherBucket, clockHM } from "$lib/time";
  import type { Slide } from "$lib/types";

  import Sun from "~icons/solar/sun-bold-duotone";
  import Moon from "~icons/solar/moon-bold-duotone";
  import CloudSun from "~icons/solar/cloud-sun-bold-duotone";
  import MoonStars from "~icons/solar/moon-stars-bold-duotone";
  import Cloud from "~icons/solar/cloud-bold-duotone";
  import Fog from "~icons/solar/fog-bold-duotone";
  import CloudRain from "~icons/solar/cloud-rain-bold-duotone";
  import CloudSnow from "~icons/solar/cloud-snowfall-bold-duotone";
  import CloudStorm from "~icons/solar/cloud-storm-bold-duotone";
  import Temperature from "~icons/solar/temperature-bold-duotone";
  import Wind from "~icons/solar/wind-bold-duotone";
  import Waterdrop from "~icons/solar/waterdrop-bold-duotone";
  import Sunrise from "~icons/solar/sunrise-bold-duotone";
  import Sunset from "~icons/solar/sunset-bold-duotone";

  let { slide }: { slide: Slide } = $props();

  const w = $derived(feed.weather);

  function iconFor(code: number, isDay: boolean) {
    const b = weatherBucket(code);
    switch (b) {
      case "clear":
        return isDay ? Sun : Moon;
      case "partly":
        return isDay ? CloudSun : MoonStars;
      case "cloud":
        return Cloud;
      case "fog":
        return Fog;
      case "drizzle":
      case "rain":
        return CloudRain;
      case "snow":
        return CloudSnow;
      case "storm":
        return CloudStorm;
    }
  }

  const MainIcon = $derived(w ? iconFor(w.now.code, w.now.isDay) : Sun);
  const hours = $derived((w?.hourly ?? []).slice(0, 6));
</script>

{#if w}
  <section class="weather">
    <div class="hero" in:fly={{ y: 24, duration: 520, delay: 60, easing: cubicOut }}>
      <div class="hero-icon">
        <MainIcon style="font-size:112px" />
      </div>
      <div class="hero-text">
        <div class="temp">{Math.round(w.now.tempC)}<span class="deg">°</span></div>
        <div class="label">{weatherLabel(w.now.code)}</div>
        <div class="place">{w.place}</div>
      </div>
    </div>

    <div class="stats" in:fly={{ y: 22, duration: 520, delay: 200, easing: cubicOut }}>
      <div class="pill">
        <Temperature style="font-size:22px" />
        <div class="pill-body">
          <span class="pill-k">Ressenti</span>
          <span class="pill-v">{Math.round(w.now.feelsLikeC)}°</span>
        </div>
      </div>
      <div class="pill">
        <Wind style="font-size:22px" />
        <div class="pill-body">
          <span class="pill-k">Vent</span>
          <span class="pill-v">{Math.round(w.now.windKmh)} km/h</span>
        </div>
      </div>
      <div class="pill">
        <Waterdrop style="font-size:22px" />
        <div class="pill-body">
          <span class="pill-k">Humidité</span>
          <span class="pill-v">{w.now.humidity}%</span>
        </div>
      </div>
      <div class="pill">
        <Sunrise style="font-size:22px" />
        <div class="pill-body">
          <span class="pill-k">Aujourd'hui</span>
          <span class="pill-v">{Math.round(w.today.maxC)}° / {Math.round(w.today.minC)}°</span>
        </div>
      </div>
    </div>

    {#if hours.length}
      <div
        class="hourly scroll"
        in:fade={{ duration: 600, delay: 360 }}
      >
        {#each hours as h (h.time)}
          {@const HIcon = iconFor(h.code, w.now.isDay)}
          <div class="hour">
            <span class="hour-t">{clockHM(h.time)}</span>
            <HIcon style="font-size:26px" />
            <span class="hour-temp">{Math.round(h.tempC)}°</span>
          </div>
        {/each}
      </div>
    {/if}
  </section>
{:else}
  <section class="empty" in:fade={{ duration: 400 }}>
    <Sunset style="font-size:72px" />
    <p>Météo indisponible</p>
  </section>
{/if}

<style>
  .weather {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 28px;
    width: 100%;
    max-width: 720px;
    padding: 0 24px;
  }

  .hero {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  .hero-icon {
    color: var(--accent);
    animation: float-soft 6s var(--ease-soft) infinite;
  }

  .hero-text {
    display: flex;
    flex-direction: column;
    color: var(--ink);
  }

  .temp {
    font-weight: 700;
    font-size: clamp(64px, 11vw, 108px);
    line-height: 0.9;
    letter-spacing: -0.03em;
  }

  .deg {
    color: var(--accent);
  }

  .label {
    margin-top: 8px;
    font-size: clamp(18px, 2.4vw, 24px);
    font-weight: 500;
  }

  .place {
    font-size: 16px;
    color: var(--ink-soft);
  }

  .stats {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px;
  }

  .pill {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 20px;
    border-radius: var(--r-pill);
    background: #fff;
    border: 1px solid var(--hair);
    color: var(--ink);
  }

  .pill :global(svg) {
    color: var(--accent);
  }

  .pill-body {
    display: flex;
    flex-direction: column;
    line-height: 1.15;
  }

  .pill-k {
    font-size: 12px;
    color: var(--ink-soft);
  }

  .pill-v {
    font-size: 16px;
    font-weight: 500;
  }

  .hourly {
    display: flex;
    gap: 10px;
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
    padding: 4px 2px;
  }

  .hour {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    min-width: 76px;
    padding: 14px 12px;
    border-radius: var(--r-md);
    background: #fff;
    border: 1px solid var(--hair);
    color: var(--ink);
    flex: 0 0 auto;
  }

  .hour :global(svg) {
    color: var(--accent);
  }

  .hour-t {
    font-size: 13px;
    color: var(--ink-soft);
  }

  .hour-temp {
    font-size: 16px;
    font-weight: 500;
  }

  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    color: var(--ink);
  }

  .empty :global(svg) {
    color: var(--accent);
  }

  .empty p {
    font-size: 20px;
    font-weight: 500;
  }
</style>
