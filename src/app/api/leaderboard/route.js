import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const leaderboard = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                image: true,
                xp: true,
                level: true,
                _count: {
                    select: { contributions: true }
                }
            },
            orderBy: { xp: 'desc' },
            take: 20
        });

        // Format for frontend
        const formatted = leaderboard.map((user, index) => ({
            rank: index + 1,
            id: user.id,
            name: user.name,
            image: user.image,
            xp: user.xp,
            level: user.level,
            contributions: user._count.contributions
        }));

        return NextResponse.json(formatted);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
    }
}
