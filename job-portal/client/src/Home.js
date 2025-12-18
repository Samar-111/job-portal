import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function Home() {
  const navigate = useNavigate();
  
  // State to control which popup is open (null = none, 'about' = About Us, 'companies' = Companies)
  const [activeModal, setActiveModal] = useState(null);

  const closeModal = () => setActiveModal(null);

  return (
    <div style={{ height: "100vh", position: "relative", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
      
      {/* --- FLOATING NAVBAR --- */}
      <nav className="navbar">
        <div className="nav-logo">JobPortal<span style={{color:"#00ff88"}}>.</span></div>
        <div className="nav-links">
          
          <span className="nav-item" onClick={() => setActiveModal('companies')}>
            Top Companies
          </span>
          
          <span className="nav-item" onClick={() => setActiveModal('about')}>
            About Us
          </span>

          <span className="nav-item" onClick={() => navigate('/jobs')} style={{border: "1px solid #00ff88", padding: "5px 15px", borderRadius: "20px", color: "#00ff88"}}>
            Find Jobs
          </span>
        </div>
      </nav>

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
      
      <button 
        className="btn btn-add" 
        style={{ padding: "18px 40px", fontSize: "18px", zIndex: 10, borderRadius: "50px" }}
        onClick={() => navigate('/jobs')}
      >
        Browse Openings 🚀
      </button>

      {/* Stats Section */}
      <div className="stats-container">
        <div className="stat-box">
          <span className="stat-number">10k+</span>
          <span className="stat-label">Jobs Listed</span>
        </div>
        <div className="stat-box">
          <span className="stat-number">500+</span>
          <span className="stat-label">Companies</span>
        </div>
        <div className="stat-box">
          <span className="stat-number">Free</span>
          <span className="stat-label">For Candidates</span>
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
              <span className="developer-name">SAMAR ANAND</span>
              <span style={{fontSize: "0.8rem", opacity: "0.7"}}>Full Stack Developer</span>
            </div>

            <button className="close-btn" onClick={closeModal}>Close</button>
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

            <button className="close-btn" onClick={closeModal}>Close</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default Home;