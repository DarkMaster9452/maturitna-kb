import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const rows = await sql`
    SELECT r.*, s.name_sk, s.name_en, s.slug as subject_slug FROM resources r
    LEFT JOIN subjects s ON s.id = r.subject_id
    WHERE r.id = ${params.id}`;
  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(rows[0]);
}
