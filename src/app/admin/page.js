'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    }

    if (session?.user?.role === 'ADMIN') {
      fetchAdminData();
      fetchLeaves();
    }
  }, [session, status, router]);

  const fetchAdminData = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch admin data', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaves = async () => {
    try {
      const res = await fetch('/api/admin/leaves');
      if (res.ok) {
        const data = await res.json();
        setLeaves(data);
      }
    } catch (error) {
      console.error('Failed to fetch leaves', error);
    }
  };

  const assignGoal = async (userId) => {
    const description = prompt("Enter Goal Description (e.g., 'Fix 5 Bugs'):");
    const target = prompt("Enter Target Count (e.g., 5):");

    if (description && target) {
      await fetch('/api/admin/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, description, target }),
      });
      alert('Goal Assigned!');
      fetchAdminData(); // Refresh to see updated status
    }
  };

  const handleLeaveAction = async (id, status) => {
    if (!confirm(`Are you sure you want to ${status} this request?`)) return;

    try {
      const res = await fetch('/api/admin/leaves', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });

      if (res.ok) {
        fetchLeaves(); // Refresh list
      }
    } catch (error) {
      console.error('Failed to update leave', error);
    }
  };

  if (status === 'loading' || loading) {
    return <div className="loading">Loading Admin Panel...</div>;
  }

  return (
    <div className="admin-container">
      <div className="sidebar">
        <h2>Admin Panel</h2>
        <nav>
          <button
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => setActiveTab('users')}
          >
            👥 Squad & Quests
          </button>
          <button
            className={activeTab === 'leaves' ? 'active' : ''}
            onClick={() => setActiveTab('leaves')}
          >
            💤 AFK Updates
          </button>
        </nav>
      </div>

      <div className="content">
        <header>
          <h1>Dashboard Overview</h1>
          <div className="admin-profile">
            <span>{session?.user?.name} (Admin)</span>
          </div>
        </header>

        {activeTab === 'users' && (
          <div className="card-grid">
            {users.map(user => (
              <div key={user.id} className="user-card">
                <div className="user-header">
                  <h3>{user.name}</h3>
                  <span className={`role-badge ${user.role.toLowerCase()}`}>{user.role}</span>
                </div>
                <div className="stats">
                  <div className="stat">
                    <label>XP</label>
                    <span>{user.xp}</span>
                  </div>
                  <div className="stat">
                    <label>Credits</label>
                    <span className={user.credits < 50 ? 'danger' : 'success'}>{user.credits}</span>
                  </div>
                </div>

                {user.weeklyGoals && user.weeklyGoals.length > 0 ? (
                  <div className="current-goal">
                    <p>⚔️ {user.weeklyGoals[0].description}</p>
                    <small>Progress: {user.weeklyGoals[0].current} / {user.weeklyGoals[0].target}</small>
                  </div>
                ) : (
                  <div className="actions">
                    <button className="btn-primary" onClick={() => assignGoal(user.id)}>Send Quest</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'leaves' && (
          <div className="leaves-list">
            {leaves.length === 0 ? (
              <p className="empty-state">No active AFK statuses.</p>
            ) : (
              leaves.map(leave => (
                <div key={leave.id} className={`leave-card ${leave.status.toLowerCase()}`}>
                  <div className="leave-header">
                    <h3>{leave.user.name}</h3>
                    <span className={`status-badge ${leave.status.toLowerCase()}`}>{leave.status}</span>
                  </div>
                  <p className="leave-reason">"{leave.reason}"</p>
                  <p className="leave-dates">
                    {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                  </p>

                  {leave.status === 'PENDING' && (
                    <div className="leave-actions">
                      <button className="btn-approve" onClick={() => handleLeaveAction(leave.id, 'APPROVED')}>Acknowledge</button>
                      <button className="btn-reject" onClick={() => handleLeaveAction(leave.id, 'REJECTED')}>Dismiss</button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .admin-container {
          display: flex;
          min-height: 100vh;
          background: transparent; /* Uses body background */
          color: var(--foreground);
          font-family: 'Inter', sans-serif;
        }
        .sidebar {
          width: 280px;
          background: rgba(0, 0, 0, 0.3);
          backdrop-filter: var(--backdrop-blur);
          border-right: 1px solid var(--glass-border);
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
        }
        .sidebar h2 {
          margin-bottom: 48px;
          font-size: 1.75rem;
          font-weight: 800;
          letter-spacing: -1px;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .sidebar nav button {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          text-align: left;
          padding: 16px 20px;
          margin-bottom: 8px;
          background: transparent;
          border: 1px solid transparent;
          color: var(--text-muted);
          cursor: pointer;
          border-radius: 16px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-size: 1rem;
          font-weight: 500;
        }
        .sidebar nav button:hover {
          background: var(--card-hover);
          color: var(--foreground);
          transform: translateX(4px);
        }
        .sidebar nav button.active {
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid var(--primary);
          color: white;
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.15);
        }
        .content {
          flex: 1;
          padding: 48px;
          overflow-y: auto;
        }
        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 48px;
        }
        header h1 {
            font-size: 2rem;
            font-weight: 700;
            letter-spacing: -0.5px;
        }
        .admin-profile {
            background: var(--glass-bg);
            padding: 8px 16px;
            border-radius: 50px;
            border: 1px solid var(--glass-border);
            font-size: 0.9rem;
            color: var(--text-muted);
        }
        .card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 24px;
        }
        .user-card {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 24px;
          padding: 28px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .user-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, rgba(255,255,255,0.03), transparent);
            pointer-events: none;
        }
        .user-card:hover {
          transform: translateY(-5px) scale(1.01);
          border-color: rgba(99, 102, 241, 0.3);
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.5);
        }
        .user-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .user-header h3 {
            font-size: 1.2rem;
            font-weight: 600;
        }
        .role-badge {
          font-size: 0.7rem;
          padding: 6px 12px;
          border-radius: 50px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .role-badge.admin {
          background: rgba(236, 72, 153, 0.15);
          color: #f472b6;
          border: 1px solid rgba(236, 72, 153, 0.2);
        }
        .role-badge.user {
          background: rgba(99, 102, 241, 0.15);
          color: #818cf8;
          border: 1px solid rgba(99, 102, 241, 0.2);
        }
        .stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 24px;
          background: rgba(0,0,0,0.2);
          padding: 16px;
          border-radius: 16px;
        }
        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .stat label {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 4px;
        }
        .stat span {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
        }
        .stat span.danger { color: var(--error); }
        .stat span.success { color: var(--success); }
        
        .actions {
          display: flex;
          gap: 12px;
        }
        button.btn-primary {
          flex: 1;
          background: linear-gradient(135deg, var(--primary), #8b5cf6);
          color: white;
          border: none;
          padding: 12px;
          border-radius: 14px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }
        button.btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
        }
        
        .leaves-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        .leave-card {
            background: var(--glass-bg);
            border: 1px solid var(--glass-border);
            border-radius: 20px;
            padding: 24px;
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 24px;
            align-items: center;
            backdrop-filter: var(--backdrop-blur);
        }
        .leave-info h3 {
            font-size: 1.1rem;
            margin-bottom: 8px;
        }
        .leave-reason {
            color: var(--text-muted);
            font-style: italic;
            margin-bottom: 12px;
        }
        .leave-dates {
            display: inline-block;
            background: rgba(255,255,255,0.05);
            padding: 6px 12px;
            border-radius: 8px;
            font-size: 0.85rem;
            color: var(--foreground);
        }
        .status-badge {
            padding: 6px 16px;
            border-radius: 50px;
            font-size: 0.8rem;
            font-weight: 700;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }
        .status-badge.pending { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.2); }
        .status-badge.approved { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.2); }
        .status-badge.rejected { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.2); }
        
        .leave-actions {
            display: flex;
            gap: 12px;
        }
        .btn-approve {
            background: rgba(16, 185, 129, 0.1);
            color: #34d399;
            border: 1px solid rgba(16, 185, 129, 0.2);
            padding: 10px 24px;
            border-radius: 12px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.2s;
        }
        .btn-approve:hover {
            background: rgba(16, 185, 129, 0.2);
            transform: translateY(-2px);
        }
        .btn-reject {
            background: rgba(239, 68, 68, 0.1);
            color: #f87171;
            border: 1px solid rgba(239, 68, 68, 0.2);
            padding: 10px 24px;
            border-radius: 12px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.2s;
        }
        .btn-reject:hover {
            background: rgba(239, 68, 68, 0.2);
            transform: translateY(-2px);
        }
        
        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          color: var(--text-muted);
          font-size: 1.2rem;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
        .empty-state {
            text-align: center;
            padding: 60px;
            color: var(--text-muted);
            background: var(--glass-bg);
            border-radius: 24px;
            border: 1px dashed var(--glass-border);
        }
      `}</style>
    </div>
  );
}
