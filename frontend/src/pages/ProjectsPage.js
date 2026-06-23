import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { projectsAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const STATUS_OPTIONS = ['', 'planning', 'active', 'on-hold', 'completed', 'cancelled'];
const PRIORITY_OPTIONS = ['', 'low', 'medium', 'high', 'critical'];
const COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#f97316'];

function ProjectModal({ project, onClose, onSaved }) {
  const isEdit = !!project?._id;
  const [form, setForm] = useState({
    name: project?.name || '',
    description: project?.description || '',
    status: project?.status || 'planning',
    priority: project?.priority || 'medium',
    color: project?.color || '#6366f1',
    startDate: project?.startDate ? project.startDate.slice(0, 10) : '',
    dueDate: project?.dueDate ? project.dueDate.slice(0, 10) : '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      if (isEdit) {
        res = await projectsAPI.update(project._id, form);
      } else {
        res = await projectsAPI.create(form);
      }
      toast.success(isEdit ? 'Project updated!' : 'Project created!');
      onSaved(res.data.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save project');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit Project' : 'New Project'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="input-label">Project Name *</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Website Redesign" />
          </div>
          <div className="form-group">
            <label className="input-label">Description</label>
            <textarea className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What is this project about?" rows={3} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="input-label">Status</label>
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {STATUS_OPTIONS.filter(Boolean).map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="input-label">Priority</label>
              <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                {PRIORITY_OPTIONS.filter(Boolean).map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="input-label">Start Date</label>
              <input className="input" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="input-label">Due Date</label>
              <input className="input" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="input-label">Color</label>
            <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
              {COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                  style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: form.color === c ? '3px solid white' : '3px solid transparent', cursor: 'pointer', outline: form.color === c ? `2px solid ${c}` : 'none', outlineOffset: 2 }} />
              ))}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [modal, setModal] = useState(null); // null | 'create' | project obj

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await projectsAPI.getAll({ search, status, priority });
      setProjects(data.data);
      setTotal(data.total);
    } catch (e) { toast.error('Failed to load projects'); }
    finally { setLoading(false); }
  }, [search, status, priority]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try {
      await projectsAPI.delete(id);
      toast.success('Project deleted');
      setProjects((p) => p.filter((x) => x._id !== id));
    } catch (e) { toast.error('Failed to delete'); }
  };

  const handleSaved = (saved) => {
    setProjects((prev) => {
      const idx = prev.findIndex((p) => p._id === saved._id);
      if (idx >= 0) { const next = [...prev]; next[idx] = saved; return next; }
      return [saved, ...prev];
    });
  };

  return (
    <div style={{ padding: '32px' }}>
      <div className="flex-between" style={{ marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Projects</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 2 }}>{total} project{total !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('create')}>+ New Project</button>
      </div>

      {/* Filters */}
      <div className="flex gap-3" style={{ marginBottom: 24, flexWrap: 'wrap' }}>
        <input className="input" placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 280 }} />
        <select className="input" value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: 'auto', minWidth: 140 }}>
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.filter(Boolean).map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <select className="input" value={priority} onChange={(e) => setPriority(e.target.value)} style={{ width: 'auto', minWidth: 140 }}>
          <option value="">All Priorities</option>
          {PRIORITY_OPTIONS.filter(Boolean).map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 36, height: 36 }} /></div>
      ) : projects.length === 0 ? (
        <div className="empty-state card">
          <h3>No projects found</h3>
          <p>Create a project to get started</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setModal('create')}>+ New Project</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {projects.map((p) => (
            <div key={p._id} className="card" style={{ padding: 0, overflow: 'hidden', transition: 'border-color 0.15s, transform 0.15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = p.color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}>
              <div style={{ height: 4, background: p.color }} />
              <div style={{ padding: '18px 20px' }}>
                <div className="flex-between" style={{ marginBottom: 10 }}>
                  <Link to={`/projects/${p._id}`} style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', textDecoration: 'none', flex: 1 }}>{p.name}</Link>
                  <div className="flex gap-1">
                    <button className="btn btn-ghost btn-icon" style={{ width: 28, height: 28, fontSize: 12 }} onClick={() => setModal(p)}>✎</button>
                    <button className="btn btn-ghost btn-icon" style={{ width: 28, height: 28, fontSize: 12, color: 'var(--danger)' }} onClick={() => handleDelete(p._id)}>🗑</button>
                  </div>
                </div>
                {p.description && <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.description}</p>}
                <div className="flex gap-2" style={{ marginBottom: 14 }}>
                  <span className={`badge status-${p.status}`}>{p.status}</span>
                  <span className={`badge priority-${p.priority}`}>{p.priority}</span>
                </div>
                <div className="flex-between">
                  <div className="flex" style={{ gap: -4 }}>
                    {[p.owner, ...(p.members?.map((m) => m.user) || [])].slice(0, 4).map((u, i) => (
                      <div key={u?._id || i} className="avatar avatar-sm" title={u?.name} style={{ marginLeft: i > 0 ? -6 : 0, border: '2px solid var(--bg-card)', zIndex: 4 - i, background: `hsl(${u?.name?.charCodeAt(0) * 7 || 200}deg 50% 45%)` }}>
                        {u?.name?.[0]?.toUpperCase()}
                      </div>
                    ))}
                  </div>
                  {p.dueDate && <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>Due {format(new Date(p.dueDate), 'MMM d, yyyy')}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(modal === 'create' || (modal && modal._id)) && (
        <ProjectModal project={modal === 'create' ? null : modal} onClose={() => setModal(null)} onSaved={handleSaved} />
      )}
    </div>
  );
}
