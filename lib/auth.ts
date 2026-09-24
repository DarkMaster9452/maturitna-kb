import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { createHash } from 'crypto';
import { getJwtSecret } from './jwt-secret';


export function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

export async function createSession(userId: string, role: string): Promise<string> {
  return new SignJWT({ userId, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(getJwtSecret());
}

export async function verifySession(token: string): Promise<{ userId: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as { userId: string; role: string };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<{ userId: string; role: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return null;
  return verifySession(token);
}
