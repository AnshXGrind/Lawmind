import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import ValidationModal from '../components/ValidationModal';
import DraftAssistant from '../components/ai/DraftAssistant';
import SectionSuggester from '../components/ai/SectionSuggester';

const NewDraft = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedSections, setSelectedSections] = useState([]);
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
  
  // Section suggestions now handled by AI SectionSuggester component
  
  const addSection = (section) => {
    if (!selectedSections.find(s => s.section === section.section)) {
      setSelectedSections([...selectedSections, section]);
    }
  };
  
  const removeSection = (sectionToRemove) => {
    setSelectedSections(selectedSections.filter(s => s.section !== sectionToRemove.section));
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
      const parties = {};
      if (formData.petitioner) parties.petitioner = formData.petitioner;
      if (formData.respondent) parties.respondent = formData.respondent;

      const manualSections = formData.sections
        ? formData.sections.split(',').map(s => s.trim()).filter(s => s)
        : [];
      const allSections = [...selectedSections.map(s => s.section), ...manualSections];

      const requestData = {
        title: formData.title,
        document_type: formData.document_type,
        case_type: formData.case_type,
        court: formData.court || 'District Court',
        facts: formData.facts,
        parties,
        sections: allSections,
        relief_sought: formData.relief_sought,
        tone: formData.tone,
        additional_context: formData.additional_context,
      };

      const response = await api.post('/drafts/generate', requestData, { timeout: 90000 });
      const draft = response.data;

      navigate(`/draft/${draft.id}`);
    } catch (err) {
      const isTimeout = err.code === 'ECONNABORTED' || err.message?.includes('timeout');
      const isNetwork = !err.response;
      if (isTimeout || isNetwork) {
        setError('⏳ Backend is still waking up on Hugging Face. Please wait 30 seconds and try again.');
      } else {
        const detail = err.response?.data?.detail;
        setError(typeof detail === 'string' ? detail : 'Draft generation failed. Check your GEMINI_API_KEY in HF Space Settings → Variables and secrets.');
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

  const nd = {
    page: { minHeight: '100vh', background: '#fafaf8', fontFamily: "'DM Sans', sans-serif", padding: '40px 24px' },
    inner: { maxWidth: 780, margin: '0 auto' },
    heading: { fontFamily: "'Playfair Display', serif", fontSize: 'clamp(24px,4vw,34px)', fontWeight: 400, color: '#111', marginBottom: 4 },
    sub: { fontSize: 14, color: '#888', marginBottom: 32 },
    label: { display: 'block', fontSize: 12, fontWeight: 500, color: '#888', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' },
    input: { width: '100%', border: '1px solid #e8e8e4', borderRadius: 10, padding: '10px 14px', fontSize: 14, fontFamily: "'DM Sans', sans-serif", color: '#111', background: '#fff', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' },
    select: { width: '100%', border: '1px solid #e8e8e4', borderRadius: 10, padding: '10px 14px', fontSize: 14, fontFamily: "'DM Sans', sans-serif", color: '#111', background: '#fff', outline: 'none', boxSizing: 'border-box', appearance: 'none', cursor: 'pointer' },
    textarea: { width: '100%', border: '1px solid #e8e8e4', borderRadius: 10, padding: '10px 14px', fontSize: 14, fontFamily: "'DM Sans', sans-serif", color: '#111', background: '#fff', outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6 },
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 },
    field: { marginBottom: 20 },
    errBox: { background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 20 },
    submitBtn: { padding: '12px 28px', borderRadius: 100, background: '#111', color: '#fff', border: 'none', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'opacity 0.2s' },
    cancelBtn: { padding: '12px 24px', borderRadius: 100, background: '#fff', color: '#888', border: '1px solid #e8e8e4', fontSize: 14, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", marginLeft: 10 },
    card: { background: '#fff', border: '1px solid #e8e8e4', borderRadius: 14, padding: '24px', marginBottom: 20 },
    sectionChips: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 },
    chip: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 100, background: '#111', color: '#fff', fontSize: 12, fontFamily: "'DM Sans', sans-serif" },
    chipX: { background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: 0 },
  };

  return (
    <div style={nd.page}>
      <div style={nd.inner}>
        <h1 style={nd.heading}>Create New Legal Draft</h1>
        <p style={nd.sub}>AI-powered Indian legal document generation.</p>

        {!process.env.REACT_APP_GEMINI_API_KEY && (
          <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#856404', marginBottom: 20 }}>
            ⚠️ Gemini API key not found. Add <code>REACT_APP_GEMINI_API_KEY=your_key</code> to your <code>.env</code> file.{' '}
            Get a free key at{' '}
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">aistudio.google.com</a>
          </div>
        )}

        {error && <div style={nd.errBox}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Row 1: Document Type + Case Type */}
          <div style={nd.card}>
            <div style={nd.grid2}>
              <div style={nd.field}>
                <label style={nd.label}>Document Type *</label>
                <select name="document_type" value={formData.document_type} onChange={handleChange} style={nd.select} required>
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
              <div style={nd.field}>
                <label style={nd.label}>Case Type *</label>
                <select name="case_type" value={formData.case_type} onChange={handleChange} style={nd.select} required>
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

            {/* Court Name */}
            <div style={{...nd.field, position: 'relative'}}>
              <label style={nd.label}>Court Name *</label>
              <input
                type="text"
                name="court"
                value={formData.court}
                onChange={(e) => { setFormData({...formData, court: e.target.value}); setCourtSearch(e.target.value); setShowCourtDropdown(true); }}
                onFocus={() => setShowCourtDropdown(true)}
                placeholder="Search or type court name…"
                style={nd.input}
                required
              />
              {showCourtDropdown && filteredCourts.length > 0 && (
                <div style={{position:'absolute',zIndex:20,width:'100%',top:'100%',left:0,background:'#fff',border:'1px solid #e8e8e4',borderRadius:10,boxShadow:'0 8px 24px rgba(0,0,0,.08)',maxHeight:220,overflowY:'auto'}}>
                  {filteredCourts.slice(0,10).map((court,i) => (
                    <button key={i} type="button"
                      onClick={() => { setFormData({...formData, court}); setCourtSearch(court); setShowCourtDropdown(false); }}
                      style={{display:'block',width:'100%',textAlign:'left',padding:'10px 14px',fontSize:13,color:'#111',background:'none',border:'none',borderBottom:'1px solid #f0f0ec',cursor:'pointer'}}
                    >{court}</button>
                  ))}
                </div>
              )}
            </div>

            {/* Title */}
            <div style={nd.field}>
              <label style={nd.label}>Case/Document Title *</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange}
                placeholder="e.g., Petition for Injunction against Unlawful Eviction"
                style={nd.input} required />
            </div>

            {/* Parties */}
            <div style={nd.grid2}>
              <div style={nd.field}>
                <label style={nd.label}>Petitioner / Plaintiff</label>
                <input type="text" name="petitioner" value={formData.petitioner} onChange={handleChange}
                  placeholder="Name of petitioner" style={nd.input} />
              </div>
              <div style={nd.field}>
                <label style={nd.label}>Respondent / Defendant</label>
                <input type="text" name="respondent" value={formData.respondent} onChange={handleChange}
                  placeholder="Name of respondent" style={nd.input} />
              </div>
            </div>
          </div>

          {/* Facts + AI Draft Assistant */}
          <div style={nd.card}>
            <div style={nd.field}>
              <label style={nd.label}>Facts of the Case *</label>
              <textarea name="facts" value={formData.facts} onChange={handleChange}
                rows={6} placeholder="Describe the facts and circumstances of the case…"
                style={nd.textarea} required />
            </div>

            {/* AI Draft Assistant — live analysis */}
            <DraftAssistant
              facts={formData.facts}
              caseType={formData.case_type}
              documentType={formData.document_type}
            />
          </div>

          {/* Legal Sections — AI Suggester */}
          <div style={nd.card}>
            <label style={nd.label}>Applicable Legal Sections</label>

            {/* Selected section chips */}
            {selectedSections.length > 0 && (
              <div style={nd.sectionChips}>
                {selectedSections.map((s, i) => (
                  <span key={i} style={nd.chip}>
                    {s.section}
                    <button type="button" style={nd.chipX} onClick={() => removeSection(s)}>×</button>
                  </span>
                ))}
              </div>
            )}

            {/* AI-powered section suggester */}
            <SectionSuggester
              caseType={formData.case_type}
              documentType={formData.document_type}
              facts={formData.facts}
              onSelect={addSection}
              selected={selectedSections}
            />

            {/* Manual override */}
            <div style={{marginTop: 12}}>
              <input type="text" name="sections" value={formData.sections} onChange={handleChange}
                placeholder="Or type sections manually (comma-separated)"
                style={nd.input} />
            </div>
          </div>

          {/* Relief, Tone, Additional */}
          <div style={nd.card}>
            <div style={nd.field}>
              <label style={nd.label}>Relief Sought</label>
              <textarea name="relief_sought" value={formData.relief_sought} onChange={handleChange}
                rows={3} placeholder="What relief or remedy are you seeking?"
                style={nd.textarea} />
            </div>
            <div style={nd.grid2}>
              <div style={nd.field}>
                <label style={nd.label}>Legal Tone</label>
                <select name="tone" value={formData.tone} onChange={handleChange} style={nd.select}>
                  <option value="formal">Formal</option>
                  <option value="assertive">Assertive</option>
                  <option value="conciliatory">Conciliatory</option>
                  <option value="technical">Technical</option>
                </select>
              </div>
              <div style={nd.field}>
                <label style={nd.label}>Additional Context</label>
                <input type="text" name="additional_context" value={formData.additional_context}
                  onChange={handleChange} placeholder="Any special instructions…" style={nd.input} />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{display:'flex', alignItems:'center', paddingBottom: 40}}>
            <button type="submit" disabled={loading} style={{...nd.submitBtn, opacity: loading ? 0.6 : 1}}>
              {loading ? 'Generating…' : 'Generate Draft with AI'}
            </button>
            <button type="button" onClick={() => navigate('/dashboard')} style={nd.cancelBtn}>
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
  );
};

export default NewDraft;
