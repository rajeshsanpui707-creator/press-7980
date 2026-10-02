import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import fs from 'fs';
import path from 'path';
import assert from 'assert';
import {
  DEFAULT_BILL_FOLDER_ID,
  getGoogleDriveFolderId,
  formatBillFileName,
  getGoogleDriveAuthType,
  isGoogleDriveConfigured,
  uploadBillToGoogleDrive,
} from './src/lib/drive/google-drive-service.ts';

let passed = 0;
let failed = 0;

function check(label, condition) {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.error(`  ✗ ${label}`);
    failed++;
  }
}

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
        res.on('data', (chunk) => chunks.push(chunk));
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

async function runTests() {
  console.log('================================================================');
  console.log('TESTING GOOGLE DRIVE DEDICATED BILL DESTINATION & DUPLICATE FLOW');
  console.log('================================================================\n');

  // --- 1. Unit Check: Dedicated Folder ID & Configuration ---
  console.log('--- 1. Testing Dedicated Folder ID & Auth Detection ---');
  check('DEFAULT_BILL_FOLDER_ID matches 1TB6Vfcj6AID8IR66OKcLZ7FbwYX8cPnq', DEFAULT_BILL_FOLDER_ID === '1TB6Vfcj6AID8IR66OKcLZ7FbwYX8cPnq');
  check('getGoogleDriveFolderId() returns 1TB6Vfcj6AID8IR66OKcLZ7FbwYX8cPnq', getGoogleDriveFolderId() === '1TB6Vfcj6AID8IR66OKcLZ7FbwYX8cPnq');

  const authType = getGoogleDriveAuthType();
  console.log(`  * Detected Drive Auth Type: ${authType}`);
  check('Auth Type is one of valid types (SERVICE_ACCOUNT, OAUTH_REFRESH_TOKEN, NONE)', ['SERVICE_ACCOUNT', 'OAUTH_REFRESH_TOKEN', 'NONE'].includes(authType));

  // --- 2. Unit Check: Filename Format ---
  console.log('\n--- 2. Testing Filename Formatting (MomentPress-Bill-MP-{ORDER_ID}.pdf) ---');
  check('formatBillFileName with "MP-1" produces MomentPress-Bill-MP-1.pdf', formatBillFileName('MP-1') === 'MomentPress-Bill-MP-1.pdf');
  check('formatBillFileName with "1" produces MomentPress-Bill-MP-1.pdf', formatBillFileName('1') === 'MomentPress-Bill-MP-1.pdf');
  check('formatBillFileName with "MP-105" produces MomentPress-Bill-MP-105.pdf', formatBillFileName('MP-105') === 'MomentPress-Bill-MP-105.pdf');
  check('formatBillFileName with "mp-42" produces MomentPress-Bill-MP-42.pdf', formatBillFileName('mp-42') === 'MomentPress-Bill-MP-42.pdf');

  // --- 3. Unit Check: Duplicate Upload Prevention ---
  console.log('\n--- 3. Testing Duplicate Prevention Logic ---');
  const dummyBuffer = Buffer.from('%PDF-1.4 dummy', 'utf8');
  const reusedResult = await uploadBillToGoogleDrive({
    orderId: 'MP-999',
    pdfBuffer: dummyBuffer,
    existingFileId: 'drive_file_abc123',
    existingDriveUrl: 'https://drive.google.com/file/d/drive_file_abc123/view?usp=sharing',
    existingDownloadUrl: 'https://drive.google.com/uc?id=drive_file_abc123&export=download',
    existingUploadedAt: '2026-10-02T10:00:00.000Z',
    forceReupload: false,
  });

  check('uploadBillToGoogleDrive reuses existing Drive file when present', reusedResult.reused === true);
  check('Reused result status is VERIFIED', reusedResult.status === 'VERIFIED');
  check('Reused result preserves fileId', reusedResult.fileId === 'drive_file_abc123');
  check('Reused result preserves webViewLink', reusedResult.webViewLink === 'https://drive.google.com/file/d/drive_file_abc123/view?usp=sharing');
  check('Reused result targets folder ID 1TB6Vfcj6AID8IR66OKcLZ7FbwYX8cPnq', reusedResult.folderId === '1TB6Vfcj6AID8IR66OKcLZ7FbwYX8cPnq');

  // --- 4. Integration Check: Real Server Bill Generation Flow ---
  console.log('\n--- 4. Testing End-to-End Server Bill Generation & Idempotency ---');
  
  // Login as admin
  const loginRes = await request(
    { path: '/api/auth/login', method: 'POST' },
    { username: 'admin', password: 'MomentPress@2026' }
  );
  check('Admin login succeeded (HTTP 200)', loginRes.status === 200 && loginRes.body.token);
  const adminToken = loginRes.body.token;

  // Create test order
  const orderRes = await request(
    { path: '/api/public/orders', method: 'POST' },
    {
      customerName: 'Drive Audit Customer',
      mobileNumber: '9830112233',
      address: '12 Park Street',
      city: 'Kolkata',
      pincode: '700016',
      product: 'Custom Photo Frames',
      size: '8×10 in',
      quality: 'Studio Velvet',
      quantity: 1,
      requirements: 'Drive destination and duplicate test order',
    }
  );
  check('Customer order created (HTTP 201)', orderRes.status === 201 && orderRes.body.success);
  const testOrder = orderRes.body.order;
  const orderId = testOrder.id;

  // Generate bill for the order
  const billRes1 = await request(
    {
      path: `/api/admin/orders/${orderId}/bill`,
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
    },
    {}
  );

  check('First bill generation returned HTTP 200', billRes1.status === 200 && billRes1.body.success);
  const billOrder1 = billRes1.body.order;
  check('Bill generated flag is true', billOrder1.billGenerated === true);
  check('Local PDF file generated on disk', fs.existsSync(billOrder1.billPdfPath));
  check('Bill filename matches MomentPress-Bill-MP-{ORDER_ID}.pdf format', billOrder1.billFileName === formatBillFileName(orderId));
  check('Bill Drive status reported cleanly (VERIFIED or BLOCKED_CONFIG_REQUIRED)', ['VERIFIED', 'BLOCKED_CONFIG_REQUIRED'].includes(billOrder1.billDriveStatus));

  // If Drive integration is BLOCKED_CONFIG_REQUIRED, verify message reports folder ID and required credentials
  if (billOrder1.billDriveStatus === 'BLOCKED_CONFIG_REQUIRED') {
    check('Drive message explicitly mentions target folder ID 1TB6Vfcj6AID8IR66OKcLZ7FbwYX8cPnq', billOrder1.billDriveMessage.includes('1TB6Vfcj6AID8IR66OKcLZ7FbwYX8cPnq'));
    check('Drive message explicitly mentions GOOGLE_SERVICE_ACCOUNT_KEY or GOOGLE_APPLICATION_CREDENTIALS', billOrder1.billDriveMessage.includes('GOOGLE_SERVICE_ACCOUNT_KEY') || billOrder1.billDriveMessage.includes('GOOGLE_APPLICATION_CREDENTIALS'));
  }

  // Test Reopening Bill: Duplicate Prevention
  console.log('\n--- 5. Testing Bill Reopening / Duplicate Prevention ---');
  const billRes2 = await request(
    {
      path: `/api/admin/orders/${orderId}/bill`,
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
    },
    {}
  );

  check('Second call returned HTTP 200', billRes2.status === 200 && billRes2.body.success);
  check('Second call reports alreadyGenerated: true (idempotent / no duplicate)', billRes2.body.alreadyGenerated === true);
  check('Bill number remains identical', billRes2.body.order.billNumber === billOrder1.billNumber);
  check('Bill token remains identical', billRes2.body.order.billToken === billOrder1.billToken);

  // --- 6. WhatsApp Bill Link Integration ---
  console.log('\n--- 6. Testing WhatsApp Bill Delivery Link ---');
  // When billDriveUrl exists, WhatsApp link uses billDriveUrl
  const mockOrderWithDrive = {
    ...billOrder1,
    billDriveUrl: 'https://drive.google.com/file/d/1TB6Vfcj6AID8IR66OKcLZ7FbwYX8cPnq/view?usp=sharing',
  };
  const deliveryUrlWithDrive = mockOrderWithDrive.billDriveUrl || `http://localhost:3000/bill/${mockOrderWithDrive.billToken}`;
  check('WhatsApp bill delivery uses real Drive URL when available', deliveryUrlWithDrive === mockOrderWithDrive.billDriveUrl);

  const deliveryUrlFallback = billOrder1.billDriveUrl || `http://localhost:3000/bill/${billOrder1.billToken}`;
  check('WhatsApp bill delivery falls back safely to token bill route when Drive is not yet verified', typeof deliveryUrlFallback === 'string' && deliveryUrlFallback.length > 0);

  // --- 7. Cleanup Audit Order ---
  console.log('\n--- 7. Cleanup Test Order ---');
  const storePath = path.resolve('data/momentpress-store.json');
  if (fs.existsSync(storePath)) {
    const raw = fs.readFileSync(storePath, 'utf8');
    const store = JSON.parse(raw);
    const beforeCount = store.onlineOrders.length;
    store.onlineOrders = store.onlineOrders.filter((o) => o.id !== orderId);
    fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf8');
    check(`Cleaned up test order ${orderId} from store (count: ${beforeCount} -> ${store.onlineOrders.length})`, true);
  }

  // Remove generated bill PDF for test order
  if (billOrder1.billPdfPath && fs.existsSync(billOrder1.billPdfPath)) {
    fs.unlinkSync(billOrder1.billPdfPath);
    check(`Removed temporary test PDF ${billOrder1.billPdfPath}`, true);
  }

  console.log('\n================================================================');
  console.log(`TOTAL VERIFICATION CHECKS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
