import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectsAPI, tasksAPI, usersAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { format, isPast } from 'date-fns';

const COLUMNS = [
  { key: 'todo', label: 'To Do', color: '#64748b' },
  { key: 'in-progress', label: 'In Progress', color: '#6366f1' },
  { key: 'review', label: 'In Review', color: '#f59e0b' },
  { key: 'done', label: 'Done', color: '#10b981' },
];

function TaskCard({ task, onUpdate, onDelete }) {
  const [loading, setLoading] = useState(false);

  const moveTask = async (status) => {
    setLoading(true);
    try {
      const res = await tasksAPI.update(task._id, { status });
      onUpdate(res.data.data);
    } catch { toast.error('Failed to update task'); }
    finally { setLoading(false); }
  };

  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'done';

  return (
    <div style={{ background: 'var(--bg-card)', border: `1px solid ${isOverdue ? 'var(--danger)' : 'var(--border)'}`, borderRadius: 8, padding: 14, opacity: loading ? 0.6 : 1, transition: 'all 0.15s' }}>
      <div className="flex-between" style={{ marginBottom: 8 }}>
        <span className={`badge priority-${task.priority}`}>{task.priority}</span>
        <button className="btn btn-ghost btn-icon" style={{ width: 22, height: 22, fontSize: 11, color: 'var(--danger)' }} onClick={() => onDelete(task._id)}>✕</button>
      </div>
      <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 8, lineHeight: 1.4 }}>{task.title}</p>
      {task.description && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{task.description}</p>}
      <div className="flex-between">
        <div className="flex-center gap-1">
          {task.assignee && (
            <div className="avatar avatar-sm" title={task.assignee.name} style={{ background: `hsl(${task.assignee.name.charCodeAt(0) * 7}deg 50% 45%)` }}>
              {task.assignee.name[0].toUpperCase()}
            </div>
          )}
          {task.dueDate && <span style={{ fontSize: 11, color: isOverdue ? 'var(--danger)' : 'var(--text-dim)' }}>{isOverdue ? '⚠' : '📅'} {format(new Date(task.dueDate), 'MMM d')}</span>}
        </div>
        <select value={task.status} onChange={(e) => moveTask(e.target.value)} onClick={(e) => e.stopPropagation()}
          style={{ fontSize: 11, background: 'var(--bg-tertiary)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 4px', cursor: 'pointer' }}>
          {COLUMNS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
        </select>
      </div>
    </div>
  );
}

function TaskModal({ projectId, members, onClose, onCreated }) {
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', status: 'todo', assignee: '', dueDate: '', estimatedHours: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.assignee) delete payload.assignee;
      if (!payload.dueDate) delete payload.dueDate;
      if (!payload.estimatedHours) delete payload.estimatedHours;
      const res = await projectsAPI.createTask(projectId, payload);
      toast.success('Task created!');
      onCreated(res.data.data);
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create task'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">New Task</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="input-label">Title *</label>
            <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="What needs to be done?" />
          </div>
          <div className="form-group">
            <label className="input-label">Description</label>
            <textarea className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Add details..." />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="input-label">Priority</label>
              <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                {['low', 'medium', 'high', 'critical'].map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="input-label">Status</label>
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {COLUMNS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="input-label">Assignee</label>
              <select className="input" value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })}>
                <option value="">Unassigned</option>
                {members.map((m) => <option key={m.user._id} value={m.user._id}>{m.user.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="input-label">Due Date</label>
              <input className="input" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="input-label">Estimated Hours</label>
            <input className="input" type="number" min="0" value={form.estimatedHours} onChange={(e) => setForm({ ...form, estimatedHours: e.target.value })} placeholder="0" />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create Task'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [filter, setFilter] = useState({ status: '', priority: '', search: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, tRes] = await Promise.all([
        projectsAPI.getOne(id),
        projectsAPI.getTasks(id, { limit: 200 }),
      ]);
      setProject(pRes.data.data);
      setTasks(tRes.data.data);
    } catch (e) { toast.error('Failed to load project'); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleTaskUpdate = (updated) => {
    setTasks((prev) => prev.map((t) => t._id === updated._id ? updated : t));
  };

  const handleTaskDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await tasksAPI.delete(taskId);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      toast.success('Task deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter.status && t.status !== filter.status) return false;
    if (filter.priority && t.priority !== filter.priority) return false;
    if (filter.search && !t.title.toLowerCase().includes(filter.search.toLowerCase())) return false;
    return true;
  });

  if (loading) return <div className="page-loader"><div className="spinner" style={{ width: 36, height: 36 }} /></div>;
  if (!project) return <div style={{ padding: 40 }}><p>Project not found. <Link to="/projects">← Back</Link></p></div>;

  const members = [{ user: project.owner, role: 'owner' }, ...project.members];

  return (
    <div style={{ padding: '32px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Link to="/projects" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>← Projects</Link>
        <div className="flex-between">
          <div className="flex-center gap-3">
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: project.color }} />
            <h1 style={{ fontSize: 22, fontWeight: 700 }}>{project.name}</h1>
            <span className={`badge status-${project.status}`}>{project.status}</span>
            <span className={`badge priority-${project.priority}`}>{project.priority}</span>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowTaskModal(true)}>+ Add Task</button>
        </div>
        {project.description && <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 8 }}>{project.description}</p>}
        <div className="flex gap-3" style={{ marginTop: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>👥 {members.length} member{members.length !== 1 ? 's' : ''}</span>
          {project.dueDate && <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>📅 Due {format(new Date(project.dueDate), 'MMM d, yyyy')}</span>}
          <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>📋 {tasks.length} task{tasks.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3" style={{ marginBottom: 20 }}>
        <input className="input" placeholder="Search tasks..." value={filter.search} onChange={(e) => setFilter({ ...filter, search: e.target.value })} style={{ maxWidth: 220 }} />
        <select className="input" value={filter.priority} onChange={(e) => setFilter({ ...filter, priority: e.target.value })} style={{ width: 'auto', minWidth: 130 }}>
          <option value="">All Priorities</option>
          {['low', 'medium', 'high', 'critical'].map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
        </select>
      </div>

      {/* Kanban */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, flex: 1, overflowX: 'auto' }}>
        {COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.key);
          return (
            <div key={col.key} style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 14, display: 'flex', flexDirection: 'column', minHeight: 200 }}>
              <div className="flex-between" style={{ marginBottom: 12 }}>
                <div className="flex-center gap-2">
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{col.label}</span>
                </div>
                <span style={{ fontSize: 12, background: 'var(--bg-tertiary)', color: 'var(--text-muted)', padding: '2px 7px', borderRadius: 20 }}>{colTasks.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                {colTasks.map((task) => (
                  <TaskCard key={task._id} task={task} onUpdate={handleTaskUpdate} onDelete={handleTaskDelete} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showTaskModal && (
        <TaskModal projectId={id} members={members} onClose={() => setShowTaskModal(false)} onCreated={(t) => setTasks((prev) => [t, ...prev])} />
      )}
    </div>
  );
}
