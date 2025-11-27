'use client';

import { useState, useEffect, useRef } from 'react';
import StatsCard from '@/components/Dashboard/StatsCard';
import ContributionCalendar from '@/components/Dashboard/ContributionCalendar';
import BentoCard from '@/components/Dashboard/BentoCard';
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
          <div className="bento-grid">
            <div className="skeleton" style={{ height: '100%', borderRadius: '24px', gridArea: 'stats' }}></div>
            <div className="skeleton" style={{ height: '100%', borderRadius: '24px', gridArea: 'quest' }}></div>
            <div className="skeleton" style={{ height: '100%', borderRadius: '24px', gridArea: 'actions' }}></div>
            <div className="skeleton" style={{ height: '300px', borderRadius: '24px', gridArea: 'feed' }}></div>
          </div>
        </div>
        <style jsx>{`
            .main { padding: 24px; max-width: 1400px; margin: 0 auto; padding-top: 100px; }
            .navbar { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .links { display: flex; gap: 24px; }
            .bento-grid { 
                display: grid; 
                grid-template-columns: 1.2fr 1fr 0.8fr; 
                grid-template-areas: 
                    "stats quest actions"
                    "feed feed feed"
                    "calendar calendar calendar";
                gap: 24px; 
            }
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
        <div className="bento-grid">

          {/* Stats Area */}
          <div className="area-stats animate-entry">
            {stats && <StatsCard stats={stats} />}
          </div>

          {/* Quest Area */}
          <div className="area-quest animate-entry">
            {stats && (
              <BentoCard title="Weekly Quest" icon="⚔️" className="h-full">
                {stats.weeklyGoals && stats.weeklyGoals.length > 0 ? (
                  <div className="flex flex-col h-full justify-between">
                    <p className="text-zinc-400 text-lg font-medium mb-4">{stats.weeklyGoals[0].description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-zinc-500 font-medium">
                        <span>Progress</span>
                        <span>{stats.weeklyGoals[0].current} / {stats.weeklyGoals[0].target}</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((stats.weeklyGoals[0].current / stats.weeklyGoals[0].target) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-2">
                    <span className="text-3xl opacity-50">💤</span>
                    <p>No active quest.</p>
                  </div>
                )}
              </BentoCard>
            )}
          </div>

          {/* Actions Area */}
          <div className="area-actions animate-entry flex flex-col gap-4">
            <BentoCard title="Quick Actions" icon="⚡" className="flex-1">
              <div className="flex gap-3 h-full items-center">
                <button className="flex-1 h-full bg-white/5 hover:bg-indigo-500/20 hover:border-indigo-500/50 border border-white/10 rounded-xl flex flex-col items-center justify-center gap-1 transition-all group" onClick={() => simulateEvent('push')}>
                  <span className="text-xl group-hover:scale-110 transition-transform">🚀</span>
                  <span className="font-semibold text-sm">Push</span>
                  <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">+10 XP</span>
                </button>
                <button className="flex-1 h-full bg-white/5 hover:bg-purple-500/20 hover:border-purple-500/50 border border-white/10 rounded-xl flex flex-col items-center justify-center gap-1 transition-all group" onClick={() => simulateEvent('pull_request')}>
                  <span className="text-xl group-hover:scale-110 transition-transform">🔀</span>
                  <span className="font-semibold text-sm">PR</span>
                  <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">+50 XP</span>
                </button>
              </div>
            </BentoCard>
            <Link href="/leaves" className="block h-16">
              <div className="h-full w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-2xl flex items-center justify-center gap-2 text-red-300 font-semibold transition-all">
                <span>💤</span> Go AFK
              </div>
            </Link>
          </div>

          {/* Feed Area */}
          <div className="area-feed animate-entry">
            <BentoCard title="Recent Activity" icon="📡" className="h-full">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                {stats && stats.contributions.slice(0, 4).map((item) => (
                  <div key={item.id} className="bg-white/5 border border-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors group">
                    <div className="flex justify-between items-start mb-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${item.type === 'PushEvent' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-purple-500/20 text-purple-400'}`}>
                        {item.type === 'PushEvent' ? '🚀' : item.type === 'PullRequestEvent' ? '🔀' : '⚡'}
                      </div>
                      <span className="text-xs text-zinc-500 font-mono">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-sm font-medium text-zinc-200 line-clamp-2 mb-2 group-hover:text-white transition-colors">{item.message}</p>
                    <div className="inline-block text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">+{item.xp} XP</div>
                  </div>
                ))}
                {stats && stats.contributions.length === 0 && (
                  <div className="col-span-full text-center py-8 text-zinc-500 italic">No recent activity.</div>
                )}
              </div>
            </BentoCard>
          </div>

          {/* Calendar Area */}
          <div className="area-calendar animate-entry">
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
          padding-top: 100px;
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
          background: rgba(10, 10, 10, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 100px;
          z-index: 1000;
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.3);
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
          gap: 6px;
          background: rgba(255,255,255,0.03);
          padding: 4px;
          border-radius: 50px;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .nav-item {
          color: var(--text-muted);
          font-weight: 500;
          padding: 8px 20px;
          border-radius: 30px;
          transition: all 0.2s;
          font-size: 0.9rem;
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
        .admin-link { color: #f472b6 !important; }
        .btn-logout {
            background: transparent;
            border: 1px solid rgba(255,255,255,0.1);
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

        /* Bento Grid Layout */
        .bento-grid {
            display: grid;
            grid-template-columns: 1.2fr 1fr 0.8fr;
            grid-template-rows: auto auto auto;
            grid-template-areas: 
                "stats quest actions"
                "feed feed feed"
                "calendar calendar calendar";
            gap: 24px;
        }
        .area-stats { grid-area: stats; }
        .area-quest { grid-area: quest; }
        .area-actions { grid-area: actions; }
        .area-feed { grid-area: feed; }
        .area-calendar { grid-area: calendar; }

        @media (max-width: 1024px) {
            .bento-grid {
                grid-template-columns: 1fr 1fr;
                grid-template-areas:
                    "stats stats"
                    "quest actions"
                    "feed feed"
                    "calendar calendar";
            }
        }
        @media (max-width: 768px) {
            .bento-grid {
                grid-template-columns: 1fr;
                grid-template-areas:
                    "stats"
                    "quest"
                    "actions"
                    "feed"
                    "calendar";
            }
            .navbar { 
                width: 100%; top: 0; border-radius: 0; 
                padding: 16px; flex-direction: column; gap: 16px;
            }
            .main { padding-top: 140px; }
            .links { flex-wrap: wrap; justify-content: center; }
        }
      `}</style>
    </main>
  );
}
