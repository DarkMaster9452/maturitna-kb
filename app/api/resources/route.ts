export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const subjectId = searchParams.get('subject');

  let rows;
  if (subjectId && subjectId !== 'all') {
    rows = await sql`
      SELECT r.*, s.name_sk, s.name_en FROM resources r
      LEFT JOIN subjects s ON s.id = r.subject_id
      WHERE r.subject_id = ${subjectId} ORDER BY r.created_at DESC`;
  } else {
    rows = await sql`
      SELECT r.*, s.name_sk, s.name_en FROM resources r
      LEFT JOIN subjects s ON s.id = r.subject_id
      ORDER BY r.created_at DESC`;
  }
  return NextResponse.json(rows);
}
