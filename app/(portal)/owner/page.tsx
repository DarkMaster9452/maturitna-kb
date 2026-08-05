'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon, Button, Card, IconChip, Serif, Eyebrow, Chip } from '@/components/ui';
import { useUser, useToastCtx } from '../layout';

type UserRow = { id: string; name: string; email: string; role: string; created_at: string };

const ROLE_LABELS: Record<string, string> = { owner: 'Vlastník', admin: 'Administrátor', teacher: 'Učiteľ', student: 'Študent' };
const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  owner: { bg: 'var(--primary-fixed-dim)', color: 'var(--on-primary-fixed)' },
  admin: { bg: 'var(--primary-fixed)', color: 'var(--on-primary-fixed-variant)' },
  teacher: { bg: 'var(--secondary-fixed)', color: 'var(--secondary)' },
  student: { bg: 'var(--surface-container-high)', color: 'var(--on-surface-variant)' },
};

export default function OwnerPage() {
  const { user } = useUser();
  const { flash } = useToastCtx();
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('users');

  useEffect(() => {
    if (user && user.role !== 'owner') { router.push('/dashboard'); return; }
    fetch('/api/owner/users')
      .then(r => r.ok ? r.json() : [])
      .then(d => { setUsers(Array.isArray(d) ? d : d.users || []); setLoading(false); });
  }, [user]);

  const changeRole = async (userId: string, newRole: string) => {
    const res = await fetch('/api/owner/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role: newRole }),
    });
    if (res.ok) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      flash('Rola zmenená');
    } else {
      flash('Chyba pri zmene roly');
    }
  };

  const roleCounts = users.reduce((acc, u) => { acc[u.role] = (acc[u.role] || 0) + 1; return acc; }, {} as Record<string, number>);

  if (loading) return <div style={{ padding: 48, color: 'var(--on-surface-variant)' }}>Načítavam…</div>;

  return (
    <div>
      <header style={{ marginBottom: 32 }}>
        <Eyebrow>Vlastník</Eyebrow>
        <Serif size={40} weight={700} style={{ display: 'block', margin: '8px 0' }}>Správa systému</Serif>
        <div style={{ fontSize: 17, color: 'var(--on-surface-variant)' }}>Kompletná správa používateľov a systému.</div>
      </header>

      {/* Role stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        {(['owner', 'admin', 'teacher', 'student'] as const).map(role => (
          <Card key={role} pad={20} radius={12}>
            <div style={{ fontSize: 32, fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--primary)' }}>
              {roleCounts[role] || 0}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--on-surface-variant)', marginTop: 4 }}>
              {ROLE_LABELS[role]}
            </div>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--outline-variant)', marginBottom: 28 }}>
        {[['users', 'Používatelia'], ['system', 'Systém']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600, padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer', color: tab === id ? 'var(--primary)' : 'var(--on-surface-variant)', borderBottom: tab === id ? '2px solid var(--primary)' : '2px solid transparent', marginBottom: -1 }}>{label}</button>
        ))}
      </div>

      {tab === 'users' && (
        <Card pad={24} radius={12}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <Serif size={20} weight={600}>Všetci používatelia</Serif>
            <Button icon="person_add" onClick={() => flash('Pozývanie používateľov – čoskoro')}>Pozvať</Button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--outline-variant)' }}>
                {['Meno', 'E-mail', 'Rola', 'Registrovaný', ''].map(h => (
                  <th key={h} style={{ fontSize: 13, fontWeight: 600, color: 'var(--on-surface-variant)', padding: '0 0 10px', textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => {
                const rc = ROLE_COLORS[u.role] || ROLE_COLORS.student;
                return (
                  <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? '1px solid var(--outline-variant)' : 'none' }}>
                    <td style={{ padding: '12px 0', fontSize: 14, fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--primary-fixed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--primary)', flex: 'none' }}>
                          {u.name?.[0] || '?'}
                        </div>
                        {u.name}
                      </div>
                    </td>
                    <td style={{ padding: '12px 0', color: 'var(--on-surface-variant)', fontSize: 13 }}>{u.email}</td>
                    <td style={{ padding: '12px 0' }}>
                      <span style={{ ...rc, fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 9999 }}>
                        {ROLE_LABELS[u.role] || u.role}
                      </span>
                    </td>
                    <td style={{ padding: '12px 0', fontSize: 12, color: 'var(--on-surface-variant)' }}>
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('sk-SK') : '—'}
                    </td>
                    <td style={{ padding: '12px 0' }}>
                      {u.id !== user?.id && (
                        <select
                          value={u.role}
                          onChange={e => changeRole(u.id, e.target.value)}
                          style={{ fontFamily: 'var(--font-sans)', fontSize: 12, padding: '4px 8px', borderRadius: 6, border: '1px solid var(--outline-variant)', background: 'var(--surface-container-low)', color: 'var(--on-surface)', cursor: 'pointer' }}>
                          {['student', 'teacher', 'admin', 'owner'].map(r => (
                            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {tab === 'system' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <Card pad={24} radius={12}>
            <Serif size={18} weight={600} style={{ display: 'block', marginBottom: 16 }}>Nastavenia systému</Serif>
            {[
              ['Zálohovanie databázy', 'backup'],
              ['Export všetkých dát', 'download'],
              ['Audit log', 'history'],
              ['Správa API kľúčov', 'key'],
            ].map(([label, icon]) => (
              <button key={label} onClick={() => flash(`${label}…`)} style={{ fontFamily: 'var(--font-sans)', width: '100%', fontSize: 14, fontWeight: 500, padding: '10px 14px', borderRadius: 8, border: '1px solid var(--outline-variant)', background: 'var(--surface-container-lowest)', color: 'var(--on-surface)', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 8, transition: 'border-color .2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--outline-variant)'}>
                <Icon name={icon} size={16} style={{ color: 'var(--primary)' }} />{label}
              </button>
            ))}
          </Card>
          <Card pad={24} radius={12}>
            <Serif size={18} weight={600} style={{ display: 'block', marginBottom: 16 }}>Info o systéme</Serif>
            {[
              ['Verzia', 'v1.0.0'],
              ['Databáza', 'NeonDB PostgreSQL'],
              ['Autentifikácia', 'JWT (HS256, 7d)'],
              ['Prostredie', process.env.NODE_ENV || 'production'],
            ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--outline-variant)', fontSize: 13 }}>
                <span style={{ color: 'var(--on-surface-variant)' }}>{label}</span>
                <span style={{ fontWeight: 600 }}>{val}</span>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}
