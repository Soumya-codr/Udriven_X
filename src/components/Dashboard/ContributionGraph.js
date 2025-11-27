'use client';

import { useMemo } from 'react';

export default function ContributionGraph({ contributions }) {
    const chartData = useMemo(() => {
        const days = 7;
        const data = [];
        const today = new Date();

        // Initialize last 7 days with 0 XP
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString(undefined, { weekday: 'short' });
            const fullDate = date.toISOString().split('T')[0];
            data.push({ day: dateStr, date: fullDate, xp: 0, count: 0 });
        }

        // Aggregate contributions
        if (contributions) {
            contributions.forEach(c => {
                const cDate = new Date(c.timestamp).toISOString().split('T')[0];
                const dayData = data.find(d => d.date === cDate);
                if (dayData) {
                    dayData.xp += c.xp;
                    dayData.count += 1;
                }
            });
        }

        // Normalize for height (max height 100px)
        const maxXP = Math.max(...data.map(d => d.xp), 10); // Min max is 10 to avoid division by zero

        return data.map(d => ({
            ...d,
            height: (d.xp / maxXP) * 100
        }));
    }, [contributions]);

    return (
        <div className="graph-card">
            <h3>📊 Activity Graph (Last 7 Days)</h3>
            <div className="chart-container">
                {chartData.map((d, i) => (
                    <div key={i} className="bar-group">
                        <div className="bar-wrapper">
                            <div
                                className="bar"
                                style={{ height: `${d.height}%` }}
                                title={`${d.xp} XP (${d.count} contributions)`}
                            ></div>
                        </div>
                        <span className="day-label">{d.day}</span>
                    </div>
                ))}
            </div>

            <style jsx>{`
        .graph-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 16px;
          padding: 24px;
          margin-top: 24px;
          backdrop-filter: var(--backdrop-blur);
        }
        h3 {
          margin-bottom: 20px;
          font-size: 1.1rem;
        }
        .chart-container {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          height: 150px;
          padding-top: 20px;
          gap: 8px;
        }
        .bar-group {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          height: 100%;
          justify-content: flex-end;
        }
        .bar-wrapper {
            flex: 1;
            width: 100%;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            background: rgba(255,255,255,0.02);
            border-radius: 8px;
            margin-bottom: 8px;
            overflow: hidden;
        }
        .bar {
          width: 60%;
          background: linear-gradient(to top, var(--primary), var(--secondary));
          border-radius: 4px;
          min-height: 4px;
          transition: height 0.5s ease;
          position: relative;
        }
        .bar:hover {
            filter: brightness(1.2);
            cursor: pointer;
        }
        .day-label {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
      `}</style>
        </div>
    );
}
