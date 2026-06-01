export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const rows = await sql`SELECT * FROM subjects WHERE id = ${params.id} OR slug = ${params.id}`;
  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const subject = rows[0];

  const okruhy = await sql`
    SELECT o.*, COALESCE(json_agg(json_build_object('id', f.id, 'filename', f.filename, 'mimetype', f.mimetype, 'size_bytes', f.size_bytes, 'uploaded_at', f.uploaded_at) ORDER BY f.uploaded_at) FILTER (WHERE f.id IS NOT NULL), '[]') AS files
    FROM okruhy o
    LEFT JOIN okruh_files f ON f.okruh_id = o.id
    WHERE o.subject_id = ${subject.id}
    GROUP BY o.id
    ORDER BY o.sort_order, o.created_at
  `;
  return NextResponse.json(okruhy);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const rows = await sql`SELECT * FROM subjects WHERE id = ${params.id} OR slug = ${params.id}`;
  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const subject = rows[0];

  const { title, description } = await req.json();
  if (!title?.trim()) return NextResponse.json({ error: 'Title required' }, { status: 400 });

  const [okruh] = await sql`
    INSERT INTO okruhy (subject_id, title, description)
    VALUES (${subject.id}, ${title.trim()}, ${description || null})
    RETURNING *
  `;
  return NextResponse.json(okruh, { status: 201 });
}
