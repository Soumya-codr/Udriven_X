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
            👥 Users & Goals
          </button>
          <button
            className={activeTab === 'leaves' ? 'active' : ''}
            onClick={() => setActiveTab('leaves')}
          >
            📅 Leave Requests
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
                    <p>🎯 {user.weeklyGoals[0].description}</p>
                    <small>Progress: {user.weeklyGoals[0].current} / {user.weeklyGoals[0].target}</small>
                  </div>
                ) : (
                  <div className="actions">
                    <button className="btn-primary" onClick={() => assignGoal(user.id)}>Assign Goal</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'leaves' && (
          <div className="leaves-list">
            {leaves.length === 0 ? (
              <p className="empty-state">No pending leave requests.</p>
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
                      <button className="btn-approve" onClick={() => handleLeaveAction(leave.id, 'APPROVED')}>Approve</button>
                      <button className="btn-reject" onClick={() => handleLeaveAction(leave.id, 'REJECTED')}>Reject</button>
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
          background: #0f172a;
          color: white;
          font-family: 'Inter', sans-serif;
        }
        .sidebar {
          width: 260px;
          background: rgba(30, 41, 59, 0.5);
          backdrop-filter: blur(10px);
          border-right: 1px solid rgba(255,255,255,0.1);
          padding: 24px;
        }
        .sidebar h2 {
          margin-bottom: 40px;
          font-size: 1.5rem;
          background: linear-gradient(90deg, #6366f1, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .sidebar nav button {
          display: block;
          width: 100%;
          text-align: left;
          padding: 12px 16px;
          margin-bottom: 8px;
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s;
          font-size: 1rem;
        }
        .sidebar nav button:hover, .sidebar nav button.active {
          background: rgba(99, 102, 241, 0.1);
          color: #fff;
        }
        .sidebar nav button.active {
          border-left: 3px solid #6366f1;
        }
        .content {
          flex: 1;
          padding: 40px;
        }
        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
        }
        .card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
        }
        .user-card {
          background: rgba(30, 41, 59, 0.4);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 16px;
          padding: 24px;
          transition: transform 0.2s;
        }
        .user-card:hover {
          transform: translateY(-5px);
          border-color: rgba(99, 102, 241, 0.3);
        }
        .user-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .role-badge {
          font-size: 0.75rem;
          padding: 4px 8px;
          border-radius: 12px;
          font-weight: bold;
        }
        .role-badge.admin {
          background: rgba(239, 68, 68, 0.2);
          color: #fca5a5;
        }
        .role-badge.user {
          background: rgba(99, 102, 241, 0.2);
          color: #a5b4fc;
        }
        .stats {
          display: flex;
          gap: 24px;
          margin-bottom: 24px;
        }
        .stat {
          display: flex;
          flex-direction: column;
        }
        .stat label {
          font-size: 0.8rem;
          color: #94a3b8;
        }
        .stat span {
          font-size: 1.2rem;
          font-weight: bold;
        }
        .stat span.danger { color: #ef4444; }
        .stat span.success { color: #22c55e; }
        
        .actions {
          display: flex;
          gap: 12px;
        }
        button.btn-primary {
          flex: 1;
          background: #6366f1;
          color: white;
          border: none;
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
        }
        .leaves-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        .leave-card {
            background: rgba(30, 41, 59, 0.4);
            border: 1px solid rgba(255,255,255,0.05);
            border-radius: 16px;
            padding: 24px;
        }
        .leave-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
        }
        .status-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: bold;
        }
        .status-badge.pending { background: rgba(234, 179, 8, 0.2); color: #fde047; }
        .status-badge.approved { background: rgba(34, 197, 94, 0.2); color: #86efac; }
        .status-badge.rejected { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }
        
        .leave-reason {
            font-style: italic;
            color: #cbd5e1;
            margin-bottom: 8px;
        }
        .leave-dates {
            color: #94a3b8;
            font-size: 0.9rem;
            margin-bottom: 16px;
        }
        .leave-actions {
            display: flex;
            gap: 12px;
        }
        .btn-approve {
            background: #22c55e;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 8px;
            cursor: pointer;
        }
        .btn-reject {
            background: #ef4444;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 8px;
            cursor: pointer;
        }
        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          color: #94a3b8;
        }
      `}</style>
    </div>
  );
}
