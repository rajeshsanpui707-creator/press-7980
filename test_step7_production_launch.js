/**
 * MOMENTPRESS STEP 7 AUDIT TEST SUITE: FINAL PRODUCTION LAUNCH & DEPLOYMENT AUDIT
 */

import fs from 'fs';
import path from 'path';

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

function assert(condition, message) {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`[PASS] ${message}`);
  } else {
    failedChecks++;
    console.error(`[FAIL] ${message}`);
  }
}

async function request(endpoint, options = {}) {
  const url = `http://127.0.0.1:3000${endpoint}`;
  const res = await fetch(url, options);
  let body;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    body = await res.json();
  } else {
    body = await res.text();
  }
  return { status: res.status, headers: res.headers, body };
}

async function runStep7LaunchAudit() {
  console.log('====================================================');
  console.log('MOMENTPRESS STEP 7: FINAL PRODUCTION LAUNCH AUDIT');
  console.log('====================================================\n');

  // --- 1. Production Package & Environment Config ---
  console.log('--- SECTION 1: Package & Environment Configuration ---');
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  assert(pkg.scripts.start === 'tsx server.ts', `Start script is "tsx server.ts" (got "${pkg.scripts.start}")`);
  assert(pkg.scripts.build === 'vite build', `Build script is "vite build" (got "${pkg.scripts.build}")`);
  assert(Boolean(pkg.dependencies.tsx), 'tsx is in dependencies for production server execution');
  assert(Boolean(pkg.dependencies.express), 'express is in dependencies');

  const envExample = fs.readFileSync('.env.example', 'utf8');
  assert(envExample.includes('NODE_ENV='), '.env.example documents NODE_ENV');
  assert(envExample.includes('PORT='), '.env.example documents PORT');
  assert(envExample.includes('ADMIN_USERNAME='), '.env.example documents ADMIN_USERNAME');
  assert(!envExample.includes('MomentPress@2026'), '.env.example does not leak default password');

  const gitignore = fs.readFileSync('.gitignore', 'utf8');
  assert(gitignore.includes('.env*'), '.gitignore protects .env files');
  assert(gitignore.includes('data/*.backup'), '.gitignore protects backup data files');
  assert(gitignore.includes('data/*.tmp*'), '.gitignore protects temporary persistence files');

  // --- 2. Production Build Bundle Inspection ---
  console.log('\n--- SECTION 2: Production Build Bundle Inspection ---');
  const distHtml = fs.readFileSync('dist/index.html', 'utf8');
  assert(distHtml.includes('https://momentpress.ai.studio/'), 'dist/index.html contains canonical https://momentpress.ai.studio/');
  assert(!distHtml.includes('localhost'), 'dist/index.html does not contain localhost');
  assert(!distHtml.includes('127.0.0.1'), 'dist/index.html does not contain 127.0.0.1');

  const distAssetsDir = path.resolve('dist/assets');
  const assetFiles = fs.readdirSync(distAssetsDir);
  for (const assetFile of assetFiles) {
    if (assetFile.endsWith('.js') || assetFile.endsWith('.css')) {
      const content = fs.readFileSync(path.join(distAssetsDir, assetFile), 'utf8');
      assert(!content.includes('MomentPress@2026'), `${assetFile} does not leak default password`);
      assert(!content.includes('passwordHash'), `${assetFile} does not leak passwordHash`);
      assert(!content.includes('passwordSalt'), `${assetFile} does not leak passwordSalt`);
    }
  }

  // --- 3. Production Security Headers & Unmatched API 404 ---
  console.log('\n--- SECTION 3: Security Headers & Unmatched API 404 ---');
  const rootRes = await request('/');
  assert(rootRes.headers.get('x-content-type-options') === 'nosniff', 'Header X-Content-Type-Options: nosniff present');
  assert(rootRes.headers.get('referrer-policy') === 'strict-origin-when-cross-origin', 'Header Referrer-Policy present');
  assert(Boolean(rootRes.headers.get('permissions-policy')), 'Header Permissions-Policy present');
  assert(Boolean(rootRes.headers.get('content-security-policy')), 'Header Content-Security-Policy present');

  const adminHeadRes = await request('/admin/2008');
  assert(adminHeadRes.headers.get('x-robots-tag')?.includes('noindex'), 'Admin routes enforce X-Robots-Tag: noindex');

  const invalidApiRes = await request('/api/non-existent-endpoint');
  assert(invalidApiRes.status === 404, 'Unmatched API endpoint returns HTTP 404 (got ' + invalidApiRes.status + ')');
  assert(typeof invalidApiRes.body === 'object' && Boolean(invalidApiRes.body.error), 'Unmatched API endpoint returns JSON error object');

  // --- 4. Google Drive Protocol & URL Security ---
  console.log('\n--- SECTION 4: Google Drive Protocol & URL Security ---');
  const { parseGoogleDriveUrl } = await import('./src/lib/drive/google-drive.js').catch(async () => {
    return await import('./src/lib/drive/google-drive.ts');
  });

  const xssUrl = parseGoogleDriveUrl('javascript:alert(document.cookie)');
  assert(!xssUrl.isValid && !xssUrl.renderableUrl, 'Dangerous javascript: scheme rejected by parseGoogleDriveUrl');

  const dataUrl = parseGoogleDriveUrl('data:text/html,<script>alert(1)</script>');
  assert(!dataUrl.isValid && !dataUrl.renderableUrl, 'Dangerous data: scheme rejected by parseGoogleDriveUrl');

  const fileUrl = parseGoogleDriveUrl('file:///etc/passwd');
  assert(!fileUrl.isValid && !fileUrl.renderableUrl, 'Dangerous file: scheme rejected by parseGoogleDriveUrl');

  const validDrive = parseGoogleDriveUrl('https://drive.google.com/file/d/1A2B3C4D5E/view?usp=sharing');
  assert(validDrive.isValid && validDrive.renderableUrl.includes('lh3.googleusercontent.com/d/1A2B3C4D5E'), 'Valid Google Drive URL parsed to secure lh3.googleusercontent.com viewer endpoint');

  // --- 5. Controlled Final Launch Order Flow & Instant Cleanup ---
  console.log('\n--- SECTION 5: Controlled Final Launch Order Flow & Cleanup ---');
  // Authenticate Admin
  const loginRes = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: process.env.ADMIN_PASSWORD || 'MomentPress@2026' }),
  });
  assert(loginRes.status === 200 && Boolean(loginRes.body.token), 'Admin authentication successful for launch verification');
  const adminToken = loginRes.body.token;

  // Submit test order
  const orderRes = await request('/api/public/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: 'Launch Audit Customer',
      mobileNumber: '9830888999',
      address: 'Bowbazar Launch Studio',
      city: 'Kolkata',
      pincode: '700012',
      product: 'Custom Photo Frames',
      size: '6×8 in',
      quality: 'Studio Velvet',
      quantity: 1,
      requirements: 'Pre-flight launch check verification',
    }),
  });

  assert(orderRes.status === 201, 'Customer order successfully created with HTTP 201');
  const testOrderId = orderRes.body.order.id;
  assert(testOrderId.startsWith('MP-'), `Server generated authoritative Order ID: ${testOrderId}`);
  assert(orderRes.body.order.finalAmount === 299, `Server calculated unit amount: ₹299 (249 + 50 Velvet)`);

  // Verify in Admin Orders
  const adminOrdersRes = await request('/api/admin/orders', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const foundInAdmin = (adminOrdersRes.body.orders || []).find((o) => o.id === testOrderId);
  assert(Boolean(foundInAdmin), `Order ${testOrderId} immediately visible in Admin Orders`);

  // Update Status in Admin
  const statusRes = await request('/api/admin/orders/status', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ orderId: testOrderId, newStatus: 'Delivered' }),
  });
  assert(statusRes.status === 200 && statusRes.body.order.orderStatus === 'Delivered', 'Admin updated order status to "Delivered"');

  // Verify Physical Disk Persistence
  const storeOnDisk = JSON.parse(fs.readFileSync('data/momentpress-store.json', 'utf8'));
  const foundOnDisk = storeOnDisk.onlineOrders.find((o) => o.id === testOrderId);
  assert(foundOnDisk && foundOnDisk.orderStatus === 'Delivered', `Order ${testOrderId} verified on disk with status Delivered`);

  // Clean Up Test Order Completely
  storeOnDisk.onlineOrders = storeOnDisk.onlineOrders.filter((o) => o.id !== testOrderId);
  storeOnDisk.customers = storeOnDisk.customers.filter((c) => c.phone !== '9830888999');
  fs.writeFileSync('data/momentpress-store.json', JSON.stringify(storeOnDisk, null, 2), 'utf8');
  fs.copyFileSync('data/momentpress-store.json', 'data/momentpress-store.json.backup');

  const afterCleanupStore = JSON.parse(fs.readFileSync('data/momentpress-store.json', 'utf8'));
  const orderStillExists = afterCleanupStore.onlineOrders.some((o) => o.id === testOrderId);
  assert(!orderStillExists, 'Test launch order completely purged from persistent store');

  console.log('\n====================================================');
  console.log(`TOTAL LAUNCH AUDIT CHECKS: ${totalChecks} | PASSED: ${passedChecks} | FAILED: ${failedChecks}`);
  console.log('====================================================');

  if (failedChecks > 0) {
    process.exit(1);
  }
}

runStep7LaunchAudit().catch((err) => {
  console.error('Fatal error during Step 7 Launch audit:', err);
  process.exit(1);
});
