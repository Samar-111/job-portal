import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import './App.css';

function Profile() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ fullName: "", bio: "", skills: "" });
  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);

  const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://job-portal-nhpx.onrender.com';

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [token]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      // 1. Fetch User details
      const response = await fetch(`${API_URL}/profile/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data);
        setForm({
          fullName: data.profile?.fullName || "",
          bio: data.profile?.bio || "",
          skills: data.profile?.skills?.join(', ') || ""
        });

        // 2. Fetch AI Recommendations (Candidate only)
        if (data.role === 'candidate') {
          fetchRecommendations();
          fetchAppliedJobs(data._id);
        }
      } else {
        alert(data.error || "Failed to load profile");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await fetch(`${API_URL}/recommendations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setRecommendations(data);
      }
    } catch (err) {
      console.error("Recommendations error:", err);
    }
  };

  const fetchAppliedJobs = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/jobs`);
      const data = await response.json();
      if (response.ok) {
        // Find jobs where the user is in the applications array
        const userApplied = data.filter(job => 
          job.applications && job.applications.some(app => app.candidate === userId || (app.candidate && app.candidate._id === userId))
        ).map(job => {
          const myApp = job.applications.find(app => app.candidate === userId || (app.candidate && app.candidate._id === userId));
          return {
            _id: job._id,
            title: job.title,
            company: job.company,
            location: job.location,
            appliedAt: myApp ? new Date(myApp.appliedAt).toLocaleDateString() : 'N/A',
            status: myApp ? myApp.status : 'Applied'
          };
        });
        setAppliedJobs(userApplied);
      }
    } catch (err) {
      console.error("Applied jobs error:", err);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/profile/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (response.ok) {
        alert("Profile updated successfully!");
        setEditing(false);
        setUser(data);
        // Refresh recommendations since skills might have changed
        if (data.role === 'candidate') {
          fetchRecommendations();
        }
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Update error occurred.");
    }
  };

  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0]);
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) return alert("Select a file first!");
    
    const formData = new FormData();
    formData.append("resume", resumeFile);

    try {
      setUploading(true);
      const response = await fetch(`${API_URL}/profile/resume`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await response.json();
      if (response.ok) {
        alert("Resume uploaded successfully!");
        setUser(data);
        setResumeFile(null);
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading resume.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: "center", paddingTop: "100px" }}>
        <h2>Loading Profile...</h2>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container" style={{ marginTop: "80px" }}>
        <div className="profile-grid" style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "30px" }}>
          
          {/* Left Column: Personal info & resume */}
          <div className="glass-panel" style={{ padding: "30px", borderRadius: "20px", background: "rgba(255,255,255,0.08)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.15)", alignSelf: "start" }}>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div style={{ fontSize: "64px" }}>👤</div>
              <h2>{user.username}</h2>
              <span style={{ background: "#00ff88", color: "#111", padding: "3px 15px", borderRadius: "20px", fontWeight: "bold", fontSize: "12px", textTransform: "uppercase" }}>
                {user.role}
              </span>
              <p style={{ opacity: 0.7, fontSize: "14px", marginTop: "10px" }}>✉️ {user.email}</p>
            </div>

            {editing ? (
              <form onSubmit={handleProfileUpdate}>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ fontSize: "13px", opacity: 0.7 }}>Full Name</label>
                  <input name="fullName" value={form.fullName} onChange={handleChange} className="form-input" style={{ width: "100%", boxSizing: "border-box" }} required />
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ fontSize: "13px", opacity: 0.7 }}>Bio</label>
                  <textarea name="bio" value={form.bio} onChange={handleChange} className="form-input" style={{ width: "100%", height: "80px", resize: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
                </div>
                {user.role === 'candidate' && (
                  <div style={{ marginBottom: "15px" }}>
                    <label style={{ fontSize: "13px", opacity: 0.7 }}>Skills (comma-separated)</label>
                    <input name="skills" value={form.skills} onChange={handleChange} className="form-input" style={{ width: "100%", boxSizing: "border-box" }} placeholder="React, Node, CSS" />
                  </div>
                )}
                <div style={{ display: "flex", gap: "10px" }}>
                  <button type="submit" className="btn btn-add" style={{ flex: 1, padding: "8px" }}>Save</button>
                  <button type="button" className="btn" style={{ flex: 1, padding: "8px", background: "rgba(255,255,255,0.1)", color: "#fff" }} onClick={() => setEditing(false)}>Cancel</button>
                </div>
              </form>
            ) : (
              <div>
                <h4 style={{ margin: "20px 0 5px 0", color: "#00ff88" }}>Full Name</h4>
                <p>{user.profile?.fullName || "Not provided yet"}</p>
                
                <h4 style={{ margin: "15px 0 5px 0", color: "#00ff88" }}>Bio</h4>
                <p style={{ fontSize: "14px", lineHeight: "1.5" }}>{user.profile?.bio || "Tell us about yourself!"}</p>
                
                {user.role === 'candidate' && (
                  <>
                    <h4 style={{ margin: "15px 0 5px 0", color: "#00ff88" }}>Skills</h4>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "5px" }}>
                      {user.profile?.skills && user.profile.skills.length > 0 ? (
                        user.profile.skills.map((skill, i) => (
                          <span key={i} style={{ background: "rgba(0, 255, 136, 0.15)", color: "#00ff88", border: "1px solid rgba(0, 255, 136, 0.3)", padding: "3px 10px", borderRadius: "8px", fontSize: "12px" }}>
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p style={{ fontSize: "12px", opacity: 0.5 }}>No skills listed</p>
                      )}
                    </div>
                  </>
                )}

                <button className="btn" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", width: "100%", marginTop: "20px", padding: "10px" }} onClick={() => setEditing(true)}>
                  Edit Profile ✏️
                </button>
              </div>
            )}

            {/* Resume Section (Candidate Only) */}
            {user.role === 'candidate' && (
              <div style={{ marginTop: "30px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "20px" }}>
                <h3 style={{ margin: "0 0 10px 0" }}>📄 Resume</h3>
                {user.profile?.resumeUrl ? (
                  <div style={{ marginBottom: "15px", background: "rgba(255,255,255,0.05)", padding: "10px 15px", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "150px" }}>
                      📎 {user.profile.resumeName}
                    </span>
                    <a href={`${API_URL}${user.profile.resumeUrl}`} target="_blank" rel="noopener noreferrer" style={{ color: "#00ff88", fontSize: "13px", textDecoration: "none", fontWeight: "bold" }}>
                      Download ↗
                    </a>
                  </div>
                ) : (
                  <p style={{ fontSize: "13px", opacity: 0.6, marginBottom: "15px" }}>No resume uploaded. Upload a PDF/DOCX to apply for jobs.</p>
                )}

                <form onSubmit={handleResumeUpload} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} style={{ fontSize: "12px" }} />
                  <button type="submit" className="btn btn-add" style={{ padding: "8px", fontSize: "13px" }} disabled={uploading}>
                    {uploading ? "Uploading..." : "Upload New Resume 📤"}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Right Column: Wishlist, applied jobs, AI matching */}
          <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
            
            {/* AI Job Recommendations */}
            {user.role === 'candidate' && (
              <div className="glass-panel" style={{ padding: "30px", borderRadius: "20px", background: "rgba(255,255,255,0.08)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.15)" }}>
                <h2 style={{ margin: "0 0 15px 0", display: "flex", alignItems: "center", gap: "10px" }}>
                  🧠 AI-Based Matching Openings <span style={{ background: "#00c3ff", color: "#111", fontSize: "11px", padding: "2px 8px", borderRadius: "10px", fontWeight: "bold", textTransform: "uppercase" }}>Beta</span>
                </h2>
                <p style={{ fontSize: "13px", opacity: 0.7, margin: "-10px 0 20px 0" }}>Recommendations match keywords in your skills profile.</p>

                {recommendations.length === 0 ? (
                  <p style={{ opacity: 0.5 }}>Add skills to get custom recommendations.</p>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                    {recommendations.slice(0, 4).map((job) => (
                      <div key={job._id} style={{ background: "rgba(0, 255, 136, 0.05)", border: "1px solid rgba(0, 255, 136, 0.15)", borderRadius: "15px", padding: "15px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <div>
                          <h4 style={{ margin: "0 0 5px 0" }}>{job.title}</h4>
                          <span style={{ fontSize: "12px", opacity: 0.7 }}>🏢 {job.company} • 📍 {job.location}</span>
                        </div>
                        <button className="btn" style={{ background: "transparent", color: "#00ff88", border: "1px solid #00ff88", padding: "5px 10px", marginTop: "15px", alignSelf: "start", fontSize: "12px", borderRadius: "10px" }} onClick={() => navigate('/jobs')}>
                          View Job ↗
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Saved Jobs / Wishlist */}
            <div className="glass-panel" style={{ padding: "30px", borderRadius: "20px", background: "rgba(255,255,255,0.08)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.15)" }}>
              <h2 style={{ margin: "0 0 20px 0" }}>❤️ Saved Jobs Wishlist</h2>
              
              {(!user.savedJobs || user.savedJobs.length === 0) ? (
                <p style={{ opacity: 0.5 }}>Your saved jobs will appear here.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {user.savedJobs.map((job) => (
                    <div key={job._id} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <h4 style={{ margin: "0" }}>{job.title}</h4>
                        <span style={{ fontSize: "12px", opacity: 0.7 }}>{job.company} • {job.location}</span>
                      </div>
                      <button className="btn" style={{ background: "#3498db", color: "#fff", padding: "5px 12px", fontSize: "12px", borderRadius: "8px" }} onClick={() => navigate('/jobs')}>
                        Apply ↗
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Applied Jobs (Candidate Only) */}
            {user.role === 'candidate' && (
              <div className="glass-panel" style={{ padding: "30px", borderRadius: "20px", background: "rgba(255,255,255,0.08)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.15)" }}>
                <h2 style={{ margin: "0 0 20px 0" }}>💼 Job Applications Status</h2>
                
                {appliedJobs.length === 0 ? (
                  <p style={{ opacity: 0.5 }}>You haven't applied to any jobs yet.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {appliedJobs.map((job) => (
                      <div key={job._id} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "15px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <h4 style={{ margin: "0" }}>{job.title}</h4>
                          <span style={{ fontSize: "12px", opacity: 0.7 }}>{job.company} • Applied on: {job.appliedAt}</span>
                        </div>
                        <div>
                          <span style={{ 
                            background: job.status === 'Shortlisted' ? 'rgba(0, 255, 136, 0.2)' : job.status === 'Rejected' ? 'rgba(255, 77, 77, 0.2)' : 'rgba(52, 152, 219, 0.2)',
                            color: job.status === 'Shortlisted' ? '#00ff88' : job.status === 'Rejected' ? '#ff4d4d' : '#3498db',
                            border: `1px solid ${job.status === 'Shortlisted' ? 'rgba(0, 255, 136, 0.4)' : job.status === 'Rejected' ? 'rgba(255, 77, 77, 0.4)' : 'rgba(52, 152, 219, 0.4)'}`,
                            padding: "4px 12px", 
                            borderRadius: "10px", 
                            fontSize: "12px",
                            fontWeight: "bold"
                          }}>
                            {job.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
