import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const username = localStorage.getItem('username');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    alert('Logged out successfully.');
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        JobPortal<span style={{ color: '#00ff88' }}>.</span>
      </div>
      <div className="nav-links">
        <span 
          className={`nav-item ${location.pathname === '/jobs' ? 'active' : ''}`} 
          onClick={() => navigate('/jobs')}
        >
          Find Jobs
        </span>

        {token ? (
          <>
            <span 
              className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`} 
              onClick={() => navigate('/profile')}
            >
              Profile
            </span>

            {role === 'recruiter' && (
              <span 
                className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`} 
                onClick={() => navigate('/dashboard')}
              >
                Dashboard
              </span>
            )}

            {role === 'candidate' && (
              <span 
                className={`nav-item ${location.pathname === '/alerts' ? 'active' : ''}`} 
                onClick={() => navigate('/alerts')}
              >
                Alerts
              </span>
            )}

            <span className="nav-user" style={{ color: '#00ff88', fontWeight: 'bold' }}>
              👤 {username}
            </span>

            <span 
              className="nav-item btn-logout" 
              onClick={handleLogout} 
              style={{ border: '1px solid #ff4d4d', color: '#ff4d4d', padding: '5px 12px', borderRadius: '20px' }}
            >
              Logout
            </span>
          </>
        ) : (
          <>
            <span 
              className="nav-item" 
              onClick={() => navigate('/login')}
              style={{ border: '1px solid #00ff88', padding: '5px 15px', borderRadius: '20px', color: '#00ff88' }}
            >
              Sign In
            </span>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
