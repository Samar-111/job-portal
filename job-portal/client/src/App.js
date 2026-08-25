import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import JobPage from './JobPage';
import Login from './Login';
import Register from './Register';
import Profile from './Profile';
import RecruiterDashboard from './RecruiterDashboard';
import AlertsPage from './AlertsPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Landing / Home Page */}
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          
          {/* Auth Pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Core App Pages */}
          <Route path="/jobs" element={<JobPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<RecruiterDashboard />} />
          <Route path="/alerts" element={<AlertsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;