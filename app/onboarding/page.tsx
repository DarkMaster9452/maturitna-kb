'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon, Button, IconChip, Serif, Eyebrow, ModeToggle } from '@/components/ui';

type Subject = { id: string; slug: string; name_sk: string; icon: string; description_sk: string };

export default function OnboardingPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/subjects').then(r => r.json()).then(d => setSubjects(Array.isArray(d) ? d : []));
  }, []);

  const toggle = (id: string) => setSelected(prev => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
  });

  const handleSave = async () => {
    if (selected.size < 1) return;
    setLoading(true);
    await fetch('/api/user/subjects', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subjectIds: Array.from(selected) }) });
    router.push('/dashboard');
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 'clamp(24px, 5vw, 56px)', position: 'relative',
      background: `radial-gradient(60% 45% at 15% 0%, color-mix(in srgb, var(--primary) 14%, transparent), transparent 70%), radial-gradient(50% 40% at 90% 8%, color-mix(in srgb, var(--tertiary) 14%, transparent), transparent 70%), var(--background)`,
    }}>
      <div style={{ position: 'absolute', top: 20, right: 20 }}><ModeToggle /></div>
      <div style={{ width: '100%', maxWidth: 820 }} className="mkb-fade-up">
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 68, height: 68, borderRadius: 20, backgroundImage: 'var(--grad-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px', boxShadow: '0 12px 30px -12px color-mix(in srgb, var(--primary) 60%, transparent)' }}>
            <Icon name="school" size={34} fill={1} style={{ color: '#fff' }} />
          </div>
          <Eyebrow>Krok 1 z 1</Eyebrow>
          <Serif size={40} weight={700} style={{ display: 'block', margin: '12px 0 8px', fontSize: 'clamp(28px, 5vw, 40px)' }}>Vyber si svoje predmety</Serif>
          <p style={{ fontSize: 16.5, color: 'var(--on-surface-variant)', maxWidth: 520, margin: '0 auto', lineHeight: 1.6 }}>
            Označ predmety, ktoré budeš maturovať. Môžeš ich kedykoľvek zmeniť v nastaveniach.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 14, marginBottom: 32 }}>
          {subjects.map(s => {
            const on = selected.has(s.id);
            return (
              <div key={s.id} onClick={() => toggle(s.id)} style={{
                padding: 20, borderRadius: 16, cursor: 'pointer', transition: 'all .2s', position: 'relative',
                border: `2px solid ${on ? 'var(--primary)' : 'var(--outline-variant)'}`,
                background: on ? 'var(--primary-fixed)' : 'var(--surface-container-lowest)',
                boxShadow: on ? 'var(--shadow-card)' : 'none',
              }}>
                {on && (
                  <div style={{ position: 'absolute', top: 12, right: 12, width: 24, height: 24, borderRadius: 9999, backgroundImage: 'var(--grad-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="check" size={15} style={{ color: '#fff' }} />
                  </div>
                )}
                <IconChip name={s.icon} size={44} radius={12} grad={on} />
                <Serif size={17} weight={600} style={{ display: 'block', margin: '14px 0 6px' }}>{s.name_sk}</Serif>
                <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', lineHeight: 1.45 }}>{s.description_sk}</div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', position: 'sticky', bottom: 20, background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 16, padding: '14px 20px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ fontSize: 15, color: 'var(--on-surface-variant)' }}>
            Vybrané: <strong style={{ color: 'var(--primary)' }}>{selected.size}</strong> {selected.size === 1 ? 'predmet' : selected.size < 5 ? 'predmety' : 'predmetov'}
          </div>
          <Button onClick={handleSave} disabled={loading || selected.size === 0} iconAfter="arrow_forward" size="lg">
            {loading ? 'Ukladám…' : 'Pokračovať na portál'}
          </Button>
        </div>
      </div>
    </div>
  );
}
