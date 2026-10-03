const app = require('./app');
const config = require('./config/env');
const migrateDatabase = require('./config/dbMigrate');

const PORT = config.PORT;

const server = app.listen(PORT, '0.0.0.0', async () => {
  console.log(`=======================================================`);
  console.log(`🚀 Homestay 3-Tier Backend API is running!`);
  console.log(`📡 Backend API Base : http://localhost:${PORT}/api`);
  console.log(`💻 Web Portal (Next): http://localhost:3001  (chạy lệnh: cd web && npm run dev)`);
  console.log(`👑 Admin Dashboard  : http://localhost:3001/admin/dashboard`);
  console.log(`🏡 Host Workspace   : http://localhost:3001/host/dashboard`);
  console.log(`🏨 Lễ tân Walk-in   : http://localhost:3001/quick-manage/HMTOKEN_0001`);
  console.log(`📱 Mobile Endpoint  : http://localhost:${PORT}/api/homestays`);
  console.log(`=======================================================`);

  // Run DB Schema Auto-Migration
  await migrateDatabase();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

module.exports = server;
