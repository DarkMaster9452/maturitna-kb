export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'owner') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const users = await sql`SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC`;
  return NextResponse.json(users);
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'owner') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { userId, role } = await req.json();
  const validRoles = ['student', 'teacher', 'admin', 'owner'];
  if (!userId || !validRoles.includes(role)) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });

  if (userId === session.userId) return NextResponse.json({ error: 'Cannot change own role' }, { status: 400 });

  await sql`UPDATE users SET role = ${role} WHERE id = ${userId}`;
  return NextResponse.json({ ok: true });
}
