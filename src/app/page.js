'use client';

import { useState, useEffect, useRef } from 'react';
import StatsCard from '@/components/Dashboard/StatsCard';
import ContributionCalendar from '@/components/Dashboard/ContributionCalendar';
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';

import anime from 'animejs';

export default function Home() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasAnimated = useRef(false);

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
    if (!loading && stats && !hasAnimated.current) {
      anime({
        targets: '.animate-entry',
        translateY: [20, 0],
        opacity: [0, 1],
        delay: anime.stagger(100),
        easing: 'easeOutExpo',
        duration: 800
      });
      hasAnimated.current = true;
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

  if (status === 'loading' || loading) {
    return (
      <main className="main">
        <nav className="navbar skeleton-nav">
          <div className="skeleton logo-skeleton" style={{ width: '120px', height: '32px' }}></div>
          <div className="links">
            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ width: '80px', height: '20px' }}></div>)}
          </div>
        </nav>
        <div className="content">
          <div className="dashboard-layout">
            <div className="section-top">
              <div className="skeleton" style={{ height: '200px', borderRadius: '20px' }}></div>
              <div className="skeleton" style={{ height: '200px', borderRadius: '20px' }}></div>
              <div className="skeleton" style={{ height: '200px', borderRadius: '20px' }}></div>
            </div>
            <div className="section-middle">
              <div className="skeleton" style={{ height: '300px', borderRadius: '24px' }}></div>
            </div>
          </div>
        </div>
        <style jsx>{`
            .main { padding: 24px; max-width: 1400px; margin: 0 auto; }
            .navbar { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .links { display: flex; gap: 24px; }
            .dashboard-layout { display: flex; flex-direction: column; gap: 24px; }
            .section-top { display: grid; grid-template-columns: 1fr 1fr 0.8fr; gap: 24px; }
        `}</style>
      </main>
    );
  }

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
                background: radial-gradient(circle at center, rgba(99, 102, 241, 0.15), transparent 60%);
            }
            .landing-title {
                font-size: 5rem;
                font-weight: 800;
                background: linear-gradient(135deg, #fff 0%, #94a3b8 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-bottom: 16px;
                letter-spacing: -3px;
                filter: drop-shadow(0 0 40px rgba(99, 102, 241, 0.3));
            }
            .landing-subtitle {
                font-size: 1.8rem;
                color: #818cf8;
                margin-bottom: 24px;
                font-weight: 600;
                letter-spacing: -0.5px;
            }
            .landing-desc {
                font-size: 1.2rem;
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
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 0 20px rgba(255,255,255,0.2);
            }
            .btn-login:hover {
                transform: scale(1.05) translateY(-2px);
                box-shadow: 0 10px 40px rgba(255,255,255,0.4);
            }
        `}</style>
      </main>
    );
  }

  return (
    <main className="main">
      <nav className="navbar">
        <div className="nav-left">
          <h1 className="logo">Udriven</h1>
        </div>
        <div className="links">
          <Link href="/" className="nav-item active">Dashboard</Link>
          <Link href="/about" className="nav-item">How to Use</Link>
          <Link href="/community" className="nav-item">Community</Link>
          <Link href="/leaderboard" className="nav-item">Leaderboard</Link>
          {stats?.role === 'ADMIN' && <Link href="/admin" className="nav-item admin-link">Admin</Link>}
        </div>
        <button onClick={() => signOut()} className="btn-logout">Logout</button>
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
                <div className="card goal-card">
                  <div className="card-header">
                    <h3>⚔️ Weekly Quest</h3>
                  </div>
                  {stats.weeklyGoals && stats.weeklyGoals.length > 0 ? (
                    <div className="goal-content">
                      <p className="goal-desc">{stats.weeklyGoals[0].description}</p>
                      <div className="goal-progress">
                        <div className="progress-labels">
                          <span>Progress</span>
                          <span>{stats.weeklyGoals[0].current} / {stats.weeklyGoals[0].target}</span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${Math.min((stats.weeklyGoals[0].current / stats.weeklyGoals[0].target) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="empty-state">
                      <span className="empty-icon">💤</span>
                      <p>No active quest. Enjoy your break!</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="actions-wrapper animate-entry">
              {/* Simulation & Leave */}
              <div className="actions-grid">
                <div className="card simulation-card">
                  <div className="card-header">
                    <h3>⚡ Actions</h3>
                  </div>
                  <div className="buttons">
                    <button className="action-btn push-btn" onClick={() => simulateEvent('push')}>
                      <span>Push</span>
                      <span className="xp-tag">+10 XP</span>
                    </button>
                    <button className="action-btn pr-btn" onClick={() => simulateEvent('pull_request')}>
                      <span>PR</span>
                      <span className="xp-tag">+50 XP</span>
                    </button>
                  </div>
                </div>
                <div className="leave-wrapper">
                  <Link href="/leaves" className="btn-leave">
                    <span>💤 Go AFK</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Section: Recent Activity (Full Width) */}
          <div className="section-middle animate-entry">
            <div className="card activity-feed">
              <div className="feed-header">
                <h3>Recent Activity</h3>
                <div className="live-indicator">
                  <span className="dot"></span>
                  Live Feed
                </div>
              </div>
              <div className="feed-grid">
                {stats && stats.contributions.slice(0, 4).map((item) => (
                  <div key={item.id} className="feed-card">
                    <div className="feed-top">
                      <div className={`feed-icon-wrapper ${item.type === 'PushEvent' ? 'icon-push' : 'icon-pr'}`}>
                        {item.type === 'PushEvent' ? '🚀' : item.type === 'PullRequestEvent' ? '🔀' : '⚡'}
                      </div>
                      <span className="feed-time">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="feed-msg">{item.message}</p>
                    <div className="feed-xp-badge">+{item.xp} XP</div>
                  </div>
                ))}
                {stats && stats.contributions.length === 0 && (
                  <div className="empty-feed">
                    <span className="empty-icon">📝</span>
                    <p>No recent activity. Start coding!</p>
                  </div>
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
          max-width: 1400px;
          margin: 0 auto;
          padding-top: 100px; /* Space for sticky navbar */
        }
        
        /* Navbar Polish */
        .navbar {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          width: 95%;
          max-width: 1350px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 32px;
          background: rgba(10, 10, 10, 0.8);
          backdrop-filter: blur(16px);
          border: 1px solid var(--glass-border);
          border-radius: 100px;
          z-index: 1000;
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
        }
        .logo {
          font-size: 1.5rem;
          font-weight: 800;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -1px;
        }
        .links {
          display: flex;
          gap: 8px;
          background: rgba(255,255,255,0.03);
          padding: 6px;
          border-radius: 50px;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .nav-item {
          color: var(--text-muted);
          font-weight: 500;
          padding: 8px 20px;
          border-radius: 30px;
          transition: all 0.2s;
          font-size: 0.95rem;
        }
        .nav-item:hover {
          color: var(--foreground);
          background: rgba(255,255,255,0.05);
        }
        .nav-item.active {
          color: white;
          background: rgba(255,255,255,0.1);
          font-weight: 600;
        }
        .admin-link {
            color: #f472b6 !important;
        }
        .btn-logout {
            background: transparent;
            border: 1px solid var(--card-border);
            color: var(--text-muted);
            padding: 10px 24px;
            border-radius: 30px;
            cursor: pointer;
            font-size: 0.9rem;
            font-weight: 600;
            transition: all 0.2s;
        }
        .btn-logout:hover {
            background: rgba(255,255,255,0.05);
            color: white;
            border-color: var(--text-muted);
        }

        /* Dashboard Layout */
        .dashboard-layout {
            display: flex;
            flex-direction: column;
            gap: 24px;
        }

        /* Top Section */
        .section-top {
            display: grid;
            grid-template-columns: 1fr 1fr 0.8fr;
            gap: 24px;
            align-items: stretch;
        }
        @media (max-width: 1024px) {
            .section-top { grid-template-columns: 1fr 1fr; }
            .actions-wrapper { grid-column: span 2; }
        }
        @media (max-width: 768px) {
            .section-top { grid-template-columns: 1fr; }
            .actions-wrapper { grid-column: span 1; }
            .navbar { 
                width: 100%; top: 0; border-radius: 0; 
                padding: 16px; flex-direction: column; gap: 16px;
            }
            .main { padding-top: 140px; }
            .links { flex-wrap: wrap; justify-content: center; }
        }

        /* Generic Card Style */
        .card {
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            border-radius: 24px;
            padding: 24px;
            backdrop-filter: blur(10px);
            height: 100%;
            display: flex;
            flex-direction: column;
            transition: transform 0.2s, border-color 0.2s;
        }
        .card:hover {
            border-color: rgba(255,255,255,0.15);
        }
        .card-header h3 {
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--text-main);
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        /* Goal Card */
        .goal-content { margin-top: auto; margin-bottom: auto; }
        .goal-desc { 
            font-size: 1.1rem; color: var(--text-muted); margin-bottom: 20px; 
            line-height: 1.5;
        }
        .progress-labels {
            display: flex; justify-content: space-between; margin-bottom: 8px;
            font-size: 0.85rem; color: var(--text-dim); font-weight: 500;
        }
        .progress-bar { height: 8px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden; }
        .progress-fill { height: 100%; background: var(--success); border-radius: 4px; }

        /* Actions Card */
        .actions-grid {
            display: flex;
            flex-direction: column;
            gap: 16px;
            height: 100%;
        }
        .simulation-card { flex: 1; }
        .buttons { display: flex; gap: 12px; height: 100%; }
        .action-btn {
            flex: 1;
            background: rgba(255,255,255,0.03);
            border: 1px solid var(--card-border);
            border-radius: 16px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 4px;
            color: var(--text-main);
            font-weight: 600;
        }
        .action-btn:hover {
            background: rgba(255,255,255,0.08);
            transform: translateY(-2px);
            border-color: var(--primary);
        }
        .xp-tag {
            font-size: 0.7rem;
            color: var(--primary);
            background: rgba(99, 102, 241, 0.1);
            padding: 2px 8px;
            border-radius: 10px;
        }
        
        .leave-wrapper { flex: 0.6; }
        .btn-leave {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            background: rgba(239, 68, 68, 0.05);
            color: #fca5a5;
            border-radius: 20px;
            border: 1px solid rgba(239, 68, 68, 0.1);
            transition: all 0.2s;
            font-weight: 600;
        }
        .btn-leave:hover {
            background: rgba(239, 68, 68, 0.1);
            border-color: rgba(239, 68, 68, 0.3);
            transform: scale(1.02);
        }

        /* Activity Feed */
        .feed-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
        }
        .live-indicator {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 0.75rem;
            font-weight: 700;
            color: var(--success);
            background: rgba(16, 185, 129, 0.1);
            padding: 4px 12px;
            border-radius: 20px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .dot {
            width: 6px; height: 6px; background: var(--success); border-radius: 50%;
            animation: pulse 2s infinite;
        }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
        
        .feed-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
        }
        .feed-card {
            background: rgba(255,255,255,0.02);
            border: 1px solid var(--glass-border);
            border-radius: 16px;
            padding: 20px;
            transition: all 0.2s;
            display: flex;
            flex-direction: column;
            gap: 16px;
            position: relative;
            overflow: hidden;
        }
        .feed-card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; width: 100%; height: 2px;
            background: linear-gradient(90deg, transparent, var(--primary), transparent);
            opacity: 0; transition: opacity 0.2s;
        }
        .feed-card:hover {
            background: rgba(255,255,255,0.04);
            transform: translateY(-4px);
        }
        .feed-card:hover::before { opacity: 1; }
        
        .feed-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .feed-icon-wrapper {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.4rem;
        }
        .icon-push { background: rgba(99, 102, 241, 0.1); color: var(--primary); }
        .icon-pr { background: rgba(168, 85, 247, 0.1); color: var(--secondary); }
        
        .feed-time { font-size: 0.8rem; color: var(--text-dim); }
        .feed-msg {
            font-weight: 500;
            font-size: 1rem;
            color: var(--foreground);
            line-height: 1.5;
        }
        .feed-xp-badge {
            align-self: flex-start;
            background: rgba(255,255,255,0.05);
            color: var(--text-muted);
            padding: 4px 10px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 0.8rem;
        }
        
        /* Empty States */
        .empty-state, .empty-feed {
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            gap: 12px; color: var(--text-dim); padding: 20px; text-align: center;
        }
        .empty-icon { font-size: 2rem; opacity: 0.5; }
      `}</style>
    </main>
  );
}
