const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const homestayRoutes = require('./routes/homestay.routes');
const usersRoutes = require('./routes/users.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve Web Admin Dashboard SPA statically
app.use('/admin', express.static(path.join(__dirname, '../../admin-web')));

// API Routes
app.use('/api', homestayRoutes);
app.use('/api', usersRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Homestay Backend REST API is running',
    version: '1.0.0',
    adminUrl: `http://localhost:${PORT}/admin`,
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=========================================`);
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`💻 Web Admin Dashboard: http://localhost:${PORT}/admin`);
  console.log(`📱 Mobile API: http://localhost:${PORT}/api/homestays`);
  console.log(`=========================================`);
});
