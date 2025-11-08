import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scale, LogOut, Home, PlusCircle, User } from 'lucide-react';

const Navbar = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 shadow-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-3 group">
            <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-2 rounded-lg shadow-lg group-hover:shadow-amber-500/50 transition-all">
              <Scale className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
                LawMind
              </span>
              <p className="text-xs text-blue-200 -mt-1">AI Legal Assistant</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-2">
            <Link
              to="/dashboard"
              className="flex items-center space-x-2 px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-all duration-200"
            >
              <Home className="w-4 h-4" />
              <span className="font-medium">Dashboard</span>
            </Link>
            
            <Link
              to="/draft/new"
              className="flex items-center space-x-2 px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-all duration-200"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="font-medium">New Draft</span>
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-white/10 rounded-lg border border-white/20">
              <User className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-white">Account</span>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 hover:text-white rounded-lg transition-all duration-200 border border-red-500/30"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
