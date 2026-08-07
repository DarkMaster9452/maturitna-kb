export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';

const ROLES = ['student', 'teacher', 'admin', 'owner'];

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || !['admin', 'owner'].includes(session.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { role } = await req.json();
  if (!ROLES.includes(role)) return NextResponse.json({ error: 'Neplatná rola.' }, { status: 400 });
  if (params.id === session.userId) return NextResponse.json({ error: 'Nemôžeš zmeniť vlastnú rolu.' }, { status: 400 });
  // only an owner may grant the owner role
  if (role === 'owner' && session.role !== 'owner') return NextResponse.json({ error: 'Len vlastník môže prideliť rolu vlastník.' }, { status: 403 });

  await sql`UPDATE users SET role = ${role} WHERE id = ${params.id}`;
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
