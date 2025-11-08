import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Home, PlusCircle, User } from 'lucide-react';
import Logo from './Logo';

const Navbar = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm backdrop-blur-xl bg-white/95 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="group">
            <Logo size="medium" />
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-2">
            <Link
              to="/dashboard"
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
            >
              <Home className="w-4 h-4" />
              <span className="font-medium text-sm">Dashboard</span>
            </Link>
            
            <Link
              to="/draft/new"
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="text-sm">New Draft</span>
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg border border-gray-200">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <User className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Account</span>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-lg transition-all duration-200 border border-red-200 font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
