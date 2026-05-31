'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Icon, Button, Card, IconChip, Progress, Chip, Serif, Eyebrow } from '@/components/ui';
import { useUser, useToastCtx } from '../../layout';

export default function SubjectDetailPage() {
  const params = useParams();
  const [subject, setSubject] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const { refetchPinned } = useUser();
  const { flash } = useToastCtx();
  const [activeTab, setActiveTab] = useState<'materials' | 'tests' | 'resources'>('materials');

  useEffect(() => {
    fetch(`/api/subjects/${params.id}`).then(r => r.json()).then(setSubject);
    fetch('/api/user/subjects').then(r => r.json()).then(setUserData);
  }, [params.id]);

  const isPinned = (userData?.pinned || []).some((s: any) => s.id === subject?.id);

  const togglePin = async () => {
    await fetch(`/api/subjects/${subject.id}/pin`, { method: isPinned ? 'DELETE' : 'POST' });
    const d = await fetch('/api/user/subjects').then(r => r.json());
    setUserData(d);
    refetchPinned();
    flash(isPinned ? 'Predmet odopnutý' : 'Predmet pripnutý do sidebaru');
  };

  const prog = (userData?.progress || []).find((p: any) => p.subject_id === subject?.id);

  if (!subject) return <div style={{ padding: 48, color: 'var(--on-surface-variant)' }}>Načítavam…</div>;

  const typeColor: Record<string, any> = {
    PDF: { bg: 'var(--primary-fixed)', c: 'var(--primary)' },
    Video: { bg: '#dcedf5', c: '#1a6b8a' },
    Web: { bg: 'var(--tertiary-fixed)', c: 'var(--tertiary)' },
    Audio: { bg: 'var(--secondary-container)', c: 'var(--secondary)' },
    Notes: { bg: 'var(--primary-fixed)', c: 'var(--primary)' },
    Test: { bg: '#ffdad6', c: 'var(--error)' },
    Reading: { bg: 'var(--tertiary-fixed)', c: 'var(--tertiary)' },
    Guide: { bg: 'var(--secondary-container)', c: 'var(--secondary)' },
  };
  const diffColor: Record<string, any> = {
    Easy: { bg: '#dcf0d4', c: 'var(--success)' },
    Medium: { bg: 'var(--primary-fixed)', c: 'var(--primary)' },
    Hard: { bg: '#ffdad6', c: 'var(--error)' },
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 14, color: 'var(--on-surface-variant)' }}>
        <Link href="/subjects" style={{ color: 'var(--primary)', fontWeight: 600 }}>Predmety</Link>
        <Icon name="chevron_right" size={16} />
        <span>{subject.name_sk}</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 32 }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <IconChip name={subject.icon} size={64} radius={16} />
          <div>
            <Eyebrow>Maturitný predmet</Eyebrow>
            <Serif size={44} weight={700} style={{ display: 'block', margin: '8px 0 4px' }}>{subject.name_sk}</Serif>
            <div style={{ fontSize: 16, color: 'var(--on-surface-variant)' }}>{subject.description_sk}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button variant="secondary" icon={isPinned ? 'push_pin' : 'push_pin'} onClick={togglePin}
            style={{ background: isPinned ? 'var(--primary-fixed)' : undefined, color: isPinned ? 'var(--primary)' : undefined, borderColor: isPinned ? 'var(--primary)' : undefined }}>
            {isPinned ? 'Odopnúť' : 'Pripnúť'}
          </Button>
          <Button icon="play_arrow" onClick={() => flash('Spúšťam session…')}>Štartovať</Button>
        </div>
      </div>

      {/* Progress card */}
      {prog && (
        <Card pad={24} radius={12} style={{ marginBottom: 32, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginBottom: 4 }}>Pokrok kurzu</div>
            <Progress value={prog.progress_pct} right={prog.progress_pct + '%'} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginBottom: 4 }}>Hodiny štúdia</div>
            <Serif size={28} weight={700}>{prog.study_hours}h</Serif>
          </div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginBottom: 4 }}>Materiály</div>
            <Serif size={28} weight={700}>{subject.materials?.length || 0}</Serif>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--outline-variant)', marginBottom: 28 }}>
        {(['materials', 'tests', 'resources'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600, padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer', color: activeTab === t ? 'var(--primary)' : 'var(--on-surface-variant)', borderBottom: activeTab === t ? '2px solid var(--primary)' : '2px solid transparent', marginBottom: -1 }}>
            {t === 'materials' ? `Materiály (${subject.materials?.length || 0})` : t === 'tests' ? `Testy (${subject.tests?.length || 0})` : `Zdroje (${subject.resources?.length || 0})`}
          </button>
        ))}
      </div>

      {/* Materials */}
      {activeTab === 'materials' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {(subject.materials || []).map((m: any) => (
            <Link key={m.id} href={`/materials/${m.id}`} style={{ textDecoration: 'none' }}>
              <Card hover pad={20} radius={12} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', cursor: 'pointer' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: typeColor[m.type]?.bg || 'var(--primary-fixed)', color: typeColor[m.type]?.c || 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                  <Icon name={m.icon} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, gap: 8 }}>
                    <Chip tone="subject">{m.type}</Chip>
                    {m.is_new && <Chip tone="trend">Nové</Chip>}
                  </div>
                  <Serif size={17} weight={600} style={{ display: 'block', marginBottom: 6 }}>{m.title}</Serif>
                  <div style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>{m.meta}</div>
                </div>
              </Card>
            </Link>
          ))}
          {(!subject.materials || subject.materials.length === 0) && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 48, color: 'var(--on-surface-variant)', fontSize: 16 }}>
              <IconChip name="description" size={56} radius={14} style={{ margin: '0 auto 16px' }} />
              Pre tento predmet zatiaľ nie sú žiadne materiály.
            </div>
          )}
        </div>
      )}

      {/* Tests */}
      {activeTab === 'tests' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {(subject.tests || []).map((t: any) => (
            <Link key={t.id} href={`/tests/${t.id}`} style={{ textDecoration: 'none' }}>
              <Card hover pad={24} radius={12} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <IconChip name={t.icon} size={44} radius={10} />
                  <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 9999, background: diffColor[t.difficulty]?.bg, color: diffColor[t.difficulty]?.c }}>{t.difficulty}</span>
                </div>
                <Serif size={18} weight={600} style={{ display: 'block', marginBottom: 8 }}>{t.title}</Serif>
                <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginBottom: 16, display: 'flex', gap: 12 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="schedule" size={14} />{t.duration_minutes} min</span>
                </div>
                <Button variant="primary" full icon="play_arrow">Spustiť test</Button>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Resources */}
      {activeTab === 'resources' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {(subject.resources || []).map((r: any) => (
            <Link key={r.id} href={`/resources/${r.id}`} style={{ textDecoration: 'none' }}>
              <Card hover pad={20} radius={12} style={{ display: 'flex', gap: 16, cursor: 'pointer' }}>
                <IconChip name={r.icon} size={44} radius={10} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Chip tone="subject">{r.type}</Chip>
                    {r.badge && <Chip tone="trend">{r.badge}</Chip>}
                  </div>
                  <Serif size={16} weight={600} style={{ display: 'block', marginBottom: 4 }}>{r.title}</Serif>
                  <div style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>{r.description}</div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
