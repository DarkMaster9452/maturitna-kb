'use client';
import { useState, useEffect, ReactNode, CSSProperties } from 'react';

/* ══════════════════════════════════════════════════════════════
   Appearance (accent + light/dark/system)
   ══════════════════════════════════════════════════════════════ */
export type Mode = 'light' | 'dark' | 'system';
export type Accent = '' | 'spsit';

const prefersDark = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;

export function resolveDark(mode: Mode): boolean {
  return mode === 'dark' || (mode === 'system' && prefersDark());
}

export function readMode(): Mode {
  try { return (localStorage.getItem('mode') as Mode) || 'system'; } catch { return 'system'; }
}
export function readAccent(): Accent {
  try { return (localStorage.getItem('theme') as Accent) || ''; } catch { return ''; }
}

export function setMode(mode: Mode) {
  try {
    if (mode === 'system') localStorage.removeItem('mode');
    else localStorage.setItem('mode', mode);
  } catch {}
  applyDark(resolveDark(mode));
}
function applyDark(dark: boolean) {
  const el = document.documentElement;
  if (dark) el.dataset.mode = 'dark';
  else delete el.dataset.mode;
}
export function setAccent(accent: Accent) {
  try {
    if (accent) localStorage.setItem('theme', accent);
    else localStorage.removeItem('theme');
  } catch {}
  const el = document.documentElement;
  if (accent) el.dataset.theme = accent;
  else delete el.dataset.theme;
}

/** Keeps state in sync with the OS when mode === 'system'. */
export function useAppearance() {
  const [mode, setModeState] = useState<Mode>('system');
  const [accent, setAccentState] = useState<Accent>('');
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const m = readMode(); const a = readAccent();
    setModeState(m); setAccentState(a); setDark(resolveDark(m));
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => { if (readMode() === 'system') { applyDark(mq.matches); setDark(mq.matches); } };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const changeMode = (m: Mode) => { setMode(m); setModeState(m); setDark(resolveDark(m)); };
  const changeAccent = (a: Accent) => { setAccent(a); setAccentState(a); };
  const toggleDark = () => changeMode(dark ? 'light' : 'dark');

  return { mode, accent, dark, changeMode, changeAccent, toggleDark };
}

/* ══════════════════════════════════════════════════════════════
   Icon
   ══════════════════════════════════════════════════════════════ */
export const Icon = ({ name, fill = 0, weight = 400, size = 24, style = {}, className = '' }: {
  name: string; fill?: number; weight?: number; size?: number; style?: CSSProperties; className?: string;
}) => (
  <span className={'material-symbols-outlined ' + className}
    style={{ fontSize: size, fontVariationSettings: `'FILL' ${fill},'wght' ${weight},'GRAD' 0,'opsz' ${size}`, ...style }}>
    {name}
  </span>
);

/* ══════════════════════════════════════════════════════════════
   Button
   ══════════════════════════════════════════════════════════════ */
export const Button = ({ variant = 'primary', size = 'md', icon, iconAfter, children, onClick, full, style = {}, disabled, type = 'button' }: {
  variant?: 'primary' | 'secondary' | 'ghost' | 'white' | 'danger' | 'soft';
  size?: 'sm' | 'md' | 'lg';
  icon?: string; iconAfter?: string; children: ReactNode; onClick?: () => void;
  full?: boolean; style?: CSSProperties; disabled?: boolean; type?: 'button' | 'submit';
}) => {
  const [h, setH] = useState(false);
  const pads = { sm: '8px 14px', md: '11px 20px', lg: '14px 26px' };
  const fonts = { sm: 13, md: 14, lg: 15.5 };
  const base: CSSProperties = {
    fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: fonts[size], letterSpacing: '.01em',
    borderRadius: 'var(--radius)', padding: pads[size], border: 0,
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, whiteSpace: 'nowrap',
    width: full ? '100%' : 'auto', flexShrink: 0,
    transition: 'transform .18s cubic-bezier(.16,.84,.44,1), box-shadow .18s, background .2s, opacity .2s',
    opacity: disabled ? 0.55 : 1,
    transform: h && !disabled ? 'translateY(-1px)' : 'none',
  };
  const variants: Record<string, CSSProperties> = {
    primary: {
      backgroundImage: 'var(--grad-brand)', color: '#fff',
      boxShadow: h && !disabled
        ? '0 10px 26px -8px color-mix(in srgb, var(--primary) 65%, transparent)'
        : '0 5px 16px -8px color-mix(in srgb, var(--primary) 55%, transparent)',
    },
    secondary: {
      background: h ? 'var(--surface-container-high)' : 'var(--surface-container-lowest)',
      border: '1px solid var(--outline-variant)', color: 'var(--on-surface)',
    },
    soft: { background: h ? 'var(--primary-fixed-dim)' : 'var(--primary-fixed)', color: 'var(--on-primary-fixed-variant)' },
    ghost: { background: h ? 'var(--surface-container-high)' : 'transparent', color: 'var(--primary)', padding: '8px 12px' },
    white: { background: '#fff', color: 'var(--primary)', boxShadow: h ? '0 8px 20px -8px rgba(0,0,0,.3)' : 'none' },
    danger: { background: 'var(--error)', color: '#fff' },
  };
  return (
    <button type={type} style={{ ...base, ...variants[variant] }} onClick={onClick} disabled={disabled}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      onMouseDown={e => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(.97)'; }}
      onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = h ? 'translateY(-1px)' : 'none'; }}>
      {icon && <Icon name={icon} size={size === 'sm' ? 17 : 19} />}{children}{iconAfter && <Icon name={iconAfter} size={size === 'sm' ? 17 : 19} />}
    </button>
  );
};

/* ══════════════════════════════════════════════════════════════
   Card
   ══════════════════════════════════════════════════════════════ */
export const Card = ({ children, pad = 24, radius = 18, hover, glow, style = {}, onClick }: {
  children: ReactNode; pad?: number; radius?: number; hover?: boolean; glow?: boolean; style?: CSSProperties; onClick?: () => void;
}) => {
  const [h, setH] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)',
        borderRadius: radius, padding: pad,
        boxShadow: hover ? (h ? 'var(--shadow-card-hover)' : 'var(--shadow-card)') : (glow ? 'var(--shadow-card)' : 'none'),
        transform: hover && h ? 'translateY(-3px)' : 'none',
        transition: 'box-shadow .3s, transform .3s, border-color .3s',
        cursor: onClick ? 'pointer' : 'default', ...style,
      }}>{children}</div>
  );
};

/* ══════════════════════════════════════════════════════════════
   Icon chip / avatar
   ══════════════════════════════════════════════════════════════ */
export const IconChip = ({ name, size = 40, bg = 'var(--primary-fixed)', color = 'var(--primary)', radius = 12, fill = 0, grad = false, style = {} }: {
  name: string; size?: number; bg?: string; color?: string; radius?: number; fill?: number; grad?: boolean; style?: CSSProperties;
}) => (
  <div style={{
    width: size, height: size, borderRadius: radius,
    background: grad ? 'var(--grad-brand)' : bg, color: grad ? '#fff' : color,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none',
    boxShadow: grad ? '0 8px 20px -8px color-mix(in srgb, var(--primary) 60%, transparent)' : 'none', ...style,
  }}>
    <Icon name={name} size={size * 0.52} fill={grad ? 1 : fill} />
  </div>
);

export const Avatar = ({ name, size = 40, ring = true }: { name?: string; size?: number; ring?: boolean }) => (
  <div style={{
    width: size, height: size, borderRadius: 9999, flex: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backgroundImage: 'var(--grad-brand)', color: '#fff',
    boxShadow: ring ? '0 0 0 2px var(--surface-container-lowest), 0 0 0 3px color-mix(in srgb, var(--primary) 35%, transparent)' : 'none',
  }}>
    <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: size * 0.4 }}>
      {(name?.trim()?.[0] || '?').toUpperCase()}
    </span>
  </div>
);

/* ══════════════════════════════════════════════════════════════
   Progress
   ══════════════════════════════════════════════════════════════ */
export const Progress = ({ value, label, right, height = 8 }: {
  value: number; label?: string; right?: string; height?: number;
}) => (
  <div>
    {(label || right) && (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 8, fontSize: 13 }}>
        <span style={{ color: 'var(--on-surface-variant)', fontWeight: 500 }}>{label}</span>
        <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{right}</span>
      </div>
    )}
    <div style={{ height, background: 'var(--surface-container-high)', borderRadius: 9999, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: Math.min(Math.max(value, 0), 100) + '%', backgroundImage: 'var(--grad-brand)', borderRadius: 9999, transition: 'width .7s cubic-bezier(.16,.84,.44,1)' }} />
    </div>
  </div>
);

/* Circular progress ring */
export const Ring = ({ value, size = 64, stroke = 7, children }: { value: number; size?: number; stroke?: number; children?: ReactNode }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (Math.min(Math.max(value, 0), 100) / 100) * c;
  return (
    <div style={{ position: 'relative', width: size, height: size, flex: 'none' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-container-high)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--primary)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={off} style={{ transition: 'stroke-dashoffset .8s cubic-bezier(.16,.84,.44,1)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {children ?? <span style={{ fontSize: size * 0.26, fontWeight: 700 }}>{Math.round(value)}%</span>}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   Chip / badge
   ══════════════════════════════════════════════════════════════ */
export const Chip = ({ children, tone = 'subject', icon }: { children: ReactNode; tone?: string; icon?: string }) => {
  const tones: Record<string, CSSProperties> = {
    subject: { background: 'var(--primary-fixed)', color: 'var(--on-primary-fixed-variant)' },
    trend: { background: 'var(--primary-fixed-dim)', color: 'var(--on-primary-fixed)' },
    neutral: { background: 'var(--surface-container-high)', color: 'var(--on-surface)' },
    soft: { background: 'var(--surface-container)', color: 'var(--on-surface-variant)' },
    success: { background: 'var(--success-container)', color: 'var(--on-success-container)' },
    error: { background: 'var(--error-container)', color: 'var(--on-error-container)' },
    warning: { background: 'var(--warning-container)', color: 'var(--on-warning-container)' },
  };
  return (
    <span style={{ ...(tones[tone] || tones.subject), fontSize: 12.5, fontWeight: 600, borderRadius: 9999, padding: '5px 12px', display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
      {icon && <Icon name={icon} size={15} />}{children}
    </span>
  );
};

/* ══════════════════════════════════════════════════════════════
   Typography helpers
   ══════════════════════════════════════════════════════════════ */
export const Serif = ({ size = 24, weight = 600, children, style = {} }: {
  size?: number; weight?: number; children: ReactNode; style?: CSSProperties;
}) => (
  <span style={{ fontFamily: 'var(--font-serif)', fontSize: size, fontWeight: weight, lineHeight: 1.15, color: 'var(--on-surface)', letterSpacing: '-.01em', ...style }}>
    {children}
  </span>
);

export const Eyebrow = ({ children, icon }: { children: ReactNode; icon?: string }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--primary)' }}>
    {icon && <Icon name={icon} size={16} fill={1} />}{children}
  </div>
);

export const SectionHeading = ({ eyebrow, title, desc, action, center }: {
  eyebrow?: string; title: ReactNode; desc?: string; action?: ReactNode; center?: boolean;
}) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap', marginBottom: 24, textAlign: center ? 'center' : 'left', flexDirection: center ? 'column' : 'row' }}>
    <div style={{ maxWidth: center ? 620 : undefined, margin: center ? '0 auto' : undefined }}>
      {eyebrow && <div style={{ marginBottom: 10 }}><Eyebrow>{eyebrow}</Eyebrow></div>}
      <Serif size={30} weight={700} style={{ display: 'block' }}>{title}</Serif>
      {desc && <div style={{ fontSize: 16, color: 'var(--on-surface-variant)', marginTop: 8, lineHeight: 1.55 }}>{desc}</div>}
    </div>
    {action}
  </div>
);

/* ══════════════════════════════════════════════════════════════
   Stat card
   ══════════════════════════════════════════════════════════════ */
export const StatCard = ({ icon, label, value, sub, tone = 'primary' }: {
  icon: string; label: string; value: ReactNode; sub?: string; tone?: 'primary' | 'success' | 'warning' | 'tertiary';
}) => {
  const toneMap: Record<string, { bg: string; c: string }> = {
    primary: { bg: 'var(--primary-fixed)', c: 'var(--primary)' },
    success: { bg: 'var(--success-container)', c: 'var(--success)' },
    warning: { bg: 'var(--warning-container)', c: 'var(--warning)' },
    tertiary: { bg: 'var(--tertiary-fixed)', c: 'var(--tertiary)' },
  };
  const t = toneMap[tone];
  return (
    <div style={{ background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 16, padding: 20, boxShadow: 'var(--shadow-card)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: t.bg, color: t.c, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
          <Icon name={icon} size={22} fill={1} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--on-surface-variant)' }}>{label}</span>
      </div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 700, lineHeight: 1, color: 'var(--on-surface)' }}>{value}</div>
      {sub && <div style={{ fontSize: 12.5, color: 'var(--on-surface-variant)', marginTop: 6 }}>{sub}</div>}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   Input
   ══════════════════════════════════════════════════════════════ */
export const Input = ({ label, type = 'text', placeholder, value, onChange, icon, name, onKeyDown }: {
  label?: string; type?: string; placeholder?: string; value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; icon?: string; name?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}) => (
  <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
    {label && <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.02em', color: 'var(--on-surface-variant)' }}>{label}</span>}
    <div style={{ position: 'relative' }}>
      {icon && <Icon name={icon} size={18} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--on-surface-variant)', pointerEvents: 'none' }} />}
      <input type={type} name={name} placeholder={placeholder} value={value} onChange={onChange} onKeyDown={onKeyDown}
        style={{ fontFamily: 'var(--font-sans)', fontSize: 15, background: 'var(--surface-container-low)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius)', padding: `12px 14px 12px ${icon ? '42px' : '14px'}`, color: 'var(--on-surface)', outline: 'none', width: '100%', transition: 'border-color .2s, box-shadow .2s' }}
        onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = 'var(--ring)'; }}
        onBlur={e => { e.target.style.borderColor = 'var(--outline-variant)'; e.target.style.boxShadow = 'none'; }} />
    </div>
  </label>
);

/* ══════════════════════════════════════════════════════════════
   Toast
   ══════════════════════════════════════════════════════════════ */
export const Toast = ({ msg, onDismiss }: { msg: string; onDismiss?: () => void }) => (
  <div onClick={onDismiss} className="mkb-fade-up" style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', background: 'var(--inverse-surface)', color: 'var(--inverse-on-surface)', padding: '12px 22px', borderRadius: 9999, fontSize: 14, fontWeight: 600, boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center', gap: 8, zIndex: 500, whiteSpace: 'nowrap', cursor: 'pointer', maxWidth: 'calc(100vw - 32px)' }}>
    <Icon name="check_circle" size={18} fill={1} style={{ color: 'var(--success)' }} />{msg}
  </div>
);

/* ══════════════════════════════════════════════════════════════
   Logo
   ══════════════════════════════════════════════════════════════ */
export const Logo = ({ size = 24, mono = false }: { size?: number; mono?: boolean }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <span className="material-symbols-outlined" style={{
      backgroundImage: mono ? undefined : 'var(--grad-brand)', background: mono ? 'rgba(255,255,255,.16)' : undefined,
      color: '#fff', borderRadius: 12, padding: size * 0.28, fontSize: size - 2, fontVariationSettings: "'FILL' 1",
      boxShadow: mono ? 'none' : '0 6px 16px -6px color-mix(in srgb, var(--primary) 60%, transparent)',
    }}>school</span>
    <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: size, color: mono ? '#fff' : 'var(--on-surface)', letterSpacing: '-.02em' }}>
      Maturita<span style={{ color: mono ? 'rgba(255,255,255,.6)' : 'var(--primary)' }}>KB</span>
    </span>
  </div>
);

/* ══════════════════════════════════════════════════════════════
   Mode (dark) toggle
   ══════════════════════════════════════════════════════════════ */
export const ModeToggle = ({ compact = false }: { compact?: boolean }) => {
  const { dark, toggleDark } = useAppearance();
  return (
    <button onClick={toggleDark} title={dark ? 'Prepnúť na svetlý režim' : 'Prepnúť na tmavý režim'} aria-label="Prepnúť režim"
      style={{ width: compact ? 38 : 40, height: compact ? 38 : 40, borderRadius: 12, border: '1px solid var(--outline-variant)', background: 'var(--surface-container-lowest)', color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background .2s, color .2s' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-container-high)'; e.currentTarget.style.color = 'var(--primary)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-container-lowest)'; e.currentTarget.style.color = 'var(--on-surface-variant)'; }}>
      <Icon name={dark ? 'light_mode' : 'dark_mode'} size={20} fill={1} />
    </button>
  );
};

/* ══════════════════════════════════════════════════════════════
   Hooks + skeletons
   ══════════════════════════════════════════════════════════════ */
export function useToast() {
  const [toast, setToast] = useState<string | null>(null);
  const flash = (msg: string, duration = 2400) => { setToast(msg); setTimeout(() => setToast(null), duration); };
  return { toast, flash };
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const m = window.matchMedia(query);
    const handler = () => setMatches(m.matches);
    handler();
    m.addEventListener('change', handler);
    return () => m.removeEventListener('change', handler);
  }, [query]);
  return matches;
}

export const Skeleton = ({ height = 16, width = '100%', radius = 8, style = {} }: {
  height?: number | string; width?: number | string; radius?: number; style?: CSSProperties;
}) => (
  <div className="mkb-skeleton" style={{ height, width, borderRadius: radius, ...style }} />
);

export const SkeletonCard = ({ lines = 2 }: { lines?: number }) => (
  <div style={{ background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 16, padding: 20, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
    <Skeleton width={48} height={48} radius={14} />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Skeleton width="40%" height={12} />
      <Skeleton width="80%" height={16} />
      {Array.from({ length: lines }).map((_, i) => <Skeleton key={i} width={i % 2 ? '60%' : '90%'} height={10} />)}
    </div>
  </div>
);

/* Generic empty state */
export const EmptyState = ({ icon = 'inbox', title, desc, action }: { icon?: string; title: string; desc?: string; action?: ReactNode }) => (
  <div style={{ textAlign: 'center', padding: '56px 24px', color: 'var(--on-surface-variant)' }}>
    <div style={{ width: 64, height: 64, borderRadius: 18, background: 'var(--surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', color: 'var(--primary)' }}>
      <Icon name={icon} size={30} />
    </div>
    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 600, color: 'var(--on-surface)', marginBottom: 6 }}>{title}</div>
    {desc && <div style={{ fontSize: 14.5, maxWidth: 380, margin: '0 auto', lineHeight: 1.55 }}>{desc}</div>}
    {action && <div style={{ marginTop: 20 }}>{action}</div>}
  </div>
);
