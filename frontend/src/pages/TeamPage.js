import React, { useEffect, useState, useCallback } from 'react';
import { usersAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const ROLE_COLORS = { admin: '#ef4444', manager: '#f59e0b', member: '#10b981' };

export default function TeamPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await usersAPI.getAll({ search, role: roleFilter, limit: 50 });
      setUsers(res.data.data);
      setTotal(res.data.total);
    } catch { toast.error('Failed to load team'); }
    finally { setLoading(false); }
  }, [search, roleFilter]);

  useEffect(() => { load(); }, [load]);

  const toggleActive = async (userId, isActive) => {
    try {
      await usersAPI.update(userId, { isActive: !isActive });
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, isActive: !isActive } : u));
      toast.success(`User ${!isActive ? 'activated' : 'deactivated'}`);
    } catch { toast.error('Failed to update user'); }
  };

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Team</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 2 }}>{total} member{total !== 1 ? 's' : ''}</p>
      </div>

      <div className="flex gap-3" style={{ marginBottom: 24 }}>
        <input className="input" placeholder="Search members..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 280 }} />
        <select className="input" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ width: 'auto', minWidth: 130 }}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="member">Member</option>
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 36, height: 36 }} /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {users.map((u) => (
            <div key={u._id} className="card" style={{ opacity: u.isActive ? 1 : 0.55 }}>
              <div className="flex-center gap-3" style={{ marginBottom: 14 }}>
                <div className="avatar avatar-lg" style={{ background: `hsl(${u.name.charCodeAt(0) * 7}deg 50% 40%)`, fontSize: 18 }}>
                  {u.name[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div className="flex-center gap-2">
                    <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{u.name}</p>
                    {u._id === currentUser._id && <span style={{ fontSize: 10, background: 'var(--primary)', color: '#fff', padding: '1px 6px', borderRadius: 10, fontWeight: 600 }}>YOU</span>}
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</p>
                </div>
              </div>
              <div className="flex-between">
                <div className="flex gap-2">
                  <span style={{ fontSize: 11, fontWeight: 600, color: ROLE_COLORS[u.role], background: `${ROLE_COLORS[u.role]}18`, padding: '3px 8px', borderRadius: 12 }}>
                    {u.role.toUpperCase()}
                  </span>
                  <span style={{ fontSize: 11, color: u.isActive ? 'var(--success)' : 'var(--text-dim)', background: u.isActive ? 'rgba(16,185,129,0.12)' : 'var(--bg-tertiary)', padding: '3px 8px', borderRadius: 12 }}>
                    {u.isActive ? '● Active' : '● Inactive'}
                  </span>
                </div>
                {currentUser.role === 'admin' && u._id !== currentUser._id && (
                  <button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }} onClick={() => toggleActive(u._id, u.isActive)}>
                    {u.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                )}
              </div>
              {u.lastLogin && <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 10 }}>Last login: {format(new Date(u.lastLogin), 'MMM d, yyyy')}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
