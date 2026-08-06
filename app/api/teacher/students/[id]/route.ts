export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';

const canTeach = (role?: string) => ['teacher', 'admin', 'owner'].includes(role || '');

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canTeach(session.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await sql`DELETE FROM teacher_students WHERE teacher_id = ${session.userId} AND student_id = ${params.id}`;
  return NextResponse.json({ ok: true });
}
