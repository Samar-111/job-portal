import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://job-portal-nhpx.onrender.com';

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role);
        localStorage.setItem("username", data.user.username);
        localStorage.setItem("userId", data.user.id);
        
        alert("Welcome back, " + data.user.username + "!");
        navigate('/'); // Go to Landing Page
      } else {
        alert(data.error || "Login failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server. Make sure backend is running.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="auth-title">Sign In</h2>
        <form onSubmit={handleLogin}>
          <input 
            name="username" type="text" placeholder="Username or Email" required 
            className="auth-input" onChange={handleChange} 
          />
          <input 
            name="password" type="password" placeholder="Password" required 
            className="auth-input" onChange={handleChange} 
          />
          <button type="submit" className="btn btn-add" style={{width: "100%"}}>Login</button>
        </form>
        <span className="auth-link" onClick={() => navigate('/register')}>
          New here? Create an Account
        </span>
      </div>
    </div>
  );
}

export default Login;