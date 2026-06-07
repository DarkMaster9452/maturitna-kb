export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET /api/notes?q=&subject=&filter=all|favorite|archived|draft
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();
  const subject = searchParams.get('subject') || '';
  const filter = searchParams.get('filter') || 'active';
  const like = '%' + q.toLowerCase() + '%';

  const rows = await sql`
    SELECT n.*, s.name_sk AS subject_name, s.slug AS subject_slug, s.icon AS subject_icon,
      COALESCE(json_agg(json_build_object('id', t.id, 'name', t.name) ORDER BY t.name)
               FILTER (WHERE t.id IS NOT NULL), '[]') AS tags
    FROM notes n
    LEFT JOIN subjects s ON s.id = n.subject_id
    LEFT JOIN note_tags nt ON nt.note_id = n.id
    LEFT JOIN tags t ON t.id = nt.tag_id
    WHERE n.user_id = ${session.userId}
      AND (${filter} <> 'archived' AND n.archived_at IS NULL OR ${filter} = 'archived' AND n.archived_at IS NOT NULL)
      AND (${filter} <> 'favorite' OR n.is_favorite = true)
      AND (${filter} <> 'draft' OR n.status = 'draft')
      AND (${subject} = '' OR n.subject_id = ${subject})
      AND (${q} = '' OR lower(n.title) LIKE ${like} OR lower(n.content) LIKE ${like})
    GROUP BY n.id, s.name_sk, s.slug, s.icon
    ORDER BY n.is_favorite DESC, n.updated_at DESC`;
  return NextResponse.json(rows);
}

// POST /api/notes  { subject_id?, okruh_id?, title? }
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const title = (body.title || 'Nová poznámka').toString().slice(0, 200);
  const subjectId = body.subject_id || null;
  const okruhId = body.okruh_id || null;
  const [note] = await sql`
    INSERT INTO notes (user_id, subject_id, okruh_id, title, content, status)
    VALUES (${session.userId}, ${subjectId}, ${okruhId}, ${title}, '', 'draft')
    RETURNING *`;
  return NextResponse.json(note, { status: 201 });
}
