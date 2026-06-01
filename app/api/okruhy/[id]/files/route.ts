export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

const ALLOWED_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-excel': 'xls',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'text/plain': 'txt',
};

const MAX_SIZE = 30 * 1024 * 1024; // 30MB

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const rows = await sql`SELECT * FROM okruhy WHERE id = ${params.id}`;
  if (!rows.length) return NextResponse.json({ error: 'Okruh not found' }, { status: 404 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

  if (!ALLOWED_TYPES[file.type]) {
    return NextResponse.json({ error: 'Nepodporovaný typ súboru' }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Súbor je príliš veľký (max 30 MB)' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const [inserted] = await sql`
    INSERT INTO okruh_files (okruh_id, filename, mimetype, size_bytes, data)
    VALUES (${params.id}, ${file.name}, ${file.type}, ${file.size}, ${buffer})
    RETURNING id, filename, mimetype, size_bytes, uploaded_at
  `;
  return NextResponse.json(inserted, { status: 201 });
}
