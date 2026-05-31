import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { answers, score } = await req.json();

  await sql`
    INSERT INTO test_results (user_id, test_id, score, answers)
    VALUES (${session.userId}, ${params.id}, ${score}, ${JSON.stringify(answers)})`;

  // Update study session
  await sql`INSERT INTO study_sessions (user_id, duration_minutes) VALUES (${session.userId}, 25)`;

  return NextResponse.json({ ok: true, score });
}
