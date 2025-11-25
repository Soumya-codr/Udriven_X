import { getBadges, getNextBadge } from '@/lib/gamification';

export default function StatsCard({ stats }) {
  const badges = getBadges(stats.xp);
  const nextBadge = getNextBadge(stats.xp);
  const progressToNext = nextBadge
    ? ((stats.xp - (badges[0]?.minXP || 0)) / (nextBadge.minXP - (badges[0]?.minXP || 0))) * 100
    : 100;

  return (
    <div className="stats-card">
      <div className="header">
        <div className="avatar">
          <span>{stats.level}</span>
        </div>
        <div className="info">
          <h2>User Level {stats.level}</h2>
          <p className="xp">{stats.xp} XP</p>
          <p className="credits">💎 {stats.credits || 0} Credits</p>
        </div>
      </div>

      <div className="progress-container">
        <div className="progress-label">
          <span>Progress to {nextBadge ? nextBadge.name : 'Max Level'}</span>
          <span>{Math.min(Math.round(progressToNext), 100)}%</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${Math.min(progressToNext, 100)}%` }}
          ></div>
        </div>
      </div>

      <div className="badges-section">
        <h3>Badges Earned</h3>
        <div className="badges-grid">
          {badges.length > 0 ? (
            badges.map(badge => (
              <div key={badge.id} className="badge" title={badge.name}>
                <span className="badge-icon">{badge.icon}</span>
                <span className="badge-name">{badge.name}</span>
              </div>
            ))
          ) : (
            <p className="no-badges">No badges yet. Start coding!</p>
          )}
        </div>
      </div>

      <style jsx>{`
        .stats-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 16px;
          padding: 24px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
          backdrop-filter: blur(10px);
        }
        .header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }
        .avatar {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: bold;
          color: white;
          box-shadow: 0 0 15px var(--primary-glow);
        }
        .info h2 {
          font-size: 1.2rem;
          margin-bottom: 4px;
        }
        .xp {
          color: var(--primary);
          font-weight: bold;
        }
        .credits {
          color: #fbbf24;
          font-weight: bold;
          font-size: 0.9rem;
          margin-top: 4px;
        }
        .progress-container {
          margin-bottom: 24px;
        }
        .progress-label {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          color: var(--text-muted);
          margin-bottom: 8px;
        }
        .progress-bar {
          height: 8px;
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary), var(--secondary));
          transition: width 0.5s ease;
        }
        .badges-section h3 {
          font-size: 1rem;
          margin-bottom: 12px;
          color: var(--text-muted);
        }
        .badges-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
        .badge {
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--card-border);
          padding: 8px 12px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          transition: transform 0.2s;
        }
        .badge:hover {
          transform: translateY(-2px);
          background: rgba(255,255,255,0.1);
        }
        .no-badges {
          color: var(--text-muted);
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
