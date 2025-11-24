'use client';

import ChatRoom from '@/components/Community/ChatRoom';
import Link from 'next/link';

export default function CommunityPage() {
  return (
    <main className="main">
      <nav className="navbar">
        <h1 className="logo">Udriven</h1>
        <div className="links">
          <Link href="/">Dashboard</Link>
          <Link href="/community" className="active">Community</Link>
        </div>
      </nav>

      <div className="content">
        <div className="header-section">
          <h2>Community Hub</h2>
          <p>Connect with other developers, discuss features, and hang out in voice channels.</p>
        </div>

        <ChatRoom />
      </div>

      <style jsx>{`
        .main {
          min-height: 100vh;
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
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
        .header-section {
          margin-bottom: 32px;
          text-align: center;
        }
        .header-section h2 {
          font-size: 2rem;
          margin-bottom: 8px;
        }
        .header-section p {
          color: var(--text-muted);
        }
      `}</style>
    </main>
  );
}
