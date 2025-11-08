import React, { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function ValidationModal({ isOpen, onClose, formData, onValidationComplete }) {
  const [validationResult, setValidationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    const validateDraft = async () => {
      setLoading(true);
      setError('');

      try {
        const token = localStorage.getItem('lawmind_token');
        const response = await axios.post(
          `${API_URL}/api/drafts/validate-draft`,
          {
            document_type: formData.document_type || 'petition',
            provided_data: formData,
          },
          {
            headers: { 'Authorization': `Bearer ${token}` },
          }
        );

        setValidationResult(response.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Validation failed');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && formData) {
      validateDraft();
    }
  }, [isOpen, formData]);

  if (!isOpen) return null;

  const getPriorityBadge = (priority) => {
    const styles = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800',
    };
    const icons = {
      high: '🔴',
      medium: '🟡',
      low: '🔵',
    };
    return { style: styles[priority] || styles.low, icon: icons[priority] || icons.low };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">✅ Draft Validation</h2>
              <p className="text-sm text-gray-600 mt-1">
                Missing information and recommendations
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✖
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin text-6xl mb-4">🔄</div>
              <p className="text-gray-600">Validating your draft...</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              ⚠️ {error}
            </div>
          )}

          {!loading && validationResult && (
            <>
              {/* Status Badge */}
              <div className="mb-6">
                {validationResult.validation_status === 'complete' ? (
                  <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">✅</span>
                      <div>
                        <h3 className="font-semibold text-green-900">All Set!</h3>
                        <p className="text-sm text-green-700">
                          Your draft has all required information.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">⚠️</span>
                      <div>
                        <h3 className="font-semibold text-yellow-900">Action Needed</h3>
                        <p className="text-sm text-yellow-700">
                          {validationResult.missing_fields?.length || 0} fields need attention
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Missing Fields */}
              {validationResult.missing_fields && validationResult.missing_fields.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    📋 Missing Information
                  </h3>
                  <div className="space-y-3">
                    {validationResult.missing_fields.map((field, index) => {
                      const badge = getPriorityBadge(field.priority);
                      return (
                        <div
                          key={index}
                          className="p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.style}`}>
                                  {badge.icon} {field.priority?.toUpperCase() || 'MEDIUM'}
                                </span>
                                <span className="text-sm font-semibold text-gray-700">
                                  {field.field}
                                </span>
                              </div>
                              <p className="text-gray-800 font-medium mb-1">
                                {field.question}
                              </p>
                              {field.suggestion && (
                                <p className="text-sm text-gray-600 italic">
                                  💡 {field.suggestion}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Interactive Prompts */}
              {validationResult.interactive_prompts && validationResult.interactive_prompts.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    💬 Smart Suggestions
                  </h3>
                  <div className="space-y-3">
                    {validationResult.interactive_prompts.map((prompt, index) => (
                      <div
                        key={index}
                        className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg"
                      >
                        <p className="text-gray-800">{prompt}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips */}
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <h4 className="font-semibold text-indigo-900 mb-2">💡 Pro Tips</h4>
                <ul className="text-sm text-indigo-800 space-y-1">
                  <li>• Fill high-priority fields first for better results</li>
                  <li>• Use specific dates and section numbers when available</li>
                  <li>• Include all party names for accurate drafting</li>
                  <li>• Review suggestions before generating the final draft</li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 rounded-b-2xl">
          <div className="flex gap-3">
            {validationResult?.validation_status === 'complete' ? (
              <button
                onClick={() => onValidationComplete(true)}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                ✨ Proceed to Generate
              </button>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  📝 Add Missing Info
                </button>
                <button
                  onClick={() => onValidationComplete(false)}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  ⚡ Generate Anyway
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
