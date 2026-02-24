import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

const TAGS = ['All', 'Draft', 'Research', 'Analyse', 'Summarise'];

const CHIPS = [
  '⚖️ Case analysis',
  '📄 Contract drafting',
  '🔍 Precedent search',
  '🛡️ Compliance check',
  '📋 Document review',
];

const FEATURES = [
  { n: '01', h: 'Smart Drafting',     p: 'Generate NDAs, contracts, and letters in seconds. Trained on thousands of precedents across jurisdictions.' },
  { n: '02', h: 'Case Research',      p: 'Surface relevant judgements instantly. Ask in plain English — LawMind finds the precedent, you make the argument.' },
  { n: '03', h: 'Document Review',    p: 'Upload any agreement. Get a clear summary, risk flags, and suggested edits within moments.' },
  { n: '04', h: 'Compliance Monitor', p: 'Track regulatory changes that affect your clients. Be the first to know, not the last to react.' },
  { n: '05', h: 'Client Explainer',   p: 'Translate complex legal language into plain English your clients will actually read and understand.' },
  { n: '06', h: 'Matter Organiser',   p: 'All case notes, documents, and timelines in one intelligent workspace. Less searching, more lawyering.' },
];

const HOW = [
  { n: '01', h: 'Ask in plain language',          p: 'No query syntax. Type your question naturally — LawMind understands legal context and intent automatically.' },
  { n: '02', h: 'LawMind searches and reasons',   p: 'It scans statutes, case law, and your firm\'s own documents simultaneously, then reasons across them to form a precise answer.' },
  { n: '03', h: 'Review, refine, export',          p: 'Every response is citable, editable, and ready to use. Export to Word or share with a client in one click.' },
];

export default function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [activeTag, setActiveTag] = useState('All');
  const [query, setQuery] = useState('');
  const [sent, setSent] = useState(false);
  const taRef = useRef(null);

  // Scroll nav border
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Reveal on scroll
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const siblings = [...e.target.parentElement.children];
            const idx = siblings.indexOf(e.target);
            const isCard = e.target.classList.contains('lm-card');
            e.target.style.transitionDelay = isCard ? `${idx * 0.06}s` : '0s';
            e.target.classList.add('in');
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll('.lm-r').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const handleResize = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  const handleGo = () => {
    if (!query.trim()) {
      navigate('/dashboard');
      return;
    }
    setSent(true);
    setTimeout(() => {
      navigate('/dashboard');
    }, 600);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGo();
    }
  };

  return (
    <div className="lm-root">
      {/* ── Nav ── */}
      <nav className={`lm-nav${scrolled ? ' scrolled' : ''}`}>
        <span className="lm-logo">Law<em>Mind</em></span>
        <div className="lm-nav-links">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <a href="#pricing">Pricing</a>
        </div>
        <button className="lm-nav-cta" onClick={() => navigate('/dashboard')}>
          Get early access
        </button>
      </nav>

      {/* ── Hero ── */}
      <div className="lm-hero">
        {/* Scales deco */}
        <div className="lm-deco" aria-hidden>
          <svg width="180" height="220" viewBox="0 0 180 220" fill="none">
            <rect x="85" y="10" width="10" height="200" fill="black"/>
            <rect x="20" y="50" width="140" height="8" fill="black"/>
            <ellipse cx="35" cy="54" rx="30" ry="8" fill="black" opacity="0.6"/>
            <ellipse cx="145" cy="54" rx="30" ry="8" fill="black" opacity="0.6"/>
            <line x1="35" y1="54" x2="35" y2="88" stroke="black" strokeWidth="4"/>
            <line x1="145" y1="54" x2="145" y2="88" stroke="black" strokeWidth="4"/>
            <ellipse cx="35" cy="100" rx="30" ry="14" fill="none" stroke="black" strokeWidth="5"/>
            <ellipse cx="145" cy="100" rx="30" ry="14" fill="none" stroke="black" strokeWidth="5"/>
            <rect x="65" y="205" width="50" height="10" rx="4" fill="black"/>
          </svg>
        </div>

        <div className="lm-badge">
          <span className="lm-dot" />
          Private beta — apply now
        </div>

        <h1 className="lm-h1">
          Legal intelligence,<br /><em>finally at your fingertips.</em>
        </h1>

        <p className="lm-sub">
          Ask anything. Draft contracts, analyse cases, research precedents — all in plain language your clients understand.
        </p>

        {/* Prompt box */}
        <div className="lm-prompt-wrap">
          <div className="lm-prompt-box">
            <textarea
              ref={taRef}
              placeholder="Ask LawMind — Draft an NDA, find a precedent, summarise a judgment…"
              rows={2}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onInput={handleResize}
              onKeyDown={handleKeyDown}
            />
            <div className="lm-prompt-foot">
              <div className="lm-tags">
                {TAGS.map((t) => (
                  <button
                    key={t}
                    className={`lm-tag${activeTag === t ? ' on' : ''}`}
                    onClick={() => setActiveTag(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <button className={`lm-send${sent ? ' sent' : ''}`} onClick={handleGo} aria-label="Send">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="lm-chips">
          {CHIPS.map((c) => <div key={c} className="lm-chip">{c}</div>)}
        </div>
      </div>

      {/* ── Features ── */}
      <section id="features" className="lm-section">
        <p className="lm-label lm-r">What it does</p>
        <h2 className="lm-title lm-r">Built for how<br /><em>lawyers actually work.</em></h2>
        <div className="lm-cards">
          {FEATURES.map((f) => (
            <div key={f.n} className="lm-card lm-r">
              <div className="lm-card-n">{f.n}</div>
              <h3>{f.h}</h3>
              <p>{f.p}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="lm-section">
        <p className="lm-label lm-r">How it works</p>
        <h2 className="lm-title lm-r">From question<br /><em>to answer, fast.</em></h2>
        <div className="lm-timeline">
          {HOW.map((h) => (
            <div key={h.n} className="lm-tl lm-r">
              <div className="lm-tl-n">{h.n}</div>
              <div>
                <h3>{h.h}</h3>
                <p>{h.p}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <div className="lm-cta-section" id="pricing">
        <h2>Ready to work<br /><em>ten times smarter?</em></h2>
        <button className="lm-btn" onClick={() => navigate('/dashboard')}>
          Request early access
        </button>
        <button className="lm-btn-o" onClick={() => navigate('/dashboard')}>
          See a demo
        </button>
      </div>

      {/* ── Footer ── */}
      <footer className="lm-footer">
        <span className="lm-footer-logo">Law<em>Mind</em></span>
        <div className="lm-footer-links">
          <a href="/">Privacy</a>
          <a href="/">Terms</a>
          <a href="/">Contact</a>
        </div>
        <div>© 2026 LawMind</div>
      </footer>
    </div>
  );
}
