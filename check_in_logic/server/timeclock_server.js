const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const employeeRouter = require('./routes/employee_routes');
const loginRouter = require('./routes/login_routes');
const logEventRouter = require('./routes/log_event_routes');
const errorMiddleware = require('./helpers/error_handling');

const app = express();
const PORT = process.env.PORT || 8081;
const CLIENT_APP_DIR = process.env.CLIENT_APP_DIR;

const allowedOrigins = [
  'http://127.0.0.1:5501',                      // Local dev frontend
  'https://darius-reconomy-proj.netlify.app',  // Netlify frontend
  'https://reconomy.herokuapp.com',             // Heroku backend URL (if frontend calls backend)
];

console.log(`client_app_dir: ${CLIENT_APP_DIR}, DB_HOST: ${process.env.DB_HOST}, DB_USER: ${process.env.DB_USER}, DB_PASSWORD: ${process.env.DB_PASSWORD}, DB_DATABASE: ${process.env.DB_DATABASE}`);

// CORS configuration to allow credentials and restrict origins
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Allow REST clients like Postman or curl
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

// Serve static files from client directory (default and explicit)
app.use(express.static(path.join(__dirname, '../client')));
app.use(express.static(path.join(CLIENT_APP_DIR, 'client')));

// Parse JSON bodies
app.use(bodyParser.json());
app.use(express.json());

// Simple session middleware (consider secure options in production)
app.use(session({
  secret: 'keyboard cat', // Replace with a secure secret in production
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }, // true if HTTPS
}));

// Logging middleware for debugging requests
app.use((req, res, next) => {
  console.log(`Request ${req.method} ${req.url} - Body: ${JSON.stringify(req.body)}`);
  next();
});

// API routes
app.use('/admin', loginRouter);
app.use('/log_events', logEventRouter);
app.use('/api/employees', employeeRouter);

// Dummy route example
app.get('/employee/id', (req, res) => {
  res.json({ message: 'Employee data' });
});

// Serve frontend client files explicitly
const serveFile = (relativePath) => (req, res) => {
  const filePath = path.resolve(CLIENT_APP_DIR, relativePath);
  console.log(`Serving file: ${filePath}`);
  res.sendFile(filePath);
};

app.get('/', serveFile('index.html'));
app.get('/admin.html', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/admin.html'));
});
app.get('/css/index.css', serveFile('css/index.css'));
app.get('/src/index.js', serveFile('src/index.js'));
app.get('/src/admin.js', serveFile('src/admin.js'));
app.get('/src/timeclock_app.js', serveFile('src/timeclock_app.js'));
app.get('/static/*', (req, res) => {
  const staticFilePath = path.resolve(CLIENT_APP_DIR, req.url);
  console.log(`Serving static file: ${staticFilePath}`);
  res.sendFile(staticFilePath);
});

// Error handling middleware (must be last)
app.use(errorMiddleware);

// Start server
app.listen(PORT, () => {
  console.log(`Timeclock server running on http://localhost:${PORT}`);
});
