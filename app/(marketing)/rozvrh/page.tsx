'use client';
import { Icon, Button, Card, Serif, Eyebrow } from '@/components/ui';
import { BackLink } from '../_components';

const sessions = [
  { day: 'Pondelok', time: '08:00', dur: 90, subj: 'Matematika', topic: 'Integrálny počet – opakovanie', icon: 'calculate', color: 'var(--primary-fixed)', border: 'var(--primary)' },
  { day: 'Pondelok', time: '14:00', dur: 60, subj: 'Anglický jazyk', topic: 'Writing – esej', icon: 'language', color: '#dcedf5', border: '#1a6b8a' },
  { day: 'Utorok', time: '09:00', dur: 120, subj: 'Slovenský jazyk', topic: 'Národné obrodenie – opakovanie', icon: 'history_edu', color: 'var(--tertiary-fixed)', border: 'var(--tertiary)' },
  { day: 'Streda', time: '10:00', dur: 90, subj: 'Matematika', topic: 'Cvičný test – derivácie', icon: 'quiz', color: 'var(--primary-fixed)', border: 'var(--primary)' },
  { day: 'Štvrtok', time: '08:30', dur: 60, subj: 'Dejepis', topic: 'Svetové vojny', icon: 'public', color: 'var(--secondary-container)', border: 'var(--secondary)' },
  { day: 'Piatok', time: '15:00', dur: 90, subj: 'Biológia', topic: 'Genetika – Mendelove zákony', icon: 'science', color: '#dcf0d4', border: 'var(--success)' },
];

export default function RozvrhPage() {
  return (
    <div style={{ paddingTop: 48, paddingBottom: 80 }}>
      <BackLink />
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 40, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <Eyebrow>Študijný rozvrh</Eyebrow>
          <Serif size={52} weight={700} style={{ letterSpacing: '-.02em', display: 'block', margin: '8px 0', fontSize: 'clamp(34px, 7vw, 52px)' }}>Rozvrh</Serif>
          <div style={{ fontSize: 18, color: 'var(--on-surface-variant)' }}>Váš týždenný plán štúdia, optimalizovaný na maturitu.</div>
        </div>
        <Button icon="add">Pridať blok</Button>
      </header>
      <div className="mkb-split" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <Card pad={24} radius={12}>
          <Serif size={20} weight={600} style={{ display: 'block', marginBottom: 20 }}>Tento týždeň</Serif>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sessions.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 14px', borderRadius: 10, background: s.color, borderLeft: `3px solid ${s.border}` }}>
                <Icon name={s.icon} size={20} style={{ color: s.border, marginTop: 2 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--on-surface)' }}>{s.subj}</span>
                    <span style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{s.day} · {s.time} · {s.dur} min</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginTop: 2 }}>{s.topic}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card pad={24} radius={12}>
            <Serif size={18} weight={600} style={{ display: 'block', marginBottom: 16 }}>Nadchádzajúce skúšky</Serif>
            {[['12. 3.', 'Matematika', 'Ústna'], ['15. 3.', 'Slovenský jazyk', 'Písomná'], ['22. 3.', 'Anglický jazyk', 'Ústna']].map(([d, s, t]) => (
              <div key={d} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--outline-variant)' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary-fixed)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>{d.split('.')[0]}</span>
                </div>
                <div><div style={{ fontSize: 14, fontWeight: 600 }}>{s}</div><div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{t} skúška</div></div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
