export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const progress = await sql`
    SELECT up.*, s.name_sk, s.name_en, s.icon FROM user_progress up
    JOIN subjects s ON s.id = up.subject_id
    WHERE up.user_id = ${session.userId}
    ORDER BY up.progress_pct DESC`;

  const results = await sql`
    SELECT tr.score, tr.created_at, t.title, t.subject_id, s.name_sk
    FROM test_results tr
    JOIN tests t ON t.id = tr.test_id
    JOIN subjects s ON s.id = t.subject_id
    WHERE tr.user_id = ${session.userId}
    ORDER BY tr.created_at DESC LIMIT 20`;

  const sessions = await sql`
    SELECT DATE(created_at) as day, SUM(duration_minutes) as minutes
    FROM study_sessions WHERE user_id = ${session.userId}
    GROUP BY day ORDER BY day DESC LIMIT 7`;

  const totals = await sql`
    SELECT
      COALESCE(SUM(study_hours),0) as total_hours,
      COUNT(*) as subjects_count
    FROM user_progress WHERE user_id = ${session.userId}`;

  const testCount = await sql`
    SELECT COUNT(*) as total FROM test_results WHERE user_id = ${session.userId}`;

  return NextResponse.json({ progress, results, sessions, totals: totals[0], testCount: testCount[0].total });
}
