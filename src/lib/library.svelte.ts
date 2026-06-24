import { invoke } from "@tauri-apps/api/core";
import type { FeedItem } from "./types";

class Library {
  seen = $state<Set<string>>(new Set());
  likes = $state<FeedItem[]>([]);
  loaded = $state(false);

  #saveTimer: ReturnType<typeof setTimeout> | null = null;

  async load() {
    try {
      const s = await invoke<{ seen: string[]; likes: FeedItem[] }>("load_state");
      this.seen = new Set(s.seen ?? []);
      this.likes = s.likes ?? [];
    } catch (e) {
      console.error("load_state failed", e);
    }
    this.loaded = true;
  }

  isSeen(id: string): boolean {
    return this.seen.has(id);
  }

  markSeen(id: string) {
    if (this.seen.has(id)) return;
    this.seen = new Set(this.seen).add(id);
    this.#scheduleSave();
  }

  isLiked(id: string): boolean {
    return this.likes.some((l) => l.id === id);
  }

  toggleLike(item: FeedItem) {
    if (this.isLiked(item.id)) {
      this.likes = this.likes.filter((l) => l.id !== item.id);
    } else {
      this.likes = [{ ...item }, ...this.likes];
    }
    this.#scheduleSave();
  }

  #scheduleSave() {
    if (this.#saveTimer) clearTimeout(this.#saveTimer);
    this.#saveTimer = setTimeout(() => this.#save(), 400);
  }

  async #save() {
    try {
      await invoke("save_state", {
        state: { seen: [...this.seen], likes: $state.snapshot(this.likes) },
      });
    } catch (e) {
      console.error("save_state failed", e);
    }
  }
}

export const library = new Library();
