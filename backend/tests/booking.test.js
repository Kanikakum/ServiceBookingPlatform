const http = require('http');
const app = require('../src/app');
const prisma = require('../src/db/prisma');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../src/utils/token');

let server;
let baseUrl;

// Helper to make HTTP requests
const request = async (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(
      url,
      {
        method,
        headers,
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(rawData);
          } catch (e) {
            parsed = rawData;
          }
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsed,
          });
        });
      }
    );

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const runAllBookingTests = async () => {
  console.log('\n========================================================');
  console.log('STARTING PHASE 3 BOOKING & CONCURRENCY TEST SUITE');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} ${details ? '- ' + JSON.stringify(details) : ''}`);
      failed++;
    }
  };

  try {
    server = app.listen(0);
    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;

    // Clean up test data
    await prisma.booking.deleteMany({
      where: {
        customer: { email: { contains: 'test_phase3_' } },
      },
    });
    await prisma.service.deleteMany({
      where: {
        provider: { email: { contains: 'test_phase3_' } },
      },
    });
    await prisma.user.deleteMany({
      where: {
        email: { contains: 'test_phase3_' },
      },
    });

    const timestamp = Date.now();
    const passwordHash = await bcrypt.hash('Password123!', 10);

    // Create Test Providers
    const providerA = await prisma.user.create({
      data: {
        name: 'Provider A (Booking)',
        email: `test_phase3_provA_${timestamp}@example.com`,
        passwordHash,
        role: 'PROVIDER',
      },
    });
    const tokenProvA = generateToken({ userId: providerA.id, role: 'PROVIDER' });

    const providerB = await prisma.user.create({
      data: {
        name: 'Provider B (Booking)',
        email: `test_phase3_provB_${timestamp}@example.com`,
        passwordHash,
        role: 'PROVIDER',
      },
    });
    const tokenProvB = generateToken({ userId: providerB.id, role: 'PROVIDER' });

    // Create Test Customers
    const customer1 = await prisma.user.create({
      data: {
        name: 'Customer 1',
        email: `test_phase3_cust1_${timestamp}@example.com`,
        passwordHash,
        role: 'CUSTOMER',
      },
    });
    const tokenCust1 = generateToken({ userId: customer1.id, role: 'CUSTOMER' });

    const customer2 = await prisma.user.create({
      data: {
        name: 'Customer 2',
        email: `test_phase3_cust2_${timestamp}@example.com`,
        passwordHash,
        role: 'CUSTOMER',
      },
    });
    const tokenCust2 = generateToken({ userId: customer2.id, role: 'CUSTOMER' });

    // Seeded category
    const category = await prisma.category.findFirst();

    // Create Services
    const serviceA = await prisma.service.create({
      data: {
        providerId: providerA.id,
        categoryId: category.id,
        title: 'Full Home Sanitization',
        description: 'Deep sanitized cleaning covering all rooms.',
        price: 999.0,
        durationMinutes: 60,
        isActive: true,
      },
    });

    const serviceB = await prisma.service.create({
      data: {
        providerId: providerB.id,
        categoryId: category.id,
        title: 'Kitchen Sink Drain Unclogging',
        description: 'Comprehensive drain inspection and blockage removal.',
        price: 750.0,
        durationMinutes: 60,
        isActive: true,
      },
    });

    // Future booking date (e.g., 30 days ahead to ensure it's always in the future)
    const futureDateObj = new Date();
    futureDateObj.setDate(futureDateObj.getDate() + 30);
    const futureDateStr = futureDateObj.toISOString().split('T')[0];

    // ==========================================
    // SECTION 1: BASIC BOOKING CREATION TESTS
    // ==========================================
    console.log('\n--- SECTION 1: BASIC BOOKING CREATION TESTS ---');

    // 1. Customer can create booking
    const res1 = await request(
      'POST',
      '/api/bookings',
      {
        serviceId: serviceA.id,
        bookingDate: futureDateStr,
        startTime: '10:00',
      },
      tokenCust1
    );
    assert(
      res1.status === 201 &&
        res1.body.success === true &&
        res1.body.data?.customerId === customer1.id &&
        res1.body.data?.providerId === providerA.id &&
        res1.body.data?.serviceId === serviceA.id &&
        res1.body.data?.status === 'PENDING' &&
        res1.body.data?.totalPrice === 999,
      '1. Customer can create booking with status PENDING and price snapshot (201 Created)',
      res1.body
    );
    const booking1Id = res1.body.data?.id;

    // 2. Provider cannot create booking
    const res2 = await request(
      'POST',
      '/api/bookings',
      {
        serviceId: serviceA.id,
        bookingDate: futureDateStr,
        startTime: '12:00',
      },
      tokenProvA
    );
    assert(
      res2.status === 403 && res2.body.success === false,
      '2. Provider cannot create booking (403 Forbidden)',
      res2.body
    );

    // 3. Unauthenticated user cannot create booking
    const res3 = await request('POST', '/api/bookings', {
      serviceId: serviceA.id,
      bookingDate: futureDateStr,
      startTime: '12:00',
    });
    assert(
      res3.status === 401 && res3.body.success === false,
      '3. Unauthenticated user cannot create booking (401 Unauthorized)',
      res3.body
    );

    // 4. Invalid service returns 404
    const res4 = await request(
      'POST',
      '/api/bookings',
      {
        serviceId: 999999,
        bookingDate: futureDateStr,
        startTime: '12:00',
      },
      tokenCust1
    );
    assert(
      res4.status === 404 && res4.body.success === false,
      '4. Non-existent service returns 404 Not Found',
      res4.body
    );

    // 5. Past date rejected (400 Bad Request)
    const res5 = await request(
      'POST',
      '/api/bookings',
      {
        serviceId: serviceA.id,
        bookingDate: '2020-01-01',
        startTime: '10:00',
      },
      tokenCust1
    );
    assert(
      res5.status === 400 &&
        res5.body.success === false &&
        res5.body.message.includes('past'),
      '5. Past booking date rejected (400 Bad Request)',
      res5.body
    );

    // 6. Service duration mismatch rejected if endTime is provided
    const res6 = await request(
      'POST',
      '/api/bookings',
      {
        serviceId: serviceA.id,
        bookingDate: futureDateStr,
        startTime: '14:00',
        endTime: '16:00', // 120 min instead of 60 min
      },
      tokenCust1
    );
    assert(
      res6.status === 400 &&
        res6.body.success === false &&
        res6.body.message.includes('duration'),
      '6. Service duration mismatch rejected when custom endTime provided (400 Bad Request)',
      res6.body
    );

    // ==========================================
    // SECTION 2: OWNERSHIP RESTRICTIONS
    // ==========================================
    console.log('\n--- SECTION 2: OWNERSHIP RESTRICTIONS ---');

    // 8. Customer sees only own bookings
    const res8 = await request('GET', '/api/bookings/customer', null, tokenCust1);
    const allCust1Bookings = res8.body.data?.items?.every(
      (b) => b.customerId === customer1.id
    );
    assert(
      res8.status === 200 && allCust1Bookings && res8.body.data?.items?.length >= 1,
      '8. GET /api/bookings/customer returns only bookings of caller customer',
      res8.body.data?.items
    );

    // 9. Customer cannot cancel another customer's booking
    const res9 = await request(
      'PATCH',
      `/api/bookings/${booking1Id}/cancel`,
      null,
      tokenCust2
    );
    assert(
      res9.status === 403 &&
        res9.body.success === false &&
        res9.body.message.includes('do not own'),
      '9. Customer cannot cancel another customer’s booking (403 Forbidden)',
      res9.body
    );

    // 10. Provider sees only own bookings
    const res10 = await request('GET', '/api/bookings/provider', null, tokenProvA);
    const allProvABookings = res10.body.data?.items?.every(
      (b) => b.providerId === providerA.id
    );
    assert(
      res10.status === 200 && allProvABookings && res10.body.data?.items?.length >= 1,
      '10. GET /api/bookings/provider returns only bookings scheduled for caller provider',
      res10.body.data?.items
    );

    // 11. Provider cannot accept another provider's booking
    const res11 = await request(
      'PATCH',
      `/api/bookings/${booking1Id}/accept`,
      null,
      tokenProvB
    );
    assert(
      res11.status === 403 &&
        res11.body.success === false &&
        res11.body.message.includes('do not own'),
      '11. Provider cannot accept another provider’s booking (403 Forbidden)',
      res11.body
    );

    // 12. Provider cannot reject another provider's booking
    const res12 = await request(
      'PATCH',
      `/api/bookings/${booking1Id}/reject`,
      null,
      tokenProvB
    );
    assert(
      res12.status === 403 &&
        res12.body.success === false &&
        res12.body.message.includes('do not own'),
      '12. Provider cannot reject another provider’s booking (403 Forbidden)',
      res12.body
    );

    // ==========================================
    // SECTION 3: BOOKING STATUS TRANSITIONS
    // ==========================================
    console.log('\n--- SECTION 3: BOOKING STATUS TRANSITIONS ---');

    // 13. Provider can accept pending booking (PENDING -> CONFIRMED)
    const res13 = await request(
      'PATCH',
      `/api/bookings/${booking1Id}/accept`,
      null,
      tokenProvA
    );
    assert(
      res13.status === 200 &&
        res13.body.success === true &&
        res13.body.data?.booking?.status === 'CONFIRMED',
      '13. Provider accepts pending booking -> CONFIRMED (200 OK)',
      res13.body
    );

    // 14. Invalid status transition rejected (CONFIRMED -> CONFIRMED or REJECTED)
    const res14 = await request(
      'PATCH',
      `/api/bookings/${booking1Id}/reject`,
      null,
      tokenProvA
    );
    assert(
      res14.status === 409 &&
        res14.body.success === false &&
        res14.body.message.includes('CONFIRMED'),
      '14. Invalid status transition from CONFIRMED -> REJECTED rejected (409 Conflict)',
      res14.body
    );

    // 15. Customer cancels confirmed booking (CONFIRMED -> CANCELLED)
    const res15 = await request(
      'PATCH',
      `/api/bookings/${booking1Id}/cancel`,
      null,
      tokenCust1
    );
    assert(
      res15.status === 200 &&
        res15.body.success === true &&
        res15.body.data?.booking?.status === 'CANCELLED',
      '15. Customer cancels confirmed booking -> CANCELLED (200 OK)',
      res15.body
    );

    // 16. Already cancelled booking cannot be cancelled again
    const res16 = await request(
      'PATCH',
      `/api/bookings/${booking1Id}/cancel`,
      null,
      tokenCust1
    );
    assert(
      res16.status === 409 && res16.body.success === false,
      '16. Terminal status CANCELLED cannot be cancelled again (409 Conflict)',
      res16.body
    );

    // Create a new booking for rejection test
    const resCreateRejection = await request(
      'POST',
      '/api/bookings',
      {
        serviceId: serviceA.id,
        bookingDate: futureDateStr,
        startTime: '11:00',
      },
      tokenCust1
    );
    const rejectionBookingId = resCreateRejection.body.data?.id;

    // 17. Provider rejects pending booking (PENDING -> REJECTED)
    const res17 = await request(
      'PATCH',
      `/api/bookings/${rejectionBookingId}/reject`,
      null,
      tokenProvA
    );
    assert(
      res17.status === 200 &&
        res17.body.success === true &&
        res17.body.data?.booking?.status === 'REJECTED',
      '17. Provider rejects pending booking -> REJECTED (200 OK)',
      res17.body
    );

    // ==========================================
    // SECTION 4: AVAILABILITY & DOUBLE-BOOKING TESTS
    // ==========================================
    console.log('\n--- SECTION 4: AVAILABILITY & DOUBLE-BOOKING TESTS ---');

    // Create an active confirmed booking on 13:00 - 14:00
    const resActive = await request(
      'POST',
      '/api/bookings',
      {
        serviceId: serviceA.id,
        bookingDate: futureDateStr,
        startTime: '13:00',
      },
      tokenCust1
    );
    const activeBookingId = resActive.body.data?.id;
    await request('PATCH', `/api/bookings/${activeBookingId}/accept`, null, tokenProvA);

    // 20. Availability endpoint works
    const res20 = await request(
      'GET',
      `/api/bookings/availability?serviceId=${serviceA.id}&bookingDate=${futureDateStr}`,
      null,
      tokenCust1
    );
    const slot10 = res20.body.data?.slots?.find((s) => s.startTime === '10:00');
    const slot11 = res20.body.data?.slots?.find((s) => s.startTime === '11:00');
    const slot13 = res20.body.data?.slots?.find((s) => s.startTime === '13:00');
    const slot14 = res20.body.data?.slots?.find((s) => s.startTime === '14:00');

    assert(
      res20.status === 200 && Array.isArray(res20.body.data?.slots),
      '20. GET /api/bookings/availability returns formatted day slots',
      res20.body.data
    );

    // 21. Existing confirmed booking blocks slot (13:00 - 14:00 is false)
    assert(
      slot13 && slot13.available === false,
      '21. Existing confirmed booking marks slot 13:00 as unavailable (available: false)',
      slot13
    );

    // 22. Cancelled booking releases slot (10:00 - 11:00 is true)
    assert(
      slot10 && slot10.available === true,
      '22. Cancelled booking releases slot 10:00 (available: true)',
      slot10
    );

    // 23. Rejected booking releases slot (11:00 - 12:00 is true)
    assert(
      slot11 && slot11.available === true,
      '23. Rejected booking releases slot 11:00 (available: true)',
      slot11
    );

    // 24. Free adjacent slot is available (14:00 - 15:00 is true)
    assert(
      slot14 && slot14.available === true,
      '24. Unbooked slot 14:00 is available (available: true)',
      slot14
    );

    // 25. Sequential overlapping booking is rejected with 409 Conflict (e.g. 13:00 - 14:00 already booked)
    const res25 = await request(
      'POST',
      '/api/bookings',
      {
        serviceId: serviceA.id,
        bookingDate: futureDateStr,
        startTime: '13:00',
      },
      tokenCust2
    );
    assert(
      res25.status === 409 &&
        res25.body.success === false &&
        res25.body.message.includes('available'),
      '25. Sequential overlapping booking request rejected with 409 Conflict',
      res25.body
    );

    // 26. Non-overlapping booking succeeds (14:00 - 15:00)
    const res26 = await request(
      'POST',
      '/api/bookings',
      {
        serviceId: serviceA.id,
        bookingDate: futureDateStr,
        startTime: '14:00',
      },
      tokenCust2
    );
    assert(
      res26.status === 201 && res26.body.success === true,
      '26. Non-overlapping booking for adjacent slot 14:00 succeeds (201 Created)',
      res26.body
    );

    // ==========================================
    // SECTION 5: PRICE SNAPSHOT INTEGRITY TEST
    // ==========================================
    console.log('\n--- SECTION 5: PRICE SNAPSHOT INTEGRITY TEST ---');

    // 27. Booking price snapshot retains original booked price when service price changes
    const initialBookedPrice = res26.body.data?.totalPrice; // 999.00
    // Provider updates service price to 1499.00
    await prisma.service.update({
      where: { id: serviceA.id },
      data: { price: 1499.0 },
    });

    const refreshedBooking = await prisma.booking.findUnique({
      where: { id: res26.body.data?.id },
    });
    const refreshedPrice = parseFloat(refreshedBooking.totalPrice);
    assert(
      refreshedPrice === initialBookedPrice && refreshedPrice === 999.0,
      '27. Price Snapshot Integrity: Booking retains original booked price (999.00) after service price increase (1499.00)',
      { bookedPrice: refreshedPrice, newServicePrice: 1499.0 }
    );

    // Reset service price back
    await prisma.service.update({
      where: { id: serviceA.id },
      data: { price: 999.0 },
    });

    // ==========================================
    // SECTION 6: CRITICAL CONCURRENCY & RACE CONDITION PREVENTION
    // ==========================================
    console.log('\n--- SECTION 6: CONCURRENCY & RACE CONDITION PREVENTION ---');

    // Concurrency Test A: Two simultaneous requests for the exact same slot (15:00 - 16:00)
    const concurrentSlotTimeA = '15:00';
    console.log(`Executing 2 simultaneous parallel requests for slot ${concurrentSlotTimeA}...`);

    const promise1 = request(
      'POST',
      '/api/bookings',
      { serviceId: serviceA.id, bookingDate: futureDateStr, startTime: concurrentSlotTimeA },
      tokenCust1
    );
    const promise2 = request(
      'POST',
      '/api/bookings',
      { serviceId: serviceA.id, bookingDate: futureDateStr, startTime: concurrentSlotTimeA },
      tokenCust2
    );

    const [resConc1, resConc2] = await Promise.all([promise1, promise2]);
    const responses2 = [resConc1, resConc2];

    const successCount2 = responses2.filter((r) => r.status === 201).length;
    const conflictCount2 = responses2.filter((r) => r.status === 409).length;

    assert(
      successCount2 === 1 && conflictCount2 === 1,
      '28. Simultaneous 2-request race condition: Exactly 1 succeeds (201) and 1 is rejected (409 Conflict)',
      { status1: resConc1.status, status2: resConc2.status }
    );

    // Verify database state for slot 15:00
    const parsedStartA = new Date(`${futureDateStr}T15:00:00.000Z`);
    const dbBookingsSlotA = await prisma.booking.findMany({
      where: {
        providerId: providerA.id,
        bookingDate: new Date(`${futureDateStr}T00:00:00.000Z`),
        startTime: parsedStartA,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });
    assert(
      dbBookingsSlotA.length === 1,
      '29. MySQL Database verification: Exactly ONE active booking row exists in database for slot 15:00',
      { count: dbBookingsSlotA.length }
    );

    // Concurrency Stress Test B: 10 SIMULTANEOUS PARALLEL REQUESTS for slot 16:00 - 17:00
    const concurrentSlotTimeB = '16:00';
    console.log(`Executing 10 SIMULTANEOUS parallel requests for slot ${concurrentSlotTimeB}...`);

    const parallelTenRequests = Array.from({ length: 10 }, (_, index) => {
      const token = index % 2 === 0 ? tokenCust1 : tokenCust2;
      return request(
        'POST',
        '/api/bookings',
        { serviceId: serviceA.id, bookingDate: futureDateStr, startTime: concurrentSlotTimeB },
        token
      );
    });

    const tenResults = await Promise.all(parallelTenRequests);

    const successCount10 = tenResults.filter((r) => r.status === 201).length;
    const conflictCount10 = tenResults.filter((r) => r.status === 409).length;

    assert(
      successCount10 === 1 && conflictCount10 === 9,
      '30. High-load Concurrency Stress Test: 10 parallel requests -> Exactly 1 succeeds (201) and 9 receive 409 Conflict',
      { successes: successCount10, conflicts: conflictCount10 }
    );

    // Verify database state for slot 16:00
    const parsedStartB = new Date(`${futureDateStr}T16:00:00.000Z`);
    const dbBookingsSlotB = await prisma.booking.findMany({
      where: {
        providerId: providerA.id,
        bookingDate: new Date(`${futureDateStr}T00:00:00.000Z`),
        startTime: parsedStartB,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });
    assert(
      dbBookingsSlotB.length === 1,
      '31. MySQL Database verification: Exactly ONE active booking row exists in database for slot 16:00 after 10 concurrent requests',
      { count: dbBookingsSlotB.length }
    );

    // Cleanup test data
    await prisma.booking.deleteMany({
      where: {
        providerId: { in: [providerA.id, providerB.id] },
      },
    });
    await prisma.providerScheduleLock.deleteMany({
      where: {
        providerId: { in: [providerA.id, providerB.id] },
      },
    });
    await prisma.service.deleteMany({
      where: {
        providerId: { in: [providerA.id, providerB.id] },
      },
    });
    await prisma.user.deleteMany({
      where: {
        id: { in: [providerA.id, providerB.id, customer1.id, customer2.id] },
      },
    });

    console.log('\n========================================================');
    console.log(`BOOKING TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal Booking Test Error:', err);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
    await prisma.$disconnect();
  }
};

runAllBookingTests();
