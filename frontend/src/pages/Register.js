import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scale, Building2, Mail, Lock, User, CheckCircle } from 'lucide-react';
import api from '../utils/api';

const Register = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    organization: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // Register user
      await api.post('/auth/register', {
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        organization: formData.organization || null
      });

      // Login automatically
      const loginResponse = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password
      });

      onRegister(loginResponse.data.access_token);
      navigate('/dashboard');
    } catch (err) {
      // Handle error - detail can be string or array of validation errors
      const errorDetail = err.response?.data?.detail;
      if (Array.isArray(errorDetail)) {
        setError(errorDetail.map(e => e.msg).join(', '));
      } else if (typeof errorDetail === 'string') {
        setError(errorDetail);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f0f] via-gray-900 to-black relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-full filter blur-3xl animate-float"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-amber-600/10 to-amber-700/10 rounded-full filter blur-3xl animate-float" style={{animationDelay: '1.5s'}}></div>

      <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full fade-in">
          <div className="premium-card-glass p-10 lg:p-12">
            
            {/* Header */}
            <div className="text-center mb-10">
              <div className="flex justify-center mb-6">
                <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-4 rounded-2xl shadow-lg animate-float">
                  <Scale className="w-12 h-12 text-white" />
                </div>
              </div>
              <h1 className="text-5xl font-bold gradient-text mb-3">
                Join LawMind
              </h1>
              <p className="text-gray-400 text-lg">
                Start your journey to smarter legal drafting
              </p>
              
              {/* Trust indicators */}
              <div className="flex items-center justify-center space-x-8 mt-6 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>AES-256 Encrypted</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>AI-Powered</span>
                </div>
              </div>
            </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="glass-dark border border-red-500/30 text-red-400 px-5 py-4 rounded-xl">
              <p className="font-semibold">Registration Error</p>
              <p className="text-sm opacity-90">{error}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="full_name" className="block text-sm font-semibold text-gray-300 mb-2">
                Full Name <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition duration-200 text-white placeholder-gray-500"
                  placeholder="Adv. Rajesh Kumar"
                  value={formData.full_name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2">
                Email Address <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition duration-200 text-white placeholder-gray-500"
                  placeholder="advocate@lawfirm.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="organization" className="block text-sm font-semibold text-gray-300 mb-2">
              Law Firm / Organization
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building2 className="h-5 w-5 text-gray-500" />
              </div>
              <input
                id="organization"
                name="organization"
                type="text"
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition duration-200 text-white placeholder-gray-500"
                placeholder="Kumar & Associates"
                value={formData.organization}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-300 mb-2">
                Password <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition duration-200 text-white placeholder-gray-500"
                  placeholder="••••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">Minimum 8 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-300 mb-2">
                Confirm Password <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition duration-200 text-white placeholder-gray-500"
                  placeholder="••••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating your account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-transparent text-gray-400">Already a member?</span>
            </div>
          </div>

          <Link
            to="/login"
            className="block w-full text-center px-6 py-3 border border-white/10 text-gray-300 font-semibold rounded-xl hover:bg-white/5 hover:border-white/20 transition duration-200"
          >
            Sign In to Your Account
          </Link>
        </form>
        
        <p className="mt-8 text-center text-xs text-gray-500">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
    </div>
    </div>
  );
};

export default Register;
