import { NextRequest, NextResponse } from 'next/server';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'communitree2026';
const COOKIE_NAME = 'admin_token';
const COOKIE_VALUE = 'admin_authenticated';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, COOKIE_VALUE, {
    httpOnly: true,
    path: '/admin',
    maxAge: MAX_AGE,
    sameSite: 'lax',
  });

  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    path: '/admin',
    maxAge: 0,
  });
  return res;
}
