'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icon, Button, Logo, Input, ModeToggle } from '@/components/ui';

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
      if (!data.user.onboardingDone) router.push('/onboarding');
      else if (data.user.role === 'admin') router.push('/admin');
      else router.push('/dashboard');
    } catch { setError('Sieťová chyba.'); setLoading(false); }
  };

  const fillDemo = (role: 'student' | 'admin') => {
    setEmail(role === 'admin' ? 'admin@skola.sk' : 'martin@skola.sk');
    setPassword('heslo123');
    setError('');
  };

  const features = [
    ['category', 'Okruhy podľa šablón', 'Definície, vzorce, časové osi či slovíčka.'],
    ['upload_file', 'Materiály a poznámky', 'Nahraj a organizuj všetko na jednom mieste.'],
    ['trending_up', 'Sledovanie pokroku', 'Vždy vieš, čo ti do maturity ešte zostáva.'],
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--background)' }}>
      {/* Left — form */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 'clamp(24px, 5vw, 48px)', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 20, right: 20 }}><ModeToggle /></div>
        <div style={{ width: '100%', maxWidth: 400 }} className="mkb-fade-up">
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--on-surface-variant)', fontSize: 14, fontWeight: 600, marginBottom: 36 }}>
            <Icon name="arrow_back" size={18} /> Späť na úvodnú stránku
          </Link>
          <Logo size={26} />
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(30px, 5vw, 38px)', fontWeight: 700, margin: '28px 0 8px', color: 'var(--on-surface)', letterSpacing: '-.02em' }}>Vitaj späť</div>
          <div style={{ fontSize: 16, color: 'var(--on-surface-variant)', marginBottom: 32 }}>Prihlás sa do svojho študentského portálu.</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Input label="E-mailová adresa" type="email" placeholder="meno@skola.sk" value={email} onChange={e => setEmail(e.target.value)} icon="mail" onKeyDown={e => e.key === 'Enter' && handleLogin()} />

            <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.02em', color: 'var(--on-surface-variant)' }}>Heslo</span>
              <div style={{ position: 'relative' }}>
                <Icon name="lock" size={18} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--on-surface-variant)', pointerEvents: 'none' }} />
                <input type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  style={{ fontFamily: 'var(--font-sans)', fontSize: 15, background: 'var(--surface-container-low)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius)', padding: '12px 44px 12px 42px', color: 'var(--on-surface)', outline: 'none', width: '100%', transition: 'border-color .2s, box-shadow .2s' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = 'var(--ring)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--outline-variant)'; e.target.style.boxShadow = 'none'; }} />
                <button onClick={() => setShowPass(!showPass)} type="button" aria-label="Zobraziť heslo" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--on-surface-variant)', padding: 4, display: 'flex' }}>
                  <Icon name={showPass ? 'visibility_off' : 'visibility'} size={18} />
                </button>
              </div>
            </label>

            {error && <div style={{ fontSize: 14, color: 'var(--error)', display: 'flex', alignItems: 'center', gap: 6, background: 'var(--error-container)', padding: '10px 12px', borderRadius: 'var(--radius)' }}><Icon name="error" size={16} fill={1} />{error}</div>}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: 'var(--on-surface-variant)' }}>
                <input type="checkbox" defaultChecked style={{ accentColor: 'var(--primary)', width: 16, height: 16 }} /> Zapamätať si ma
              </label>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)', cursor: 'pointer' }}>Zabudnuté heslo?</span>
            </div>

            <Button onClick={handleLogin} disabled={loading} full iconAfter="arrow_forward" size="lg">
              {loading ? 'Prihlasovanie…' : 'Prihlásiť sa'}
            </Button>
          </div>

          {/* Demo access */}
          <div style={{ marginTop: 22, padding: 16, borderRadius: 14, background: 'var(--surface-container-low)', border: '1px dashed var(--outline-variant)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: 'var(--on-surface-variant)', letterSpacing: '.03em', marginBottom: 10 }}>
              <Icon name="bolt" size={16} fill={1} style={{ color: 'var(--primary)' }} /> DEMO PRÍSTUP
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => fillDemo('student')} style={{ flex: 1, padding: '9px 12px', borderRadius: 10, border: '1px solid var(--outline-variant)', background: 'var(--surface-container-lowest)', fontSize: 13, fontWeight: 600, color: 'var(--on-surface)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Icon name="person" size={16} /> Študent
              </button>
              <button onClick={() => fillDemo('admin')} style={{ flex: 1, padding: '9px 12px', borderRadius: 10, border: '1px solid var(--outline-variant)', background: 'var(--surface-container-lowest)', fontSize: 13, fontWeight: 600, color: 'var(--on-surface)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Icon name="admin_panel_settings" size={16} /> Administrátor
              </button>
            </div>
          </div>

          <div style={{ marginTop: 20, textAlign: 'center', fontSize: 14, color: 'var(--on-surface-variant)' }}>
            Nemáš účet?{' '}
            <span style={{ color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>Požiadaj školu o prístup</span>
          </div>
        </div>
      </div>

      {/* Right — brand panel */}
      <div className="mkb-hide-mobile" style={{ flex: 1, backgroundImage: 'var(--grad-brand-vivid)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 64, position: 'relative', overflow: 'hidden' }}>
        <div className="mkb-blob" style={{ position: 'absolute', top: -90, right: -70, width: 320, height: 320, background: 'rgba(255,255,255,.12)', borderRadius: '50%', filter: 'blur(20px)' }} />
        <div className="mkb-blob" style={{ position: 'absolute', bottom: -60, left: -50, width: 240, height: 240, background: 'rgba(255,255,255,.10)', borderRadius: '50%', filter: 'blur(20px)', animationDelay: '3s' }} />
        <div style={{ position: 'relative', maxWidth: 420 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(255,255,255,.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 30, backdropFilter: 'blur(6px)' }}>
            <Icon name="school" size={32} fill={1} style={{ color: '#fff' }} />
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 42, fontWeight: 700, color: '#fff', display: 'block', marginBottom: 16, lineHeight: 1.12, letterSpacing: '-.02em' }}>
            Tvoja maturita.<br /><span style={{ fontStyle: 'italic', fontWeight: 400, color: 'rgba(255,255,255,.9)' }}>Tvoje pravidlá.</span>
          </div>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: 'rgba(255,255,255,.82)', marginBottom: 40 }}>
            Tvoje okruhy, materiály a poznámky pre maturitu — prehľadne na jednom mieste.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {features.map(([icon, title, desc]) => (
              <div key={title} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(255,255,255,.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                  <Icon name={icon} size={21} fill={1} style={{ color: '#fff' }} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{title}</div>
                  <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,.75)', marginTop: 2 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
