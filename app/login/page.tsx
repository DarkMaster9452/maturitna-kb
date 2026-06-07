'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icon, Button, Logo, Input } from '@/components/ui';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) { setError('Vyplňte e-mail aj heslo.'); return; }
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Chyba pri prihlásení.'); setLoading(false); return; }
      if (!data.user.onboardingDone) { router.push('/onboarding'); }
      else if (data.user.role === 'admin') { router.push('/admin'); }
      else { router.push('/dashboard'); }
    } catch { setError('Sieťová chyba.'); setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--background)' }}>
      {/* Left */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 'clamp(24px, 5vw, 48px)' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--on-surface-variant)', fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600, marginBottom: 40, padding: 0, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'none' }}>
            <Icon name="arrow_back" size={18} /> Späť na úvodnú stránku
          </Link>
          <Logo size={28} />
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 36, fontWeight: 700, margin: '28px 0 8px', color: 'var(--on-surface)' }}>Vitajte späť</div>
          <div style={{ fontSize: 16, color: 'var(--on-surface-variant)', marginBottom: 36 }}>Prihláste sa do svojho študentského portálu.</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Input label="E-mailová adresa" type="email" placeholder="meno@skola.sk" value={email} onChange={e => setEmail(e.target.value)} icon="mail" />

            <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.04em', color: 'var(--on-surface-variant)' }}>Heslo</span>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  style={{ fontFamily: 'var(--font-sans)', fontSize: 15, background: 'var(--surface-container-low)', border: '1px solid var(--outline-variant)', borderRadius: 8, padding: '11px 44px 11px 14px', color: 'var(--on-surface)', outline: 'none', width: '100%', transition: 'border-color .2s,box-shadow .2s' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 2px rgba(132,79,34,.15)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--outline-variant)'; e.target.style.boxShadow = 'none'; }} />
                <button onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)', padding: 4 }}>
                  <Icon name={showPass ? 'visibility_off' : 'visibility'} size={18} />
                </button>
              </div>
            </label>

            {error && <div style={{ fontSize: 14, color: 'var(--error)', display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="error" size={16} />{error}</div>}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: 'var(--on-surface-variant)' }}>
                <input type="checkbox" defaultChecked style={{ accentColor: 'var(--primary)' }} /> Zapamätať si ma
              </label>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)', cursor: 'pointer' }}>Zabudnuté heslo?</span>
            </div>

            <Button onClick={handleLogin} disabled={loading} full iconAfter="chevron_right">
              {loading ? 'Prihlasovanie…' : 'Prihlásiť sa'}
            </Button>

          </div>

          <div style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: 'var(--on-surface-variant)' }}>
            Nemáte účet?{' '}
            <span style={{ color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>Požiadajte školu o prístup</span>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="mkb-hide-mobile" style={{ flex: 1, background: 'linear-gradient(135deg,var(--primary) 0%,#3730a3 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 64, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, background: 'rgba(255,255,255,.08)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 200, height: 200, background: 'rgba(255,255,255,.05)', borderRadius: '50%' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
            <Icon name="school" size={32} fill={1} style={{ color: '#fff' }} />
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 40, fontWeight: 700, color: '#fff', display: 'block', marginBottom: 16, lineHeight: 1.15 }}>
            Tvoja maturita.<br /><span style={{ fontStyle: 'italic', fontWeight: 400 }}>Tvoje pravidlá.</span>
          </div>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: 'rgba(255,255,255,.8)', maxWidth: 380, marginBottom: 48 }}>
            Tvoje okruhy, materiály a poznámky pre maturitu – prehľadne na jednom mieste.
          </p>
          {[['check_circle', 'Vlastné okruhy a materiály'], ['check_circle', 'Všetky predmety maturity'], ['check_circle', 'Sledovanie pokroku štúdia']].map(([icon, text]) => (
            <div key={text as string} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, color: 'rgba(255,255,255,.9)', fontWeight: 500, marginBottom: 12 }}>
              <Icon name={icon as string} size={20} fill={1} style={{ color: 'rgba(255,220,196,.8)' }} />{text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
