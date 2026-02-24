import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';

const TYPE_PILL = {
  petition:  { bg: '#f4f3f0', color: '#555' },
  contract:  { bg: '#eef4fb', color: '#3b6fa0' },
  notice:    { bg: '#fdf4ee', color: '#a06030' },
  affidavit: { bg: '#f3f0f8', color: '#6b4f9a' },
  appeal:    { bg: '#eef8f2', color: '#2e7d52' },
  agreement: { bg: '#eef4fb', color: '#3b6fa0' },
};

const STATUS = {
  completed: { dot: '#4ade80', label: 'Done' },
  draft:     { dot: '#facc15', label: 'Draft' },
  review:    { dot: '#f87171', label: 'Review' },
};

const fmt = (ds) => new Date(ds).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

const DraftsTable = ({ drafts = [], onDelete }) => {
  const navigate = useNavigate();

  if (drafts.length === 0) {
    return (
      <div style={T.empty}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>📄</div>
        <div style={{ color: '#999', fontSize: 14 }}>No drafts yet — create your first one</div>
      </div>
    );
  }

  return (
    <div style={T.card}>
      <div style={T.header}>
        <div>
          <div style={T.title}>Recent Drafts</div>
          <div style={T.sub}>AI-generated legal documents</div>
        </div>
      </div>

      <table style={T.table}>
        <thead>
          <tr>
            {['Document', 'Type', 'Court', 'Status', 'Date', ''].map((h) => (
              <th key={h} style={T.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {drafts.map((d) => {
            const pill = TYPE_PILL[d.document_type] || TYPE_PILL.petition;
            const st   = STATUS[d.status] || STATUS.draft;
            return (
              <tr
                key={d.id}
                style={T.tr}
                onClick={() => navigate(`/draft/${d.id}`)}
                onMouseEnter={(e) => e.currentTarget.style.background = '#faf9f7'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <td style={T.td}>
                  <div style={T.draftTitle}>{d.title || '(Untitled)'}</div>
                  <div style={T.draftMeta}>{d.case_type} · {d.sections?.slice(0,2).join(', ') || '—'}</div>
                </td>
                <td style={T.td}>
                  <span style={{ ...T.pill, background: pill.bg, color: pill.color }}>
                    {d.document_type || 'petition'}
                  </span>
                </td>
                <td style={{ ...T.td, ...T.muted }}>{d.court?.replace(/_/g, ' ') || '—'}</td>
                <td style={T.td}>
                  <span style={T.statusWrap}>
                    <span style={{ ...T.dot, background: st.dot }} />
                    {st.label}
                  </span>
                </td>
                <td style={{ ...T.td, ...T.muted }}>{fmt(d.created_at)}</td>
                <td style={T.td} onClick={(e) => e.stopPropagation()}>
                  <button style={T.del} onClick={() => onDelete && onDelete(d.id)} title="Delete">
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const T = {
  card: {
    background: '#fff',
    border: '1px solid #e8e8e4',
    borderRadius: 14,
    overflow: 'hidden',
    fontFamily: "'DM Sans', sans-serif",
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '20px 24px 16px',
    borderBottom: '1px solid #f0efec',
  },
  title: { fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 400, color: '#111' },
  sub: { fontSize: 12, color: '#aaa', marginTop: 2 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    textAlign: 'left',
    fontSize: 10.5,
    fontWeight: 600,
    letterSpacing: '0.07em',
    textTransform: 'uppercase',
    color: '#bbb',
    padding: '10px 24px',
    borderBottom: '1px solid #f0efec',
  },
  tr: {
    borderBottom: '1px solid #f7f6f3',
    cursor: 'pointer',
    transition: 'background 0.12s',
  },
  td: { padding: '14px 24px', fontSize: 13.5, color: '#222', verticalAlign: 'middle' },
  muted: { color: '#aaa', fontSize: 12.5 },
  draftTitle: { fontWeight: 500, color: '#111', marginBottom: 2 },
  draftMeta:  { fontSize: 11.5, color: '#aaa' },
  pill: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: 100,
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'capitalize',
  },
  statusWrap: { display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5 },
  dot: { width: 6, height: 6, borderRadius: '50%', flexShrink: 0 },
  del: {
    background: 'none', border: 'none',
    color: '#ccc', cursor: 'pointer',
    padding: '4px 6px', borderRadius: 6,
    transition: 'color 0.15s',
  },
  empty: {
    background: '#fff',
    border: '1px solid #e8e8e4',
    borderRadius: 14,
    padding: '60px 24px',
    textAlign: 'center',
  },
};

export default DraftsTable;
