export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [selected, pinned, progress] = await Promise.all([
    sql`
      SELECT s.* FROM subjects s
      JOIN user_subjects us ON us.subject_id = s.id
      WHERE us.user_id = ${session.userId}
      ORDER BY s.sort_order`,
    sql`
      SELECT s.*, ps.sort_order as pin_order FROM subjects s
      JOIN pinned_subjects ps ON ps.subject_id = s.id
      WHERE ps.user_id = ${session.userId}
      ORDER BY ps.sort_order`,
    sql`SELECT * FROM user_progress WHERE user_id = ${session.userId}`,
  ]);

  return NextResponse.json({ selected, pinned, progress });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { subjectIds } = await req.json();
  if (!Array.isArray(subjectIds)) return NextResponse.json({ error: 'Invalid' }, { status: 400 });

  await sql.transaction([
    sql`DELETE FROM user_subjects WHERE user_id = ${session.userId}`,
    ...subjectIds.map(
      (id: string) =>
        sql`INSERT INTO user_subjects (user_id, subject_id) VALUES (${session.userId}, ${id}) ON CONFLICT DO NOTHING`
    ),
    sql`UPDATE users SET onboarding_done = true WHERE id = ${session.userId}`,
  ]);

  return NextResponse.json({ ok: true });
}
