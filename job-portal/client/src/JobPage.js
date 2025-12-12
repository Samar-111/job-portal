import React, { useEffect, useState } from 'react';
import './App.css'; 

function JobPage() {
  const [localJobs, setLocalJobs] = useState([]);    
  const [externalJobs, setExternalJobs] = useState([]); 
  const [searchTerm, setSearchTerm] = useState(""); 
  
  // New: Separate "Data" from "Visibility"
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false); // Controls if box is visible

  const [form, setForm] = useState({ title: "", company: "", location: "" });
  const [loading, setLoading] = useState(true);

  const trendingTags = ["Remote", "JavaScript", "Python", "Design", "Marketing"];

  // 1. Fetch Data
  useEffect(() => {
    const fetchAllJobs = async () => {
      setLoading(true);
      try {
        const localRes = await fetch('http://localhost:5000/jobs');
        const localData = await localRes.json();
        setLocalJobs(localData);

        const apiRes = await fetch('https://remotive.com/api/remote-jobs?category=software-dev&limit=100');
        const apiData = await apiRes.json();
        
        const formattedExternalJobs = apiData.jobs.map(job => ({
          _id: job.id, 
          title: job.title,
          company: job.company_name,
          location: job.candidate_required_location,
          isExternal: true, 
          url: job.url 
        }));
        
        setExternalJobs(formattedExternalJobs);
      } catch (error) { console.error(error); }
      setLoading(false);
    };
    fetchAllJobs();
  }, []);

  const allJobs = [...localJobs, ...externalJobs];

  // 2. Smart Suggestions Logic
  useEffect(() => {
    if (searchTerm.length > 1) {
      const allTitles = allJobs.map(job => job.title);
      const matches = allTitles.filter(title => 
        title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const uniqueMatches = [...new Set(matches)];
      
      setSuggestions(uniqueMatches);
      setShowSuggestions(true); // Show box when we have results
    } else { 
      setShowSuggestions(false); // Hide if text is empty
    }
  }, [searchTerm]); // Removed dependency on 'allJobs' to prevent flickering

  // --- Handlers ---

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setShowSuggestions(false); // Force close on Enter
    }
  };

  const handleSuggestionClick = (title) => {
    setSearchTerm(title);
    setShowSuggestions(false); // Force close on Click
  };

  // The "Blur" Trick: We delay closing slightly so the click registers
  const handleBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    // ... (Your existing submit logic)
    const response = await fetch('http://localhost:5000/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (response.ok) {
      const savedJob = await response.json();
      setLocalJobs([savedJob, ...localJobs]);
      setForm({ title: "", company: "", location: "" });
    }
  };

  const handleDelete = async (id) => {
    await fetch(`http://localhost:5000/jobs/${id}`, { method: 'DELETE' });
    setLocalJobs(localJobs.filter(job => job._id !== id));
  };

  const filteredJobs = allJobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
      <div className="shape shape-1" style={{top: "-10%", left: "-10%"}}></div>
      <div className="shape shape-3" style={{bottom: "10%", right: "-5%"}}></div>

      <div className="header">
        <h1>🔍 Find Your Dream Job</h1>
        <div style={{ position: 'relative', width: '70%', margin: '0 auto' }}>
            
            <input 
              type="text" 
              placeholder="Search by title..." 
              className="search-bar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown} 
              onFocus={() => setShowSuggestions(true)} // Open when clicked
              onBlur={handleBlur} // Close when clicking away
            />
            
            {/* LOGIC CHANGE: Check 'showSuggestions' AND length */}
            {showSuggestions && suggestions.length > 0 && (
                <ul className="suggestions-list">
                    {suggestions.slice(0, 6).map((title, index) => (
                        <li key={index} onClick={() => handleSuggestionClick(title)}>
                            {title}
                        </li>
                    ))}
                </ul>
            )}
            
            <div className="tags-container">
              <span style={{color: "rgba(255,255,255,0.7)", fontSize: "14px", alignSelf:"center"}}>Trending:</span>
              {trendingTags.map(tag => (
                <div key={tag} className="tag-pill" onClick={() => setSearchTerm(tag)}>
                  {tag}
                </div>
              ))}
            </div>

        </div>
      </div>

      <div className="job-list">
        {loading ? <h2 style={{textAlign: "center", color: "white"}}>Loading Jobs...</h2> : 
         filteredJobs.length === 0 ? <p style={{textAlign:"center", color:"white"}}>No jobs found matching "{searchTerm}"</p> : 
         filteredJobs.map((job) => (
          <div key={job._id} className="job-card" style={job.isExternal ? { borderLeft: "5px solid #00ff88" } : {}}>
            <div className="job-info">
              <h3>{job.title}</h3>
              <p>🏢 {job.company} • 📍 {job.location}</p>
              {job.isExternal && (
                <a href={job.url} target="_blank" rel="noopener noreferrer" 
                   style={{ color: "#00ff88", textDecoration: "none", fontWeight: "bold", fontSize: "14px" }}>
                   Apply on Website ↗
                </a>
              )}
            </div>
            {!job.isExternal && (
                <button onClick={() => handleDelete(job._id)} className="btn btn-delete">Delete</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default JobPage;