import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  cookies().delete('auth_token')
  return NextResponse.json({ success: true })
}

export async function GET(req: NextRequest) {
  cookies().delete('auth_token')
  return NextResponse.redirect(new URL('/', req.url))
}
