'use client';
import { Serif, Eyebrow, Icon } from '@/components/ui';

export const ROLE_META: Record<string, { label: string; tone: string; icon: string }> = {
  student: { label: 'Študent', tone: 'soft', icon: 'person' },
  teacher: { label: 'Učiteľ', tone: 'success', icon: 'co_present' },
  admin: { label: 'Administrátor', tone: 'trend', icon: 'shield_person' },
  owner: { label: 'Vlastník', tone: 'warning', icon: 'workspace_premium' },
};

export const LOG_ICON: Record<string, string> = { test: 'fact_check', user: 'person_add', note: 'edit_note', session: 'timer' };

export const relTime = (d: string) => {
  if (!d) return '';
  const diff = (Date.now() - new Date(d).getTime()) / 1000;
  if (diff < 60) return 'práve teraz';
  if (diff < 3600) return `pred ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `pred ${Math.floor(diff / 3600)} h`;
  return `pred ${Math.floor(diff / 86400)} dňami`;
};

export function AdminHeader({ eyebrow, title, desc, action }: { eyebrow: string; title: string; desc: string; action?: React.ReactNode }) {
  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap', marginBottom: 26 }}>
      <div>
        <Eyebrow icon="shield_person">{eyebrow}</Eyebrow>
        <Serif size={40} weight={700} style={{ display: 'block', margin: '10px 0', fontSize: 'clamp(26px, 5vw, 40px)' }}>{title}</Serif>
        <div style={{ fontSize: 16.5, color: 'var(--on-surface-variant)' }}>{desc}</div>
      </div>
      {action}
    </header>
  );
}

/* Search field with leading icon */
export function SearchBox({ value, onChange, placeholder, width = 340 }: { value: string; onChange: (v: string) => void; placeholder: string; width?: number }) {
  return (
    <div style={{ position: 'relative', flex: `1 1 240px`, maxWidth: width }}>
      <Icon name="search" size={18} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--on-surface-variant)' }} />
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ fontFamily: 'var(--font-sans)', fontSize: 14, background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius)', padding: '10px 14px 10px 40px', color: 'var(--on-surface)', outline: 'none', width: '100%' }}
        onFocus={e => { e.target.style.borderColor = 'var(--primary)'; }}
        onBlur={e => { e.target.style.borderColor = 'var(--outline-variant)'; }} />
    </div>
  );
}

/* Pill-style filter group */
export function FilterPills({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {options.map(([id, label]) => (
        <button key={id} onClick={() => onChange(id)}
          style={{ fontSize: 13, fontWeight: 600, cursor: 'pointer', borderRadius: 9999, padding: '7px 14px', border: `1px solid ${value === id ? 'var(--primary)' : 'var(--outline-variant)'}`, background: value === id ? 'var(--primary-fixed)' : 'var(--surface-container-lowest)', color: value === id ? 'var(--on-primary-fixed-variant)' : 'var(--on-surface-variant)', transition: 'background .18s, border-color .18s' }}>
          {label}
        </button>
      ))}
    </div>
  );
}
