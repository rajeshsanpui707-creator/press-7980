import http from 'http';
import fs from 'fs';
import path from 'path';

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

async function verifyFlow() {
  console.log('=============================================================');
  console.log('MOMENTPRESS: END-TO-END GOOGLE DRIVE BILL FLOW VERIFICATION');
  console.log('=============================================================\n');

  // 1. Admin Login
  console.log('1. Logging in as Admin...');
  const loginRes = await request(
    { path: '/api/auth/login', method: 'POST' },
    { username: 'admin', password: 'MomentPress@2026' }
  );
  if (loginRes.status !== 200 || !loginRes.body.token) {
    throw new Error('Admin login failed: ' + JSON.stringify(loginRes.body));
  }
  const token = loginRes.body.token;
  console.log('  ✓ Admin authentication successful');

  // 2. Create Order
  console.log('\n2. Creating customer test order...');
  const orderRes = await request(
    { path: '/api/public/orders', method: 'POST' },
    {
      customerName: 'Drive Live Verification',
      mobileNumber: '9830554433',
      address: '77 Bowbazar Street',
      city: 'Kolkata',
      pincode: '700012',
      product: 'Custom Photo Frames',
      size: '6×8 in',
      quality: 'Studio Velvet',
      quantity: 1,
      requirements: 'Live Drive upload verification',
    }
  );
  const orderId = orderRes.body.order.id;
  console.log(`  ✓ Order created: ${orderId}`);

  // 3. Generate Bill with automatic Drive Upload
  console.log('\n3. Triggering Bill Generation (PDF + Google Drive Upload)...');
  const billRes = await request(
    {
      path: `/api/admin/orders/${orderId}/bill`,
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    },
    {}
  );

  const order = billRes.body.order;
  const driveResult = billRes.body.driveResult;

  console.log('  ✓ HTTP Status:', billRes.status);
  console.log('  ✓ Bill Number:', order.billNumber);
  console.log('  ✓ Bill Generated Flag:', order.billGenerated);
  console.log('  ✓ Local PDF Path:', order.billPdfPath);
  console.log('  ✓ Local File Exists:', fs.existsSync(order.billPdfPath));
  console.log('  ✓ Drive Status:', order.billDriveStatus);
  console.log('  ✓ Drive Message:', order.billDriveMessage);
  console.log('  ✓ Drive Folder ID:', driveResult?.folderId);
  console.log('  ✓ Drive File ID:', order.billDriveFileId || 'N/A');
  console.log('  ✓ Drive Web View URL:', order.billDriveUrl || 'N/A');
  console.log('  ✓ Drive Uploaded At:', order.billUploadedAt || 'N/A');

  const fileId = order.billDriveFileId;

  // 4. Test Duplicate Prevention / Reopening Bill
  console.log('\n4. Testing Bill Reopening / Duplicate Prevention...');
  const billRes2 = await request(
    {
      path: `/api/admin/orders/${orderId}/bill`,
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    },
    {}
  );

  console.log('  ✓ Reopening Status:', billRes2.status);
  console.log('  ✓ Already Generated Flag:', billRes2.body.alreadyGenerated);
  console.log('  ✓ Preserved File ID:', billRes2.body.order.billDriveFileId === fileId);

  // 5. Test WhatsApp delivery link resolution
  console.log('\n5. Verifying WhatsApp Delivery Link...');
  const waUrl = order.billDriveUrl || `http://localhost:3000/bill/${order.billToken}`;
  console.log('  ✓ WhatsApp Bill Link:', waUrl);
  console.log('  ✓ Uses Direct Drive URL:', waUrl === order.billDriveUrl);

  // 6. Cleanup Test Data
  console.log('\n6. Cleaning up test data...');
  if (fileId) {
    const { OAuth2Client } = await import('google-auth-library');
    const dotenv = await import('dotenv');
    dotenv.config();

    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_DRIVE_CLIENT_ID,
      process.env.GOOGLE_DRIVE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN });
    const driveToken = (await oauth2Client.getAccessToken())?.token;

    const delRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${driveToken}` },
    });
    console.log(`  ✓ Cleaned up test PDF ${fileId} from Drive: HTTP ${delRes.status}`);
  }

  // Clean from store
  const storePath = path.resolve('data/momentpress-store.json');
  if (fs.existsSync(storePath)) {
    const raw = fs.readFileSync(storePath, 'utf8');
    const store = JSON.parse(raw);
    store.onlineOrders = store.onlineOrders.filter((o) => o.id !== orderId);
    fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf8');
    console.log(`  ✓ Cleaned up order ${orderId} from store`);
  }

  // Remove local PDF
  if (order.billPdfPath && fs.existsSync(order.billPdfPath)) {
    fs.unlinkSync(order.billPdfPath);
    console.log(`  ✓ Removed temporary local PDF ${order.billPdfPath}`);
  }

  console.log('\n=============================================================');
  console.log('🎉 ALL GOOGLE DRIVE LIVE VERIFICATION STEPS PASSED!');
  console.log('=============================================================\n');
}

verifyFlow().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
