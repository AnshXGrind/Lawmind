import React, { useState } from 'react';
import useGemini from '../../hooks/useGemini';
import { GeminiModal, AiThinking, AiError } from './GeminiPanel';

const S = {
  triggerBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '8px 16px', borderRadius: 100,
    background: '#fff', color: '#111',
    border: '1px solid #e8e8e4', fontSize: 13, fontWeight: 500,
    cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
  letterArea: {
    width: '100%', minHeight: 200, border: '1px solid #e8e8e4',
    borderRadius: 12, padding: '14px 16px', fontSize: 14,
    fontFamily: "'DM Sans', sans-serif", color: '#111',
    resize: 'vertical', outline: 'none', lineHeight: 1.7,
    background: '#fafaf8', boxSizing: 'border-box',
    marginTop: 14,
  },
  btnRow: {
    display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap',
  },
  copyBtn: {
    padding: '9px 20px', borderRadius: 100, background: '#111',
    color: '#fff', border: 'none', fontSize: 13, fontWeight: 500,
    cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
    transition: 'opacity 0.2s',
  },
  waBtn: {
    padding: '9px 20px', borderRadius: 100, background: '#25d366',
    color: '#fff', border: 'none', fontSize: 13, fontWeight: 500,
    cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
    transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', gap: 6,
  },
  ghostBtn: {
    padding: '9px 20px', borderRadius: 100,
    background: '#fff', color: '#888', border: '1px solid #e8e8e4',
    fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
    transition: 'all 0.2s',
  },
  hint: { fontSize: 12, color: '#aaa', marginTop: 8 },
};

export default function ClientLetterGenerator({ draftContent, draftTitle }) {
  const [open, setOpen] = useState(false);
  const [letter, setLetter] = useState('');
  const [copied, setCopied] = useState(false);
  const { ask, loading, error } = useGemini();

  const generate = async () => {
    setOpen(true);
    const prompt = `Convert this legal petition into a simple client communication letter. Use plain English. No jargon. Keep under 150 words. Start with "Dear [Client]," and end with "Regards,\\n[Advocate Name]".\n\nPetition:\n${draftContent.slice(0, 3000)}`;
    const res = await ask(prompt);
    if (res) setLetter(res);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const waShare = () => {
    const encoded = encodeURIComponent(letter);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <>
      <button
        style={S.triggerBtn}
        onClick={generate}
        title="Generate Client Letter"
      >
        ✉ Client Letter
      </button>

      <GeminiModal open={open} onClose={() => setOpen(false)} title="Client Letter Generator">
        {loading && <AiThinking text="Generating client letter…" />}
        <AiError error={error} onRetry={generate} />
        {!loading && (
          <>
            <p style={S.hint}>Review and edit before sending.</p>
            <textarea
              style={S.letterArea}
              value={letter}
              onChange={(e) => setLetter(e.target.value)}
              placeholder="Your client letter will appear here…"
            />
            <div style={S.btnRow}>
              <button style={{ ...S.copyBtn, opacity: !letter ? 0.4 : 1 }} onClick={handleCopy} disabled={!letter}>
                {copied ? '✓ Copied!' : 'Copy to Clipboard'}
              </button>
              <button style={{ ...S.waBtn, opacity: !letter ? 0.4 : 1 }} onClick={waShare} disabled={!letter}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </button>
              <button style={S.ghostBtn} onClick={() => setOpen(false)}>Close</button>
            </div>
          </>
        )}
      </GeminiModal>
    </>
  );
}
