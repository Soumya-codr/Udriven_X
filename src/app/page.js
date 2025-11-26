'use client';

import { useState, useEffect } from 'react';
import StatsCard from '@/components/Dashboard/StatsCard';
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function Home() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/github');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchStats();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status]);

  const simulateEvent = async (type) => {
    const payload = {
      action: type === 'pull_request' ? 'opened' : 'push',
      commits: type === 'push' ? [{ id: '123' }] : undefined,
    };

    await fetch('/api/github', {
      method: 'POST',
      headers: { 'x-github-event': type },
      body: JSON.stringify(payload),
    });

    fetchStats();
  };

  if (status === 'loading' || loading) return <div className="loading">Loading Udriven...</div>;

  if (status === 'unauthenticated') {
    return (
      <main className="landing">
        <div className="landing-content">
          <h1 className="landing-title">Udriven</h1>
          <p className="landing-subtitle">Gamify Your GitHub Productivity</p>
          <p className="landing-desc">Track contributions, earn XP, compete on leaderboards, and level up your coding journey.</p>

          <button onClick={() => signIn('github')} className="btn-login">
            <span className="github-icon">⚡</span>
            Login with GitHub
          </button>
        </div>

        <style jsx>{`
            .landing {
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                text-align: center;
                padding: 24px;
                background: radial-gradient(circle at center, rgba(99, 102, 241, 0.1), transparent 50%);
            }
            .landing-title {
                font-size: 4rem;
                font-weight: 800;
                background: linear-gradient(135deg, #fff 0%, #94a3b8 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-bottom: 16px;
                letter-spacing: -2px;
            }
            .landing-subtitle {
                font-size: 1.5rem;
                color: #6366f1;
                margin-bottom: 24px;
                font-weight: 600;
            }
            .landing-desc {
                font-size: 1.1rem;
                color: var(--text-muted);
                max-width: 600px;
                margin-bottom: 48px;
                line-height: 1.6;
            }
            .btn-login {
                display: flex;
                align-items: center;
                gap: 12px;
                background: white;
                color: black;
                font-weight: bold;
                font-size: 1.1rem;
                padding: 16px 32px;
                border-radius: 50px;
                border: none;
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
                box-shadow: 0 0 20px rgba(255,255,255,0.2);
            }
            .btn-login:hover {
                transform: scale(1.05);
                box-shadow: 0 0 30px rgba(255,255,255,0.4);
            }
        `}</style>
      </main>
    );
  }

  return (
    <main className="main">
      <nav className="navbar">
        <h1 className="logo">Udriven</h1>
        <div className="links">
          <Link href="/" className="active">Dashboard</Link>
          <Link href="/community">Community</Link>
          <Link href="/leaderboard">Leaderboard</Link>
          {stats?.role === 'ADMIN' && <Link href="/admin" className="admin-link">Admin Panel</Link>}
          <button onClick={() => signOut()} className="btn-logout">Logout</button>
        </div>
      </nav>

      <div className="content">
        <div className="dashboard-grid">
          <div className="left-col">
            {stats && <StatsCard stats={stats} />}

            {/* Weekly Goal Section */}
            {stats && (
              <div className="goal-card">
                <h3>🎯 Weekly Goal</h3>
                {stats.weeklyGoals && stats.weeklyGoals.length > 0 ? (
                  <div className="goal-content">
                    <p className="goal-desc">{stats.weeklyGoals[0].description}</p>
                    <div className="goal-progress">
                      <span>{stats.weeklyGoals[0].current} / {stats.weeklyGoals[0].target}</span>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${Math.min((stats.weeklyGoals[0].current / stats.weeklyGoals[0].target) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="no-goal">No active goal for this week.</p>
                )}
              </div>
            )}

            <div className="simulation-card">
              <h3>Simulate Activity</h3>
              <p>Trigger GitHub events to test gamification.</p>
              <div className="buttons">
                <button onClick={() => simulateEvent('push')}>
                  Push Code (+10 XP)
                </button>
                <button onClick={() => simulateEvent('pull_request')}>
                  Open PR (+50 XP)
                </button>
              </div>
            </div>

            <div className="leave-section">
              <Link href="/leaves" className="btn-leave">
                📅 Request Leave
              </Link>
            </div>
          </div>

          <div className="right-col">
            <div className="activity-feed">
              <h3>Recent Activity</h3>
              <div className="feed-list">
                {stats && stats.contributions.map((item) => (
                  <div key={item.id} className="feed-item">
                    <span className="feed-icon">⚡</span>
                    <div className="feed-content">
                      <p>{item.message}</p>
                      <span className="feed-time">{new Date(item.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <span className="feed-xp">+{item.xp} XP</span>
                  </div>
                ))}
                {stats && stats.contributions.length === 0 && (
                  <p className="empty-feed">No recent activity.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .main {
          min-height: 100vh;
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          color: var(--text-muted);
        }
        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--card-border);
        }
        .logo {
          font-size: 1.5rem;
          font-weight: bold;
          background: linear-gradient(90deg, var(--primary), var(--secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .links {
          display: flex;
          gap: 24px;
          align-items: center;
        }
        .links a {
          color: var(--text-muted);
          font-weight: 500;
        }
        .links a.active, .links a:hover {
          color: var(--foreground);
        }
        .admin-link {
            color: #f472b6 !important; /* Pink color for visibility */
            font-weight: bold;
        }
        .btn-logout {
            background: rgba(255,255,255,0.1);
            border: none;
            color: var(--text-muted);
            padding: 8px 16px;
            border-radius: 20px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.2s;
        }
        .btn-logout:hover {
            background: rgba(255,255,255,0.2);
            color: white;
        }
        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 24px;
        }
        @media (max-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }
        .simulation-card {
          margin-top: 24px;
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 16px;
          padding: 24px;
          backdrop-filter: var(--backdrop-blur);
        }
        .simulation-card h3 {
          margin-bottom: 8px;
        }
        .simulation-card p {
          color: var(--text-muted);
          margin-bottom: 16px;
          font-size: 0.9rem;
        }
        .buttons {
          display: flex;
          gap: 12px;
        }
        button {
          background: var(--card-hover);
          border: 1px solid var(--card-border);
          color: var(--foreground);
          padding: 10px 16px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 500;
        }
        button:hover {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
        }
        .activity-feed {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 16px;
          padding: 24px;
          height: 100%;
          min-height: 400px;
          backdrop-filter: var(--backdrop-blur);
        }
        .activity-feed h3 {
          margin-bottom: 20px;
        }
        .feed-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .feed-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .feed-icon {
          font-size: 1.2rem;
          background: rgba(255,255,255,0.05);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .feed-content {
          flex: 1;
        }
        .feed-content p {
          font-weight: 500;
        }
        .feed-time {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .feed-xp {
          color: var(--success);
          font-weight: bold;
        }
        .empty-feed {
          color: var(--text-muted);
          text-align: center;
          margin-top: 40px;
        }
        .goal-card {
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            border-radius: 16px;
            padding: 24px;
            margin-top: 24px;
            backdrop-filter: var(--backdrop-blur);
        }
        .goal-content {
            margin-top: 12px;
        }
        .goal-desc {
            font-weight: 500;
            margin-bottom: 8px;
        }
        .goal-progress {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        .goal-progress span {
            font-size: 0.8rem;
            color: var(--text-muted);
            align-self: flex-end;
        }
        .progress-bar {
            height: 8px;
            background: rgba(255,255,255,0.1);
            border-radius: 4px;
            overflow: hidden;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #10b981, #34d399);
            transition: width 0.5s ease;
        }
        .no-goal {
            color: var(--text-muted);
            font-style: italic;
            margin-top: 8px;
        }
        .leave-section {
            margin-top: 24px;
        }
        .btn-leave {
            display: block;
            width: 100%;
            text-align: center;
            background: rgba(239, 68, 68, 0.1);
            color: #fca5a5;
            padding: 12px;
            border-radius: 8px;
            border: 1px solid rgba(239, 68, 68, 0.2);
            transition: all 0.2s;
            font-weight: 500;
        }
        .btn-leave:hover {
            background: rgba(239, 68, 68, 0.2);
            transform: translateY(-2px);
        }
      `}</style>
    </main>
  );
}
