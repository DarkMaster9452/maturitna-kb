'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icon, Button, Card, IconChip, Progress, Chip, Serif, Eyebrow } from '@/components/ui';
import { useUser, useToastCtx } from '../layout';

export default function SubjectsPage() {
  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const { user, refetchPinned } = useUser();
  const { flash } = useToastCtx();

  useEffect(() => {
    fetch('/api/subjects').then(r => r.json()).then(setAllSubjects);
    fetch('/api/user/subjects').then(r => r.json()).then(setUserData);
  }, []);

  const selectedIds = new Set((userData?.selected || []).map((s: any) => s.id));
  const pinnedIds = new Set((userData?.pinned || []).map((s: any) => s.id));

  const togglePin = async (subjectId: string) => {
    const isPinned = pinnedIds.has(subjectId);
    await fetch(`/api/subjects/${subjectId}/pin`, { method: isPinned ? 'DELETE' : 'POST' });
    const d = await fetch('/api/user/subjects').then(r => r.json());
    setUserData(d);
    refetchPinned();
    flash(isPinned ? 'Predmet odopnutý zo sidebaru' : 'Predmet pripnutý do sidebaru');
  };

  const toggleSelect = async (subjectId: string) => {
    const current = (userData?.selected || []).map((s: any) => s.id);
    const newIds = current.includes(subjectId) ? current.filter((id: string) => id !== subjectId) : [...current, subjectId];
    await fetch('/api/user/subjects', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subjectIds: newIds }) });
    const d = await fetch('/api/user/subjects').then(r => r.json());
    setUserData(d);
    flash(current.includes(subjectId) ? 'Predmet odobratý' : 'Predmet pridaný do tvojho plánu');
  };

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 40 }}>
        <div>
          <Eyebrow>Maturitné predmety</Eyebrow>
          <Serif size={52} weight={700} style={{ letterSpacing: '-.02em', display: 'block', margin: '8px 0' }}>Predmety</Serif>
          <div style={{ fontSize: 18, color: 'var(--on-surface-variant)' }}>Vyber predmety, ktoré maturuješ, a pripni ich do sidebaru.</div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Chip tone="soft">{(userData?.selected || []).length} vybraných</Chip>
          <Chip tone="trend">{(userData?.pinned || []).length} pripnutých</Chip>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
        {allSubjects.map(s => {
          const isSelected = selectedIds.has(s.id);
          const isPinned = pinnedIds.has(s.id);
          const prog = (userData?.progress || []).find((p: any) => p.subject_id === s.id);
          return (
            <Card key={s.id} pad={24} radius={12} style={{ border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--outline-variant)'}`, transition: 'border-color .2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                <IconChip name={s.icon} size={48} radius={12} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => togglePin(s.id)} title={isPinned ? 'Odopnúť' : 'Pripnúť do sidebaru'}
                    style={{ width: 32, height: 32, borderRadius: 8, background: isPinned ? 'var(--primary-fixed)' : 'var(--surface-container)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isPinned ? 'var(--primary)' : 'var(--on-surface-variant)', transition: 'all .2s' }}>
                    <Icon name="push_pin" size={16} fill={isPinned ? 1 : 0} />
                  </button>
                  <button onClick={() => toggleSelect(s.id)} title={isSelected ? 'Odstrániť z plánu' : 'Pridať do plánu'}
                    style={{ width: 32, height: 32, borderRadius: 8, background: isSelected ? 'var(--primary)' : 'var(--surface-container)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isSelected ? '#fff' : 'var(--on-surface-variant)', transition: 'all .2s' }}>
                    <Icon name={isSelected ? 'check' : 'add'} size={16} />
                  </button>
                </div>
              </div>

              <Serif size={20} weight={600} style={{ display: 'block', marginBottom: 8 }}>{s.name_sk}</Serif>
              <div style={{ fontSize: 14, color: 'var(--on-surface-variant)', marginBottom: 20, lineHeight: 1.5 }}>{s.description_sk}</div>

              {prog && <Progress value={prog.progress_pct} label="Pokrok" right={prog.progress_pct + '%'} height={6} />}

              <Link href={`/subjects/${s.slug}`}>
                <Button variant="ghost" iconAfter="arrow_forward" style={{ marginTop: 16, padding: '8px 0', width: '100%', justifyContent: 'flex-start' }}>
                  Otvoriť predmet
                </Button>
              </Link>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
