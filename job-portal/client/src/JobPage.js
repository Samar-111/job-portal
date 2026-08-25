import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import './App.css';

function JobPage() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const userId = localStorage.getItem('userId');

  const [localJobs, setLocalJobs] = useState([]);
  const [externalJobs, setExternalJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  // Search & Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterSalary, setFilterSalary] = useState("");
  const [filterJobType, setFilterJobType] = useState("");
  const [filterSkills, setFilterSkills] = useState("");

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Recruiter Post Job Modal State
  const [showPostModal, setShowPostModal] = useState(false);
  const [postForm, setPostForm] = useState({
    title: "",
    company: "",
    location: "",
    salary: "",
    description: "",
    skillsRequired: "",
    jobType: "Full-time"
  });

  const trendingTags = ["Remote", "JavaScript", "Python", "Design", "Marketing"];
  const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://job-portal-nhpx.onrender.com';

  useEffect(() => {
    fetchProfile();
    fetchAllJobs();
  }, [filterLocation, filterSalary, filterJobType, filterSkills]);

  const fetchProfile = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/profile/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUserProfile(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllJobs = async () => {
    setLoading(true);
    // 1. Fetch Local Jobs with current filters
    try {
      let queryParams = [];
      if (filterLocation) queryParams.push(`location=${encodeURIComponent(filterLocation)}`);
      if (filterSalary) queryParams.push(`salary=${encodeURIComponent(filterSalary)}`);
      if (filterJobType) queryParams.push(`jobType=${encodeURIComponent(filterJobType)}`);
      if (filterSkills) queryParams.push(`skills=${encodeURIComponent(filterSkills)}`);
      if (searchTerm) queryParams.push(`search=${encodeURIComponent(searchTerm)}`);

      const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
      const localRes = await fetch(`${API_URL}/jobs${queryString}`);
      if (localRes.ok) {
        const localData = await localRes.json();
        setLocalJobs(localData);
      }
    } catch (error) {
      console.error("Error fetching local jobs:", error);
    }

    // 2. Fetch External Jobs (Remotive API)
    try {
      const apiRes = await fetch('https://remotive.com/api/remote-jobs?category=software-dev&limit=60');
      const apiData = await apiRes.json();

      let formattedExternalJobs = apiData.jobs.map(job => ({
        _id: `ext-${job.id}`,
        title: job.title,
        company: job.company_name,
        location: job.candidate_required_location || "Remote",
        salary: "Not disclosed",
        description: job.description || "",
        jobType: "Remote",
        skillsRequired: job.tags || [],
        isExternal: true,
        url: job.url
      }));

      // Apply client-side search filtering to external jobs
      if (searchTerm) {
        formattedExternalJobs = formattedExternalJobs.filter(job =>
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.company.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      if (filterLocation) {
        formattedExternalJobs = formattedExternalJobs.filter(job =>
          job.location.toLowerCase().includes(filterLocation.toLowerCase())
        );
      }
      if (filterJobType && filterJobType !== "Remote") {
        // If they filter specifically for non-remote, hide remotive remote jobs
        formattedExternalJobs = [];
      }

      setExternalJobs(formattedExternalJobs);
    } catch (error) {
      console.error("Error fetching external jobs:", error);
    }

    setLoading(false);
  };

  // Autocomplete Suggestions
  useEffect(() => {
    const allTitles = [...localJobs.map(j => j.title), ...externalJobs.map(j => j.title)];
    if (searchTerm.length > 1) {
      const matches = allTitles.filter(title =>
        title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSuggestions([...new Set(matches)]);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [searchTerm]);

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      setShowSuggestions(false);
      fetchAllJobs();
    }
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postForm)
      });
      if (response.ok) {
        alert("Job posted successfully!");
        setShowPostModal(false);
        setPostForm({
          title: "",
          company: "",
          location: "",
          salary: "",
          description: "",
          skillsRequired: "",
          jobType: "Full-time"
        });
        fetchAllJobs();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to post job");
      }
    } catch (err) {
      console.error(err);
      alert("Error posting job");
    }
  };

  const handleSaveJob = async (jobId) => {
    if (!token) return alert("Please log in to save jobs.");
    try {
      const response = await fetch(`${API_URL}/jobs/${jobId}/save`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        fetchProfile(); // Refresh saved status
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyJob = async (jobId) => {
    if (!token) return alert("Please log in to apply for jobs.");
    try {
      const response = await fetch(`${API_URL}/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        fetchAllJobs(); // Refresh jobs listing
      } else {
        alert(data.error || "Apply failed.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const isJobSaved = (jobId) => {
    return userProfile && userProfile.savedJobs && userProfile.savedJobs.some(j => j._id === jobId || j === jobId);
  };

  const hasApplied = (job) => {
    return job.applications && job.applications.some(app => app.candidate === userId || (app.candidate && app.candidate._id === userId));
  };

  const allJobs = [...localJobs, ...externalJobs];

  return (
    <div>
      <Navbar />
      <div className="container" style={{ marginTop: "85px" }}>
        
        {/* Decorative elements */}
        <div className="shape shape-1" style={{ top: "-10%", left: "-10%" }}></div>
        <div className="shape shape-3" style={{ bottom: "10%", right: "-5%" }}></div>

        {/* Page Title & Search Bar */}
        <div className="header">
          <h1 style={{ fontSize: "2.8rem" }}>🔍 Find Your Dream Job</h1>
          <div style={{ position: 'relative', width: '70%', margin: '0 auto', display: "flex", gap: "10px" }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                placeholder="Search jobs by title, company, or keyword..."
                className="search-bar"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchSubmit}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                style={{ width: "100%" }}
              />
              {showSuggestions && suggestions.length > 0 && (
                <ul className="suggestions-list">
                  {suggestions.slice(0, 6).map((title, index) => (
                    <li key={index} onClick={() => { setSearchTerm(title); setShowSuggestions(false); fetchAllJobs(); }}>
                      {title}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button className="btn btn-add" onClick={fetchAllJobs} style={{ padding: "0 25px" }}>Search</button>
            {role === 'recruiter' && (
              <button className="btn btn-add" onClick={() => setShowPostModal(true)} style={{ padding: "0 20px", background: "#2ecc71" }}>
                Post a Job 💼
              </button>
            )}
          </div>

          <div className="tags-container" style={{ marginTop: "15px" }}>
            <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", alignSelf: "center" }}>Trending:</span>
            {trendingTags.map(tag => (
              <div key={tag} className="tag-pill" onClick={() => { setSearchTerm(tag); setTimeout(() => fetchAllJobs(), 100); }}>
                {tag}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar + Job Grid Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: "30px", marginTop: "40px" }}>
          
          {/* Left Panel: Filters */}
          <div className="glass-panel" style={{ padding: "20px", borderRadius: "20px", height: "fit-content", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
            <h3 style={{ marginTop: 0, borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "10px" }}>Filters</h3>
            
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "12px", opacity: 0.7, display: "block", marginBottom: "5px" }}>📍 Location</label>
              <input type="text" className="form-input" placeholder="e.g. Remote, NY" value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} style={{ width: "100%", boxSizing: "border-box", fontSize: "14px", padding: "10px" }} />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "12px", opacity: 0.7, display: "block", marginBottom: "5px" }}>💰 Minimum Salary</label>
              <input type="text" className="form-input" placeholder="e.g. $80,000" value={filterSalary} onChange={(e) => setFilterSalary(e.target.value)} style={{ width: "100%", boxSizing: "border-box", fontSize: "14px", padding: "10px" }} />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "12px", opacity: 0.7, display: "block", marginBottom: "5px" }}>🧠 Skills Required</label>
              <input type="text" className="form-input" placeholder="e.g. React, Node" value={filterSkills} onChange={(e) => setFilterSkills(e.target.value)} style={{ width: "100%", boxSizing: "border-box", fontSize: "14px", padding: "10px" }} />
            </div>

            <div style={{ marginBottom: "10px" }}>
              <label style={{ fontSize: "12px", opacity: 0.7, display: "block", marginBottom: "5px" }}>💼 Job Type</label>
              <select className="form-input" value={filterJobType} onChange={(e) => setFilterJobType(e.target.value)} style={{ width: "100%", boxSizing: "border-box", fontSize: "14px", color: "#333" }}>
                <option value="">All Job Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

            <button className="btn" style={{ width: "100%", marginTop: "15px", background: "rgba(255,255,255,0.1)", color: "#fff", fontSize: "13px" }} onClick={() => { setFilterLocation(""); setFilterSalary(""); setFilterJobType(""); setFilterSkills(""); setSearchTerm(""); }}>
              Clear All
            </button>
          </div>

          {/* Right Panel: Job Listings */}
          <div className="job-list" style={{ width: "100%", display: "flex", flexDirection: "column", gap: "20px" }}>
            {loading ? (
              <h2 style={{ textAlign: "center", color: "white" }}>Loading Openings...</h2>
            ) : allJobs.length === 0 ? (
              <div style={{ textAlign: "center", color: "white", padding: "40px" }}>
                <h2>No jobs match your search filters</h2>
                <p>Try searching for "Remote" or clear the sidebar filters.</p>
              </div>
            ) : (
              allJobs.map((job) => (
                <div key={job._id} className="job-card" style={{ borderLeft: job.isExternal ? "5px solid #00ff88" : "5px solid #3498db", background: "rgba(255, 255, 255, 0.08)", backdropFilter: "blur(10px)", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "20px", padding: "25px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "5px" }}>
                      <h3 style={{ margin: 0, fontSize: "20px" }}>{job.title}</h3>
                      <span style={{ 
                        background: job.jobType === 'Remote' ? 'rgba(0, 255, 136, 0.15)' : 'rgba(52, 152, 219, 0.15)',
                        color: job.jobType === 'Remote' ? '#00ff88' : '#3498db',
                        border: `1px solid ${job.jobType === 'Remote' ? 'rgba(0, 255, 136, 0.3)' : 'rgba(52, 152, 219, 0.3)'}`,
                        fontSize: "11px",
                        padding: "2px 8px",
                        borderRadius: "10px",
                        fontWeight: "bold"
                      }}>
                        {job.jobType || "Full-time"}
                      </span>
                      {job.isExternal && (
                        <span style={{ background: "rgba(255,255,255,0.1)", color: "#fff", fontSize: "10px", padding: "2px 8px", borderRadius: "5px" }}>Remotive API</span>
                      )}
                    </div>
                    
                    <p style={{ margin: "5px 0", opacity: 0.8 }}>🏢 {job.company} • 📍 {job.location}</p>
                    <p style={{ margin: "5px 0", fontSize: "14px", color: "#00ff88", fontWeight: "bold" }}>💰 Salary: {job.salary}</p>
                    
                    {job.description && (
                      <p style={{ fontSize: "13px", opacity: 0.6, margin: "10px 0", lineHeight: "1.5", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {job.description.replace(/<[^>]*>/g, '')}
                      </p>
                    )}

                    {/* Skill Tags */}
                    {job.skillsRequired && job.skillsRequired.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px" }}>
                        {job.skillsRequired.map((skill, i) => (
                          <span key={i} style={{ background: "rgba(255,255,255,0.06)", fontSize: "11px", padding: "2px 8px", borderRadius: "5px", color: "rgba(255,255,255,0.8)" }}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions (Apply & Save) */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "flex-end", marginLeft: "20px" }}>
                    
                    {/* Save Wishlist Button (Candidates Only) */}
                    {(!role || role === 'candidate') && !job.isExternal && (
                      <button className="btn" onClick={() => handleSaveJob(job._id)} style={{ background: "transparent", border: "none", fontSize: "22px", cursor: "pointer", padding: 0 }}>
                        {isJobSaved(job._id) ? "❤️" : "🤍"}
                      </button>
                    )}

                    {/* Apply Button */}
                    {job.isExternal ? (
                      <a href={job.url} target="_blank" rel="noopener noreferrer" className="btn btn-add" style={{ textDecoration: "none", textAlign: "center", display: "inline-block", fontSize: "13px" }}>
                        Apply External ↗
                      </a>
                    ) : hasApplied(job) ? (
                      <button className="btn" style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.5)", cursor: "default", fontSize: "13px" }} disabled>
                        Applied ✓
                      </button>
                    ) : (
                      <button className="btn btn-add" onClick={() => handleApplyJob(job._id)} style={{ fontSize: "13px" }}>
                        Apply 🚀
                      </button>
                    )}

                  </div>
                </div>
              ))
            )}
          </div>

        </div>

        {/* --- RECRUITER POST JOB MODAL --- */}
        {showPostModal && (
          <div className="modal-overlay" onClick={() => setShowPostModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "550px", width: "100%" }}>
              <h2 className="modal-header" style={{ marginBottom: "20px" }}>Post a New Job Opening</h2>
              
              <form onSubmit={handlePostJob} style={{ display: "flex", flexDirection: "column", gap: "12px", textAlign: "left" }}>
                <div style={{ display: "flex", gap: "12px" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "12px", opacity: 0.8 }}>Job Title *</label>
                    <input type="text" className="form-input" style={{ width: "100%", boxSizing: "border-box" }} required value={postForm.title} onChange={(e) => setPostForm({ ...postForm, title: e.target.value })} placeholder="e.g. Lead React Dev" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "12px", opacity: 0.8 }}>Company *</label>
                    <input type="text" className="form-input" style={{ width: "100%", boxSizing: "border-box" }} required value={postForm.company} onChange={(e) => setPostForm({ ...postForm, company: e.target.value })} placeholder="e.g. Stripe" />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "12px", opacity: 0.8 }}>Location *</label>
                    <input type="text" className="form-input" style={{ width: "100%", boxSizing: "border-box" }} required value={postForm.location} onChange={(e) => setPostForm({ ...postForm, location: e.target.value })} placeholder="e.g. NY or Remote" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "12px", opacity: 0.8 }}>Salary Range</label>
                    <input type="text" className="form-input" style={{ width: "100%", boxSizing: "border-box" }} value={postForm.salary} onChange={(e) => setPostForm({ ...postForm, salary: e.target.value })} placeholder="e.g. $100k - $120k" />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "12px", opacity: 0.8 }}>Job Type *</label>
                    <select className="form-input" style={{ width: "100%", boxSizing: "border-box", color: "#333" }} value={postForm.jobType} onChange={(e) => setPostForm({ ...postForm, jobType: e.target.value })}>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                      <option value="Remote">Remote</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "12px", opacity: 0.8 }}>Skills Required (comma-separated)</label>
                    <input type="text" className="form-input" style={{ width: "100%", boxSizing: "border-box" }} value={postForm.skillsRequired} onChange={(e) => setPostForm({ ...postForm, skillsRequired: e.target.value })} placeholder="e.g. React, Node, SQL" />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "12px", opacity: 0.8 }}>Job Description *</label>
                  <textarea className="form-input" style={{ width: "100%", height: "100px", resize: "none", boxSizing: "border-box", fontFamily: "inherit" }} required value={postForm.description} onChange={(e) => setPostForm({ ...postForm, description: e.target.value })} placeholder="Describe the job roles, responsibilities, and requirements..." />
                </div>

                <div style={{ display: "flex", gap: "12px", marginTop: "15px" }}>
                  <button type="submit" className="btn btn-add" style={{ flex: 1, padding: "10px" }}>Post Opening 🚀</button>
                  <button type="button" className="btn" style={{ flex: 1, padding: "10px", background: "rgba(255,255,255,0.15)", color: "#fff" }} onClick={() => setShowPostModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default JobPage;