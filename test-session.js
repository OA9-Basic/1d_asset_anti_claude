const { PrismaClient } = require('@prisma/client')
const jwt = require('jsonwebtoken')

const prisma = new PrismaClient()

async function testSession() {
  try {
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: 'admin@test.com' },
      include: { wallet: true }
    })

    console.log('User from DB:', JSON.stringify({
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      wallet: user.wallet ? { balance: user.wallet.balance } : null
    }, null, 2))

    // Generate new token
    const JWT_SECRET = process.env.JWT_SECRET || 'rT3vY7mN2pQ8kL5xW9zC4bF6sD1gH3jV8nP5mR2tK'
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })
    console.log('\nNew Token:', token)

    // Test verification
    const decoded = jwt.verify(token, JWT_SECRET)
    console.log('Decoded:', decoded)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testSession()
