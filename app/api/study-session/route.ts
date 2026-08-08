export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const minutes = Math.max(1, Math.min(Number(body.minutes) || 25, 240));
  const subjectId: string | null = body.subjectId || null;

  await sql`INSERT INTO study_sessions (user_id, subject_id, duration_minutes) VALUES (${session.userId}, ${subjectId}, ${minutes})`;

  // bump study hours on the chosen subject's progress if provided
  if (subjectId) {
    await sql`
      UPDATE user_progress SET study_hours = COALESCE(study_hours, 0) + GREATEST(1, ROUND(${minutes} / 60.0)), updated_at = now()
      WHERE user_id = ${session.userId} AND subject_id = ${subjectId}`;
  }

  return NextResponse.json({ ok: true, minutes });
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const rows = await sql`
    SELECT COALESCE(SUM(duration_minutes), 0) AS total_minutes, COUNT(*) AS sessions
    FROM study_sessions WHERE user_id = ${session.userId}`;
  return NextResponse.json(rows[0]);
}
