const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    // Replace with the user's email or ID
    const email = 'tussi@example.com' // You might need to ask the user for their email or check the DB

    try {
        // Find the first user (usually the creator) if email is not known, or use specific email
        const user = await prisma.user.findFirst()

        if (!user) {
            console.log('No users found.')
            return
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { role: 'ADMIN' },
        })

        console.log(`User ${updatedUser.name} (${updatedUser.email}) is now an ADMIN.`)
    } catch (error) {
        console.error('Error promoting user:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
