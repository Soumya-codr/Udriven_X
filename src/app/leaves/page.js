'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LeaveRequest() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        reason: '',
        startDate: '',
        endDate: ''
    });
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await fetch('/api/leaves');
            if (res.ok) {
                const data = await res.json();
                setRequests(data);
            }
        } catch (error) {
            console.error('Failed to fetch requests', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/leaves', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                alert('Leave Request Submitted!');
                setFormData({ reason: '', startDate: '', endDate: '' });
                fetchRequests();
            } else {
                alert('Failed to submit request.');
            }
        } catch (error) {
            console.error('Submit error', error);
        }
    };

    return (
        <main className="main">
            <nav className="navbar">
                <h1 className="logo">Udriven</h1>
                <div className="links">
                    <Link href="/">Dashboard</Link>
                    <Link href="/community">Community</Link>
                </div>
            </nav>

            <div className="content">
                <div className="leave-container">
                    <div className="form-card">
                        <h2>🌴 Taking a Break?</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>What's the plan?</label>
                                <textarea
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    required
                                    placeholder="Exams, Trip, Burnout, or just chilling..."
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Start Date</label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>End Date</label>
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <button type="submit" className="btn-submit">Set Status</button>
                        </form>
                    </div>

                    <div className="history-card">
                        <h3>My Leave History</h3>
                        <div className="history-list">
                            {requests.length > 0 ? (
                                requests.map(req => (
                                    <div key={req.id} className="history-item">
                                        <div className="req-info">
                                            <span className={`status ${req.status.toLowerCase()}`}>{req.status}</span>
                                            <p className="dates">
                                                {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                                            </p>
                                            <p className="reason">{req.reason}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="empty">No leave requests yet.</p>
                            )}
                        </div>
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
        .leave-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
        }
        @media (max-width: 768px) {
            .leave-container { grid-template-columns: 1fr; }
        }
        .form-card, .history-card {
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            border-radius: 16px;
            padding: 24px;
        }
        h2, h3 { margin-bottom: 20px; }
        .form-group {
            margin-bottom: 16px;
        }
        .form-row {
            display: flex;
            gap: 16px;
        }
        label {
            display: block;
            margin-bottom: 8px;
            color: var(--text-muted);
            font-size: 0.9rem;
        }
        input, textarea {
            width: 100%;
            background: rgba(255,255,255,0.05);
            border: 1px solid var(--card-border);
            padding: 10px;
            border-radius: 8px;
            color: white;
            font-family: inherit;
        }
        textarea { height: 100px; resize: vertical; }
        .btn-submit {
            width: 100%;
            background: #6366f1;
            color: white;
            border: none;
            padding: 12px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            transition: background 0.2s;
        }
        .btn-submit:hover {
            background: #4f46e5;
        }
        .history-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .history-item {
            background: rgba(255,255,255,0.05);
            border-radius: 8px;
            padding: 12px;
        }
        .status {
            font-size: 0.75rem;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status.pending { background: rgba(251, 191, 36, 0.2); color: #fbbf24; }
        .status.approved { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
        .status.rejected { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        
        .dates {
            font-size: 0.9rem;
            color: var(--text-muted);
            margin: 4px 0;
        }
        .reason {
            font-size: 0.9rem;
        }
        .empty {
            color: var(--text-muted);
            font-style: italic;
        }
      `}</style>
        </main>
    );
}
