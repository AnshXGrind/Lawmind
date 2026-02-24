import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => (
  <nav style={N.nav}>
    <div style={N.inner}>
      {/* Logo */}
      <Link to="/dashboard" style={N.logoLink}>
        <span style={N.logoMark}>⚖</span>
        <span style={N.logoText}>LawMind</span>
      </Link>

      {/* Actions */}
      <div style={N.actions}>
        <Link to="/analyse" style={N.ghostLink}>Analyse Doc</Link>
        <Link to="/upload" style={N.ghostLink}>Upload</Link>
        <Link to="/draft/new" style={N.primaryLink}>+ New Draft</Link>
      </div>
    </div>
  </nav>
);

const N = {
  nav: {
    background: '#fff',
    borderBottom: '1px solid #e8e8e4',
    position: 'sticky',
    top: 0,
    zIndex: 50,
    fontFamily: "'DM Sans', sans-serif",
  },
  inner: {
    maxWidth: 1280,
    margin: '0 auto',
    padding: '0 32px',
    height: 56,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    textDecoration: 'none',
  },
  logoMark: { fontSize: 18, color: '#111' },
  logoText: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 17,
    fontWeight: 400,
    color: '#111',
    letterSpacing: '0.01em',
  },
  actions: { display: 'flex', alignItems: 'center', gap: 6 },
  ghostLink: {
    padding: '6px 14px',
    borderRadius: 100,
    border: '1px solid #e0dfdb',
    color: '#666',
    fontSize: 13,
    textDecoration: 'none',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'border-color 0.15s',
  },
  primaryLink: {
    padding: '7px 16px',
    borderRadius: 100,
    background: '#111',
    color: '#fff',
    fontSize: 13,
    fontWeight: 500,
    textDecoration: 'none',
    fontFamily: "'DM Sans', sans-serif",
  },
};

export default Navbar;
