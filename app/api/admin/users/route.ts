export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session || !['admin', 'owner'].includes(session.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const users = await sql`
    SELECT u.id, u.name, u.email, u.role, u.created_at, u.onboarding_done,
      (SELECT COUNT(*) FROM user_subjects us WHERE us.user_id = u.id) AS subjects_count,
      (SELECT COUNT(*) FROM test_results tr WHERE tr.user_id = u.id) AS tests_count,
      (SELECT COALESCE(ROUND(AVG(up.progress_pct)), 0) FROM user_progress up WHERE up.user_id = u.id) AS avg_progress,
      (SELECT MAX(tr.created_at) FROM test_results tr WHERE tr.user_id = u.id) AS last_active
    FROM users u
    ORDER BY u.created_at DESC`;

  return NextResponse.json({ users });
}
