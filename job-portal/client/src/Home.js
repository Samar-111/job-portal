import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import './App.css';

function Home() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  
  // State to control which popup is open (null = none, 'about' = About Us, 'companies' = Companies)
  const [activeModal, setActiveModal] = useState(null);

  const closeModal = () => setActiveModal(null);

  return (
    <div style={{ height: "100vh", position: "relative", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
      
      {/* --- REUSABLE NAVBAR --- */}
      <Navbar />

      {/* --- HERO SECTION --- */}
      <div className="header" style={{ marginBottom: "20px", position: "relative", zIndex: 10 }}>
        <h1 style={{ fontSize: "4.5rem", marginBottom: "10px" }}>
          Find Your <br />
          <span style={{ color: "#00ff88" }}>Dream Career</span>
        </h1>
        <p style={{ maxWidth: "600px", margin: "20px auto", lineHeight: "1.6", fontSize: "1.2rem", color: "rgba(255,255,255,0.8)" }}>
          The smartest way to find remote work. Connect with top companies 
          and startups instantly without the hassle.
        </p>
      </div>
      
      <div style={{ display: "flex", gap: "15px", zIndex: 10 }}>
        <button 
          className="btn btn-add" 
          style={{ padding: "18px 40px", fontSize: "18px", borderRadius: "50px" }}
          onClick={() => navigate('/jobs')}
        >
          Browse Openings 🚀
        </button>

        {token ? (
          role === 'recruiter' ? (
            <button 
              className="btn" 
              style={{ padding: "18px 40px", fontSize: "18px", borderRadius: "50px", background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }}
              onClick={() => navigate('/dashboard')}
            >
              Recruiter Dashboard 🏢
            </button>
          ) : (
            <button 
              className="btn" 
              style={{ padding: "18px 40px", fontSize: "18px", borderRadius: "50px", background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }}
              onClick={() => navigate('/profile')}
            >
              View My Profile 👤
            </button>
          )
        ) : (
          <button 
            className="btn" 
            style={{ padding: "18px 40px", fontSize: "18px", borderRadius: "50px", background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }}
            onClick={() => navigate('/login')}
          >
            Get Started Key 🔑
          </button>
        )}
      </div>

      {/* Stats Section */}
      <div className="stats-container" style={{ marginTop: "40px" }}>
        <div className="stat-box">
          <span className="stat-number">10k+</span>
          <span className="stat-label">Jobs Listed</span>
        </div>
        <div className="stat-box" style={{ cursor: 'pointer' }} onClick={() => setActiveModal('companies')}>
          <span className="stat-number">500+</span>
          <span className="stat-label">Companies</span>
        </div>
        <div className="stat-box" style={{ cursor: 'pointer' }} onClick={() => setActiveModal('about')}>
          <span className="stat-number">Free</span>
          <span className="stat-label">About Us Info</span>
        </div>
      </div>

      {/* --- MODALS (The Popups) --- */}

      {/* 1. ABOUT US MODAL */}
      {activeModal === 'about' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-header">About Us</h2>
            <p style={{lineHeight: "1.6", marginBottom: "20px"}}>
              JobPortal is a cutting-edge platform designed to bridge the gap between talented developers 
              and world-class companies. We use advanced algorithms to find the perfect match for your skills.
            </p>
            <p style={{fontSize: "0.9rem", color: "#ccc"}}>
              Our mission is to make remote work accessible to everyone, everywhere.
            </p>

            <div style={{marginTop: "30px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "20px"}}>
              <span style={{fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "2px"}}>Developed By</span>
              <span className="developer-name" style={{ display: "block", fontSize: "1.5rem", fontWeight: "bold", color: "#00ff88", margin: "5px 0" }}>SAMAR ANAND</span>
              <span style={{fontSize: "0.8rem", opacity: "0.7"}}>Full Stack Developer</span>
            </div>

            <button className="close-btn" onClick={closeModal} style={{ marginTop: "20px" }}>Close</button>
          </div>
        </div>
      )}

      {/* 2. COMPANIES MODAL */}
      {activeModal === 'companies' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-header">Top Hiring Partners</h2>
            <p>We work with the biggest names in tech.</p>
            
            <div style={{display: "flex", flexWrap: "wrap", gap: "15px", justifyContent: "center", marginTop: "20px"}}>
               <div style={{padding: "10px 20px", background: "white", color: "#333", borderRadius: "5px", fontWeight: "bold"}}>Google</div>
               <div style={{padding: "10px 20px", background: "white", color: "#333", borderRadius: "5px", fontWeight: "bold"}}>Microsoft</div>
               <div style={{padding: "10px 20px", background: "white", color: "#333", borderRadius: "5px", fontWeight: "bold"}}>Amazon</div>
               <div style={{padding: "10px 20px", background: "white", color: "#333", borderRadius: "5px", fontWeight: "bold"}}>Netflix</div>
            </div>

            <button className="close-btn" onClick={closeModal} style={{ marginTop: "30px" }}>Close</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default Home;