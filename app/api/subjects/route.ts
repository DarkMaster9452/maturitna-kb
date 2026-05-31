import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const rows = await sql`SELECT * FROM subjects ORDER BY sort_order`;
  return NextResponse.json(rows);
}
