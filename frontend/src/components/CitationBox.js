import React from 'react';

const DEFAULT_CITATIONS = [
  { code: 'IPC §420',  name: 'Cheating and dishonestly inducing delivery of property', year: '1860' },
  { code: 'CPC §80',   name: 'Notice to government before suit',                       year: '1908' },
  { code: 'Art. 226',  name: 'Power of High Courts to issue writs',                    year: '1950' },
  { code: 'CrPC §438', name: 'Anticipatory bail',                                      year: '1973' },
];

const CitationBox = ({ citations = DEFAULT_CITATIONS }) => (
  <div style={C.box}>
    <div style={C.title}>Recently Used Citations</div>
    <table style={C.table}>
      <tbody>
        {citations.map((c) => (
          <tr key={c.code} style={C.row}>
            <td style={C.code}>{c.code}</td>
            <td style={C.name}>{c.name}</td>
            <td style={C.year}>{c.year}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const C = {
  box: {
    background: '#fff',
    border: '1px solid #e8e8e4',
    borderRadius: 14,
    padding: '20px 24px',
    fontFamily: "'DM Sans', sans-serif",
  },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 16,
    fontWeight: 400,
    color: '#111',
    marginBottom: 16,
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  row: { borderBottom: '1px solid #f4f3f0' },
  code: {
    padding: '10px 16px 10px 0',
    fontSize: 11,
    fontFamily: "'DM Mono', 'Courier New', monospace",
    fontWeight: 600,
    color: '#555',
    whiteSpace: 'nowrap',
    width: 80,
  },
  name: {
    padding: '10px 12px',
    fontSize: 12.5,
    color: '#444',
    lineHeight: 1.4,
  },
  year: {
    padding: '10px 0',
    fontSize: 11,
    color: '#bbb',
    textAlign: 'right',
    whiteSpace: 'nowrap',
  },
};

export default CitationBox;
