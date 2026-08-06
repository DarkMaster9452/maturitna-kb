export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';

// A student redeems a teacher's invite code to join their class.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { code } = await req.json();
  if (!code || typeof code !== 'string') return NextResponse.json({ error: 'Zadaj kód.' }, { status: 400 });

  const rows = await sql`
    SELECT ti.teacher_id, u.name AS teacher_name
    FROM teacher_invites ti JOIN users u ON u.id = ti.teacher_id
    WHERE ti.code = ${code.trim().toUpperCase()} AND ti.active LIMIT 1`;
  if (!rows.length) return NextResponse.json({ error: 'Neplatný alebo neaktívny kód.' }, { status: 404 });

  const { teacher_id, teacher_name } = rows[0];
  if (teacher_id === session.userId) return NextResponse.json({ error: 'Toto je tvoj vlastný kód.' }, { status: 400 });

  await sql`INSERT INTO teacher_students (teacher_id, student_id) VALUES (${teacher_id}, ${session.userId}) ON CONFLICT DO NOTHING`;
  return NextResponse.json({ ok: true, teacher: teacher_name });
}

// A student can see which teachers they belong to.
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const teachers = await sql`
    SELECT u.id, u.name, u.email FROM teacher_students ts
    JOIN users u ON u.id = ts.teacher_id
    WHERE ts.student_id = ${session.userId}
    ORDER BY u.name`;
  return NextResponse.json({ teachers });
}
