import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function Register() {
  const [form, setForm] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    const response = await fetch('http://localhost:5000/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    if (response.ok) {
      alert("Registration Successful! Please Login.");
      navigate('/'); // Go back to Login
    } else {
      alert("Username already taken.");
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
            name="password" type="password" placeholder="Password" required 
            className="auth-input" onChange={handleChange} 
          />
          <button type="submit" className="btn btn-add" style={{width: "100%"}}>Register</button>
        </form>
        <span className="auth-link" onClick={() => navigate('/')}>
          Already have an account? Login
        </span>
      </div>
    </div>
  );
}

export default Register;