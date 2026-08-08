export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session || !['admin', 'owner'].includes(session.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const [counts, roles, recentResults, subjectStats] = await Promise.all([
    sql`SELECT
        (SELECT COUNT(*) FROM users) AS users,
        (SELECT COUNT(*) FROM users WHERE role='student') AS students,
        (SELECT COUNT(*) FROM users WHERE role='teacher') AS teachers,
        (SELECT COUNT(*) FROM subjects) AS subjects,
        (SELECT COUNT(*) FROM materials) AS materials,
        (SELECT COUNT(*) FROM tests) AS tests,
        (SELECT COUNT(*) FROM test_results) AS test_results,
        (SELECT COUNT(*) FROM notes) AS notes,
        (SELECT COUNT(*) FROM okruhy) AS okruhy,
        (SELECT COUNT(*) FROM test_results WHERE created_at > now() - interval '7 days') AS results_week`,
    sql`SELECT role, COUNT(*) AS c FROM users GROUP BY role`,
    sql`
      SELECT tr.score, tr.created_at, u.name AS user_name, t.title AS test_title, s.name_sk AS subject_name
      FROM test_results tr
      JOIN users u ON u.id = tr.user_id
      JOIN tests t ON t.id = tr.test_id
      JOIN subjects s ON s.id = t.subject_id
      ORDER BY tr.created_at DESC LIMIT 12`,
    sql`
      SELECT s.name_sk, s.icon, s.slug,
        COUNT(DISTINCT us.user_id) AS student_count,
        COUNT(DISTINCT m.id) AS material_count,
        COUNT(DISTINCT t.id) AS test_count
      FROM subjects s
      LEFT JOIN user_subjects us ON us.subject_id = s.id
      LEFT JOIN materials m ON m.subject_id = s.id
      LEFT JOIN tests t ON t.subject_id = s.id
      GROUP BY s.id, s.name_sk, s.icon, s.slug, s.sort_order
      ORDER BY s.sort_order`,
  ]);

  const c = counts[0];
  return NextResponse.json({
    stats: {
      users: c.users, students: c.students, teachers: c.teachers,
      subjects: c.subjects, materials: c.materials, tests: c.tests,
      testResults: c.test_results, notes: c.notes, okruhy: c.okruhy, resultsWeek: c.results_week,
    },
    roles,
    recentResults,
    subjectStats,
  });
}
