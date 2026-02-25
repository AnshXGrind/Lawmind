import React, { useState, useEffect } from 'react';

// Pure JS validation — no backend required
function validateDraftData(formData) {
  const issues = [];

  if (!formData.title || formData.title.trim().length < 5) {
    issues.push({ field: 'Title', question: 'What is the case/document title?', suggestion: 'E.g., "Petition for Injunction in Property Dispute"', priority: 'high' });
  }

  const wordCount = (formData.facts || '').trim().split(/\s+/).filter(Boolean).length;
  if (wordCount < 30) {
    issues.push({ field: 'Facts', question: 'Can you describe the case facts in more detail?', suggestion: `Currently ${wordCount} words. Aim for at least 50 words for a stronger draft.`, priority: 'high' });
  } else if (wordCount < 80) {
    issues.push({ field: 'Facts', question: 'Consider adding more case details', suggestion: `Currently ${wordCount} words. More facts lead to a better draft.`, priority: 'medium' });
  }

  if (!formData.petitioner && !formData.parties?.petitioner) {
    issues.push({ field: 'Petitioner', question: 'Who is the petitioner / plaintiff?', suggestion: 'Full name of the filing party', priority: 'medium' });
  }

  if (!formData.respondent && !formData.parties?.respondent) {
    issues.push({ field: 'Respondent', question: 'Who is the respondent / defendant?', suggestion: 'Full name of the opposing party', priority: 'medium' });
  }

  if (!formData.court || formData.court.trim() === '') {
    issues.push({ field: 'Court', question: 'Which court will this be filed in?', suggestion: 'E.g., "Delhi High Court" or "District Court"', priority: 'high' });
  }

  if (!formData.relief_sought || formData.relief_sought.trim() === '') {
    issues.push({ field: 'Relief Sought', question: 'What relief or remedy are you seeking?', suggestion: 'Describe the specific outcome you want the court to grant', priority: 'low' });
  }

  return {
    validation_status: issues.filter(i => i.priority === 'high').length === 0 ? 'complete' : 'incomplete',
    missing_fields: issues,
    interactive_prompts: issues.length === 0
      ? ['Your draft looks well-prepared! Proceed to generate.']
      : ['Fill in the highlighted fields for a stronger draft.'],
  };
}

function ValidationModal({ isOpen, onClose, formData, onValidationComplete }) {
  const [validationResult, setValidationResult] = useState(null);

  useEffect(() => {
    if (isOpen && formData) {
      setValidationResult(validateDraftData(formData));
    }
  }, [isOpen, formData]);

  if (!isOpen) return null;

  const getPriorityBadge = (priority) => {
    const styles = { high: 'bg-red-100 text-red-800', medium: 'bg-yellow-100 text-yellow-800', low: 'bg-blue-100 text-blue-800' };
    const icons = { high: 'R', medium: 'Y', low: 'B' };
    return { style: styles[priority] || styles.low, icon: icons[priority] || icons.low };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Draft Validation</h2>
              <p className="text-sm text-gray-600 mt-1">Missing information and recommendations</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">X</button>
          </div>
        </div>

        <div className="p-6">
          {validationResult && (
            <>
              <div className="mb-6">
                {validationResult.validation_status === 'complete' ? (
                  <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                    <h3 className="font-semibold text-green-900">All Set! Your draft has all required information.</h3>
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg">
                    <h3 className="font-semibold text-yellow-900">Action Needed: {validationResult.missing_fields?.length || 0} fields need attention</h3>
                  </div>
                )}
              </div>

              {validationResult.missing_fields && validationResult.missing_fields.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Missing Information</h3>
                  <div className="space-y-3">
                    {validationResult.missing_fields.map((field, index) => {
                      const badge = getPriorityBadge(field.priority);
                      return (
                        <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.style}`}>
                              {field.priority?.toUpperCase() || 'MEDIUM'}
                            </span>
                            <span className="text-sm font-semibold text-gray-700">{field.field}</span>
                          </div>
                          <p className="text-gray-800 font-medium mb-1">{field.question}</p>
                          {field.suggestion && (
                            <p className="text-sm text-gray-600 italic">Tip: {field.suggestion}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <h4 className="font-semibold text-indigo-900 mb-2">Pro Tips</h4>
                <ul className="text-sm text-indigo-800 space-y-1">
                  <li>Fill high-priority fields first for better results</li>
                  <li>Use specific dates and section numbers when available</li>
                  <li>Include all party names for accurate drafting</li>
                </ul>
              </div>
            </>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 rounded-b-2xl">
          <div className="flex gap-3">
            {validationResult?.validation_status === 'complete' ? (
              <button
                onClick={() => onValidationComplete(true)}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Proceed to Generate
              </button>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Add Missing Info
                </button>
                <button
                  onClick={() => onValidationComplete(true)}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Generate Anyway
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ValidationModal;
