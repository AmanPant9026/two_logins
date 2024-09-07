const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const path = require('path');
const multer = require('multer');
const studentPool = require('../config/config').studentPool;

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../public/uploads')); // Directory where the files will be saved
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to the filename to avoid conflicts
  }
});

const upload = multer({ storage: storage });

// Serve Student login page
router.get('/login', (req, res) => {
  res.render('student/student_login');
});

// Serve Student signup page
router.get('/signup', (req, res) => {
  res.render('student/student_signup');
});

// Handle Student Registration
router.post('/signup', upload.single('photo'), async (req, res) => {
  try {
    const data = {
      name: req.body.name,
      enrollment: req.body.enrollment,
      branch: req.body.branch,
      email: req.body.email,
      password: req.body.password,
      photo: req.file ? req.file.filename : null // Handle file upload
    };

    // Check if student already exists
    studentPool.query('SELECT * FROM users WHERE enrollment = ?', [data.enrollment], (error, results) => {
      if (error) {
        console.error('Error querying database:', error);
        return res.status(500).send('Internal server error');
      }

      if (results.length > 0) {
        res.send("Student already exists. Please choose a different enrollment ID.");
      } else {
        // Hash the password using bcrypt
        const saltRounds = 10;
        bcrypt.hash(data.password, saltRounds, (err, hashedPassword) => {
          if (err) {
            console.error('Error hashing password:', err);
            return res.status(500).send('Internal server error');
          }

          data.password = hashedPassword;

          // Insert the new student
          studentPool.query(
            'INSERT INTO users (name, enrollment, branch, email, password, photo) VALUES (?, ?, ?, ?, ?, ?)',
            [data.name, data.enrollment, data.branch, data.email, data.password, data.photo],
            (error) => {
              if (error) {
                console.error('Error inserting student:', error);
                return res.status(500).send('Internal server error');
              }

              res.send("Student registered successfully");
            }
          );
        });
      }
    });
  } catch (error) {
    console.error('Error registering student:', error);
    res.status(500).send('Internal server error');
  }
});

// Handle Student Login
router.post('/login', (req, res) => {
  try {
    studentPool.query('SELECT * FROM users WHERE enrollment = ?', [req.body.enrollment], (error, results) => {
      if (error) {
        console.error('Error querying database:', error);
        return res.status(500).send('Internal server error');
      }

      if (results.length === 0) {
        res.send("Enrollment ID cannot be found");
      } else {
        // Compare the hashed password
        bcrypt.compare(req.body.password, results[0].password, (err, isPasswordMatch) => {
          if (err) {
            console.error('Error comparing passwords:', err);
            return res.status(500).send('Internal server error');
          }

          if (isPasswordMatch) {
            res.render('student/student_home'); // Adjust as needed
          } else {
            res.send("Wrong password");
          }
        });
      }
    });
  } catch (error) {
    console.error('Error during student login:', error);
    res.status(500).send('Internal server error');
  }
});

// Handle Student Logout
router.get('/logout', (req, res) => {
  // Implement session or token destruction here if needed
  res.redirect('/student/login');
});

module.exports = router;
