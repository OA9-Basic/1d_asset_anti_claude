import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string) {
  return await bcrypt.compare(password, hash)
}

export function signToken(userId: string) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string }
  } catch {
    return null
  }
}

export async function getUserFromToken(req: Request) {
  const cookieHeader = req.headers.get('cookie')
  if (!cookieHeader) return null

  const cookies = Object.fromEntries(
    cookieHeader.split('; ').map(c => c.split('='))
  )

  const token = cookies.auth_token
  if (!token) return null

  const decoded = verifyToken(token)
  return decoded?.userId || null
}
