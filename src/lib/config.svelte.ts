import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { DEFAULT_CONFIG, type Config } from "./types";

class ConfigStore {
  data = $state<Config>(structuredClone(DEFAULT_CONFIG));
  loaded = $state(false);
  onExternalChange: (() => void) | null = null;

  #first = true;
  #suppress = false;
  #saveTimer: ReturnType<typeof setTimeout> | null = null;

  async init() {
    await this.load();
    await listen<Config>("config-changed", (e) => this.applyExternal(e.payload));
    $effect.root(() => {
      const snap = $state.snapshot(this.data);
      void snap;
      if (this.#first) {
        this.#first = false;
        return;
      }
      if (this.#suppress) {
        this.#suppress = false;
        return;
      }
      this.scheduleSave();
    });
  }

  applyExternal(cfg: Config) {
    this.#suppress = true;
    this.data = { ...structuredClone(DEFAULT_CONFIG), ...cfg };
    this.onExternalChange?.();
  }

  async load() {
    try {
      const loaded = await invoke<Config>("load_config");
      this.data = { ...structuredClone(DEFAULT_CONFIG), ...loaded };
    } catch {
      this.data = structuredClone(DEFAULT_CONFIG);
    }
    this.loaded = true;
  }

  scheduleSave() {
    if (this.#saveTimer) clearTimeout(this.#saveTimer);
    this.#saveTimer = setTimeout(() => this.save(), 500);
  }

  async save() {
    try {
      await invoke("save_config", { config: $state.snapshot(this.data) });
    } catch (e) {
      console.error("save_config failed", e);
    }
  }
}

export const config = new ConfigStore();
