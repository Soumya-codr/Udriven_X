import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET() {
    const session = await getServerSession(authOptions);

    // 1. Security Check: Must be logged in AND be an ADMIN
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    try {
        // 2. Fetch all users with relevant stats
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                xp: true,
                credits: true,
                weeklyGoals: {
                    where: { status: 'PENDING' },
                    take: 1
                }
            },
            orderBy: { xp: 'desc' }
        });

        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
