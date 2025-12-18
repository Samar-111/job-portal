import React, { useEffect, useState } from 'react';
import './App.css'; 

function JobPage() {
  const [localJobs, setLocalJobs] = useState([]);    
  const [externalJobs, setExternalJobs] = useState([]); 
  const [searchTerm, setSearchTerm] = useState(""); 
  
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false); 

  const [loading, setLoading] = useState(true);

  const trendingTags = ["Remote", "JavaScript", "Python", "Design", "Marketing"];

  useEffect(() => {
    const fetchAllJobs = async () => {
      setLoading(true);

      // --- FETCH 1: Local Jobs (Your Database) ---
      // We put this in its own try/catch so it doesn't break the page if backend is sleeping
      try {
        const localRes = await fetch('https://job-portal-nhpx.onrender.com'); 
        if (localRes.ok) {
            const localData = await localRes.json();
            setLocalJobs(localData);
        } else {
            console.log("Backend might be asleep, skipping local jobs.");
        }
      } catch (error) { 
        console.error("Error fetching local jobs:", error); 
      }

      // --- FETCH 2: External Jobs (Remotive API) ---
      // This runs even if FETCH 1 fails!
      try {
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
      } catch (error) { 
        console.error("Error fetching external jobs:", error); 
      }

      setLoading(false);
    };

    fetchAllJobs();
  }, []);

  const allJobs = [...localJobs, ...externalJobs];

  // Suggestions Logic
  useEffect(() => {
    if (searchTerm.length > 1) {
      const allTitles = allJobs.map(job => job.title);
      const matches = allTitles.filter(title => 
        title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const uniqueMatches = [...new Set(matches)];
      setSuggestions(uniqueMatches);
      setShowSuggestions(true);
    } else { 
      setShowSuggestions(false);
    }
  }, [searchTerm]); 

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') setShowSuggestions(false); 
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
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            
            {showSuggestions && suggestions.length > 0 && (
                <ul className="suggestions-list">
                    {suggestions.slice(0, 6).map((title, index) => (
                        <li key={index} onClick={() => { setSearchTerm(title); setShowSuggestions(false); }}>
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
        {loading ? (
           <h2 style={{textAlign: "center", color: "white"}}>Loading Jobs...</h2>
        ) : filteredJobs.length === 0 ? (
           <div style={{textAlign: "center", color: "white"}}>
             <h2>No jobs found matching "{searchTerm}"</h2>
             <p>Try searching for "Developer" or "Designer"</p>
           </div>
        ) : (
           filteredJobs.map((job) => (
             <div key={job._id} className="job-card" style={job.isExternal ? { borderLeft: "5px solid #00ff88" } : {}}>
               <div className="job-info">
                 <h3>{job.title}</h3>
                 <p>🏢 {job.company} • 📍 {job.location}</p>
                 <a href={job.url} target="_blank" rel="noopener noreferrer" 
                    style={{ color: "#00ff88", textDecoration: "none", fontWeight: "bold", fontSize: "14px" }}>
                    Apply on Website ↗
                 </a>
               </div>
             </div>
           ))
        )}
      </div>
    </div>
  );
}

export default JobPage;