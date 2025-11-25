import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { reason, startDate, endDate } = await request.json();

        // Basic validation
        if (!reason || !startDate || !endDate) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const leaveRequest = await prisma.leaveRequest.create({
            data: {
                userId: session.user.id,
                reason,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                status: 'PENDING'
            }
        });

        return NextResponse.json(leaveRequest);
    } catch (error) {
        console.error('Leave Request Error:', error);
        return NextResponse.json({ error: 'Failed to submit leave request' }, { status: 500 });
    }
}

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const requests = await prisma.leaveRequest.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(requests);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch leave requests' }, { status: 500 });
    }
}
