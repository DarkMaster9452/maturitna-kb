export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const existing = await sql`SELECT id FROM pinned_subjects WHERE user_id = ${session.userId} AND subject_id = ${params.id}`;
  if (existing.length) return NextResponse.json({ pinned: true, message: 'Already pinned' });

  const count = await sql`SELECT COUNT(*) as c FROM pinned_subjects WHERE user_id = ${session.userId}`;
  const sortOrder = Number(count[0].c) + 1;

  await sql`INSERT INTO pinned_subjects (user_id, subject_id, sort_order) VALUES (${session.userId}, ${params.id}, ${sortOrder})`;
  return NextResponse.json({ pinned: true });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await sql`DELETE FROM pinned_subjects WHERE user_id = ${session.userId} AND subject_id = ${params.id}`;
  return NextResponse.json({ pinned: false });
}
