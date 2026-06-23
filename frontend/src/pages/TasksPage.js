import React, { useEffect, useState, useCallback } from 'react';
import { tasksAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { format, isPast, isToday } from 'date-fns';

const STATUS_MAP = { 'todo': 'To Do', 'in-progress': 'In Progress', 'review': 'Review', 'done': 'Done' };

function StatusBadge({ status }) {
  return <span className={`badge status-${status}`}>{STATUS_MAP[status] || status}</span>;
}

function PriorityBadge({ priority }) {
  return <span className={`badge priority-${priority}`}>{priority}</span>;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', priority: '', search: '', sortBy: 'dueDate', order: 'asc' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await tasksAPI.getAll({ ...filters, limit: 100 });
      setTasks(res.data.data);
      setTotal(res.data.total);
    } catch { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, status) => {
    try {
      const res = await tasksAPI.update(id, { status });
      setTasks((prev) => prev.map((t) => t._id === id ? res.data.data : t));
    } catch { toast.error('Update failed'); }
  };

  const deleteTask = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await tasksAPI.delete(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      toast.success('Task deleted');
    } catch { toast.error('Delete failed'); }
  };

  const setFilter = (key, val) => setFilters((f) => ({ ...f, [key]: val }));

  return (
    <div style={{ padding: '32px' }}>
      <div className="flex-between" style={{ marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>My Tasks</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 2 }}>{total} task{total !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3" style={{ marginBottom: 24, flexWrap: 'wrap' }}>
        <input className="input" placeholder="Search tasks..." value={filters.search} onChange={(e) => setFilter('search', e.target.value)} style={{ maxWidth: 240 }} />
        <select className="input" value={filters.status} onChange={(e) => setFilter('status', e.target.value)} style={{ width: 'auto', minWidth: 140 }}>
          <option value="">All Statuses</option>
          {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select className="input" value={filters.priority} onChange={(e) => setFilter('priority', e.target.value)} style={{ width: 'auto', minWidth: 140 }}>
          <option value="">All Priorities</option>
          {['low', 'medium', 'high', 'critical'].map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
        </select>
        <select className="input" value={`${filters.sortBy}:${filters.order}`} onChange={(e) => { const [s, o] = e.target.value.split(':'); setFilters((f) => ({ ...f, sortBy: s, order: o })); }} style={{ width: 'auto', minWidth: 160 }}>
          <option value="dueDate:asc">Due Date (Earliest)</option>
          <option value="dueDate:desc">Due Date (Latest)</option>
          <option value="priority:desc">Priority (High first)</option>
          <option value="createdAt:desc">Newest First</option>
          <option value="title:asc">Title A-Z</option>
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 36, height: 36 }} /></div>
      ) : tasks.length === 0 ? (
        <div className="empty-state card"><h3>No tasks found</h3><p>Tasks assigned to you across all projects will appear here</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tasks.map((task) => {
            const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'done';
            const isDueToday = task.dueDate && isToday(new Date(task.dueDate));
            return (
              <div key={task._id} className="card" style={{ padding: '14px 20px', borderLeft: `3px solid ${isOverdue ? 'var(--danger)' : task.status === 'done' ? 'var(--success)' : 'var(--border)'}` }}>
                <div className="flex-between" style={{ flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div className="flex-center gap-2" style={{ marginBottom: 6 }}>
                      <p style={{ fontSize: 15, fontWeight: 500, color: task.status === 'done' ? 'var(--text-muted)' : 'var(--text)', textDecoration: task.status === 'done' ? 'line-through' : 'none' }}>{task.title}</p>
                    </div>
                    <div className="flex-center gap-2">
                      {task.project && <span style={{ fontSize: 11, color: 'var(--text-dim)', background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: 4 }}>📁 {task.project.name}</span>}
                      {task.assignee && <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>👤 {task.assignee.name}</span>}
                      {task.dueDate && (
                        <span style={{ fontSize: 11, color: isOverdue ? 'var(--danger)' : isDueToday ? 'var(--warning)' : 'var(--text-dim)', fontWeight: isOverdue || isDueToday ? 600 : 400 }}>
                          {isOverdue ? '⚠ Overdue · ' : isDueToday ? '⏰ Today · ' : '📅 '}{format(new Date(task.dueDate), 'MMM d, yyyy')}
                        </span>
                      )}
                      {task.estimatedHours && <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>⏱ {task.estimatedHours}h</span>}
                    </div>
                  </div>
                  <div className="flex-center gap-2">
                    <PriorityBadge priority={task.priority} />
                    <select value={task.status} onChange={(e) => updateStatus(task._id, e.target.value)}
                      className={`badge status-${task.status}`} style={{ border: 'none', cursor: 'pointer', appearance: 'auto', background: 'none', fontFamily: 'inherit' }}>
                      {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                    <button className="btn btn-ghost btn-icon" style={{ width: 28, height: 28, fontSize: 12, color: 'var(--danger)' }} onClick={() => deleteTask(task._id)}>🗑</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
