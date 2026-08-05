'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon, Button, Card, IconChip, Serif, Eyebrow, Chip } from '@/components/ui';
import { useUser, useToastCtx } from '../layout';

export default function TeacherPage() {
  const { user } = useUser();
  const { flash } = useToastCtx();
  const router = useRouter();
  const [materials, setMaterials] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [tab, setTab] = useState('materials');

  useEffect(() => {
    if (user && !['teacher', 'admin', 'owner'].includes(user.role)) {
      router.push('/dashboard');
      return;
    }
    fetch('/api/materials').then(r => r.json()).then(d => setMaterials(d.materials || []));
    fetch('/api/subjects').then(r => r.json()).then(setSubjects);
  }, [user]);

  const quickActions = [
    { icon: 'upload_file', label: 'Nahrať materiál', sub: 'PDF, video, odkaz' },
    { icon: 'quiz', label: 'Vytvoriť test', sub: 'Nový kvíz pre predmet' },
    { icon: 'people', label: 'Moji študenti', sub: 'Prehľad pokroku triedy' },
  ];

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <Eyebrow>Učiteľský panel</Eyebrow>
          <Serif size={40} weight={700} style={{ display: 'block', margin: '8px 0' }}>Správa obsahu</Serif>
          <div style={{ fontSize: 17, color: 'var(--on-surface-variant)' }}>Spravuj materiály a testy pre svojich študentov.</div>
        </div>
        <Button icon="add" onClick={() => flash('Otvára sa editor obsahu…')}>Pridať obsah</Button>
      </header>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {quickActions.map(a => (
          <Card key={a.label} hover pad={20} radius={12} onClick={() => flash(`${a.label}…`)}>
            <IconChip name={a.icon} size={44} bg="var(--primary-fixed)" color="var(--primary)" radius={10} />
            <div style={{ marginTop: 12, fontWeight: 700, fontSize: 15, fontFamily: 'var(--font-sans)' }}>{a.label}</div>
            <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginTop: 4 }}>{a.sub}</div>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--outline-variant)', marginBottom: 28 }}>
        {[['materials', 'Materiály'], ['tests', 'Testy'], ['subjects', 'Predmety']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600, padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer', color: tab === id ? 'var(--primary)' : 'var(--on-surface-variant)', borderBottom: tab === id ? '2px solid var(--primary)' : '2px solid transparent', marginBottom: -1 }}>{label}</button>
        ))}
      </div>

      {tab === 'materials' && (
        <Card pad={24} radius={12}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <Serif size={20} weight={600}>Všetky materiály</Serif>
            <Button icon="add" onClick={() => flash('Otvára sa editor materiálu…')}>Pridať</Button>
          </div>
          {materials.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--on-surface-variant)' }}>
              <Icon name="upload_file" size={48} style={{ opacity: 0.25, display: 'block', margin: '0 auto 12px' }} />
              <div style={{ fontSize: 15, fontWeight: 600 }}>Žiadne materiály</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Nahraj prvý materiál pre svojich študentov.</div>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--outline-variant)' }}>
                  {['Názov', 'Predmet', 'Typ', 'Dátum', ''].map(h => (
                    <th key={h} style={{ fontSize: 13, fontWeight: 600, color: 'var(--on-surface-variant)', padding: '0 0 10px', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {materials.slice(0, 15).map((m: any, i: number) => (
                  <tr key={m.id} style={{ borderBottom: i < Math.min(materials.length, 15) - 1 ? '1px solid var(--outline-variant)' : 'none' }}>
                    <td style={{ padding: '12px 0', fontSize: 14, fontWeight: 600 }}>{m.title}</td>
                    <td style={{ padding: '12px 0' }}><Chip tone="subject">{m.subject_name || '—'}</Chip></td>
                    <td style={{ padding: '12px 0' }}><Chip tone="neutral">{m.type || 'PDF'}</Chip></td>
                    <td style={{ padding: '12px 0', fontSize: 12, color: 'var(--on-surface-variant)' }}>
                      {new Date(m.created_at).toLocaleDateString('sk-SK')}
                    </td>
                    <td style={{ padding: '12px 0' }}>
                      <button onClick={() => flash('Upravujem…')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: 4 }}>
                        <Icon name="edit" size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {tab === 'tests' && (
        <Card pad={24} radius={12}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <Serif size={20} weight={600}>Moje testy</Serif>
            <Button icon="add" onClick={() => flash('Otvára sa tvorba testu…')}>Vytvoriť test</Button>
          </div>
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--on-surface-variant)' }}>
            <Icon name="quiz" size={48} style={{ opacity: 0.25, display: 'block', margin: '0 auto 12px' }} />
            <div style={{ fontSize: 15, fontWeight: 600 }}>Vytvor prvý test</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Testy si môžu robiť všetci tví študenti.</div>
          </div>
        </Card>
      )}

      {tab === 'subjects' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {subjects.map((s: any) => (
            <Card key={s.id} hover pad={20} radius={12}>
              <IconChip name={s.icon} size={40} radius={8} />
              <div style={{ marginTop: 12, fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-sans)' }}>{s.name_sk}</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
