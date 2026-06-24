import { invoke } from "@tauri-apps/api/core";
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";
import { config } from "./config.svelte";
import type { FeedItem, Weather } from "./types";

class FeedStore {
  items = $state<FeedItem[]>([]);
  #seen = new Set<string>();
  #primed = false;
  weather = $state<Weather | null>(null);
  loading = $state(false);
  weatherLoading = $state(false);
  error = $state<string | null>(null);
  lastUpdated = $state<number | null>(null);

  get news(): FeedItem[] {
    return this.items.filter((i) => i.source === "rss");
  }
  get emails(): FeedItem[] {
    return this.items.filter((i) => i.source === "email");
  }
  get notifications(): FeedItem[] {
    return this.items.filter((i) => i.source === "notification");
  }
  get unreadCount(): number {
    return this.items.filter((i) => i.unread).length;
  }

  async refreshWeather() {
    const c = config.data;
    this.weatherLoading = true;
    try {
      this.weather = await invoke<Weather>("fetch_weather", {
        lat: c.location.lat,
        lon: c.location.lon,
        auto: c.location.auto,
      });
    } catch (e) {
      console.error("fetch_weather failed", e);
    } finally {
      this.weatherLoading = false;
    }
  }

  async refresh() {
    this.loading = true;
    this.error = null;
    const c = config.data;

    const tasks: Promise<FeedItem[]>[] = [];
    const enabledFeeds = c.feeds.filter((f) => f.enabled);
    if (enabledFeeds.length) {
      tasks.push(
        invoke<FeedItem[]>("fetch_feeds", {
          sources: $state.snapshot(enabledFeeds),
        }).catch((e) => {
          console.error("fetch_feeds failed", e);
          return [];
        }),
      );
    }
    if (c.email.enabled && c.email.host && c.email.username) {
      tasks.push(
        invoke<FeedItem[]>("fetch_emails", {
          config: $state.snapshot(c.email),
        }).catch((e) => {
          console.error("fetch_emails failed", e);
          return [];
        }),
      );
    }
    if (c.notifications.enabled && c.notifications.topics.length) {
      tasks.push(
        invoke<FeedItem[]>("fetch_notifications", {
          config: $state.snapshot(c.notifications),
        }).catch((e) => {
          console.error("fetch_notifications failed", e);
          return [];
        }),
      );
    }

    const weatherTask = this.refreshWeather();

    try {
      const results = await Promise.all(tasks);
      const all = results.flat();
      all.sort(
        (a, b) =>
          (b.published ? Date.parse(b.published) : 0) -
          (a.published ? Date.parse(a.published) : 0),
      );
      const fresh = all.filter((i) => !this.#seen.has(i.id));
      all.forEach((i) => this.#seen.add(i.id));
      this.items = all;
      this.lastUpdated = Date.now();
      if (this.#primed && fresh.length) this.#notify(fresh);
      this.#primed = true;
    } catch (e) {
      this.error = String(e);
    } finally {
      await weatherTask;
      this.loading = false;
    }
  }

  async #notify(fresh: FeedItem[]) {
    try {
      let granted = await isPermissionGranted();
      if (!granted) granted = (await requestPermission()) === "granted";
      if (!granted) return;
      const count = (s: string) => fresh.filter((i) => i.source === s).length;
      const news = count("rss");
      const mail = count("email");
      const notifs = count("notification");
      const parts: string[] = [];
      if (news) parts.push(`${news} actu${news > 1 ? "s" : ""}`);
      if (mail) parts.push(`${mail} mail${mail > 1 ? "s" : ""}`);
      if (notifs) parts.push(`${notifs} notif${notifs > 1 ? "s" : ""}`);
      if (!parts.length) return;
      sendNotification({ title: "Aurore", body: `${parts.join(" · ")} à découvrir` });
    } catch (e) {
      console.error("notify failed", e);
    }
  }
}

export const feed = new FeedStore();
