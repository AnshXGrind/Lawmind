import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import DraftEditor from './pages/DraftEditor';
import NewDraft from './pages/NewDraft';
import UploadDocument from './pages/UploadDocument';
import DocumentAnalyser from './pages/DocumentAnalyser';
import LegalChat from './components/ai/LegalChat';
import BackendStatus from './components/BackendStatus';

function AppShell({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f8f7f5', fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />
      {children}
    </div>
  );
}

function App() {
  return (
    <Router>
      <BackendStatus />
      <Routes>
        <Route path="/"           element={<Landing />} />
        <Route path="/dashboard"  element={<AppShell><Dashboard /></AppShell>} />
        <Route path="/draft/new"  element={<AppShell><NewDraft /></AppShell>} />
        <Route path="/upload"     element={<AppShell><UploadDocument /></AppShell>} />
        <Route path="/draft/:id"  element={<AppShell><DraftEditor /></AppShell>} />
        <Route path="/analyse"    element={<AppShell><DocumentAnalyser /></AppShell>} />
        <Route path="/login"      element={<Navigate to="/" />} />
        <Route path="/register"   element={<Navigate to="/" />} />
      </Routes>
      <LegalChat />
    </Router>
  );
}

export default App;