import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateJob = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    job_title: '',
    company_name: '',
    location: '',
    job_type: '',
    salary_range: '',
    job_description: '',
    requirements: '',
    responsibilities: '',
    application_deadline: ''
  });

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);

  // Get API URL with fallback
  const API_URL = process.env.REACT_APP_API_URL || 'https://assignment-job-managment-production.up.railway.app';

  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleJobTypeSelect = (type) => {
    setFormData(prev => ({
      ...prev,
      job_type: type
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('Creating job with data:', formData);
      console.log('API URL:', `${API_URL}/api/jobs`);
      
      const response = await axios.post(`${API_URL}/api/jobs`, formData, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Job created successfully:', response.data);
      setShowModal(true);
      
      // Reset form
      setFormData({
        job_title: '',
        company_name: '',
        location: '',
        job_type: '',
        salary_range: '',
        job_description: '',
        requirements: '',
        responsibilities: '',
        application_deadline: ''
      });
    } catch (error) {
      console.error('Error creating job:', error);
      
      // More detailed error handling
      if (error.code === 'ECONNABORTED') {
        setError('Request timeout. Please check your internet connection.');
      } else if (error.response) {
        setError(`Server error: ${error.response.status} - ${error.response.data?.error || error.response.statusText}`);
      } else if (error.request) {
        setError('Cannot connect to server. Please check if the backend is running.');
      } else {
        setError('An unexpected error occurred while creating the job.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    try {
      localStorage.setItem('jobDraft', JSON.stringify(formData));
      alert('Draft saved successfully!');
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Error saving draft. Please try again.');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    navigate('/find-jobs');
  };

  return (
    <div className="create-job-container">
      <form onSubmit={handleSubmit} className="create-job-form">
        <h2 className="form-title">Create Job Opening</h2>

        {/* Error Display */}
        {error && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#fdf2f2',
            border: '1px solid #fecaca',
            borderRadius: '4px',
            color: '#e74c3c',
            marginBottom: '1rem'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="job_title">Job Title *</label>
            <input
              type="text"
              id="job_title"
              name="job_title"
              value={formData.job_title}
              onChange={handleChange}
              required
              placeholder="e.g., Full Stack Developer"
            />
          </div>

          <div className="form-group">
            <label htmlFor="company_name">Company Name *</label>
            <input
              type="text"
              id="company_name"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              required
              placeholder="e.g., Amazon"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="location">Location *</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              placeholder="e.g., Chennai"
            />
          </div>

          <div className="form-group">
            <label>Job Type *</label>
            <div className="job-type-options">
              {jobTypes.map(type => (
                <button
                  key={type}
                  type="button"
                  className={`job-type-option ${formData.job_type === type ? 'selected' : ''}`}
                  onClick={() => handleJobTypeSelect(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="salary_range">Salary Range</label>
            <input
              type="text"
              id="salary_range"
              name="salary_range"
              value={formData.salary_range}
              onChange={handleChange}
              placeholder="e.g., ₹50k - ₹80k"
            />
          </div>

          <div className="form-group">
            <label htmlFor="application_deadline">Application Deadline</label>
            <input
              type="date"
              id="application_deadline"
              name="application_deadline"
              value={formData.application_deadline}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="job_description">Job Description *</label>
          <textarea
            id="job_description"
            name="job_description"
            value={formData.job_description}
            onChange={handleChange}
            required
            placeholder="Please share a description to let the candidate know more about the job role..."
            rows={4}
          />
        </div>

        <div className="form-group full-width">
          <label htmlFor="requirements">Requirements</label>
          <textarea
            id="requirements"
            name="requirements"
            value={formData.requirements}
            onChange={handleChange}
            placeholder="List the key requirements and qualifications..."
            rows={3}
          />
        </div>

        <div className="form-group full-width">
          <label htmlFor="responsibilities">Responsibilities</label>
          <textarea
            id="responsibilities"
            name="responsibilities"
            value={formData.responsibilities}
            onChange={handleChange}
            placeholder="Describe the main responsibilities and duties..."
            rows={3}
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleSaveDraft}
            disabled={loading}
          >
            Save Draft $
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Publishing...' : 'Publish ≫'}
          </button>
        </div>
      </form>

      {/* Success Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Job Posted Successfully!</h3>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <p>Your job posting for "{formData.job_title}" at {formData.company_name} has been created successfully.</p>
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <button className="btn btn-primary" onClick={closeModal}>
                View All Jobs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateJob;