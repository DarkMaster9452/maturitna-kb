export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session || !['admin', 'owner'].includes(session.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const [resultsByDay, sessionsByDay, roleDist, scoreBuckets, topSubjects] = await Promise.all([
    sql`
      SELECT to_char(d.day, 'DD.MM') AS label, COALESCE(c.n, 0) AS value
      FROM generate_series((now() - interval '13 days')::date, now()::date, interval '1 day') d(day)
      LEFT JOIN (SELECT DATE(created_at) AS day, COUNT(*) AS n FROM test_results GROUP BY 1) c ON c.day = d.day
      ORDER BY d.day`,
    sql`
      SELECT to_char(d.day, 'DD.MM') AS label, COALESCE(ROUND(c.m / 60.0, 1), 0) AS value
      FROM generate_series((now() - interval '13 days')::date, now()::date, interval '1 day') d(day)
      LEFT JOIN (SELECT DATE(created_at) AS day, SUM(duration_minutes) AS m FROM study_sessions GROUP BY 1) c ON c.day = d.day
      ORDER BY d.day`,
    sql`SELECT role AS label, COUNT(*) AS value FROM users GROUP BY role ORDER BY value DESC`,
    sql`
      SELECT b.label, COUNT(tr.score) AS value FROM (VALUES ('0–49', 0, 49, 1), ('50–69', 50, 69, 2), ('70–84', 70, 84, 3), ('85–100', 85, 100, 4)) AS b(label, lo, hi, ord)
      LEFT JOIN test_results tr ON tr.score BETWEEN b.lo AND b.hi
      GROUP BY b.label, b.ord ORDER BY b.ord`,
    sql`
      SELECT s.name_sk AS label, COUNT(DISTINCT us.user_id) AS value
      FROM subjects s LEFT JOIN user_subjects us ON us.subject_id = s.id
      GROUP BY s.id, s.name_sk ORDER BY value DESC LIMIT 6`,
  ]);

  return NextResponse.json({ resultsByDay, sessionsByDay, roleDist, scoreBuckets, topSubjects });
}
