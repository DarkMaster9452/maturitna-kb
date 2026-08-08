'use client';
import { useState, useEffect } from 'react';
import { Icon, Button, Card, IconChip, Serif, Eyebrow, Input, Avatar, useAppearance, type Mode, type Accent } from '@/components/ui';
import { fireConfetti } from '@/components/motion';
import { useLang } from '@/components/i18n';
import { useUser, useToastCtx } from '../layout';

const LANGS: { id: 'sk' | 'en'; label: string; sub: string; flag: string }[] = [
  { id: 'sk', label: 'Slovenčina', sub: 'Predvolený', flag: '🇸🇰' },
  { id: 'en', label: 'Angličtina', sub: 'Druhý jazyk', flag: '🇬🇧' },
];

const ACCENTS: { id: Accent; label: string; sub: string; swatch: string }[] = [
  { id: '', label: 'Emerald', sub: 'Predvolený akcent', swatch: '#0a7d54' },
  { id: 'spsit', label: 'SPSIT', sub: 'Modrý akcent — SPŠ IT', swatch: '#1466c8' },
  { id: 'amber', label: 'Amber', sub: 'Teplý oranžový', swatch: '#b45309' },
  { id: 'rose', label: 'Rose', sub: 'Sýta ružová', swatch: '#be123c' },
];

const MODES: { id: Mode; label: string; icon: string }[] = [
  { id: 'light', label: 'Svetlý', icon: 'light_mode' },
  { id: 'dark', label: 'Tmavý', icon: 'dark_mode' },
  { id: 'system', label: 'Podľa systému', icon: 'contrast' },
];

export default function SettingsPage() {
  const { user, refetchPinned } = useUser();
  const { flash } = useToastCtx();
  const { mode, accent, changeMode, changeAccent } = useAppearance();
  const { lang, setLang } = useLang();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [notif, setNotif] = useState({ email: true, push: false, weekly: true, test: true });
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [teachers, setTeachers] = useState<any[]>([]);

  useEffect(() => {
    if (user) { setName(user.name); setEmail(user.email); }
    fetch('/api/subjects').then(r => r.json()).then(d => setAllSubjects(Array.isArray(d) ? d : []));
    fetch('/api/user/subjects').then(r => r.json()).then(setUserData);
    fetch('/api/join').then(r => r.json()).then(d => setTeachers(Array.isArray(d.teachers) ? d.teachers : [])).catch(() => {});
  }, [user]);

  const joinClass = async () => {
    if (!joinCode.trim()) return;
    setJoining(true);
    try {
      const res = await fetch('/api/join', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: joinCode }) });
      const d = await res.json();
      if (!res.ok) { flash(d.error || 'Neplatný kód.'); setJoining(false); return; }
      setJoinCode(''); fireConfetti();
      flash(`Pripojil si sa k učiteľovi ${d.teacher}!`);
      fetch('/api/join').then(r => r.json()).then(x => setTeachers(x.teachers || []));
    } catch { flash('Sieťová chyba.'); }
    setJoining(false);
  };

  const saveProfile = async () => {
    setSaving(true);
    const body: any = { name, email };
    if (password) body.password = password;
    await fetch('/api/user/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setSaving(false); setPassword('');
    flash('Profil uložený!');
  };

  const togglePin = async (subjectId: string) => {
    const isPinned = (userData?.pinned || []).some((s: any) => s.id === subjectId);
    await fetch(`/api/subjects/${subjectId}/pin`, { method: isPinned ? 'DELETE' : 'POST' });
    const d = await fetch('/api/user/subjects').then(r => r.json());
    setUserData(d); refetchPinned();
    flash(isPinned ? 'Predmet odopnutý' : 'Predmet pripnutý');
  };

  const toggleSelect = async (subjectId: string) => {
    const current = (userData?.selected || []).map((s: any) => s.id);
    const newIds = current.includes(subjectId) ? current.filter((id: string) => id !== subjectId) : [...current, subjectId];
    await fetch('/api/user/subjects', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subjectIds: newIds }) });
    const d = await fetch('/api/user/subjects').then(r => r.json());
    setUserData(d);
    flash(current.includes(subjectId) ? 'Predmet odobratý' : 'Predmet pridaný');
  };

  const Toggle = ({ val, onChange }: { val: boolean; onChange: (v: boolean) => void }) => (
    <button onClick={() => onChange(!val)} style={{ width: 46, height: 26, borderRadius: 9999, background: val ? 'var(--primary)' : 'var(--surface-container-high)', position: 'relative', transition: 'background .2s', flex: 'none' }}>
      <div style={{ width: 20, height: 20, borderRadius: 9999, background: '#fff', position: 'absolute', top: 3, left: val ? 23 : 3, transition: 'left .22s cubic-bezier(.16,.84,.44,1)', boxShadow: '0 1px 4px rgba(0,0,0,.25)' }} />
    </button>
  );

  const Section = ({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) => (
    <Card pad={24} glow style={{ marginBottom: 20 }}>
      <Serif size={20} weight={600} style={{ display: 'block' }}>{title}</Serif>
      {desc && <div style={{ fontSize: 13.5, color: 'var(--on-surface-variant)', marginTop: 4, marginBottom: 20 }}>{desc}</div>}
      {!desc && <div style={{ height: 20 }} />}
      {children}
    </Card>
  );

  const Row = ({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, padding: '13px 0', borderBottom: '1px solid var(--outline-variant)' }}>
      <div><div style={{ fontSize: 14.5, fontWeight: 600 }}>{label}</div>{sub && <div style={{ fontSize: 12.5, color: 'var(--on-surface-variant)', marginTop: 2 }}>{sub}</div>}</div>
      {children}
    </div>
  );

  const selectedIds = new Set((userData?.selected || []).map((s: any) => s.id));
  const pinnedIds = new Set((userData?.pinned || []).map((s: any) => s.id));

  return (
    <div style={{ maxWidth: 760 }}>
      <header style={{ marginBottom: 28 }}>
        <Eyebrow icon="settings">Účet</Eyebrow>
        <Serif size={44} weight={700} style={{ display: 'block', margin: '10px 0', fontSize: 'clamp(30px, 6vw, 44px)' }}>Nastavenia</Serif>
      </header>

      <Section title="Profil">
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 22 }}>
          <div style={{ width: 72, height: 72, borderRadius: 9999, background: 'var(--inverse-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--inverse-on-surface)' }}>{(name[0] || 'M').toUpperCase()}</span>
          </div>
          <Button variant="secondary" icon="photo_camera" onClick={() => flash('Nahrávanie fotky — bude dostupné čoskoro')}>Zmeniť foto</Button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="Celé meno" value={name} onChange={e => setName(e.target.value)} icon="person" />
          <Input label="E-mailová adresa" type="email" value={email} onChange={e => setEmail(e.target.value)} icon="mail" />
          <Input label="Nové heslo (nechaj prázdne pre zachovanie)" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} icon="lock" />
          <Button onClick={saveProfile} disabled={saving} icon="save" style={{ alignSelf: 'flex-start' }}>
            {saving ? 'Ukladám…' : 'Uložiť zmeny'}
          </Button>
        </div>
      </Section>

      {/* Appearance */}
      <Section title="Vzhľad" desc="Prispôsob si farebnú tému a svetlý či tmavý režim.">
        <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', marginBottom: 12 }}>Farebná téma</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
          {ACCENTS.map(t => {
            const active = accent === t.id;
            return (
              <button key={t.id} onClick={() => { changeAccent(t.id); flash(`Téma: ${t.label}`); }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 14, border: `2px solid ${active ? 'var(--primary)' : 'var(--outline-variant)'}`, background: active ? 'var(--primary-fixed)' : 'var(--surface-container-lowest)', textAlign: 'left' }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: t.swatch, flex: 'none', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.05)' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{t.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 1 }}>{t.sub}</div>
                </div>
                {active && <Icon name="check_circle" size={20} fill={1} style={{ color: 'var(--primary)' }} />}
              </button>
            );
          })}
        </div>

        <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', marginBottom: 12 }}>Režim</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {MODES.map(m => {
            const active = mode === m.id;
            return (
              <button key={m.id} onClick={() => { changeMode(m.id); flash(`Režim: ${m.label}`); }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 10px', borderRadius: 14, border: `2px solid ${active ? 'var(--primary)' : 'var(--outline-variant)'}`, background: active ? 'var(--primary-fixed)' : 'var(--surface-container-lowest)', color: active ? 'var(--primary)' : 'var(--on-surface-variant)' }}>
                <Icon name={m.icon} size={24} fill={active ? 1 : 0} />
                <span style={{ fontSize: 13, fontWeight: 700 }}>{m.label}</span>
              </button>
            );
          })}
        </div>

        <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', margin: '24px 0 12px' }}>Jazyk</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {LANGS.map(l => {
            const active = lang === l.id;
            return (
              <button key={l.id} onClick={() => { setLang(l.id); flash(l.id === 'en' ? 'Language: English' : 'Jazyk: Slovenčina'); }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 14, border: `2px solid ${active ? 'var(--primary)' : 'var(--outline-variant)'}`, background: active ? 'var(--primary-fixed)' : 'var(--surface-container-lowest)', textAlign: 'left' }}>
                <span style={{ fontSize: 26, flex: 'none' }}>{l.flag}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{l.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 1 }}>{l.sub}</div>
                </div>
                {active && <Icon name="check_circle" size={20} fill={1} style={{ color: 'var(--primary)' }} />}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Subjects */}
      <Section title="Moje predmety" desc="Vyber predmety, ktoré maturuješ. Pripnuté predmety sa zobrazia v navigácii.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
          {allSubjects.map(s => {
            const isSelected = selectedIds.has(s.id);
            const isPinned = pinnedIds.has(s.id);
            return (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14, border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--outline-variant)'}`, background: isSelected ? 'var(--primary-fixed)' : 'var(--surface-container-lowest)', transition: 'all .2s' }}>
                <IconChip name={s.icon} size={36} radius={10} grad={isSelected} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name_sk}</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => togglePin(s.id)} title={isPinned ? 'Odopnúť' : 'Pripnúť'} disabled={!isSelected}
                    style={{ width: 30, height: 30, borderRadius: 8, background: isPinned ? 'var(--primary-fixed-dim)' : 'var(--surface-container-high)', cursor: isSelected ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isPinned ? 'var(--primary)' : 'var(--on-surface-variant)', opacity: isSelected ? 1 : 0.4 }}>
                    <Icon name="push_pin" size={16} fill={isPinned ? 1 : 0} />
                  </button>
                  <button onClick={() => toggleSelect(s.id)}
                    style={{ width: 30, height: 30, borderRadius: 8, background: isSelected ? 'var(--primary)' : 'var(--surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isSelected ? 'var(--on-primary)' : 'var(--on-surface-variant)' }}>
                    <Icon name={isSelected ? 'check' : 'add'} size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="Notifikácie">
        <Row label="E-mailové notifikácie" sub="Týždenné prehľady a pripomienky testov"><Toggle val={notif.email} onChange={v => { setNotif({ ...notif, email: v }); flash(v ? 'E-mail notifikácie zapnuté' : 'E-mail notifikácie vypnuté'); }} /></Row>
        <Row label="Push notifikácie" sub="Upozornenia prehliadača na nové materiály"><Toggle val={notif.push} onChange={v => { setNotif({ ...notif, push: v }); flash(v ? 'Push notifikácie zapnuté' : 'Push notifikácie vypnuté'); }} /></Row>
        <Row label="Týždenný report" sub="Súhrn každý pondelok ráno"><Toggle val={notif.weekly} onChange={v => { setNotif({ ...notif, weekly: v }); flash(v ? 'Týždenný report zapnutý' : 'Týždenný report vypnutý'); }} /></Row>
        <Row label="Pripomienky testov" sub="Upozornenie pred naplánovanými testami"><Toggle val={notif.test} onChange={v => { setNotif({ ...notif, test: v }); flash(v ? 'Pripomienky testov zapnuté' : 'Pripomienky testov vypnuté'); }} /></Row>
      </Section>

      <Section title="Trieda" desc="Pripoj sa k učiteľovi pomocou pozývacieho kódu, ktorý ti dá.">
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: teachers.length ? 18 : 0 }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <Input label="Pozývací kód" placeholder="napr. K7M2QP" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} icon="vpn_key" onKeyDown={e => e.key === 'Enter' && joinClass()} />
          </div>
          <Button icon="group_add" onClick={joinClass} disabled={joining}>{joining ? 'Pripájam…' : 'Pripojiť sa'}</Button>
        </div>
        {teachers.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="mkb-eyebrow" style={{ letterSpacing: '.12em' }}>Tvoji učitelia</div>
            {teachers.map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 12, border: '1px solid var(--outline-variant)', background: 'var(--surface-container-low)' }}>
                <Avatar name={t.name} size={36} />
                <div><div style={{ fontSize: 14, fontWeight: 600 }}>{t.name}</div><div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{t.email}</div></div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Bezpečnosť">
        <Row label="Dvojfaktorové overenie" sub="Zatiaľ nezapnuté">
          <Button variant="secondary" icon="security" onClick={() => flash('2FA bude dostupné čoskoro')}>Zapnúť 2FA</Button>
        </Row>
        <Row label="Aktívne relácie" sub="1 aktívna relácia">
          <Button variant="secondary" icon="devices" onClick={() => flash('Zobrazujem aktívne relácie…')}>Spravovať</Button>
        </Row>
        <div style={{ marginTop: 20 }}>
          <Button variant="danger" icon="logout" onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/login'; }}>Odhlásiť sa</Button>
        </div>
      </Section>
    </div>
  );
}
