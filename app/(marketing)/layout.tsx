'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button, Logo } from '@/components/ui';

const navLinks = [
  { href: '/', label: 'Domov' },
  { href: '/zdroje', label: 'Zdroje' },
  { href: '/predmety', label: 'Predmety' },
  { href: '/rozvrh', label: 'Rozvrh' },
];

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: scrolled ? 'rgba(250,251,255,.95)' : 'var(--surface)',
        backdropFilter: 'blur(12px)',
        padding: '14px clamp(16px, 4vw, 48px)',
        borderBottom: `1px solid ${scrolled ? 'var(--outline-variant)' : 'transparent'}`,
        transition: 'all .3s',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <Link href="/" style={{ display: 'flex' }}><Logo /></Link>
          <div className="mkb-hide-mobile" style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
            {navLinks.map(l => {
              const active = pathname === l.href;
              return (
                <Link key={l.href} href={l.href} style={{
                  fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14, letterSpacing: '.04em',
                  color: active ? 'var(--primary)' : 'var(--on-surface-variant)',
                  borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent',
                  paddingBottom: 2, transition: 'color .2s',
                }}>{l.label}</Link>
              );
            })}
          </div>
          <Link href="/login"><Button>Prihlásenie študenta</Button></Link>
        </div>
      </nav>

      <main style={{ flex: 1, background: 'radial-gradient(circle at 50% 0%, #fafbff 0%, #f0f2ff 100%)', padding: '0 clamp(16px, 4vw, 48px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>{children}</div>
      </main>

      <footer style={{ background: 'var(--surface-container)', padding: '32px clamp(16px, 4vw, 48px)', borderTop: '1px solid var(--outline-variant)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <Logo />
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {navLinks.map(l => (
              <Link key={l.href} href={l.href} style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{l.label}</Link>
            ))}
          </div>
          <div style={{ fontSize: 14, color: 'var(--on-surface-variant)' }}>© {new Date().getFullYear()} Maturita Knowledge Base</div>
        </div>
      </footer>
    </div>
  );
}
