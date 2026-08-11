'use client';
import { useState, useEffect, ReactNode, CSSProperties } from 'react';

/* ══════════════════════════════════════════════════════════════
   Appearance (accent + light/dark/system)
   ══════════════════════════════════════════════════════════════ */
export type Mode = 'light' | 'dark' | 'system';
export type Accent = '' | 'spsit' | 'amber' | 'rose';

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
  try { if (mode === 'system') localStorage.removeItem('mode'); else localStorage.setItem('mode', mode); } catch {}
  applyDark(resolveDark(mode));
}
function applyDark(dark: boolean) {
  const el = document.documentElement;
  if (dark) el.dataset.mode = 'dark'; else delete el.dataset.mode;
}
export function setAccent(accent: Accent) {
  try { if (accent) localStorage.setItem('theme', accent); else localStorage.removeItem('theme'); } catch {}
  const el = document.documentElement;
  if (accent) el.dataset.theme = accent; else delete el.dataset.theme;
}
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
   Pointer capability
   Touch browsers fire mouseenter on tap and never fire mouseleave,
   which leaves hover styles stuck on. Gate hover state behind a
   real pointer. (SSR returns true so markup matches the desktop
   first paint; it is only ever read inside event handlers.)
   ══════════════════════════════════════════════════════════════ */
export const canHover = () =>
  typeof window === 'undefined' || window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* Fluid type: scale a design size down on narrow screens.
   Interpolates linearly between a 380px and a 1200px viewport. */
export function fluid(size: number, ratio = 0.66): string | number {
  if (size < 26) return size;
  const min = Math.round(size * ratio);
  const slope = (size - min) / (1200 - 380);
  const intercept = min - slope * 380;
  return `clamp(${min}px, ${(slope * 100).toFixed(2)}vw + ${intercept.toFixed(1)}px, ${size}px)`;
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
   Button — flat, ink primary
   ══════════════════════════════════════════════════════════════ */
export const Button = ({ variant = 'primary', size = 'md', icon, iconAfter, children, onClick, full, style = {}, disabled, type = 'button' }: {
  variant?: 'primary' | 'secondary' | 'ghost' | 'white' | 'danger' | 'soft' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  icon?: string; iconAfter?: string; children: ReactNode; onClick?: () => void;
  full?: boolean; style?: CSSProperties; disabled?: boolean; type?: 'button' | 'submit';
}) => {
  const [h, setH] = useState(false);
  const pads = { sm: '8px 14px', md: '10px 18px', lg: '13px 24px' };
  const fonts = { sm: 13, md: 14, lg: 15 };
  const base: CSSProperties = {
    fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: fonts[size], letterSpacing: '0',
    borderRadius: 'var(--radius)', padding: pads[size], border: '1px solid transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, whiteSpace: 'nowrap',
    width: full ? '100%' : 'auto', flexShrink: 0,
    transition: 'transform .16s ease, background .18s, border-color .18s, opacity .2s',
    opacity: disabled ? 0.5 : 1,
    transform: h && !disabled ? 'translateY(-1px)' : 'none',
  };
  const variants: Record<string, CSSProperties> = {
    primary: { background: h ? 'var(--btn-bg-hover)' : 'var(--btn-bg)', color: 'var(--btn-fg)' },
    accent: { background: 'var(--primary)', color: 'var(--on-primary)', opacity: disabled ? 0.5 : (h ? 0.9 : 1) },
    secondary: { background: h ? 'var(--surface-container-high)' : 'transparent', borderColor: 'var(--outline)', color: 'var(--on-surface)' },
    soft: { background: h ? 'var(--primary-fixed-dim)' : 'var(--primary-fixed)', color: 'var(--on-primary-fixed-variant)' },
    ghost: { background: h ? 'var(--surface-container-high)' : 'transparent', color: 'var(--on-surface)', padding: '8px 12px' },
    white: { background: 'var(--surface-container-lowest)', color: 'var(--on-surface)', borderColor: 'var(--outline-variant)' },
    danger: { background: 'var(--error)', color: '#fff' },
  };
  return (
    <button type={type} className={'mkb-btn' + (size === 'sm' ? ' mkb-btn-sm' : '')}
      style={{ ...base, ...variants[variant] }} onClick={onClick} disabled={disabled}
      onMouseEnter={() => { if (canHover()) setH(true); }} onMouseLeave={() => setH(false)}
      onPointerDown={e => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(.97)'; }}
      onPointerUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = h ? 'translateY(-1px)' : 'none'; }}
      onPointerCancel={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'none'; }}>
      {icon && <Icon name={icon} size={size === 'sm' ? 17 : 18} />}{children}{iconAfter && <Icon name={iconAfter} size={size === 'sm' ? 17 : 18} />}
    </button>
  );
};

/* ══════════════════════════════════════════════════════════════
   Card — flat, hairline border
   ══════════════════════════════════════════════════════════════ */
export const Card = ({ children, pad = 24, radius = 14, hover, glow, style = {}, onClick }: {
  children: ReactNode; pad?: number; radius?: number; hover?: boolean; glow?: boolean; style?: CSSProperties; onClick?: () => void;
}) => {
  const [h, setH] = useState(false);
  return (
    <div onClick={onClick}
      className={'mkb-card' + (pad >= 20 ? ' mkb-card-pad' : '')}
      onMouseEnter={() => { if (canHover()) setH(true); }} onMouseLeave={() => setH(false)}
      style={{
        background: 'var(--surface-container-lowest)',
        border: '1px solid ' + (hover && h ? 'var(--outline)' : 'var(--outline-variant)'),
        borderRadius: radius, padding: pad,
        boxShadow: hover && h ? 'var(--shadow-card-hover)' : 'none',
        transform: hover && h ? 'translateY(-2px)' : 'none',
        transition: 'box-shadow .25s, transform .25s, border-color .2s',
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
    background: grad ? 'var(--primary)' : bg, color: grad ? 'var(--on-primary)' : color,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', ...style,
  }}>
    <Icon name={name} size={size * 0.5} fill={grad ? 1 : fill} />
  </div>
);

export const Avatar = ({ name, size = 40, ring = true }: { name?: string; size?: number; ring?: boolean }) => (
  <div style={{
    width: size, height: size, borderRadius: 9999, flex: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--inverse-surface)', color: 'var(--inverse-on-surface)',
    border: ring ? '2px solid var(--surface-container-lowest)' : 'none',
    boxShadow: ring ? '0 0 0 1px var(--outline-variant)' : 'none',
  }}>
    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: size * 0.42 }}>
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
        <span className="mkb-mono" style={{ color: 'var(--on-surface)', fontWeight: 600, fontSize: 12.5 }}>{right}</span>
      </div>
    )}
    <div style={{ height, background: 'var(--surface-container-high)', borderRadius: 9999, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: Math.min(Math.max(value, 0), 100) + '%', background: 'var(--primary)', borderRadius: 9999, transition: 'width .7s cubic-bezier(.16,.84,.44,1)' }} />
    </div>
  </div>
);

export const Ring = ({ value, size = 64, stroke = 6, children }: { value: number; size?: number; stroke?: number; children?: ReactNode }) => {
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
        {children ?? <span className="mkb-mono" style={{ fontSize: size * 0.24, fontWeight: 600 }}>{Math.round(value)}</span>}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   Chip — rectangular tag
   ══════════════════════════════════════════════════════════════ */
export const Chip = ({ children, tone = 'subject', icon }: { children: ReactNode; tone?: string; icon?: string }) => {
  const tones: Record<string, CSSProperties> = {
    subject: { background: 'var(--surface-container)', color: 'var(--on-surface-variant)', border: '1px solid var(--outline-variant)' },
    trend: { background: 'var(--primary-fixed)', color: 'var(--on-primary-fixed-variant)', border: '1px solid transparent' },
    neutral: { background: 'var(--surface-container-high)', color: 'var(--on-surface)', border: '1px solid transparent' },
    soft: { background: 'var(--surface-container)', color: 'var(--on-surface-variant)', border: '1px solid var(--outline-variant)' },
    success: { background: 'var(--success-container)', color: 'var(--on-success-container)', border: '1px solid transparent' },
    error: { background: 'var(--error-container)', color: 'var(--on-error-container)', border: '1px solid transparent' },
    warning: { background: 'var(--warning-container)', color: 'var(--on-warning-container)', border: '1px solid transparent' },
  };
  return (
    <span style={{ ...(tones[tone] || tones.subject), fontSize: 12, fontWeight: 600, borderRadius: 7, padding: '4px 9px', display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap', letterSpacing: '.01em' }}>
      {icon && <Icon name={icon} size={14} />}{children}
    </span>
  );
};

/* ══════════════════════════════════════════════════════════════
   Typography helpers
   ══════════════════════════════════════════════════════════════ */
/* Display type. Sizes from 26px up scale fluidly with the viewport,
   so headings never overflow a phone. An explicit `style.fontSize`
   still wins — pages that already declare their own clamp keep it. */
export const Serif = ({ size = 24, weight = 600, children, style = {} }: {
  size?: number; weight?: number; children: ReactNode; style?: CSSProperties;
}) => (
  <span style={{ fontFamily: 'var(--font-display)', fontSize: fluid(size), fontWeight: weight, lineHeight: 1.12, color: 'var(--on-surface)', letterSpacing: '-.02em', overflowWrap: 'break-word', ...style }}>
    {children}
  </span>
);

export const Eyebrow = ({ children, icon }: { children: ReactNode; icon?: string }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 500, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>
    {icon ? <Icon name={icon} size={15} fill={1} style={{ color: 'var(--primary)' }} /> : <span style={{ width: 18, height: 2, background: 'var(--primary)', flex: 'none' }} />}
    {children}
  </span>
);

export const SectionHeading = ({ eyebrow, title, desc, action, center }: {
  eyebrow?: string; title: ReactNode; desc?: string; action?: ReactNode; center?: boolean;
}) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap', marginBottom: 24, textAlign: center ? 'center' : 'left', flexDirection: center ? 'column' : 'row' }}>
    <div style={{ maxWidth: center ? 640 : undefined, margin: center ? '0 auto' : undefined }}>
      {eyebrow && <div style={{ marginBottom: 12 }}><Eyebrow>{eyebrow}</Eyebrow></div>}
      <Serif size={30} weight={600} style={{ display: 'block' }}>{title}</Serif>
      {desc && <div style={{ fontSize: 16, color: 'var(--on-surface-variant)', marginTop: 8, lineHeight: 1.55 }}>{desc}</div>}
    </div>
    {action}
  </div>
);

/* ══════════════════════════════════════════════════════════════
   Stat card — flat
   ══════════════════════════════════════════════════════════════ */
export const StatCard = ({ icon, label, value, sub, tone = 'primary' }: {
  icon: string; label: string; value: ReactNode; sub?: string; tone?: 'primary' | 'success' | 'warning' | 'tertiary';
}) => {
  const toneMap: Record<string, { bg: string; c: string }> = {
    primary: { bg: 'var(--primary-fixed)', c: 'var(--primary)' },
    success: { bg: 'var(--success-container)', c: 'var(--success)' },
    warning: { bg: 'var(--warning-container)', c: 'var(--warning)' },
    tertiary: { bg: 'var(--surface-container)', c: 'var(--on-surface)' },
  };
  const t = toneMap[tone];
  return (
    <div className="mkb-statcard" style={{ background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 14, padding: 20, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 18 }}>
        <span className="mkb-eyebrow" style={{ letterSpacing: '.1em', minWidth: 0, overflowWrap: 'break-word' }}>{label}</span>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: t.bg, color: t.c, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
          <Icon name={icon} size={19} fill={1} />
        </div>
      </div>
      <div className="mkb-statcard-value" style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 600, lineHeight: 1.05, color: 'var(--on-surface)', letterSpacing: '-.02em', overflowWrap: 'break-word' }}>{value}</div>
      {sub && <div style={{ fontSize: 12.5, color: 'var(--on-surface-variant)', marginTop: 7 }}>{sub}</div>}
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
    {label && <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.01em', color: 'var(--on-surface-variant)' }}>{label}</span>}
    <div style={{ position: 'relative' }}>
      {icon && <Icon name={icon} size={18} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--on-surface-variant)', pointerEvents: 'none' }} />}
      <input type={type} name={name} placeholder={placeholder} value={value} onChange={onChange} onKeyDown={onKeyDown}
        style={{ fontFamily: 'var(--font-sans)', fontSize: 15, background: 'var(--surface-container-low)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius)', padding: `11px 14px 11px ${icon ? '42px' : '14px'}`, color: 'var(--on-surface)', outline: 'none', width: '100%', transition: 'border-color .2s, box-shadow .2s' }}
        onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = 'var(--ring)'; }}
        onBlur={e => { e.target.style.borderColor = 'var(--outline-variant)'; e.target.style.boxShadow = 'none'; }} />
    </div>
  </label>
);

/* ══════════════════════════════════════════════════════════════
   Toast
   ══════════════════════════════════════════════════════════════ */
export const Toast = ({ msg, onDismiss }: { msg: string; onDismiss?: () => void }) => (
  <div onClick={onDismiss} className="mkb-fade-up mkb-toast" style={{ position: 'fixed', left: '50%', transform: 'translateX(-50%)', background: 'var(--inverse-surface)', color: 'var(--inverse-on-surface)', padding: '12px 20px', borderRadius: 'var(--radius)', fontSize: 14, fontWeight: 600, boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center', gap: 8, zIndex: 500, whiteSpace: 'nowrap', cursor: 'pointer', maxWidth: 'calc(100vw - 32px)' }}>
    <Icon name="check" size={18} style={{ color: 'var(--primary)', flex: 'none' }} />{msg}
  </div>
);

/* ══════════════════════════════════════════════════════════════
   Logo — ink mark
   ══════════════════════════════════════════════════════════════ */
export const Logo = ({ size = 24, mono = false }: { size?: number; mono?: boolean }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <span className="material-symbols-outlined" style={{
      background: mono ? 'rgba(255,255,255,.16)' : 'var(--inverse-surface)',
      color: mono ? '#fff' : 'var(--inverse-on-surface)', borderRadius: 9,
      padding: size * 0.24, fontSize: size - 2, fontVariationSettings: "'FILL' 1",
    }}>bookmark</span>
    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: size, color: mono ? '#fff' : 'var(--on-surface)', letterSpacing: '-.03em' }}>
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
      style={{ width: compact ? 38 : 40, height: compact ? 38 : 40, borderRadius: 'var(--radius)', border: '1px solid var(--outline-variant)', background: 'var(--surface-container-lowest)', color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background .2s, color .2s, border-color .2s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--outline)'; e.currentTarget.style.color = 'var(--on-surface)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--outline-variant)'; e.currentTarget.style.color = 'var(--on-surface-variant)'; }}>
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
  <div style={{ background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 14, padding: 20, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
    <Skeleton width={44} height={44} radius={12} />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Skeleton width="40%" height={12} />
      <Skeleton width="80%" height={16} />
      {Array.from({ length: lines }).map((_, i) => <Skeleton key={i} width={i % 2 ? '60%' : '90%'} height={10} />)}
    </div>
  </div>
);
export const EmptyState = ({ icon = 'inbox', title, desc, action }: { icon?: string; title: string; desc?: string; action?: ReactNode }) => (
  <div style={{ textAlign: 'center', padding: '52px 24px', color: 'var(--on-surface-variant)' }}>
    <div style={{ width: 60, height: 60, borderRadius: 14, background: 'var(--surface-container)', border: '1px solid var(--outline-variant)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', color: 'var(--primary)' }}>
      <Icon name={icon} size={28} />
    </div>
    <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: 'var(--on-surface)', marginBottom: 6, letterSpacing: '-.01em' }}>{title}</div>
    {desc && <div style={{ fontSize: 14.5, maxWidth: 380, margin: '0 auto', lineHeight: 1.55 }}>{desc}</div>}
    {action && <div style={{ marginTop: 20 }}>{action}</div>}
  </div>
);
