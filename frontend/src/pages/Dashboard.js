import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Calendar, Trash2, TrendingUp, Clock, Award, Sparkles, Upload } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f0f] via-gray-900 to-black dark:from-black dark:via-gray-900 dark:to-black">
      {/* Premium Hero Header */}
      <div className="relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-amber-500/10 animate-shimmer"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
          <div className="flex justify-between items-start mb-8">
            <div className="fade-in">
              <h1 className="text-5xl font-bold mb-3 gradient-text">
                Your Legal Workspace
              </h1>
              <p className="text-gray-400 text-lg">Powered by advanced AI • AES-256 secured</p>
            </div>
            <div className="flex gap-4 slide-up">
              <button
                onClick={() => navigate('/upload')}
                className="flex items-center space-x-2 px-6 py-3 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-lg transition-all duration-300 hover:border-purple-500/50"
              >
                <Upload className="w-5 h-5" />
                <span>OCR Upload</span>
              </button>
              <button
                onClick={() => navigate('/draft/new')}
                className="btn-primary"
              >
                <Plus className="w-5 h-5" />
                <span>New Draft</span>
              </button>
            </div>
          </div>

          {/* Premium Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 slide-up">
            <div className="premium-card-glass group hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium mb-2">Total Drafts</p>
                  <p className="text-4xl font-bold gradient-text">{drafts.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-xl group-hover:from-amber-500/30 group-hover:to-amber-600/30 transition-all">
                  <FileText className="w-8 h-8 text-amber-400" />
                </div>
              </div>
            </div>

            <div className="premium-card-glass group hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium mb-2">This Month</p>
                  <p className="text-4xl font-bold text-green-400">
                    {drafts.filter(d => {
                      const created = new Date(d.created_at);
                      const now = new Date();
                      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl group-hover:from-green-500/30 group-hover:to-green-600/30 transition-all">
                  <TrendingUp className="w-8 h-8 text-green-400" />
                </div>
              </div>
            </div>

            <div className="premium-card-glass group hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium mb-2">Recent Activity</p>
                  <p className="text-xl font-bold text-blue-400">
                    {drafts.length > 0 ? formatDate(drafts[0]?.created_at || new Date()) : '-'}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl group-hover:from-blue-500/30 group-hover:to-blue-600/30 transition-all">
                  <Clock className="w-8 h-8 text-blue-400" />
                </div>
              </div>
            </div>

            <div className="premium-card-glass group hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium mb-2">Pro Member</p>
                  <p className="text-xl font-bold text-purple-400">Active</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl group-hover:from-purple-500/30 group-hover:to-purple-600/30 transition-all">
                  <Award className="w-8 h-8 text-purple-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="glass-dark border border-red-500/30 text-red-400 px-6 py-4 rounded-xl mb-8">
            <p className="font-semibold">Error Loading Drafts</p>
            <p className="text-sm opacity-80">{error}</p>
          </div>
        )}

        {drafts.length === 0 ? (
          <div className="premium-card-glass text-center py-20 scale-in">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-full flex items-center justify-center">
              <FileText className="w-12 h-12 text-amber-400" />
            </div>
            <h3 className="text-3xl font-bold gradient-text mb-4">Start Your Legal Journey</h3>
            <p className="text-gray-400 mb-10 max-w-md mx-auto text-lg">
              Create your first AI-powered legal document with advanced case law research and encryption
            </p>
            <button
              onClick={() => navigate('/draft/new')}
              className="btn-primary"
            >
              <Plus className="w-5 h-5" />
              <span>Create Your First Draft</span>
            </button>
          </div>
        ) : (
          <div className="fade-in">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-3xl font-bold gradient-text">Your Documents</h2>
              <div className="text-sm text-gray-400 glass px-4 py-2 rounded-lg">
                {drafts.length} document{drafts.length !== 1 ? 's' : ''}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drafts.map((draft, index) => (
                <div
                  key={draft.id}
                  className="premium-card group cursor-pointer transform hover:scale-105"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => navigate(`/draft/${draft.id}`)}
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-xl group-hover:from-amber-500/30 group-hover:to-amber-600/30 transition-all">
                        <FileText className="w-6 h-6 text-amber-400" />
                      </div>
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                        {draft.document_type}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(draft.id);
                      }}
                      className="text-gray-500 hover:text-red-400 transition-colors p-2 hover:bg-red-500/10 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-4 line-clamp-2 group-hover:text-amber-400 transition-colors">
                    {draft.title}
                  </h3>

                  <div className="space-y-3 mb-5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Case Type:</span>
                      <span className="capitalize font-semibold text-gray-200 px-3 py-1 bg-white/5 border border-white/10 rounded-lg">
                        {draft.case_type}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Court:</span>
                      <span className="capitalize font-semibold text-gray-200">
                        {draft.court.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(draft.created_at)}</span>
                    </div>
                    {draft.citations && draft.citations.length > 0 && (
                      <span className="text-xs font-bold text-blue-400 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg">
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
