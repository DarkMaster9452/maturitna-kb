export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import sql from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rows = await sql`SELECT id, name, email, role, onboarding_done FROM users WHERE id = ${session.userId}`;
  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const u = rows[0];
  return NextResponse.json({ id: u.id, name: u.name, email: u.email, role: u.role, onboardingDone: u.onboarding_done });
}
