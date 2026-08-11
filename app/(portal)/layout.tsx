'use client';
import { useState, useEffect, useRef, createContext, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Icon, Button, Serif, Toast, Avatar, useMediaQuery, canHover } from '@/components/ui';
import { SessionProvider, useSession } from '@/components/session';
import { useT, subjectName } from '@/components/i18n';

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

  // Lock the page behind the drawer so only the drawer scrolls.
  useEffect(() => {
    if (!isMobile) return;
    document.body.classList.toggle('mkb-locked', drawerOpen);
    return () => document.body.classList.remove('mkb-locked');
  }, [drawerOpen, isMobile]);

  // Escape closes the drawer.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrawerOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  // Swipe left on the drawer to dismiss it.
  const touch = useRef<{ x: number; y: number } | null>(null);
  const onDrawerTouchStart = (e: React.TouchEvent) => {
    touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onDrawerTouchEnd = (e: React.TouchEvent) => {
    if (!touch.current) return;
    const dx = e.changedTouches[0].clientX - touch.current.x;
    const dy = e.changedTouches[0].clientY - touch.current.y;
    if (dx < -55 && Math.abs(dx) > Math.abs(dy)) setDrawerOpen(false);
    touch.current = null;
  };

  const role = user?.role || '';
  const staffOnly = role === 'admin' || role === 'owner';

  // Grouped admin navigation (staff) — clear sections in the left panel
  const adminGroups = [
    { title: t('Prehľad'), items: [
      { href: '/admin', icon: 'space_dashboard', label: t('Prehľad'), exact: true },
      { href: '/admin/analytics', icon: 'monitoring', label: t('Analytika') },
    ] },
    { title: t('Správa'), items: [
      { href: '/admin/users', icon: 'group', label: t('Používatelia') },
      { href: '/admin/content', icon: 'library_books', label: t('Obsah a učenie') },
    ] },
    { title: t('Systém'), items: [
      { href: '/admin/logs', icon: 'receipt_long', label: t('Logy') },
      { href: '/admin/system', icon: 'monitor_heart', label: t('Stav systému') },
    ] },
    ...(role === 'owner' ? [{ title: t('Vlastník'), items: [
      { href: '/owner', icon: 'manage_accounts', label: t('Vlastník'), exact: true },
    ] }] : []),
  ];

  const navItems = [
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
        { href: '/admin', icon: 'space_dashboard', label: t('Prehľad'), exact: true },
        { href: '/admin/analytics', icon: 'monitoring', label: t('Analytika') },
        { href: '/admin/users', icon: 'group', label: t('Ľudia') },
        { href: '/admin/system', icon: 'monitor_heart', label: t('Systém') },
      ]
    : [
        { href: '/dashboard', icon: 'dashboard', label: t('Domov') },
        { href: '/notes', icon: 'edit_note', label: t('Poznámky') },
        { href: '/materials', icon: 'menu_book', label: t('Materiály') },
        { href: '/subjects', icon: 'school', label: t('Predmety') },
      ];

  const logout = async () => { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/login'); };
  const isActive = (href: string, exact?: boolean) => exact ? pathname === href : (pathname === href || pathname.startsWith(href + '/'));

  return (
    <UserContext.Provider value={{ user, pinnedSubjects, userData, refetchPinned: fetchUserData, refetchUserData: fetchUserData }}>
      <ToastContext.Provider value={{ flash }}>
        <SessionProvider subjects={userData?.selected || pinnedSubjects} onFlash={flash}>
          <div className="mkb-shell" style={{ display: 'flex' }}>
            {/* Mobile top bar */}
            <div className="mkb-mobilebar" style={{ background: 'var(--surface-container-low)', borderBottom: '1px solid var(--outline-variant)' }}>
              <button onClick={() => setDrawerOpen(true)} aria-label={t('Otvoriť menu')} aria-expanded={drawerOpen} className="mkb-tap"
                style={{ color: 'var(--on-surface)', padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, flex: 'none' }}>
                <Icon name="menu" size={24} />
              </button>
              <Link href={staffOnly ? '/admin' : '/dashboard'} style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                <Serif size={18} weight={700} style={{ color: 'var(--on-surface)', whiteSpace: 'nowrap' }}>Maturita<span style={{ color: 'var(--primary)' }}>KB</span></Serif>
              </Link>
              <div style={{ flex: 1 }} />
              {!staffOnly && <MobileSessionButton />}
              <Link href="/settings" aria-label={t('Nastavenia')} className="mkb-tap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                <Avatar name={user?.name} size={32} />
              </Link>
            </div>

            {/* Drawer overlay */}
            <div className={'mkb-drawer-overlay' + (drawerOpen ? ' open' : '')} onClick={() => setDrawerOpen(false)} aria-hidden />

            {/* Sidebar */}
            <nav className={'mkb-sidebar' + (drawerOpen ? ' open' : '')}
              aria-hidden={isMobile && !drawerOpen}
              onTouchStart={onDrawerTouchStart} onTouchEnd={onDrawerTouchEnd}
              style={{ width: 272, height: '100vh', position: 'sticky', top: 0, flex: 'none', background: 'var(--surface-container-low)', borderRight: '1px solid var(--outline-variant)', display: 'flex', flexDirection: 'column', padding: 16, overflowY: 'auto' }}>
              {/* Logo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '8px 8px 4px', marginBottom: 18 }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--inverse-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                  <Icon name="bookmark" size={22} fill={1} style={{ color: 'var(--inverse-on-surface)' }} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <Serif size={20} weight={700} style={{ display: 'block', lineHeight: 1.1 }}>
                    Maturita<span style={{ color: 'var(--primary)' }}>KB</span>
                  </Serif>
                  <div style={{ fontSize: 11, color: 'var(--on-surface-variant)', marginTop: 1, fontWeight: 500 }}>{staffOnly ? t('Administrácia') : t('Študentský portál')}</div>
                </div>
                {/* Close — drawer only */}
                <button onClick={() => setDrawerOpen(false)} aria-label={t('Zavrieť menu')} className="mkb-only-mobile-flex mkb-tap"
                  style={{ display: 'none', alignItems: 'center', justifyContent: 'center', borderRadius: 10, color: 'var(--on-surface-variant)', flex: 'none' }}>
                  <Icon name="close" size={22} />
                </button>
              </div>

              {!staffOnly && <SessionButton />}

              {/* Main nav */}
              <div style={{ flex: 1 }}>
                {staffOnly ? (
                  adminGroups.map(group => (
                    <div key={group.title} style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', padding: '0 14px', marginBottom: 8 }}>{group.title}</div>
                      {group.items.map(it => <NavItem key={it.href} href={it.href} icon={it.icon} label={it.label} active={isActive(it.href, (it as any).exact)} />)}
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', padding: '0 14px', marginBottom: 8 }}>{t('Hlavné')}</div>
                )}
                {!staffOnly && navItems.map(it => <NavItem key={it.href} {...it} active={isActive(it.href)} />)}

                {!staffOnly && pinnedSubjects.length > 0 && (
                  <>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', padding: '12px 14px 8px', marginTop: 8 }}>{t('Pripnuté predmety')}</div>
                    {pinnedSubjects.map(s => {
                      const on = isActive(`/subjects/${s.slug}`);
                      return (
                        <Link key={s.id} href={`/subjects/${s.slug}`}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, marginBottom: 2, fontSize: 13.5, fontWeight: 600, color: on ? 'var(--on-primary-fixed-variant)' : 'var(--on-surface-variant)', background: on ? 'var(--primary-fixed)' : 'transparent', transition: 'background .2s, color .2s' }}
                          onMouseEnter={e => { if (!on && canHover()) e.currentTarget.style.background = 'var(--surface-container-high)'; }}
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
                  <button onClick={logout} className="mkb-tap" aria-label={t('Odhlásiť sa')} style={{ color: 'var(--on-surface-variant)', padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, flex: 'none' }} title={t('Odhlásiť sa')}
                    onMouseEnter={e => { if (!canHover()) return; e.currentTarget.style.color = 'var(--error)'; e.currentTarget.style.background = 'var(--surface-container-high)'; }}
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
            <nav className="mkb-bottomnav" aria-label={t('Hlavné')} style={{ background: 'var(--surface-container-low)', borderTop: '1px solid var(--outline-variant)' }}>
              {bottomNav.map(it => {
                const on = isActive(it.href, (it as any).exact);
                return (
                  <Link key={it.href} href={it.href} aria-current={on ? 'page' : undefined}
                    style={{ flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, padding: '8px 2px', color: on ? 'var(--primary)' : 'var(--on-surface-variant)', transition: 'color .2s' }}>
                    <div style={{ width: 42, height: 27, borderRadius: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: on ? 'var(--primary-fixed)' : 'transparent', transition: 'background .22s cubic-bezier(.16,.84,.44,1)', flex: 'none' }}>
                      <Icon name={it.icon} size={21} fill={on ? 1 : 0} />
                    </div>
                    <span style={{ fontSize: 10.5, fontWeight: on ? 700 : 600, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.label}</span>
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

/* Compact session trigger in the mobile top bar — the sidebar button
   lives behind the drawer, so phones get a direct one. */
function MobileSessionButton() {
  const { open } = useSession();
  const { t } = useT();
  return (
    <button onClick={open} aria-label={t('Spustiť session')} className="mkb-tap"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, border: '1px solid var(--outline-variant)', background: 'var(--surface-container-lowest)', color: 'var(--on-surface)', width: 38, height: 38, flex: 'none' }}>
      <Icon name="play_arrow" size={20} fill={1} />
    </button>
  );
}

function NavItem({ href, icon, label, active, small }: { href: string; icon: string; label: string; active: boolean; small?: boolean }) {
  return (
    <Link href={href} aria-current={active ? 'page' : undefined}
      style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12, padding: small ? '10px 14px' : '12px 14px', borderRadius: 12, marginBottom: 3, fontSize: 14, fontWeight: active ? 700 : 600, color: active ? 'var(--on-primary-fixed-variant)' : 'var(--on-surface-variant)', background: active ? 'var(--primary-fixed)' : 'transparent', transition: 'background .2s, color .2s' }}
      onMouseEnter={e => { if (!active && canHover()) e.currentTarget.style.background = 'var(--surface-container-high)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
      {active && <span style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 3, height: 18, borderRadius: 9999, background: 'var(--primary)' }} />}
      <Icon name={icon} size={22} fill={active ? 1 : 0} />
      <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
    </Link>
  );
}
