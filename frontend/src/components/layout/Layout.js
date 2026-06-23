import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const NAV = [
  { to: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { to: '/projects', icon: '◫', label: 'Projects' },
  { to: '/tasks', icon: '✓', label: 'My Tasks' },
  { to: '/team', icon: '⊕', label: 'Team' },
];

function Avatar({ user, size = 'sm' }) {
  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  const sizeMap = { sm: 32, md: 40, lg: 48 };
  const px = sizeMap[size] || 32;
  return (
    <div style={{ width: px, height: px, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: px * 0.38, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
      {user?.avatar ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : initials}
    </div>
  );
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); toast.success('Logged out'); };

  const Sidebar = () => (
    <aside style={{ width: 240, background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)', height: '100vh', display: 'flex', flexDirection: 'column', padding: '20px 12px', flexShrink: 0 }}>
      <div className="flex-center gap-2" style={{ padding: '4px 8px', marginBottom: '28px' }}>
        <div style={{ width: 32, height: 32, background: 'var(--primary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>⚡</div>
        <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px' }}>TaskFlow</span>
      </div>

      <nav style={{ flex: 1 }}>
        <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 8px', marginBottom: 8 }}>Navigation</p>
        {NAV.map((item) => (
          <NavLink key={item.to} to={item.to} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 'var(--radius-sm)',
            color: isActive ? 'var(--text)' : 'var(--text-muted)', background: isActive ? 'var(--bg-hover)' : 'transparent',
            fontSize: 14, fontWeight: isActive ? 500 : 400, transition: 'all 0.1s', marginBottom: 2, textDecoration: 'none',
            borderLeft: isActive ? '2px solid var(--primary)' : '2px solid transparent',
          })}>
            <span style={{ fontSize: 15, width: 18, textAlign: 'center' }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
        <div className="flex-between" style={{ padding: '8px 6px' }}>
          <div className="flex-center gap-2" style={{ overflow: 'hidden' }}>
            <Avatar user={user} size="sm" />
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</p>
              <p style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'capitalize' }}>{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost btn-icon" title="Logout" style={{ flexShrink: 0 }}>⏻</button>
        </div>
      </div>
    </aside>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <div style={{ display: 'none' }} className="sidebar-desktop">
        <Sidebar />
      </div>
      <div style={{ display: 'flex' }}>
        <Sidebar />
      </div>
      <main style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
        {children}
      </main>
    </div>
  );
}

export { };
