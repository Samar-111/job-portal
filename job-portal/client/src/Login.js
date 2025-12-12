import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    const response = await fetch('https://job-portal-nhpx.onrender.com/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    const data = await response.json();

    if (response.ok) {
        localStorage.setItem("username", data.username);
      alert("Welcome back, " + data.username + "!");
      navigate('/home'); // Go to Landing Page
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="auth-title">Sign In</h2>
        <form onSubmit={handleLogin}>
          <input 
            name="username" type="text" placeholder="Username" required 
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