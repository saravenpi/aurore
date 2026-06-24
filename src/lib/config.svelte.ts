import { invoke } from "@tauri-apps/api/core";
import { DEFAULT_CONFIG, type Config } from "./types";

class ConfigStore {
  data = $state<Config>(structuredClone(DEFAULT_CONFIG));
  loaded = $state(false);

  async load() {
    try {
      const loaded = await invoke<Config>("load_config");
      this.data = { ...structuredClone(DEFAULT_CONFIG), ...loaded };
    } catch (e) {
      console.error("load_config failed", e);
      this.data = structuredClone(DEFAULT_CONFIG);
    }
    this.loaded = true;
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
