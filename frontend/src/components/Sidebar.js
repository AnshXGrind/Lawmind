import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NAV = [
  {
    label: 'Workspace',
    items: [
      { icon: '⊞', text: 'Dashboard', path: '/dashboard' },
      { icon: '✦', text: 'New Draft', path: '/draft/new', badge: 'AI' },
      { icon: '◫', text: 'My Drafts', path: '/dashboard' },
      { icon: '⊕', text: 'Upload Docs', path: '/upload' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { icon: '⊛', text: 'Citations', path: '/citations' },
      { icon: '◈', text: 'Legal Research', path: '/research' },
      { icon: '⟳', text: 'Draft History', path: '/history' },
    ],
  },
  {
    label: 'Account',
    items: [
      { icon: '◉', text: 'Settings', path: '/settings' },
      { icon: '◌', text: 'API Keys', path: '/api-keys' },
    ],
  },
];

const Sidebar = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const displayName = user?.full_name || user?.username || 'User';
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside style={styles.sidebar}>
      {/* Glow overlay */}
      <div style={styles.glowOverlay} />

      {/* Logo */}
      <div style={styles.logoArea}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>⚖️</div>
          <div>
            <span style={styles.logoText}>LawMind</span>
            <span style={styles.logoBadge}>AI</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={styles.nav}>
        {NAV.map((section) => (
          <div key={section.label} style={styles.navSection}>
            <div style={styles.navLabel}>{section.label}</div>
            {section.items.map((item) => {
              const active = location.pathname === item.path;
              return (
                <div
                  key={item.text}
                  style={{
                    ...styles.navItem,
                    ...(active ? styles.navItemActive : {}),
                  }}
                  onClick={() => navigate(item.path)}
                >
                  {active && <div style={styles.activeBar} />}
                  <span style={styles.navIcon}>{item.icon}</span>
                  <span>{item.text}</span>
                  {item.badge && <span style={styles.navBadge}>{item.badge}</span>}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User card */}
      <div style={styles.footer}>
        <div style={styles.userCard}>
          <div style={styles.avatar}>{initials}</div>
          <div style={styles.userInfo}>
            <div style={styles.userName}>{displayName}</div>
            <div style={styles.userRole}>Senior Advocate</div>
          </div>
          <span style={{ color: 'var(--muted)', fontSize: 12 }}>⋯</span>
        </div>
      </div>
    </aside>
  );
};

const styles = {
  sidebar: {
    background: 'var(--bg-sidebar)',
    borderRight: '1px solid var(--border-gold)',
    display: 'flex',
    flexDirection: 'column',
    width: 260,
    minHeight: '100vh',
    position: 'relative',
    overflow: 'hidden',
    flexShrink: 0,
  },
  glowOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 300,
    background: 'radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  logoArea: {
    padding: '28px 24px 24px',
    borderBottom: '1px solid var(--border-gold)',
    position: 'relative',
  },
  logo: { display: 'flex', alignItems: 'center', gap: 10 },
  logoIcon: {
    width: 36, height: 36,
    background: 'linear-gradient(135deg, var(--gold), var(--crimson))',
    borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 18,
  },
  logoText: {
    fontFamily: 'var(--font-heading)',
    fontSize: 20,
    fontWeight: 700,
    color: 'var(--paper)',
    letterSpacing: '0.01em',
  },
  logoBadge: {
    fontSize: 9,
    background: 'var(--gold)',
    color: 'var(--ink)',
    padding: '2px 6px',
    borderRadius: 20,
    fontWeight: 600,
    letterSpacing: '0.05em',
    marginLeft: 4,
    verticalAlign: 'middle',
  },
  nav: { padding: '20px 12px', flex: 1, position: 'relative' },
  navSection: { marginBottom: 28 },
  navLabel: {
    fontSize: 9,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--muted)',
    padding: '0 12px',
    marginBottom: 8,
    fontWeight: 600,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '9px 12px',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontSize: 13.5,
    fontWeight: 400,
    color: 'rgba(245,240,232,0.55)',
    position: 'relative',
    userSelect: 'none',
  },
  navItemActive: {
    background: 'rgba(201,168,76,0.10)',
    color: 'var(--gold-light)',
    fontWeight: 500,
  },
  activeBar: {
    position: 'absolute',
    left: 0, top: '50%',
    transform: 'translateY(-50%)',
    width: 3, height: 18,
    background: 'var(--gold)',
    borderRadius: '0 2px 2px 0',
  },
  navIcon: { fontSize: 15, width: 18, textAlign: 'center' },
  navBadge: {
    marginLeft: 'auto',
    background: 'var(--crimson)',
    color: 'white',
    fontSize: 10,
    padding: '1px 6px',
    borderRadius: 20,
    fontWeight: 600,
  },
  footer: {
    padding: '16px 12px',
    borderTop: '1px solid var(--border-gold)',
    position: 'relative',
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 8,
    cursor: 'pointer',
  },
  avatar: {
    width: 32, height: 32,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--gold), var(--crimson))',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 600, color: 'white',
    flexShrink: 0,
  },
  userInfo: { flex: 1, minWidth: 0 },
  userName: { fontSize: 13, fontWeight: 500, color: 'var(--paper)' },
  userRole: { fontSize: 11, color: 'var(--muted)' },
};

export default Sidebar;
