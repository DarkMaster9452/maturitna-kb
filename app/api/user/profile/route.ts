export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession, hashPassword } from '@/lib/auth';

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, email, password } = await req.json();

  if (password) {
    const hashed = hashPassword(password);
    await sql`UPDATE users SET name = ${name}, email = ${email}, password = ${hashed} WHERE id = ${session.userId}`;
  } else {
    await sql`UPDATE users SET name = ${name}, email = ${email} WHERE id = ${session.userId}`;
  }

  return NextResponse.json({ ok: true });
}
