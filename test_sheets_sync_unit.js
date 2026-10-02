import assert from 'assert';
import fs from 'fs';
import path from 'path';
import {
  mapOrderToSheetRow,
  mapUpdatesToSheetFields,
  deriveOrderDimensions,
  appendOrderToSheet,
  updateOrderInSheet,
} from './src/lib/sheets/google-sheets-sync.ts';

async function runUnitTests() {
  console.log('====================================================');
  console.log('TESTING GOOGLE SHEETS SYNC MODULE (ISOLATED UNIT TESTS)');
  console.log('====================================================');

  let passed = 0;
  function check(desc, condition) {
    assert(condition, desc);
    console.log(`  ✓ ${desc}`);
    passed++;
  }

  // 1. Schema mapping test: exactly 18 columns in exact order
  console.log('\n--- 1. Testing 18-Column Schema Mapping ---');
  const mockOrder = {
    id: 'MP-999',
    createdDate: '2026-10-02',
    customerName: 'Test Customer',
    mobileNumber: '9830000000',
    address: '10 Test Lane',
    city: 'Kolkata',
    pincode: '700001',
    product: 'Custom Photo Frames',
    size: '6×8 in',
    quality: 'Studio Velvet',
    quantity: 2,
    unitPrice: 249,
    discount: 50,
    finalAmount: 448,
    orderStatus: 'Pending',
    requirements: 'Handle with care',
    billNumber: 'MP-BILL-999',
    billDriveUrl: 'https://drive.google.com/test',
    billGeneratedAt: '2026-10-02T12:00:00Z',
  };

  const sheetRow = mapOrderToSheetRow(mockOrder);
  const expectedColumns = [
    'Order ID',
    'Order Date',
    'Customer Name',
    'WhatsApp',
    'Delivery Address',
    'Product',
    'Size',
    'Dimensions',
    'Quality',
    'Quantity',
    'Requirements',
    'Subtotal',
    'Discount',
    'Final Total',
    'Order Status',
    'Bill Number',
    'Bill Drive Link',
    'Bill Generated At',
  ];

  const actualColumns = Object.keys(sheetRow);
  check('Mapped row has exactly 18 columns', actualColumns.length === 18);
  check('Columns match exact names and sequence', JSON.stringify(actualColumns) === JSON.stringify(expectedColumns));
  check('Order ID matches', sheetRow['Order ID'] === 'MP-999');
  check('Customer Name matches', sheetRow['Customer Name'] === 'Test Customer');
  check('WhatsApp matches', sheetRow['WhatsApp'] === '9830000000');
  check('Delivery Address formatted properly', sheetRow['Delivery Address'] === '10 Test Lane, Kolkata - 700001');
  check('Dimensions dynamically derived for 6×8 in', sheetRow['Dimensions'] === '15 x 20 cm (6x8 in)');
  check('Subtotal computed properly (249 * 2 = 498)', sheetRow['Subtotal'] === 498);
  check('Final Total matches (448)', sheetRow['Final Total'] === 448);

  // 2. Update mapping test: Order ID must NEVER be included
  console.log('\n--- 2. Testing Update Field Mapping ---');
  const updatesWithId = {
    'Order ID': 'ILLEGAL-OVERRIDE',
    id: 'ILLEGAL-OVERRIDE',
    orderId: 'ILLEGAL-OVERRIDE',
    orderStatus: 'Processing',
    billNumber: 'MP-BILL-999',
    billDriveUrl: 'https://drive.google.com/updated',
    internalNote: 'Private studio note that should be stripped',
    paymentStatus: 'Paid',
  };

  const mappedUpdates = mapUpdatesToSheetFields(updatesWithId);
  check('"Order ID" is NEVER in updates', !('Order ID' in mappedUpdates));
  check('"id" is NEVER in updates', !('id' in mappedUpdates));
  check('"orderId" is NEVER in updates', !('orderId' in mappedUpdates));
  check('orderStatus mapped to "Order Status"', mappedUpdates['Order Status'] === 'Processing');
  check('billNumber mapped to "Bill Number"', mappedUpdates['Bill Number'] === 'MP-BILL-999');
  check('billDriveUrl mapped to "Bill Drive Link"', mappedUpdates['Bill Drive Link'] === 'https://drive.google.com/updated');
  check('Internal unmapped fields stripped', !('internalNote' in mappedUpdates) && !('paymentStatus' in mappedUpdates));

  // 3. Test A: Missing environment variables fail safely without throwing
  console.log('\n--- 3. Testing Missing Environment Variables (Fail-Safe) ---');
  const originalUrl = process.env.GOOGLE_SHEETS_WEBAPP_URL;
  const originalSecret = process.env.GOOGLE_SHEETS_SYNC_SECRET;

  delete process.env.GOOGLE_SHEETS_WEBAPP_URL;
  delete process.env.GOOGLE_SHEETS_SYNC_SECRET;

  const missingEnvRes = await appendOrderToSheet(mockOrder);
  check('Missing env vars returns success: false safely', missingEnvRes.success === false);
  check('Does not throw error', typeof missingEnvRes.error === 'string');

  const missingEnvUpdate = await updateOrderInSheet('MP-999', { orderStatus: 'Delivered' });
  check('Missing env vars for update returns success: false safely', missingEnvUpdate.success === false);

  // Restore env vars for mock testing
  process.env.GOOGLE_SHEETS_WEBAPP_URL = 'https://script.google.com/macros/s/TEST/exec';
  process.env.GOOGLE_SHEETS_SYNC_SECRET = 'test-secret-12345';

  // 4. Mock fetch tests for B, C, D, E, F, G, H
  console.log('\n--- 4. Testing Mocked Responses & Network Failure Handling ---');
  const originalFetch = globalThis.fetch;

  // Test B: Successful Apps Script response
  globalThis.fetch = async (url, options) => {
    assert(options.redirect === 'follow', 'Fetch must use redirect: follow');
    const parsedBody = JSON.parse(options.body);
    assert(parsedBody.secret === 'test-secret-12345', 'Secret is sent in POST body');
    return {
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        created: true,
        duplicate: false,
        orderId: 'MP-999',
        rowNumber: 25,
      }),
    };
  };

  const successRes = await appendOrderToSheet(mockOrder);
  check('Successful Apps Script create response is accepted', successRes.success === true && successRes.created === true);

  // Test G: Duplicate create response is treated as success
  globalThis.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      success: true,
      duplicate: true,
      created: false,
      orderId: 'MP-999',
    }),
  });

  const duplicateRes = await appendOrderToSheet(mockOrder);
  check('Duplicate create response is treated as success: true', duplicateRes.success === true && duplicateRes.duplicate === true);

  // Test C: Apps Script { success: false } is handled cleanly
  globalThis.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      success: false,
      error: 'Invalid secret authentication',
    }),
  });

  const failRes = await appendOrderToSheet(mockOrder);
  check('Apps Script { success: false } returns success: false', failRes.success === false);
  check('Error message is captured', failRes.error === 'Invalid secret authentication');

  // Test E: HTTP errors are handled
  globalThis.fetch = async () => ({
    ok: false,
    status: 502,
    json: async () => ({ error: 'Bad Gateway' }),
  });

  const httpErrRes = await appendOrderToSheet(mockOrder);
  check('HTTP 502 handled safely without throwing', httpErrRes.success === false && httpErrRes.error.includes('502'));

  // Test D: Timeout / AbortError is handled cleanly
  globalThis.fetch = async () => {
    const err = new Error('The operation was aborted');
    err.name = 'AbortError';
    throw err;
  };

  const timeoutRes = await appendOrderToSheet(mockOrder);
  check('AbortError / Timeout handled safely without throwing', timeoutRes.success === false && timeoutRes.error === 'Request timeout');

  // Test H: Secret is never exposed in returned objects
  check('Secret never exposed in success result', !('secret' in successRes));
  check('Secret never exposed in duplicate result', !('secret' in duplicateRes));
  check('Secret never exposed in fail result', !('secret' in failRes));
  check('Secret never exposed in timeout result', !('secret' in timeoutRes));

  // Test updateOrderInSheet with mock success
  globalThis.fetch = async (url, options) => {
    const parsedBody = JSON.parse(options.body);
    assert(parsedBody.action === 'updateOrder', 'Action is updateOrder');
    assert(parsedBody.orderId === 'MP-999', 'orderId is sent');
    assert(!('Order ID' in parsedBody.updates), 'Order ID is never inside updates');
    return {
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        updated: true,
        orderId: 'MP-999',
      }),
    };
  };

  const updateSuccessRes = await updateOrderInSheet('MP-999', {
    orderStatus: 'Delivered',
    billNumber: 'MP-BILL-999',
  });
  check('updateOrderInSheet succeeds with valid update payload', updateSuccessRes.success === true && updateSuccessRes.updated === true);

  // Restore globalThis.fetch and env
  globalThis.fetch = originalFetch;
  if (originalUrl) process.env.GOOGLE_SHEETS_WEBAPP_URL = originalUrl;
  else delete process.env.GOOGLE_SHEETS_WEBAPP_URL;
  if (originalSecret) process.env.GOOGLE_SHEETS_SYNC_SECRET = originalSecret;
  else delete process.env.GOOGLE_SHEETS_SYNC_SECRET;

  // Test I: Frontend bundle does not contain GOOGLE_SHEETS_SYNC_SECRET
  console.log('\n--- 5. Testing Bundle Security & Isolation ---');
  const distJsFiles = fs.readdirSync('dist/assets').filter((f) => f.endsWith('.js'));
  for (const jsFile of distJsFiles) {
    const bundleContent = fs.readFileSync(path.join('dist/assets', jsFile), 'utf8');
    check(
      `Bundle ${jsFile} does not contain GOOGLE_SHEETS_SYNC_SECRET`,
      !bundleContent.includes('GOOGLE_SHEETS_SYNC_SECRET')
    );
  }

  console.log('\n====================================================');
  console.log(`ALL ${passed} UNIT & ISOLATION CHECKS PASSED SUCCESSFULLY!`);
  console.log('====================================================');
}

runUnitTests().catch((err) => {
  console.error('Unit tests failed:', err);
  process.exit(1);
});
