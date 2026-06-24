import { invoke } from "@tauri-apps/api/core";
import { Readability } from "@mozilla/readability";
import DOMPurify from "dompurify";
import type { FeedItem } from "./types";

export interface Article {
  title: string;
  byline: string | null;
  siteName: string | null;
  content: string;
  length: number;
}

class ReaderStore {
  open = $state(false);
  item = $state<FeedItem | null>(null);
  article = $state<Article | null>(null);
  loading = $state(false);
  error = $state<string | null>(null);

  async show(item: FeedItem) {
    if (!item.link) return;
    this.item = item;
    this.article = null;
    this.error = null;
    this.open = true;
    this.loading = true;
    try {
      const html = await invoke<string>("fetch_url", { url: item.link });
      const doc = new DOMParser().parseFromString(html, "text/html");
      const base = doc.createElement("base");
      base.href = item.link;
      doc.head?.prepend(base);
      const parsed = new Readability(doc).parse();
      if (!parsed || !parsed.content) throw new Error("unreadable");
      const clean = DOMPurify.sanitize(parsed.content, {
        USE_PROFILES: { html: true },
      });
      this.article = {
        title: parsed.title || item.title,
        byline: parsed.byline ?? item.author,
        siteName: parsed.siteName ?? item.sourceName,
        content: clean,
        length: parsed.length ?? 0,
      };
    } catch (e) {
      console.error("reader failed", e);
      this.error = "Lecture impossible. Ouvrez l'article dans le navigateur.";
    } finally {
      this.loading = false;
    }
  }

  close() {
    this.open = false;
    this.item = null;
    this.article = null;
    this.error = null;
  }
}

export const reader = new ReaderStore();
