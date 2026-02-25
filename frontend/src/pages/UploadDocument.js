import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

function UploadDocument() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [uploadedDoc, setUploadedDoc] = useState(null);
  const [error, setError] = useState('');

  // Handle drag events
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  // Handle drop event
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  // Handle file input change
  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // Validate and set file
  const handleFile = (selectedFile) => {
    const validTypes = ['text/plain', 'application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (selectedFile.size > maxSize) {
      setError('File size exceeds 10MB limit.');
      return;
    }

    setFile(selectedFile);
    setError('');
  };

  // Read file and redirect to analyser
  const handleUpload = () => {
    if (!file) return;
    setUploading(true);
    setError('');

    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target.result;
        sessionStorage.setItem('lawmind_analyse_text', text);
        setUploading(false);
        navigate('/analyse');
      };
      reader.onerror = () => {
        setError('Failed to read file.');
        setUploading(false);
      };
      reader.readAsText(file);
    } else {
      // Non-text files: show instructions to copy-paste text
      setUploading(false);
      setUploadedDoc({ name: file.name, type: file.type, note: 'non-text' });
    }
  };

  const handleCreateDraft = () => {
    navigate('/analyse');
  };

  // Reset
  const handleReset = () => {
    setFile(null);
    setUploadedDoc(null);
    setUploading(false);
    setProcessing(false);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📄 Auto Case Extractor
          </h1>
          <p className="text-gray-600">
            Upload FIR, chargesheet, or legal documents to auto-extract case information
          </p>
        </div>

        {/* Upload Area */}
        {!uploadedDoc && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div
              className={`border-3 border-dashed rounded-xl p-12 text-center transition-all ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 bg-gray-50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {!file ? (
                <>
                  <div className="text-6xl mb-4">📤</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Drag & Drop Your Document
                  </h3>
                  <p className="text-gray-500 mb-4">
                    or click to browse
                  </p>
                  <input
                    type="file"
                    onChange={handleChange}
                    accept=".txt,.pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                  >
                    Choose File
                  </label>
                  <p className="text-sm text-gray-400 mt-4">
                    Supported: TXT (direct), PDF/JPEG/PNG (paste text in Analyser) · Max 10MB
                  </p>
                </>
              ) : (
                <>
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    {file.name}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                    >
                      {uploading ? '⏳ Uploading...' : '🚀 Upload & Extract'}
                    </button>
                    <button
                      onClick={handleReset}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      ✖ Cancel
                    </button>
                  </div>
                </>
              )}
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                ⚠️ {error}
              </div>
            )}
          </div>
        )}

        {/* Processing Indicator */}
        {processing && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="text-center">
              <div className="inline-block animate-spin text-6xl mb-4">🔄</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Processing Document...
              </h3>
              <p className="text-gray-500">
                Extracting text and case information using OCR
              </p>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Non-text file guidance */}
        {uploadedDoc && uploadedDoc.note === 'non-text' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">📋</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">PDF / Image Uploaded</h2>
              <p className="text-gray-600">File: <strong>{uploadedDoc.name}</strong></p>
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl mb-6">
              <p className="text-yellow-800 font-medium mb-1">⚠️ OCR requires a backend service</p>
              <p className="text-yellow-700 text-sm">This offline version cannot extract text from PDFs or images automatically. Please open your document, copy the text, and paste it in the Document Analyser.</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/analyse')}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                📝 Open Document Analyser
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                ↩ Try Another File
              </button>
            </div>
          </div>
        )}

        {/* Extracted Data Display (legacy, kept for compat) */}
        {uploadedDoc && uploadedDoc.processing_status === 'completed' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Header with confidence score */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  ✅ Extraction Complete
                </h2>
                <p className="text-gray-600">{uploadedDoc.filename}</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">OCR Confidence</div>
                <div className={`text-3xl font-bold ${
                  uploadedDoc.ocr_confidence >= 80 ? 'text-green-600' :
                  uploadedDoc.ocr_confidence >= 60 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {uploadedDoc.ocr_confidence}%
                </div>
              </div>
            </div>

            {/* Extracted Fields */}
            {uploadedDoc.extracted_data && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {uploadedDoc.extracted_data.petitioner_name && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm font-semibold text-blue-700 mb-1">Petitioner</div>
                    <div className="text-gray-900">{uploadedDoc.extracted_data.petitioner_name}</div>
                  </div>
                )}
                {uploadedDoc.extracted_data.respondent_name && (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-sm font-semibold text-purple-700 mb-1">Respondent</div>
                    <div className="text-gray-900">{uploadedDoc.extracted_data.respondent_name}</div>
                  </div>
                )}
                {uploadedDoc.extracted_data.fir_number && (
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="text-sm font-semibold text-red-700 mb-1">FIR Number</div>
                    <div className="text-gray-900">{uploadedDoc.extracted_data.fir_number}</div>
                  </div>
                )}
                {uploadedDoc.extracted_data.sections && uploadedDoc.extracted_data.sections.length > 0 && (
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="text-sm font-semibold text-orange-700 mb-1">Sections</div>
                    <div className="text-gray-900">
                      {uploadedDoc.extracted_data.sections.join(', ')}
                    </div>
                  </div>
                )}
                {uploadedDoc.extracted_data.date && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-sm font-semibold text-green-700 mb-1">Date</div>
                    <div className="text-gray-900">{uploadedDoc.extracted_data.date}</div>
                  </div>
                )}
                {uploadedDoc.extracted_data.place && (
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <div className="text-sm font-semibold text-indigo-700 mb-1">Place</div>
                    <div className="text-gray-900">{uploadedDoc.extracted_data.place}</div>
                  </div>
                )}
              </div>
            )}

            {/* Extracted Text Preview */}
            {uploadedDoc.extracted_text && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Extracted Text</h3>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-64 overflow-y-auto">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                    {uploadedDoc.extracted_text.substring(0, 1000)}
                    {uploadedDoc.extracted_text.length > 1000 && '...\n(truncated)'}
                  </pre>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleCreateDraft}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                ✨ Auto-Generate Draft
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                📤 Upload Another
              </button>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">💡 How It Works</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Upload a <strong>.txt</strong> legal document — it opens instantly in the Analyser</li>
            <li>• For PDF / image files, copy the text and paste it in Document Analyser</li>
            <li>• The Analyser uses Gemini AI to extract case details, draft sections, and citations</li>
            <li>• Works 100% offline — no backend required!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default UploadDocument;
