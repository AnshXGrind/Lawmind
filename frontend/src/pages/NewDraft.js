import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Mic, MicOff } from 'lucide-react';
import api from '../utils/api';

const NewDraft = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const [formData, setFormData] = useState({
    document_type: 'petition',
    case_type: 'civil',
    court: 'district',
    title: '',
    facts: '',
    petitioner: '',
    respondent: '',
    sections: '',
    relief_sought: '',
    tone: 'formal',
    additional_context: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleVoiceInput = () => {
    // TODO: Implement voice input using Web Speech API or similar
    setIsRecording(!isRecording);
    alert('Voice input feature coming soon!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Prepare parties object
      const parties = {};
      if (formData.petitioner) parties.petitioner = formData.petitioner;
      if (formData.respondent) parties.respondent = formData.respondent;

      // Prepare sections array
      const sections = formData.sections
        ? formData.sections.split(',').map(s => s.trim()).filter(s => s)
        : [];

      const requestData = {
        document_type: formData.document_type,
        case_type: formData.case_type,
        court: formData.court,
        title: formData.title,
        facts: formData.facts,
        parties: parties,
        sections: sections,
        relief_sought: formData.relief_sought || null,
        tone: formData.tone,
        additional_context: formData.additional_context || null
      };

      const response = await api.post('/drafts/generate', requestData);
      navigate(`/draft/${response.data.id}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate draft');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Create New Legal Draft</h1>
            </div>
            <button
              onClick={handleVoiceInput}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                isRecording
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              <span>{isRecording ? 'Stop Recording' : 'Voice Input'}</span>
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Document Type and Case Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Type *
                </label>
                <select
                  name="document_type"
                  value={formData.document_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="petition">Petition</option>
                  <option value="notice">Notice</option>
                  <option value="affidavit">Affidavit</option>
                  <option value="contract">Contract</option>
                  <option value="agreement">Agreement</option>
                  <option value="reply">Reply</option>
                  <option value="application">Application</option>
                  <option value="appeal">Appeal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Case Type *
                </label>
                <select
                  name="case_type"
                  value={formData.case_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="civil">Civil</option>
                  <option value="criminal">Criminal</option>
                  <option value="corporate">Corporate</option>
                  <option value="family">Family</option>
                  <option value="tax">Tax</option>
                  <option value="property">Property</option>
                  <option value="labour">Labour</option>
                  <option value="constitutional">Constitutional</option>
                </select>
              </div>
            </div>

            {/* Court Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Court Level *
              </label>
              <select
                name="court"
                value={formData.court}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="district">District Court</option>
                <option value="high_court">High Court</option>
                <option value="supreme_court">Supreme Court</option>
                <option value="tribunal">Tribunal</option>
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Case/Document Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Petition for Injunction against Unlawful Eviction"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Parties */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Petitioner/Plaintiff
                </label>
                <input
                  type="text"
                  name="petitioner"
                  value={formData.petitioner}
                  onChange={handleChange}
                  placeholder="Name of petitioner"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Respondent/Defendant
                </label>
                <input
                  type="text"
                  name="respondent"
                  value={formData.respondent}
                  onChange={handleChange}
                  placeholder="Name of respondent"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Facts */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facts of the Case *
              </label>
              <textarea
                name="facts"
                value={formData.facts}
                onChange={handleChange}
                rows={6}
                placeholder="Describe the facts and circumstances of the case..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Legal Sections */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Applicable Legal Sections
              </label>
              <input
                type="text"
                name="sections"
                value={formData.sections}
                onChange={handleChange}
                placeholder="e.g., IPC Section 420, Contract Act Section 10 (comma-separated)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Relief Sought */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Relief Sought
              </label>
              <textarea
                name="relief_sought"
                value={formData.relief_sought}
                onChange={handleChange}
                rows={3}
                placeholder="What relief or remedy are you seeking?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Tone and Additional Context */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Legal Tone
                </label>
                <select
                  name="tone"
                  value={formData.tone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="formal">Formal</option>
                  <option value="assertive">Assertive</option>
                  <option value="conciliatory">Conciliatory</option>
                  <option value="technical">Technical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Context
                </label>
                <input
                  type="text"
                  name="additional_context"
                  value={formData.additional_context}
                  onChange={handleChange}
                  placeholder="Any special instructions..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-6 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Generating Draft...' : 'Generate Draft with AI'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewDraft;
