<script lang="ts">
  import type { SourceKind } from "$lib/types";
  import Feed from "~icons/solar/feed-bold-duotone";
  import Letter from "~icons/solar/letter-bold-duotone";
  import Bell from "~icons/solar/bell-bold-duotone";

  let { kind, name }: { kind: SourceKind; name: string } = $props();
</script>

<span class="chip">
  {#if kind === "rss"}
    <Feed style="font-size:13px" />
  {:else if kind === "email"}
    <Letter style="font-size:13px" />
  {:else}
    <Bell style="font-size:13px" />
  {/if}
  <span class="name">{name}</span>
</span>

<style>
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    max-width: 100%;
    padding: 4px 10px 4px 8px;
    border-radius: var(--r-pill);
    background: var(--accent-soft);
    color: var(--accent-ink);
    font-size: 0.72rem;
    font-weight: 500;
    line-height: 1;
  }

  .name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
