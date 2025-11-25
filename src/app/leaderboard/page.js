'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Leaderboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await fetch('/api/leaderboard');
                const data = await res.json();
                setUsers(data);
            } catch (error) {
                console.error('Failed to fetch leaderboard', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    if (loading) return <div className="loading">Loading Leaderboard...</div>;

    return (
        <main className="main">
            <nav className="navbar">
                <h1 className="logo">Udriven</h1>
                <div className="links">
                    <Link href="/">Dashboard</Link>
                    <Link href="/community">Community</Link>
                    <Link href="/leaderboard" className="active">Leaderboard</Link>
                </div>
            </nav>

            <div className="content">
                <h2 className="page-title">🏆 Top Contributors</h2>

                <div className="leaderboard-card">
                    <div className="table-header">
                        <span className="rank">#</span>
                        <span className="user">User</span>
                        <span className="stats">Level</span>
                        <span className="stats">XP</span>
                        <span className="stats">Contribs</span>
                    </div>

                    <div className="table-body">
                        {users.map((user) => (
                            <div key={user.id} className={`table-row rank-${user.rank}`}>
                                <span className="rank">
                                    {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : user.rank}
                                </span>
                                <div className="user-info">
                                    <div className="avatar-placeholder">{user.name ? user.name[0] : '?'}</div>
                                    <span className="name">{user.name || 'Anonymous'}</span>
                                </div>
                                <span className="stats level">Lvl {user.level}</span>
                                <span className="stats xp">{user.xp.toLocaleString()} XP</span>
                                <span className="stats contribs">{user.contributions}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
        .main {
          min-height: 100vh;
          padding: 24px;
          max-width: 1000px;
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
        .page-title {
            text-align: center;
            margin-bottom: 32px;
            font-size: 2rem;
            background: linear-gradient(90deg, #fbbf24, #f59e0b);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .leaderboard-card {
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }
        .table-header {
            display: grid;
            grid-template-columns: 60px 1fr 100px 120px 100px;
            padding: 16px 24px;
            background: rgba(255,255,255,0.05);
            font-weight: bold;
            color: var(--text-muted);
            font-size: 0.9rem;
        }
        .table-row {
            display: grid;
            grid-template-columns: 60px 1fr 100px 120px 100px;
            padding: 16px 24px;
            align-items: center;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            transition: background 0.2s;
        }
        .table-row:last-child {
            border-bottom: none;
        }
        .table-row:hover {
            background: rgba(255,255,255,0.02);
        }
        .rank {
            font-weight: bold;
            font-size: 1.1rem;
        }
        .rank-1 .rank { font-size: 1.5rem; }
        .rank-2 .rank { font-size: 1.4rem; }
        .rank-3 .rank { font-size: 1.3rem; }
        
        .user-info {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .avatar-placeholder {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 0.9rem;
        }
        .name {
            font-weight: 500;
        }
        .stats {
            font-size: 0.9rem;
        }
        .xp {
            color: var(--primary);
            font-weight: bold;
        }
        .contribs {
            color: var(--text-muted);
        }
        
        @media (max-width: 640px) {
            .table-header, .table-row {
                grid-template-columns: 40px 1fr 80px;
            }
            .stats.level, .stats.contribs {
                display: none;
            }
        }
      `}</style>
        </main>
    );
}
