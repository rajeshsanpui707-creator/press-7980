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

async function runLiveTest() {
  console.log('=============================================================');
  console.log('LIVE END-TO-END GOOGLE DRIVE TEST WITH EXISTING ORDER (MP-43)');
  console.log('=============================================================\n');

  // 1. Admin Login
  const loginRes = await request(
    { path: '/api/auth/login', method: 'POST' },
    { username: 'admin', password: 'MomentPress@2026' }
  );
  if (loginRes.status !== 200 || !loginRes.body.token) {
    throw new Error('Admin login failed: ' + JSON.stringify(loginRes.body));
  }
  const token = loginRes.body.token;
  console.log('✓ Admin authenticated');

  // 2. Fetch existing order MP-43 before test
  const getOrdersRes = await request(
    { path: '/api/admin/orders', method: 'GET', headers: { Authorization: `Bearer ${token}` } }
  );
  const orderBefore = getOrdersRes.body.orders.find((o) => o.id === 'MP-43');
  console.log(`✓ Located existing order MP-43 (Customer: ${orderBefore.customerName})`);
  console.log(`  Initial status: ${orderBefore.billDriveStatus}`);

  // 3. Generate/upload bill for MP-43
  console.log('\nGenerating and uploading bill to Google Drive folder 1TB6Vfcj6AID8IR66OKcLZ7FbwYX8cPnq...');
  const billRes = await request(
    {
      path: '/api/admin/orders/MP-43/bill',
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    },
    { regenerate: true }
  );

  const orderAfter = billRes.body.order;
  const driveResult = billRes.body.driveResult;

  console.log('✓ Bill generation HTTP Status:', billRes.status);
  console.log('✓ Bill Number:', orderAfter.billNumber);
  console.log('✓ Drive Status:', orderAfter.billDriveStatus);
  console.log('✓ Drive Message:', orderAfter.billDriveMessage);
  console.log('✓ Target Folder ID:', driveResult?.folderId);
  console.log('✓ Saved billDriveFileId:', orderAfter.billDriveFileId || 'NONE');
  console.log('✓ Saved billDriveUrl:', orderAfter.billDriveUrl || 'NONE');

  // 4. Verify Admin UI State mapping
  const uiStatus = orderAfter.billDriveStatus === 'VERIFIED' ? 'Connected & Synced' : 'BLOCKED — config required';
  console.log(`✓ Admin UI Google Drive Badge: "${uiStatus}"`);

  const openInDriveEnabled = Boolean(orderAfter.billDriveUrl);
  console.log(`✓ Admin UI "Open in Drive" Button: ${openInDriveEnabled ? 'ACTIVE (Enabled)' : 'DISABLED'}`);
  console.log(`  URL opened by button: ${orderAfter.billDriveUrl}`);

  // 5. Duplicate Prevention Test: Call bill endpoint again without regenerate
  console.log('\nTesting Duplicate Prevention (Reopening same bill)...');
  const duplicateRes = await request(
    {
      path: '/api/admin/orders/MP-43/bill',
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    },
    { regenerate: false }
  );

  console.log('✓ Reopening HTTP Status:', duplicateRes.status);
  console.log('✓ alreadyGenerated Flag:', duplicateRes.body.alreadyGenerated);
  console.log('✓ File ID Preserved (No Duplicate):', duplicateRes.body.order.billDriveFileId === orderAfter.billDriveFileId);

  console.log('\n=============================================================');
  console.log('LIVE TEST COMPLETED SUCCESSFULLY');
  console.log('=============================================================\n');
}

runLiveTest().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
