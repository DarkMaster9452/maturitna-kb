'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button, Logo, Icon, ModeToggle } from '@/components/ui';

const navLinks = [
  { href: '/', label: 'Domov' },
  { href: '/predmety', label: 'Predmety' },
  { href: '/zdroje', label: 'Zdroje' },
  { href: '/rozvrh', label: 'Rozvrh' },
];

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    h(); window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav className={scrolled ? 'mkb-glass' : ''} style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: scrolled ? undefined : 'transparent',
        padding: '12px clamp(16px, 4vw, 48px)',
        borderBottom: `1px solid ${scrolled ? 'var(--outline-variant)' : 'transparent'}`,
        transition: 'border-color .3s, background .3s',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <Link href="/" style={{ display: 'flex' }}><Logo /></Link>

          <div className="mkb-hide-mobile" style={{ display: 'flex', gap: 4, alignItems: 'center', background: 'var(--surface-container-low)', border: '1px solid var(--outline-variant)', borderRadius: 9999, padding: 4 }}>
            {navLinks.map(l => {
              const active = pathname === l.href;
              return (
                <Link key={l.href} href={l.href} style={{
                  fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14,
                  color: active ? 'var(--on-primary-fixed-variant)' : 'var(--on-surface-variant)',
                  background: active ? 'var(--primary-fixed)' : 'transparent',
                  padding: '8px 16px', borderRadius: 9999, transition: 'background .2s, color .2s',
                }}>{l.label}</Link>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <ModeToggle />
            <div className="mkb-hide-mobile"><Link href="/login"><Button icon="login">Prihlásiť sa</Button></Link></div>
            <button className="mkb-tap" onClick={() => setMenuOpen(o => !o)} aria-label="Menu" data-mobile-menu
              style={{ display: 'none', width: 40, height: 40, borderRadius: 12, border: '1px solid var(--outline-variant)', background: 'var(--surface-container-lowest)', color: 'var(--on-surface)', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={menuOpen ? 'close' : 'menu'} size={22} />
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="mkb-fade-up" style={{ maxWidth: 1200, margin: '12px auto 0', display: 'flex', flexDirection: 'column', gap: 4, background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 16, padding: 10, boxShadow: 'var(--shadow-card)' }}>
            {navLinks.map(l => (
              <Link key={l.href} href={l.href} style={{ padding: '12px 14px', borderRadius: 10, fontWeight: 600, fontSize: 15, color: pathname === l.href ? 'var(--primary)' : 'var(--on-surface)', background: pathname === l.href ? 'var(--primary-fixed)' : 'transparent' }}>{l.label}</Link>
            ))}
            <Link href="/login" style={{ marginTop: 6 }}><Button full icon="login">Prihlásiť sa</Button></Link>
          </div>
        )}
      </nav>

      <main style={{
        flex: 1, position: 'relative',
        background: `radial-gradient(62% 48% at 12% -4%, color-mix(in srgb, var(--primary) 14%, transparent), transparent 70%), radial-gradient(52% 42% at 92% 4%, color-mix(in srgb, var(--tertiary) 14%, transparent), transparent 70%), var(--background)`,
        padding: '0 clamp(16px, 4vw, 48px)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>{children}</div>
      </main>

      <footer style={{ background: 'var(--surface-container-low)', borderTop: '1px solid var(--outline-variant)', padding: '48px clamp(16px, 4vw, 48px) 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="mkb-footgrid" style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 1.5fr) repeat(2, 1fr)', gap: 32, marginBottom: 36 }}>
            <div>
              <Logo />
              <p style={{ fontSize: 14, color: 'var(--on-surface-variant)', lineHeight: 1.6, marginTop: 14, maxWidth: 320 }}>
                Okruhy, materiály, poznámky a testy pre všetky maturitné predmety — prehľadne, moderne a na jednom mieste.
              </p>
            </div>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', marginBottom: 14 }}>Platforma</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {navLinks.map(l => <Link key={l.href} href={l.href} style={{ fontSize: 14, color: 'var(--on-surface-variant)' }}>{l.label}</Link>)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', marginBottom: 14 }}>Účet</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Link href="/login" style={{ fontSize: 14, color: 'var(--on-surface-variant)' }}>Prihlásenie</Link>
                <Link href="/dashboard" style={{ fontSize: 14, color: 'var(--on-surface-variant)' }}>Dashboard</Link>
                <Link href="/support" style={{ fontSize: 14, color: 'var(--on-surface-variant)' }}>Podpora</Link>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', paddingTop: 24, borderTop: '1px solid var(--outline-variant)', fontSize: 13, color: 'var(--on-surface-variant)' }}>
            <span>© {new Date().getFullYear()} MaturitaKB</span>
            <span>Vytvorené pre maturantov · Next.js</span>
          </div>
        </div>
      </footer>

      <style>{`@media (max-width: 900px){ [data-mobile-menu]{ display:flex !important; } .mkb-footgrid{ grid-template-columns: 1fr 1fr !important; } }`}</style>
    </div>
  );
}
