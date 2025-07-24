import React, { useState, useEffect } from 'react';
import axios from 'axios';
import JobCard from './JobCard';


const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    jobTitle: '',
    location: '',
    jobType: '',
    salary: 0 // Changed default to 0 to show all jobs initially
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [jobs, filters]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/jobs`);
      setJobs(response.data);
      setFilteredJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
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

    // Apply salary filter only if salary is greater than 0
    if (filters.salary > 0) {
      filtered = filtered.filter(job => {
        if (!job.salary_range) return false;
        
        // Extract numbers from salary range (assuming format like "₹50k - ₹80k")
        const salaryMatch = job.salary_range.match(/₹?(\d+)k?\s*-\s*₹?(\d+)k?/);
        if (!salaryMatch) return false;
        
        const minSalary = parseInt(salaryMatch[1], 10);
        const maxSalary = parseInt(salaryMatch[2], 10);
        
        // Check if selected salary falls within the job's salary range
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
      salary: 0 // Reset to 0 to show all jobs
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <h2>Loading jobs...</h2>
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