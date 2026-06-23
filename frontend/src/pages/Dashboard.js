import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectsAPI, tasksAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { format, isPast, isToday } from 'date-fns';

function StatCard({ label, value, color, icon }) {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{icon}</div>
      <div>
        <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{value}</p>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{label}</p>
      </div>
    </div>
  );
}

function PriorityBadge({ priority }) {
  return <span className={`badge priority-${priority}`}>{priority}</span>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, tRes] = await Promise.all([
          projectsAPI.getAll({ limit: 5 }),
          tasksAPI.getMyTasks(),
        ]);
        setProjects(pRes.data.data);
        setMyTasks(tRes.data.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const taskStats = {
    todo: myTasks.filter((t) => t.status === 'todo').length,
    inProgress: myTasks.filter((t) => t.status === 'in-progress').length,
    review: myTasks.filter((t) => t.status === 'review').length,
    overdue: myTasks.filter((t) => t.dueDate && isPast(new Date(t.dueDate)) && t.status !== 'done').length,
  };

  if (loading) return <div className="page-loader"><div className="spinner" style={{ width: 36, height: 36 }} /></div>;

  return (
    <div style={{ padding: '32px', maxWidth: 1100 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)' }}>Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {user?.name?.split(' ')[0]} 👋</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        <StatCard label="To Do" value={taskStats.todo} color="#94a3b8" icon="○" />
        <StatCard label="In Progress" value={taskStats.inProgress} color="#6366f1" icon="◑" />
        <StatCard label="In Review" value={taskStats.review} color="#f59e0b" icon="◕" />
        <StatCard label="Overdue" value={taskStats.overdue} color="#ef4444" icon="⚠" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Recent Projects */}
        <div>
          <div className="flex-between" style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>Recent Projects</h2>
            <Link to="/projects" style={{ fontSize: 13, color: 'var(--primary-light)' }}>View all →</Link>
          </div>
          {projects.length === 0 ? (
            <div className="card empty-state">
              <p>No projects yet</p>
              <Link to="/projects" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>Create Project</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {projects.map((p) => (
                <Link key={p._id} to={`/projects/${p._id}`} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ padding: '14px 16px', transition: 'border-color 0.15s' }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}>
                    <div className="flex-between">
                      <div className="flex-center gap-2">
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.color || '#6366f1', flexShrink: 0 }} />
                        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{p.name}</span>
                      </div>
                      <span className={`badge status-${p.status}`}>{p.status}</span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 6 }}>
                      {p.members.length + 1} member{p.members.length !== 0 ? 's' : ''}
                      {p.dueDate && ` · Due ${format(new Date(p.dueDate), 'MMM d')}`}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* My Tasks */}
        <div>
          <div className="flex-between" style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>My Tasks</h2>
            <Link to="/tasks" style={{ fontSize: 13, color: 'var(--primary-light)' }}>View all →</Link>
          </div>
          {myTasks.length === 0 ? (
            <div className="card empty-state"><p>No tasks assigned to you</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {myTasks.slice(0, 5).map((task) => {
                const isOverdue = task.dueDate && isPast(new Date(task.dueDate));
                const isDueToday = task.dueDate && isToday(new Date(task.dueDate));
                return (
                  <div key={task._id} className="card" style={{ padding: '14px 16px' }}>
                    <div className="flex-between">
                      <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', flex: 1, marginRight: 8 }}>{task.title}</span>
                      <PriorityBadge priority={task.priority} />
                    </div>
                    <div className="flex-center gap-2" style={{ marginTop: 6 }}>
                      {task.project && (
                        <span style={{ fontSize: 11, color: 'var(--text-dim)', background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: 4 }}>{task.project.name}</span>
                      )}
                      {task.dueDate && (
                        <span style={{ fontSize: 11, color: isOverdue ? 'var(--danger)' : isDueToday ? 'var(--warning)' : 'var(--text-dim)' }}>
                          {isOverdue ? '⚠ Overdue' : isDueToday ? '⏰ Today' : format(new Date(task.dueDate), 'MMM d')}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
