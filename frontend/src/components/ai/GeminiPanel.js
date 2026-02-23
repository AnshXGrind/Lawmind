import React, { useEffect } from 'react';

/* ── Shared slide-in panel + modal wrapper ── */

const S = {
  // Right-side slide panel
  overlay: {
    position: 'fixed', inset: 0, zIndex: 300,
    background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(4px)',
  },
  panel: (open) => ({
    position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 301,
    width: 360, background: '#fff',
    borderLeft: '1px solid #e8e8e4',
    boxShadow: '-8px 0 40px rgba(0,0,0,0.10)',
    display: 'flex', flexDirection: 'column',
    transform: open ? 'translateX(0)' : 'translateX(100%)',
    transition: 'transform 0.3s ease',
  }),
  // Centred modal
  modalOverlay: {
    position: 'fixed', inset: 0, zIndex: 300,
    background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '24px',
  },
  modal: {
    background: '#fff', borderRadius: 16,
    border: '1px solid #e8e8e4',
    boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
    width: '100%', maxWidth: 640,
    maxHeight: '90vh', display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '18px 22px 16px',
    borderBottom: '1px solid #e8e8e4',
  },
  headerTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 17, fontWeight: 500, color: '#111',
  },
  closeBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: '#888', fontSize: 20, lineHeight: 1,
    padding: '2px 6px', borderRadius: 6,
    transition: 'color 0.2s',
  },
  body: {
    flex: 1, overflowY: 'auto', padding: '20px 22px',
  },
  // Loading state
  thinking: {
    display: 'flex', alignItems: 'center', gap: 10,
    color: '#888', fontSize: 13,
    padding: '12px 0'
  },
  thinkingDot: {
    width: 8, height: 8, borderRadius: '50%',
    background: '#111',
    animation: 'lm-pulse 1s infinite',
  },
  // Error state
  errorBox: {
    background: '#fff5f5', border: '1px solid #fecaca',
    borderRadius: 10, padding: '10px 14px',
    fontSize: 13, color: '#dc2626',
    marginTop: 8,
  },
};

/** Slide-in drawer from the right */
export function GeminiPanel({ open, onClose, title, children }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <>
      <div style={S.overlay} onClick={onClose} />
      <div style={S.panel(open)}>
        <div style={S.header}>
          <span style={S.headerTitle}>{title}</span>
          <button style={S.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div style={S.body}>{children}</div>
      </div>
    </>
  );
}

/** Centred modal */
export function GeminiModal({ open, onClose, title, children }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div style={S.modalOverlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={S.modal}>
        <div style={S.header}>
          <span style={S.headerTitle}>{title}</span>
          <button style={S.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div style={S.body}>{children}</div>
      </div>
    </div>
  );
}

/** Loading indicator */
export function AiThinking({ text = 'LawMind is thinking…' }) {
  return (
    <div style={S.thinking}>
      <span style={S.thinkingDot} />
      {text}
      <style>{`@keyframes lm-pulse{0%,100%{opacity:1}50%{opacity:0.2}}`}</style>
    </div>
  );
}

/** Error block */
export function AiError({ error, onRetry }) {
  if (!error) return null;
  return (
    <div style={S.errorBox}>
      {error}
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            marginLeft: 10, background: 'none', border: 'none',
            color: '#dc2626', cursor: 'pointer', textDecoration: 'underline',
            fontSize: 13,
          }}
        >
          Retry
        </button>
      )}
    </div>
  );
}

/* ── Shared design tokens ── */
export const btn = {
  base: {
    borderRadius: 100, fontFamily: "'DM Sans', sans-serif",
    fontSize: 13, fontWeight: 500, cursor: 'pointer',
    transition: 'all 0.2s ease', border: 'none',
    padding: '8px 18px',
  },
  primary: {
    background: '#111', color: '#fff',
  },
  ghost: {
    background: '#fff', color: '#888',
    border: '1px solid #e8e8e4',
  },
};
