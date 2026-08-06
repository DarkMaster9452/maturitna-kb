export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';

const canTeach = (role?: string) => ['teacher', 'admin', 'owner'].includes(role || '');

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canTeach(session.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const students = await sql`
    SELECT u.id, u.name, u.email, u.created_at,
      COALESCE(ROUND(AVG(up.progress_pct)), 0) AS avg_progress,
      (SELECT COUNT(*) FROM test_results tr WHERE tr.user_id = u.id) AS tests_count,
      (SELECT COUNT(*) FROM user_subjects us WHERE us.user_id = u.id) AS subjects_count,
      (SELECT MAX(tr.created_at) FROM test_results tr WHERE tr.user_id = u.id) AS last_active
    FROM teacher_students ts
    JOIN users u ON u.id = ts.student_id
    LEFT JOIN user_progress up ON up.user_id = u.id
    WHERE ts.teacher_id = ${session.userId}
    GROUP BY u.id
    ORDER BY u.name`;

  return NextResponse.json({ students });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canTeach(session.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { email } = await req.json();
  if (!email || typeof email !== 'string') return NextResponse.json({ error: 'Zadaj e-mail študenta.' }, { status: 400 });

  const rows = await sql`SELECT id, name, email, role FROM users WHERE lower(email) = lower(${email.trim()})`;
  if (!rows.length) return NextResponse.json({ error: 'Používateľ s týmto e-mailom neexistuje. Pošli mu radšej pozývací kód.' }, { status: 404 });

  const student = rows[0];
  if (student.id === session.userId) return NextResponse.json({ error: 'Nemôžeš pridať sám seba.' }, { status: 400 });

  await sql`INSERT INTO teacher_students (teacher_id, student_id) VALUES (${session.userId}, ${student.id}) ON CONFLICT DO NOTHING`;
  return NextResponse.json({ ok: true, student: { id: student.id, name: student.name, email: student.email } });
}
