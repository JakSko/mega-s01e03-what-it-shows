<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { causeOf, uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';

  // A ticket split by problem, counted the desk's way (causes.ts, readAs): every report under the cause it
  // is filed by, and the reports the desk read as a one-day move (desk-notes.json) also as their own
  // problem, footnoted. Every count is computed here; only the status words come from the page.
  type Key = 'parser' | 'hint' | 'one-day';
  let {
    ticket,
    repo,
    issues,
    status,
  }: { ticket: number; repo: string; issues: Record<Key, number>; status: Record<Key, string> } = $props();

  const LABEL: Record<Key, string> = {
    parser: 'parser reads day-first dates month first',
    hint: 'booking-v3 form hints MM/DD/YYYY',
    'one-day': 'date moves one day early',
  };

  const merged = $derived(uniqueById(reports as Report[]).filter((r) => r.mergedInto === ticket));
  const oneDay = $derived(merged.filter((r) => notes.oneDayMove.includes(r.id)));
  const byCause = (cause: 'parser' | 'hint') => merged.filter((r) => causeOf(r, tenantOf(r)) === cause);
  const unplaced = $derived(merged.filter((r) => causeOf(r, tenantOf(r)) === null));

  const rows = $derived.by(() =>
    ([['parser', byCause('parser')], ['hint', byCause('hint')], ['one-day', oneDay]] as [Key, Report[]][]).map(([key, rs]) => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return { key, count: rs.length, tenants: new Set(rs.map((r) => r.tenant)).size, channels: [...new Set(rs.map((r) => r.channel))].sort().join(' · '), first: days[0], last: days[days.length - 1] };
    }),
  );
  const alsoParser = $derived(oneDay.filter((r) => causeOf(r, tenantOf(r)) === 'parser').length);
  const covered = $derived(new Set([...byCause('parser'), ...byCause('hint'), ...oneDay].map((r) => r.id)).size);
</script>

<p class="sum">
  <strong>{merged.length}</strong> reports merged into #{ticket} ·
  <strong>{rows.length}</strong> problems · each with its own ticket
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>channels</th><th>seen</th><th>ticket</th><th>status</th></tr>
  </thead>
  <tbody>
    {#each rows as r (r.key)}
      <tr>
        <td>{LABEL[r.key]}</td>
        <td>{r.count}{r.key === 'one-day' ? '*' : ''}</td>
        <td>{r.tenants}</td>
        <td>{r.channels}</td>
        <td>{r.first} → {r.last}</td>
        <td><a href="https://github.com/{repo}/issues/{issues[r.key]}">{repo}#{issues[r.key]}</a></td>
        <td>{status[r.key]}</td>
      </tr>
    {/each}
  </tbody>
</table>

<p class="note">
  * Counted the desk's way, as exported: the <strong>{oneDay.length}</strong> one-day reports are also counted under
  <code>parser</code> ({alsoParser} of them), where the desk files them by tenant, and footnoted here as their own problem.
</p>

{#if covered !== merged.length || unplaced.length}
  <p class="warn">The problems cover {covered} of {merged.length} reports: recount before you rely on this table.</p>
{/if}

<style>
  .sum { font-size: 1.1rem; }
  .warn { color: var(--warn); font-weight: 600; }
  .note { color: var(--muted); font-size: 0.9em; }
</style>
