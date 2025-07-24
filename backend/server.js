require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL Connection
const db = mysql.createConnection({
  host: process.env.MYSQLHOST || 'localhost',
  user: process.env.MYSQLUSER || 'root',
  password: process.env.MYSQLPASSWORD || '',
  database: process.env.MYSQLDATABASE || 'job_portal',
  port: process.env.MYSQLPORT || 3306
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');

  // Create jobs table if it doesn't exist
  const createJobsTable = `
    CREATE TABLE IF NOT EXISTS jobs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      job_title VARCHAR(255) NOT NULL,
      company_name VARCHAR(255) NOT NULL,
      location VARCHAR(255) NOT NULL,
      job_type ENUM('Full-time', 'Part-time', 'Contract', 'Internship') NOT NULL,
      salary_range VARCHAR(100),
      job_description TEXT,
      requirements TEXT,
      responsibilities TEXT,
      application_deadline DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  db.query(createJobsTable, (err, result) => {
    if (err) {
      console.error('Error creating jobs table:', err);
    } else {
      console.log('Jobs table ready');

      // Insert sample data if table is empty
      const checkData = 'SELECT COUNT(*) as count FROM jobs';
      db.query(checkData, (err, result) => {
        if (err) {
          console.error('Error checking data:', err);
        } else if (result[0].count === 0) {
          const sampleJobs = [
            ['Full Stack Developer', 'Amazon', 'Chennai', 'Full-time', '₹50k - ₹80k', 'A user-friendly interface lets you browse stunning photos and videos', 'React, Node.js, MySQL', 'Develop web applications', '2024-08-30'],
            ['Node Js Developer', 'Tesla', 'Bangalore', 'Full-time', '₹60k - ₹90k', 'Backend development with Node.js', 'Node.js, Express, MongoDB', 'Build APIs and services', '2024-08-25'],
            ['UX/UI Designer', 'Meta', 'Mumbai', 'Part-time', '₹40k - ₹70k', 'Design user interfaces and experiences', 'Figma, Adobe XD, Sketch', 'Create wireframes and prototypes', '2024-09-15'],
            ['Full Stack Developer', 'Google', 'Hyderabad', 'Contract', '₹70k - ₹100k', 'Full stack web development', 'React, Python, PostgreSQL', 'End-to-end development', '2024-09-01']
          ];

          const insertQuery = 'INSERT INTO jobs (job_title, company_name, location, job_type, salary_range, job_description, requirements, responsibilities, application_deadline) VALUES ?';
          db.query(insertQuery, [sampleJobs], (err, result) => {
            if (err) {
              console.error('Error inserting sample data:', err);
            } else {
              console.log('Sample data inserted');
            }
          });
        }
      });
    }
  });
});

// Routes

// Get all jobs with filters
app.get('/api/jobs', (req, res) => {
  let query = 'SELECT * FROM jobs WHERE 1=1';
  const params = [];

  if (req.query.job_title) {
    query += ' AND job_title LIKE ?';
    params.push(`%${req.query.job_title}%`);
  }

  if (req.query.location) {
    query += ' AND location LIKE ?';
    params.push(`%${req.query.location}%`);
  }

  if (req.query.job_type) {
    query += ' AND job_type = ?';
    params.push(req.query.job_type);
  }

  if (req.query.salary_min && req.query.salary_max) {
    query += ' AND salary_range IS NOT NULL';
  }

  query += ' ORDER BY created_at DESC';

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error fetching jobs:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json(results);
    }
  });
});

// Get single job by ID
app.get('/api/jobs/:id', (req, res) => {
  const jobId = req.params.id;
  const query = 'SELECT * FROM jobs WHERE id = ?';

  db.query(query, [jobId], (err, results) => {
    if (err) {
      console.error('Error fetching job:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else if (results.length === 0) {
      res.status(404).json({ error: 'Job not found' });
    } else {
      res.json(results[0]);
    }
  });
});

// Create new job
app.post('/api/jobs', (req, res) => {
  const {
    job_title,
    company_name,
    location,
    job_type,
    salary_range,
    job_description,
    requirements,
    responsibilities,
    application_deadline
  } = req.body;

  const query = `
    INSERT INTO jobs (
      job_title, company_name, location, job_type, salary_range,
      job_description, requirements, responsibilities, application_deadline
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    job_title, company_name, location, job_type, salary_range,
    job_description, requirements, responsibilities, application_deadline
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error creating job:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.status(201).json({
        message: 'Job created successfully',
        jobId: result.insertId
      });
    }
  });
});

// Update job
app.put('/api/jobs/:id', (req, res) => {
  const jobId = req.params.id;
  const {
    job_title,
    company_name,
    location,
    job_type,
    salary_range,
    job_description,
    requirements,
    responsibilities,
    application_deadline
  } = req.body;

  const query = `
    UPDATE jobs SET
      job_title = ?, company_name = ?, location = ?, job_type = ?,
      salary_range = ?, job_description = ?, requirements = ?,
      responsibilities = ?, application_deadline = ?
    WHERE id = ?
  `;

  const values = [
    job_title, company_name, location, job_type, salary_range,
    job_description, requirements, responsibilities, application_deadline, jobId
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error updating job:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Job not found' });
    } else {
      res.json({ message: 'Job updated successfully' });
    }
  });
});

// Delete job
app.delete('/api/jobs/:id', (req, res) => {
  const jobId = req.params.id;
  const query = 'DELETE FROM jobs WHERE id = ?';

  db.query(query, [jobId], (err, result) => {
    if (err) {
      console.error('Error deleting job:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Job not found' });
    } else {
      res.json({ message: 'Job deleted successfully' });
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
