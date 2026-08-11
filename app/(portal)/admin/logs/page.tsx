'use client';
import { useState, useEffect, useMemo } from 'react';
import { Card, IconChip, EmptyState, Chip } from '@/components/ui';
import { AdminHeader, ROLE_META, LOG_ICON, relTime, SearchBox, FilterPills } from '../_shared';

const KIND_VERB: Record<string, string> = { test: 'dokončil test', user: 'sa zaregistroval', note: 'upravil poznámku', session: 'mal študijnú session' };

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [kind, setKind] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/admin/logs').then(r => r.json()).then(d => { setLogs(d.logs || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = { test: 0, user: 0, note: 0, session: 0 };
    logs.forEach(l => { c[l.kind] = (c[l.kind] || 0) + 1; });
    return c;
  }, [logs]);

  const filtered = useMemo(() => logs.filter(l =>
    (kind === 'all' || l.kind === kind) &&
    (!search || l.actor?.toLowerCase().includes(search.toLowerCase()) || (l.detail || '').toLowerCase().includes(search.toLowerCase()))
  ), [logs, kind, search]);

  const summary: [string, number, string][] = [
    ['Testy', counts.test, 'fact_check'],
    ['Registrácie', counts.user, 'person_add'],
    ['Poznámky', counts.note, 'edit_note'],
    ['Sessions', counts.session, 'timer'],
  ];

  return (
    <div>
      <AdminHeader eyebrow="Systém" title="Logy aktivity" desc="Chronológia všetkého, čo sa deje na platforme. Filtruj podľa typu alebo hľadaj."
        action={<Chip tone="soft" icon="receipt_long">{logs.length} záznamov</Chip>} />

      <div className="mkb-statgrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 22 }}>
        {summary.map(([label, n, icon]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: 14, borderRadius: 14, border: '1px solid var(--outline-variant)', background: 'var(--surface-container-lowest)' }}>
            <IconChip name={icon} size={38} radius={10} />
            <div><div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, lineHeight: 1 }}>{n}</div><div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 2 }}>{label}</div></div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 18, alignItems: 'center', flexWrap: 'wrap' }}>
        <SearchBox value={search} onChange={setSearch} placeholder="Hľadať v logoch…" width={300} />
        <FilterPills value={kind} onChange={setKind} options={[['all', 'Všetko'], ['test', 'Testy'], ['user', 'Registrácie'], ['note', 'Poznámky'], ['session', 'Sessions']]} />
      </div>

      <Card pad={0} style={{ overflow: 'hidden' }}>
        {loading ? <div style={{ padding: 40 }}><div className="mkb-skeleton" style={{ height: 180, borderRadius: 12 }} /></div>
          : filtered.length === 0 ? <EmptyState icon="history" title="Žiadne záznamy" desc="Skús iný filter alebo výraz." />
          : filtered.map((l, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 22px', borderTop: i ? '1px solid var(--outline-variant)' : 'none' }}>
              <IconChip name={LOG_ICON[l.kind] || 'bolt'} size={38} radius={10} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{l.actor}{' '}<span style={{ fontWeight: 500, color: 'var(--on-surface-variant)' }}>{KIND_VERB[l.kind]}</span></div>
                <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {l.kind === 'test' && `${l.detail} · ${l.meta}%`}{l.kind === 'user' && `${l.detail} · ${ROLE_META[l.meta]?.label || l.meta}`}{l.kind === 'note' && l.detail}{l.kind === 'session' && `${l.meta} minút`}
                </div>
              </div>
              <span style={{ fontSize: 12, color: 'var(--on-surface-variant)', whiteSpace: 'nowrap' }}>{relTime(l.at)}</span>
            </div>
          ))}
      </Card>
    </div>
  );
}
