const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const adminPool = require('../config/config').adminPool;

// Serve Admin login page
router.get('/login', (req, res) => {
  res.render('admin/admin_login');
});

// Serve Admin signup page
router.get('/signup', (req, res) => {
  res.render('admin/admin_signup');
});

// Handle Admin Registration
router.post('/signup', async (req, res) => {
  try {
    const data = {
      name: req.body.name,
      admin_id: req.body.admin_id,
      branch: req.body.branch,
      email: req.body.email,
      password: req.body.password
    };

    // Check if admin already exists
    adminPool.query('SELECT * FROM admins WHERE admin_id = ?', [data.admin_id], (error, results) => {
      if (error) {
        console.error('Error querying database:', error);
        return res.status(500).send('Internal server error');
      }

      if (results.length > 0) {
        res.send("Admin already exists. Please choose a different admin ID.");
      } else {
        // Hash the password using bcrypt
        const saltRounds = 10;
        bcrypt.hash(data.password, saltRounds, (err, hashedPassword) => {
          if (err) {
            console.error('Error hashing password:', err);
            return res.status(500).send('Internal server error');
          }

          data.password = hashedPassword;

          // Insert the new admin
          adminPool.query(
            'INSERT INTO admins (name, admin_id, branch, email, password) VALUES (?, ?, ?, ?, ?)',
            [data.name, data.admin_id, data.branch, data.email, data.password],
            (error) => {
              if (error) {
                console.error('Error inserting admin:', error);
                return res.status(500).send('Internal server error');
              }

              res.send("Admin registered successfully");
            }
          );
        });
      }
    });
  } catch (error) {
    console.error('Error registering admin:', error);
    res.status(500).send('Internal server error');
  }
});

// Handle Admin Login
router.post('/login', (req, res) => {
  try {
    adminPool.query('SELECT * FROM admins WHERE admin_id = ?', [req.body.admin_id], (error, results) => {
      if (error) {
        console.error('Error querying database:', error);
        return res.status(500).send('Internal server error');
      }

      if (results.length === 0) {
        res.send("Admin ID cannot be found");
      } else {
        // Compare the hashed password
        bcrypt.compare(req.body.password, results[0].password, (err, isPasswordMatch) => {
          if (err) {
            console.error('Error comparing passwords:', err);
            return res.status(500).send('Internal server error');
          }

          if (isPasswordMatch) {
            res.render('admin/admin_home'); // Adjust as needed
          } else {
            res.send("Wrong password");
          }
        });
      }
    });
  } catch (error) {
    console.error('Error during admin login:', error);
    res.status(500).send('Internal server error');
  }
});

// Handle Admin Logout
router.get('/logout', (req, res) => {
  // Implement session or token destruction here if needed
  res.redirect('/admin/login');
});

module.exports = router;
