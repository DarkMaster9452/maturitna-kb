export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';

const canTeach = (role?: string) => ['teacher', 'admin', 'owner'].includes(role || '');

// Unambiguous alphabet (no O/0/I/1)
function genCode(len = 6) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < len; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}

async function ensureCode(teacherId: string): Promise<string> {
  const existing = await sql`SELECT code FROM teacher_invites WHERE teacher_id = ${teacherId} AND active LIMIT 1`;
  if (existing.length) return existing[0].code;
  // create a unique code
  for (let attempt = 0; attempt < 6; attempt++) {
    const code = genCode();
    try {
      await sql`INSERT INTO teacher_invites (code, teacher_id) VALUES (${code}, ${teacherId})`;
      return code;
    } catch { /* collision — retry */ }
  }
  throw new Error('code-gen-failed');
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canTeach(session.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const code = await ensureCode(session.userId);
  return NextResponse.json({ code });
}

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canTeach(session.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  await sql`UPDATE teacher_invites SET active = false WHERE teacher_id = ${session.userId} AND active`;
  const code = await ensureCode(session.userId);
  return NextResponse.json({ code });
}
