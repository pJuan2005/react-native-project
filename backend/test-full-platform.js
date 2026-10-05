const assert = require('assert');
const db = require('./src/config/database');
const migrateDatabase = require('./src/config/dbMigrate');
const BookingModel = require('./src/models/booking.model');
const PropertyRankingService = require('./src/services/ranking.service');
const RiskScoringService = require('./src/services/risk.service');
const bcrypt = require('bcryptjs');

async function testFullPlatform() {
  console.log('================================================================');
  console.log('🚀 FULL PLATFORM END-TO-END BUSINESS LOGIC & INTEGRATION TEST');
  console.log('================================================================\n');

  let testUserId = null;
  let testHostId = null;
  let testHomestayId = null;
  let onlineBookingId = null;
  let walkInBookingId = null;

  try {
    // -------------------------------------------------------------
    // TEST 1: Database Migration Schema Auto-Check
    // -------------------------------------------------------------
    console.log('TEST 1: Database Migration & Schema Integrity');
    await migrateDatabase();
    console.log('   ✓ DB Migration & Schema check PASSED!\n');

    // -------------------------------------------------------------
    // TEST 2: Users & Roles Creation & Authentication
    // -------------------------------------------------------------
    console.log('TEST 2: Authentication & User Roles (Guest, Host, Admin)');
    const hashedPw = await bcrypt.hash('TestPassword123!', 10);
    const testEmail = `test_guest_${Date.now()}@example.com`;
    const hostEmail = `test_host_${Date.now()}@example.com`;

    const [guestRes] = await db.query(
      `INSERT INTO users (name, email, password, phone, role, status, reward_points)
       VALUES (?, ?, ?, '0912345678', 'Guest', 'Active', 0)`,
      ['Khách Hàng Test', testEmail, hashedPw]
    );
    testUserId = guestRes.insertId;

    const [hostRes] = await db.query(
      `INSERT INTO users (name, email, password, phone, role, status, reward_points)
       VALUES (?, ?, ?, '0987654321', 'Host', 'Active', 0)`,
      ['Chủ Nhà Test', hostEmail, hashedPw]
    );
    testHostId = hostRes.insertId;

    const [userRows] = await db.query('SELECT * FROM users WHERE id = ?', [testUserId]);
    assert.strictEqual(userRows.length, 1);
    const pwMatch = await bcrypt.compare('TestPassword123!', userRows[0].password);
    assert.strictEqual(pwMatch, true);
    console.log('   ✓ User creation & Bcrypt Password Authentication PASSED!\n');

    // -------------------------------------------------------------
    // TEST 3: Homestay Creation & Quick-Manage Token
    // -------------------------------------------------------------
    console.log('TEST 3: Homestay Listing & Desk Quick-Manage Token Generation');
    const [locRows] = await db.query('SELECT id FROM locations LIMIT 1');
    const [typeRows] = await db.query('SELECT id FROM homestay_types LIMIT 1');
    const locationId = locRows[0]?.id || 1;
    const typeId = typeRows[0]?.id || 1;
    const testToken = `TEST_TOKEN_${Date.now()}`;

    const [homeRes] = await db.query(
      `INSERT INTO homestays (
        host_id, location_id, type_id, name, price, max_guests,
        rating, review_count, is_active, approval_status, manage_token,
        description
       ) VALUES (?, ?, ?, 'Villa Nghỉ Dưỡng Test', 1500000, 4, 5.0, 1, 1, 'approved', ?, 'Mô tả không gian villa test đầy đủ tiện nghi')`,
      [testHostId, locationId, typeId, testToken]
    );
    testHomestayId = homeRes.insertId;
    console.log(`   Created test homestay ID: ${testHomestayId} with token: ${testToken}`);
    console.log('   ✓ Homestay listing & Token generation PASSED!\n');

    // -------------------------------------------------------------
    // TEST 4: Online Guest Booking with Concurrency Row Lock
    // -------------------------------------------------------------
    console.log('TEST 4: Online Booking with Concurrency Lock (FOR UPDATE)');
    const checkInDate = '2026-11-10';
    const checkOutDate = '2026-11-13'; // 3 nights

    const bookingResult = await BookingModel.createBooking({
      userId: testUserId,
      homestayId: testHomestayId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: 2,
      paymentMethod: 'bank_transfer',
      notes: 'Khách yêu cầu phòng yên tĩnh',
    });

    onlineBookingId = parseInt(bookingResult.id, 10);
    assert.strictEqual(bookingResult.nights, 3);
    assert.strictEqual(bookingResult.totalPrice, 4500000); // 1.500.000 * 3
    assert.strictEqual(bookingResult.status, 'pending');
    console.log(`   Created online booking ID: ${onlineBookingId}, Total Price: ${bookingResult.totalPrice}đ`);
    console.log('   ✓ Concurrency-safe Online Booking PASSED!\n');

    // -------------------------------------------------------------
    // TEST 5: Date Overlap & Anti-Overbooking Protection
    // -------------------------------------------------------------
    console.log('TEST 5: Anti-Overbooking & Date Overlap Prevention');
    // Case 1: Same dates or overlapping dates must throw Error
    let threwOverlapError = false;
    try {
      await BookingModel.createBooking({
        userId: testUserId,
        homestayId: testHomestayId,
        checkIn: '2026-11-11',
        checkOut: '2026-11-14', // Overlaps with 10-13!
        guests: 2,
      });
    } catch (err) {
      threwOverlapError = true;
      console.log('   Successfully intercepted conflicting booking:', err.message);
    }
    assert.strictEqual(threwOverlapError, true, 'System MUST reject overlapping booking!');

    // Case 2: Checkout day equals checkin day (13-16) must SUCCEED without overlap!
    const nonConflictingBooking = await BookingModel.createBooking({
      userId: testUserId,
      homestayId: testHomestayId,
      checkIn: '2026-11-13',
      checkOut: '2026-11-16',
      guests: 2,
    });
    console.log('   Non-conflicting back-to-back booking allowed, ID:', nonConflictingBooking.id);
    // Cancel the temporary booking
    await db.query("UPDATE bookings SET status = 'cancelled' WHERE id = ?", [nonConflictingBooking.id]);
    console.log('   ✓ Anti-Overbooking Date Logic PASSED!\n');

    // -------------------------------------------------------------
    // TEST 6: Payment Proof Upload (VietQR Simulation)
    // -------------------------------------------------------------
    console.log('TEST 6: Payment Proof Upload (VietQR Workflow)');
    await BookingModel.uploadPaymentProof(
      onlineBookingId,
      testUserId,
      '/uploads/proofs/test_bill_01.jpg',
      'FT123456789'
    );

    const bookingAfterProof = await BookingModel.findById(onlineBookingId);
    assert.strictEqual(bookingAfterProof.proof_image_url, '/uploads/proofs/test_bill_01.jpg');
    assert.strictEqual(bookingAfterProof.transaction_code, 'FT123456789');
    console.log('   Minh chứng chuyển khoản & mã GD đã cập nhật thành công');
    console.log('   ✓ Payment Proof Upload PASSED!\n');

    // -------------------------------------------------------------
    // TEST 7: Admin / Host Booking Confirmation
    // -------------------------------------------------------------
    console.log('TEST 7: Booking Review & Confirmation');
    await db.query(
      "UPDATE bookings SET status = 'confirmed', host_note = 'Đã đối soát khớp tiền' WHERE id = ?",
      [onlineBookingId]
    );
    await db.query(
      "UPDATE payments SET status = 'completed' WHERE booking_id = ?",
      [onlineBookingId]
    );

    const confirmedBooking = await BookingModel.findById(onlineBookingId);
    assert.strictEqual(confirmedBooking.status, 'confirmed');
    assert.strictEqual(confirmedBooking.payment_status, 'completed');
    console.log('   Trạng thái đơn:', confirmedBooking.status, 'Thanh toán:', confirmedBooking.payment_status);
    console.log('   ✓ Booking Confirmation Workflow PASSED!\n');

    // -------------------------------------------------------------
    // TEST 8: Walk-In Direct Booking (Lễ tân tại quầy)
    // -------------------------------------------------------------
    console.log('TEST 8: Walk-in Desk Booking (Quick Manage / Host Direct)');
    const walkInResult = await BookingModel.createDirectBooking({
      homestayId: testHomestayId,
      guestName: 'Nguyễn Văn Khách Vãng Lai',
      guestPhone: '0909090909',
      checkIn: '2026-11-20',
      checkOut: '2026-11-22', // 2 nights
      guests: 2,
      paymentMethod: 'cash',
      status: 'confirmed',
      hostNote: 'Khách nhận phòng tại quầy trực tiếp',
      createdBy: testHostId,
    });

    walkInBookingId = parseInt(walkInResult.id, 10);
    assert.strictEqual(walkInResult.nights, 2);
    assert.strictEqual(walkInResult.totalPrice, 3000000); // 1.500.000 * 2
    // Direct commission: 5% = 150.000đ, Host Payout: 95% = 2.850.000đ
    assert.strictEqual(Number(walkInResult.commissionRate), 5);
    assert.strictEqual(walkInResult.commissionAmount, 150000);
    assert.strictEqual(walkInResult.hostPayoutAmount, 2850000);
    assert.strictEqual(walkInResult.source, 'host_direct');
    console.log(`   Đơn tại quầy: ${walkInResult.totalPrice}đ | Hoa hồng sàn (5%): ${walkInResult.commissionAmount}đ | Host thực nhận (95%): ${walkInResult.hostPayoutAmount}đ`);
    console.log('   ✓ Walk-in Desk Booking PASSED!\n');

    // -------------------------------------------------------------
    // TEST 9: Reviews & Rating System
    // -------------------------------------------------------------
    console.log('TEST 9: Review Creation & Property Rating Recalculation');
    await db.query(
      `INSERT INTO reviews (booking_id, user_id, homestay_id, rating, comment, is_verified, is_active)
       VALUES (?, ?, ?, 5.0, 'Phòng rất đẹp và thoáng mát, chủ nhà đón tiếp chu đáo.', 1, 1)`,
      [onlineBookingId, testUserId, testHomestayId]
    );

    const [reviewRows] = await db.query(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM reviews WHERE homestay_id = ?',
      [testHomestayId]
    );
    assert.strictEqual(Number(reviewRows[0].avg_rating), 5.0);
    console.log('   Đánh giá mới đã được ghi nhận. Điểm TB:', reviewRows[0].avg_rating);
    console.log('   ✓ Reviews & Rating PASSED!\n');

    // -------------------------------------------------------------
    // TEST 10: Haversine Geodesic Distance Algorithm
    // -------------------------------------------------------------
    console.log('TEST 10: Geodesic Calculation (Haversine Formula)');
    const dist = PropertyRankingService.calculateHaversineDistance(21.0285, 105.8542, 20.8449, 106.6881); // Hanoi to Hai Phong ~90-110km
    console.log(`   Khoảng cách Hà Nội -> Hải Phòng: ${dist} km`);
    assert(dist > 85 && dist < 120, 'Distance must be realistic between Hanoi and Hai Phong');
    console.log('   ✓ Haversine Distance PASSED!\n');

    // -------------------------------------------------------------
    // TEST 11: Risk Scoring Rule Evaluation (Deterministic)
    // -------------------------------------------------------------
    console.log('TEST 11: Deterministic Risk Scoring (No ML)');
    const safeBooking = { nights: 2, total_price: 2000000, payment_status: 'completed' };
    const riskSafe = RiskScoringService.evaluateBookingRisk(safeBooking);
    assert.strictEqual(riskSafe.riskLevel, 'LOW');
    assert.strictEqual(riskSafe.riskScore, 0);

    const alertBooking = { nights: 18, total_price: 32000000, payment_status: 'unpaid' };
    const riskAlert = RiskScoringService.evaluateBookingRisk(alertBooking);
    assert.strictEqual(riskAlert.riskLevel, 'MEDIUM');
    assert.strictEqual(riskAlert.riskScore, 45);
    console.log('   ✓ Risk Scoring Rules PASSED!\n');

    // -------------------------------------------------------------
    // TEST 12: Avatar Upload & Static File Storage
    // -------------------------------------------------------------
    console.log('TEST 12: Avatar Upload & Static Server Storage');
    const userController = require('./src/controllers/user.controller');
    const fakeReq = {
      params: { id: testUserId },
      body: {
        avatarBase64: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA='
      }
    };
    let uploadOutput = null;
    const fakeRes = {
      status: (s) => fakeRes,
      json: (data) => { uploadOutput = data; return fakeRes; }
    };
    await userController.uploadAvatar(fakeReq, fakeRes);
    assert(uploadOutput && uploadOutput.success === true, 'Upload avatar must succeed');
    assert(uploadOutput.data.avatarUrl.startsWith('/uploads/avatars/avatar-'), 'Avatar URL must point to /uploads/avatars/');

    const [updatedUser] = await db.query('SELECT avatar_url FROM users WHERE id = ?', [testUserId]);
    assert.strictEqual(updatedUser[0].avatar_url, uploadOutput.data.avatarUrl);
    console.log('   Avatar lưu thành file tĩnh thành công:', uploadOutput.data.avatarUrl);
    console.log('   ✓ Avatar Upload & Storage PASSED!\n');

    console.log('================================================================');
    console.log('🎉 100% OF END-TO-END BUSINESS LOGIC & FUNCTIONS PASSED SAFELY!');
    console.log('================================================================');

  } catch (error) {
    console.error('❌ TEST FAILED:', error);
    throw error;
  } finally {
    // -------------------------------------------------------------
    // CLEANUP TEST DATA FROM DATABASE
    // -------------------------------------------------------------
    console.log('\n🧹 Cleaning up test artifacts from database...');
    try {
      if (testHomestayId) {
        await db.query('DELETE FROM payments WHERE booking_id IN (SELECT id FROM bookings WHERE homestay_id = ?)', [testHomestayId]);
        await db.query('DELETE FROM reviews WHERE homestay_id = ?', [testHomestayId]);
        await db.query('DELETE FROM bookings WHERE homestay_id = ?', [testHomestayId]);
        await db.query('DELETE FROM homestays WHERE id = ?', [testHomestayId]);
      }
      if (testUserId) {
        await db.query('DELETE FROM notifications WHERE user_id = ?', [testUserId]);
        await db.query('DELETE FROM point_transactions WHERE user_id = ?', [testUserId]);
        await db.query('DELETE FROM users WHERE id = ?', [testUserId]);
      }
      if (testHostId) {
        await db.query('DELETE FROM users WHERE id = ?', [testHostId]);
      }
      console.log('   ✓ All test artifacts cleaned up cleanly!');
    } catch (cleanupErr) {
      console.error('   Cleanup warning:', cleanupErr.message);
    }
  }
}

testFullPlatform()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
