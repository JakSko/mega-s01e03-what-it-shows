<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { causeOf, uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';

  // A ticket split by problem: the desk's causes (causes.ts), with the reports the desk read as a
  // one-day move (desk-notes.json) taken out as their own problem. Every count is computed here.
  type Key = 'parser' | 'hint' | 'one-day';
  let { ticket, repo, issues }: { ticket: number; repo: string; issues: Record<Key, number> } = $props();

  const LABEL: Record<Key, string> = {
    parser: 'parser reads day-first dates month first',
    hint: 'booking-v3 form hints MM/DD/YYYY',
    'one-day': 'date moves one day early',
  };

  const merged = $derived(uniqueById(reports as Report[]).filter((r) => r.mergedInto === ticket));
  const problemOf = (r: Report): Key | 'unplaced' =>
    notes.oneDayMove.includes(r.id) ? 'one-day' : (causeOf(r, tenantOf(r)) ?? 'unplaced');

  const rows = $derived.by(() => {
    const by = new Map<Key | 'unplaced', Report[]>();
    for (const r of merged) by.set(problemOf(r), [...(by.get(problemOf(r)) ?? []), r]);
    return [...by.entries()]
      .map(([key, rs]) => {
        const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
        return { key, count: rs.length, tenants: new Set(rs.map((r) => r.tenant)).size, channels: [...new Set(rs.map((r) => r.channel))].sort().join(' · '), first: days[0], last: days[days.length - 1] };
      })
      .sort((a, b) => b.count - a.count);
  });
  const sum = $derived(rows.reduce((n, r) => n + r.count, 0));

  // The incident page's CauseTable counts the one-day moves under parser; say how the two tables meet.
  const deskParser = $derived(merged.filter((r) => causeOf(r, tenantOf(r)) === 'parser'));
  const movedOut = $derived(deskParser.filter((r) => notes.oneDayMove.includes(r.id)).length);
  const parserHere = $derived(rows.find((r) => r.key === 'parser')?.count ?? 0);
</script>

<p class="sum">
  <strong>{merged.length}</strong> reports merged into #{ticket} ·
  <strong>{rows.length}</strong> problems · each with its own ticket
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>channels</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each rows as r (r.key)}
      <tr>
        <td>{r.key === 'unplaced' ? 'not placed' : LABEL[r.key]}</td>
        <td>{r.count}</td>
        <td>{r.tenants}</td>
        <td>{r.channels}</td>
        <td>{r.first} → {r.last}</td>
        <td>
          {#if r.key !== 'unplaced'}
            <a href="https://github.com/{repo}/issues/{issues[r.key]}">{repo}#{issues[r.key]}</a>
          {:else}
            no ticket
          {/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<p class="note">
  The incident page counts <strong>{deskParser.length}</strong> reports under <code>parser</code>.
  <strong>{movedOut}</strong> of them are the desk's one-day moves, which are their own problem here, so the
  parser problem covers <strong>{parserHere}</strong>.
</p>

{#if sum !== merged.length}
  <p class="warn">The problems add up to {sum}, not {merged.length}: recount before you rely on this table.</p>
{/if}

<style>
  .sum { font-size: 1.1rem; }
  .warn { color: var(--warn); font-weight: 600; }
  .note { color: var(--muted); font-size: 0.9em; }
</style>
