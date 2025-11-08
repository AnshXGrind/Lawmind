import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function QualityScoreDashboard({ draftId }) {
  const [qualityData, setQualityData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQualityScore = async () => {
      setLoading(true);
      setError('');

      try {
        const token = localStorage.getItem('lawmind_token');
        const response = await axios.post(
          `${API_URL}/api/drafts/${draftId}/quality-score`,
          {},
          {
            headers: { 'Authorization': `Bearer ${token}` },
          }
        );

        setQualityData(response.data);
      } catch (err) {
        // Handle error - detail can be string or array of validation errors
        const errorDetail = err.response?.data?.detail;
        if (Array.isArray(errorDetail)) {
          setError(errorDetail.map(e => e.msg).join(', '));
        } else if (typeof errorDetail === 'string') {
          setError(errorDetail);
        } else {
          setError('Failed to fetch quality score');
        }
      } finally {
        setLoading(false);
      }
    };

    if (draftId) {
      fetchQualityScore();
    }
  }, [draftId]);

  const refreshQualityScore = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('lawmind_token');
      const response = await axios.post(
        `${API_URL}/api/drafts/${draftId}/quality-score`,
        {},
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );

      setQualityData(response.data);
    } catch (err) {
      // Handle error - detail can be string or array of validation errors
      const errorDetail = err.response?.data?.detail;
      if (Array.isArray(errorDetail)) {
        setError(errorDetail.map(e => e.msg).join(', '));
      } else if (typeof errorDetail === 'string') {
        setError(errorDetail);
      } else {
        setError('Failed to fetch quality score');
      }
    } finally {
      setLoading(false);
    }
  };

  // Circular progress component
  const CircularProgress = ({ score, label, color }) => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 10) * circumference;

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32">
          <svg className="transform -rotate-90 w-32 h-32">
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke={color}
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold text-gray-900">
              {score.toFixed(1)}
            </span>
          </div>
        </div>
        <span className="mt-2 text-sm font-semibold text-gray-700">{label}</span>
      </div>
    );
  };

  // Score badge
  const getScoreBadge = (score) => {
    if (score >= 8) return { text: 'Excellent', color: 'bg-green-100 text-green-800', emoji: '🌟' };
    if (score >= 6) return { text: 'Good', color: 'bg-blue-100 text-blue-800', emoji: '👍' };
    if (score >= 4) return { text: 'Fair', color: 'bg-yellow-100 text-yellow-800', emoji: '⚠️' };
    return { text: 'Needs Work', color: 'bg-red-100 text-red-800', emoji: '⚡' };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="animate-spin text-4xl mb-4">🔄</div>
        <p className="text-gray-600">Analyzing document quality...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        ⚠️ {error}
      </div>
    );
  }

  if (!qualityData) return null;

  const badge = getScoreBadge(qualityData.overall_score);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📊 Quality Analysis</h2>
          <p className="text-gray-600 text-sm">AI-powered document assessment</p>
        </div>
        <div className={`px-4 py-2 rounded-full ${badge.color} font-semibold`}>
          {badge.emoji} {badge.text}
        </div>
      </div>

      {/* Overall Score */}
      <div className="mb-8 text-center">
        <CircularProgress
          score={qualityData.overall_score}
          label="Overall Quality"
          color={
            qualityData.overall_score >= 8 ? '#10b981' :
            qualityData.overall_score >= 6 ? '#3b82f6' :
            qualityData.overall_score >= 4 ? '#f59e0b' :
            '#ef4444'
          }
        />
      </div>

      {/* Breakdown Scores */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {qualityData.structure_score.toFixed(1)}
            </div>
            <div className="text-xs text-gray-600 mt-1">Structure</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {qualityData.tone_score.toFixed(1)}
            </div>
            <div className="text-xs text-gray-600 mt-1">Tone</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {qualityData.completeness_score.toFixed(1)}
            </div>
            <div className="text-xs text-gray-600 mt-1">Completeness</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {qualityData.legal_references_score.toFixed(1)}
            </div>
            <div className="text-xs text-gray-600 mt-1">References</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {qualityData.grammar_score.toFixed(1)}
            </div>
            <div className="text-xs text-gray-600 mt-1">Grammar</div>
          </div>
        </div>
      </div>

      {/* Strengths */}
      {qualityData.strengths && qualityData.strengths.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">✅ Strengths</h3>
          <div className="flex flex-wrap gap-2">
            {qualityData.strengths.map((strength, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
              >
                ✓ {strength}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {qualityData.suggestions && qualityData.suggestions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Suggestions for Improvement</h3>
          <div className="space-y-3">
            {qualityData.suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg"
              >
                <div className="flex items-start">
                  <span className="text-blue-600 mr-3 mt-1">💡</span>
                  <div className="flex-1">
                    <p className="text-gray-800">{suggestion}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="mt-6 pt-4 border-t">
        <button
          onClick={refreshQualityScore}
          disabled={loading}
          className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:bg-gray-50"
        >
          {loading ? '⏳ Analyzing...' : '🔄 Refresh Analysis'}
        </button>
      </div>

      {/* Info */}
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-xs text-yellow-800">
          💡 <strong>Tip:</strong> Quality scores update automatically as you edit. Aim for 8+ for court-ready documents!
        </p>
      </div>
    </div>
  );
}

export default QualityScoreDashboard;
