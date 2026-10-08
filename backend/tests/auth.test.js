const http = require('http');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const prisma = require('../src/db/prisma');
const config = require('../src/config/config');

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

const runAllTests = async () => {
  console.log('\n==================================================');
  console.log('STARTING PHASE 1 AUTHENTICATION & RBAC TEST SUITE');
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
    // 1. Start test server on random ephemeral port
    server = app.listen(0);
    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;

    // Clean up any previous test accounts in database
    await prisma.booking.deleteMany({
      where: {
        customer: { email: { contains: 'test_phase1_' } },
      },
    });
    await prisma.user.deleteMany({
      where: {
        email: { contains: 'test_phase1_' },
      },
    });

    const timestamp = Date.now();
    const customerEmail = `test_phase1_cust_${timestamp}@example.com`;
    const providerEmail = `test_phase1_prov_${timestamp}@example.com`;
    const strongPassword = 'StrongPassword123!';

    let customerToken = null;
    let providerToken = null;

    // ==========================================
    // SECTION 1: REGISTRATION TESTS
    // ==========================================
    console.log('\n--- SECTION 1: REGISTRATION TESTS ---');

    // 1. Valid customer registration
    const res1 = await request('POST', '/api/auth/register', {
      name: 'Test Customer',
      email: customerEmail,
      password: strongPassword,
      role: 'CUSTOMER',
    });
    assert(
      res1.status === 201 &&
        res1.body.success === true &&
        res1.body.data?.user?.email === customerEmail &&
        res1.body.data?.user?.role === 'CUSTOMER' &&
        typeof res1.body.data?.token === 'string',
      '1. Valid customer registration (201 Created)',
      res1.body
    );
    customerToken = res1.body.data?.token;

    // 2. Valid provider registration
    const res2 = await request('POST', '/api/auth/register', {
      name: 'Test Provider',
      email: providerEmail,
      password: strongPassword,
      role: 'PROVIDER',
    });
    assert(
      res2.status === 201 &&
        res2.body.success === true &&
        res2.body.data?.user?.email === providerEmail &&
        res2.body.data?.user?.role === 'PROVIDER' &&
        typeof res2.body.data?.token === 'string',
      '2. Valid provider registration (201 Created)',
      res2.body
    );
    providerToken = res2.body.data?.token;

    // 3. Duplicate email registration
    const res3 = await request('POST', '/api/auth/register', {
      name: 'Duplicate John',
      email: customerEmail,
      password: strongPassword,
      role: 'CUSTOMER',
    });
    assert(
      res3.status === 409 && res3.body.success === false,
      '3. Duplicate email registration (409 Conflict)',
      res3.body
    );

    // 4. Invalid email format
    const res4 = await request('POST', '/api/auth/register', {
      name: 'Bad Email User',
      email: 'not-an-email',
      password: strongPassword,
      role: 'CUSTOMER',
    });
    assert(
      res4.status === 400 && res4.body.success === false,
      '4. Invalid email format (400 Bad Request)',
      res4.body
    );

    // 5. Missing required field (name missing)
    const res5 = await request('POST', '/api/auth/register', {
      email: `test_phase1_noname_${timestamp}@example.com`,
      password: strongPassword,
      role: 'CUSTOMER',
    });
    assert(
      res5.status === 400 && res5.body.success === false,
      '5. Missing required field (400 Bad Request)',
      res5.body
    );

    // 6. Weak password (no uppercase or digits or special chars)
    const res6 = await request('POST', '/api/auth/register', {
      name: 'Weak Password User',
      email: `test_phase1_weak_${timestamp}@example.com`,
      password: 'weak',
      role: 'CUSTOMER',
    });
    assert(
      res6.status === 400 && res6.body.success === false,
      '6. Weak / invalid password rejected (400 Bad Request)',
      res6.body
    );

    // 7. Invalid role
    const res7 = await request('POST', '/api/auth/register', {
      name: 'Invalid Role User',
      email: `test_phase1_badrole_${timestamp}@example.com`,
      password: strongPassword,
      role: 'SUPERADMIN',
    });
    assert(
      res7.status === 400 && res7.body.success === false,
      '7. Invalid role rejected (400 Bad Request)',
      res7.body
    );

    // 8. Verify password is saved as a bcrypt hash in database
    const dbCustomer = await prisma.user.findUnique({
      where: { email: customerEmail },
    });
    const isBcryptHash =
      dbCustomer &&
      dbCustomer.passwordHash &&
      dbCustomer.passwordHash.startsWith('$2') &&
      dbCustomer.passwordHash !== strongPassword;
    assert(
      isBcryptHash,
      '8. Database verification: password stored as secure bcrypt hash (not plaintext)',
      { storedHashLength: dbCustomer?.passwordHash?.length }
    );

    // 9. Verify passwordHash is NOT returned in API response
    const passwordHashNotExposed =
      res1.body.data?.user?.passwordHash === undefined &&
      res2.body.data?.user?.passwordHash === undefined;
    assert(
      passwordHashNotExposed,
      '9. Security verification: passwordHash is NEVER exposed in registration response',
      res1.body.data?.user
    );

    // ==========================================
    // SECTION 2: LOGIN TESTS
    // ==========================================
    console.log('\n--- SECTION 2: LOGIN TESTS ---');

    // 10. Valid customer login
    const res10 = await request('POST', '/api/auth/login', {
      email: customerEmail,
      password: strongPassword,
    });
    assert(
      res10.status === 200 &&
        res10.body.success === true &&
        res10.body.data?.user?.email === customerEmail &&
        res10.body.data?.user?.role === 'CUSTOMER' &&
        typeof res10.body.data?.token === 'string',
      '10. Valid customer login (200 OK)',
      res10.body
    );

    // 11. Valid provider login
    const res11 = await request('POST', '/api/auth/login', {
      email: providerEmail,
      password: strongPassword,
    });
    assert(
      res11.status === 200 &&
        res11.body.success === true &&
        res11.body.data?.user?.email === providerEmail &&
        res11.body.data?.user?.role === 'PROVIDER' &&
        typeof res11.body.data?.token === 'string',
      '11. Valid provider login (200 OK)',
      res11.body
    );

    // 12. Incorrect password
    const res12 = await request('POST', '/api/auth/login', {
      email: customerEmail,
      password: 'WrongPassword999!',
    });
    assert(
      res12.status === 401 &&
        res12.body.success === false &&
        res12.body.message === 'Invalid email or password',
      '12. Incorrect password returns generic 401 Unauthorized',
      res12.body
    );

    // 13. Non-existent email
    const res13 = await request('POST', '/api/auth/login', {
      email: `nonexistent_${timestamp}@example.com`,
      password: strongPassword,
    });
    assert(
      res13.status === 401 &&
        res13.body.success === false &&
        res13.body.message === 'Invalid email or password',
      '13. Non-existent email returns generic 401 Unauthorized (no user enumeration)',
      res13.body
    );

    // 14. Missing fields in login
    const res14 = await request('POST', '/api/auth/login', {
      email: customerEmail,
    });
    assert(
      res14.status === 400 && res14.body.success === false,
      '14. Missing fields in login rejected (400 Bad Request)',
      res14.body
    );

    // ==========================================
    // SECTION 3: JWT AUTHENTICATION MIDDLEWARE
    // ==========================================
    console.log('\n--- SECTION 3: JWT AUTHENTICATION TESTS ---');

    // 15. Valid JWT on protected endpoint
    const res15 = await request('GET', '/api/auth/me', null, customerToken);
    assert(
      res15.status === 200 &&
        res15.body.success === true &&
        res15.body.data?.user?.email === customerEmail,
      '15. Valid JWT allows access to protected endpoint (200 OK)',
      res15.body
    );

    // 16. Missing JWT
    const res16 = await request('GET', '/api/auth/me');
    assert(
      res16.status === 401 && res16.body.success === false,
      '16. Missing JWT token rejected (401 Unauthorized)',
      res16.body
    );

    // 17. Invalid JWT signature
    const res17 = await request('GET', '/api/auth/me', null, 'invalid.jwt.token.string');
    assert(
      res17.status === 401 && res17.body.success === false,
      '17. Tampered / invalid JWT rejected (401 Unauthorized)',
      res17.body
    );

    // 18. Expired JWT
    const expiredToken = jwt.sign(
      { userId: dbCustomer.id, role: 'CUSTOMER' },
      config.jwt.secret,
      { expiresIn: '-10s' }
    );
    const res18 = await request('GET', '/api/auth/me', null, expiredToken);
    assert(
      res18.status === 401 &&
        res18.body.success === false &&
        res18.body.message.includes('expired'),
      '18. Expired JWT rejected (401 Unauthorized)',
      res18.body
    );

    // ==========================================
    // SECTION 4: ROLE-BASED AUTHORIZATION (RBAC)
    // ==========================================
    console.log('\n--- SECTION 4: ROLE-BASED AUTHORIZATION TESTS ---');

    // 19. Customer attempting to access provider-only endpoint
    const res19 = await request('GET', '/api/auth/test-provider-only', null, customerToken);
    assert(
      res19.status === 403 &&
        res19.body.success === false &&
        res19.body.message.includes('forbidden'),
      '19. Customer accessing provider-only endpoint rejected (403 Forbidden)',
      res19.body
    );

    // 20. Provider attempting to access customer-only endpoint
    const res20 = await request('GET', '/api/auth/test-customer-only', null, providerToken);
    assert(
      res20.status === 403 &&
        res20.body.success === false &&
        res20.body.message.includes('forbidden'),
      '20. Provider accessing customer-only endpoint rejected (403 Forbidden)',
      res20.body
    );

    // Verification that matching roles succeed on their respective test endpoints
    const res19Valid = await request('GET', '/api/auth/test-provider-only', null, providerToken);
    assert(
      res19Valid.status === 200 && res19Valid.body.success === true,
      '19b. Provider accessing provider-only endpoint succeeds (200 OK)',
      res19Valid.body
    );

    const res20Valid = await request('GET', '/api/auth/test-customer-only', null, customerToken);
    assert(
      res20Valid.status === 200 && res20Valid.body.success === true,
      '20b. Customer accessing customer-only endpoint succeeds (200 OK)',
      res20Valid.body
    );

    // ==========================================
    // SECTION 5: AUTH ME ENDPOINT TESTS
    // ==========================================
    console.log('\n--- SECTION 5: GET /api/auth/me TESTS ---');

    // 21. Valid authenticated user profile
    const res21 = await request('GET', '/api/auth/me', null, providerToken);
    const profile = res21.body.data?.user;
    const isSafeProfile =
      profile &&
      profile.id !== undefined &&
      profile.name === 'Test Provider' &&
      profile.email === providerEmail &&
      profile.role === 'PROVIDER' &&
      profile.createdAt !== undefined &&
      profile.passwordHash === undefined;
    assert(
      res21.status === 200 && isSafeProfile,
      '21. Valid authenticated user receives safe profile information (200 OK)',
      profile
    );

    // 22. Unauthenticated request to /me
    const res22 = await request('GET', '/api/auth/me');
    assert(
      res22.status === 401 && res22.body.success === false,
      '22. Unauthenticated request to /api/auth/me rejected (401 Unauthorized)',
      res22.body
    );

    // Clean up test data
    await prisma.user.deleteMany({
      where: {
        email: { in: [customerEmail, providerEmail] },
      },
    });

    console.log('\n==================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal Test Runner Error:', err);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
    await prisma.$disconnect();
  }
};

runAllTests();
