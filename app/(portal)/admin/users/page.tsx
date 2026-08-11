'use client';
import { useState, useEffect, useMemo } from 'react';
import { Icon, Button, Card, Serif, Chip, Avatar, Progress, EmptyState, Input, StatCard } from '@/components/ui';
import { Counter } from '@/components/motion';
import { useUser, useToastCtx } from '../../layout';
import { AdminHeader, ROLE_META, SearchBox, FilterPills } from '../_shared';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sort, setSort] = useState<'recent' | 'progress' | 'tests' | 'name'>('recent');
  const [edit, setEdit] = useState<any>(null);
  const { user } = useUser();
  const { flash } = useToastCtx();

  useEffect(() => {
    fetch('/api/admin/users').then(r => r.json()).then(d => { setUsers(d.users || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const saveEdit = async () => {
    const res = await fetch(`/api/admin/users/${edit.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: edit.name, email: edit.email, role: edit.role }) });
    const d = await res.json();
    if (!res.ok) { flash(d.error || 'Chyba'); return; }
    setUsers(us => us.map(u => u.id === edit.id ? { ...u, name: edit.name, email: edit.email, role: edit.role } : u));
    setEdit(null); flash('Používateľ upravený');
  };
  const changeRole = async (id: string, role: string) => {
    setUsers(us => us.map(u => u.id === id ? { ...u, role } : u));
    const res = await fetch(`/api/admin/users/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role }) });
    if (!res.ok) { const d = await res.json(); flash(d.error || 'Chyba'); fetch('/api/admin/users').then(r => r.json()).then(d => setUsers(d.users || [])); } else flash('Rola zmenená');
  };
  const deleteUser = async (id: string, name: string) => {
    if (!confirm(`Naozaj zmazať používateľa ${name}? Táto akcia je nevratná.`)) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    if (res.ok) { setUsers(us => us.filter(u => u.id !== id)); setEdit(null); flash(`${name} zmazaný`); }
    else { const d = await res.json(); flash(d.error || 'Chyba'); }
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = { student: 0, teacher: 0, admin: 0, owner: 0 };
    users.forEach(u => { c[u.role] = (c[u.role] || 0) + 1; });
    return c;
  }, [users]);

  const filteredUsers = useMemo(() => {
    let list = users.filter(u =>
      (roleFilter === 'all' || u.role === roleFilter) &&
      (!search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())));
    const by: Record<string, (a: any, b: any) => number> = {
      recent: (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      progress: (a, b) => Number(b.avg_progress) - Number(a.avg_progress),
      tests: (a, b) => Number(b.tests_count) - Number(a.tests_count),
      name: (a, b) => (a.name || '').localeCompare(b.name || ''),
    };
    return [...list].sort(by[sort]);
  }, [users, roleFilter, search, sort]);

  return (
    <div>
      <AdminHeader eyebrow="Správa" title="Používatelia" desc="Spravuj kohokoľvek — role, údaje aj prístup. Filtre a hľadanie pre rýchlu orientáciu."
        action={<Chip tone="soft" icon="group">{users.length} spolu</Chip>} />

      {/* Role summary tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 22 }}>
        <StatCard icon="person" label="Študenti" value={<Counter value={counts.student} />} tone="tertiary" />
        <StatCard icon="co_present" label="Učitelia" value={<Counter value={counts.teacher} />} tone="success" />
        <StatCard icon="shield_person" label="Administrátori" value={<Counter value={counts.admin} />} tone="primary" />
        <StatCard icon="workspace_premium" label="Vlastníci" value={<Counter value={counts.owner} />} tone="warning" />
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 18, alignItems: 'center', flexWrap: 'wrap' }}>
        <SearchBox value={search} onChange={setSearch} placeholder="Hľadať meno alebo e-mail…" />
        <FilterPills value={roleFilter} onChange={setRoleFilter} options={[['all', `Všetci (${users.length})`], ['student', ROLE_META.student.label], ['teacher', ROLE_META.teacher.label], ['admin', ROLE_META.admin.label], ['owner', ROLE_META.owner.label]]} />
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: 'var(--on-surface-variant)', fontWeight: 600 }}>Zoradiť</span>
          <select value={sort} onChange={e => setSort(e.target.value as any)}
            style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, padding: '8px 12px', borderRadius: 10, border: '1px solid var(--outline-variant)', background: 'var(--surface-container-lowest)', color: 'var(--on-surface)', cursor: 'pointer' }}>
            <option value="recent">Najnovší</option>
            <option value="progress">Najvyšší pokrok</option>
            <option value="tests">Najviac testov</option>
            <option value="name">Podľa mena</option>
          </select>
        </div>
      </div>

      <Card pad={0} style={{ overflow: 'hidden' }}>
        {loading ? <div style={{ padding: 40 }}><div className="mkb-skeleton" style={{ height: 200, borderRadius: 12 }} /></div> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
              <thead><tr style={{ borderBottom: '1px solid var(--outline-variant)' }}>{['Používateľ', 'Rola', 'Predmety', 'Testy', 'Pokrok', 'Registrácia', ''].map(h => <th key={h} style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--on-surface-variant)', padding: '12px 20px', textAlign: 'left' }}>{h}</th>)}</tr></thead>
              <tbody>
                {filteredUsers.map((u, i) => (
                  <tr key={u.id} style={{ borderBottom: i < filteredUsers.length - 1 ? '1px solid var(--outline-variant)' : 'none' }}>
                    <td style={{ padding: '12px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                        <Avatar name={u.name} size={36} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>{u.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 20px' }}>
                      <select value={u.role} onChange={e => changeRole(u.id, e.target.value)} disabled={u.id === user?.id}
                        style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, padding: '6px 10px', borderRadius: 8, border: '1px solid var(--outline-variant)', background: 'var(--surface-container-low)', color: 'var(--on-surface)', cursor: u.id === user?.id ? 'not-allowed' : 'pointer' }}>
                        {['student', 'teacher', 'admin', 'owner'].map(r => <option key={r} value={r}>{ROLE_META[r].label}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '12px 20px', fontSize: 14 }}>{u.subjects_count}</td>
                    <td style={{ padding: '12px 20px', fontSize: 14 }}>{u.tests_count}</td>
                    <td style={{ padding: '12px 20px', width: 130 }}><Progress value={Number(u.avg_progress)} right={Number(u.avg_progress) + '%'} height={6} /></td>
                    <td style={{ padding: '12px 20px', fontSize: 12, color: 'var(--on-surface-variant)' }}>{new Date(u.created_at).toLocaleDateString('sk-SK')}</td>
                    <td style={{ padding: '12px 20px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => setEdit({ ...u })} title="Upraviť" style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--outline-variant)', background: 'var(--surface-container-lowest)', color: 'var(--on-surface-variant)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="edit" size={16} /></button>
                        <button onClick={() => deleteUser(u.id, u.name)} disabled={u.id === user?.id} title="Zmazať"
                          style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--outline-variant)', background: 'var(--surface-container-lowest)', color: 'var(--on-surface-variant)', cursor: u.id === user?.id ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: u.id === user?.id ? .4 : 1 }}><Icon name="delete" size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && <EmptyState icon="person_search" title="Nič sa nenašlo" desc="Skús iný filter alebo výraz." />}
          </div>
        )}
      </Card>

      {/* Edit modal */}
      {edit && (
        <div onClick={() => setEdit(null)} style={{ position: 'fixed', inset: 0, zIndex: 600, background: 'rgba(6,6,8,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, animation: 'mkb-fade-in .2s ease' }}>
          <div onClick={e => e.stopPropagation()} className="mkb-fade-up" style={{ width: '100%', maxWidth: 440, background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 18, padding: 26, boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <Avatar name={edit.name} size={44} />
              <div><Serif size={20} weight={600} style={{ display: 'block' }}>Upraviť používateľa</Serif></div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Input label="Meno" value={edit.name} onChange={e => setEdit({ ...edit, name: e.target.value })} icon="person" />
              <Input label="E-mail" type="email" value={edit.email} onChange={e => setEdit({ ...edit, email: e.target.value })} icon="mail" />
              <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--on-surface-variant)' }}>Rola</span>
                <select value={edit.role} onChange={e => setEdit({ ...edit, role: e.target.value })} disabled={edit.id === user?.id}
                  style={{ fontFamily: 'var(--font-sans)', fontSize: 14, padding: '11px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--outline-variant)', background: 'var(--surface-container-low)', color: 'var(--on-surface)' }}>
                  {['student', 'teacher', 'admin', 'owner'].map(r => <option key={r} value={r}>{ROLE_META[r].label}</option>)}
                </select>
              </label>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 22, justifyContent: 'space-between' }}>
              <Button variant="danger" icon="delete" onClick={() => deleteUser(edit.id, edit.name)} disabled={edit.id === user?.id}>Zmazať</Button>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button variant="secondary" onClick={() => setEdit(null)}>Zrušiť</Button>
                <Button icon="save" onClick={saveEdit}>Uložiť</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
