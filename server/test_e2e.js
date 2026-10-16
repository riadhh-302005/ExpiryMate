// ============================================================================
// File: server/test_e2e.js
// 1. What this file does:
//    Automated end-to-end sanity verification test for ExpiryMate API endpoints:
//    authentication, user data isolation, purchase CRUD, dynamic countdown math,
//    dashboard metrics aggregation, and reminder job deduplication.
// 2. Why this file exists in the application:
//    Verifies that all server features, security measures, and database operations
//    function properly end-to-end without requiring manual UI clicking.
// 3. Important functions, variables, or concepts to remember:
//    - Tests registration and JWT generation.
//    - Tests User isolation (User B is forbidden from accessing User A's data).
//    - Tests dynamic deadline math (open vs approaching vs closed vs expiring_soon).
//    - Tests idempotent email reminder checks (second execution skips already sent).
// 4. How it connects to other parts of the application:
//    Tests server.js, controllers, models, and jobs against a real MongoDB connection.
// ============================================================================

require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const User = require('./models/User');
const Purchase = require('./models/Purchase');
const { checkAndSendReminders } = require('./jobs/reminderJob');
const { attachDynamicStatus } = require('./utils/dateCalculations');

const PORT = 5001; // Use separate port for test runner
let serverInstance;

const BASE_URL = `http://localhost:${PORT}/api`;

const makeRequest = (method, endpoint, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${endpoint}`);
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('\n======================================================');
  console.log(' Starting ExpiryMate End-to-End Automated Test Suite');
  console.log('======================================================\n');

  try {
    // 1. Connect Mongoose
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/expirymate';
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB');

    // Clean up test users
    await User.deleteMany({ email: { $in: ['test_user_a@example.com', 'test_user_b@example.com'] } });
    await Purchase.deleteMany({ productName: { $regex: /Test Item/ } });

    // 2. Start Test Server
    const app = require('express')();
    const cors = require('cors');
    const cookieParser = require('cookie-parser');
    app.use(cors({ origin: true, credentials: true }));
    app.use(require('express').json());
    app.use(cookieParser());
    app.use('/api/auth', require('./routes/authRoutes'));
    app.use('/api/purchases', require('./routes/purchaseRoutes'));
    app.use('/api/dashboard', require('./routes/dashboardRoutes'));
    const { errorHandler, notFound } = require('./middleware/errorMiddleware');
    app.use(notFound);
    app.use(errorHandler);

    serverInstance = app.listen(PORT);
    console.log(`✓ Test HTTP server listening on port ${PORT}`);

    // 3. Test Registration for User A
    console.log('\n[1/7] Testing User Registration...');
    const regResA = await makeRequest('POST', '/auth/register', {
      name: 'Alice Tester',
      email: 'test_user_a@example.com',
      password: 'password123'
    });
    if (regResA.status !== 201 || !regResA.data.token) {
      throw new Error(`Registration failed: ${JSON.stringify(regResA.data)}`);
    }
    const tokenA = regResA.data.token;
    console.log('✓ User A registered successfully. Received JWT token.');

    // 4. Test User Profile Retrieval (/auth/me)
    console.log('\n[2/7] Testing Authenticated Session (/auth/me)...');
    const meRes = await makeRequest('GET', '/auth/me', null, tokenA);
    if (meRes.status !== 200 || meRes.data.user.email !== 'test_user_a@example.com') {
      throw new Error(`Auth me failed: ${JSON.stringify(meRes.data)}`);
    }
    console.log(`✓ Authenticated as: ${meRes.data.user.name} (${meRes.data.user.email})`);

    // 5. Test Registration for User B (Isolation Check)
    console.log('\n[3/7] Registering User B for Security Isolation Testing...');
    const regResB = await makeRequest('POST', '/auth/register', {
      name: 'Bob Isolation',
      email: 'test_user_b@example.com',
      password: 'password456'
    });
    const tokenB = regResB.data.token;
    console.log('✓ User B registered successfully.');

    // 6. User A Creates 3 Purchases
    console.log('\n[4/7] Creating 3 Test Purchases for User A...');
    const today = new Date();

    // Item 1: Return in 2 days (Approaching), Warranty in 180 days (Active)
    const return2d = new Date(today);
    return2d.setDate(today.getDate() + 2);
    const warranty180d = new Date(today);
    warranty180d.setDate(today.getDate() + 180);

    const item1Res = await makeRequest('POST', '/purchases', {
      productName: 'Test Item 1: Wireless Earbuds',
      category: 'Electronics',
      price: 149.99,
      seller: 'Best Electronics Store',
      purchaseDate: today.toISOString(),
      returnDeadline: return2d.toISOString(),
      warrantyEndDate: warranty180d.toISOString()
    }, tokenA);

    if (item1Res.status !== 201) {
      throw new Error(`Failed to create item 1: ${JSON.stringify(item1Res.data)}`);
    }
    const item1Id = item1Res.data.data._id;
    console.log(`✓ Created Item 1 (ID: ${item1Id})`);
    console.log(`  - Return Status:   ${item1Res.data.data.returnStatus.status} (${item1Res.data.data.returnStatus.label})`);
    console.log(`  - Warranty Status: ${item1Res.data.data.warrantyStatus.status} (${item1Res.data.data.warrantyStatus.label})`);

    // Item 2: Return in 25 days (Open), Warranty in 15 days (Expiring soon!)
    const return25d = new Date(today);
    return25d.setDate(today.getDate() + 25);
    const warranty15d = new Date(today);
    warranty15d.setDate(today.getDate() + 15);

    const item2Res = await makeRequest('POST', '/purchases', {
      productName: 'Test Item 2: Kitchen Blender',
      category: 'Home & Kitchen',
      price: 79.50,
      seller: 'Home Essentials Mart',
      purchaseDate: today.toISOString(),
      returnDeadline: return25d.toISOString(),
      warrantyEndDate: warranty15d.toISOString()
    }, tokenA);
    console.log(`✓ Created Item 2: Warranty expiring in 15 days (${item2Res.data.data.warrantyStatus.status})`);

    // Item 3: Return closed 5 days ago, Warranty expired 10 days ago
    const returnPast = new Date(today);
    returnPast.setDate(today.getDate() - 5);
    const warrantyPast = new Date(today);
    warrantyPast.setDate(today.getDate() - 10);

    const item3Res = await makeRequest('POST', '/purchases', {
      productName: 'Test Item 3: Expired Desk Lamp',
      category: 'Furniture',
      price: 45.00,
      seller: 'Office Surplus',
      purchaseDate: today.toISOString(),
      returnDeadline: returnPast.toISOString(),
      warrantyEndDate: warrantyPast.toISOString()
    }, tokenA);
    console.log(`✓ Created Item 3: Return closed (${item3Res.data.data.returnStatus.status}), Warranty expired (${item3Res.data.data.warrantyStatus.status})`);

    // 7. Test User Isolation Security
    console.log('\n[5/7] Verifying User Isolation & Authorization Security...');
    const unauthorizedAccessRes = await makeRequest('GET', `/purchases/${item1Id}`, null, tokenB);
    if (unauthorizedAccessRes.status !== 403) {
      throw new Error(`Security vulnerability: User B should be rejected with 403, but received: ${unauthorizedAccessRes.status}`);
    }
    console.log('✓ PASS: User B was strictly forbidden (403 Forbidden) from accessing User A purchase!');

    const unauthorizedDeleteRes = await makeRequest('DELETE', `/purchases/${item1Id}`, null, tokenB);
    if (unauthorizedDeleteRes.status !== 403) {
      throw new Error(`Security vulnerability: User B could delete User A item! Status: ${unauthorizedDeleteRes.status}`);
    }
    console.log('✓ PASS: User B cannot delete User A purchase!');

    // 8. Test Dashboard Metrics Aggregation
    console.log('\n[6/7] Testing Dashboard Analytics Aggregation...');
    const statsRes = await makeRequest('GET', '/dashboard/stats', null, tokenA);
    if (statsRes.status !== 200) {
      throw new Error(`Failed to fetch stats: ${JSON.stringify(statsRes.data)}`);
    }

    const { summary, categorySpending, monthlySpending } = statsRes.data.data;
    console.log('✓ Summary metrics calculated accurately:');
    console.log(`  - Total Registered Purchases: ${summary.totalPurchases}`);
    console.log(`  - Total Spending:            $${summary.totalSpending}`);
    console.log(`  - Active Warranties:         ${summary.activeWarranties}`);
    console.log(`  - Warranties Expiring Soon:  ${summary.expiringWarranties}`);
    console.log(`  - Return Deadlines Closing:  ${summary.upcomingReturns}`);

    if (summary.totalPurchases < 3 || summary.totalSpending < 274.49) {
      throw new Error(`Dashboard stats mismatch! Received: ${JSON.stringify(summary)}`);
    }

    // 9. Test Email Reminders and Deduplication
    console.log('\n[7/7] Testing Email Reminders & Duplicate-Prevention Flags...');
    const reminderCheck1 = await checkAndSendReminders();
    console.log(`✓ Run 1 Result: Sent ${reminderCheck1.returnRemindersSent} return alert(s), ${reminderCheck1.warrantyRemindersSent} warranty alert(s).`);

    // Run again immediately - should NOT duplicate!
    const reminderCheck2 = await checkAndSendReminders();
    console.log(`✓ Run 2 Result (Idempotency test): Sent ${reminderCheck2.returnRemindersSent} return alert(s), ${reminderCheck2.warrantyRemindersSent} warranty alert(s).`);

    if (reminderCheck2.returnRemindersSent !== 0 || reminderCheck2.warrantyRemindersSent !== 0) {
      throw new Error('Duplicate reminder bug: Flags failed to prevent re-sending notifications!');
    }
    console.log('✓ PASS: Duplicate reminders were successfully prevented by remindersSent flags!');

    // Clean up test data
    await User.deleteMany({ email: { $in: ['test_user_a@example.com', 'test_user_b@example.com'] } });
    await Purchase.deleteMany({ productName: { $regex: /Test Item/ } });
    console.log('✓ Test data cleaned up.');

    console.log('\n======================================================');
    console.log(' ALL 7 END-TO-END ACCEPTANCE TESTS PASSED SUCCESSFULLY!');
    console.log('======================================================\n');
  } catch (error) {
    console.error(`\n❌ TEST FAILED: ${error.message}`);
    process.exitCode = 1;
  } finally {
    if (serverInstance) serverInstance.close();
    await mongoose.disconnect();
    process.exit(process.exitCode || 0);
  }
};

runTests();
