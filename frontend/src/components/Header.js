import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          <div className="logo-icon">
            <span>j</span>
          </div>
          <span></span>
        </Link>
        
        <nav>
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/find-jobs">Find Jobs</Link></li>
            <li><a href="#talents">Find Talents</a></li>
            <li><a href="#about">About us</a></li>
            <li><a href="#testimonials">Testimonials</a></li>
            <li><Link to="/create-job" className="create-job-btn">Create Jobs</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;