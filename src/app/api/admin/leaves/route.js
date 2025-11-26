import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

// GET: Fetch all leave requests (Admin only)
export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const leaves = await prisma.leaveRequest.findMany({
            include: {
                user: {
                    select: { name: true, email: true, role: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(leaves);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch leaves' }, { status: 500 });
    }
}

// PATCH: Update leave status (Approve/Reject)
export async function PATCH(request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { id, status } = await request.json();

        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const updatedLeave = await prisma.leaveRequest.update({
            where: { id },
            data: { status }
        });

        return NextResponse.json(updatedLeave);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update leave' }, { status: 500 });
    }
}
