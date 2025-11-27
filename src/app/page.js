'use client';

import { useState, useEffect } from 'react';
import StatsCard from '@/components/Dashboard/StatsCard';
import ContributionCalendar from '@/components/Dashboard/ContributionCalendar';
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';

import anime from 'animejs';

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

  useEffect(() => {
    if (!loading && stats) {
      anime({
        targets: '.animate-entry',
        translateY: [20, 0],
        opacity: [0, 1],
        delay: anime.stagger(100),
        easing: 'easeOutExpo',
        duration: 800
      });
    }
  }, [loading, stats]);

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
          <Link href="/about">How to Use</Link>
          <Link href="/community">Community</Link>
          <Link href="/leaderboard">Leaderboard</Link>
          {stats?.role === 'ADMIN' && <Link href="/admin" className="admin-link">Admin Panel</Link>}
          <button onClick={() => signOut()} className="btn-logout">Logout</button>
        </div>
      </nav>

      <div className="content">
        <div className="dashboard-layout">

          {/* Top Section: 3 Columns (Stats, Quest, Actions) */}
          <div className="section-top">
            <div className="stats-wrapper animate-entry">
              {stats && <StatsCard stats={stats} />}
            </div>

            <div className="quest-wrapper animate-entry">
              {/* Weekly Goal */}
              {stats && (
                <div className="goal-card">
                  <h3>⚔️ Weekly Quest</h3>
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
                    <p className="no-goal">No active quest for this week.</p>
                  )}
                </div>
              )}
            </div>

            <div className="actions-wrapper animate-entry">
              {/* Simulation & Leave */}
              <div className="actions-grid">
                <div className="simulation-card">
                  <h3>⚡ Actions</h3>
                  <div className="buttons">
                    <button onClick={() => simulateEvent('push')}>Push</button>
                    <button onClick={() => simulateEvent('pull_request')}>PR</button>
                  </div>
                </div>
                <div className="leave-card-small">
                  <Link href="/leaves" className="btn-leave">
                    💤 Go AFK
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Section: Recent Activity (Full Width) */}
          <div className="section-middle animate-entry">
            <div className="activity-feed">
              <div className="feed-header">
                <h3>Recent Activity</h3>
                <span className="badge">Live Feed</span>
              </div>
              <div className="feed-grid">
                {stats && stats.contributions.slice(0, 4).map((item) => (
                  <div key={item.id} className="feed-card">
                    <div className="feed-top">
                      <div className="feed-icon-wrapper">
                        <span className="feed-icon">
                          {item.type === 'PushEvent' ? '🚀' : item.type === 'PullRequestEvent' ? '🔀' : '⚡'}
                        </span>
                      </div>
                      <span className="feed-time">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="feed-msg">{item.message}</p>
                    <div className="feed-xp-badge">+{item.xp} XP</div>
                  </div>
                ))}
                {stats && stats.contributions.length === 0 && (
                  <p className="empty-feed">No recent activity to show.</p>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Section: Calendar */}
          <div className="section-bottom animate-entry">
            {stats && (
              <ContributionCalendar
                contributions={stats.contributions}
                leaveRequests={stats.leaveRequests}
              />
            )}
          </div>

        </div>
      </div>

      <style jsx>{`
        .main {
          min-height: 100vh;
          padding: 24px;
          max-width: 1400px; /* Increased max-width for 3 columns */
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
            color: #f472b6 !important;
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

        /* Dashboard Layout */
        .dashboard-layout {
            display: flex;
            flex-direction: column;
            gap: 24px;
        }

        /* Top Section: 3 Columns */
        .section-top {
            display: grid;
            grid-template-columns: 1fr 1fr 0.8fr;
            gap: 24px;
            align-items: stretch;
        }
        @media (max-width: 1024px) {
            .section-top {
                grid-template-columns: 1fr 1fr;
            }
            .actions-wrapper {
                grid-column: span 2;
            }
        }
        @media (max-width: 768px) {
            .section-top {
                grid-template-columns: 1fr;
            }
            .actions-wrapper {
                grid-column: span 1;
            }
        }

        /* Cards */
        .goal-card, .simulation-card, .leave-card-small {
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            border-radius: 20px;
            padding: 24px;
            backdrop-filter: var(--backdrop-blur);
            transition: transform 0.2s;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        .goal-card:hover, .simulation-card:hover {
            transform: translateY(-2px);
            border-color: rgba(255,255,255,0.1);
        }
        .goal-content { margin-top: 12px; }
        .goal-desc { font-weight: 500; margin-bottom: 12px; font-size: 1.1rem; }
        .goal-progress { display: flex; flex-direction: column; gap: 6px; }
        .goal-progress span { font-size: 0.85rem; color: var(--text-muted); align-self: flex-end; }
        .progress-bar { height: 10px; background: rgba(255,255,255,0.1); border-radius: 5px; overflow: hidden; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, var(--success), #34d399); transition: width 0.5s ease; }
        
        .actions-grid {
            display: flex;
            flex-direction: column;
            gap: 16px;
            height: 100%;
        }
        .simulation-card { flex: 1; }
        .leave-card-small { flex: 0.8; }

        .simulation-card h3 { font-size: 1rem; margin-bottom: 12px; }
        .buttons { display: flex; gap: 8px; }
        .buttons button {
            flex: 1;
            background: rgba(255,255,255,0.05);
            border: 1px solid var(--card-border);
            color: var(--text-muted);
            padding: 8px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 0.9rem;
        }
        .buttons button:hover {
            background: var(--primary);
            color: white;
            border-color: var(--primary);
        }
        .btn-leave {
            width: 100%;
            text-align: center;
            background: rgba(239, 68, 68, 0.1);
            color: #fca5a5;
            padding: 12px;
            border-radius: 12px;
            border: 1px solid rgba(239, 68, 68, 0.2);
            transition: all 0.2s;
            font-weight: 600;
        }
        .btn-leave:hover {
            background: rgba(239, 68, 68, 0.2);
            transform: scale(1.02);
        }

        /* Activity Feed Full Width */
        .activity-feed {
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            border-radius: 24px;
            padding: 28px;
            backdrop-filter: var(--backdrop-blur);
        }
        .feed-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
        }
        .badge {
            background: rgba(16, 185, 129, 0.2);
            color: var(--success);
            font-size: 0.7rem;
            padding: 4px 8px;
            border-radius: 20px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            animation: pulse 2s infinite;
        }
        .feed-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 16px;
        }
        .feed-card {
            background: rgba(255,255,255,0.02);
            border: 1px solid var(--glass-border);
            border-radius: 16px;
            padding: 20px;
            transition: all 0.2s;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .feed-card:hover {
            background: rgba(255,255,255,0.05);
            transform: translateY(-4px);
            border-color: rgba(255,255,255,0.1);
        }
        .feed-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }
        .feed-icon-wrapper {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
        }
        .feed-time {
            font-size: 0.75rem;
            color: var(--text-muted);
        }
        .feed-msg {
            font-weight: 600;
            font-size: 0.95rem;
            color: var(--foreground);
            line-height: 1.4;
        }
        .feed-xp-badge {
            align-self: flex-start;
            background: rgba(99, 102, 241, 0.15);
            color: #818cf8;
            padding: 4px 10px;
            border-radius: 8px;
            font-weight: 700;
            font-size: 0.8rem;
        }
        .empty-feed {
            color: var(--text-muted);
            text-align: center;
            grid-column: 1 / -1;
            padding: 20px;
            font-style: italic;
        }
      `}</style>
    </main>
  );
}
