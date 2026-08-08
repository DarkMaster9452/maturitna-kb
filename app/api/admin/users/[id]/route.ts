export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';

const ROLES = ['student', 'teacher', 'admin', 'owner'];

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || !['admin', 'owner'].includes(session.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { name, email, role } = body;

  if (role !== undefined) {
    if (!ROLES.includes(role)) return NextResponse.json({ error: 'Neplatná rola.' }, { status: 400 });
    if (params.id === session.userId) return NextResponse.json({ error: 'Nemôžeš zmeniť vlastnú rolu.' }, { status: 400 });
    if (role === 'owner' && session.role !== 'owner') return NextResponse.json({ error: 'Len vlastník môže prideliť rolu vlastník.' }, { status: 403 });
    await sql`UPDATE users SET role = ${role} WHERE id = ${params.id}`;
  }
  if (typeof name === 'string' && name.trim()) {
    await sql`UPDATE users SET name = ${name.trim()} WHERE id = ${params.id}`;
  }
  if (typeof email === 'string' && email.trim()) {
    const dupe = await sql`SELECT id FROM users WHERE lower(email) = lower(${email.trim()}) AND id <> ${params.id}`;
    if (dupe.length) return NextResponse.json({ error: 'E-mail už používa iný účet.' }, { status: 400 });
    await sql`UPDATE users SET email = ${email.trim()} WHERE id = ${params.id}`;
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || !['admin', 'owner'].includes(session.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (params.id === session.userId) return NextResponse.json({ error: 'Nemôžeš zmazať sám seba.' }, { status: 400 });

  const target = await sql`SELECT role FROM users WHERE id = ${params.id}`;
  if (target.length && target[0].role === 'owner' && session.role !== 'owner') {
    return NextResponse.json({ error: 'Len vlastník môže zmazať vlastníka.' }, { status: 403 });
  }
  await sql`DELETE FROM users WHERE id = ${params.id}`;
  return NextResponse.json({ ok: true });
}
