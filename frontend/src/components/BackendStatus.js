import React, { useState, useEffect, useCallback } from 'react';
import { BACKEND_BASE } from '../utils/api';

const STYLES = {
  waking: { bg: '#1e3a5f', icon: '⏳' },
  offline: { bg: '#7f1d1d', icon: '❌' },
  online: { bg: '#14532d', icon: '✅' },
};

/**
 * BackendStatus — polls /health every 30s and shows a dismissible banner.
 * Shows nothing when status is 'online', 'local', or 'checking'.
 */
export default function BackendStatus() {
  const [status, setStatus] = useState('checking');
  const [dismissed, setDismissed] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const check = useCallback(async () => {
    if (!BACKEND_BASE || BACKEND_BASE.includes('localhost')) {
      setStatus('local');
      return;
    }
    try {
      const res = await fetch(`${BACKEND_BASE}/health`, {
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        setStatus('online');
        setDismissed(false); // reset so next wakeup shows
      } else {
        setStatus('offline');
      }
    } catch {
      setStatus((prev) => {
        // First failure → waking, subsequent → offline
        return prev === 'checking' || prev === 'online' ? 'waking' : 'offline';
      });
      setAttempts((n) => n + 1);
    }
  }, []);

  // Initial check + auto-retry when waking
  useEffect(() => {
    check();
  }, [check]);

  useEffect(() => {
    if (status === 'waking') {
      const t = setTimeout(check, 35000); // retry after 35s (HF cold start ~30-60s)
      return () => clearTimeout(t);
    }
    if (status === 'online') {
      const t = setInterval(check, 30000); // re-check every 30s
      return () => clearInterval(t);
    }
  }, [status, check]);

  const labels = {
    waking: `⏳ Backend is waking up on Hugging Face — cold start takes ~30–60 seconds. Retrying… (${attempts})`,
    offline: '❌ Backend offline. Go to huggingface.co/spaces and restart your Space.',

    online: '✅ Backend connected',
  };

  if (
    status === 'checking' ||
    status === 'local' ||
    status === 'online' ||
    dismissed
  )
    return null;

  const { bg } = STYLES[status] || {};

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: bg,
        color: '#fff',
        padding: '9px 20px',
        fontSize: 13,
        fontFamily: "'DM Sans', sans-serif",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}
    >
      <span>{labels[status]}</span>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        {status === 'offline' && (
          <button
            onClick={check}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.4)',
              color: '#fff',
              borderRadius: 6,
              padding: '3px 12px',
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            Retry
          </button>
        )}
        <button
          onClick={() => setDismissed(true)}
          style={{
            background: 'none',
            border: '1px solid rgba(255,255,255,0.4)',
            color: '#fff',
            borderRadius: 6,
            padding: '3px 12px',
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
