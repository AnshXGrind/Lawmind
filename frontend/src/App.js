import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import DraftEditor from './pages/DraftEditor';
import NewDraft from './pages/NewDraft';
import UploadDocument from './pages/UploadDocument';

function App() {
  return (
    <Router>
      <div className="App min-h-screen bg-gray-50">
        <Navbar />
        
        <Routes>
          <Route path="/login" element={<Navigate to="/dashboard" />} />
          <Route path="/register" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/draft/new" element={<NewDraft />} />
          <Route path="/upload" element={<UploadDocument />} />
          <Route path="/draft/:id" element={<DraftEditor />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
