import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import './App.css';

function RecruiterDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const userId = localStorage.getItem('userId');

  const [analytics, setAnalytics] = useState(null);
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedJobId, setExpandedJobId] = useState(null);

  const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://job-portal-1-wngj.onrender.com';

  useEffect(() => {
    if (!token || role !== 'recruiter') {
      alert("Recruiter access required.");
      navigate('/');
      return;
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, role]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Analytics
      const analyticsRes = await fetch(`${API_URL}/analytics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const analyticsData = await analyticsRes.json();
      if (analyticsRes.ok) {
        setAnalytics(analyticsData);
      }

      // 2. Fetch Jobs posted by this Recruiter
      const jobsRes = await fetch(`${API_URL}/jobs`);
      const jobsData = await jobsRes.json();
      if (jobsRes.ok) {
        const filtered = jobsData.filter(job => 
          job.postedBy && (job.postedBy._id === userId || job.postedBy === userId)
        );
        setMyJobs(filtered);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (jobId, appId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/jobs/${jobId}/applications/${appId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();
      if (response.ok) {
        alert(`Application status updated to ${newStatus}`);
        fetchData(); // Refresh lists and analytics
      } else {
        alert(data.error || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating application status");
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job post?")) return;
    try {
      const response = await fetch(`${API_URL}/jobs/${jobId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        alert("Job deleted successfully");
        fetchData();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete job");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: "center", paddingTop: "100px" }}>
        <h2>Loading Recruiter Dashboard...</h2>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container" style={{ marginTop: "80px" }}>
        <h1 style={{ marginBottom: "30px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "10px" }}>
          🏢 Recruiter Dashboard
        </h1>

        {/* Analytics Section */}
        {analytics && (
          <div className="analytics-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "40px" }}>
            
            <div className="glass-panel stat-card" style={{ padding: "20px", borderRadius: "15px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", textAlign: "center" }}>
              <div style={{ fontSize: "28px" }}>📊</div>
              <h3 style={{ margin: "10px 0 5px 0", opacity: 0.8 }}>Total Jobs Posted</h3>
              <h1 style={{ margin: 0, color: "#00ff88", fontSize: "36px" }}>{analytics.totalJobs}</h1>
            </div>

            <div className="glass-panel stat-card" style={{ padding: "20px", borderRadius: "15px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", textAlign: "center" }}>
              <div style={{ fontSize: "28px" }}>📥</div>
              <h3 style={{ margin: "10px 0 5px 0", opacity: 0.8 }}>Total Applications</h3>
              <h1 style={{ margin: 0, color: "#3498db", fontSize: "36px" }}>{analytics.totalApplications}</h1>
            </div>

            <div className="glass-panel stat-card" style={{ padding: "20px", borderRadius: "15px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", textAlign: "center" }}>
              <div style={{ fontSize: "28px" }}>✅</div>
              <h3 style={{ margin: "10px 0 5px 0", opacity: 0.8 }}>Shortlisted</h3>
              <h1 style={{ margin: 0, color: "#2ecc71", fontSize: "36px" }}>{analytics.shortlistedCount}</h1>
            </div>

            <div className="glass-panel stat-card" style={{ padding: "20px", borderRadius: "15px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", textAlign: "center" }}>
              <div style={{ fontSize: "28px" }}>❌</div>
              <h3 style={{ margin: "10px 0 5px 0", opacity: 0.8 }}>Rejected</h3>
              <h1 style={{ margin: 0, color: "#e74c3c", fontSize: "36px" }}>{analytics.rejectedCount}</h1>
            </div>

          </div>
        )}

        {/* Visual Chart / Stats Bar */}
        {analytics && analytics.totalApplications > 0 && (
          <div className="glass-panel" style={{ padding: "25px", borderRadius: "20px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", marginBottom: "40px" }}>
            <h3 style={{ marginTop: 0, marginBottom: "15px" }}>📈 Candidate Selection Funnel</h3>
            <div style={{ display: "flex", height: "30px", borderRadius: "15px", overflow: "hidden", background: "rgba(255,255,255,0.1)" }}>
              <div style={{ 
                width: `${(analytics.shortlistedCount / analytics.totalApplications) * 100}%`, 
                background: "#2ecc71", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                color: "#111", 
                fontWeight: "bold",
                fontSize: "12px"
              }}>
                {analytics.shortlistedCount > 0 && `Shortlisted (${Math.round((analytics.shortlistedCount / analytics.totalApplications) * 100)}%)`}
              </div>
              <div style={{ 
                width: `${(analytics.appliedCount / analytics.totalApplications) * 100}%`, 
                background: "#3498db", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                color: "#fff", 
                fontWeight: "bold",
                fontSize: "12px"
              }}>
                {analytics.appliedCount > 0 && `Pending (${Math.round((analytics.appliedCount / analytics.totalApplications) * 100)}%)`}
              </div>
              <div style={{ 
                width: `${(analytics.rejectedCount / analytics.totalApplications) * 100}%`, 
                background: "#e74c3c", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                color: "#fff", 
                fontWeight: "bold",
                fontSize: "12px"
              }}>
                {analytics.rejectedCount > 0 && `Rejected (${Math.round((analytics.rejectedCount / analytics.totalApplications) * 100)}%)`}
              </div>
            </div>
          </div>
        )}

        {/* My Jobs List */}
        <div className="glass-panel" style={{ padding: "30px", borderRadius: "20px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ margin: 0 }}>💼 Active Job Postings</h2>
            <button className="btn btn-add" onClick={() => navigate('/jobs')}>+ Post a New Job</button>
          </div>

          {myJobs.length === 0 ? (
            <p style={{ opacity: 0.5, textAlign: "center", padding: "20px 0" }}>You haven't posted any jobs yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {myJobs.map((job) => (
                <div key={job._id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "15px", overflow: "hidden" }}>
                  
                  {/* Job card main header */}
                  <div style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={() => setExpandedJobId(expandedJobId === job._id ? null : job._id)}>
                    <div>
                      <h3 style={{ margin: "0 0 5px 0" }}>{job.title}</h3>
                      <span style={{ fontSize: "13px", opacity: 0.7 }}>📍 {job.location} • 💰 {job.salary} • 📅 {new Date(job.postedAt).toLocaleDateString()}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                      <span style={{ background: "rgba(0,255,136,0.1)", color: "#00ff88", padding: "4px 10px", borderRadius: "10px", fontSize: "12px", fontWeight: "bold" }}>
                        📥 {job.applications?.length || 0} applications
                      </span>
                      <button className="btn" style={{ background: "transparent", color: expandedJobId === job._id ? "#fff" : "#00ff88", border: "none", fontSize: "18px" }}>
                        {expandedJobId === job._id ? "🔼" : "🔽"}
                      </button>
                      <button className="btn" style={{ background: "rgba(255, 77, 77, 0.15)", color: "#ff4d4d", padding: "6px 12px", fontSize: "12px", borderRadius: "8px" }} onClick={(e) => { e.stopPropagation(); handleDeleteJob(job._id); }}>
                        Delete 🗑️
                      </button>
                    </div>
                  </div>

                  {/* Expanded candidates view */}
                  {expandedJobId === job._id && (
                    <div style={{ background: "rgba(0,0,0,0.2)", borderTop: "1px solid rgba(255,255,255,0.05)", padding: "20px" }}>
                      <h4 style={{ marginTop: 0, marginBottom: "15px", color: "#00ff88" }}>Received Applications:</h4>
                      
                      {(!job.applications || job.applications.length === 0) ? (
                        <p style={{ opacity: 0.5, fontSize: "13px", margin: 0 }}>No candidates have applied for this job yet.</p>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          {job.applications.map((app) => (
                            <div key={app._id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div>
                                <h4 style={{ margin: "0 0 5px 0" }}>👤 Candidate</h4>
                                <span style={{ fontSize: "12px", opacity: 0.6 }}>Applied: {new Date(app.appliedAt).toLocaleDateString()}</span>
                              </div>

                              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                {app.resumeUrl ? (
                                  <a href={`${API_URL}${app.resumeUrl}`} target="_blank" rel="noopener noreferrer" style={{ color: "#00ff88", textDecoration: "none", fontWeight: "bold", fontSize: "13px", marginRight: "15px" }}>
                                    Download Resume 📄
                                  </a>
                                ) : (
                                  <span style={{ fontSize: "12px", opacity: 0.5, marginRight: "15px" }}>No Resume</span>
                                )}

                                <span style={{ 
                                  background: app.status === 'Shortlisted' ? 'rgba(46, 204, 113, 0.2)' : app.status === 'Rejected' ? 'rgba(231, 76, 60, 0.2)' : 'rgba(52, 152, 219, 0.2)',
                                  color: app.status === 'Shortlisted' ? '#2ecc71' : app.status === 'Rejected' ? '#e74c3c' : '#3498db',
                                  padding: "3px 10px", 
                                  borderRadius: "5px", 
                                  fontSize: "12px", 
                                  fontWeight: "bold",
                                  marginRight: "15px"
                                }}>
                                  {app.status}
                                </span>

                                {app.status === 'Applied' && (
                                  <>
                                    <button className="btn" style={{ background: "#2ecc71", color: "#111", padding: "5px 10px", fontSize: "12px", borderRadius: "5px" }} onClick={() => handleStatusUpdate(job._id, app._id, 'Shortlisted')}>
                                      Shortlist
                                    </button>
                                    <button className="btn" style={{ background: "#e74c3c", color: "#fff", padding: "5px 10px", fontSize: "12px", borderRadius: "5px" }} onClick={() => handleStatusUpdate(job._id, app._id, 'Rejected')}>
                                      Reject
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecruiterDashboard;
