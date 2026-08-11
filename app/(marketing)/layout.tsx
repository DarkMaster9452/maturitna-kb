'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button, Logo, Icon, ModeToggle } from '@/components/ui';
import { useT, LangToggle } from '@/components/i18n';

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
  const { t } = useT();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    h(); window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle('mkb-locked', menuOpen);
    return () => document.body.classList.remove('mkb-locked');
  }, [menuOpen]);

  return (
    <div className="mkb-shell" style={{ display: 'flex', flexDirection: 'column' }}>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: scrolled || menuOpen ? 'var(--surface)' : 'transparent',
        padding: 'calc(13px + var(--sat)) max(16px, var(--sar)) 13px max(16px, var(--sal))',
        borderBottom: `1px solid ${scrolled ? 'var(--outline-variant)' : 'transparent'}`,
        transition: 'border-color .3s, background .3s',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <Link href="/" style={{ display: 'flex', minWidth: 0 }}><Logo /></Link>

          <div className="mkb-hide-mobile" style={{ display: 'flex', gap: 4, alignItems: 'center', background: 'var(--surface-container-low)', border: '1px solid var(--outline-variant)', borderRadius: 9999, padding: 4 }}>
            {navLinks.map(l => {
              const active = pathname === l.href;
              return (
                <Link key={l.href} href={l.href} style={{
                  fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14,
                  color: active ? 'var(--on-primary-fixed-variant)' : 'var(--on-surface-variant)',
                  background: active ? 'var(--primary-fixed)' : 'transparent',
                  padding: '8px 16px', borderRadius: 9999, transition: 'background .2s, color .2s',
                }}>{t(l.label)}</Link>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flex: 'none' }}>
            <LangToggle />
            <ModeToggle />
            <div className="mkb-hide-mobile"><Link href="/login"><Button icon="login">{t('Prihlásiť sa')}</Button></Link></div>
            <button className="mkb-tap" onClick={() => setMenuOpen(o => !o)} aria-label="Menu" aria-expanded={menuOpen} data-mobile-menu
              style={{ display: 'none', width: 40, height: 40, borderRadius: 12, border: '1px solid var(--outline-variant)', background: 'var(--surface-container-lowest)', color: 'var(--on-surface)', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
              <Icon name={menuOpen ? 'close' : 'menu'} size={22} />
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="mkb-fade-up" style={{ maxWidth: 1200, margin: '12px auto 0', display: 'flex', flexDirection: 'column', gap: 4, background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 16, padding: 10, boxShadow: 'var(--shadow-lg)', maxHeight: 'calc(100dvh - var(--topbar-h) - var(--sat) - 40px)', overflowY: 'auto', overscrollBehavior: 'contain' }}>
            {navLinks.map(l => (
              <Link key={l.href} href={l.href} style={{ display: 'flex', alignItems: 'center', minHeight: 48, padding: '12px 14px', borderRadius: 10, fontWeight: 600, fontSize: 15, color: pathname === l.href ? 'var(--primary)' : 'var(--on-surface)', background: pathname === l.href ? 'var(--primary-fixed)' : 'transparent' }}>{t(l.label)}</Link>
            ))}
            <Link href="/login" style={{ marginTop: 6 }}><Button full size="lg" icon="login">{t('Prihlásiť sa')}</Button></Link>
          </div>
        )}
      </nav>

      <main style={{
        flex: 1, position: 'relative',
        background: 'var(--background)',
        padding: '0 max(var(--pad-x), var(--sar)) 0 max(var(--pad-x), var(--sal))',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>{children}</div>
      </main>

      <footer style={{ background: 'var(--surface-container-low)', borderTop: '1px solid var(--outline-variant)', padding: 'clamp(36px, 6vw, 48px) max(var(--pad-x), var(--sar)) calc(32px + var(--sab)) max(var(--pad-x), var(--sal))' }}>
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
                {navLinks.map(l => <Link key={l.href} href={l.href} style={{ fontSize: 14, color: 'var(--on-surface-variant)' }}>{t(l.label)}</Link>)}
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

      <style>{`
        @media (max-width: 900px){
          [data-mobile-menu]{ display:flex !important; }
          .mkb-footgrid{ grid-template-columns: 1fr 1fr !important; gap: 28px !important; }
          .mkb-footgrid > :first-child{ grid-column: 1 / -1; }
        }
        @media (max-width: 420px){ .mkb-footgrid{ grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
