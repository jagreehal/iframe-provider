import 'server-only';

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';
import { User } from '@/types';

export const expirationAddOneHour = (date = Date.now()) => {
  const result = new Date(date);

  return new Date(
    Date.UTC(
      result.getUTCFullYear(),
      result.getUTCMonth(),
      result.getUTCDate(),
      result.getUTCHours() + 12, // temporary change to 12 hours
      result.getUTCMinutes(),
      result.getUTCSeconds()
    )
  );
};

const secretKey = 'secret';
const key = new TextEncoder().encode(secretKey);

export interface ApiResult {
  success: boolean;
}

export function setSessionCookie(value: string, options = {}) {
  const expires = expirationAddOneHour();
  cookies().set('session', value, {
    expires,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    ...options,
  });
}

export interface JwtPayload {
  user?: {
    id: string;
    email: string;
    roles: User['roles'];
  };
  clientId?: string;
  expires: Date;
}

export async function generateJWT(payload: JwtPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('12h')
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ['HS256'],
  });
  return payload;
}

export async function createSession(user: User) {
  const expires = expirationAddOneHour();
  const session = await generateJWT({
    user: {
      id: user._id,
      email: user.email,
      roles: user.roles,
    },
    expires,
  });

  setSessionCookie(session);
}

export async function deleteSession() {
  setSessionCookie('', { expires: new Date(0) });
}

export async function getSessionInSteps() {
  const session = cookies().get('session')?.value;
  if (!session)
    return {
      success: false,
      message: 'No session',
    };
  const decrypted = await decrypt(session);
  return {
    success: true,
    message: 'Session found',
    decrypted,
  };
}

export async function getSession() {
  const session = cookies().get('session')?.value;
  if (!session) return;
  return await decrypt(session);
}

export async function updateSession(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  if (!session) return;
  const res = NextResponse.next();

  try {
    const parsed = await decrypt(session);
    parsed.expires = expirationAddOneHour();
    const _session = await generateJWT(parsed);
    res.cookies.set('session', _session, {
      httpOnly: true,
      expires: parsed.expires,
      sameSite: 'none',
      secure: true,
    });
  } catch (error: any) {
    deleteSession();
    console.error('Error updating session:', error);
  }
  return res;
}
