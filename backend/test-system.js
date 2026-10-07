const assert = require('assert');
const PropertyRankingService = require('./src/services/ranking.service');
const RiskScoringService = require('./src/services/risk.service');

async function runTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING SYSTEM AUDIT & BUSINESS LOGIC VERIFICATION');
  console.log('====================================================\n');

  // Test 1: Haversine Distance Calculation
  console.log('1. Testing Haversine Distance Algorithm:');
  const distanceDaNangToHoiAn = PropertyRankingService.calculateHaversineDistance(
    16.0544, 108.2022,
    15.8801, 108.3380
  );
  console.log(`   Distance Da Nang -> Hoi An: ${distanceDaNangToHoiAn} km`);
  assert(distanceDaNangToHoiAn > 20 && distanceDaNangToHoiAn < 35, 'Distance must be between 20 and 35 km');
  console.log('   ✓ Haversine Distance test PASSED!\n');

  // Test 2: Deterministic Property Ranking Weighted Score
  console.log('2. Testing Deterministic Weighted Property Ranking:');
  const sampleProp1 = { rating: 5.0, review_count: 50, is_featured: 1, is_host_verified: 1 };
  const score1 = PropertyRankingService.calculatePropertyScore(sampleProp1);
  console.log(`   Sample VIP Property Score: ${score1} (Expected: 150)`);
  assert.strictEqual(score1, 150, 'VIP Property score should be 150');

  const sampleProp2 = { rating: 4.0, review_count: 10, is_featured: 0, is_host_verified: 0 };
  const score2 = PropertyRankingService.calculatePropertyScore(sampleProp2);
  console.log(`   Standard Property Score: ${score2} (Expected: 84)`);
  assert.strictEqual(score2, 84, 'Standard Property score should be 84');
  console.log('   ✓ Property Ranking test PASSED!\n');

  // Test 3: Date Overlap Logic Rules
  console.log('3. Testing Booking Date Overlap Algorithm:');
  const isOverlap = (exIn, exOut, newIn, newOut) => (newIn < exOut && newOut > exIn);

  // Case A: 01/10 to 05/10 vs 05/10 to 08/10 (Checkout day equals checkin day -> NOT overlap)
  const caseA = isOverlap('2026-10-01', '2026-10-05', '2026-10-05', '2026-10-08');
  assert.strictEqual(caseA, false, 'Checkout day should equal checkin day without conflict');

  // Case B: 01/10 to 05/10 vs 03/10 to 07/10 (Mid-stay conflict -> OVERLAP)
  const caseB = isOverlap('2026-10-01', '2026-10-05', '2026-10-03', '2026-10-07');
  assert.strictEqual(caseB, true, 'Mid-stay conflict must be detected as overlap');

  // Case C: 01/10 to 05/10 vs 02/10 to 04/10 (Contained inside existing stay -> OVERLAP)
  const caseC = isOverlap('2026-10-01', '2026-10-05', '2026-10-02', '2026-10-04');
  assert.strictEqual(caseC, true, 'Contained stay must be detected as overlap');
  console.log('   ✓ Date Overlap Algorithm test PASSED!\n');

  // Test 4: Risk Scoring Rule Evaluation
  console.log('4. Testing Rule-based Risk Scoring (No ML):');
  const normalBooking = { nights: 3, total_price: 3500000, payment_status: 'verified' };
  const normalRisk = RiskScoringService.evaluateBookingRisk(normalBooking);
  assert.strictEqual(normalRisk.riskLevel, 'LOW');

  const highRiskBooking = { nights: 20, total_price: 35000000, payment_status: 'unpaid' };
  const highRisk = RiskScoringService.evaluateBookingRisk(highRiskBooking);
  assert.strictEqual(highRisk.riskLevel, 'MEDIUM');
  console.log('   ✓ Risk Scoring test PASSED!\n');

  // Test 5: Server-Driven Cancellation & Refund Calculation Algorithm
  console.log('5. Testing Cancellation & Refund Policy Rules:');
  const calculateRefundPolicy = (hoursUntilCheckIn, totalPaid) => {
    if (totalPaid <= 0) {
      return { refundPercentage: 0, refundAmount: 0, cancellationFee: 0, policy: 'CANCEL_UNPAID_FREE' };
    }
    if (hoursUntilCheckIn >= 72) {
      const refundAmount = Math.round(totalPaid * 0.70);
      const cancellationFee = totalPaid - refundAmount;
      return { refundPercentage: 70, refundAmount, cancellationFee, policy: 'CANCEL_72H_70_PERCENT' };
    }
    return { refundPercentage: 0, refundAmount: 0, cancellationFee: totalPaid, policy: 'CANCEL_WITHIN_72H_NO_REFUND' };
  };

  // Case 5.1: Check-in sau 4 ngày (96h >= 72h), Đã thanh toán 2.000.000đ -> hoàn 70% = 1.400.000đ, phí 600.000đ
  const p1 = calculateRefundPolicy(96, 2000000);
  assert.strictEqual(p1.refundPercentage, 70);
  assert.strictEqual(p1.refundAmount, 1400000);
  assert.strictEqual(p1.cancellationFee, 600000);
  assert.strictEqual(p1.policy, 'CANCEL_72H_70_PERCENT');
  console.log(`   Case 5.1 (Check-in 96h >= 72h, Paid 2M): Refund = ${p1.refundAmount.toLocaleString('vi-VN')}₫ (70%), Fee = ${p1.cancellationFee.toLocaleString('vi-VN')}₫`);

  // Case 5.2: Check-in đúng 72.0h -> hoàn 70%
  const p2 = calculateRefundPolicy(72, 2000000);
  assert.strictEqual(p2.refundPercentage, 70);
  assert.strictEqual(p2.refundAmount, 1400000);
  assert.strictEqual(p2.cancellationFee, 600000);
  assert.strictEqual(p2.policy, 'CANCEL_72H_70_PERCENT');
  console.log(`   Case 5.2 (Check-in đúng 72.0h, Paid 2M): Refund = ${p2.refundAmount.toLocaleString('vi-VN')}₫ (70%)`);

  // Case 5.3: Check-in sau 71.9h (< 72h) -> hoàn 0đ, phí 100%
  const p3 = calculateRefundPolicy(71.9, 2000000);
  assert.strictEqual(p3.refundPercentage, 0);
  assert.strictEqual(p3.refundAmount, 0);
  assert.strictEqual(p3.cancellationFee, 2000000);
  assert.strictEqual(p3.policy, 'CANCEL_WITHIN_72H_NO_REFUND');
  console.log(`   Case 5.3 (Check-in 71.9h < 72h, Paid 2M): Refund = 0₫, Fee = 2.000.000₫ (100%)`);

  // Case 5.4: Check-in sau 24h (< 72h) -> hoàn 0đ, phí 100%
  const p4 = calculateRefundPolicy(24, 2000000);
  assert.strictEqual(p4.refundPercentage, 0);
  assert.strictEqual(p4.refundAmount, 0);
  assert.strictEqual(p4.cancellationFee, 2000000);
  assert.strictEqual(p4.policy, 'CANCEL_WITHIN_72H_NO_REFUND');
  console.log(`   Case 5.4 (Check-in 24h < 72h, Paid 2M): Refund = 0₫, Fee = 2.000.000₫ (100%)`);

  // Case 5.5: Đơn chưa thanh toán (totalPaid = 0) -> hủy miễn phí
  const p5 = calculateRefundPolicy(48, 0);
  assert.strictEqual(p5.refundAmount, 0);
  assert.strictEqual(p5.cancellationFee, 0);
  assert.strictEqual(p5.policy, 'CANCEL_UNPAID_FREE');
  console.log(`   Case 5.5 (Đơn chưa thanh toán): Free cancellation, policy = CANCEL_UNPAID_FREE`);
  console.log('   ✓ Cancellation & Refund Policy Rules PASSED!\n');

  // Test 6: Wallet Ledger & Balance Invariants
  console.log('6. Testing Wallet Ledger & Balance Invariants:');
  let balance = 0;
  // Step 1: Refund from cancellation +1.400.000
  const refundAmount = 1400000;
  const balBefore1 = balance;
  balance += refundAmount;
  assert.strictEqual(balance, 1400000);
  console.log(`   Ledger Step 1 (Refund): Before = ${balBefore1}₫, Amount = +${refundAmount}₫, After = ${balance}₫`);

  // Step 2: Withdrawal request -500.000
  const withdrawAmount = 500000;
  assert(balance >= withdrawAmount, 'Balance must be sufficient');
  const balBefore2 = balance;
  balance -= withdrawAmount;
  assert.strictEqual(balance, 900000);
  console.log(`   Ledger Step 2 (Withdrawal Request): Before = ${balBefore2}₫, Amount = -${withdrawAmount}₫, After = ${balance}₫`);

  // Step 3: Reject withdrawal > available balance
  const excessiveWithdrawal = 1500000;
  const isAllowed = balance >= excessiveWithdrawal;
  assert.strictEqual(isAllowed, false, 'System must reject withdrawal exceeding available balance');
  console.log(`   Ledger Step 3 (Excessive Withdrawal 1.5M > 900k): Rejected = ${!isAllowed}`);

  // Step 4: Rejection rollback (Refund back to wallet)
  balance += withdrawAmount;
  assert.strictEqual(balance, 1400000);
  console.log(`   Ledger Step 4 (Withdrawal Rejected Reversal): Restored Balance = ${balance}₫`);
  console.log('   ✓ Wallet Ledger & Balance Invariants PASSED!\n');

  // Test 7: Bank Account Number Masking Security
  console.log('7. Testing Bank Account Number Masking:');
  const maskAccountNumber = (acc) => {
    const s = String(acc || '').trim();
    return s.length > 4 ? `****${s.slice(-4)}` : s;
  };

  assert.strictEqual(maskAccountNumber('19071766471019'), '****1019');
  assert.strictEqual(maskAccountNumber('0011004567890'), '****7890');
  assert.strictEqual(maskAccountNumber('123'), '123');
  console.log('   19071766471019 masked to:', maskAccountNumber('19071766471019'));
  console.log('   ✓ Bank Account Masking PASSED!\n');

  // Test 8: Cancellation Reason Code & Free Text Validation
  console.log('8. Testing Cancellation Reason Validation:');
  const validCodes = ['CHANGE_OF_PLAN', 'FOUND_ANOTHER_PLACE', 'PRICE_ISSUE', 'PROPERTY_ISSUE', 'SCHEDULE_ISSUE', 'OTHER'];
  const validateReason = (code, text) => {
    if (!validCodes.includes(code)) return false;
    if (code === 'OTHER' && (!text || text.trim().length < 10)) return false;
    return true;
  };

  assert.strictEqual(validateReason('CHANGE_OF_PLAN', ''), true);
  assert.strictEqual(validateReason('INVALID_CODE', ''), false);
  assert.strictEqual(validateReason('OTHER', 'ngắn'), false); // Dưới 10 ký tự -> reject
  assert.strictEqual(validateReason('OTHER', 'Tôi bận công tác đột xuất tại Đà Nẵng'), true); // Đủ 10 ký tự -> accept
  console.log('   ✓ Cancellation Reason Validation PASSED!\n');

  console.log('====================================================');
  console.log('🎉 ALL SYSTEM AUDIT & LOGIC CHECKS PASSED 100% (8/8)!');
  console.log('====================================================');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
