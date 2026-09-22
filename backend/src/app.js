const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const routes = require('./routes');
const webRoutes = require('./web/routes');
const webAuthRouter = require('./web/routes/auth.route');
const loadUser = require('./web/middlewares/loadUser.middleware');
const { notFoundHandler, errorHandler } = require('./middlewares/error.middleware');

const app = express();

// Allowed Origins for Web Admin, Host Portal, and Mobile
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'http://localhost:8081',
  'http://127.0.0.1:8081',
];

app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.startsWith('http://localhost') ||
        origin.startsWith('http://127.0.0.1') ||
        origin.startsWith('http://192.168.')
      ) {
        callback(null, true);
        return;
      }
      callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(cookieParser());

// Session Middleware for Web Admin & Host
app.use(
  session({
    name: 'hs.sid',
    secret: process.env.SESSION_SECRET || 'homestay_super_secret_session_2026',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

// Load current user from session
app.use(loadUser);

// Static file serving for uploads (Property & payment proof images)
const uploadsDir = path.join(__dirname, '../uploads');
app.use(
  '/uploads',
  express.static(uploadsDir, {
    maxAge: '30d',
    setHeaders(res) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    },
  })
);

// Web Admin & Host Portal API Routes
app.use('/api/auth', webAuthRouter);
app.use('/api', webRoutes);

// Mobile App REST API Routes
app.use('/api', routes);

// 404 & Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
