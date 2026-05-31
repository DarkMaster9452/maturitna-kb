'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon, Button, Card, IconChip, Serif, Eyebrow } from '@/components/ui';

type Subject = { id: string; slug: string; name_sk: string; icon: string; description_sk: string };

export default function OnboardingPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/subjects').then(r => r.json()).then(setSubjects);
  }, []);

  const toggle = (id: string) => {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const handleSave = async () => {
    if (selected.size < 1) return;
    setLoading(true);
    await fetch('/api/user/subjects', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subjectIds: Array.from(selected) }) });
    router.push('/dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
      <div style={{ width: '100%', maxWidth: 800 }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--primary-fixed)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Icon name="school" size={32} fill={1} style={{ color: 'var(--primary)' }} />
          </div>
          <Eyebrow>Krok 1 z 1</Eyebrow>
          <Serif size={40} weight={700} style={{ display: 'block', margin: '12px 0 8px' }}>Vyber si svoje predmety</Serif>
          <p style={{ fontSize: 17, color: 'var(--on-surface-variant)', maxWidth: 520, margin: '0 auto' }}>
            Označ predmety, ktoré budeš maturovať. Môžeš ich kedykoľvek zmeniť v nastaveniach.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 40 }}>
          {subjects.map(s => {
            const isSelected = selected.has(s.id);
            return (
              <div key={s.id} onClick={() => toggle(s.id)} style={{ padding: 20, borderRadius: 12, border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--outline-variant)'}`, background: isSelected ? 'var(--primary-fixed)' : 'var(--surface-container-lowest)', cursor: 'pointer', transition: 'all .2s', position: 'relative' }}>
                {isSelected && (
                  <div style={{ position: 'absolute', top: 12, right: 12, width: 24, height: 24, borderRadius: 9999, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="check" size={14} style={{ color: '#fff' }} />
                  </div>
                )}
                <IconChip name={s.icon} size={44} radius={10} bg={isSelected ? 'rgba(132,79,34,.15)' : 'var(--primary-fixed)'} />
                <Serif size={17} weight={600} style={{ display: 'block', margin: '12px 0 6px' }}>{s.name_sk}</Serif>
                <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', lineHeight: 1.4 }}>{s.description_sk}</div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 15, color: 'var(--on-surface-variant)' }}>
            Vybrané: <strong style={{ color: 'var(--primary)' }}>{selected.size}</strong> predmetov
          </div>
          <Button onClick={handleSave} disabled={loading || selected.size === 0} iconAfter="chevron_right">
            {loading ? 'Ukladám…' : 'Pokračovať na portál'}
          </Button>
        </div>
      </div>
    </div>
  );
}
