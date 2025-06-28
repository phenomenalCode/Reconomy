require('dotenv').config();
const express  = require('express');
const session  = require('express-session');
const cors     = require('cors');
const path     = require('path');

const employeeRouter   = require('./routes/employee_routes');
const loginRouter      = require('./routes/login_routes');
const logEventRouter   = require('./routes/log_event_routes');
const errorMiddleware  = require('./helpers/error_handling');

const app = express();
const PORT = process.env.PORT || 8081;

// Absolute path to client folder (React/Vite/etc.)
const CLIENT_APP_DIR = path.resolve(process.env.CLIENT_APP_DIR || 'check_in_logic/client');

// ─────────────────────────────────────────────────────────────────────────────
// CORS SETUP — GLOBAL & HEROKU-PROOF
// ─────────────────────────────────────────────────────────────────────────────
const corsOptions = {
  origin: "https://darius-reconomy-proj.netlify.app", // Your real frontend domain
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Use only this cors middleware
app.use(cors(corsOptions));

// ─────────────────────────────────────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────────────────────────────────────
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  },
}));

// Request logging (for debugging)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ─────────────────────────────────────────────────────────────────────────────
// STATIC ASSETS
// ─────────────────────────────────────────────────────────────────────────────
app.use(express.static(CLIENT_APP_DIR));

// ─────────────────────────────────────────────────────────────────────────────
// API ROUTES
// ─────────────────────────────────────────────────────────────────────────────
app.use('/admin',         loginRouter);
app.use('/log_events',    logEventRouter);
app.use('/api/employees', employeeRouter);

// ─────────────────────────────────────────────────────────────────────────────
// SPA FALLBACK — For client-side routing
// ─────────────────────────────────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(CLIENT_APP_DIR, 'index.html'), err => {
    if (err) {
      console.error('❌ Failed to serve index.html:', err);
      res.status(500).send('Internal Server Error');
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ERROR HANDLING
// ─────────────────────────────────────────────────────────────────────────────
app.use(errorMiddleware);

// ─────────────────────────────────────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Timeclock server running on port ${PORT}`);
});
