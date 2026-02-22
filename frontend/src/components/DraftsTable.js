import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';

const TYPE_BADGE = {
  petition:  { bg: 'rgba(201,168,76,0.12)',  color: '#e8c96a',  label: 'Petition' },
  contract:  { bg: 'rgba(99,179,237,0.12)',  color: '#90cdf4',  label: 'Contract' },
  notice:    { bg: 'rgba(252,129,74,0.12)',  color: '#fbd38d',  label: 'Notice' },
  affidavit: { bg: 'rgba(154,117,195,0.12)', color: '#d6bcfa',  label: 'Affidavit' },
  appeal:    { bg: 'rgba(72,187,120,0.12)',  color: '#68d391',  label: 'Appeal' },
  agreement: { bg: 'rgba(99,179,237,0.12)',  color: '#90cdf4',  label: 'Agreement' },
};

const STATUS = {
  completed: { dot: '#68d391', label: 'Done' },
  draft:     { dot: '#c9a84c', label: 'Draft' },
  review:    { dot: '#fc8181', label: 'Review' },
};

const formatDate = (ds) =>
  new Date(ds).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

const DraftsTable = ({ drafts = [], onDelete }) => {
  const navigate = useNavigate();

  if (drafts.length === 0) {
    return (
      <div style={styles.empty}>
        <div style={{ fontSize: 32 }}>📄</div>
        <div style={{ marginTop: 8, color: 'var(--muted)', fontSize: 14 }}>
          No drafts yet — create your first one!
        </div>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div>
          <div style={styles.title}>Recent Drafts</div>
          <div style={styles.subtitle}>AI-generated legal documents</div>
        </div>
        <div style={styles.searchBar}>
          <span>⌕</span>&nbsp;Search drafts…
        </div>
      </div>

      <table style={styles.table}>
        <thead>
          <tr style={styles.thead}>
            {['Document', 'Type', 'Court', 'Status', 'Date', ''].map((h) => (
              <th key={h} style={styles.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {drafts.map((d) => {
            const type = TYPE_BADGE[d.document_type] || TYPE_BADGE.petition;
            const status = STATUS[d.status] || STATUS.draft;
            return (
              <tr
                key={d.id}
                style={styles.tr}
                onClick={() => navigate(`/draft/${d.id}`)}
              >
                <td style={styles.td}>
                  <div style={styles.draftTitle}>{d.title || '(Untitled)'}</div>
                  <div style={styles.draftMeta}>
                    {d.case_type} · {d.sections?.slice(0, 2).join(', ') || '—'}
                  </div>
                </td>
                <td style={styles.td}>
                  <span style={{ ...styles.badge, background: type.bg, color: type.color }}>
                    {type.label}
                  </span>
                </td>
                <td style={{ ...styles.td, color: 'var(--muted)', fontSize: 13 }}>
                  {d.court?.replace(/_/g, ' ') || '—'}
                </td>
                <td style={styles.td}>
                  <span style={styles.statusDot}>
                    <span style={{ ...styles.dot, background: status.dot, boxShadow: `0 0 6px ${status.dot}80` }} />
                    {status.label}
                  </span>
                </td>
                <td style={{ ...styles.td, color: 'var(--muted)', fontSize: 12 }}>
                  {formatDate(d.created_at)}
                </td>
                <td style={styles.td} onClick={(e) => e.stopPropagation()}>
                  <button
                    style={styles.deleteBtn}
                    onClick={() => onDelete && onDelete(d.id)}
                    title="Delete"
                  >
                    <Trash2 size={14} />
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

const styles = {
  card: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 14,
    overflow: 'hidden',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '18px 22px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  title: { fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 600, color: 'var(--paper)' },
  subtitle: { fontSize: 12, color: 'var(--muted)', marginTop: 2 },
  searchBar: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 8, padding: '7px 12px',
    fontSize: 13, color: 'var(--muted)',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { borderBottom: '1px solid rgba(255,255,255,0.05)' },
  th: {
    textAlign: 'left', fontSize: 11, fontWeight: 600,
    letterSpacing: '0.05em', textTransform: 'uppercase',
    color: 'var(--muted)', padding: '12px 22px',
  },
  tr: {
    borderBottom: '1px solid rgba(255,255,255,0.03)',
    transition: 'background 0.15s',
    cursor: 'pointer',
  },
  td: { padding: '14px 22px', fontSize: 13.5, color: 'var(--paper)' },
  draftTitle: { fontWeight: 500, marginBottom: 2 },
  draftMeta: { fontSize: 11.5, color: 'var(--muted)' },
  badge: {
    display: 'inline-flex', alignItems: 'center',
    padding: '3px 9px', borderRadius: 20,
    fontSize: 11, fontWeight: 500,
  },
  statusDot: { display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12 },
  dot: { width: 6, height: 6, borderRadius: '50%', flexShrink: 0 },
  deleteBtn: {
    background: 'transparent', border: 'none',
    color: 'var(--muted)', cursor: 'pointer',
    padding: '4px 8px', borderRadius: 6,
    transition: 'color 0.15s',
  },
  empty: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: '48px 22px',
    textAlign: 'center',
    color: 'var(--paper)',
  },
};

export default DraftsTable;
