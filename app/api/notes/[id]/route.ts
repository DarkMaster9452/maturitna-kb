export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';
import { createHash } from 'crypto';

async function owned(id: string, userId: string) {
  const rows = await sql`SELECT * FROM notes WHERE id = ${id} AND user_id = ${userId}`;
  return rows[0] || null;
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const note = await owned(params.id, session.userId);
  if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const tags = await sql`SELECT t.id, t.name FROM tags t JOIN note_tags nt ON nt.tag_id = t.id WHERE nt.note_id = ${params.id} ORDER BY t.name`;
  return NextResponse.json({ ...note, tags });
}

// PATCH: partial update — title, content, status, is_favorite, archived(bool), tags(string[])
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const note = await owned(params.id, session.userId);
  if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const b = await req.json().catch(() => ({}));
  const title = b.title !== undefined ? String(b.title).slice(0, 200) : note.title;
  const content = b.content !== undefined ? String(b.content) : note.content;
  const status = b.status !== undefined ? String(b.status) : note.status;
  const isFav = b.is_favorite !== undefined ? !!b.is_favorite : note.is_favorite;
  const archivedAt = b.archived !== undefined ? (b.archived ? new Date().toISOString() : null) : note.archived_at;
  const hash = createHash('sha256').update(title + '\n' + content).digest('hex');

  const [updated] = await sql`
    UPDATE notes SET title = ${title}, content = ${content}, status = ${status},
      is_favorite = ${isFav}, archived_at = ${archivedAt}, content_hash = ${hash}, updated_at = now()
    WHERE id = ${params.id} AND user_id = ${session.userId} RETURNING *`;

  if (Array.isArray(b.tags)) {
    const names: string[] = b.tags.map((t: any) => String(t).trim().toLowerCase()).filter(Boolean).slice(0, 12);
    const queries: any[] = [sql`DELETE FROM note_tags WHERE note_id = ${params.id}`];
    for (const name of names) {
      queries.push(sql`INSERT INTO tags (user_id, name) VALUES (${session.userId}, ${name}) ON CONFLICT (user_id, name) DO NOTHING`);
    }
    await sql.transaction(queries);
    if (names.length) {
      const tagRows = await sql`SELECT id FROM tags WHERE user_id = ${session.userId} AND name = ANY(${names})`;
      const inserts = tagRows.map((t: any) => sql`INSERT INTO note_tags (note_id, tag_id) VALUES (${params.id}, ${t.id}) ON CONFLICT DO NOTHING`);
      if (inserts.length) await sql.transaction(inserts);
    }
  }
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const note = await owned(params.id, session.userId);
  if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await sql`DELETE FROM notes WHERE id = ${params.id} AND user_id = ${session.userId}`;
  return NextResponse.json({ ok: true });
}
