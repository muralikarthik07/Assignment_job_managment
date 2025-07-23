 import React from 'react';

const JobCard = ({ job }) => {
  const getCompanyLogoClass = (companyName) => {
    const name = companyName.toLowerCase();
    if (name.includes('amazon')) return 'logo-amazon';
    if (name.includes('tesla')) return 'logo-tesla';
    if (name.includes('meta')) return 'logo-meta';
    if (name.includes('google')) return 'logo-google';
    return 'logo-default';
  };

  const getCompanyInitial = (companyName) => {
    return companyName.charAt(0).toUpperCase();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays <= 30) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const handleApply = () => {
    alert(`Applied for ${job.job_title} at ${job.company_name}!`);
  };

  return (
    <div className="job-card">
      <div className="job-posted">
        {formatDate(job.created_at)}
      </div>
      
      <div className="job-header">
        <div className={`company-logo ${getCompanyLogoClass(job.company_name)}`}>
          {getCompanyInitial(job.company_name)}
        </div>
        <div>
          <div className="job-title">{job.job_title}</div>
          <div style={{ color: '#666', fontSize: '0.9rem' }}>
            {job.company_name}
          </div>
        </div>
      </div>

      <div className="job-meta">
        <span>📍 {job.location}</span>
        <span>💼 {job.job_type}</span>
        {job.salary_range && <span>💰 {job.salary_range}</span>}
      </div>

      {job.job_description && (
        <div className="job-description">
          {job.job_description.length > 100 
            ? `${job.job_description.substring(0, 100)}...` 
            : job.job_description}
        </div>
      )}

      <div className="job-badges">
        <span className="badge">Onsite</span>
        <span className="badge">12LPA</span>
      </div>

      <button className="apply-btn" onClick={handleApply}>
        Apply Now
      </button>
    </div>
  );
};

export default JobCard;