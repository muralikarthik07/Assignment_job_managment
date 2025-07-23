import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import JobList from './components/JobList';
import CreateJob from './components/CreateJob';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<JobList />} />
          <Route path="/find-jobs" element={<JobList />} />
          <Route path="/create-job" element={<CreateJob />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;