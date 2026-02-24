import React from 'react';

const STATS = [
  { valueKey: 'total',     label: 'Total Drafts',     sub: 'created' },
  { valueKey: 'week',     label: 'This Week',         sub: 'new drafts' },
  { valueKey: 'citations', label: 'Sections Used',    sub: 'IPC · CrPC · CPC' },
  { valueKey: 'timeSaved', label: 'Time Saved',       sub: 'per draft avg' },
];

const StatsRow = ({ drafts = [] }) => {
  const now = new Date();
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

  const values = {
    total:     drafts.length,
    week:      drafts.filter((d) => new Date(d.created_at) > weekAgo).length,
    citations: drafts.reduce((acc, d) => acc + (d.sections?.length || 0), 0),
    timeSaved: '∼4h',
  };

  return (
    <div style={S.row}>
      {STATS.map((s, i) => (
        <div key={s.label} style={{ ...S.block, ...(i < STATS.length - 1 ? S.blockBorder : {}) }}>
          <div style={S.value}>{values[s.valueKey]}</div>
          <div style={S.label}>{s.label}</div>
          <div style={S.sub}>{s.sub}</div>
        </div>
      ))}
    </div>
  );
};

const S = {
  row: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    background: '#fff',
    border: '1px solid #e8e8e4',
    borderRadius: 14,
    overflow: 'hidden',
  },
  block: {
    padding: '24px 28px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  blockBorder: {
    borderRight: '1px solid #f0efec',
  },
  value: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 36,
    fontWeight: 400,
    color: '#111',
    lineHeight: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: 500,
    color: '#333',
    marginTop: 6,
  },
  sub: {
    fontSize: 11,
    color: '#aaa',
    letterSpacing: '0.02em',
  },
};

export default StatsRow;
