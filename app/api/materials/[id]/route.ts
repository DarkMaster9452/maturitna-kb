export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const rows = await sql`
    SELECT m.*, s.name_sk, s.name_en, s.icon as subject_icon, s.slug as subject_slug FROM materials m
    JOIN subjects s ON s.id = m.subject_id
    WHERE m.id = ${params.id}`;
  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(rows[0]);
}
