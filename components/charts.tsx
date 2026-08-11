'use client';
import { CSSProperties, ReactNode } from 'react';

type Pt = { label: string; value: number };

const PALETTE = ['var(--primary)', '#f5b301', '#e0603a', '#3b82f6', '#8b5cf6', '#14b8a6', '#ec4899', '#64748b'];

/* Area + line chart (SVG, responsive via viewBox) */
export function LineArea({ data, height = 150, color = 'var(--primary)', suffix = '', style = {} }: {
  data: Pt[]; height?: number; color?: string; suffix?: string; style?: CSSProperties;
}) {
  const W = 640, H = height, pad = 8;
  const n = data.length;
  const max = Math.max(1, ...data.map(d => d.value));
  const x = (i: number) => (n <= 1 ? W / 2 : pad + (i / (n - 1)) * (W - pad * 2));
  const y = (v: number) => H - 22 - (v / max) * (H - 34);
  const pts = data.map((d, i) => `${x(i).toFixed(1)},${y(d.value).toFixed(1)}`);
  const line = pts.join(' ');
  const area = `${pad},${H - 22} ${line} ${(W - pad).toFixed(1)},${H - 22}`;
  const gid = 'g' + Math.random().toString(36).slice(2, 8);
  return (
    <div style={{ width: '100%', ...style }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none" style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.24" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map(f => <line key={f} x1={pad} x2={W - pad} y1={22 + f * (H - 44)} y2={22 + f * (H - 44)} stroke="var(--outline-variant)" strokeWidth="1" />)}
        {n > 1 && <polygon points={area} fill={`url(#${gid})`} />}
        <polyline points={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        {data.map((d, i) => <circle key={i} cx={x(i)} cy={y(d.value)} r="3" fill="var(--surface-container-lowest)" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />)}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        {data.map((d, i) => (n <= 12 || i % 2 === 0) ? <span key={i} style={{ fontSize: 10, color: 'var(--on-surface-variant)', fontWeight: 600 }}>{d.label}</span> : <span key={i} />)}
      </div>
    </div>
  );
}

/* Vertical bar chart */
export function Bars({ data, height = 150, unit = '', color = 'var(--primary)' }: {
  data: Pt[]; height?: number; unit?: string; color?: string;
}) {
  const max = Math.max(1, ...data.map(d => d.value));
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, height: '100%', justifyContent: 'flex-end' }} title={`${d.label}: ${d.value}${unit}`}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--on-surface)' }}>{d.value ? d.value + unit : ''}</div>
          <div style={{ width: '100%', maxWidth: 34, borderRadius: '6px 6px 0 0', background: i === data.length - 1 ? color : 'var(--primary-fixed)', height: `${Math.max((d.value / max) * (height - 34), 3)}px`, transition: 'height .6s cubic-bezier(.16,.84,.44,1)' }} />
          <div style={{ fontSize: 10, color: 'var(--on-surface-variant)', fontWeight: 600, whiteSpace: 'nowrap' }}>{d.label}</div>
        </div>
      ))}
    </div>
  );
}

/* Horizontal distribution bars (labeled) */
export function HBars({ data, color = 'var(--primary)', suffix = '' }: { data: (Pt & { color?: string })[]; color?: string; suffix?: string }) {
  const max = Math.max(1, ...data.map(d => d.value));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, width: 130, flex: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.label}</span>
          <div style={{ flex: 1, height: 10, borderRadius: 9999, background: 'var(--surface-container-high)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(d.value / max) * 100}%`, background: d.color || color, borderRadius: 9999, transition: 'width .7s cubic-bezier(.16,.84,.44,1)' }} />
          </div>
          <span className="mkb-mono" style={{ fontSize: 12, fontWeight: 700, width: 48, textAlign: 'right' }}>{d.value}{suffix}</span>
        </div>
      ))}
    </div>
  );
}

/* Donut / ring chart with legend */
export function Donut({ data, size = 168, thickness = 24, center }: { data: (Pt & { color?: string })[]; size?: number; thickness?: number; center?: ReactNode }) {
  const total = data.reduce((a, d) => a + d.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap' }}>
      <div style={{ position: 'relative', width: size, height: size, flex: 'none' }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-container-high)" strokeWidth={thickness} />
          {data.map((d, i) => {
            const frac = d.value / total;
            const seg = <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={d.color || PALETTE[i % PALETTE.length]} strokeWidth={thickness}
              strokeDasharray={`${frac * c} ${c}`} strokeDashoffset={-acc * c} style={{ transition: 'stroke-dashoffset .7s, stroke-dasharray .7s' }} />;
            acc += frac;
            return seg;
          })}
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {center ?? <><span style={{ fontFamily: 'var(--font-display)', fontSize: size * 0.2, fontWeight: 700, lineHeight: 1 }}>{total}</span><span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>spolu</span></>}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, flex: 1, minWidth: 140 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <span style={{ width: 11, height: 11, borderRadius: 3, background: d.color || PALETTE[i % PALETTE.length], flex: 'none' }} />
            <span style={{ fontSize: 13, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.label}</span>
            <span className="mkb-mono" style={{ fontSize: 12.5, fontWeight: 700 }}>{d.value}</span>
            <span style={{ fontSize: 11, color: 'var(--on-surface-variant)', width: 40, textAlign: 'right' }}>{Math.round((d.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Sparkline (tiny inline trend) */
export function Sparkline({ data, height = 34, color = 'var(--primary)', width = 120 }: { data: number[]; height?: number; color?: string; width?: number }) {
  if (!data.length) return null;
  const max = Math.max(...data), min = Math.min(...data);
  const span = max - min || 1;
  const n = data.length;
  const pts = data.map((v, i) => `${(n <= 1 ? width / 2 : (i / (n - 1)) * width).toFixed(1)},${(height - 3 - ((v - min) / span) * (height - 6)).toFixed(1)}`).join(' ');
  const gid = 'sp' + Math.random().toString(36).slice(2, 8);
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none" style={{ display: 'block' }}>
      <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.22" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
      <polygon points={`0,${height} ${pts} ${width},${height}`} fill={`url(#${gid})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/* KPI tile: big number + delta + sparkline */
export function KpiTile({ label, value, delta, spark, icon, suffix = '', tone = 'primary' }: {
  label: string; value: ReactNode; delta?: number | null; spark?: number[]; icon?: string; suffix?: string; tone?: 'primary' | 'success' | 'warning' | 'tertiary';
}) {
  const toneC: Record<string, string> = { primary: 'var(--primary)', success: 'var(--success)', warning: 'var(--warning)', tertiary: 'var(--tertiary)' };
  const up = (delta ?? 0) >= 0;
  return (
    <div style={{ background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 16, padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span className="mkb-eyebrow" style={{ letterSpacing: '.1em' }}>{label}</span>
        {icon && <span className="material-symbols-outlined" style={{ fontSize: 20, color: toneC[tone] }}>{icon}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 700, lineHeight: 1, letterSpacing: '-.02em' }}>{value}{suffix}</div>
        {delta != null && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 12, fontWeight: 700, color: up ? 'var(--success)' : 'var(--error)', marginBottom: 2 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 15 }}>{up ? 'trending_up' : 'trending_down'}</span>{Math.abs(delta)}%
          </span>
        )}
      </div>
      {spark && spark.length > 1 && <div style={{ marginTop: 10 }}><Sparkline data={spark} color={toneC[tone]} height={30} /></div>}
    </div>
  );
}

/* Heatmap grid (rows × cols, intensity by value) */
export function Heatmap({ rows, cols, values, color = 'var(--primary)' }: { rows: string[]; cols: string[]; values: number[][]; color?: string }) {
  const max = Math.max(1, ...values.flat());
  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'inline-grid', gridTemplateColumns: `54px repeat(${cols.length}, 1fr)`, gap: 3, minWidth: 320 }}>
        <span />
        {cols.map(c => <span key={c} style={{ fontSize: 9.5, color: 'var(--on-surface-variant)', textAlign: 'center', fontWeight: 600 }}>{c}</span>)}
        {rows.map((rlabel, r) => (
          <>
            <span key={'r' + r} style={{ fontSize: 11, color: 'var(--on-surface-variant)', fontWeight: 600, display: 'flex', alignItems: 'center' }}>{rlabel}</span>
            {cols.map((_, cIdx) => {
              const v = values[r]?.[cIdx] || 0;
              const op = v === 0 ? 0.06 : 0.15 + (v / max) * 0.85;
              return <div key={r + '-' + cIdx} title={`${rlabel} ${cols[cIdx]}: ${v}`} style={{ aspectRatio: '1', borderRadius: 5, background: color, opacity: op, minHeight: 22 }} />;
            })}
          </>
        ))}
      </div>
    </div>
  );
}
