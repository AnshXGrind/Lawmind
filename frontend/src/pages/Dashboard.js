import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';
import StatsRow from '../components/StatsRow';
import DraftsTable from '../components/DraftsTable';
import QuickDraft from '../components/QuickDraft';
import AISuggestions from '../components/AISuggestions';
import CitationBox from '../components/CitationBox';

const D = {
  app:     { display: 'flex', minHeight: '100vh', background: '#f8f7f5', fontFamily: "'DM Sans', sans-serif" },
  main:    { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#f8f7f5' },
  topbar:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', borderBottom: '1px solid #e8e8e4', background: '#f8f7f5', flexShrink: 0 },
  pageTitle: { fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 400, color: '#111', letterSpacing: '-0.01em' },
  pageSub: { fontSize: 13, color: '#999', marginTop: 2 },
  topActions: { display: 'flex', alignItems: 'center', gap: 10 },
  btnPrimary: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 100, background: '#111', color: '#fff', border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'opacity 0.2s' },
  btnGhost:  { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 100, background: 'transparent', color: '#555', border: '1px solid #ddd', fontSize: 13, fontWeight: 400, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  content: { padding: '36px 40px', overflowY: 'auto', flex: 1 },
  grid:    { display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, marginTop: 28 },
  leftCol: { display: 'flex', flexDirection: 'column', gap: 24 },
  rightCol: { display: 'flex', flexDirection: 'column', gap: 20 },
  loadWrap: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8f7f5' },
  comingSection: { paddingTop: 4 },
  comingHeading: { fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 400, color: '#111', marginBottom: 14 },
  comingGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 },
  comingCard: { background: '#fff', border: '1px solid #e8e8e4', borderRadius: 14, padding: '18px 20px' },
  comingTitle: { fontSize: 13.5, fontWeight: 500, color: '#111', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 },
  soonBadge: { fontSize: 9, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#999', background: '#f4f3f0', padding: '2px 7px', borderRadius: 100 },
  comingDesc: { fontSize: 12, color: '#aaa', lineHeight: 1.5 },
};

const Dashboard = () => {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [draftsRes, userRes] = await Promise.all([
          api.get('/drafts/'),
          api.get('/auth/me'),
        ]);
        setDrafts(draftsRes.data);
        setUser(userRes.data);
      } catch (e) {
        console.warn('Dashboard load failed:', e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this draft?')) return;
    try {
      await api.delete(`/drafts/${id}`);
      setDrafts(prev => prev.filter(d => String(d.id) !== String(id)));
    } catch (e) {
      console.error('Delete failed:', e.message);
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
      <div style={D.loadWrap}>
        <span style={{ color: '#999', fontSize: 14 }}>Loading workspace…</span>
      </div>
    );
  }

  return (
    <div style={D.app}>
      <Sidebar user={user} />

      <main style={D.main}>
        {/* Top bar */}
        <div style={D.topbar}>
          <div>
            <div style={D.pageTitle}>{greeting}, {displayName}</div>
            <div style={D.pageSub}>
              {inProgress > 0
                ? `${inProgress} draft${inProgress > 1 ? 's' : ''} in progress`
                : 'All drafts up to date'}
              {' · '}{dateStr}
            </div>
          </div>
          <div style={D.topActions}>
            <button style={D.btnGhost} onClick={() => navigate('/upload')}>Upload</button>
            <button style={D.btnPrimary} onClick={() => navigate('/draft/new')}>+ New Draft</button>
          </div>
        </div>

        {/* Scrollable content */}
        <div style={D.content} className="dash-fade">
          <StatsRow drafts={drafts} />

          <div style={D.grid}>
            <div style={D.leftCol}>
              <DraftsTable drafts={drafts} onDelete={handleDelete} />
              <CitationBox />
              {/* Coming Next feature cards */}
              <div style={D.comingSection}>
                <div style={D.comingHeading}>Coming Next</div>
                <div style={D.comingGrid}>
                  {[
                    { title: 'OCR Upload',      desc: 'Scan physical documents with AI-powered text extraction' },
                    { title: 'Live Citations',   desc: 'Real-time IPC / CrPC section lookup while you draft' },
                    { title: 'Multi-user Sync',  desc: 'Collaborate on drafts with your team in real time' },
                  ].map((f) => (
                    <div key={f.title} style={D.comingCard}>
                      <div style={D.comingTitle}>
                        {f.title}
                        <span style={D.soonBadge}>Soon</span>
                      </div>
                      <div style={D.comingDesc}>{f.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={D.rightCol}>
              <QuickDraft />
              <AISuggestions />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
