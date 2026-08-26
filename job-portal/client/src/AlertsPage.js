import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import './App.css';

function AlertsPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const [alerts, setAlerts] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ keyword: "", location: "", jobType: "" });

  const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://job-portal-1-wngj.onrender.com';

  useEffect(() => {
    if (!token || role !== 'candidate') {
      alert("Candidate access required.");
      navigate('/');
      return;
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, role]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Alerts
      const alertsRes = await fetch(`${API_URL}/alerts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const alertsData = await alertsRes.json();
      if (alertsRes.ok) {
        setAlerts(alertsData);
      }

      // 2. Fetch Notifications History
      const historyRes = await fetch(`${API_URL}/alerts/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const historyData = await historyRes.json();
      if (historyRes.ok) {
        setHistory(historyData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    if (!form.keyword) return alert("Keyword is required");

    try {
      const response = await fetch(`${API_URL}/alerts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (response.ok) {
        alert("Job Alert created successfully!");
        setForm({ keyword: "", location: "", jobType: "" });
        fetchData();
      } else {
        alert(data.error || "Failed to create alert");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAlert = async (id) => {
    try {
      const response = await fetch(`${API_URL}/alerts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        alert("Alert removed.");
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  if (loading) {
    return (
      <div className="container" style={{ textAlign: "center", paddingTop: "100px" }}>
        <h2>Loading Job Alerts...</h2>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container" style={{ marginTop: "80px" }}>
        
        <h1 style={{ marginBottom: "30px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "10px" }}>
          🔔 Job Alerts & Notifications
        </h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "30px" }}>
          
          {/* Left Column: Create Alerts */}
          <div>
            <div className="glass-panel" style={{ padding: "30px", borderRadius: "20px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <h2 style={{ marginTop: 0, marginBottom: "20px" }}>Create New Alert</h2>
              
              <form onSubmit={handleCreateAlert} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <div>
                  <label style={{ fontSize: "13px", opacity: 0.7 }}>Keyword (e.g. React, Python)</label>
                  <input name="keyword" value={form.keyword} onChange={handleChange} className="form-input" style={{ width: "100%", boxSizing: "border-box" }} required placeholder="e.g. JavaScript" />
                </div>

                <div>
                  <label style={{ fontSize: "13px", opacity: 0.7 }}>Preferred Location</label>
                  <input name="location" value={form.location} onChange={handleChange} className="form-input" style={{ width: "100%", boxSizing: "border-box" }} placeholder="e.g. New York or Remote" />
                </div>

                <div>
                  <label style={{ fontSize: "13px", opacity: 0.7 }}>Job Type</label>
                  <select name="jobType" value={form.jobType} onChange={handleChange} className="form-input" style={{ width: "100%", boxSizing: "border-box", appearance: "none", color: "#333" }}>
                    <option value="">Any Job Type</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-add" style={{ padding: "10px", marginTop: "10px" }}>Set Job Alert 🔔</button>
              </form>
            </div>

            {/* List of Active Alerts */}
            <div className="glass-panel" style={{ padding: "30px", borderRadius: "20px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", marginTop: "20px" }}>
              <h3 style={{ marginTop: 0 }}>Active Alert Triggers</h3>
              
              {alerts.length === 0 ? (
                <p style={{ opacity: 0.5, fontSize: "13px" }}>No alerts configured.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {alerts.map((al) => (
                    <div key={al._id} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "10px 15px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <strong style={{ color: "#00ff88" }}>{al.keyword}</strong>
                        <span style={{ fontSize: "12px", display: "block", opacity: 0.6 }}>
                          {al.location ? `📍 ${al.location}` : ""} {al.jobType ? `• ${al.jobType}` : ""}
                        </span>
                      </div>
                      <button className="btn" style={{ background: "transparent", color: "#ff4d4d", padding: "5px", fontSize: "12px" }} onClick={() => handleDeleteAlert(al._id)}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: History Log */}
          <div className="glass-panel" style={{ padding: "30px", borderRadius: "20px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", alignSelf: "start" }}>
            <h2 style={{ marginTop: 0, marginBottom: "15px" }}>🔔 Notification History Inbox</h2>
            <p style={{ fontSize: "13px", opacity: 0.7, marginTop: "-10px", marginBottom: "25px" }}>
              The following matched openings were added recently. Email notifications have been logged in the backend.
            </p>

            {history.length === 0 ? (
              <p style={{ opacity: 0.5, textAlign: "center", padding: "40px 0" }}>No matched job notifications yet. Try setting broader alert keywords!</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {history.map((job) => (
                  <div key={job._id} style={{ background: "rgba(0, 255, 136, 0.04)", border: "1px solid rgba(0, 255, 136, 0.15)", borderRadius: "15px", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ background: "#00ff88", color: "#111", padding: "2px 8px", borderRadius: "5px", fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", display: "inline-block", marginBottom: "5px" }}>
                        New Match
                      </span>
                      <h3 style={{ margin: "0 0 5px 0" }}>{job.title}</h3>
                      <span style={{ fontSize: "13px", opacity: 0.7 }}>🏢 {job.company} • 📍 {job.location} • {job.jobType || "Full-time"}</span>
                    </div>
                    <button className="btn btn-add" style={{ padding: "8px 15px", fontSize: "12px" }} onClick={() => navigate('/jobs')}>
                      Apply Now ↗
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default AlertsPage;
