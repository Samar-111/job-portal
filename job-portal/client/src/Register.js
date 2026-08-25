import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "", role: "candidate" });
  const navigate = useNavigate();

  const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://job-portal-nhpx.onrender.com';

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration Successful! Please login.");
        navigate('/login'); // Go to Login
      } else {
        alert(data.error || "Registration failed. Username/Email might be taken.");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server. Make sure backend is running.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="auth-title">Create Account</h2>
        <form onSubmit={handleRegister}>
          <input 
            name="username" type="text" placeholder="Username" required 
            className="auth-input" onChange={handleChange} 
          />
          <input 
            name="email" type="email" placeholder="Email Address" required 
            className="auth-input" onChange={handleChange} 
          />
          <input 
            name="password" type="password" placeholder="Password" required 
            className="auth-input" onChange={handleChange} 
          />
          
          <div className="role-selector" style={{ margin: "15px 0", textAlign: "left" }}>
            <label style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>I want to sign up as a:</label>
            <div style={{ display: "flex", gap: "10px", marginTop: "5px" }}>
              <label className={`role-option ${form.role === 'candidate' ? 'active' : ''}`} style={{ flex: 1, textAlign: "center", padding: "10px", background: form.role === 'candidate' ? '#00ff88' : 'rgba(255,255,255,0.1)', color: form.role === 'candidate' ? '#111' : '#fff', borderRadius: "10px", cursor: "pointer", fontWeight: "bold", transition: "all 0.3s ease" }}>
                <input type="radio" name="role" value="candidate" checked={form.role === 'candidate'} onChange={handleChange} style={{ display: "none" }} />
                Candidate
              </label>
              <label className={`role-option ${form.role === 'recruiter' ? 'active' : ''}`} style={{ flex: 1, textAlign: "center", padding: "10px", background: form.role === 'recruiter' ? '#00ff88' : 'rgba(255,255,255,0.1)', color: form.role === 'recruiter' ? '#111' : '#fff', borderRadius: "10px", cursor: "pointer", fontWeight: "bold", transition: "all 0.3s ease" }}>
                <input type="radio" name="role" value="recruiter" checked={form.role === 'recruiter'} onChange={handleChange} style={{ display: "none" }} />
                Recruiter
              </label>
            </div>
          </div>

          <button type="submit" className="btn btn-add" style={{width: "100%"}}>Register</button>
        </form>
        <span className="auth-link" onClick={() => navigate('/login')}>
          Already have an account? Login
        </span>
      </div>
    </div>
  );
}

export default Register;