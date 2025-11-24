import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { calculateXP } from '@/lib/gamification';

export async function POST(request) {
    console.log("🔔 Webhook Request Received!");
    try {
        const body = await request.text();
        console.log("📦 Payload Body Length:", body.length);

        const signature = request.headers.get('x-hub-signature-256');
        const eventType = request.headers.get('x-github-event');
        console.log("Events Type:", eventType);

        // Verify Signature (only if secret is set)
        if (process.env.GITHUB_SECRET) {
            const hmac = crypto.createHmac('sha256', process.env.GITHUB_SECRET);
            const digest = Buffer.from('sha256=' + hmac.update(body).digest('hex'), 'utf8');
            const checksum = Buffer.from(signature || '', 'utf8');

            if (checksum.length !== digest.length || !crypto.timingSafeEqual(digest, checksum)) {
                return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
            }
        }

        const payload = JSON.parse(body);

        // Repository Whitelist Check
        const allowedRepos = process.env.ALLOWED_REPOS ? process.env.ALLOWED_REPOS.split(',').map(r => r.trim()) : [];
        const repoName = payload.repository?.full_name;

        if (allowedRepos.length > 0 && (!repoName || !allowedRepos.includes(repoName))) {
            console.log(`Skipping contribution from unauthorized repo: ${repoName}`);
            return NextResponse.json({ success: false, message: 'Repository not in whitelist' });
        }

        const { xp, message } = calculateXP(eventType, payload);

        if (xp > 0) {
            const githubId = String(payload.sender?.id);

            // Try to find user by Account
            let user = await prisma.user.findFirst({
                where: {
                    accounts: {
                        some: {
                            provider: 'github',
                            providerAccountId: githubId
                        }
                    }
                }
            });

            if (user) {
                await prisma.$transaction([
                    prisma.contribution.create({
                        data: {
                            type: eventType,
                            message,
                            xp,
                            userId: user.id,
                        },
                    }),
                    prisma.user.update({
                        where: { id: user.id },
                        data: {
                            xp: { increment: xp },
                            level: Math.floor((user.xp + xp) / 1000) + 1
                        },
                    }),
                ]);
            } else {
                console.log(`Received contribution from unknown user (GitHub ID: ${githubId}). XP: ${xp}`);
            }
        }

        return NextResponse.json({ success: true, xpAdded: xp });
    } catch (error) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET() {
    // Return recent contributions from DB
    const contributions = await prisma.contribution.findMany({
        take: 50,
        orderBy: { timestamp: 'desc' },
        include: { user: true },
    });

    // Calculate total stats (mocking the single user view for now if not logged in)
    // In a real app, this would be filtered by the logged-in user
    const stats = {
        xp: contributions.reduce((acc, curr) => acc + curr.xp, 0),
        level: 1, // Placeholder
        contributions: contributions.map(c => ({
            id: c.id,
            message: c.message,
            xp: c.xp,
            timestamp: c.timestamp,
            user: c.user?.name || 'Unknown'
        }))
    };

    return NextResponse.json(stats);
}
