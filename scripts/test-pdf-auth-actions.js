import http from 'http';

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

async function testPdfAuth() {
  console.log('=============================================================');
  console.log('TESTING ADMIN BILL PDF PREVIEW & DOWNLOAD AUTHENTICATION FLOW');
  console.log('=============================================================\n');

  // Test 1: Unauthenticated request must be rejected with 401
  console.log('--- 1. Testing Unauthenticated Request (Security Integrity) ---');
  const unauthRes = await request({ path: '/api/admin/orders/MP-43/pdf', method: 'GET' });
  console.log('  Status code:', unauthRes.status);
  console.log('  Error payload:', unauthRes.body);
  if (unauthRes.status !== 401) {
    throw new Error('SECURITY VIOLATION: Unauthenticated request was NOT rejected with 401');
  }
  console.log('  ✓ Correctly rejected with 401 Unauthorized');

  // Test 2: Bogus token must be rejected with 401
  console.log('\n--- 2. Testing Invalid / Bogus Token ---');
  const bogusRes = await request({ path: '/api/admin/orders/MP-43/pdf?token=bogus_token_123', method: 'GET' });
  console.log('  Status code:', bogusRes.status);
  console.log('  Error payload:', bogusRes.body);
  if (bogusRes.status !== 401) {
    throw new Error('SECURITY VIOLATION: Invalid token was NOT rejected with 401');
  }
  console.log('  ✓ Correctly rejected with 401 Unauthorized');

  // Admin Login to get real token
  console.log('\n--- 3. Logging in as Admin ---');
  const loginRes = await request(
    { path: '/api/auth/login', method: 'POST' },
    { username: 'admin', password: 'MomentPress@2026' }
  );
  if (loginRes.status !== 200 || !loginRes.body.token) {
    throw new Error('Admin login failed: ' + JSON.stringify(loginRes.body));
  }
  const token = loginRes.body.token;
  console.log('  ✓ Admin logged in, acquired valid session token');

  // Test 3: Authenticated Preview with Bearer Header
  console.log('\n--- 4. Testing Authenticated Preview PDF with Bearer Header ---');
  const previewBearer = await request({
    path: '/api/admin/orders/MP-43/pdf',
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('  Status code:', previewBearer.status);
  console.log('  Content-Type:', previewBearer.headers['content-type']);
  console.log('  Content-Disposition:', previewBearer.headers['content-disposition']);
  console.log('  Starts with %PDF:', previewBearer.buffer.toString('utf8', 0, 8));
  if (previewBearer.status !== 200 || previewBearer.headers['content-type'] !== 'application/pdf') {
    throw new Error('Failed to retrieve PDF with Bearer header');
  }
  console.log('  ✓ Successfully streamed PDF with Bearer header');

  // Test 4: Authenticated Download with Bearer Header
  console.log('\n--- 5. Testing Authenticated Download PDF with Bearer Header ---');
  const downloadBearer = await request({
    path: '/api/admin/orders/MP-43/pdf?download=true',
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('  Status code:', downloadBearer.status);
  console.log('  Content-Type:', downloadBearer.headers['content-type']);
  console.log('  Content-Disposition:', downloadBearer.headers['content-disposition']);
  console.log('  Starts with %PDF:', downloadBearer.buffer.toString('utf8', 0, 8));
  if (downloadBearer.status !== 200 || !downloadBearer.headers['content-disposition'].includes('attachment')) {
    throw new Error('Failed to download PDF with attachment disposition');
  }
  console.log('  ✓ Successfully downloaded PDF with attachment disposition');

  // Test 5: Authenticated Preview via Query Token (Used by browser new tab window.open)
  console.log('\n--- 6. Testing Authenticated Preview PDF via Query Token (Browser Tab) ---');
  const previewQuery = await request({
    path: `/api/admin/orders/MP-43/pdf?token=${encodeURIComponent(token)}`,
    method: 'GET',
  });
  console.log('  Status code:', previewQuery.status);
  console.log('  Content-Type:', previewQuery.headers['content-type']);
  console.log('  Content-Disposition:', previewQuery.headers['content-disposition']);
  console.log('  Starts with %PDF:', previewQuery.buffer.toString('utf8', 0, 8));
  if (previewQuery.status !== 200 || previewQuery.headers['content-type'] !== 'application/pdf') {
    throw new Error('Failed to preview PDF via query token');
  }
  console.log('  ✓ Successfully previewed PDF in browser tab via query token');

  // Test 6: Authenticated Download via Query Token (Browser fallback)
  console.log('\n--- 7. Testing Authenticated Download PDF via Query Token ---');
  const downloadQuery = await request({
    path: `/api/admin/orders/MP-43/pdf?download=true&token=${encodeURIComponent(token)}`,
    method: 'GET',
  });
  console.log('  Status code:', downloadQuery.status);
  console.log('  Content-Type:', downloadQuery.headers['content-type']);
  console.log('  Content-Disposition:', downloadQuery.headers['content-disposition']);
  console.log('  Starts with %PDF:', downloadQuery.buffer.toString('utf8', 0, 8));
  if (downloadQuery.status !== 200 || !downloadQuery.headers['content-disposition'].includes('attachment')) {
    throw new Error('Failed to download PDF via query token');
  }
  console.log('  ✓ Successfully downloaded PDF via query token');

  console.log('\n=============================================================');
  console.log('🎉 ALL ADMIN BILL PDF AUTHENTICATION TESTS PASSED!');
  console.log('=============================================================\n');
}

testPdfAuth().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
