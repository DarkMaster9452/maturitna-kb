export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session || !['admin', 'owner'].includes(session.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const logs = await sql`
    SELECT * FROM (
      SELECT 'test' AS kind, u.name AS actor, t.title AS detail, tr.score::text AS meta, tr.created_at AS at
        FROM test_results tr JOIN users u ON u.id = tr.user_id JOIN tests t ON t.id = tr.test_id
      UNION ALL
      SELECT 'user' AS kind, u.name AS actor, u.email AS detail, u.role AS meta, u.created_at AS at
        FROM users u
      UNION ALL
      SELECT 'note' AS kind, u.name AS actor, n.title AS detail, '' AS meta, n.updated_at AS at
        FROM notes n JOIN users u ON u.id = n.user_id
      UNION ALL
      SELECT 'session' AS kind, u.name AS actor, NULL AS detail, ss.duration_minutes::text AS meta, ss.created_at AS at
        FROM study_sessions ss JOIN users u ON u.id = ss.user_id
    ) x
    WHERE at IS NOT NULL
    ORDER BY at DESC
    LIMIT 40`;

  return NextResponse.json({ logs });
}
