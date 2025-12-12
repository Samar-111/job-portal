import React, { useState } from 'react';
import axios from 'axios';

const Admin = () => {
  const [job, setJob] = useState({
    title: '', company: '', location: '', salary: '', description: '', type: 'Full-time'
  });

  const handleChange = (e) => {
    setJob({ ...job, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/jobs', job);
      alert('Job Posted Successfully!');
      setJob({ title: '', company: '', location: '', salary: '', description: '', type: 'Full-time' });
    } catch (err) {
      console.error(err);
      alert('Error posting job');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Admin Panel - Post a Job</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input name="title" placeholder="Job Title" onChange={handleChange} value={job.title} required style={styles.input} />
        <input name="company" placeholder="Company Name" onChange={handleChange} value={job.company} required style={styles.input} />
        <input name="location" placeholder="Location" onChange={handleChange} value={job.location} required style={styles.input} />
        <input name="salary" type="number" placeholder="Salary" onChange={handleChange} value={job.salary} required style={styles.input} />
        
        <select name="type" onChange={handleChange} value={job.type} style={styles.input}>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Remote">Remote</option>
        </select>

        <textarea name="description" placeholder="Job Description" rows="4" onChange={handleChange} value={job.description} required style={styles.input} />
        
        <button type="submit" style={styles.btn}>Post Job</button>
      </form>
    </div>
  );
};

const styles = {
  input: {
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '16px'
  },
  btn: {
    padding: '12px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    borderRadius: '5px'
  }
};

export default Admin;