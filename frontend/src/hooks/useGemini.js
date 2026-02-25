import { useState } from 'react';

// Reads from REACT_APP_GEMINI_API_KEY env var (set in .env / Vercel)
const GEMINI_KEY = process.env.REACT_APP_GEMINI_API_KEY || '';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;

const SYSTEM_PERSONA = `You are LawMind, a senior Indian legal drafting expert with 20+ years of court experience.
You specialize in: IPC, CrPC, CPC, Constitution of India, Hindu Marriage Act, Companies Act 2013, Contract Act 1872, Evidence Act.
Always use formal legal language. Include relevant section references. Format documents for Indian courts.
Keep responses concise and actionable unless asked for a full document.`;

export const useGemini = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const ask = async (prompt, systemOverride = null) => {
    if (!GEMINI_KEY) {
      setError('Gemini API key not configured. Add REACT_APP_GEMINI_API_KEY to your .env file.');
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const system = systemOverride || SYSTEM_PERSONA;
      const res = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${system}\n\n${prompt}` }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 4096 },
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error.message || 'Gemini API error. Check your API key.');
        return null;
      }
      return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
    } catch (e) {
      setError('Network error. Check your API key and internet connection.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Specialized helper for generating full legal drafts
  const generateLegalDraft = async ({
    documentType,
    caseType,
    court,
    title,
    facts,
    parties,
    sections,
    reliefSought,
    tone,
    additionalContext,
  }) => {
    const partiesText =
      Object.entries(parties || {})
        .map(([role, name]) => `${role.toUpperCase()}: ${name}`)
        .join('\n') || 'To be specified';
    const sectionsText =
      (sections || []).join(', ') || 'To be determined by counsel';

    const prompt = `Generate a COMPLETE, court-ready ${documentType.toUpperCase()} for filing in ${court}.

CASE DETAILS:
- Case Type: ${caseType.toUpperCase()}
- Court: ${court}
- Title: ${title}

PARTIES:
${partiesText}

FACTS OF THE CASE:
${facts}

APPLICABLE LEGAL PROVISIONS:
${sectionsText}

RELIEF SOUGHT:
${reliefSought || 'Grant appropriate relief as the facts and circumstances warrant'}

TONE: ${tone || 'formal'}
${additionalContext ? `\nADDITIONAL CONTEXT: ${additionalContext}` : ''}

---
Generate the COMPLETE document with ALL sections:
1. COURT HEADING (e.g., "IN THE HON'BLE HIGH COURT OF [STATE]")
2. CASE TITLE BLOCK (Petitioner vs. Respondent with proper designations)
3. BRIEF INTRODUCTION paragraph
4. FACTS (numbered paragraphs, detailed, at least 5-6 paragraphs)
5. GROUNDS (numbered legal grounds with section references, at least 5-6)
6. PRAYER / RELIEF SOUGHT (specific, numbered prayers)
7. VERIFICATION CLAUSE (with blanks for place, date, deponent)
8. Signature block for "Counsel for the Petitioner"

Use formal Indian legal language throughout. This must be ready to file in court.`;

    return ask(prompt);
  };

  return { ask, generateLegalDraft, loading, error };
};

export default useGemini;
