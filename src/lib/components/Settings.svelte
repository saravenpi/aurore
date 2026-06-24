<script lang="ts">
  import { scale, fade } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { config } from "$lib/config.svelte";
  import { feed } from "$lib/feed.svelte";
  import type { Snippet } from "svelte";

  import CloseCircle from "~icons/solar/close-circle-bold-duotone";
  import AddCircle from "~icons/solar/add-circle-bold-duotone";
  import Trash from "~icons/solar/trash-bin-trash-bold-duotone";
  import MapPoint from "~icons/solar/map-point-bold-duotone";
  import FeedIcon from "~icons/solar/feed-bold-duotone";
  import Letter from "~icons/solar/letter-bold-duotone";
  import Bell from "~icons/solar/bell-bold-duotone";
  import Play from "~icons/solar/play-bold";
  import CheckCircle from "~icons/solar/check-circle-bold-duotone";

  let { open = $bindable(false) }: { open?: boolean } = $props();

  let saving = $state(false);

  const c = $derived(config.data);

  async function close() {
    await config.save();
    open = false;
  }

  async function persist() {
    saving = true;
    try {
      await config.save();
      await feed.refresh();
    } finally {
      saving = false;
    }
  }

  function addFeed() {
    config.data.feeds.push({ name: "", url: "", enabled: true });
  }

  function removeFeed(i: number) {
    config.data.feeds.splice(i, 1);
  }

  let newTopic = $state("");
  function addTopic() {
    const t = newTopic.trim();
    if (!t) return;
    config.data.notifications.topics.push(t);
    newTopic = "";
  }

  function removeTopic(i: number) {
    config.data.notifications.topics.splice(i, 1);
  }
</script>

{#snippet toggle(checked: boolean, set: (v: boolean) => void, label: string)}
  <button
    class="switch"
    class:on={checked}
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onclick={() => set(!checked)}
  >
    <span class="knob"></span>
  </button>
{/snippet}

{#snippet section(icon: Snippet, title: string, sub: string | undefined, body: Snippet)}
  <section class="block">
    <header class="block-head">
      <span class="block-icon">{@render icon()}</span>
      <span class="block-titles">
        <span class="block-title">{title}</span>
        {#if sub}<span class="block-sub">{sub}</span>{/if}
      </span>
    </header>
    {@render body()}
  </section>
{/snippet}

{#if open}
  <div
    class="backdrop"
    transition:fade={{ duration: 200 }}
    onclick={close}
    role="presentation"
  >
    <aside
      class="panel"
      transition:scale={{ start: 0.96, duration: 300, easing: cubicOut }}
      onclick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-label="Réglages"
    >
      <header class="panel-head">
        <h2>Réglages</h2>
        <button class="close" onclick={close} aria-label="Fermer">
          <CloseCircle style="font-size:30px" />
        </button>
      </header>

      <div class="content scroll">
      {#snippet locIcon()}<MapPoint style="font-size:18px" />{/snippet}
      {#snippet locBody()}
        <div class="row toggle-row">
          <span class="row-label">Localisation automatique</span>
          {@render toggle(
            c.location.auto,
            (v) => (config.data.location.auto = v),
            "Localisation automatique",
          )}
        </div>
        {#if !c.location.auto}
          <label class="field">
            <span class="field-label">Lieu</span>
            <input class="input" type="text" bind:value={config.data.location.place} placeholder="Paris, France" />
          </label>
          <div class="pair">
            <label class="field">
              <span class="field-label">Latitude</span>
              <input class="input" type="number" step="any" bind:value={config.data.location.lat} />
            </label>
            <label class="field">
              <span class="field-label">Longitude</span>
              <input class="input" type="number" step="any" bind:value={config.data.location.lon} />
            </label>
          </div>
        {/if}
      {/snippet}
      {@render section(locIcon, "Lieu", undefined, locBody)}

      {#snippet feedIcon()}<FeedIcon style="font-size:18px" />{/snippet}
      {#snippet feedBody()}
        <div class="list">
          {#each config.data.feeds as f, i (i)}
            <div class="feed-item">
              <div class="feed-head">
                {@render toggle(
                  f.enabled,
                  (v) => (config.data.feeds[i].enabled = v),
                  "Activer le flux",
                )}
                <input class="input grow" type="text" bind:value={config.data.feeds[i].name} placeholder="Nom du flux" />
                <button class="del" onclick={() => removeFeed(i)} aria-label="Supprimer">
                  <Trash style="font-size:18px" />
                </button>
              </div>
              <input class="input" type="text" bind:value={config.data.feeds[i].url} placeholder="https://exemple.com/rss.xml" />
            </div>
          {/each}
        </div>
        <button class="add" onclick={addFeed}>
          <AddCircle style="font-size:20px" />
          Ajouter un flux
        </button>
      {/snippet}
      {@render section(feedIcon, "Sources / Flux", undefined, feedBody)}

      {#snippet mailIcon()}<Letter style="font-size:18px" />{/snippet}
      {#snippet mailBody()}
        <div class="row toggle-row">
          <span class="row-label">Activer la messagerie</span>
          {@render toggle(
            c.email.enabled,
            (v) => (config.data.email.enabled = v),
            "Activer la messagerie",
          )}
        </div>
        <p class="hint">Optionnel — connexion en lecture via IMAP.</p>
        {#if c.email.enabled}
          <div class="pair">
            <label class="field grow">
              <span class="field-label">Serveur</span>
              <input class="input" type="text" bind:value={config.data.email.host} placeholder="imap.exemple.com" />
            </label>
            <label class="field port">
              <span class="field-label">Port</span>
              <input class="input" type="number" bind:value={config.data.email.port} />
            </label>
          </div>
          <label class="field">
            <span class="field-label">Utilisateur</span>
            <input class="input" type="text" bind:value={config.data.email.username} placeholder="vous@exemple.com" />
          </label>
          <label class="field">
            <span class="field-label">Mot de passe</span>
            <input class="input" type="password" bind:value={config.data.email.password} />
          </label>
          <label class="field">
            <span class="field-label">Dossier</span>
            <input class="input" type="text" bind:value={config.data.email.mailbox} placeholder="INBOX" />
          </label>
        {/if}
      {/snippet}
      {@render section(mailIcon, "Mail", undefined, mailBody)}

      {#snippet notifIcon()}<Bell style="font-size:18px" />{/snippet}
      {#snippet notifBody()}
        <div class="row toggle-row">
          <span class="row-label">Activer les notifications</span>
          {@render toggle(
            c.notifications.enabled,
            (v) => (config.data.notifications.enabled = v),
            "Activer les notifications",
          )}
        </div>
        {#if c.notifications.enabled}
          <label class="field">
            <span class="field-label">Serveur ntfy</span>
            <input class="input" type="text" bind:value={config.data.notifications.ntfyServer} placeholder="https://ntfy.sh" />
          </label>
          <div class="topics">
            {#each config.data.notifications.topics as topic, i (i)}
              <span class="topic-pill">
                {topic}
                <button class="topic-x" onclick={() => removeTopic(i)} aria-label="Retirer">
                  <CloseCircle style="font-size:16px" />
                </button>
              </span>
            {/each}
          </div>
          <div class="topic-add">
            <input
              class="input grow"
              type="text"
              bind:value={newTopic}
              placeholder="Nom du sujet"
              onkeydown={(e) => e.key === "Enter" && addTopic()}
            />
            <button class="add inline" onclick={addTopic}>
              <AddCircle style="font-size:20px" />
              Ajouter
            </button>
          </div>
        {/if}
      {/snippet}
      {@render section(notifIcon, "Notifications", undefined, notifBody)}

      {#snippet briefIcon()}<Play style="font-size:16px" />{/snippet}
      {#snippet briefBody()}
        <label class="field">
          <span class="field-label">Durée par diapositive — {c.brief.slideSeconds} s</span>
          <input class="range" type="range" min="3" max="20" step="1" bind:value={config.data.brief.slideSeconds} />
        </label>
        <label class="field">
          <span class="field-label">Nom d'accueil</span>
          <input class="input" type="text" bind:value={config.data.brief.greetingName} placeholder="Votre prénom" />
        </label>
        <div class="pair">
          <label class="field">
            <span class="field-label">Actus / diapo</span>
            <input class="input" type="number" min="1" bind:value={config.data.brief.newsPerSlide} />
          </label>
          <label class="field">
            <span class="field-label">Diapos d'actus max.</span>
            <input class="input" type="number" min="1" bind:value={config.data.brief.maxNewsSlides} />
          </label>
        </div>
      {/snippet}
      {@render section(briefIcon, "Brief", undefined, briefBody)}
    </div>

      <footer class="panel-foot">
        <button class="save" onclick={persist} disabled={saving}>
          <CheckCircle style="font-size:20px" />
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </footer>
    </aside>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 40;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px;
    background: rgba(247, 246, 242, 0.6);
    -webkit-backdrop-filter: blur(20px) saturate(120%);
    backdrop-filter: blur(20px) saturate(120%);
  }

  .panel {
    z-index: 50;
    width: min(680px, 92vw);
    max-height: 86vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: var(--r-xl);
    border: 1px solid var(--hair);
    background: var(--paper);
  }

  .panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 22px 14px;
  }

  .panel-head h2 {
    font-family: "Goga", sans-serif;
    font-weight: 700;
    font-size: 1.4rem;
    color: var(--ink);
  }

  .close {
    display: inline-flex;
    color: var(--ink-soft);
    border-radius: var(--r-pill);
    transition:
      transform 0.3s var(--ease-soft),
      color 0.3s var(--ease-soft);
  }

  .close:hover {
    color: var(--accent-ink);
    transform: scale(1.08);
  }

  .content {
    flex: 1;
    overflow-y: auto;
    scrollbar-width: none;
    padding: 4px 22px 22px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .content::-webkit-scrollbar {
    display: none;
  }

  .block {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 18px;
    border-radius: var(--r-lg);
    background: rgba(255, 255, 255, 0.42);
  }

  .block-head {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .block-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border-radius: var(--r-pill);
    background: var(--accent-soft);
    color: var(--accent-ink);
    flex-shrink: 0;
  }

  .block-titles {
    display: flex;
    flex-direction: column;
  }

  .block-title {
    font-family: "Goga", sans-serif;
    font-weight: 700;
    font-size: 1rem;
    color: var(--ink);
  }

  .block-sub {
    font-size: 0.78rem;
    color: var(--ink-soft);
  }

  .row {
    display: flex;
    align-items: center;
  }

  .toggle-row {
    justify-content: space-between;
    gap: 12px;
  }

  .row-label {
    font-size: 0.88rem;
    color: var(--ink);
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .field-label {
    font-size: 0.76rem;
    font-weight: 500;
    color: var(--ink-soft);
    padding-left: 4px;
  }

  .input {
    width: 100%;
    font-family: inherit;
    font-size: 0.88rem;
    color: var(--ink);
    padding: 10px 14px;
    border-radius: var(--r-md);
    border: 1px solid var(--hair);
    background: rgba(255, 255, 255, 0.7);
    outline: none;
    transition: border-color 0.25s var(--ease-soft);
  }

  .input::placeholder {
    color: var(--ink-faint);
  }

  .input:focus {
    border-color: var(--accent);
  }

  .grow {
    flex: 1;
    min-width: 0;
  }

  .pair {
    display: flex;
    gap: 10px;
    align-items: flex-end;
  }

  .pair .field {
    flex: 1;
    min-width: 0;
  }

  .port {
    max-width: 110px;
  }

  .range {
    width: 100%;
    accent-color: var(--accent);
    cursor: pointer;
  }

  .hint {
    font-size: 0.76rem;
    color: var(--ink-faint);
    padding-left: 4px;
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .feed-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    border-radius: var(--r-md);
    border: 1px solid var(--hair);
    background: rgba(255, 255, 255, 0.35);
  }

  .feed-head {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .del {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    flex-shrink: 0;
    border-radius: var(--r-pill);
    color: var(--ink-soft);
    transition:
      color 0.25s var(--ease-soft),
      background 0.25s var(--ease-soft);
  }

  .del:hover {
    color: var(--dawn-coral);
    background: rgba(255, 141, 107, 0.12);
  }

  .add {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    align-self: flex-start;
    padding: 8px 16px;
    border-radius: var(--r-pill);
    background: var(--accent-soft);
    color: var(--accent-ink);
    font-size: 0.84rem;
    font-weight: 500;
    transition:
      transform 0.25s var(--ease-soft),
      background 0.25s var(--ease-soft);
  }

  .add:hover {
    transform: scale(1.03);
    background: rgba(255, 158, 69, 0.24);
  }

  .add.inline {
    flex-shrink: 0;
    align-self: stretch;
  }

  .topics {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
  }

  .topic-pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 5px 6px 5px 12px;
    border-radius: var(--r-pill);
    background: var(--accent-soft);
    color: var(--accent-ink);
    font-size: 0.8rem;
  }

  .topic-x {
    display: inline-flex;
    color: var(--accent-ink);
    opacity: 0.7;
    transition: opacity 0.2s var(--ease-soft);
  }

  .topic-x:hover {
    opacity: 1;
  }

  .topic-add {
    display: flex;
    gap: 8px;
    align-items: stretch;
  }

  .switch {
    position: relative;
    flex-shrink: 0;
    width: 46px;
    height: 27px;
    border-radius: var(--r-pill);
    background: rgba(40, 38, 32, 0.16);
    transition: background 0.3s var(--ease-soft);
  }

  .switch.on {
    background: var(--accent);
  }

  .knob {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 21px;
    height: 21px;
    border-radius: var(--r-pill);
    background: #fff;
    transition: transform 0.3s var(--ease-soft);
  }

  .switch.on .knob {
    transform: translateX(19px);
  }

  .panel-foot {
    padding: 14px 22px 20px;
    border-top: 1px solid var(--hair);
  }

  .save {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    height: 50px;
    border-radius: var(--r-pill);
    background: var(--dawn-amber);
    color: #fff;
    font-family: "Goga", sans-serif;
    font-weight: 700;
    font-size: 0.98rem;
    transition:
      transform 0.3s var(--ease-soft),
      filter 0.3s var(--ease-soft);
  }

  .save:hover:not(:disabled) {
    transform: scale(1.03);
    filter: brightness(1.05);
  }

  .save:active:not(:disabled) {
    transform: scale(0.97);
  }

  .save:disabled {
    opacity: 0.7;
    cursor: default;
  }
</style>
