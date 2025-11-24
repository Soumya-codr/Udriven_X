export const BADGES = [
    { id: 'novice', name: 'Novice Coder', minXP: 0, icon: '🌱' },
    { id: 'contributor', name: 'Active Contributor', minXP: 100, icon: '🔨' },
    { id: 'pro', name: 'Pro Developer', minXP: 500, icon: '🚀' },
    { id: 'master', name: 'Code Master', minXP: 1000, icon: '👑' },
    { id: 'legend', name: 'Open Source Legend', minXP: 5000, icon: '🦄' },
];

export function calculateXP(eventType, payload) {
    let xp = 0;
    let message = '';

    switch (eventType) {
        case 'push':
            const commitCount = payload.commits ? payload.commits.length : 1;
            xp = commitCount * 10;
            message = `Pushed ${commitCount} commit(s)`;
            break;
        case 'pull_request':
            if (payload.action === 'opened') {
                xp = 50;
                message = 'Opened a Pull Request';
            } else if (payload.action === 'closed' && payload.pull_request.merged) {
                xp = 100;
                message = 'Merged a Pull Request';
            }
            break;
        case 'issues':
            if (payload.action === 'opened') {
                xp = 20;
                message = 'Opened an Issue';
            } else if (payload.action === 'closed') {
                xp = 30;
                message = 'Closed an Issue';
            }
            break;
        default:
            xp = 5;
            message = 'Contribution';
    }

    return { xp, message };
}

export function getBadges(totalXP) {
    return BADGES.filter(badge => totalXP >= badge.minXP).sort((a, b) => b.minXP - a.minXP);
}

export function getNextBadge(totalXP) {
    return BADGES.find(badge => badge.minXP > totalXP) || null;
}
