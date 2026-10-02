import http from 'http';
import fs from 'fs';
import path from 'path';
import assert from 'assert';
import crypto from 'crypto';

function request(options, body) {
  return new Promise((resolve, reject) => {
    const defaultHeaders = {};
    if (body) {
      defaultHeaders['Content-Type'] = 'application/json';
    }
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        ...options,
        headers: {
          ...defaultHeaders,
          ...(options.headers || {}),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = data;
          }
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        });
      }
    );
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runBillingAndOrderIdSuite() {
  console.log('====================================================');
  console.log('RUNNING MOMENTPRESS BILLING & ORDER ID TEST SUITE');
  console.log('====================================================');

  let passed = 0;
  function check(desc, condition) {
    assert(condition, desc);
    console.log(`  ✓ ${desc}`);
    passed++;
  }

  // 1. Get or create admin session
  const storePath = path.resolve('data/momentpress-store.json');
  let store = JSON.parse(fs.readFileSync(storePath, 'utf8'));
  let adminToken = store.sessions && store.sessions[0] ? store.sessions[0].token : null;
  if (!adminToken) {
    adminToken = crypto.randomBytes(32).toString('hex');
    store.sessions = [{ token: adminToken, username: 'admin', createdAt: Date.now(), expiresAt: Date.now() + 86400000 }];
    fs.writeFileSync(storePath, JSON.stringify(store, null, 2));
  }

  // ====================================================
  // 1. STRICT SEQUENTIAL ORDER ID CREATION
  // ====================================================
  console.log('\n--- 1. Testing Strict Sequential Order ID System ---');
  
  // Create first order
  const orderRes1 = await request(
    { path: '/api/public/orders', method: 'POST' },
    {
      customerName: 'Sequential Tester One',
      mobileNumber: '9830111111',
      address: '10 College Square',
      city: 'Kolkata',
      pincode: '700073',
      product: 'Custom Photo Frames',
      size: '5×7 in',
      quality: 'Standard Luster',
      quantity: 1,
    }
  );
  check('Order 1 created with HTTP 201', orderRes1.status === 201 && orderRes1.body.success);
  const id1 = orderRes1.body.order.id;
  check(`Order 1 matches strict sequential format /^MP-\\d+$/: ${id1}`, /^MP-\d+$/.test(id1));
  const num1 = parseInt(id1.replace('MP-', ''), 10);

  // Create second order
  const orderRes2 = await request(
    { path: '/api/public/orders', method: 'POST' },
    {
      customerName: 'Sequential Tester Two',
      mobileNumber: '9830222222',
      address: '12 College Square',
      city: 'Kolkata',
      pincode: '700073',
      product: 'Photo Stickers',
      size: 'Medium (3×3 in)',
      quantity: 2,
    }
  );
  check('Order 2 created with HTTP 201', orderRes2.status === 201 && orderRes2.body.success);
  const id2 = orderRes2.body.order.id;
  const num2 = parseInt(id2.replace('MP-', ''), 10);
  check(`Order 2 incremented strictly by 1 (${id1} -> ${id2})`, num2 === num1 + 1);

  // Create third order
  const orderRes3 = await request(
    { path: '/api/public/orders', method: 'POST' },
    {
      customerName: 'Sequential Tester Three',
      mobileNumber: '9830333333',
      address: '14 College Square',
      city: 'Kolkata',
      pincode: '700073',
      product: 'Custom Photo Frames',
      size: '8×10 in',
      quality: 'Studio Velvet',
      quantity: 1,
    }
  );
  check('Order 3 created with HTTP 201', orderRes3.status === 201 && orderRes3.body.success);
  const id3 = orderRes3.body.order.id;
  const num3 = parseInt(id3.replace('MP-', ''), 10);
  check(`Order 3 incremented strictly by 1 (${id2} -> ${id3})`, num3 === num2 + 1);

  // Test Idempotency: submitting with same idempotencyKey returns exact same order ID without incrementing sequence
  const idemKey = 'test-idem-' + Date.now();
  const orderResIdem1 = await request(
    { path: '/api/public/orders', method: 'POST' },
    {
      customerName: 'Idempotency Tester',
      mobileNumber: '9830444444',
      address: '16 College Square',
      city: 'Kolkata',
      pincode: '700073',
      product: 'Photo Stickers',
      size: 'Small (2×2 in)',
      quantity: 1,
      idempotencyKey: idemKey,
    }
  );
  check('Initial order with idempotency key succeeds', orderResIdem1.status === 201);
  const idemOrderId = orderResIdem1.body.order.id;

  const orderResIdem2 = await request(
    { path: '/api/public/orders', method: 'POST' },
    {
      customerName: 'Idempotency Tester',
      mobileNumber: '9830444444',
      address: '16 College Square',
      city: 'Kolkata',
      pincode: '700073',
      product: 'Photo Stickers',
      size: 'Small (2×2 in)',
      quantity: 1,
      idempotencyKey: idemKey,
    }
  );
  check('Duplicate submission with same idempotency key returns same Order ID', orderResIdem2.body.order.id === idemOrderId);
  check('Duplicate response flags duplicate: true', orderResIdem2.body.duplicate === true);

  // Test Non-Reuse on Deletion & Persistent Counter:
  console.log('\n--- 2. Testing Non-Reuse on Deletion & Gap Handling ---');
  store = JSON.parse(fs.readFileSync(storePath, 'utf8'));
  const currentNext = store.nextOrderNumber;
  check('store.nextOrderNumber is persisted as a positive number in JSON', typeof currentNext === 'number' && currentNext > 0);

  // Simulate deleting the last order from onlineOrders
  store.onlineOrders = store.onlineOrders.filter((o) => o.id !== idemOrderId);
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2));

  // Create a new order after deletion
  const orderAfterDelete = await request(
    { path: '/api/public/orders', method: 'POST' },
    {
      customerName: 'After Delete Tester',
      mobileNumber: '9830555555',
      address: '18 College Square',
      city: 'Kolkata',
      pincode: '700073',
      product: 'Photo Stickers',
      size: 'Large (4×4 in)',
      quantity: 1,
    }
  );
  check('Order after deletion created successfully', orderAfterDelete.status === 201);
  const idAfterDelete = orderAfterDelete.body.order.id;
  check(`Deleted Order ID (${idemOrderId}) was NEVER reused (new order is ${idAfterDelete})`, idAfterDelete !== idemOrderId);
  const numAfterDelete = parseInt(idAfterDelete.replace('MP-', ''), 10);
  const deletedNum = parseInt(idemOrderId.replace('MP-', ''), 10);
  check('New order ID strictly greater than deleted order ID', numAfterDelete > deletedNum);

  // ====================================================
  // 3. BILL / INVOICE GENERATION API
  // ====================================================
  console.log('\n--- 3. Testing Bill / Invoice Generation API ---');

  // Unauthorized request rejected
  const unauthBillRes = await request(
    { path: `/api/admin/orders/${id1}/bill`, method: 'POST' }
  );
  check('Bill generation rejected without admin auth (HTTP 401)', unauthBillRes.status === 401);

  // Non-existent order rejected
  const notFoundBillRes = await request(
    { path: `/api/admin/orders/MP-NONEXISTENT/bill`, method: 'POST', headers: { Authorization: `Bearer ${adminToken}` } }
  );
  check('Bill generation for non-existent order returns 404', notFoundBillRes.status === 404);

  // Generate bill for order 1
  const billGenRes1 = await request(
    { path: `/api/admin/orders/${id1}/bill`, method: 'POST', headers: { Authorization: `Bearer ${adminToken}` } }
  );
  check('Bill generated successfully with HTTP 200', billGenRes1.status === 200 && billGenRes1.body.success);
  const billOrder1 = billGenRes1.body.order;
  check(`Bill Number format matches MP-BILL-\${num}: ${billOrder1.billNumber}`, billOrder1.billNumber === `MP-BILL-${num1}`);
  check('Order status was NOT altered (remains Pending)', billOrder1.orderStatus === 'Pending');
  check('Secure billToken generated', typeof billOrder1.billToken === 'string' && billOrder1.billToken.length >= 32);
  check('billGeneratedAt timestamp present', typeof billOrder1.billGeneratedAt === 'string');

  // Idempotency: generating again returns the same bill number and token without recreating
  const billGenResIdem = await request(
    { path: `/api/admin/orders/${id1}/bill`, method: 'POST', headers: { Authorization: `Bearer ${adminToken}` } }
  );
  check('Second call returns alreadyGenerated: true', billGenResIdem.body.alreadyGenerated === true);
  check('Same bill number preserved on repeated calls', billGenResIdem.body.order.billNumber === billOrder1.billNumber);
  check('Same bill token preserved on repeated calls', billGenResIdem.body.order.billToken === billOrder1.billToken);

  // ====================================================
  // 4. PUBLIC BILL VIEW & SECURITY ENFORCEMENT
  // ====================================================
  console.log('\n--- 4. Testing Public Bill View & Token Security ---');

  // Token access succeeds without authentication
  const publicBillRes = await request({
    path: `/api/public/bills/${billOrder1.billToken}`,
    method: 'GET',
  });
  check('Public bill retrieved via token without admin auth (HTTP 200)', publicBillRes.status === 200 && publicBillRes.body.success);
  const billPayload = publicBillRes.body.bill;
  check('Public bill returns correct orderId', billPayload.orderId === id1);
  check('Public bill returns correct billNumber', billPayload.billNumber === billOrder1.billNumber);
  check('Customer details present', billPayload.customer.name === 'Sequential Tester One');
  check('Delivery details present', billPayload.customer.city === 'Kolkata' && billPayload.customer.pincode === '700073');
  check('Item details present with unit price and quantity', billPayload.item.product === 'Custom Photo Frames' && billPayload.item.quantity === 1);
  check('Authoritative finalAmount present', typeof billPayload.item.finalAmount === 'number' && billPayload.item.finalAmount > 0);

  // Centralized Studio Details verification
  check('Studio name is MomentPress', billPayload.studio.name === 'MomentPress');
  check('Studio WhatsApp is +91 7980855821', String(billPayload.studio.whatsappNumber).includes('7980855821'));
  check('Studio Call is +91 6291681660', String(billPayload.studio.phone).includes('6291681660'));
  check('Studio Email is connect.rrstudio@gmail.com', billPayload.studio.email === 'connect.rrstudio@gmail.com');
  check('Studio Instagram is @_rr.studio__', billPayload.studio.instagramHandle === '@_rr.studio__');

  // Security: No enumeration by Order ID directly
  const enumAttemptRes = await request({
    path: `/api/public/bills/${id1}`,
    method: 'GET',
  });
  check('Direct lookup by Order ID is blocked (returns 404)', enumAttemptRes.status === 404);

  // Security: Sanitization check - zero internal costs or profit leaked
  check('Public bill payload contains zero internal productCost', billPayload.productCost === undefined);
  check('Public bill payload contains zero profit or profitMargin', billPayload.profit === undefined && billPayload.profitMargin === undefined);
  check('Public bill payload contains zero admin session token', billPayload.adminToken === undefined && billPayload.session === undefined);

  // Invalid token returns 404
  const invalidTokenRes = await request({
    path: `/api/public/bills/invalid-token-1234567890123456`,
    method: 'GET',
  });
  check('Invalid token returns 404', invalidTokenRes.status === 404);

  // ====================================================
  // CLEANUP TEST ORDERS
  // ====================================================
  const testIds = [id1, id2, id3, idemOrderId, idAfterDelete];
  store = JSON.parse(fs.readFileSync(storePath, 'utf8'));
  store.onlineOrders = (store.onlineOrders || []).filter((o) => !testIds.includes(o.id));
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2));

  console.log('\n====================================================');
  console.log(`ALL ${passed} BILLING & ORDER ID CHECKS PASSED SUCCESSFULLY!`);
  console.log('====================================================');
}

runBillingAndOrderIdSuite().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
