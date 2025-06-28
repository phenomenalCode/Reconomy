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
const isProduction = process.env.NODE_ENV === 'production';

// --- CORS Setup ---
const allowedOrigins = [
  'https://darius-reconomy-proj.netlify.app',
  'https://reconomy.herokuapp.com',
];
if (!isProduction) {
  allowedOrigins.push('http://127.0.0.1:5501', 'http://localhost:5501');
}

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.warn('❌ Blocked CORS origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Preflight

// --- Middleware ---
app.use(bodyParser.json());
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction,
    sameSite: 'lax',
  },
}));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// --- Static Serving ---
app.use(express.static(CLIENT_APP_DIR));

// --- Routes ---
app.use('/admin', loginRouter);
app.use('/log_events', logEventRouter);
app.use('/api/employees', employeeRouter);

// --- Fallback for SPA ---
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
