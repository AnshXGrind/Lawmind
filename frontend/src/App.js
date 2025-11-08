import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DraftEditor from './pages/DraftEditor';
import NewDraft from './pages/NewDraft';
import UploadDocument from './pages/UploadDocument';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for authentication token
    const token = localStorage.getItem('lawmind_token');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem('lawmind_token', token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('lawmind_token');
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App min-h-screen bg-gray-50">
        {isAuthenticated && <Navbar onLogout={handleLogout} />}
        
        <Routes>
          <Route 
            path="/login" 
            element={
              !isAuthenticated ? 
              <Login onLogin={handleLogin} /> : 
              <Navigate to="/dashboard" />
            } 
          />
          <Route 
            path="/register" 
            element={
              !isAuthenticated ? 
              <Register onRegister={handleLogin} /> : 
              <Navigate to="/dashboard" />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? 
              <Dashboard /> : 
              <Navigate to="/login" />
            } 
          />
          <Route 
            path="/draft/new" 
            element={
              isAuthenticated ? 
              <NewDraft /> : 
              <Navigate to="/login" />
            } 
          />
          <Route 
            path="/upload" 
            element={
              isAuthenticated ? 
              <UploadDocument /> : 
              <Navigate to="/login" />
            } 
          />
          <Route 
            path="/draft/:id" 
            element={
              isAuthenticated ? 
              <DraftEditor /> : 
              <Navigate to="/login" />
            } 
          />
          <Route 
            path="/" 
            element={
              <Navigate to={isAuthenticated ? "/dashboard" : "/login"} />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
