import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const userCount = await sql`SELECT COUNT(*) as c FROM users`;
  const materialCount = await sql`SELECT COUNT(*) as c FROM materials`;
  const testResultCount = await sql`SELECT COUNT(*) as c FROM test_results`;
  const subjectCount = await sql`SELECT COUNT(*) as c FROM subjects`;

  const recentResults = await sql`
    SELECT tr.score, tr.created_at, u.name as user_name, t.title as test_title, s.name_sk as subject_name
    FROM test_results tr
    JOIN users u ON u.id = tr.user_id
    JOIN tests t ON t.id = tr.test_id
    JOIN subjects s ON s.id = t.subject_id
    ORDER BY tr.created_at DESC LIMIT 10`;

  const subjectStats = await sql`
    SELECT s.name_sk, s.icon, COUNT(DISTINCT us.user_id) as student_count,
           COUNT(DISTINCT m.id) as material_count
    FROM subjects s
    LEFT JOIN user_subjects us ON us.subject_id = s.id
    LEFT JOIN materials m ON m.subject_id = s.id
    GROUP BY s.id, s.name_sk, s.icon, s.sort_order
    ORDER BY s.sort_order`;

  return NextResponse.json({
    stats: {
      users: userCount[0].c,
      materials: materialCount[0].c,
      testResults: testResultCount[0].c,
      subjects: subjectCount[0].c,
    },
    recentResults,
    subjectStats,
  });
}
