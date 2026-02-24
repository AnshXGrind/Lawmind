import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const NAV = [
  {
    label: "Workspace",
    items: [
      { icon: "?", text: "Dashboard",    path: "/dashboard" },
      { icon: "+", text: "New Draft",     path: "/draft/new" },
      { icon: "?", text: "My Drafts",    path: "/dashboard" },
      { icon: "?", text: "Upload Docs",  path: "/upload" },
      { icon: "?", text: "Analyse Doc",  path: "/analyse" },
    ],
  },
  {
    label: "Tools",
    items: [
      { icon: '"', text: "Citations",      path: null, soon: true },
      { icon: "◊", text: "Legal Research", path: null, soon: true },
    ],
  },
];

const Sidebar = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const displayName = user?.full_name || user?.username || "Advocate";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside style={S.sidebar}>
      {/* Logo */}
      <div style={S.logoArea}>
        <div style={S.logo}>
          <span style={S.logoMark}>?</span>
          <span style={S.logoText}>LawMind</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={S.nav}>
        {NAV.map((section) => (
          <div key={section.label} style={S.section}>
            <div style={S.sectionLabel}>{section.label}</div>
            {section.items.map((item) => {
              const active = location.pathname === item.path;
              return (
                <div
                  key={item.text}
                  style={{
                    ...S.item,
                    ...(active ? S.itemActive : {}),
                    ...(item.soon ? S.itemSoon : {}),
                  }}
                  onClick={() => item.path && navigate(item.path)}
                >
                  {active && <span style={S.activeLine} />}
                  <span style={S.itemIcon}>{item.icon}</span>
                  <span style={S.itemText}>{item.text}</span>
                  {item.soon && <span style={S.soonBadge}>Soon</span>}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User */}
      <div style={S.footer}>
        <div style={S.avatar}>{initials}</div>
        <div style={S.userInfo}>
          <div style={S.userName}>{displayName}</div>
          <div style={S.userRole}>Advocate</div>
        </div>
      </div>
    </aside>
  );
};

const S = {
  sidebar: {
    width: 240,
    minHeight: "100vh",
    background: "#fff",
    borderRight: "1px solid #e8e8e4",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    fontFamily: "'DM Sans', sans-serif",
  },
  logoArea: {
    padding: "28px 24px 22px",
    borderBottom: "1px solid #f0efec",
  },
  logo: { display: "flex", alignItems: "center", gap: 8 },
  logoMark: { fontSize: 20, color: "#111", lineHeight: 1 },
  logoText: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 18,
    fontWeight: 400,
    color: "#111",
    letterSpacing: "0.01em",
  },
  nav: { padding: "20px 12px", flex: 1 },
  section: { marginBottom: 32 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#bbb",
    padding: "0 12px",
    marginBottom: 6,
  },
  item: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    padding: "8px 12px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 13.5,
    color: "#777",
    position: "relative",
    userSelect: "none",
    transition: "color 0.15s, background 0.15s",
    marginBottom: 1,
  },
  itemActive: {
    color: "#111",
    background: "#f4f3f0",
  },
  activeLine: {
    position: "absolute",
    left: 0,
    top: "50%",
    transform: "translateY(-50%)",
    width: 3,
    height: 16,
    background: "#111",
    borderRadius: "0 2px 2px 0",
  },
  itemIcon: { fontSize: 14, width: 16, textAlign: "center", color: "#bbb" },
  itemText: { fontWeight: 400 },
  itemSoon: { cursor: 'default', opacity: 0.5 },
  soonBadge: {
    marginLeft: 'auto',
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: '#aaa',
    background: '#f0efec',
    padding: '2px 6px',
    borderRadius: 100,
  },
  footer: {
    padding: "16px 20px",
    borderTop: "1px solid #f0efec",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: "50%",
    background: "#111",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 600,
    flexShrink: 0,
  },
  userInfo: { flex: 1, minWidth: 0 },
  userName: { fontSize: 13, fontWeight: 500, color: "#111" },
  userRole: { fontSize: 11, color: "#aaa" },
};

export default Sidebar;
