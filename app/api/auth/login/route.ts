export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { hashPassword, createSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) return NextResponse.json({ error: 'Chýbajú údaje.' }, { status: 400 });

  const hashed = hashPassword(password);
  const rows = await sql`SELECT id, name, email, role, onboarding_done FROM users WHERE email = ${email} AND password = ${hashed}`;

  if (!rows.length) return NextResponse.json({ error: 'Nesprávny e-mail alebo heslo.' }, { status: 401 });

  const user = rows[0];
  const token = await createSession(user.id, user.role);

  const res = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, onboardingDone: user.onboarding_done } });
  res.cookies.set('session', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/' });
  return res;
}
