export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';

const DAY_SERIES = (expr: string) => expr; // helper marker

export async function GET() {
  const session = await getSession();
  if (!session || !['admin', 'owner'].includes(session.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const [
    dailyTests, dailyNew, dailySessions, dailyScore, dailyActive,
    usersCumulative, roleDist, scoreBuckets, bySubject, funnel, topStudents, heat,
  ] = await Promise.all([
    sql`SELECT to_char(d.day,'DD.MM') AS label, COALESCE(c.n,0)::int AS value FROM generate_series((now()-interval '13 days')::date, now()::date, interval '1 day') d(day) LEFT JOIN (SELECT DATE(created_at) day, COUNT(*) n FROM test_results GROUP BY 1) c ON c.day=d.day ORDER BY d.day`,
    sql`SELECT to_char(d.day,'DD.MM') AS label, COALESCE(c.n,0)::int AS value FROM generate_series((now()-interval '13 days')::date, now()::date, interval '1 day') d(day) LEFT JOIN (SELECT DATE(created_at) day, COUNT(*) n FROM users GROUP BY 1) c ON c.day=d.day ORDER BY d.day`,
    sql`SELECT to_char(d.day,'DD.MM') AS label, COALESCE(ROUND(c.m/60.0,1),0) AS value FROM generate_series((now()-interval '13 days')::date, now()::date, interval '1 day') d(day) LEFT JOIN (SELECT DATE(created_at) day, SUM(duration_minutes) m FROM study_sessions GROUP BY 1) c ON c.day=d.day ORDER BY d.day`,
    sql`SELECT to_char(d.day,'DD.MM') AS label, COALESCE(c.a,0)::int AS value FROM generate_series((now()-interval '13 days')::date, now()::date, interval '1 day') d(day) LEFT JOIN (SELECT DATE(created_at) day, ROUND(AVG(score)) a FROM test_results GROUP BY 1) c ON c.day=d.day ORDER BY d.day`,
    sql`SELECT to_char(d.day,'DD.MM') AS label, COALESCE(c.u,0)::int AS value FROM generate_series((now()-interval '13 days')::date, now()::date, interval '1 day') d(day) LEFT JOIN (SELECT DATE(created_at) day, COUNT(DISTINCT user_id) u FROM test_results GROUP BY 1) c ON c.day=d.day ORDER BY d.day`,
    sql`SELECT to_char(d.day,'DD.MM') AS label, (SELECT COUNT(*) FROM users u WHERE u.created_at::date <= d.day)::int AS value FROM generate_series((now()-interval '13 days')::date, now()::date, interval '1 day') d(day) ORDER BY d.day`,
    sql`SELECT role AS label, COUNT(*)::int AS value FROM users GROUP BY role ORDER BY value DESC`,
    sql`SELECT b.label, COUNT(tr.score)::int AS value FROM (VALUES ('0–49',0,49,1),('50–69',50,69,2),('70–84',70,84,3),('85–100',85,100,4)) AS b(label,lo,hi,ord) LEFT JOIN test_results tr ON tr.score BETWEEN b.lo AND b.hi GROUP BY b.label,b.ord ORDER BY b.ord`,
    sql`SELECT s.name_sk AS label, s.icon,
          (SELECT COUNT(DISTINCT us.user_id) FROM user_subjects us WHERE us.subject_id=s.id)::int AS students,
          (SELECT COUNT(*) FROM okruhy o WHERE o.subject_id=s.id)::int AS topics,
          (SELECT COUNT(*) FROM tests t WHERE t.subject_id=s.id)::int AS tests,
          (SELECT COALESCE(ROUND(AVG(up.progress_pct)),0) FROM user_progress up WHERE up.subject_id=s.id)::int AS avg_progress
        FROM subjects s ORDER BY s.sort_order`,
    sql`SELECT
          (SELECT COUNT(*) FROM users)::int AS total,
          (SELECT COUNT(*) FROM users WHERE onboarding_done)::int AS onboarded,
          (SELECT COUNT(DISTINCT user_id) FROM user_subjects)::int AS with_subjects,
          (SELECT COUNT(DISTINCT user_id) FROM test_results)::int AS with_tests`,
    sql`SELECT u.name, u.id,
          (SELECT COUNT(*) FROM test_results tr WHERE tr.user_id=u.id)::int AS tests,
          (SELECT COALESCE(ROUND(AVG(up.progress_pct)),0) FROM user_progress up WHERE up.user_id=u.id)::int AS avg_progress
        FROM users u WHERE u.role='student'
        ORDER BY avg_progress DESC, tests DESC LIMIT 8`,
    sql`SELECT EXTRACT(DOW FROM created_at)::int AS dow,
          (CASE WHEN EXTRACT(HOUR FROM created_at) < 6 THEN 0 WHEN EXTRACT(HOUR FROM created_at) < 12 THEN 1 WHEN EXTRACT(HOUR FROM created_at) < 18 THEN 2 ELSE 3 END)::int AS part,
          COUNT(*)::int AS n
        FROM (SELECT created_at FROM test_results UNION ALL SELECT created_at FROM study_sessions) e
        GROUP BY dow, part`,
  ]);

  // week-over-week helpers from 14-day daily arrays
  const arr = (rows: any[]) => rows.map(r => Number(r.value));
  const wow = (rows: any[]) => {
    const v = arr(rows);
    const last = v.slice(7).reduce((a, b) => a + b, 0);
    const prev = v.slice(0, 7).reduce((a, b) => a + b, 0);
    const delta = prev === 0 ? (last > 0 ? 100 : 0) : Math.round(((last - prev) / prev) * 100);
    return { last, prev, delta, spark: v };
  };
  const scoreAvgWeek = (rows: any[]) => {
    const v = arr(rows).slice(7).filter(x => x > 0);
    const p = arr(rows).slice(0, 7).filter(x => x > 0);
    const a = v.length ? Math.round(v.reduce((x, y) => x + y, 0) / v.length) : 0;
    const b = p.length ? Math.round(p.reduce((x, y) => x + y, 0) / p.length) : 0;
    const delta = b === 0 ? 0 : Math.round(((a - b) / b) * 100);
    return { value: a, delta, spark: arr(rows) };
  };

  // heatmap matrix: rows = Mon..Sun, cols = 4 dayparts
  const matrix = Array.from({ length: 7 }, () => [0, 0, 0, 0]);
  (heat as any[]).forEach(h => {
    const row = (h.dow + 6) % 7; // convert Sun=0 → Mon=0
    matrix[row][h.part] = h.n;
  });

  const passRateNum = (() => {
    const b = scoreBuckets as any[];
    const total = b.reduce((a, x) => a + Number(x.value), 0) || 1;
    const pass = b.filter(x => x.label !== '0–49').reduce((a, x) => a + Number(x.value), 0);
    return Math.round((pass / total) * 100);
  })();

  return NextResponse.json({
    kpis: {
      tests: wow(dailyTests),
      active: wow(dailyActive),
      newUsers: wow(dailyNew),
      score: scoreAvgWeek(dailyScore),
    },
    series: { dailyTests, dailyNew, dailySessions, dailyScore, dailyActive, usersCumulative },
    roleDist, scoreBuckets, bySubject, funnel: funnel[0], topStudents, heatmap: matrix, passRate: passRateNum,
  });
}
