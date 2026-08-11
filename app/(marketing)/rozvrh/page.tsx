'use client';
import { Icon, Button, Card, Serif, Eyebrow, Chip } from '@/components/ui';
import { BackLink } from '../_components';

const sessions = [
  { day: 'Pondelok', time: '08:00', dur: 90, subj: 'Matematika', topic: 'Integrálny počet – opakovanie', icon: 'calculate', bg: 'var(--primary-fixed)', c: 'var(--primary)' },
  { day: 'Pondelok', time: '14:00', dur: 60, subj: 'Anglický jazyk', topic: 'Writing – esej', icon: 'language', bg: 'var(--tertiary-fixed)', c: 'var(--tertiary)' },
  { day: 'Utorok', time: '09:00', dur: 120, subj: 'Slovenský jazyk', topic: 'Národné obrodenie – opakovanie', icon: 'history_edu', bg: 'var(--secondary-fixed)', c: 'var(--secondary)' },
  { day: 'Streda', time: '10:00', dur: 90, subj: 'Matematika', topic: 'Cvičný test – derivácie', icon: 'quiz', bg: 'var(--warning-container)', c: 'var(--warning)' },
  { day: 'Štvrtok', time: '08:30', dur: 60, subj: 'Dejepis', topic: 'Svetové vojny', icon: 'public', bg: 'var(--primary-fixed)', c: 'var(--primary)' },
  { day: 'Piatok', time: '15:00', dur: 90, subj: 'Biológia', topic: 'Genetika – Mendelove zákony', icon: 'science', bg: 'var(--success-container)', c: 'var(--success)' },
];

const exams = [['12. 3.', 'Matematika', 'Ústna'], ['15. 3.', 'Slovenský jazyk', 'Písomná'], ['22. 3.', 'Anglický jazyk', 'Ústna']];

export default function RozvrhPage() {
  const totalMin = sessions.reduce((a, s) => a + s.dur, 0);
  return (
    <div style={{ paddingTop: 40, paddingBottom: 80 }}>
      <BackLink />
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 32, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <Eyebrow icon="calendar_month">Študijný rozvrh</Eyebrow>
          <Serif size={52} weight={700} style={{ display: 'block', margin: '10px 0', fontSize: 'clamp(34px, 7vw, 52px)' }}>Rozvrh</Serif>
          <div style={{ fontSize: 18, color: 'var(--on-surface-variant)' }}>Ukážka týždenného plánu štúdia, optimalizovaného na maturitu.</div>
        </div>
        <Button icon="add">Pridať blok</Button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }} className="mkb-3up">
        {[['event', `${sessions.length}`, 'Blokov tento týždeň'], ['schedule', `${Math.round(totalMin / 60)} h`, 'Naplánovaný čas'], ['flag', `${exams.length}`, 'Nadchádzajúce skúšky']].map(([ic, v, l]) => (
          <Card key={l as string} pad={20} glow>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary-fixed)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name={ic as string} size={23} fill={1} /></div>
              <div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 700, lineHeight: 1 }}>{v}</div>
                <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginTop: 3 }}>{l}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mkb-split" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <Card pad={24}>
          <Serif size={22} weight={600} style={{ display: 'block', marginBottom: 20 }}>Tento týždeň</Serif>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sessions.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, padding: '14px 16px', borderRadius: 14, background: 'var(--surface-container-low)', border: '1px solid var(--outline-variant)' }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: s.bg, color: s.c, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                  <Icon name={s.icon} size={22} fill={1} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--on-surface)' }}>{s.subj}</span>
                    <span style={{ fontSize: 12.5, color: 'var(--on-surface-variant)', fontWeight: 500 }}>{s.day} · {s.time} · {s.dur} min</span>
                  </div>
                  <div style={{ fontSize: 13.5, color: 'var(--on-surface-variant)', marginTop: 3 }}>{s.topic}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card pad={24}>
            <Serif size={19} weight={600} style={{ display: 'block', marginBottom: 16 }}>Nadchádzajúce skúšky</Serif>
            {exams.map(([d, s, t], i) => (
              <div key={d} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '12px 0', borderBottom: i < exams.length - 1 ? '1px solid var(--outline-variant)' : 'none' }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: 'var(--primary-fixed)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 'none', lineHeight: 1 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary)' }}>{d.split('.')[0]}</span>
                  <span style={{ fontSize: 9.5, color: 'var(--on-primary-fixed-variant)', fontWeight: 600 }}>MAR</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600 }}>{s}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--on-surface-variant)' }}>{t} skúška</div>
                </div>
                <Chip tone="soft">{t}</Chip>
              </div>
            ))}
          </Card>
          <Card pad={22} style={{ background: 'var(--panel-ink)', border: 'none' }}>
            <Serif size={18} weight={600} style={{ color: '#fff', display: 'block', marginBottom: 8 }}>Plánuj chytro</Serif>
            <div style={{ fontSize: 14, color: 'var(--panel-ink-variant)', lineHeight: 1.55, marginBottom: 4 }}>
              Rozdeľ si učenie na kratšie bloky a strieda predmety — pomáha to pamäti viac než dlhé nárazové sedenia.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
