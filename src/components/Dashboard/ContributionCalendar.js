'use client';

import { useMemo } from 'react';

export default function ContributionCalendar({ contributions = [], leaveRequests = [] }) {
    const { calendarData, streak, totalContributions } = useMemo(() => {
        const today = new Date();
        const data = [];
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(today.getFullYear() - 1);

        // Helper to format date as YYYY-MM-DD
        const formatDate = (date) => date.toISOString().split('T')[0];

        // Create a map of contributions by date
        const contributionMap = new Map();
        contributions.forEach(c => {
            const date = formatDate(new Date(c.timestamp));
            if (!contributionMap.has(date)) {
                contributionMap.set(date, { count: 0, xp: 0 });
            }
            const entry = contributionMap.get(date);
            entry.count += 1;
            entry.xp += c.xp;
        });

        // Create a map of leave days
        const leaveMap = new Map();
        leaveRequests.forEach(req => {
            if (req.status === 'APPROVED' || req.status === 'PENDING') {
                let current = new Date(req.startDate);
                const end = new Date(req.endDate);
                while (current <= end) {
                    leaveMap.set(formatDate(current), req.status);
                    current.setDate(current.getDate() + 1);
                }
            }
        });

        // Generate calendar days
        let currentStreak = 0;
        let streakActive = true;
        let total = 0;

        // Iterate backwards from today for streak calculation
        for (let i = 0; i < 365; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = formatDate(date);
            const contrib = contributionMap.get(dateStr);

            if (streakActive) {
                if (contrib && contrib.count > 0) {
                    currentStreak++;
                } else if (i === 0) {
                    // If today has no contributions yet, don't break streak immediately if yesterday had one
                    // But strictly speaking, streak includes today if done, or up to yesterday.
                    // Let's keep it simple: Streak is consecutive days ending today or yesterday.
                } else {
                    streakActive = false;
                }
            }
        }

        // Generate forward data for rendering (Oldest to Newest)
        // We need to align to weeks (Sunday start)
        const startDate = new Date(oneYearAgo);
        // Adjust start date to previous Sunday to align grid
        startDate.setDate(startDate.getDate() - startDate.getDay());

        const weeks = [];
        let currentWeek = [];
        let currentDate = new Date(startDate);

        while (currentDate <= today || currentWeek.length > 0) {
            const dateStr = formatDate(currentDate);
            const contrib = contributionMap.get(dateStr);
            const leaveStatus = leaveMap.get(dateStr);

            if (contrib) total += contrib.count;

            // Determine intensity level (0-4)
            let level = 0;
            if (contrib) {
                if (contrib.xp > 500) level = 4;
                else if (contrib.xp > 200) level = 3;
                else if (contrib.xp > 100) level = 2;
                else if (contrib.xp > 0) level = 1;
            }

            currentWeek.push({
                date: dateStr,
                count: contrib ? contrib.count : 0,
                xp: contrib ? contrib.xp : 0,
                level,
                leaveStatus
            });

            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }

            currentDate.setDate(currentDate.getDate() + 1);
            if (currentDate > today && currentWeek.length === 0) break;
        }

        // Push incomplete last week if any (shouldn't happen with logic above but safe to have)
        if (currentWeek.length > 0) weeks.push(currentWeek);

        return { calendarData: weeks, streak: currentStreak, totalContributions: total };
    }, [contributions, leaveRequests]);

    return (
        <div className="calendar-card">
            <div className="calendar-header">
                <h3>📅 Contribution Calendar</h3>
                <div className="meta-stats">
                    <div className="meta-item">
                        <span className="label">Total Contributions</span>
                        <span className="value">{totalContributions}</span>
                    </div>
                    <div className="meta-item">
                        <span className="label">Current Streak</span>
                        <span className="value fire">{streak} Days 🔥</span>
                    </div>
                </div>
            </div>

            <div className="calendar-grid">
                {calendarData.map((week, wIndex) => (
                    <div key={wIndex} className="week-col">
                        {week.map((day, dIndex) => (
                            <div
                                key={dIndex}
                                className={`day-cell level-${day.level} ${day.leaveStatus ? `leave-${day.leaveStatus.toLowerCase()}` : ''}`}
                                title={`${day.date}: ${day.xp} XP (${day.count} contributions)${day.leaveStatus ? ` - ${day.leaveStatus} AFK` : ''}`}
                            ></div>
                        ))}
                    </div>
                ))}
            </div>

            <div className="legend">
                <span>Less</span>
                <div className="day-cell level-0"></div>
                <div className="day-cell level-1"></div>
                <div className="day-cell level-2"></div>
                <div className="day-cell level-3"></div>
                <div className="day-cell level-4"></div>
                <span>More</span>
                <span className="spacer">|</span>
                <div className="day-cell leave-approved"></div>
                <span>AFK (Break)</span>
            </div>

            <style jsx>{`
        .calendar-card {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 24px;
          padding: 24px;
          margin-top: 24px;
          backdrop-filter: var(--backdrop-blur);
          box-shadow: var(--glass-shadow);
        }
        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 16px;
        }
        h3 {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--foreground);
        }
        .meta-stats {
          display: flex;
          gap: 24px;
        }
        .meta-item {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        .meta-item .label {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .meta-item .value {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--foreground);
        }
        .meta-item .value.fire {
          color: #f59e0b;
          text-shadow: 0 0 10px rgba(245, 158, 11, 0.4);
        }

        .calendar-grid {
          display: flex;
          gap: 4px;
          overflow-x: auto;
          padding-bottom: 12px;
        }
        .week-col {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .day-cell {
          width: 12px;
          height: 12px;
          border-radius: 3px;
          background: rgba(255, 255, 255, 0.05);
          transition: all 0.2s;
        }
        .day-cell:hover {
          transform: scale(1.4);
          z-index: 10;
          border: 1px solid rgba(255,255,255,0.5);
        }
        
        /* Intensity Levels */
        .level-0 { background: rgba(255, 255, 255, 0.05); }
        .level-1 { background: rgba(99, 102, 241, 0.3); }
        .level-2 { background: rgba(99, 102, 241, 0.5); }
        .level-3 { background: rgba(99, 102, 241, 0.7); }
        .level-4 { background: rgba(99, 102, 241, 1); box-shadow: 0 0 8px rgba(99, 102, 241, 0.6); }

        /* Leave Status */
        .leave-approved {
            background: repeating-linear-gradient(
              45deg,
              rgba(255, 255, 255, 0.05),
              rgba(255, 255, 255, 0.05) 2px,
              rgba(239, 68, 68, 0.2) 2px,
              rgba(239, 68, 68, 0.2) 4px
            );
            border: 1px solid rgba(239, 68, 68, 0.3);
        }
        .leave-pending {
            background: repeating-linear-gradient(
              45deg,
              rgba(255, 255, 255, 0.05),
              rgba(255, 255, 255, 0.05) 2px,
              rgba(245, 158, 11, 0.2) 2px,
              rgba(245, 158, 11, 0.2) 4px
            );
        }

        .legend {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 16px;
          font-size: 0.75rem;
          color: var(--text-muted);
          justify-content: flex-end;
        }
        .spacer { margin: 0 8px; color: var(--glass-border); }
      `}</style>
        </div>
    );
}
