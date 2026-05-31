import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const rows = await sql`SELECT * FROM subjects WHERE id = ${params.id} OR slug = ${params.id}`;
  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const subject = rows[0];

  const materials = await sql`SELECT * FROM materials WHERE subject_id = ${subject.id} ORDER BY created_at DESC`;
  const resources = await sql`SELECT * FROM resources WHERE subject_id = ${subject.id}`;
  const tests = await sql`SELECT id, title, icon, difficulty, duration_minutes FROM tests WHERE subject_id = ${subject.id}`;

  return NextResponse.json({ ...subject, materials, resources, tests });
}
