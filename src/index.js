const express = require('express');
const path = require('path');
const helmet = require('helmet');

const app = express();

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Serve static files from 'public' folder
app.use(express.static(path.join(__dirname, '../public')));

// Middleware to parse incoming JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Use helmet for security headers
app.use(helmet());

// Import routes
const adminRoutes = require('./routes/admin');
const studentRoutes = require('./routes/student');

// Use routes
app.use('/admin', adminRoutes);
app.use('/student', studentRoutes);

// Serve the main page
app.get('/', (req, res) => {
  res.render('main'); // Ensure a main.ejs view exists
});

// 404 Error Handler
app.use((req, res, next) => {
  res.status(404).render('404'); // Ensure a 404.ejs view exists
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!'); // Customize this message or view as needed
});

// Set up the server to listen on port 7000
const port = process.env.PORT || 7000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
