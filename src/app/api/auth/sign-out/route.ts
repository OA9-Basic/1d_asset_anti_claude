import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST() {
  cookies().delete('auth_token');
  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest) {
  cookies().delete('auth_token');
  return NextResponse.redirect(new URL('/', req.url));
}
