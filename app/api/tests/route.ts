import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const subjectId = searchParams.get('subject');

  let tests;
  if (subjectId && subjectId !== 'all') {
    tests = await sql`
      SELECT t.id, t.title, t.icon, t.difficulty, t.duration_minutes, t.subject_id,
             s.name_sk, s.name_en,
             jsonb_array_length(t.questions) as question_count
      FROM tests t JOIN subjects s ON s.id = t.subject_id
      WHERE t.subject_id = ${subjectId}`;
  } else {
    tests = await sql`
      SELECT t.id, t.title, t.icon, t.difficulty, t.duration_minutes, t.subject_id,
             s.name_sk, s.name_en,
             jsonb_array_length(t.questions) as question_count
      FROM tests t JOIN subjects s ON s.id = t.subject_id ORDER BY s.sort_order`;
  }

  const session = await getSession();
  if (session) {
    const results = await sql`
      SELECT test_id, MAX(score) as best_score, COUNT(*) as attempts
      FROM test_results WHERE user_id = ${session.userId}
      GROUP BY test_id`;
    const resultMap = Object.fromEntries(results.map((r: any) => [r.test_id, r]));
    return NextResponse.json(tests.map((t: any) => ({ ...t, ...resultMap[t.id] })));
  }
  return NextResponse.json(tests);
}
