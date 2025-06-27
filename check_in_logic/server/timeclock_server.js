// timeclock_server.js

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
require('dotenv').config();

// Routers
const employeeRouter = require('./routes/employee_routes');
const loginRouter = require('./routes/login_routes');
const logEventRouter = require('./routes/log_event_routes');
const errorMiddleware = require('./helpers/error_handling');

// App setup
const app = express();
const PORT = process.env.PORT || 8081;
const CLIENT_APP_DIR = path.resolve(process.env.CLIENT_APP_DIR || 'check_in_logic/client');

// --- CORS Setup ---
const allowedOrigins = [
  'http://127.0.0.1:5501',
  'https://darius-reconomy-proj.netlify.app',
  'https://reconomy.herokuapp.com',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// --- Body Parsers ---
app.use(bodyParser.json());
app.use(express.json());

// --- Session ---
app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // true if in production with HTTPS
    sameSite: 'lax'
  }
}));

// --- Logging ---
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// --- Static File Serving ---
app.use(express.static(CLIENT_APP_DIR)); // Serves JS, CSS, images, etc.

// --- API Routes ---
app.use('/admin', loginRouter);
app.use('/log_events', logEventRouter);
app.use('/api/employees', employeeRouter);

// --- Fallback Route for SPA ---
app.get('*', (req, res) => {
  const indexPath = path.join(CLIENT_APP_DIR, 'index.html');
  res.sendFile(indexPath, err => {
    if (err) {
      console.error('❌ Failed to serve index.html:', err);
      res.status(500).send('Internal Server Error');
    }
  });
});

// --- Error Middleware ---
app.use(errorMiddleware);

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`✅ Timeclock server running at http://localhost:${PORT}`);
});
