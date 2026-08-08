export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const topics = await sql`
    SELECT o.id, o.subject_id, o.parent_id, o.title, o.description, o.icon, o.category, o.sort_order,
      s.name_sk AS subject_name_sk, s.name_en AS subject_name_en, s.slug AS subject_slug, s.icon AS subject_icon, s.sort_order AS subject_sort
    FROM okruhy o JOIN subjects s ON s.id = o.subject_id
    ORDER BY s.sort_order, o.parent_id NULLS FIRST, o.sort_order, o.id`;

  return NextResponse.json({ topics });
}
