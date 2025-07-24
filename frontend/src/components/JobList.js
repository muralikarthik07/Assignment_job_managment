import React, { useState, useEffect } from 'react';
import axios from 'axios';
import JobCard from './JobCard';

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    jobTitle: '',
    location: '',
    jobType: '',
    salary: 0
  });

  // Get API URL with fallback
  const API_URL = process.env.REACT_APP_API_URL || 'https://assignment-job-managment-production.up.railway.app';

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [jobs, filters]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching jobs from:', `${API_URL}/api/jobs`);
      
      // First test if backend is reachable
      const healthResponse = await axios.get(`${API_URL}/api/health`, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Health check successful:', healthResponse.data);
      
      // If health check passes, fetch jobs
      const response = await axios.get(`${API_URL}/api/jobs`, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Jobs fetched successfully:', response.data);
      setJobs(response.data);
      setFilteredJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      
      // More detailed error handling
      if (error.code === 'ECONNABORTED') {
        setError('Request timeout. Please check your internet connection.');
      } else if (error.response) {
        setError(`Server error: ${error.response.status} - ${error.response.statusText}`);
      } else if (error.request) {
        setError('Cannot connect to server. Please check if the backend is running.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = jobs;

    if (filters.jobTitle) {
      filtered = filtered.filter(job =>
        job.job_title.toLowerCase().includes(filters.jobTitle.toLowerCase())
      );
    }

    if (filters.location) {
      filtered = filtered.filter(job =>
        job.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.jobType) {
      filtered = filtered.filter(job => job.job_type === filters.jobType);
    }

    if (filters.salary > 0) {
      filtered = filtered.filter(job => {
        if (!job.salary_range) return false;
        
        const salaryMatch = job.salary_range.match(/₹?(\d+)k?\s*-\s*₹?(\d+)k?/);
        if (!salaryMatch) return false;
        
        const minSalary = parseInt(salaryMatch[1], 10);
        const maxSalary = parseInt(salaryMatch[2], 10);
        
        return filters.salary >= minSalary && filters.salary <= maxSalary;
      });
    }

    setFilteredJobs(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSalaryChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setFilters(prev => ({
      ...prev,
      salary: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      jobTitle: '',
      location: '',
      jobType: '',
      salary: 0
    });
  };

  const retryFetch = () => {
    fetchJobs();
  };

  if (loading) {
    return (
      <div className="loading">
        <h2>Loading jobs...</h2>
        <p>Connecting to backend at: {API_URL}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container" style={{ 
        padding: '2rem', 
        textAlign: 'center', 
        color: '#e74c3c',
        backgroundColor: '#fdf2f2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        margin: '2rem'
      }}>
        <h2>Connection Error</h2>
        <p>{error}</p>
        <p><strong>Backend URL:</strong> {API_URL}</p>
        <button 
          onClick={retryFetch}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '1rem'
          }}
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="job-list-container">
      {/* Filters Section */}
      <div className="filters-section">
        <div className="filters-header">
          <h2>Find Your Perfect Job</h2>
          <button onClick={clearFilters} className="btn btn-secondary">
            Clear Filters
          </button>
        </div>
        
        <div className="filters-row">
          <div className="filter-group">
            <label htmlFor="jobTitle">Job Title</label>
            <input
              type="text"
              id="jobTitle"
              name="jobTitle"
              placeholder="Search By Job Title, Role"
              value={filters.jobTitle}
              onChange={handleFilterChange}
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="location">Preferred Location</label>
            <input
              type="text"
              id="location"
              name="location"
              placeholder="Enter location"
              value={filters.location}
              onChange={handleFilterChange}
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="jobType">Job Type</label>
            <select
              id="jobType"
              name="jobType"
              value={filters.jobType}
              onChange={handleFilterChange}
            >
              <option value="">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Expected Salary Per Month</label>
            <div className="salary-range-slider">
              <div className="range-values">
                <span>{filters.salary === 0 ? 'All Salaries' : `₹${filters.salary}k`}</span>
              </div>
              <div className="single-range-slider">
                <input
                  type="range"
                  id="salary"
                  name="salary"
                  min="0"
                  max="200"
                  step="5"
                  value={filters.salary}
                  onChange={handleSalaryChange}
                  className="range-slider thin-slider"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      {filteredJobs.length > 0 ? (
        <div className="jobs-grid">
          {filteredJobs.map(job => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <div className="no-jobs">
          <h3>No jobs found</h3>
          <p>Try adjusting your filters or check back later for new opportunities.</p>
        </div>
      )}
    </div>
  );
};

export default JobList;