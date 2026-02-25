import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import DraftEditor from './pages/DraftEditor';
import NewDraft from './pages/NewDraft';
import UploadDocument from './pages/UploadDocument';
import DocumentAnalyser from './pages/DocumentAnalyser';
import LegalChat from './components/ai/LegalChat';
import { BACKEND_BASE } from './utils/api';

// Backend health banner
function BackendBanner() {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    if (!BACKEND_BASE || BACKEND_BASE.includes('localhost')) {
      setStatus('local');
      return;
    }
    const check = async () => {
      try {
        const res = await fetch(`${BACKEND_BASE}/ping`, {
          signal: AbortSignal.timeout(8000),
        });
        setStatus(res.ok ? 'online' : 'offline');
      } catch {
        setStatus('waking');
        setTimeout(check, 16000);
      }
    };
    check();
  }, []);

  const config = {
    waking: {
      bg: '#1e3a5f',
      msg: '⏳ Backend is waking up on Replit — this takes ~15 seconds. AI features will be ready shortly.',
    },
    offline: {
      bg: '#7f1d1d',
      msg: '⚠️ Backend offline. Make sure your Replit project is running.',
    },
  };

  if (!config[status]) return null;

  const { bg, msg } = config[status];
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
      background: bg, color: '#fff',
      padding: '9px 20px',
      fontSize: 13, fontFamily: "'DM Sans', sans-serif",
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 12,
    }}>
      <span>{msg}</span>
      <button
        onClick={() => setStatus('online')}
        style={{
          flexShrink: 0,
          background: 'none', border: '1px solid rgba(255,255,255,0.4)',
          color: '#fff', borderRadius: 6, padding: '3px 12px',
          cursor: 'pointer', fontSize: 12,
        }}
      >
        Dismiss
      </button>
    </div>
  );
}

function AppShell({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f8f7f5', fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />
      {children}
    </div>
  );
}

function App() {
  return (
    <Router>
      <BackendBanner />
      <Routes>
        <Route path="/"           element={<Landing />} />
        <Route path="/dashboard"  element={<AppShell><Dashboard /></AppShell>} />
        <Route path="/draft/new"  element={<AppShell><NewDraft /></AppShell>} />
        <Route path="/upload"     element={<AppShell><UploadDocument /></AppShell>} />
        <Route path="/draft/:id"  element={<AppShell><DraftEditor /></AppShell>} />
        <Route path="/analyse"    element={<AppShell><DocumentAnalyser /></AppShell>} />
        <Route path="/login"      element={<Navigate to="/" />} />
        <Route path="/register"   element={<Navigate to="/" />} />
      </Routes>
      <LegalChat />
    </Router>
  );
}

export default App;