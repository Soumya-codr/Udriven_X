import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
    try {
        const messages = await prisma.message.findMany({
            take: 50,
            orderBy: { createdAt: 'asc' },
            include: {
                user: {
                    select: { name: true, image: true }
                }
            }
        });

        return NextResponse.json(messages);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { content } = await request.json();

        const message = await prisma.message.create({
            data: {
                content,
                userId: session.user.id,
            },
            include: {
                user: {
                    select: { name: true, image: true }
                }
            }
        });

        return NextResponse.json(message);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
    }
}
