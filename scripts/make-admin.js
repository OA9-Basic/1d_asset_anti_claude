const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function makeAdmin() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@test.com' }
    })

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: 'ADMIN' }
      })
      console.log('✓ User updated to ADMIN role:', user.email)
    } else {
      console.log('✗ User not found')
    }

    // Get all users
    const allUsers = await prisma.user.findMany()
    console.log('\nAll users:')
    allUsers.forEach(u => {
      console.log(`- ${u.email} (${u.role})`)
    })
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

makeAdmin()
