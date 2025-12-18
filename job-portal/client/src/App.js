import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import JobPage from './JobPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Default to Home */}
          <Route path="/" element={<Home />} />
          {/* The Main Job Board */}
          <Route path="/jobs" element={<JobPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;