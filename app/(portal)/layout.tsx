'use client';
import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Icon, Button, Serif, Toast } from '@/components/ui';

type User = { id: string; name: string; email: string; role: string };
type ToastCtx = { flash: (msg: string) => void };
type UserCtx = { user: User | null; pinnedSubjects: any[]; refetchPinned: () => void };

export const ToastContext = createContext<ToastCtx>({ flash: () => {} });
export const UserContext = createContext<UserCtx>({ user: null, pinnedSubjects: [], refetchPinned: () => {} });

export function useUser() { return useContext(UserContext); }
export function useToastCtx() { return useContext(ToastContext); }

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [pinnedSubjects, setPinnedSubjects] = useState<any[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2400); };

  const fetchUser = async () => {
    const res = await fetch('/api/auth/me');
    if (!res.ok) { router.push('/login'); return; }
    setUser(await res.json());
  };

  const fetchPinned = async () => {
    const res = await fetch('/api/user/subjects');
    if (res.ok) { const d = await res.json(); setPinnedSubjects(d.pinned || []); }
  };

  useEffect(() => { fetchUser(); fetchPinned(); }, []);

  const navItems = [
    { href: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { href: '/materials', icon: 'menu_book', label: 'Materiály' },
    { href: '/tests', icon: 'quiz', label: 'Testy' },
    { href: '/progress', icon: 'trending_up', label: 'Môj pokrok' },
    ...(user?.role === 'admin' ? [{ href: '/admin', icon: 'admin_panel_settings', label: 'Admin' }] : []),
  ];

  const footerItems = [
    { href: '/settings', icon: 'settings', label: 'Nastavenia' },
    { href: '/support', icon: 'help', label: 'Podpora' },
  ];

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <UserContext.Provider value={{ user, pinnedSubjects, refetchPinned: fetchPinned }}>
      <ToastContext.Provider value={{ flash }}>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          {/* Sidebar */}
          <nav style={{ width: 264, height: '100vh', position: 'sticky', top: 0, flex: 'none', background: 'var(--surface-container-low)', borderRight: '1px solid var(--outline-variant)', display: 'flex', flexDirection: 'column', padding: 16, overflowY: 'auto' }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="local_library" size={22} fill={1} style={{ color: '#fff' }} />
              </div>
              <div>
                <Serif size={20} weight={600} style={{ color: 'var(--primary)', display: 'block', lineHeight: 1.1 }}>Study Portal</Serif>
                <div style={{ fontSize: 11, color: 'var(--on-surface-variant)', marginTop: 1 }}>Academic Excellence</div>
              </div>
            </div>

            <Button icon="play_arrow" full onClick={() => flash('Štartuje 25-minútová session…')} style={{ marginBottom: 20 }}>Spustiť session</Button>

            {/* Main nav */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', padding: '0 16px', marginBottom: 8 }}>Hlavné</div>
              {navItems.map(it => <NavItem key={it.href} {...it} active={isActive(it.href)} />)}

              {/* Pinned subjects */}
              {pinnedSubjects.length > 0 && (
                <>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', padding: '12px 16px 8px', marginTop: 8 }}>Pripnuté predmety</div>
                  {pinnedSubjects.map(s => (
                    <Link key={s.id} href={`/subjects/${s.slug}`}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', borderRadius: 'var(--radius)', textDecoration: 'none', marginBottom: 2, fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: isActive(`/subjects/${s.slug}`) ? 'var(--on-primary-fixed-variant)' : 'var(--on-surface-variant)', background: isActive(`/subjects/${s.slug}`) ? 'var(--primary-fixed)' : 'transparent', transition: 'background .2s' }}
                      onMouseEnter={e => { if (!isActive(`/subjects/${s.slug}`)) e.currentTarget.style.background = 'var(--surface-container-high)'; }}
                      onMouseLeave={e => { if (!isActive(`/subjects/${s.slug}`)) e.currentTarget.style.background = 'transparent'; }}>
                      <Icon name={s.icon} size={18} fill={isActive(`/subjects/${s.slug}`) ? 1 : 0} />
                      {s.name_sk}
                    </Link>
                  ))}
                </>
              )}

              <Link href="/subjects"
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', borderRadius: 'var(--radius)', textDecoration: 'none', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: 'var(--primary)', marginTop: 4 }}>
                <Icon name="add" size={18} /> Spravovať predmety
              </Link>
            </div>

            {/* Footer */}
            <div style={{ borderTop: '1px solid var(--outline-variant)', paddingTop: 12 }}>
              {footerItems.map(it => <NavItem key={it.href} {...it} active={isActive(it.href)} small />)}
              <div style={{ marginTop: 12, padding: '12px 16px', borderRadius: 'var(--radius)', background: 'var(--surface-container)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9999, background: 'var(--primary-fixed)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                    <Serif size={13} weight={700} style={{ color: 'var(--primary)' }}>{user?.name?.[0] || 'M'}</Serif>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'Načítavam…'}</div>
                    <div style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>{user?.role === 'admin' ? 'Administrátor' : 'Študent'}</div>
                  </div>
                  <button onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)', padding: 4 }} title="Odhlásiť sa">
                    <Icon name="logout" size={16} />
                  </button>
                </div>
              </div>
            </div>
          </nav>

          {/* Main content */}
          <main style={{ flex: 1, minWidth: 0, overflowY: 'auto', padding: '48px 48px 80px' }}>
            {children}
          </main>
        </div>
        {toast && <Toast msg={toast} onDismiss={() => setToast(null)} />}
      </ToastContext.Provider>
    </UserContext.Provider>
  );
}

function NavItem({ href, icon, label, active, small }: { href: string; icon: string; label: string; active: boolean; small?: boolean }) {
  return (
    <Link href={href}
      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: small ? '8px 16px' : '11px 16px', borderRadius: 'var(--radius)', textDecoration: 'none', marginBottom: 4, fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: active ? 700 : 600, letterSpacing: '.03em', color: active ? 'var(--on-primary-fixed-variant)' : 'var(--on-surface-variant)', background: active ? 'var(--primary-fixed)' : 'transparent', transition: 'background .2s' }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--surface-container-high)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
      <Icon name={icon} size={22} fill={active ? 1 : 0} />{label}
    </Link>
  );
}
