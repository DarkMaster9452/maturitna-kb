'use client';
import { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { Icon, Button } from '@/components/ui';
import { fireConfetti } from '@/components/motion';

type SessionCtx = { open: () => void };
const Ctx = createContext<SessionCtx>({ open: () => {} });
export function useSession() { return useContext(Ctx); }

const PRESETS = [15, 25, 50];

export function SessionProvider({ children, subjects = [], onFlash }: {
  children: ReactNode; subjects?: any[]; onFlash?: (m: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [minutes, setMinutes] = useState(25);
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [subjectId, setSubjectId] = useState<string>('');
  const timer = useRef<any>(null);

  const flash = (m: string) => onFlash?.(m);

  const reset = (mins = minutes) => { setRunning(false); setDone(false); setRemaining(mins * 60); };
  const open = () => { setIsOpen(true); setDone(false); setRemaining(minutes * 60); };
  const close = () => { setIsOpen(false); setRunning(false); if (timer.current) clearInterval(timer.current); reset(); };

  const pickPreset = (m: number) => { setMinutes(m); setRunning(false); setDone(false); setRemaining(m * 60); };

  const record = async () => {
    try {
      await fetch('/api/study-session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ minutes, subjectId: subjectId || null }) });
    } catch {}
  };

  useEffect(() => {
    if (!running) { if (timer.current) clearInterval(timer.current); return; }
    timer.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          clearInterval(timer.current);
          setRunning(false); setDone(true);
          fireConfetti({ count: 120 });
          flash('Session dokončená — skvelá práca! 🎉');
          record();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  // Lock the page behind the dialog so only the sheet scrolls.
  useEffect(() => {
    document.body.classList.toggle('mkb-locked', isOpen);
    return () => document.body.classList.remove('mkb-locked');
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');
  const total = minutes * 60;
  const frac = total ? (total - remaining) / total : 0;
  // Ring geometry stays in a fixed viewBox; the wrapper scales it to fit narrow screens.
  const size = 220, stroke = 12, r = (size - stroke) / 2, c = 2 * Math.PI * r;

  return (
    <Ctx.Provider value={{ open }}>
      {children}
      {isOpen && (
        <div onClick={close} className="mkb-scrim" role="dialog" aria-modal="true" aria-label="Študijná session">
          <div onClick={e => e.stopPropagation()} className="mkb-sheet" style={{ maxWidth: 420, padding: 28 }}>
            <div className="mkb-sheet-grip" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span className="mkb-eyebrow">Študijná session</span>
              <button onClick={close} aria-label="Zavrieť" className="mkb-tap" style={{ width: 34, height: 34, borderRadius: 9, border: '1px solid var(--outline-variant)', background: 'var(--surface-container-lowest)', color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name="close" size={19} /></button>
            </div>

            {/* Timer ring — shrinks with the sheet on narrow screens */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '14px 0 20px' }}>
              <div style={{ position: 'relative', width: 'min(220px, 62vw)', aspectRatio: '1' }}>
                <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="100%" style={{ transform: 'rotate(-90deg)', display: 'block' }}>
                  <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-container-high)" strokeWidth={stroke} />
                  <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={done ? 'var(--success)' : 'var(--primary)'} strokeWidth={stroke} strokeLinecap="round"
                    strokeDasharray={c} strokeDashoffset={c - frac * c} style={{ transition: 'stroke-dashoffset 1s linear' }} />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  {done ? (
                    <>
                      <Icon name="check_circle" size={46} fill={1} style={{ color: 'var(--success)' }} />
                      <div style={{ fontSize: 14, fontWeight: 600, marginTop: 6, color: 'var(--on-surface-variant)' }}>Hotovo!</div>
                    </>
                  ) : (
                    <>
                      <div className="mkb-mono" style={{ fontSize: 'clamp(34px, 13vw, 46px)', fontWeight: 700, letterSpacing: '.02em', lineHeight: 1 }}>{mm}:{ss}</div>
                      <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginTop: 6 }}>{running ? 'Sústreď sa…' : 'Pripravený?'}</div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Presets */}
            {!done && (
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
                {PRESETS.map(m => (
                  <button key={m} onClick={() => pickPreset(m)} disabled={running}
                    style={{ flex: '1 1 0', minHeight: 42, padding: '7px 12px', borderRadius: 9999, fontSize: 13.5, fontWeight: 600, cursor: running ? 'not-allowed' : 'pointer', border: `1px solid ${minutes === m ? 'var(--primary)' : 'var(--outline-variant)'}`, background: minutes === m ? 'var(--primary-fixed)' : 'var(--surface-container-lowest)', color: minutes === m ? 'var(--on-primary-fixed-variant)' : 'var(--on-surface-variant)', opacity: running ? .5 : 1 }}>
                    {m} min
                  </button>
                ))}
              </div>
            )}

            {/* Subject (optional) */}
            {!done && subjects.length > 0 && (
              <select value={subjectId} onChange={e => setSubjectId(e.target.value)}
                style={{ width: '100%', marginBottom: 16, fontFamily: 'var(--font-sans)', fontSize: 14, background: 'var(--surface-container-low)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius)', padding: '11px 14px', color: 'var(--on-surface)', outline: 'none' }}>
                <option value="">Bez predmetu</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name_sk}</option>)}
              </select>
            )}

            {/* Controls */}
            {done ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <Button variant="secondary" full icon="replay" onClick={() => reset()}>Znova</Button>
                <Button full icon="check" onClick={close}>Zavrieť</Button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <Button variant="secondary" icon="restart_alt" onClick={() => reset()}>Reset</Button>
                <Button full icon={running ? 'pause' : 'play_arrow'} onClick={() => setRunning(r => !r)}>{running ? 'Pauza' : 'Spustiť'}</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}
