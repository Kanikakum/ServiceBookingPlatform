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

const runAllServiceTests = async () => {
  console.log('\n==================================================');
  console.log('STARTING PHASE 2 SERVICE & CATEGORY TEST SUITE');
  console.log('==================================================\n');

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
    // 1. Start server on ephemeral port
    server = app.listen(0);
    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;

    // Clean up test data
    await prisma.service.deleteMany({
      where: {
        provider: { email: { contains: 'test_phase2_' } },
      },
    });
    await prisma.user.deleteMany({
      where: {
        email: { contains: 'test_phase2_' },
      },
    });

    const timestamp = Date.now();
    const passwordHash = await bcrypt.hash('Password123!', 10);

    // Create Test Provider A
    const providerA = await prisma.user.create({
      data: {
        name: 'Provider Alpha',
        email: `test_phase2_provA_${timestamp}@example.com`,
        passwordHash,
        role: 'PROVIDER',
      },
    });
    const tokenA = generateToken({ userId: providerA.id, role: 'PROVIDER' });

    // Create Test Provider B
    const providerB = await prisma.user.create({
      data: {
        name: 'Provider Beta',
        email: `test_phase2_provB_${timestamp}@example.com`,
        passwordHash,
        role: 'PROVIDER',
      },
    });
    const tokenB = generateToken({ userId: providerB.id, role: 'PROVIDER' });

    // Create Test Customer
    const customer = await prisma.user.create({
      data: {
        name: 'Customer Charlie',
        email: `test_phase2_cust_${timestamp}@example.com`,
        passwordHash,
        role: 'CUSTOMER',
      },
    });
    const customerToken = generateToken({ userId: customer.id, role: 'CUSTOMER' });

    // Fetch existing seeded categories
    const categories = await prisma.category.findMany();
    const cleaningCat = categories.find((c) => c.slug === 'home-cleaning') || categories[0];
    const plumbingCat = categories.find((c) => c.slug === 'plumbing') || categories[1];

    let createdServiceAId = null;
    let createdServiceBId = null;

    // ==========================================
    // SECTION 1: CATEGORY TESTS
    // ==========================================
    console.log('\n--- SECTION 1: CATEGORY TESTS ---');

    // 1. GET categories succeeds
    const res1 = await request('GET', '/api/categories');
    assert(
      res1.status === 200 &&
        res1.body.success === true &&
        Array.isArray(res1.body.data?.categories) &&
        res1.body.data.categories.length >= 8,
      '1. GET /api/categories succeeds and returns seeded categories (200 OK)',
      res1.body
    );

    // ==========================================
    // SECTION 2: SERVICE CREATION TESTS
    // ==========================================
    console.log('\n--- SECTION 2: SERVICE CREATION TESTS ---');

    // 2. Provider can create service
    const createPayloadA = {
      categoryId: cleaningCat.id,
      title: 'Deluxe Apartment Deep Cleaning',
      description: 'Comprehensive top-to-bottom sanitization and dusting for modern homes.',
      price: 1500,
      durationMinutes: 180,
    };
    const res2 = await request('POST', '/api/services', createPayloadA, tokenA);
    assert(
      res2.status === 201 &&
        res2.body.success === true &&
        res2.body.data?.providerId === providerA.id &&
        res2.body.data?.title === createPayloadA.title &&
        res2.body.data?.price === 1500 &&
        res2.body.data?.category?.id === cleaningCat.id,
      '2. Provider can create service (201 Created)',
      res2.body
    );
    createdServiceAId = res2.body.data?.id;

    // 3. Customer cannot create service
    const res3 = await request('POST', '/api/services', createPayloadA, customerToken);
    assert(
      res3.status === 403 && res3.body.success === false,
      '3. Customer cannot create service (403 Forbidden)',
      res3.body
    );

    // 4. Unauthenticated user cannot create service
    const res4 = await request('POST', '/api/services', createPayloadA);
    assert(
      res4.status === 401 && res4.body.success === false,
      '4. Unauthenticated user cannot create service (401 Unauthorized)',
      res4.body
    );

    // 5. Invalid service payload returns 400 (negative price, short description)
    const res5 = await request(
      'POST',
      '/api/services',
      {
        categoryId: cleaningCat.id,
        title: 'AB',
        description: 'short',
        price: -50,
        durationMinutes: 0,
      },
      tokenA
    );
    assert(
      res5.status === 400 && res5.body.success === false,
      '5. Invalid service payload rejected with validation errors (400 Bad Request)',
      res5.body
    );

    // 6. Invalid category returns 404
    const res6 = await request(
      'POST',
      '/api/services',
      {
        categoryId: 999999,
        title: 'Valid Title Here',
        description: 'Valid description that has enough characters for validation.',
        price: 500,
        durationMinutes: 60,
      },
      tokenA
    );
    assert(
      res6.status === 404 &&
        res6.body.success === false &&
        res6.body.message.includes('Category not found'),
      '6. Non-existent category returns 404 Not Found',
      res6.body
    );

    // Create Service B for Provider B
    const createPayloadB = {
      categoryId: plumbingCat.id,
      title: 'Emergency Pipe Leak Repair',
      description: 'Fast 24/7 plumbing repair service for leaks and drainage blockages.',
      price: 800,
      durationMinutes: 60,
    };
    const resCreateB = await request('POST', '/api/services', createPayloadB, tokenB);
    createdServiceBId = resCreateB.body.data?.id;

    // Create additional services to thoroughly test search, filtering, and pagination
    await request(
      'POST',
      '/api/services',
      {
        categoryId: cleaningCat.id,
        title: 'Standard Room Cleaning',
        description: 'Quick vacuum and surface dusting for bedrooms and living rooms.',
        price: 450,
        durationMinutes: 45,
      },
      tokenA
    );

    await request(
      'POST',
      '/api/services',
      {
        categoryId: plumbingCat.id,
        title: 'Bathroom Sink Installation',
        description: 'Professional fitting and plumbing connection for new sink basins.',
        price: 2200,
        durationMinutes: 120,
      },
      tokenB
    );

    // ==========================================
    // SECTION 3: READ & GET SERVICE BY ID TESTS
    // ==========================================
    console.log('\n--- SECTION 3: READ & GET SERVICE BY ID TESTS ---');

    // 7. Public catalog returns active services
    const res7 = await request('GET', '/api/services');
    assert(
      res7.status === 200 &&
        res7.body.success === true &&
        Array.isArray(res7.body.data?.items) &&
        res7.body.data.items.length >= 4,
      '7. Public catalog returns active services (200 OK)',
      res7.body.data?.items?.length
    );

    // 8. Public catalog excludes inactive services
    // Create an inactive service
    const inactiveService = await prisma.service.create({
      data: {
        providerId: providerA.id,
        categoryId: cleaningCat.id,
        title: 'Old Inactive Carpet Washing',
        description: 'Service that has been discontinued and should not be public.',
        price: 300,
        durationMinutes: 30,
        isActive: false,
      },
    });

    const res8 = await request('GET', '/api/services?search=Carpet');
    const includesInactive = res8.body.data?.items?.some((i) => i.id === inactiveService.id);
    assert(
      res8.status === 200 && !includesInactive,
      '8. Public catalog strictly excludes inactive services',
      res8.body.data?.items
    );

    // 9. Get service by ID works
    const res9 = await request('GET', `/api/services/${createdServiceAId}`);
    assert(
      res9.status === 200 &&
        res9.body.success === true &&
        res9.body.data?.service?.id === createdServiceAId &&
        res9.body.data?.service?.title === createPayloadA.title &&
        res9.body.data?.service?.provider?.id === providerA.id &&
        res9.body.data?.service?.category?.id === cleaningCat.id,
      '9. Get service by ID returns full service details (200 OK)',
      res9.body
    );

    // 10. Non-existent service returns 404
    const res10 = await request('GET', '/api/services/999999');
    assert(
      res10.status === 404 && res10.body.success === false,
      '10. Non-existent service ID returns 404 Not Found',
      res10.body
    );

    // Public request to inactive service returns 404
    const resInactivePublic = await request('GET', `/api/services/${inactiveService.id}`);
    assert(
      resInactivePublic.status === 404 && resInactivePublic.body.success === false,
      '10b. Public request to an inactive service returns 404 Not Found',
      resInactivePublic.body
    );

    // ==========================================
    // SECTION 4: SEARCH & FILTER TESTS
    // ==========================================
    console.log('\n--- SECTION 4: SEARCH & FILTER TESTS ---');

    // 11. Search filters correctly
    const res11 = await request('GET', '/api/services?search=Leak');
    const allMatchSearch = res11.body.data?.items?.every(
      (item) => item.title.includes('Leak') || item.description.includes('Leak')
    );
    assert(
      res11.status === 200 && res11.body.data?.items?.length >= 1 && allMatchSearch,
      '11. Search keyword filters matching titles & descriptions (200 OK)',
      res11.body.data?.items?.map((i) => i.title)
    );

    // 12. Category filter works
    const res12 = await request('GET', `/api/services?categoryId=${plumbingCat.id}`);
    const allMatchCategory = res12.body.data?.items?.every(
      (item) => item.category?.id === plumbingCat.id
    );
    assert(
      res12.status === 200 && res12.body.data?.items?.length >= 2 && allMatchCategory,
      '12. Category filter returns only services in the specified category',
      res12.body.data?.items?.map((i) => i.category?.name)
    );

    // 13. minPrice works
    const res13 = await request('GET', '/api/services?minPrice=1000');
    const allMatchMinPrice = res13.body.data?.items?.every((item) => item.price >= 1000);
    assert(
      res13.status === 200 && res13.body.data?.items?.length >= 2 && allMatchMinPrice,
      '13. minPrice filter returns services with price >= minPrice',
      res13.body.data?.items?.map((i) => i.price)
    );

    // 14. maxPrice works
    const res14 = await request('GET', '/api/services?maxPrice=900');
    const allMatchMaxPrice = res14.body.data?.items?.every((item) => item.price <= 900);
    assert(
      res14.status === 200 && res14.body.data?.items?.length >= 2 && allMatchMaxPrice,
      '14. maxPrice filter returns services with price <= maxPrice',
      res14.body.data?.items?.map((i) => i.price)
    );

    // 15. Combined filters work (categoryId + minPrice + maxPrice)
    const res15 = await request(
      'GET',
      `/api/services?categoryId=${cleaningCat.id}&minPrice=1000&maxPrice=2000`
    );
    const allMatchCombined = res15.body.data?.items?.every(
      (item) => item.category?.id === cleaningCat.id && item.price >= 1000 && item.price <= 2000
    );
    assert(
      res15.status === 200 && res15.body.data?.items?.length >= 1 && allMatchCombined,
      '15. Combined filters (Category + Price Range) work accurately',
      res15.body.data?.items
    );

    // ==========================================
    // SECTION 5: SORTING TESTS
    // ==========================================
    console.log('\n--- SECTION 5: SORTING TESTS ---');

    // 16. price ascending works
    const res16 = await request('GET', '/api/services?sort=price_asc');
    const pricesAsc = res16.body.data?.items?.map((i) => i.price);
    const isSortedAsc = pricesAsc.every(
      (val, idx, arr) => idx === 0 || arr[idx - 1] <= val
    );
    assert(
      res16.status === 200 && isSortedAsc,
      '16. sort=price_asc orders services in ascending price',
      pricesAsc
    );

    // 17. price descending works
    const res17 = await request('GET', '/api/services?sort=price_desc');
    const pricesDesc = res17.body.data?.items?.map((i) => i.price);
    const isSortedDesc = pricesDesc.every(
      (val, idx, arr) => idx === 0 || arr[idx - 1] >= val
    );
    assert(
      res17.status === 200 && isSortedDesc,
      '17. sort=price_desc orders services in descending price',
      pricesDesc
    );

    // 18. newest sorting works (default)
    const res18 = await request('GET', '/api/services?sort=newest');
    const datesDesc = res18.body.data?.items?.map((i) => new Date(i.createdAt).getTime());
    const isSortedNewest = datesDesc.every(
      (val, idx, arr) => idx === 0 || arr[idx - 1] >= val
    );
    assert(
      res18.status === 200 && isSortedNewest,
      '18. sort=newest orders services by creation date descending',
      res18.body.data?.items?.length
    );

    // 19. invalid sort value is rejected
    const res19 = await request('GET', '/api/services?sort=sql_injection_field');
    assert(
      res19.status === 400 && res19.body.success === false,
      '19. Non-allowlist sort parameter is rejected (400 Bad Request)',
      res19.body
    );

    // ==========================================
    // SECTION 6: PAGINATION TESTS
    // ==========================================
    console.log('\n--- SECTION 6: PAGINATION TESTS ---');

    // 20. page/limit works
    const res20 = await request('GET', '/api/services?page=1&limit=2');
    assert(
      res20.status === 200 &&
        res20.body.data?.items?.length === 2 &&
        res20.body.data?.pagination?.page === 1 &&
        res20.body.data?.pagination?.limit === 2,
      '20. Server-side pagination returns exact limit slice',
      res20.body.data?.pagination
    );

    // 21. totalItems is correct
    assert(
      res20.body.data?.pagination?.totalItems >= 4,
      '21. Pagination metadata reports accurate totalItems count',
      res20.body.data?.pagination?.totalItems
    );

    // 22. totalPages is correct
    const expectedPages = Math.ceil(res20.body.data?.pagination?.totalItems / 2);
    assert(
      res20.body.data?.pagination?.totalPages === expectedPages,
      '22. totalPages calculation is mathematically correct',
      res20.body.data?.pagination?.totalPages
    );

    // 23. maximum limit is enforced (limit > 50 rejected)
    const res23 = await request('GET', '/api/services?limit=100');
    assert(
      res23.status === 400 &&
        res23.body.success === false &&
        res23.body.message.includes('50'),
      '23. Maximum limit exceeding 50 is rejected (400 Bad Request)',
      res23.body
    );

    // ==========================================
    // SECTION 7: PROVIDER OWNERSHIP & CRUD
    // ==========================================
    console.log('\n--- SECTION 7: PROVIDER OWNERSHIP & CRUD TESTS ---');

    // 24. Provider can update own service
    const updatePayload = {
      title: 'Deluxe Apartment Deep Cleaning (Updated Edition)',
      price: 1650,
      durationMinutes: 200,
    };
    const res24 = await request(
      'PUT',
      `/api/services/${createdServiceAId}`,
      updatePayload,
      tokenA
    );
    assert(
      res24.status === 200 &&
        res24.body.success === true &&
        res24.body.data?.service?.title === updatePayload.title &&
        res24.body.data?.service?.price === 1650 &&
        res24.body.data?.service?.durationMinutes === 200,
      '24. Provider can update their own service (200 OK)',
      res24.body
    );

    // 25. Provider cannot update another provider's service (403 Forbidden)
    const res25 = await request(
      'PUT',
      `/api/services/${createdServiceAId}`,
      { title: 'Hacked by Provider B' },
      tokenB
    );
    assert(
      res25.status === 403 &&
        res25.body.success === false &&
        res25.body.message.includes('do not own'),
      '25. Provider cannot update another provider’s service (403 Forbidden)',
      res25.body
    );

    // 26. Provider can deactivate own service
    const res26 = await request('DELETE', `/api/services/${createdServiceAId}`, null, tokenA);
    assert(
      res26.status === 200 &&
        res26.body.success === true &&
        res26.body.message.includes('deactivated'),
      '26. Provider can deactivate (soft delete) their own service (200 OK)',
      res26.body
    );

    // Verify in database that it is marked isActive = false
    const dbDeactivated = await prisma.service.findUnique({
      where: { id: createdServiceAId },
    });
    assert(
      dbDeactivated && dbDeactivated.isActive === false,
      '26b. Database verification: service is soft-deleted with isActive=false',
      dbDeactivated?.isActive
    );

    // 27. Provider cannot deactivate another provider's service (403 Forbidden)
    const res27 = await request('DELETE', `/api/services/${createdServiceBId}`, null, tokenA);
    assert(
      res27.status === 403 &&
        res27.body.success === false &&
        res27.body.message.includes('do not own'),
      '27. Provider cannot deactivate another provider’s service (403 Forbidden)',
      res27.body
    );

    // Provider get own services (/api/services/provider/me)
    const resProvMe = await request('GET', '/api/services/provider/me', null, tokenA);
    const allOwnedByA = resProvMe.body.data?.items?.every(
      (item) => item.providerId === providerA.id
    );
    assert(
      resProvMe.status === 200 &&
        resProvMe.body.data?.items?.length >= 2 &&
        allOwnedByA,
      '27b. GET /api/services/provider/me returns ONLY services owned by the authenticated provider',
      resProvMe.body.data?.items?.map((i) => ({ id: i.id, providerId: i.providerId }))
    );

    // ==========================================
    // SECTION 8: ROLE & SECURITY RESTRICTIONS
    // ==========================================
    console.log('\n--- SECTION 8: ROLE & SECURITY RESTRICTIONS ---');

    // 28. Customer cannot access provider-only endpoints
    const res28 = await request('GET', '/api/services/provider/me', null, customerToken);
    assert(
      res28.status === 403 && res28.body.success === false,
      '28. Customer cannot access /api/services/provider/me (403 Forbidden)',
      res28.body
    );

    // 29. Provider-only endpoint requires valid JWT
    const res29 = await request('GET', '/api/services/provider/me');
    assert(
      res29.status === 401 && res29.body.success === false,
      '29. Provider-only endpoint requires valid JWT (401 Unauthorized)',
      res29.body
    );

    // 30. Security: passwordHash is never exposed in service details or provider objects
    const res30 = await request('GET', `/api/services/${createdServiceBId}`);
    const providerInDetails = res30.body.data?.service?.provider;
    const isPasswordHashExposed =
      providerInDetails?.passwordHash !== undefined ||
      res7.body.data?.items?.[0]?.provider?.passwordHash !== undefined;
    assert(
      !isPasswordHashExposed && providerInDetails?.name === 'Provider Beta',
      '30. Security: passwordHash is NEVER exposed in service responses or nested provider objects',
      providerInDetails
    );

    // 31. Security: providerId cannot be overridden through request body
    const overrideAttemptPayload = {
      categoryId: cleaningCat.id,
      title: 'Attempted Impersonation Service',
      description: 'Attempting to inject a different providerId in request body.',
      price: 999,
      durationMinutes: 60,
      providerId: 99999, // Attempted spoofed ID
    };
    const res31 = await request('POST', '/api/services', overrideAttemptPayload, tokenA);
    assert(
      res31.status === 201 && res31.body.data?.providerId === providerA.id,
      '31. Security: providerId from request body is ignored; JWT claims are authoritative',
      { returnedProviderId: res31.body.data?.providerId, tokenProviderId: providerA.id }
    );

    // Cleanup test data
    await prisma.service.deleteMany({
      where: {
        providerId: { in: [providerA.id, providerB.id] },
      },
    });
    await prisma.user.deleteMany({
      where: {
        id: { in: [providerA.id, providerB.id, customer.id] },
      },
    });

    console.log('\n==================================================');
    console.log(`SERVICE TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal Service Test Error:', err);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
    await prisma.$disconnect();
  }
};

runAllServiceTests();
