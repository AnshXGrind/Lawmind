import { useState } from 'react';

// ─── Paste your Gemini API key here ───────────────────────
const GEMINI_KEY = 'YOUR_GEMINI_API_KEY';
// ──────────────────────────────────────────────────────────

const SYSTEM_PERSONA =
  'You are LawMind, a professional Indian legal assistant with deep expertise in IPC, CrPC, CPC, Hindu Marriage Act, Companies Act, and Constitution of India. Always respond in formal legal language with relevant section references.';

export const useGemini = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const ask = async (prompt) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: `${SYSTEM_PERSONA}\n\n${prompt}` }],
              },
            ],
          }),
        }
      );
      const data = await res.json();
      if (data.error) {
        setError(data.error.message || 'Gemini API error. Check your API key.');
        return null;
      }
      return data.candidates[0].content.parts[0].text;
    } catch (e) {
      setError('Gemini API error. Check your API key and network connection.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { ask, loading, error };
};

export default useGemini;
