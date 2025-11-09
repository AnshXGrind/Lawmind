import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Mic, MicOff, Sparkles, BookOpen, Plus, X } from 'lucide-react';
import api from '../utils/api';
import ValidationModal from '../components/ValidationModal';

const NewDraft = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [sectionSuggestions, setSectionSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedSections, setSelectedSections] = useState([]);
  const suggestionsRef = useRef(null);
  const [showValidation, setShowValidation] = useState(false);
  const [courtSearch, setCourtSearch] = useState('');
  const [showCourtDropdown, setShowCourtDropdown] = useState(false);

  // Indian Courts List
  const indianCourts = [
    // Supreme Court
    'Supreme Court of India',
    // High Courts (28)
    'Allahabad High Court',
    'Andhra Pradesh High Court',
    'Bombay High Court',
    'Calcutta High Court',
    'Chhattisgarh High Court',
    'Delhi High Court',
    'Gauhati High Court',
    'Gujarat High Court',
    'Himachal Pradesh High Court',
    'Jammu and Kashmir High Court',
    'Jharkhand High Court',
    'Karnataka High Court',
    'Kerala High Court',
    'Madhya Pradesh High Court',
    'Madras High Court',
    'Manipur High Court',
    'Meghalaya High Court',
    'Orissa High Court',
    'Patna High Court',
    'Punjab and Haryana High Court',
    'Rajasthan High Court',
    'Sikkim High Court',
    'Telangana High Court',
    'Tripura High Court',
    'Uttarakhand High Court',
    // Common District Courts
    'District Court',
    'Sessions Court',
    'Civil Court',
    'Family Court',
    'Consumer Court',
    'Labour Court',
    'Revenue Court',
    // Tribunals
    'National Green Tribunal',
    'Central Administrative Tribunal',
    'Income Tax Appellate Tribunal',
    'National Company Law Tribunal',
    'Debt Recovery Tribunal',
    'Armed Forces Tribunal'
  ];

  const filteredCourts = indianCourts.filter(court =>
    court.toLowerCase().includes(courtSearch.toLowerCase())
  );

  const [formData, setFormData] = useState({
    document_type: 'petition',
    case_type: 'civil',
    court: '',
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
  
  // Fetch section suggestions when document type, case type, or facts change
  const fetchSectionSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const response = await api.post('/drafts/suggest-sections', null, {
        params: {
          document_type: formData.document_type,
          case_type: formData.case_type,
          facts: formData.facts || ''
        }
      });
      setSectionSuggestions(response.data.suggestions || []);
    } catch (err) {
      console.error('Failed to fetch suggestions:', err);
      setSectionSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };
  
  useEffect(() => {
    if (formData.document_type && formData.case_type) {
      fetchSectionSuggestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.document_type, formData.case_type, formData.facts]);
  
  const addSection = (section) => {
    if (!selectedSections.find(s => s.section === section.section)) {
      setSelectedSections([...selectedSections, section]);
    }
    setShowSuggestions(false);
  };
  
  const removeSection = (sectionToRemove) => {
    setSelectedSections(selectedSections.filter(s => s.section !== sectionToRemove.section));
  };
  
  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleVoiceInput = () => {
    // TODO: Implement voice input using Web Speech API or similar
    setIsRecording(!isRecording);
    alert('Voice input feature coming soon!');
  };

  const handleSubmit = async (e, skipValidation = false) => {
    e.preventDefault();
    
    // Show validation modal first (unless skipped)
    if (!skipValidation) {
      setShowValidation(true);
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Prepare parties object
      const parties = {};
      if (formData.petitioner) parties.petitioner = formData.petitioner;
      if (formData.respondent) parties.respondent = formData.respondent;

      // Prepare sections array - combine selected sections and manual input
      const manualSections = formData.sections
        ? formData.sections.split(',').map(s => s.trim()).filter(s => s)
        : [];
      const allSections = [...selectedSections.map(s => s.section), ...manualSections];

      const requestData = {
        document_type: formData.document_type,
        case_type: formData.case_type,
        court: formData.court,
        title: formData.title,
        facts: formData.facts,
        parties: parties,
        sections: allSections,
        relief_sought: formData.relief_sought || null,
        tone: formData.tone,
        additional_context: formData.additional_context || null
      };

      const response = await api.post('/drafts/generate', requestData);
      navigate(`/draft/${response.data.id}`);
    } catch (err) {
      // Handle error - detail can be string or array of validation errors
      const errorDetail = err.response?.data?.detail;
      if (Array.isArray(errorDetail)) {
        setError(errorDetail.map(e => e.msg).join(', '));
      } else if (typeof errorDetail === 'string') {
        setError(errorDetail);
      } else {
        setError('Failed to generate draft');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleValidationComplete = (proceed) => {
    setShowValidation(false);
    if (proceed) {
      // Create a synthetic event to pass to handleSubmit
      const syntheticEvent = { preventDefault: () => {} };
      handleSubmit(syntheticEvent, true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-amber-400 to-amber-600 rounded-xl shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
                  Create New Legal Draft
                </h1>
                <p className="text-sm text-blue-200">AI-Powered Legal Document Generation</p>
              </div>
            </div>
            <button
              onClick={handleVoiceInput}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition shadow-lg ${
                isRecording
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur'
              }`}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              <span>{isRecording ? 'Stop Recording' : 'Voice Input'}</span>
            </button>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6 backdrop-blur">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Document Type and Case Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Document Type <span className="text-red-400">*</span>
                </label>
                <select
                  name="document_type"
                  value={formData.document_type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white backdrop-blur"
                  required
                >
                  <option value="petition" className="bg-slate-800">Petition</option>
                  <option value="notice" className="bg-slate-800">Notice</option>
                  <option value="affidavit" className="bg-slate-800">Affidavit</option>
                  <option value="contract" className="bg-slate-800">Contract</option>
                  <option value="agreement" className="bg-slate-800">Agreement</option>
                  <option value="reply" className="bg-slate-800">Reply</option>
                  <option value="application" className="bg-slate-800">Application</option>
                  <option value="appeal" className="bg-slate-800">Appeal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Case Type <span className="text-red-400">*</span>
                </label>
                <select
                  name="case_type"
                  value={formData.case_type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white backdrop-blur"
                  required
                >
                  <option value="civil" className="bg-slate-800">Civil</option>
                  <option value="criminal" className="bg-slate-800">Criminal</option>
                  <option value="corporate" className="bg-slate-800">Corporate</option>
                  <option value="family" className="bg-slate-800">Family</option>
                  <option value="tax" className="bg-slate-800">Tax</option>
                  <option value="property" className="bg-slate-800">Property</option>
                  <option value="labour" className="bg-slate-800">Labour</option>
                  <option value="constitutional" className="bg-slate-800">Constitutional</option>
                </select>
              </div>
            </div>

            {/* Court Level */}
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Court Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="court"
                  value={formData.court}
                  onChange={(e) => {
                    setFormData({ ...formData, court: e.target.value });
                    setCourtSearch(e.target.value);
                    setShowCourtDropdown(true);
                  }}
                  onFocus={() => setShowCourtDropdown(true)}
                  placeholder="Search or type court name..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white placeholder-gray-400 backdrop-blur"
                  required
                />
                
                {/* Court Dropdown */}
                {showCourtDropdown && filteredCourts.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto">
                    {filteredCourts.slice(0, 10).map((court, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, court });
                          setCourtSearch(court);
                          setShowCourtDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 text-gray-800 text-sm border-b border-gray-100 last:border-b-0 transition"
                      >
                        {court}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Case/Document Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Petition for Injunction against Unlawful Eviction"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white placeholder-gray-400 backdrop-blur"
                required
              />
            </div>

            {/* Parties */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Petitioner/Plaintiff
                </label>
                <input
                  type="text"
                  name="petitioner"
                  value={formData.petitioner}
                  onChange={handleChange}
                  placeholder="Name of petitioner"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white placeholder-gray-400 backdrop-blur"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Respondent/Defendant
                </label>
                <input
                  type="text"
                  name="respondent"
                  value={formData.respondent}
                  onChange={handleChange}
                  placeholder="Name of respondent"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white placeholder-gray-400 backdrop-blur"
                />
              </div>
            </div>

            {/* Facts */}
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Facts of the Case <span className="text-red-400">*</span>
              </label>
              <textarea
                name="facts"
                value={formData.facts}
                onChange={handleChange}
                rows={6}
                placeholder="Describe the facts and circumstances of the case..."
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white placeholder-gray-400 backdrop-blur"
                required
              />
            </div>

            {/* Legal Sections with AI Suggestions */}
            <div className="relative" ref={suggestionsRef}>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-blue-200">
                  Applicable Legal Sections
                </label>
                <button
                  type="button"
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  className="flex items-center space-x-1 text-sm text-amber-400 hover:text-amber-300 font-medium transition"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Get AI Suggestions</span>
                </button>
              </div>
              
              {/* Selected Sections Pills */}
              {selectedSections.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3 p-3 bg-amber-500/20 rounded-lg border border-amber-500/30 backdrop-blur">
                  {selectedSections.map((section, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-full border border-amber-400/50 text-sm backdrop-blur"
                    >
                      <BookOpen className="w-3 h-3 text-amber-400" />
                      <span className="font-medium text-white">{section.section}</span>
                      <button
                        type="button"
                        onClick={() => removeSection(section)}
                        className="text-gray-300 hover:text-red-400 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <input
                type="text"
                name="sections"
                value={formData.sections}
                onChange={handleChange}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Type manually or select from suggestions (comma-separated)"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white placeholder-gray-400 backdrop-blur"
              />
              
              {/* AI Suggestions Dropdown */}
              {showSuggestions && (
                <div className="absolute z-10 w-full mt-2 bg-slate-800 rounded-lg shadow-2xl border border-amber-500/30 max-h-96 overflow-y-auto backdrop-blur-xl">
                  <div className="p-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-b border-amber-500/30">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <h3 className="text-sm font-semibold text-white">
                        Suggested Legal Sections
                      </h3>
                    </div>
                    <p className="text-xs text-blue-200 mt-1">
                      Based on {formData.case_type} case • {formData.document_type}
                    </p>
                  </div>
                  
                  {loadingSuggestions ? (
                    <div className="p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
                      <p className="text-sm text-blue-200 mt-2">Loading suggestions...</p>
                    </div>
                  ) : sectionSuggestions.length > 0 ? (
                    <div className="divide-y divide-white/10">
                      {sectionSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => addSection(suggestion)}
                          className="w-full p-3 hover:bg-amber-500/20 text-left transition group"
                        >
                          <div className="flex items-start space-x-3">
                            <Plus className="w-4 h-4 text-amber-400 mt-1 group-hover:scale-110 transition" />
                            <div className="flex-1">
                              <p className="font-semibold text-white text-sm group-hover:text-amber-400 transition">
                                {suggestion.section}
                              </p>
                              <p className="text-xs text-gray-300 mt-1">
                                {suggestion.description}
                              </p>
                              <p className="text-xs text-amber-400 mt-1 font-medium">
                                {suggestion.act}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-400">
                      <BookOpen className="w-12 h-12 mx-auto text-gray-600 mb-2" />
                      <p className="text-sm">No suggestions available</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Fill in case type and facts for better suggestions
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Relief Sought */}
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Relief Sought
              </label>
              <textarea
                name="relief_sought"
                value={formData.relief_sought}
                onChange={handleChange}
                rows={3}
                placeholder="What relief or remedy are you seeking?"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white placeholder-gray-400 backdrop-blur"
              />
            </div>

            {/* Tone and Additional Context */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Legal Tone
                </label>
                <select
                  name="tone"
                  value={formData.tone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white backdrop-blur"
                >
                  <option value="formal" className="bg-slate-800">Formal</option>
                  <option value="assertive" className="bg-slate-800">Assertive</option>
                  <option value="conciliatory" className="bg-slate-800">Conciliatory</option>
                  <option value="technical" className="bg-slate-800">Technical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Additional Context
                </label>
                <input
                  type="text"
                  name="additional_context"
                  value={formData.additional_context}
                  onChange={handleChange}
                  placeholder="Any special instructions..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white placeholder-gray-400 backdrop-blur"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-4 px-6 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg transform hover:scale-[1.02]"
              >
                {loading ? (
                  <span className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Generating Draft with AI...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center space-x-2">
                    <Sparkles className="w-5 h-5" />
                    <span>Generate Draft with AI</span>
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-8 py-4 border-2 border-white/20 text-white font-semibold rounded-lg hover:bg-white/10 transition backdrop-blur"
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Validation Modal */}
          <ValidationModal
            isOpen={showValidation}
            onClose={() => setShowValidation(false)}
            formData={formData}
            onValidationComplete={handleValidationComplete}
          />
        </div>
      </div>
    </div>
  );
};

export default NewDraft;
