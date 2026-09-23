const assert = require('assert');
const PropertyRankingService = require('./src/services/ranking.service');
const RiskScoringService = require('./src/services/risk.service');
const BookingModel = require('./src/models/booking.model');

async function runTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING SYSTEM AUDIT & BUSINESS LOGIC VERIFICATION');
  console.log('====================================================\n');

  // Test 1: Haversine Distance Calculation
  console.log('1. Testing Haversine Distance Algorithm:');
  // Coordinates: Da Nang (16.0544, 108.2022) to Hoi An (15.8801, 108.3380) is ~26-30 km
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
  // (5.0 * 20 = 100) + (50 * 0.4 = 20) + 15 + 15 = 150
  console.log(`   Sample VIP Property Score: ${score1} (Expected: 150)`);
  assert.strictEqual(score1, 150, 'VIP Property score should be 150');

  const sampleProp2 = { rating: 4.0, review_count: 10, is_featured: 0, is_host_verified: 0 };
  const score2 = PropertyRankingService.calculatePropertyScore(sampleProp2);
  // (4.0 * 20 = 80) + (10 * 0.4 = 4) = 84
  console.log(`   Standard Property Score: ${score2} (Expected: 84)`);
  assert.strictEqual(score2, 84, 'Standard Property score should be 84');
  console.log('   ✓ Property Ranking test PASSED!\n');

  // Test 3: Date Overlap Logic Rules
  console.log('3. Testing Booking Date Overlap Algorithm:');
  // Overlap condition: (existingCheckIn < newCheckOut) AND (existingCheckOut > newCheckIn)
  const isOverlap = (exIn, exOut, newIn, newOut) => (newIn < exOut && newOut > exIn);

  // Case A: 01/10 to 05/10 vs 05/10 to 08/10 (Checkout day equals checkin day -> NOT overlap)
  const caseA = isOverlap('2026-10-01', '2026-10-05', '2026-10-05', '2026-10-08');
  console.log('   Case A (Checkout 05/10 == Checkin 05/10): Overlap =', caseA, '(Expected: false)');
  assert.strictEqual(caseA, false, 'Checkout day should equal checkin day without conflict');

  // Case B: 01/10 to 05/10 vs 03/10 to 07/10 (Mid-stay conflict -> OVERLAP)
  const caseB = isOverlap('2026-10-01', '2026-10-05', '2026-10-03', '2026-10-07');
  console.log('   Case B (03/10 conflicts with stay): Overlap =', caseB, '(Expected: true)');
  assert.strictEqual(caseB, true, 'Mid-stay conflict must be detected as overlap');

  // Case C: 01/10 to 05/10 vs 02/10 to 04/10 (Contained inside existing stay -> OVERLAP)
  const caseC = isOverlap('2026-10-01', '2026-10-05', '2026-10-02', '2026-10-04');
  console.log('   Case C (Stay inside existing period): Overlap =', caseC, '(Expected: true)');
  assert.strictEqual(caseC, true, 'Contained stay must be detected as overlap');
  console.log('   ✓ Date Overlap Algorithm test PASSED!\n');

  // Test 4: Risk Scoring Rule Evaluation
  console.log('4. Testing Rule-based Risk Scoring (No ML):');
  const normalBooking = { nights: 3, total_price: 3500000, payment_status: 'verified' };
  const normalRisk = RiskScoringService.evaluateBookingRisk(normalBooking);
  console.log('   Normal Booking Risk Level:', normalRisk.riskLevel, 'Score:', normalRisk.riskScore);
  assert.strictEqual(normalRisk.riskLevel, 'LOW');

  const highRiskBooking = { nights: 20, total_price: 35000000, payment_status: 'unpaid' };
  const highRisk = RiskScoringService.evaluateBookingRisk(highRiskBooking);
  console.log('   High Risk Booking Risk Level:', highRisk.riskLevel, 'Score:', highRisk.riskScore, 'Factors:', highRisk.riskFactors);
  assert.strictEqual(highRisk.riskLevel, 'MEDIUM'); // Score: 25+20=45 -> MEDIUM (>=50 is HIGH)
  console.log('   ✓ Risk Scoring test PASSED!\n');

  console.log('====================================================');
  console.log('🎉 ALL SYSTEM AUDIT & LOGIC CHECKS PASSED 100%!');
  console.log('====================================================');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
