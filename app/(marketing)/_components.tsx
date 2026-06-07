'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Icon } from '@/components/ui';

export function SectionCard({ icon, label, desc, cta, href, highlight }: {
  icon: string; label: string; desc: string; cta: string; href: string; highlight?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: highlight
          ? hovered ? 'var(--primary)' : 'linear-gradient(135deg, var(--primary) 0%, #6366f1 100%)'
          : 'var(--surface-container-lowest)',
        border: `1px solid ${highlight ? 'transparent' : hovered ? 'var(--primary)' : 'var(--outline-variant)'}`,
        borderRadius: 16, padding: 28, cursor: 'pointer', display: 'flex', flexDirection: 'column',
        boxShadow: hovered
          ? highlight ? '0 12px 40px rgba(79,70,229,.35)' : 'var(--shadow-card-hover)'
          : highlight ? '0 4px 20px rgba(79,70,229,.2)' : 'var(--shadow-card)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)', transition: 'all .25s',
      }}>
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: highlight ? 'rgba(255,255,255,.2)' : 'var(--primary-fixed)',
        color: highlight ? '#fff' : 'var(--primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
      }}><Icon name={icon} size={26} /></div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 600, color: highlight ? '#fff' : 'var(--on-surface)', marginBottom: 10, lineHeight: 1.3 }}>{label}</div>
      <div style={{ fontSize: 14, lineHeight: 1.55, color: highlight ? 'rgba(255,255,255,.8)' : 'var(--on-surface-variant)', flex: 1, marginBottom: 20 }}>{desc}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: highlight ? 'rgba(255,255,255,.9)' : 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
        {cta} <Icon name="arrow_forward" size={15} />
      </div>
    </Link>
  );
}

export function BackLink() {
  return (
    <Link href="/" style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-sans)',
      fontSize: 14, fontWeight: 600, color: 'var(--on-surface-variant)', padding: '6px 0', marginBottom: 32,
    }}>
      <Icon name="arrow_back" size={18} /> Späť na úvod
    </Link>
  );
}
