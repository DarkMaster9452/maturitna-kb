'use client';
import { useState, useEffect, ReactNode, CSSProperties } from 'react';

export const Icon = ({ name, fill = 0, size = 24, style = {}, className = '' }: {
  name: string; fill?: number; size?: number; style?: CSSProperties; className?: string;
}) => (
  <span className={'material-symbols-outlined ' + className}
    style={{ fontSize: size, fontVariationSettings: `'FILL' ${fill},'wght' 400,'GRAD' 0,'opsz' ${size}`, ...style }}>
    {name}
  </span>
);

export const Button = ({ variant = 'primary', icon, iconAfter, children, onClick, full, style = {}, disabled, type = 'button' }: {
  variant?: 'primary' | 'secondary' | 'ghost' | 'white' | 'danger';
  icon?: string; iconAfter?: string; children: ReactNode; onClick?: () => void;
  full?: boolean; style?: CSSProperties; disabled?: boolean; type?: 'button' | 'submit';
}) => {
  const base: CSSProperties = {
    fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14, letterSpacing: '.03em',
    borderRadius: 'var(--radius)', padding: '11px 22px', border: 0, cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, whiteSpace: 'nowrap',
    width: full ? '100%' : 'auto', flexShrink: 0, transition: 'all .2s',
    opacity: disabled ? 0.5 : 1, ...style,
  };
  const variants: Record<string, CSSProperties> = {
    primary: { background: 'var(--primary)', color: '#fff' },
    secondary: { background: 'transparent', border: '1px solid var(--outline)', color: 'var(--on-surface)' },
    ghost: { background: 'transparent', color: 'var(--primary)', padding: '8px 12px' },
    white: { background: '#fff', color: 'var(--primary)' },
    danger: { background: 'var(--error)', color: '#fff' },
  };
  return (
    <button type={type} style={{ ...base, ...variants[variant] }} onClick={onClick} disabled={disabled}
      onMouseDown={e => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(.97)'; }}
      onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}>
      {icon && <Icon name={icon} size={18} />}{children}{iconAfter && <Icon name={iconAfter} size={18} />}
    </button>
  );
};

export const Card = ({ children, pad = 24, radius = 16, hover, style = {}, onClick }: {
  children: ReactNode; pad?: number; radius?: number; hover?: boolean; style?: CSSProperties; onClick?: () => void;
}) => {
  const [h, setH] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)',
        borderRadius: radius, padding: pad,
        boxShadow: hover ? (h ? 'var(--shadow-card-hover)' : 'var(--shadow-card)') : 'none',
        transition: 'box-shadow .3s', cursor: onClick ? 'pointer' : 'default', ...style,
      }}>{children}</div>
  );
};

export const IconChip = ({ name, size = 40, bg = 'var(--primary-fixed)', color = 'var(--primary)', radius = 8, fill = 0, style = {} }: {
  name: string; size?: number; bg?: string; color?: string; radius?: number; fill?: number; style?: CSSProperties;
}) => (
  <div style={{ width: size, height: size, borderRadius: radius, background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', ...style }}>
    <Icon name={name} size={size * 0.55} fill={fill} />
  </div>
);

export const Progress = ({ value, label, right, height = 8 }: {
  value: number; label?: string; right?: string; height?: number;
}) => (
  <div>
    {(label || right) && (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 8, fontSize: 13 }}>
        <span style={{ color: 'var(--on-surface-variant)' }}>{label}</span>
        <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{right}</span>
      </div>
    )}
    <div style={{ height, background: 'var(--surface-container-high)', borderRadius: 9999, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: Math.min(value, 100) + '%', background: 'var(--primary)', borderRadius: 9999, transition: 'width .5s' }} />
    </div>
  </div>
);

export const Chip = ({ children, tone = 'subject', icon }: {
  children: ReactNode; tone?: string; icon?: string;
}) => {
  const tones: Record<string, CSSProperties> = {
    subject: { background: 'var(--primary-fixed)', color: 'var(--on-primary-fixed-variant)' },
    trend: { background: 'var(--primary-fixed-dim)', color: 'var(--primary)' },
    neutral: { background: 'var(--surface-container-high)', color: 'var(--on-surface)' },
    soft: { background: 'var(--surface-container)', color: 'var(--on-surface-variant)' },
    success: { background: '#dcf0d4', color: 'var(--success)' },
    error: { background: '#ffdad6', color: 'var(--error)' },
  };
  return (
    <span style={{ ...tones[tone] || tones.subject, fontSize: 12.5, fontWeight: 600, borderRadius: 9999, padding: '5px 12px', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      {icon && <Icon name={icon} size={15} />}{children}
    </span>
  );
};

export const Serif = ({ size = 24, weight = 600, children, style = {} }: {
  size?: number; weight?: number; children: ReactNode; style?: CSSProperties;
}) => (
  <span style={{ fontFamily: 'var(--font-serif)', fontSize: size, fontWeight: weight, lineHeight: 1.2, color: 'var(--on-surface)', ...style }}>
    {children}
  </span>
);

export const Eyebrow = ({ children }: { children: ReactNode }) => (
  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--primary)' }}>
    {children}
  </div>
);

export const Input = ({ label, type = 'text', placeholder, value, onChange, icon, name }: {
  label?: string; type?: string; placeholder?: string; value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; icon?: string; name?: string;
}) => (
  <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
    {label && <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.04em', color: 'var(--on-surface-variant)' }}>{label}</span>}
    <div style={{ position: 'relative' }}>
      {icon && <Icon name={icon} size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--on-surface-variant)' }} />}
      <input type={type} name={name} placeholder={placeholder} value={value} onChange={onChange}
        style={{ fontFamily: 'var(--font-sans)', fontSize: 15, background: 'var(--surface-container-low)', border: '1px solid var(--outline-variant)', borderRadius: 8, padding: `11px 14px 11px ${icon ? '40px' : '14px'}`, color: 'var(--on-surface)', outline: 'none', width: '100%', transition: 'border-color .2s,box-shadow .2s' }}
        onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 2px rgba(132,79,34,.15)'; }}
        onBlur={e => { e.target.style.borderColor = 'var(--outline-variant)'; e.target.style.boxShadow = 'none'; }} />
    </div>
  </label>
);

export const Toast = ({ msg, onDismiss }: { msg: string; onDismiss?: () => void }) => (
  <div onClick={onDismiss} style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', background: 'var(--inverse-surface)', color: 'var(--inverse-on-surface)', padding: '12px 22px', borderRadius: 9999, fontSize: 14, fontWeight: 600, boxShadow: '0 8px 30px rgba(0,0,0,.2)', display: 'flex', alignItems: 'center', gap: 8, zIndex: 500, whiteSpace: 'nowrap', cursor: 'pointer' }}>
    <Icon name="check_circle" size={18} />{msg}
  </div>
);

export const Logo = ({ size = 24 }: { size?: number }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <span className="material-symbols-outlined" style={{ background: 'var(--primary)', color: '#fff', borderRadius: 9999, padding: 6, fontSize: size - 4, fontVariationSettings: "'FILL' 1" }}>school</span>
    <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: size, color: 'var(--primary)' }}>Maturita</span>
  </div>
);

export function useToast() {
  const [toast, setToast] = useState<string | null>(null);
  const flash = (msg: string, duration = 2400) => {
    setToast(msg);
    setTimeout(() => setToast(null), duration);
  };
  return { toast, flash };
}


// Responsive helper: returns true when the media query matches (SSR-safe)
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

// Loading skeleton block (shimmer)
export const Skeleton = ({ height = 16, width = '100%', radius = 8, style = {} }: {
  height?: number | string; width?: number | string; radius?: number; style?: CSSProperties;
}) => (
  <div className="mkb-skeleton" style={{ height, width, borderRadius: radius, ...style }} />
);

// Card-shaped skeleton placeholder
export const SkeletonCard = ({ lines = 2 }: { lines?: number }) => (
  <div style={{ background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 12, padding: 20, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
    <Skeleton width={48} height={48} radius={12} />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Skeleton width="40%" height={12} />
      <Skeleton width="80%" height={16} />
      {Array.from({ length: lines }).map((_, i) => <Skeleton key={i} width={i % 2 ? '60%' : '90%'} height={10} />)}
    </div>
  </div>
);
