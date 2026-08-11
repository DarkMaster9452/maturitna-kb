'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icon, Button, Card, IconChip, Progress, Chip, Serif } from '@/components/ui';
import { useToastCtx } from '../../layout';

type Question = { q: string; opts: string[]; correct: number };

export default function TestRunPage() {
  const params = useParams();
  const router = useRouter();
  const { flash } = useToastCtx();
  const [test, setTest] = useState<any>(null);
  const [phase, setPhase] = useState<'intro' | 'quiz' | 'result'>('intro');
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    fetch(`/api/tests/${params.id}`).then(r => r.json()).then(setTest);
  }, [params.id]);

  if (!test) return <div style={{ padding: 48, color: 'var(--on-surface-variant)' }}>Načítavam…</div>;

  const questions: Question[] = test.questions || [];
  const q = questions[qIdx];
  const pct = Math.round((score / questions.length) * 100);

  const handleAnswer = (i: number) => {
    if (answered) return;
    setSelected(i);
    setAnswered(true);
    setAnswers(prev => [...prev, i]);
    if (i === q.correct) setScore(s => s + 1);
  };

  const next = async () => {
    if (qIdx < questions.length - 1) {
      setQIdx(q => q + 1); setSelected(null); setAnswered(false);
    } else {
      const finalScore = Math.round(((score + (selected === q.correct ? 1 : 0)) / questions.length) * 100);
      await fetch(`/api/tests/${test.id}/submit`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answers, score: finalScore }) });
      setPhase('result');
    }
  };

  const restart = () => { setPhase('intro'); setQIdx(0); setSelected(null); setAnswered(false); setAnswers([]); setScore(0); };

  if (phase === 'intro') {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', paddingTop: 48 }}>
        <Link href="/tests" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--on-surface-variant)', fontWeight: 600, fontSize: 14, marginBottom: 40 }}>
          <Icon name="arrow_back" size={18} /> Späť na testy
        </Link>
        <Card pad={40} radius={16} style={{ textAlign: 'center' }}>
          <IconChip name={test.icon} size={72} radius={20} style={{ margin: '0 auto 24px' }} />
          <Serif size={36} weight={700} style={{ display: 'block', marginBottom: 8 }}>{test.title}</Serif>
          <div style={{ fontSize: 16, color: 'var(--on-surface-variant)', marginBottom: 32 }}>{test.name_sk}</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 40 }}>
            {[['quiz', `${questions.length} otázok`], ['schedule', `${test.duration_minutes} minút`], ['star', test.difficulty]].map(([icon, label]) => (
              <div key={label as string} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--on-surface-variant)' }}>
                <Icon name={icon as string} size={18} style={{ color: 'var(--primary)' }} />{label}
              </div>
            ))}
          </div>
          <Button onClick={() => setPhase('quiz')} full icon="play_arrow" style={{ fontSize: 16, padding: '14px 32px' }}>Spustiť test</Button>
        </Card>
      </div>
    );
  }

  if (phase === 'result') {
    const passed = pct >= 60;
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', paddingTop: 48, textAlign: 'center' }}>
        <div style={{ width: 96, height: 96, borderRadius: 9999, background: passed ? 'var(--success-container)' : 'var(--error-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <Icon name={passed ? 'emoji_events' : 'sentiment_dissatisfied'} size={48} fill={1} style={{ color: passed ? 'var(--success)' : 'var(--error)' }} />
        </div>
        <Serif size={44} weight={700} style={{ display: 'block', marginBottom: 8 }}>Test dokončený!</Serif>
        <div style={{ fontSize: 20, color: 'var(--on-surface-variant)', marginBottom: 12 }}>
          Skóre: <strong style={{ color: 'var(--primary)', fontSize: 28 }}>{pct}%</strong>
        </div>
        <div style={{ fontSize: 16, color: 'var(--on-surface-variant)', marginBottom: 40 }}>
          {score}/{questions.length} správnych odpovedí · {passed ? '🎉 Vynikajúce!' : 'Nevzdávaj sa, skús znova!'}
        </div>
        <div className="mkb-2up" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 40 }}>
          {questions.map((q, i) => {
            const userAnswer = answers[i];
            const correct = userAnswer === q.correct;
            return (
              <div key={i} style={{ padding: '12px 16px', borderRadius: 10, background: correct ? 'var(--success-container)' : 'var(--error-container)', display: 'flex', gap: 10, alignItems: 'flex-start', textAlign: 'left' }}>
                <Icon name={correct ? 'check_circle' : 'cancel'} size={18} fill={1} style={{ color: correct ? 'var(--success)' : 'var(--error)', flex: 'none', marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--on-surface)' }}>{q.q}</div>
                  {!correct && <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 2 }}>Správne: {q.opts[q.correct]}</div>}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Button onClick={restart} icon="replay">Skúsiť znova</Button>
          <Button variant="secondary" onClick={() => router.push('/tests')} icon="arrow_back">Späť na testy</Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Button variant="ghost" icon="close" onClick={restart}>Ukončiť</Button>
        <Chip tone="soft">{qIdx + 1} / {questions.length}</Chip>
      </div>
      <Progress value={((qIdx) / questions.length) * 100} height={6} />
      <Card pad={40} radius={16} style={{ marginTop: 28, marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 16 }}>Otázka {qIdx + 1}</div>
        <Serif size={26} weight={600} style={{ display: 'block', lineHeight: 1.4, marginBottom: 36 }}>{q.q}</Serif>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {q.opts.map((opt: string, i: number) => {
            let bg = 'var(--surface-container-lowest)';
            let border = 'var(--outline-variant)';
            let color = 'var(--on-surface)';
            if (answered) {
              if (i === q.correct) { bg = 'var(--success-container)'; border = 'var(--success)'; color = 'var(--success)'; }
              else if (i === selected && i !== q.correct) { bg = 'var(--error-container)'; border = 'var(--error)'; color = 'var(--error)'; }
            } else if (selected === i) { bg = 'var(--primary-fixed)'; border = 'var(--primary)'; }
            return (
              <button key={i} onClick={() => handleAnswer(i)}
                style={{ fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 500, padding: '14px 18px', borderRadius: 10, border: `1.5px solid ${border}`, background: bg, color, cursor: answered ? 'default' : 'pointer', textAlign: 'left', transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 28, height: 28, borderRadius: 9999, border: `1.5px solid ${border}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flex: 'none', color }}>
                  {answered && i === q.correct ? <Icon name="check" size={16} /> : answered && i === selected ? <Icon name="close" size={16} /> : String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
      </Card>
      {answered && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 14, color: selected === q.correct ? 'var(--success)' : 'var(--error)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name={selected === q.correct ? 'check_circle' : 'cancel'} size={18} fill={1} />
            {selected === q.correct ? 'Správne!' : `Správna odpoveď: ${q.opts[q.correct]}`}
          </div>
          <Button onClick={next} iconAfter="arrow_forward">{qIdx < questions.length - 1 ? 'Ďalšia otázka' : 'Zobraziť výsledky'}</Button>
        </div>
      )}
    </div>
  );
}
