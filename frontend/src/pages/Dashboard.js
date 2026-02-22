import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';
import StatsRow from '../components/StatsRow';
import DraftsTable from '../components/DraftsTable';
import QuickDraft from '../components/QuickDraft';
import AISuggestions from '../components/AISuggestions';
import CitationBox from '../components/CitationBox';

const Dashboard = () => {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get('/drafts/').catch(() => ({ data: [] })),
      api.get('/auth/me').catch(() => ({ data: null })),
    ]).then(([draftsRes, userRes]) => {
      setDrafts(draftsRes.data || []);
      setUser(userRes.data);
    }).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this draft?')) return;
    try {
      await api.delete(`/drafts/${id}`);
      setDrafts((prev) => prev.filter((d) => d.id !== id));
    } catch {
      alert('Failed to delete draft');
    }
  };

  const now = new Date();
  const greeting =
    now.getHours() < 12 ? 'Good morning' :
    now.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  const displayName =
    user?.full_name?.split(' ')[0] || user?.username || 'Advocate';

  const dateStr = now.toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const inProgress = drafts.filter(
    (d) => d.status === 'draft' || d.status === 'review',
  ).length;

  if (loading) {
    return (
      <div style={styles.loadWrap}>
        <div style={styles.loadDot} />
        <span style={{ color: 'var(--muted)', fontSize: 14, marginLeft: 10 }}>
          Loading workspace…
        </span>
      </div>
    );
  }

  return (
    <div style={styles.app}>
      <Sidebar user={user} />

      <main style={styles.main}>
        {/* Top bar */}
        <div style={styles.topbar}>
          <div>
            <div style={styles.pageTitle}>
              {greeting}, {displayName} ⚖️
            </div>
            <div style={styles.pageSub}>
              {inProgress > 0
                ? `You have ${inProgress} draft${inProgress > 1 ? 's' : ''} in progress`
                : 'All drafts up to date'}
              {' · '}
              {dateStr}
            </div>
          </div>
          <div style={styles.topActions}>
            <button style={styles.btnGhost} onClick={() => navigate('/upload')}>
              ⊕ Upload
            </button>
            <button style={styles.btnPrimary} onClick={() => navigate('/draft/new')}>
              ✦ New Draft
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div style={styles.content}>
          <StatsRow drafts={drafts} />

          <div style={styles.grid}>
            {/* Left column */}
            <div style={styles.leftCol}>
              <DraftsTable drafts={drafts} onDelete={handleDelete} />
              <div style={{ marginTop: 18 }}>
                <CitationBox />
              </div>
            </div>

            {/* Right column */}
            <div style={styles.rightCol}>
              <QuickDraft />
              <AISuggestions />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const styles = {
  app: {
    display: 'flex',
    minHeight: '100vh',
    background: 'var(--bg-main)',
    fontFamily: 'var(--font-body)',
    color: 'var(--paper)',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    background: '#0d0d15',
  },
  topbar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 32px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    background: 'rgba(13,13,21,0.8)',
    backdropFilter: 'blur(10px)',
    flexShrink: 0,
  },
  pageTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: 22, fontWeight: 600,
    color: 'var(--paper)',
  },
  pageSub: { fontSize: 12, color: 'var(--muted)', marginTop: 1 },
  topActions: { display: 'flex', alignItems: 'center', gap: 10 },
  btnPrimary: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '8px 16px', borderRadius: 8,
    background: 'linear-gradient(135deg, var(--gold), #a87c2a)',
    color: 'var(--ink)', border: 'none',
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
    fontFamily: 'var(--font-body)',
  },
  btnGhost: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '8px 16px', borderRadius: 8,
    background: 'rgba(255,255,255,0.05)',
    color: 'var(--paper)',
    border: '1px solid rgba(255,255,255,0.08)',
    fontSize: 13, fontWeight: 500, cursor: 'pointer',
    fontFamily: 'var(--font-body)',
  },
  content: {
    padding: '28px 32px',
    overflowY: 'auto',
    flex: 1,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 340px',
    gap: 20,
  },
  leftCol: { display: 'flex', flexDirection: 'column' },
  rightCol: { display: 'flex', flexDirection: 'column', gap: 18 },
  loadWrap: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '100vh', background: '#0d0d15',
  },
  loadDot: {
    width: 8, height: 8, borderRadius: '50%',
    background: 'var(--gold)',
    animation: 'lm-pulse 1.2s infinite',
  },
};

export default Dashboard;
