import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Download, Lightbulb, FileText, BookOpen } from 'lucide-react';
import api from '../utils/api';

const DraftEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [draft, setDraft] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchDraft();
  }, [id]);

  const fetchDraft = async () => {
    try {
      const response = await api.get(`/drafts/${id}`);
      setDraft(response.data);
      setContent(response.data.content);
    } catch (err) {
      console.error(err);
      alert('Failed to load draft');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/drafts/${id}`, content, {
        headers: { 'Content-Type': 'application/json' },
        params: { content }
      });
      alert('Draft saved successfully!');
    } catch (err) {
      alert('Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const response = await api.post('/documents/export', {
        draft_id: parseInt(id),
        format: format,
        include_watermark: true
      });
      alert(`Draft exported as ${format.toUpperCase()} successfully!`);
    } catch (err) {
      alert('Failed to export draft');
    }
  };

  const handleAiAction = async (action) => {
    setAiLoading(true);
    setAiResult('');
    
    try {
      const response = await api.post('/drafts/edit', {
        draft_id: parseInt(id),
        action: action,
        selected_text: selectedText || content,
        context: ''
      });

      if (response.data.suggestions) {
        setAiResult(response.data.suggestions.join('\n\n'));
      } else {
        setAiResult(response.data.result);
      }
      
      setShowAiPanel(true);
    } catch (err) {
      alert('AI action failed');
    } finally {
      setAiLoading(false);
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection().toString();
    if (selection) {
      setSelectedText(selection);
      setShowAiPanel(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading draft...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{draft?.title}</h1>
              <p className="text-sm text-gray-600">
                {draft?.document_type} • {draft?.case_type}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleAiAction('improve')}
                disabled={aiLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                <Lightbulb className="w-4 h-4" />
                <span>AI Suggestions</span>
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save'}</span>
              </button>

              <div className="relative group">
                <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg hidden group-hover:block">
                  <button
                    onClick={() => handleExport('pdf')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Export as PDF
                  </button>
                  <button
                    onClick={() => handleExport('docx')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Export as DOCX
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Editor */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onMouseUp={handleTextSelection}
                className="w-full h-[70vh] p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-serif text-base leading-relaxed"
                style={{ resize: 'none' }}
              />
            </div>
          </div>

          {/* AI Assistant Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                <span>AI Assistant</span>
              </h2>

              {selectedText && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Selected Text:</p>
                  <p className="text-sm text-gray-800 italic line-clamp-3">
                    "{selectedText}"
                  </p>
                </div>
              )}

              <div className="space-y-2 mb-6">
                <button
                  onClick={() => handleAiAction('explain')}
                  disabled={aiLoading}
                  className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm font-medium"
                >
                  Explain Section
                </button>
                <button
                  onClick={() => handleAiAction('simplify')}
                  disabled={aiLoading}
                  className="w-full px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition text-sm font-medium"
                >
                  Simplify Language
                </button>
                <button
                  onClick={() => handleAiAction('rephrase')}
                  disabled={aiLoading}
                  className="w-full px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition text-sm font-medium"
                >
                  Rephrase Legally
                </button>
                <button
                  onClick={() => handleAiAction('add_citation')}
                  disabled={aiLoading}
                  className="w-full px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition text-sm font-medium"
                >
                  Find Citations
                </button>
              </div>

              {aiLoading && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">AI Processing...</p>
                </div>
              )}

              {aiResult && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">AI Result:</h3>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">
                    {aiResult}
                  </div>
                </div>
              )}

              {/* Citations */}
              {draft?.citations && draft.citations.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center space-x-2">
                    <BookOpen className="w-4 h-4" />
                    <span>Suggested Citations</span>
                  </h3>
                  <div className="space-y-2">
                    {draft.citations.map((citation, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                        <p className="font-semibold text-gray-900">{citation.title}</p>
                        <p className="text-gray-600">{citation.citation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraftEditor;
