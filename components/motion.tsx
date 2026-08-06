'use client';
import { useState, useEffect, useRef, ReactNode, CSSProperties, Children } from 'react';

/* ══════════════════════════════════════════════════════════════
   Reveal — fade/slide children in when scrolled into view
   ══════════════════════════════════════════════════════════════ */
export function Reveal({ children, delay = 0, as = 'div', style = {}, className = '' }: {
  children: ReactNode; delay?: number; as?: any; style?: CSSProperties; className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') { setShown(true); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { setShown(true); io.disconnect(); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const Tag: any = as;
  return (
    <Tag ref={ref} className={'mkb-reveal ' + (shown ? 'is-in ' : '') + className} style={{ transitionDelay: `${delay}ms`, ...style }}>
      {children}
    </Tag>
  );
}

/* Stagger — reveals each child in sequence */
export function Stagger({ children, step = 80, style = {}, className = '' }: {
  children: ReactNode; step?: number; style?: CSSProperties; className?: string;
}) {
  return (
    <div style={style} className={className}>
      {Children.map(children, (c, i) => <Reveal key={i} delay={i * step}>{c}</Reveal>)}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Counter — animated number that counts up when in view
   ══════════════════════════════════════════════════════════════ */
export function Counter({ value, duration = 1400, decimals = 0, prefix = '', suffix = '', style = {}, className = '' }: {
  value: number; duration?: number; decimals?: number; prefix?: string; suffix?: string; style?: CSSProperties; className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const run = () => {
      if (started.current) return;
      started.current = true;
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setDisplay(value * eased);
        if (p < 1) requestAnimationFrame(tick);
        else setDisplay(value);
      };
      requestAnimationFrame(tick);
    };
    if (typeof IntersectionObserver === 'undefined') { run(); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { run(); io.disconnect(); } });
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [value, duration]);
  const shown = display.toLocaleString('sk-SK', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return <span ref={ref} className={className} style={style}>{prefix}{shown}{suffix}</span>;
}

/* ══════════════════════════════════════════════════════════════
   Marquee — infinite horizontal scroll
   ══════════════════════════════════════════════════════════════ */
export function Marquee({ children, duration = 34, reverse = false, style = {}, fade = true }: {
  children: ReactNode; duration?: number; reverse?: boolean; style?: CSSProperties; fade?: boolean;
}) {
  return (
    <div className="mkb-marquee" style={{ overflow: 'hidden', position: 'relative', WebkitMaskImage: fade ? 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)' : undefined, maskImage: fade ? 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)' : undefined, ...style }}>
      <div className={'mkb-marquee-track' + (reverse ? ' rev' : '')} style={{ ['--mkb-marquee-dur' as any]: `${duration}s` }}>
        <div style={{ display: 'flex', gap: 14, paddingRight: 14 }}>{children}</div>
        <div style={{ display: 'flex', gap: 14, paddingRight: 14 }} aria-hidden>{children}</div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   WordRotate — cycles a list of words with a spring-in
   ══════════════════════════════════════════════════════════════ */
export function WordRotate({ words, interval = 2200, style = {} }: { words: string[]; interval?: number; style?: CSSProperties }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI(v => (v + 1) % words.length), interval);
    return () => clearInterval(t);
  }, [words.length, interval]);
  return (
    <span style={{ display: 'inline-block', position: 'relative', ...style }}>
      <span key={i} className="mkb-word-in">{words[i]}</span>
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════
   Confetti — lightweight DOM burst (no deps)
   ══════════════════════════════════════════════════════════════ */
export function fireConfetti(opts: { x?: number; y?: number; count?: number } = {}) {
  if (typeof document === 'undefined') return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const count = opts.count ?? 90;
  const ox = opts.x ?? window.innerWidth / 2;
  const oy = opts.y ?? window.innerHeight * 0.32;
  const cs = getComputedStyle(document.documentElement);
  const ink = (cs.getPropertyValue('--on-surface') || '#17181c').trim();
  const accent = (cs.getPropertyValue('--primary') || '#0a7d54').trim();
  const colors = [accent, ink, '#f5b301', accent, '#e0603a'];
  for (let n = 0; n < count; n++) {
    const p = document.createElement('div');
    p.className = 'mkb-confetti';
    const size = 6 + Math.random() * 7;
    p.style.width = size + 'px';
    p.style.height = size * (0.5 + Math.random()) + 'px';
    p.style.background = colors[n % colors.length];
    p.style.left = ox + 'px';
    p.style.top = oy + 'px';
    p.style.opacity = '1';
    if (Math.random() > 0.6) p.style.borderRadius = '50%';
    document.body.appendChild(p);
    const angle = Math.random() * Math.PI * 2;
    const velocity = 120 + Math.random() * 260;
    const dx = Math.cos(angle) * velocity;
    const dy = Math.sin(angle) * velocity - (140 + Math.random() * 120);
    const rot = (Math.random() * 720 - 360);
    const dur = 900 + Math.random() * 900;
    const start = performance.now();
    const gravity = 900;
    const tick = (now: number) => {
      const t = (now - start) / 1000;
      const life = (now - start) / dur;
      if (life >= 1) { p.remove(); return; }
      const x = dx * t;
      const y = dy * t + 0.5 * gravity * t * t;
      p.style.transform = `translate(${x}px, ${y}px) rotate(${rot * life}deg)`;
      p.style.opacity = String(1 - life);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}

/* ══════════════════════════════════════════════════════════════
   Tilt — subtle 3D tilt following the cursor
   ══════════════════════════════════════════════════════════════ */
export function Tilt({ children, max = 6, style = {}, className = '' }: { children: ReactNode; max?: number; style?: CSSProperties; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(800px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg)`;
  };
  const reset = () => { const el = ref.current; if (el) el.style.transform = 'perspective(800px) rotateX(0) rotateY(0)'; };
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={reset} className={className}
      style={{ transition: 'transform .2s ease', transformStyle: 'preserve-3d', ...style }}>
      {children}
    </div>
  );
}
