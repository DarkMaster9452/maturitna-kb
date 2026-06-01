export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(_: NextRequest, { params }: { params: { fileId: string } }) {
  const rows = await sql`SELECT filename, mimetype, data FROM okruh_files WHERE id = ${params.fileId}`;
  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const { filename, mimetype, data } = rows[0];
  const buf = Buffer.isBuffer(data) ? data : Buffer.from(data);
  return new NextResponse(buf, {
    headers: {
      'Content-Type': mimetype,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
    },
  });
}

export async function DELETE(_: NextRequest, { params }: { params: { fileId: string } }) {
  await sql`DELETE FROM okruh_files WHERE id = ${params.fileId}`;
  return NextResponse.json({ ok: true });
}
