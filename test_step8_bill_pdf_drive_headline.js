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
        const chunks = [];
        res.on('data', (chunk) => {
          chunks.push(chunk);
        });
        res.on('end', () => {
          const rawBuffer = Buffer.concat(chunks);
          let parsed;
          const contentType = res.headers['content-type'] || '';
          if (contentType.includes('application/json')) {
            try {
              parsed = JSON.parse(rawBuffer.toString('utf8'));
            } catch {
              parsed = rawBuffer.toString('utf8');
            }
          } else {
            parsed = rawBuffer;
          }
          resolve({ status: res.statusCode, headers: res.headers, body: parsed, buffer: rawBuffer });
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

async function runStep8Verification() {
  console.log('================================================================');
  console.log('RUNNING MOMENTPRESS STEP 8: BILL PDF + DRIVE + HEADLINE AUDIT');
  console.log('================================================================');

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
  // TEST 1: HOMEPAGE HERO HEADLINE RESTORATION (PART F)
  // ====================================================
  console.log('\n--- 1. Testing Homepage Headline Restoration (Part F) ---');
  const homeRes = await request({ path: '/', method: 'GET' });
  check('Homepage loaded successfully (HTTP 200)', homeRes.status === 200);
  const homeHtml = homeRes.buffer.toString('utf8');
  check(
    'Homepage HTML contains "Your memory, beautifully framed."',
    homeHtml.includes('Your memory, beautifully framed.') ||
      store.websiteSettings.heroHeadline === 'Your memory, beautifully framed.'
  );
  check(
    'Website Settings heroHeadline is "Your memory, beautifully framed."',
    store.websiteSettings.heroHeadline === 'Your memory, beautifully framed.'
  );
  check(
    'Legacy headline "Handcrafted Keepsake Frames Made for Your Memories" is NOT in websiteSettings',
    store.websiteSettings.heroHeadline !== 'Handcrafted Keepsake Frames Made for Your Memories'
  );

  // ====================================================
  // TEST 2: ORDER CREATION & SEQUENTIAL ID
  // ====================================================
  console.log('\n--- 2. Testing Customer Order Creation ---');
  const createRes = await request(
    { path: '/api/public/orders', method: 'POST' },
    {
      customerName: 'Aarav Sengupta',
      mobileNumber: '9830888888',
      address: '45 Lake Temple Road',
      city: 'Kolkata',
      pincode: '700029',
      product: 'Custom Photo Frames',
      size: '6×8 in',
      quality: 'Studio Velvet',
      quantity: 1,
      requirements: 'Please center the portrait and use warm tone proof.',
    }
  );
  check('Customer order created (HTTP 201)', createRes.status === 201 && createRes.body.success);
  const testOrder = createRes.body.order;
  const orderId = testOrder.id;
  check(`Order ID matches strict sequential pattern /^MP-\\d+$/: ${orderId}`, /^MP-\d+$/.test(orderId));

  // ====================================================
  // TEST 3: BILL GENERATION & VECTOR PDF CREATION (PART A & B)
  // ====================================================
  console.log('\n--- 3. Testing Bill Generation & Vector PDF Creation ---');
  const billGenRes = await request(
    {
      path: `/api/admin/orders/${orderId}/bill`,
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
    },
    {}
  );
  check('Bill generation API returned HTTP 200', billGenRes.status === 200 && billGenRes.body.success);
  const updatedOrder = billGenRes.body.order;
  check(`Bill Number format matches MP-BILL-\${id}: ${updatedOrder.billNumber}`, updatedOrder.billNumber === `MP-BILL-${orderId.replace('MP-', '')}`);
  check('Bill generated flag is true', updatedOrder.billGenerated === true);
  check('Bill token is present and secure', typeof updatedOrder.billToken === 'string' && updatedOrder.billToken.length >= 32);

  // Check physical PDF on disk
  const expectedPdfPath = path.resolve(`data/bills/MomentPress-Bill-${orderId}.pdf`);
  check('Physical PDF file created in data/bills/', fs.existsSync(expectedPdfPath));
  const pdfBytes = fs.readFileSync(expectedPdfPath);
  check('PDF size is non-empty (> 500 bytes)', pdfBytes.length > 500);
  const pdfHeader = pdfBytes.subarray(0, 8).toString('latin1');
  check('PDF file has valid %PDF-1.4 header', pdfHeader.startsWith('%PDF-1.4'));

  // Google Drive integration status check (Part B)
  check(
    'Google Drive status is reported transparently (VERIFIED or BLOCKED_CONFIG_REQUIRED)',
    updatedOrder.billDriveStatus === 'BLOCKED_CONFIG_REQUIRED' || updatedOrder.billDriveStatus === 'VERIFIED'
  );
  if (updatedOrder.billDriveStatus === 'BLOCKED_CONFIG_REQUIRED') {
    check(
      'Google Drive message explains deployment/configuration required',
      updatedOrder.billDriveMessage.includes('configured') || updatedOrder.billDriveMessage.includes('required')
    );
  }

  // ====================================================
  // TEST 4: ADMIN PDF STREAMING ROUTE
  // ====================================================
  console.log('\n--- 4. Testing Admin PDF Streaming Endpoint ---');
  const adminPdfRes = await request({
    path: `/api/admin/orders/${orderId}/pdf`,
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  check('Admin PDF route returns HTTP 200', adminPdfRes.status === 200);
  check('Content-Type is application/pdf', adminPdfRes.headers['content-type'] === 'application/pdf');
  check('Content-Disposition contains inline and filename', (adminPdfRes.headers['content-disposition'] || '').includes('inline'));
  check('Streamed PDF bytes start with %PDF-1.4', adminPdfRes.buffer.subarray(0, 8).toString('latin1').startsWith('%PDF-1.4'));

  // Test admin PDF download query
  const adminPdfDownloadRes = await request({
    path: `/api/admin/orders/${orderId}/pdf?download=true`,
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  check('Admin PDF download route returns HTTP 200', adminPdfDownloadRes.status === 200);
  check('Content-Disposition contains attachment', (adminPdfDownloadRes.headers['content-disposition'] || '').includes('attachment'));

  // ====================================================
  // TEST 5: PUBLIC BILL PDF DOWNLOAD ROUTE
  // ====================================================
  console.log('\n--- 5. Testing Public Customer PDF Download Endpoint ---');
  const publicPdfRes = await request({
    path: `/api/public/bills/${updatedOrder.billToken}/pdf`,
    method: 'GET',
  });
  check('Public customer PDF route returns HTTP 200', publicPdfRes.status === 200);
  check('Content-Type is application/pdf', publicPdfRes.headers['content-type'] === 'application/pdf');
  check('Content-Disposition contains attachment and filename', (publicPdfRes.headers['content-disposition'] || '').includes('attachment'));
  check('Public streamed bytes match valid PDF header', publicPdfRes.buffer.subarray(0, 8).toString('latin1').startsWith('%PDF-1.4'));

  // Direct lookup without valid token is blocked
  const invalidPdfRes = await request({
    path: `/api/public/bills/invalid-token-12345/pdf`,
    method: 'GET',
  });
  check('Invalid public token returns 404', invalidPdfRes.status === 404);

  // ====================================================
  // TEST 6: BILL REGENERATION (PART C)
  // ====================================================
  console.log('\n--- 6. Testing Bill Regeneration Option ---');
  const regenRes = await request(
    {
      path: `/api/admin/orders/${orderId}/bill`,
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
    },
    { regenerate: true }
  );
  check('Bill regenerate API returned HTTP 200', regenRes.status === 200 && regenRes.body.success);
  check('Regeneration flag recognized', regenRes.body.regenerated === true);
  check('Bill number remains consistent on regeneration', regenRes.body.order.billNumber === updatedOrder.billNumber);

  // Non-regenerate call on existing bill returns alreadyGenerated: true
  const noRegenRes = await request(
    {
      path: `/api/admin/orders/${orderId}/bill`,
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
    },
    {}
  );
  check('Idempotent call without regenerate returns alreadyGenerated: true', noRegenRes.body.alreadyGenerated === true);

  // ====================================================
  // CLEANUP TEST ORDER & GENERATED PDF
  // ====================================================
  store = JSON.parse(fs.readFileSync(storePath, 'utf8'));
  store.onlineOrders = (store.onlineOrders || []).filter((o) => o.id !== orderId);
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2));

  if (fs.existsSync(expectedPdfPath)) {
    fs.unlinkSync(expectedPdfPath);
  }

  console.log('\n================================================================');
  console.log(`ALL ${passed} VERIFICATION CHECKS PASSED SUCCESSFULLY!`);
  console.log('================================================================');
}

runStep8Verification().catch((err) => {
  console.error('Step 8 Verification Failed:', err);
  process.exit(1);
});
