const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session'); // added session support
const employeeRouter = require('./routes/employee_routes');
const loginRouter = require('./routes/login_routes');
const logEventRouter = require('./routes/log_event_routes');
const errorMiddleware = require('./helpers/error_handling');
const path = require('path');
require('dotenv').config();

const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 8081;
const CLIENT_APP_DIR = process.env.CLIENT_APP_DIR;

// Whitelist your frontend origin(s) here
const allowedOrigins = ['http://127.0.0.1:5501'];

console.log(`client_app_dir: ${CLIENT_APP_DIR}, host:${process.env.DB_HOST}, user: ${process.env.DB_USER}, password:  ${process.env.DB_PASSWORD}, database: ${process.env.DB_DATABASE}`);

// CORS config to allow credentials and only whitelist specified origins
const corsOptions = {
  origin: function(origin, callback) {
    if (!origin) {
      // Allow REST clients like Postman or curl with no origin
      return callback(null, true);
    }
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // <--- allow cookies to be sent
};

app.use(cors(corsOptions));

// Static files
app.use(express.static(path.join(__dirname, '../client')));

// Request body parsing
app.use(bodyParser.json());
app.use(express.json());

// Simple session middleware - keep it basic for now
app.use(session({
  secret: 'keyboard cat',  // replace this with your own secure secret in production
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }, // set to true if you use HTTPS
}));

// Logging middleware for debugging
app.post('*', (req, res, next) => {
  console.log(`@ post, request url:${req.url}, request body: ${JSON.stringify(req.body)}`);
  next();
});
app.get('/*', (req, res, next) => {
  console.log(`@ get /, request url: ${req.url}`);
  next();
});

// Routes
app.use(express.static(path.join(CLIENT_APP_DIR, "client")));

app.get('/employee/id', (req, res) => {
  res.json({ message: 'Employee data' });
});

app.use('/admin', loginRouter);
app.use('/log_events', logEventRouter);
app.use('/api/employees', employeeRouter);

// Serve frontend client files (your existing routes)
app.get('/', (req, res) => {
  console.log("@ get /, returning index.html");
  let f = path.resolve(CLIENT_APP_DIR + '/index.html');
  console.log("f= " + f);
  res.sendFile(f);
});
app.get('/css/index.css', (req, res) => {
  console.log("@ get /, returning index.css");
  let f = path.resolve(CLIENT_APP_DIR + '/css/index.css');
  console.log("f= " + f);
  res.sendFile(f);
});
app.get('/src/index.js', (req, res) => {
  console.log("@ get /, returning index.js");
  let f = path.resolve(CLIENT_APP_DIR + '/src/index.js');
  console.log("f= " + f);
  res.sendFile(f);
});
app.get('/src/admin.js', (req, res) => {
  console.log("@ get /, returning admin.js");
  let f = path.resolve(CLIENT_APP_DIR + '/src/admin.js');
  console.log("f= " + f);
  res.sendFile(f);
});
app.get("/admin.html", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../client/admin.html"));
});
app.get('/src/timeclock_app.js', (req, res) => {
  console.log("@ get /, returning timeclock_app.js");
  let f = path.resolve(CLIENT_APP_DIR + '/src/timeclock_app.js');
  console.log("f= " + f);
  res.sendFile(f);
});
app.get('/static/*', (req, res) => {
  let f = path.resolve(CLIENT_APP_DIR + req.url);
  console.log("f= " + f);
  res.sendFile(f);
});

// Error middleware
app.use(errorMiddleware);

// Start server
app.listen(PORT, () => {
  console.log(`Timeclock server is running on http://localhost:${PORT}`);
});
