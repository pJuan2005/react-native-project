const app = require('./app');
const config = require('./config/env');

const PORT = config.PORT;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🚀 Homestay 3-Tier Backend API is running!`);
  console.log(`🌐 Server Port     : http://0.0.0.0:${PORT}`);
  console.log(`📡 API Base URL    : http://localhost:${PORT}/api`);
  console.log(`💻 Web Admin Portal: http://localhost:${PORT}/admin`);
  console.log(`📱 Mobile Endpoint : http://localhost:${PORT}/api/homestays`);
  console.log(`🔐 Auth Endpoint   : http://localhost:${PORT}/api/auth/login`);
  console.log(`=======================================================`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

module.exports = server;
