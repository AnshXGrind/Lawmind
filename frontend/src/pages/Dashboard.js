import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Calendar, Trash2, TrendingUp, Clock, Award, Sparkles } from 'lucide-react';
import api from '../utils/api';

const Dashboard = () => {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      const response = await api.get('/drafts/');
      setDrafts(response.data);
    } catch (err) {
      setError('Failed to load drafts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this draft?')) {
      try {
        await api.delete(`/drafts/${id}`);
        setDrafts(drafts.filter(draft => draft.id !== id));
      } catch (err) {
        alert('Failed to delete draft');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading drafts...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Stats Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center">
                <Sparkles className="w-8 h-8 mr-3 text-amber-400" />
                Your Legal Workspace
              </h1>
              <p className="text-blue-200 text-lg">Manage and create professional legal documents</p>
            </div>
            <button
              onClick={() => navigate('/draft/new')}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition duration-200 font-semibold"
            >
              <Plus className="w-5 h-5" />
              <span>Create New Draft</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm font-medium">Total Drafts</p>
                  <p className="text-3xl font-bold mt-1">{drafts.length}</p>
                </div>
                <div className="bg-amber-500/20 p-3 rounded-lg">
                  <FileText className="w-6 h-6 text-amber-400" />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm font-medium">This Month</p>
                  <p className="text-3xl font-bold mt-1">
                    {drafts.filter(d => {
                      const created = new Date(d.created_at);
                      const now = new Date();
                      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                </div>
                <div className="bg-green-500/20 p-3 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm font-medium">Recent Activity</p>
                  <p className="text-3xl font-bold mt-1">
                    {drafts.length > 0 ? formatDate(drafts[0]?.created_at || new Date()) : '-'}
                  </p>
                </div>
                <div className="bg-blue-500/20 p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm font-medium">Pro Member</p>
                  <p className="text-lg font-bold mt-1">Active</p>
                </div>
                <div className="bg-purple-500/20 p-3 rounded-lg">
                  <Award className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-r-xl shadow-sm mb-6">
            <p className="font-medium">Error Loading Drafts</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {drafts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-16 text-center border border-gray-100">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Start Your Legal Journey</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Create your first AI-powered legal document and experience the future of legal drafting
            </p>
            <button
              onClick={() => navigate('/draft/new')}
              className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition duration-200 font-semibold"
            >
              <Plus className="w-5 h-5" />
              <span>Create Your First Draft</span>
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Your Documents</h2>
              <div className="text-sm text-gray-500">
                Showing {drafts.length} document{drafts.length !== 1 ? 's' : ''}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drafts.map((draft) => (
                <div
                  key={draft.id}
                  className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 p-6 cursor-pointer border border-gray-100 hover:border-amber-200 transform hover:-translate-y-1"
                  onClick={() => navigate(`/draft/${draft.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg group-hover:from-amber-100 group-hover:to-amber-200 transition-colors">
                        <FileText className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-amber-600 uppercase tracking-wide px-2 py-1 bg-amber-50 rounded-md">
                          {draft.document_type}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(draft.id);
                      }}
                      className="text-gray-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-amber-700 transition-colors">
                    {draft.title}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 font-medium">Case Type:</span>
                      <span className="capitalize font-semibold text-gray-700 px-2 py-1 bg-blue-50 rounded-md">
                        {draft.case_type}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 font-medium">Court:</span>
                      <span className="capitalize font-semibold text-gray-700">
                        {draft.court.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(draft.created_at)}</span>
                    </div>
                    {draft.citations && draft.citations.length > 0 && (
                      <span className="text-xs font-semibold text-blue-600 px-2 py-1 bg-blue-50 rounded-md">
                        {draft.citations.length} Citation{draft.citations.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
