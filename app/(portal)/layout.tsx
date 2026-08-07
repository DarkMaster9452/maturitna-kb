'use client';
import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Icon, Button, Serif, Toast, Avatar, ModeToggle, useMediaQuery } from '@/components/ui';
import { SessionProvider, useSession } from '@/components/session';
import { useT, subjectName, LangToggle } from '@/components/i18n';

type User = { id: string; name: string; email: string; role: string };
type ToastCtx = { flash: (msg: string) => void };
type UserCtx = { user: User | null; pinnedSubjects: any[]; userData: any; refetchPinned: () => void; refetchUserData: () => void };

const ROLE_LABELS: Record<string, string> = { owner: 'Vlastník', admin: 'Administrátor', teacher: 'Učiteľ', student: 'Študent' };

export const ToastContext = createContext<ToastCtx>({ flash: () => {} });
export const UserContext = createContext<UserCtx>({ user: null, pinnedSubjects: [], userData: null, refetchPinned: () => {}, refetchUserData: () => {} });

export function useUser() { return useContext(UserContext); }
export function useToastCtx() { return useContext(ToastContext); }

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [pinnedSubjects, setPinnedSubjects] = useState<any[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 900px)');
  const [toast, setToast] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { t, lang } = useT();

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2400); };

  const fetchUser = async () => {
    const res = await fetch('/api/auth/me');
    if (!res.ok) { router.push('/login'); return; }
    setUser(await res.json());
  };
  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/user/subjects');
      if (res.ok) { const d = await res.json(); setUserData(d); setPinnedSubjects(d.pinned || []); }
    } catch {}
  };

  useEffect(() => { fetchUser(); fetchUserData(); }, []);
  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  const role = user?.role || '';
  const staffOnly = role === 'admin' || role === 'owner';

  const navItems = staffOnly
    ? [
        { href: '/admin', icon: 'admin_panel_settings', label: t('Admin panel') },
        ...(role === 'owner' ? [{ href: '/owner', icon: 'manage_accounts', label: t('Vlastník') }] : []),
      ]
    : [
        { href: '/dashboard', icon: 'dashboard', label: t('Dashboard') },
        { href: '/materials', icon: 'menu_book', label: t('Materiály') },
        { href: '/notes', icon: 'edit_note', label: t('Poznámky') },
        { href: '/tests', icon: 'quiz', label: t('Testy') },
        { href: '/progress', icon: 'trending_up', label: t('Môj pokrok') },
        ...(role === 'teacher' ? [{ href: '/teacher', icon: 'co_present', label: t('Moja trieda') }] : []),
      ];

  const footerItems = [
    { href: '/settings', icon: 'settings', label: t('Nastavenia') },
    { href: '/support', icon: 'help', label: t('Podpora') },
  ];

  const bottomNav = staffOnly
    ? [
        { href: '/admin', icon: 'admin_panel_settings', label: t('Admin panel') },
        { href: '/settings', icon: 'settings', label: t('Nastavenia') },
        { href: '/support', icon: 'help', label: t('Podpora') },
      ]
    : [
        { href: '/dashboard', icon: 'dashboard', label: t('Domov') },
        { href: '/notes', icon: 'edit_note', label: t('Poznámky') },
        { href: '/materials', icon: 'menu_book', label: t('Materiály') },
        { href: '/subjects', icon: 'school', label: t('Predmety') },
      ];

  const logout = async () => { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/login'); };
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <UserContext.Provider value={{ user, pinnedSubjects, userData, refetchPinned: fetchUserData, refetchUserData: fetchUserData }}>
      <ToastContext.Provider value={{ flash }}>
        <SessionProvider subjects={userData?.selected || pinnedSubjects} onFlash={flash}>
          <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Mobile top bar */}
            <div className="mkb-mobilebar" style={{ background: 'var(--surface-container-low)', borderBottom: '1px solid var(--outline-variant)' }}>
              <button onClick={() => setDrawerOpen(true)} aria-label="Otvoriť menu" className="mkb-tap" style={{ color: 'var(--on-surface)', padding: 8, display: 'flex' }}>
                <Icon name="menu" size={24} />
              </button>
              <Serif size={18} weight={700} style={{ color: 'var(--on-surface)' }}>Maturita<span style={{ color: 'var(--primary)' }}>KB</span></Serif>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}><LangToggle compact /><ModeToggle compact /></div>
            </div>

            {/* Drawer overlay */}
            <div className={'mkb-drawer-overlay' + (drawerOpen ? ' open' : '')} onClick={() => setDrawerOpen(false)} />

            {/* Sidebar */}
            <nav className={'mkb-sidebar' + (drawerOpen ? ' open' : '')} style={{ width: 272, height: '100vh', position: 'sticky', top: 0, flex: 'none', background: 'var(--surface-container-low)', borderRight: '1px solid var(--outline-variant)', display: 'flex', flexDirection: 'column', padding: 16, overflowY: 'auto' }}>
              {/* Logo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '8px 8px 4px', marginBottom: 18 }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--inverse-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="bookmark" size={22} fill={1} style={{ color: 'var(--inverse-on-surface)' }} />
                </div>
                <div>
                  <Serif size={20} weight={700} style={{ display: 'block', lineHeight: 1.1 }}>
                    Maturita<span style={{ color: 'var(--primary)' }}>KB</span>
                  </Serif>
                  <div style={{ fontSize: 11, color: 'var(--on-surface-variant)', marginTop: 1, fontWeight: 500 }}>{staffOnly ? t('Administrácia') : t('Študentský portál')}</div>
                </div>
              </div>

              {!staffOnly && <SessionButton />}

              {/* Main nav */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', padding: '0 14px', marginBottom: 8 }}>{staffOnly ? t('Správa') : t('Hlavné')}</div>
                {navItems.map(it => <NavItem key={it.href} {...it} active={isActive(it.href)} />)}

                {!staffOnly && pinnedSubjects.length > 0 && (
                  <>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', padding: '12px 14px 8px', marginTop: 8 }}>{t('Pripnuté predmety')}</div>
                    {pinnedSubjects.map(s => {
                      const on = isActive(`/subjects/${s.slug}`);
                      return (
                        <Link key={s.id} href={`/subjects/${s.slug}`}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderRadius: 12, marginBottom: 2, fontSize: 13.5, fontWeight: 600, color: on ? 'var(--on-primary-fixed-variant)' : 'var(--on-surface-variant)', background: on ? 'var(--primary-fixed)' : 'transparent', transition: 'background .2s, color .2s' }}
                          onMouseEnter={e => { if (!on) e.currentTarget.style.background = 'var(--surface-container-high)'; }}
                          onMouseLeave={e => { if (!on) e.currentTarget.style.background = 'transparent'; }}>
                          <Icon name={s.icon} size={18} fill={on ? 1 : 0} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{subjectName(s, lang)}</span>
                        </Link>
                      );
                    })}
                  </>
                )}

                {!staffOnly && (
                  <Link href="/subjects" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderRadius: 12, fontSize: 13.5, fontWeight: 600, color: 'var(--primary)', marginTop: 4 }}>
                    <Icon name="add" size={18} /> {t('Spravovať predmety')}
                  </Link>
                )}
              </div>

              {/* Footer */}
              <div style={{ borderTop: '1px solid var(--outline-variant)', paddingTop: 12, marginTop: 8 }}>
                {footerItems.map(it => <NavItem key={it.href} {...it} active={isActive(it.href)} small />)}
                <div style={{ marginTop: 12, padding: 12, borderRadius: 14, background: 'var(--surface-container)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Link href="/settings" style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                    <Avatar name={user?.name} size={36} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'Načítavam…'}</div>
                      <div style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>{t(ROLE_LABELS[role] || role || 'Používateľ')}</div>
                    </div>
                  </Link>
                  <LangToggle compact />
                  <ModeToggle compact />
                  <button onClick={logout} className="mkb-tap" style={{ color: 'var(--on-surface-variant)', padding: 6, display: 'flex', borderRadius: 8 }} title="Odhlásiť sa"
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--error)'; e.currentTarget.style.background = 'var(--surface-container-high)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--on-surface-variant)'; e.currentTarget.style.background = 'transparent'; }}>
                    <Icon name="logout" size={18} />
                  </button>
                </div>
              </div>
            </nav>

            {/* Main content */}
            <main className="mkb-main" style={{ flex: 1, minWidth: 0, overflowX: 'hidden' }}>
              <div className="mkb-fade-in">{children}</div>
            </main>

            {/* Mobile bottom navigation */}
            <nav className="mkb-bottomnav" style={{ background: 'var(--surface-container-low)', borderTop: '1px solid var(--outline-variant)' }}>
              {bottomNav.map(it => {
                const on = isActive(it.href);
                return (
                  <Link key={it.href} href={it.href} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '9px 0', color: on ? 'var(--primary)' : 'var(--on-surface-variant)' }}>
                    <div style={{ width: 40, height: 26, borderRadius: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: on ? 'var(--primary-fixed)' : 'transparent', transition: 'background .2s' }}>
                      <Icon name={it.icon} size={21} fill={on ? 1 : 0} />
                    </div>
                    <span style={{ fontSize: 10.5, fontWeight: 600 }}>{it.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
          {toast && <Toast msg={toast} onDismiss={() => setToast(null)} />}
        </SessionProvider>
      </ToastContext.Provider>
    </UserContext.Provider>
  );
}

function SessionButton() {
  const { open } = useSession();
  const { t } = useT();
  return <Button icon="play_arrow" full onClick={open} style={{ marginBottom: 18 }}>{t('Spustiť session')}</Button>;
}

function NavItem({ href, icon, label, active, small }: { href: string; icon: string; label: string; active: boolean; small?: boolean }) {
  return (
    <Link href={href}
      style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12, padding: small ? '9px 14px' : '11px 14px', borderRadius: 12, marginBottom: 3, fontSize: 14, fontWeight: active ? 700 : 600, color: active ? 'var(--on-primary-fixed-variant)' : 'var(--on-surface-variant)', background: active ? 'var(--primary-fixed)' : 'transparent', transition: 'background .2s, color .2s' }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--surface-container-high)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
      {active && <span style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 3, height: 18, borderRadius: 9999, background: 'var(--primary)' }} />}
      <Icon name={icon} size={22} fill={active ? 1 : 0} />{label}
    </Link>
  );
}
