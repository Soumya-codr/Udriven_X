'use client';

import Link from 'next/link';

export default function AboutPage() {
    return (
        <main className="main">
            <nav className="navbar">
                <Link href="/" className="logo">Udriven</Link>
                <div className="links">
                    <Link href="/">Dashboard</Link>
                    <Link href="/community">Community</Link>
                </div>
            </nav>

            <div className="content">
                <header className="hero">
                    <h1>Master Your Workflow 🚀</h1>
                    <p className="subtitle">The ultimate gamified platform for developers. Code, collaborate, and level up.</p>
                </header>

                <section className="guide-section">
                    <div className="feature-card">
                        <div className="text-content">
                            <h2>⚔️ Weekly Quests</h2>
                            <p>
                                Every week, you'll receive a new <strong>Quest</strong> based on your role.
                                Whether it's fixing bugs, shipping features, or reviewing code, your goal is to complete it before the deadline.
                            </p>
                            <ul>
                                <li>Track progress in real-time.</li>
                                <li>Earn massive XP upon completion.</li>
                                <li>Avoid credit penalties by staying active.</li>
                            </ul>
                        </div>
                        <div className="image-content">
                            <img src="/images/how_to_quests.png" alt="Weekly Quests" />
                        </div>
                    </div>

                    <div className="feature-card reverse">
                        <div className="text-content">
                            <h2>👥 Squad & Community</h2>
                            <p>
                                You're not alone. Join the <strong>Squad</strong> in the Community Chat.
                                Share updates, ask for help, or just hang out in the Voice Lounge.
                            </p>
                            <ul>
                                <li>Real-time chat with replies and mentions.</li>
                                <li>See who's online and what they're working on.</li>
                                <li>"Friend Mode" keeps it casual and fun.</li>
                            </ul>
                        </div>
                        <div className="image-content">
                            <img src="/images/how_to_squad.png" alt="Squad & Community" />
                        </div>
                    </div>

                    <div className="feature-card">
                        <div className="text-content">
                            <h2>📈 XP & Leaderboards</h2>
                            <p>
                                Everything you do earns you <strong>XP</strong>. Commits, pull requests, and quests all contribute to your level.
                            </p>
                            <ul>
                                <li>Climb the global leaderboard.</li>
                                <li>Unlock new ranks and badges.</li>
                                <li>Visualize your streak with the Contribution Calendar.</li>
                            </ul>
                        </div>
                        <div className="image-content">
                            <img src="/images/how_to_xp.png" alt="XP & Leaderboards" />
                        </div>
                    </div>
                </section>

                <section className="cta-section">
                    <h2>Ready to start?</h2>
                    <Link href="/" className="btn-start">Go to Dashboard</Link>
                </section>
            </div>

            <style jsx>{`
        .main {
          min-height: 100vh;
          background: var(--background);
          color: var(--foreground);
          font-family: 'Inter', sans-serif;
        }
        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 48px;
          border-bottom: 1px solid var(--glass-border);
          background: rgba(0,0,0,0.2);
          backdrop-filter: blur(10px);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .logo {
          font-size: 1.5rem;
          font-weight: 800;
          background: linear-gradient(90deg, var(--primary), var(--secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-decoration: none;
        }
        .links {
          display: flex;
          gap: 32px;
        }
        .links a {
          color: var(--text-muted);
          font-weight: 500;
          transition: color 0.2s;
        }
        .links a:hover {
          color: var(--foreground);
        }

        .content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 60px 24px;
        }

        .hero {
          text-align: center;
          margin-bottom: 100px;
        }
        .hero h1 {
          font-size: 3.5rem;
          font-weight: 800;
          margin-bottom: 16px;
          background: linear-gradient(135deg, #fff, #a5b4fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .subtitle {
          font-size: 1.2rem;
          color: var(--text-muted);
          max-width: 600px;
          margin: 0 auto;
        }

        .guide-section {
          display: flex;
          flex-direction: column;
          gap: 100px;
        }

        .feature-card {
          display: flex;
          align-items: center;
          gap: 60px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 32px;
          padding: 48px;
          backdrop-filter: var(--backdrop-blur);
          transition: transform 0.3s;
        }
        .feature-card:hover {
            transform: translateY(-5px);
            box-shadow: var(--glass-shadow);
        }
        .feature-card.reverse {
          flex-direction: row-reverse;
        }

        .text-content {
          flex: 1;
        }
        .text-content h2 {
          font-size: 2rem;
          margin-bottom: 24px;
          color: var(--primary);
        }
        .text-content p {
          font-size: 1.1rem;
          line-height: 1.6;
          color: var(--text-muted);
          margin-bottom: 24px;
        }
        .text-content ul {
          list-style: none;
          padding: 0;
        }
        .text-content ul li {
          margin-bottom: 12px;
          padding-left: 24px;
          position: relative;
          color: var(--foreground);
        }
        .text-content ul li::before {
          content: '✓';
          position: absolute;
          left: 0;
          color: var(--success);
          font-weight: bold;
        }

        .image-content {
          flex: 1;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
          border: 1px solid var(--glass-border);
        }
        .image-content img {
          width: 100%;
          height: auto;
          display: block;
          transition: transform 0.5s;
        }
        .feature-card:hover .image-content img {
            transform: scale(1.05);
        }

        .cta-section {
          text-align: center;
          margin-top: 100px;
          padding: 60px;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
          border-radius: 32px;
          border: 1px solid var(--glass-border);
        }
        .cta-section h2 {
          font-size: 2.5rem;
          margin-bottom: 32px;
        }
        .btn-start {
          display: inline-block;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: white;
          padding: 16px 48px;
          border-radius: 50px;
          font-size: 1.2rem;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 10px 20px rgba(99, 102, 241, 0.4);
          transition: all 0.3s;
        }
        .btn-start:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 30px rgba(99, 102, 241, 0.6);
        }

        @media (max-width: 968px) {
          .feature-card {
            flex-direction: column;
            padding: 32px;
            gap: 32px;
          }
          .feature-card.reverse {
            flex-direction: column;
          }
          .hero h1 {
            font-size: 2.5rem;
          }
        }
      `}</style>
        </main>
    );
}
