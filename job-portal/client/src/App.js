import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Home from './Home';
import JobPage from './JobPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* 1. Login is the first page now */}
        <Route path="/" element={<Login />} />
        
        {/* 2. Register Page */}
        <Route path="/register" element={<Register />} />
        
        {/* 3. The Landing Page (only after login) */}
        <Route path="/home" element={<Home />} />
        
        {/* 4. The Dashboard */}
        <Route path="/dashboard" element={<JobPage />} />
      </Routes>
    </Router>
  );
}

export default App;