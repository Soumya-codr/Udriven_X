import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function POST(request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { userId, description, target } = await request.json();

        const goal = await prisma.weeklyGoal.create({
            data: {
                userId,
                description,
                target: parseInt(target),
                weekStartDate: new Date(), // Starts today
                status: 'PENDING'
            }
        });

        return NextResponse.json(goal);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to assign goal' }, { status: 500 });
    }
}
