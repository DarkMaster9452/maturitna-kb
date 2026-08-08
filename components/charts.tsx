'use client';
import { CSSProperties } from 'react';

type Pt = { label: string; value: number };

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
export function HBars({ data, color = 'var(--primary)' }: { data: (Pt & { color?: string })[]; color?: string }) {
  const max = Math.max(1, ...data.map(d => d.value));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, width: 120, flex: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.label}</span>
          <div style={{ flex: 1, height: 10, borderRadius: 9999, background: 'var(--surface-container-high)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(d.value / max) * 100}%`, background: d.color || color, borderRadius: 9999, transition: 'width .7s cubic-bezier(.16,.84,.44,1)' }} />
          </div>
          <span className="mkb-mono" style={{ fontSize: 12, fontWeight: 700, width: 40, textAlign: 'right' }}>{d.value}</span>
        </div>
      ))}
    </div>
  );
}
