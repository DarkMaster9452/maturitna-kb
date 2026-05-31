export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const subjectId = searchParams.get('subject');
  const type = searchParams.get('type');

  let rows;
  if (subjectId && subjectId !== 'all') {
    rows = await sql`
      SELECT m.*, s.name_sk, s.name_en, s.icon as subject_icon FROM materials m
      JOIN subjects s ON s.id = m.subject_id
      WHERE m.subject_id = ${subjectId}
      ORDER BY m.created_at DESC`;
  } else {
    rows = await sql`
      SELECT m.*, s.name_sk, s.name_en, s.icon as subject_icon FROM materials m
      JOIN subjects s ON s.id = m.subject_id
      ORDER BY m.created_at DESC`;
  }
  return NextResponse.json(rows);
}
