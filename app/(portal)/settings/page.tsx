'use client';
import { useState, useEffect } from 'react';
import { Icon, Button, Card, IconChip, Serif, Eyebrow, Input } from '@/components/ui';
import { useUser, useToastCtx } from '../layout';

const THEMES = [
  { id: '', label: 'Academic Hearth', icon: 'local_library', sub: 'Teplá hnedá paleta' },
  { id: 'spsit', label: 'SPSIT', icon: 'computer', sub: 'Modrá — SPSKNM Nové Mesto' },
];

export default function SettingsPage() {
  const { user, refetchPinned } = useUser();
  const { flash } = useToastCtx();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [notif, setNotif] = useState({ email: true, push: false, weekly: true, test: true });
  const [currentTheme, setCurrentTheme] = useState('');

  useEffect(() => {
    if (user) { setName(user.name); setEmail(user.email); }
    fetch('/api/subjects').then(r => r.json()).then(setAllSubjects);
    fetch('/api/user/subjects').then(r => r.json()).then(setUserData);
    try { setCurrentTheme(localStorage.getItem('theme') || ''); } catch {}
  }, [user]);

  const applyTheme = (id: string) => {
    try {
      if (id) {
        localStorage.setItem('theme', id);
        document.documentElement.dataset.theme = id;
      } else {
        localStorage.removeItem('theme');
        delete document.documentElement.dataset.theme;
      }
      setCurrentTheme(id);
      flash(`Téma zmenená na ${THEMES.find(t => t.id === id)?.label}`);
    } catch {}
  };

  const saveProfile = async () => {
    setSaving(true);
    const body: any = { name, email };
    if (password) body.password = password;
    await fetch('/api/user/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setSaving(false);
    flash('Profil uložený!');
  };

  const togglePin = async (subjectId: string) => {
    const isPinned = (userData?.pinned || []).some((s: any) => s.id === subjectId);
    await fetch(`/api/subjects/${subjectId}/pin`, { method: isPinned ? 'DELETE' : 'POST' });
    const d = await fetch('/api/user/subjects').then(r => r.json());
    setUserData(d);
    refetchPinned();
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
    <button onClick={() => onChange(!val)} style={{ width: 44, height: 24, borderRadius: 9999, background: val ? 'var(--primary)' : 'var(--surface-container-high)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background .2s', flex: 'none' }}>
      <div style={{ width: 18, height: 18, borderRadius: 9999, background: '#fff', position: 'absolute', top: 3, left: val ? 23 : 3, transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,.2)' }} />
    </button>
  );

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <Card pad={24} radius={12} style={{ marginBottom: 20 }}>
      <Serif size={20} weight={600} style={{ display: 'block', marginBottom: 20 }}>{title}</Serif>
      {children}
    </Card>
  );

  const Row = ({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--outline-variant)' }}>
      <div><div style={{ fontSize: 14, fontWeight: 600 }}>{label}</div>{sub && <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 2 }}>{sub}</div>}</div>
      {children}
    </div>
  );

  const selectedIds = new Set((userData?.selected || []).map((s: any) => s.id));
  const pinnedIds = new Set((userData?.pinned || []).map((s: any) => s.id));

  return (
    <div style={{ maxWidth: 740 }}>
      <header style={{ marginBottom: 32 }}>
        <Eyebrow>Účet</Eyebrow>
        <Serif size={52} weight={700} style={{ letterSpacing: '-.02em', display: 'block', margin: '8px 0' }}>Nastavenia</Serif>
      </header>

      <Section title="Profil">
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 24 }}>
          <div style={{ width: 72, height: 72, borderRadius: 9999, background: 'var(--primary-fixed)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid var(--outline-variant)', flex: 'none' }}>
            <Serif size={28} weight={700} style={{ color: 'var(--primary)' }}>{name[0] || 'M'}</Serif>
          </div>
          <Button variant="secondary" icon="photo_camera" onClick={() => flash('Nahrávanie fotky – bude dostupné čoskoro')}>Zmeniť foto</Button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="Celé meno" value={name} onChange={e => setName(e.target.value)} icon="person" />
          <Input label="E-mailová adresa" type="email" value={email} onChange={e => setEmail(e.target.value)} icon="mail" />
          <Input label="Nové heslo (nechaj prázdne pre zachovanie)" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} icon="lock" />
          <Button onClick={saveProfile} disabled={saving} style={{ alignSelf: 'flex-start' }}>
            {saving ? 'Ukladám…' : 'Uložiť zmeny'}
          </Button>
        </div>
      </Section>

      {/* Subject management */}
      <Section title="Moje predmety">
        <div style={{ fontSize: 14, color: 'var(--on-surface-variant)', marginBottom: 20 }}>
          Vyber predmety, ktoré maturuješ. Pripnuté predmety sa zobrazia v navigácii.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {allSubjects.map(s => {
            const isSelected = selectedIds.has(s.id);
            const isPinned = pinnedIds.has(s.id);
            return (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10, border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--outline-variant)'}`, background: isSelected ? 'var(--primary-fixed)' : 'var(--surface-container-lowest)', transition: 'all .2s' }}>
                <IconChip name={s.icon} size={36} radius={8} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name_sk}</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => togglePin(s.id)} title={isPinned ? 'Odopnúť' : 'Pripnúť'} disabled={!isSelected}
                    style={{ width: 28, height: 28, borderRadius: 6, background: isPinned ? 'rgba(132,79,34,.15)' : 'var(--surface-container-high)', border: 'none', cursor: isSelected ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isPinned ? 'var(--primary)' : 'var(--on-surface-variant)', opacity: isSelected ? 1 : 0.4, transition: 'all .2s' }}>
                    <Icon name="push_pin" size={14} fill={isPinned ? 1 : 0} />
                  </button>
                  <button onClick={() => toggleSelect(s.id)}
                    style={{ width: 28, height: 28, borderRadius: 6, background: isSelected ? 'var(--primary)' : 'var(--surface-container-high)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isSelected ? '#fff' : 'var(--on-surface-variant)', transition: 'all .2s' }}>
                    <Icon name={isSelected ? 'check' : 'add'} size={14} />
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

      <Section title="Vzhľad">
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {THEMES.map(t => {
            const active = currentTheme === t.id;
            return (
              <button key={t.id} onClick={() => applyTheme(t.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderRadius: 10, border: `2px solid ${active ? 'var(--primary)' : 'var(--outline-variant)'}`, background: active ? 'var(--primary-fixed)' : 'var(--surface-container-lowest)', color: active ? 'var(--primary)' : 'var(--on-surface)', cursor: 'pointer', transition: 'all .2s', textAlign: 'left', fontFamily: 'var(--font-sans)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: active ? 'var(--primary)' : 'var(--surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                  <Icon name={t.icon} size={18} style={{ color: active ? '#fff' : 'var(--on-surface-variant)' }} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{t.label}</div>
                  <div style={{ fontSize: 12, color: active ? 'var(--on-primary-fixed-variant)' : 'var(--on-surface-variant)', marginTop: 2 }}>{t.sub}</div>
                </div>
                {active && <Icon name="check_circle" size={18} style={{ marginLeft: 'auto', color: 'var(--primary)' }} />}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Bezpečnosť">
        <Row label="Dvojfaktorové overenie" sub="Zatiaľ nezapnuté">
          <Button variant="secondary" icon="security" onClick={() => flash('2FA bude dostupné čoskoro')}>Zapnúť 2FA</Button>
        </Row>
        <Row label="Aktívne session" sub="1 aktívna session">
          <Button variant="secondary" icon="devices" onClick={() => flash('Zobrazujem aktívne session…')}>Spravovať</Button>
        </Row>
        <div style={{ marginTop: 20 }}>
          <Button variant="danger" icon="logout" onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/login'; }}>Odhlásiť sa</Button>
        </div>
      </Section>
    </div>
  );
}
