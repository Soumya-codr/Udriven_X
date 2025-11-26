const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Fetching all users...");
    const users = await prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true }
    });

    console.log("📋 Current Users:");
    console.table(users);

    const targetUsername = "Soumya-codr";
    console.log(`\n🔍 Looking for user with name containing: "${targetUsername}"...`);

    const user = await prisma.user.findFirst({
        where: {
            name: {
                contains: targetUsername,
                mode: 'insensitive', // Case-insensitive search
            },
        },
    });

    if (user) {
        console.log(`✅ Found user: ${user.name} (${user.email}) - Current Role: ${user.role}`);

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { role: 'ADMIN' },
        });

        console.log(`🎉 Successfully promoted ${updatedUser.name} to ADMIN!`);
    } else {
        console.log(`❌ User "${targetUsername}" not found.`);
        console.log("Tip: Ensure the user has logged in at least once.");
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
