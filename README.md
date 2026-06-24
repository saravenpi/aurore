<div align="center">
  <img src="icon-source.svg" width="108" alt="Aurore" />
  <h1>Aurore</h1>
  <p><em>Your morning brief, at first light.</em></p>
</div>

Aurore is a calm desktop morning brief. It gathers everything worth knowing when
you wake up — weather, the news, your unread mail, your notifications — and plays
it back as a smooth, story-style **diaporama**. One glance, one brief, and you're
caught up.

## Sources

- **Météo** — current conditions and the day's forecast (Open-Meteo, geolocated automatically).
- **Actus** — any RSS / Atom / JSON feed you point it at.
- **Mail** — unread messages over IMAP (optional).
- **Notifications** — ntfy topics (optional).

## Stack

SvelteKit 5 · Svelte 5 runes · TypeScript · Vite · Tauri 2 (Rust). Goga typeface,
Solar icons, liquid-glass surfaces, rounded everything. Built to match the Facile
suite house style.

## Develop

```sh
bun install
bun run tauri dev
```

## Build

```sh
bun run tauri build
```

## License

MIT © saravenpi
