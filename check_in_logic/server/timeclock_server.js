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

// Use absolute path to client dir (either from env or default)
const CLIENT_APP_DIR = path.resolve(process.env.CLIENT_APP_DIR || 'check_in_logic/client');

// CORS setup
const allowedOrigins = [
  'http://127.0.0.1:5501',
  'https://darius-reconomy-proj.netlify.app',
  'https://reconomy.herokuapp.com',
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};

app.use(cors(corsOptions));

// Parse request bodies
app.use(bodyParser.json());
app.use(express.json());

// Session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }, // Set true in production with HTTPS
}));

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`Request ${req.method} ${req.url} - Body: ${JSON.stringify(req.body)}`);
  next();
});

// Serve all static frontend files from client dir
app.use(express.static(CLIENT_APP_DIR));

// API routes
app.use('/admin', loginRouter);
app.use('/log_events', logEventRouter);
app.use('/api/employees', employeeRouter);

// Catch-all fallback (optional for SPA routes)
app.get('*', (req, res) => {
  res.sendFile(path.join(CLIENT_APP_DIR, 'index.html'));
});

// Error handler
app.use(errorMiddleware);

// Start server
app.listen(PORT, () => {
  console.log(`✅ Timeclock server running on http://localhost:${PORT}`);
});
