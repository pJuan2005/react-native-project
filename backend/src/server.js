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

  // Background Worker 1: Tự động quét và giải phóng các phòng giữ chỗ quá 15 phút chưa thanh toán mỗi 60 giây
  const BookingModel = require('./models/booking.model');
  setInterval(async () => {
    try {
      const purged = await BookingModel.cleanupExpiredPendingBookings();
      if (purged > 0) {
        console.log(`[Auto-Expire Worker] Đã tự động giải phóng ${purged} đơn phòng quá hạn thanh toán 15 phút.`);
      }
    } catch (_) {}
  }, 60000);

  // Background Worker 2: Scheduled Auto-Payout Worker (Tự động chi trả rút tiền định kỳ vào ngày cố định / batch queue)
  const WalletService = require('./services/wallet.service');
  setInterval(async () => {
    try {
      const now = new Date();
      const currentDay = now.getDate(); // Ngày trong tháng
      // Lịch chi trả tự động định kỳ: ngày 5, 15, 25 hàng tháng (hoặc chạy quét tự động ngầm định kỳ)
      const isPayoutDay = [5, 15, 25].includes(currentDay);
      if (isPayoutDay) {
        const result = await WalletService.runScheduledAutoPayout({ maxBatch: 20 });
        if (result.processedCount > 0) {
          console.log(`[Auto-Payout Cron] Đã tự động giải ngân thành công ${result.processedCount} lệnh rút tiền (Tổng: ${result.totalAmount.toLocaleString('vi-VN')}₫).`);
        }
      }
    } catch (cronErr) {
      console.warn('[Auto-Payout Cron Warning]:', cronErr.message);
    }
  }, 300000); // Quét mỗi 5 phút trong ngày chi trả
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

module.exports = server;
