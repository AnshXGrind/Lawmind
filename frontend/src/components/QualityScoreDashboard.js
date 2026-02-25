import React, { useMemo } from 'react';

// Local quality scoring — no backend required
function computeQualityScore(content) {
  if (!content || content.trim().length < 10) {
    return null;
  }

  const text = content.toLowerCase();
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  // Structure score: checks for key legal document sections
  const structureKeywords = ["prayer", "whereas", "petitioner", "respondent", "hon'ble", "honble", "grounds", "facts", "verification", "wherefore", "plaintiff", "defendant"];
  const structureHits = structureKeywords.filter(k => text.includes(k)).length;
  const structure_score = Math.min(10, 1 + (structureHits / structureKeywords.length) * 9);

  // Legal references score: checks for IPC/CrPC/CPC section mentions
  const legalPatterns = [/ipc/i, /crpc/i, /\bcpc\b/i, /section \d+/i, /article \d+/i, /act,? \d{4}/i, /schedule/i, /order \d+/i, /rule \d+/i];
  const legalHits = legalPatterns.filter(p => p.test(content)).length;
  const legal_references_score = Math.min(10, 1 + (legalHits / legalPatterns.length) * 9);

  // Completeness score: based on word count
  let completeness_score;
  if (wordCount >= 800) completeness_score = 9.5;
  else if (wordCount >= 500) completeness_score = 8.0;
  else if (wordCount >= 300) completeness_score = 6.0;
  else if (wordCount >= 150) completeness_score = 4.0;
  else completeness_score = 2.0;

  // Tone score: checks for formal legal language
  const toneKeywords = ["respectfully", "humbly", "court", "jurisdiction", "pursuant", "hereinafter", "aforementioned", "notwithstanding", "wherein", "hereby"];
  const toneHits = toneKeywords.filter(k => text.includes(k)).length;
  const tone_score = Math.min(10, 2 + (toneHits / toneKeywords.length) * 8);

  // Grammar score: simple heuristic (consistent casing, sentence structure)
  const sentenceCount = (content.match(/[.!?]+/g) || []).length;
  const avgWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : wordCount;
  const grammar_score = avgWordsPerSentence > 50 ? 5.5 : avgWordsPerSentence > 20 ? 8.0 : avgWordsPerSentence > 10 ? 7.0 : 6.0;

  const overall_score = (structure_score * 0.25 + legal_references_score * 0.25 + completeness_score * 0.2 + tone_score * 0.2 + grammar_score * 0.1);

  const strengths = [];
  const suggestions = [];

  if (structure_score >= 7) strengths.push('Good document structure with key sections');
  else suggestions.push('Add standard sections: PRAYER, GROUNDS, FACTS, VERIFICATION');

  if (legal_references_score >= 7) strengths.push('Strong legal references and citations');
  else suggestions.push('Include specific IPC/CrPC/CPC sections or Article references');

  if (completeness_score >= 7) strengths.push('Comprehensive coverage of case details');
  else suggestions.push(`Expand content — currently ${wordCount} words. Aim for 500+ for court-ready documents`);

  if (tone_score >= 7) strengths.push('Formal legal language used appropriately');
  else suggestions.push('Use more formal legal language: "respectfully", "pursuant to", "hereinafter"');

  return {
    overall_score: Math.round(overall_score * 10) / 10,
    structure_score: Math.round(structure_score * 10) / 10,
    legal_references_score: Math.round(legal_references_score * 10) / 10,
    completeness_score: Math.round(completeness_score * 10) / 10,
    tone_score: Math.round(tone_score * 10) / 10,
    grammar_score: Math.round(grammar_score * 10) / 10,
    strengths,
    suggestions,
    word_count: wordCount,
  };
}

function QualityScoreDashboard({ draftId, content }) {
  const qualityData = useMemo(() => computeQualityScore(content), [content]);

  const getScoreBadge = (score) => {
    if (score >= 8) return { text: 'Excellent', color: 'bg-green-100 text-green-800', emoji: 'Star' };
    if (score >= 6) return { text: 'Good', color: 'bg-blue-100 text-blue-800', emoji: 'Ok' };
    if (score >= 4) return { text: 'Fair', color: 'bg-yellow-100 text-yellow-800', emoji: 'Warn' };
    return { text: 'Needs Work', color: 'bg-red-100 text-red-800', emoji: 'Fix' };
  };

  if (!qualityData) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <p className="text-gray-500 text-sm">Start editing to see quality analysis...</p>
      </div>
    );
  }

  const badge = getScoreBadge(qualityData.overall_score);

  const ScoreBar = ({ score, label, color }) => (
    <div className="mb-3">
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>{label}</span>
        <span className="font-semibold">{score}/10</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all duration-700"
          style={{ width: `${score * 10}%`, background: color }}
        />
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4 pb-3 border-b">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Quality Analysis</h2>
          <p className="text-gray-500 text-xs mt-1">{qualityData.word_count} words</p>
        </div>
        <div className={`px-3 py-1.5 rounded-full ${badge.color} font-semibold text-sm`}>
          {badge.text}
        </div>
      </div>

      <div className="text-center mb-6">
        <div className="text-5xl font-bold text-gray-900">{qualityData.overall_score}</div>
        <div className="text-sm text-gray-500 mt-1">Overall Score / 10</div>
      </div>

      <div className="mb-5">
        <ScoreBar score={qualityData.structure_score} label="Structure" color="#3b82f6" />
        <ScoreBar score={qualityData.legal_references_score} label="Legal References" color="#8b5cf6" />
        <ScoreBar score={qualityData.completeness_score} label="Completeness" color="#10b981" />
        <ScoreBar score={qualityData.tone_score} label="Tone" color="#f59e0b" />
        <ScoreBar score={qualityData.grammar_score} label="Grammar" color="#ef4444" />
      </div>

      {qualityData.strengths.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Strengths</h3>
          {qualityData.strengths.map((s, i) => (
            <div key={i} className="text-xs text-green-700 bg-green-50 rounded px-3 py-1.5 mb-1">+ {s}</div>
          ))}
        </div>
      )}

      {qualityData.suggestions.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Suggestions</h3>
          {qualityData.suggestions.map((s, i) => (
            <div key={i} className="text-xs text-blue-700 bg-blue-50 rounded px-3 py-1.5 mb-1">Tip: {s}</div>
          ))}
        </div>
      )}

      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-xs text-yellow-800">Scores update automatically as you edit. Aim for 8+ for court-ready documents.</p>
      </div>
    </div>
  );
}

export default QualityScoreDashboard;
