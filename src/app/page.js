'use client';

import { useState, useEffect } from 'react';
import StatsCard from '@/components/Dashboard/StatsCard';
import Link from 'next/link';

export default function Home() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/github');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

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

  if (loading) return <div className="loading">Loading Udriven...</div>;

  return (
    <main className="main">
      <nav className="navbar">
        <h1 className="logo">Udriven</h1>
        <div className="links">
          <Link href="/" className="active">Dashboard</Link>
          <Link href="/community">Community</Link>
        </div>
      </nav>

      <div className="content">
        <div className="dashboard-grid">
          <div className="left-col">
            <StatsCard stats={stats} />

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
          </div>

          <div className="right-col">
            <div className="activity-feed">
              <h3>Recent Activity</h3>
              <div className="feed-list">
                {stats.contributions.map((item) => (
                  <div key={item.id} className="feed-item">
                    <span className="feed-icon">⚡</span>
                    <div className="feed-content">
                      <p>{item.message}</p>
                      <span className="feed-time">{new Date(item.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <span className="feed-xp">+{item.xp} XP</span>
                  </div>
                ))}
                {stats.contributions.length === 0 && (
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
        }
        .links a {
          color: var(--text-muted);
          font-weight: 500;
        }
        .links a.active, .links a:hover {
          color: var(--foreground);
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
      `}</style>
    </main>
  );
}
