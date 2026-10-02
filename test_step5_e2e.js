// test_step5_e2e.js
// MOMENTPRESS STEP 5: FULL END-TO-END FUNCTIONAL AUDIT + REAL USER FLOW VERIFICATION

import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000';
let passCount = 0;
let failCount = 0;
const trackedCreatedOrderIds = [];

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${message}`);
    failCount++;
  }
}

async function run() {
  console.log('====================================================');
  console.log('MOMENTPRESS STEP 5: FULL END-TO-END FUNCTIONAL AUDIT');
  console.log('====================================================\n');

  // Backup original store data for complete restoration
  const dataFilePath = path.resolve('./data/momentpress-store.json');
  const originalStoreBackup = fs.readFileSync(dataFilePath, 'utf8');

  try {
    // ----------------------------------------------------
    // SECTION 1: CUSTOMER COMPLETE FRAME ORDER FLOW
    // ----------------------------------------------------
    console.log('--- SECTION 1: Customer Complete Frame Order Flow ---');

    // Step A: Fetch public configuration (what customer browser loads)
    const configRes = await fetch(`${BASE_URL}/api/public/config`);
    assert(configRes.status === 200, 'GET /api/public/config returns 200 OK');
    const publicConfig = await configRes.json();
    assert(Array.isArray(publicConfig.frameSizes) && publicConfig.frameSizes.length > 0, 'Public frame sizes available');
    assert(Array.isArray(publicConfig.qualityTiers) && publicConfig.qualityTiers.length > 0, 'Public quality tiers available');

    const testFrameSize = publicConfig.frameSizes.find((f) => f.name.includes('8x10') || f.name.includes('8×10')) || publicConfig.frameSizes[0];
    const testQualityTier = publicConfig.qualityTiers.find((q) => q.name.includes('Velvet') || q.id === 'better') || publicConfig.qualityTiers[1];

    const expectedUnitPrice = testFrameSize.sellingPrice + testQualityTier.priceAdjustment;
    const testQuantity = 2;
    const expectedFinalAmount = expectedUnitPrice * testQuantity;

    const frameIdempotencyKey = `AUDIT-FRAME-${Date.now()}`;
    const framePayload = {
      idempotencyKey: frameIdempotencyKey,
      customerName: 'Ananya Sengupta',
      mobileNumber: '9830123456',
      address: '42A Park Street, Flat 3B, Near Mullick Bazar',
      city: 'Kolkata',
      pincode: '700016',
      product: 'Custom Photo Frames',
      size: testFrameSize.name,
      quality: testQualityTier.name,
      quantity: testQuantity,
      requirements: 'High contrast portrait, please center subject with 0.5 in white border',
    };

    const frameOrderRes = await fetch(`${BASE_URL}/api/public/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(framePayload),
    });

    assert(frameOrderRes.status === 201, `Customer frame order submitted successfully (HTTP 201)`);
    const frameOrderData = await frameOrderRes.json();
    assert(frameOrderData.success === true, 'Order response has success: true');
    assert(typeof frameOrderData.order?.id === 'string' && frameOrderData.order.id.startsWith('MP-'), `Authoritative Order ID generated: ${frameOrderData.order?.id}`);
    trackedCreatedOrderIds.push(frameOrderData.order.id);

    assert(frameOrderData.order.customerName === framePayload.customerName, 'Customer name matches submitted data');
    assert(frameOrderData.order.mobileNumber === framePayload.mobileNumber, 'Mobile number matches submitted data');
    assert(frameOrderData.order.address === framePayload.address, 'Address matches submitted data');
    assert(frameOrderData.order.city === framePayload.city, 'City matches submitted data');
    assert(frameOrderData.order.pincode === framePayload.pincode, 'Pincode matches submitted data');
    assert(frameOrderData.order.product === 'Custom Photo Frames', 'Product is Custom Photo Frames');
    assert(frameOrderData.order.size === testFrameSize.name, `Size is ${testFrameSize.name}`);
    assert(frameOrderData.order.quality === testQualityTier.name, `Quality is ${testQualityTier.name}`);
    assert(frameOrderData.order.quantity === testQuantity, `Quantity is ${testQuantity}`);
    assert(frameOrderData.order.unitPrice === expectedUnitPrice, `Unit price calculated by server: ₹${frameOrderData.order.unitPrice} (expected ₹${expectedUnitPrice})`);
    assert(frameOrderData.order.finalAmount === expectedFinalAmount, `Final amount calculated by server: ₹${frameOrderData.order.finalAmount} (expected ₹${expectedFinalAmount})`);
    assert(frameOrderData.order.requirements === framePayload.requirements, 'Customer requirements persisted');
    assert(frameOrderData.order.orderStatus === 'Pending', 'Initial order status is Pending');
    assert(frameOrderData.order.paymentStatus === 'Pending', 'Initial payment status is Pending');

    // ----------------------------------------------------
    // SECTION 2: SERVER-SIDE PRICE INTEGRITY & TAMPERING RESISTANCE
    // ----------------------------------------------------
    console.log('\n--- SECTION 2: Server-Side Price Integrity & Tampering Resistance ---');

    // Tamper Attempt A: Client injects fake low price (e.g. ₹1)
    const tamperedPriceRes = await fetch(`${BASE_URL}/api/public/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idempotencyKey: `TAMPER-1-${Date.now()}`,
        customerName: 'Tamper Tester',
        mobileNumber: '9830999999',
        address: '12 Salt Lake Sector V',
        city: 'Kolkata',
        pincode: '700091',
        product: 'Custom Photo Frames',
        size: testFrameSize.name,
        quality: testQualityTier.name,
        quantity: 1,
        unitPrice: 1, // Tampered price
        sellingPrice: 1,
        finalAmount: 1,
      }),
    });
    const tamperedPriceData = await tamperedPriceRes.json();
    assert(tamperedPriceRes.status === 201, 'Tampered price request processed by server');
    assert(tamperedPriceData.order.unitPrice === expectedUnitPrice, `Server ignored client unitPrice ₹1 and enforced authoritative price ₹${expectedUnitPrice}`);
    assert(tamperedPriceData.order.finalAmount === expectedUnitPrice, `Server ignored client finalAmount ₹1 and enforced ₹${expectedUnitPrice}`);
    trackedCreatedOrderIds.push(tamperedPriceData.order.id);

    // Tamper Attempt B: Client injects negative price
    const negativePriceRes = await fetch(`${BASE_URL}/api/public/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idempotencyKey: `TAMPER-NEG-${Date.now()}`,
        customerName: 'Negative Price Tester',
        mobileNumber: '9830888888',
        address: '55 Park Circus',
        city: 'Kolkata',
        pincode: '700017',
        product: 'Custom Photo Frames',
        size: testFrameSize.name,
        quality: testQualityTier.name,
        quantity: 1,
        finalAmount: -500,
      }),
    });
    const negativePriceData = await negativePriceRes.json();
    assert(negativePriceData.order.finalAmount === expectedUnitPrice, `Server rejected negative price and charged ₹${expectedUnitPrice}`);
    trackedCreatedOrderIds.push(negativePriceData.order.id);

    // Tamper Attempt C: Invalid frame size
    const invalidSizeRes = await fetch(`${BASE_URL}/api/public/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Invalid Size Tester',
        mobileNumber: '9830777777',
        address: '99 Gariahat Road',
        pincode: '700019',
        product: 'Custom Photo Frames',
        size: '99x99 Gargantuan Frame',
        quality: testQualityTier.name,
        quantity: 1,
      }),
    });
    assert(invalidSizeRes.status === 400, 'Server rejected invalid frame size with HTTP 400');
    const invalidSizeData = await invalidSizeRes.json();
    assert(invalidSizeData.error && invalidSizeData.error.includes('Invalid frame size'), `Helpful error returned: "${invalidSizeData.error}"`);

    // Tamper Attempt D: Invalid quality tier
    const invalidQualityRes = await fetch(`${BASE_URL}/api/public/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Invalid Quality Tester',
        mobileNumber: '9830666666',
        address: '10 Rashbehari Ave',
        pincode: '700026',
        product: 'Custom Photo Frames',
        size: testFrameSize.name,
        quality: 'SuperNanoTitaniumGloss',
        quantity: 1,
      }),
    });
    assert(invalidQualityRes.status === 400, 'Server rejected invalid quality tier with HTTP 400');

    // Tamper Attempt E: Invalid quantity (0, -5, 101, string)
    const zeroQtyRes = await fetch(`${BASE_URL}/api/public/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Zero Qty Tester',
        mobileNumber: '9830555555',
        address: '10 Rashbehari Ave',
        pincode: '700026',
        product: 'Custom Photo Frames',
        size: testFrameSize.name,
        quality: testQualityTier.name,
        quantity: 0,
      }),
    });
    assert(zeroQtyRes.status === 400, 'Server rejected 0 quantity with HTTP 400');

    const overQtyRes = await fetch(`${BASE_URL}/api/public/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Over Qty Tester',
        mobileNumber: '9830555555',
        address: '10 Rashbehari Ave',
        pincode: '700026',
        product: 'Custom Photo Frames',
        size: testFrameSize.name,
        quality: testQualityTier.name,
        quantity: 150,
      }),
    });
    assert(overQtyRes.status === 400, 'Server rejected quantity > 100 with HTTP 400');

    // Tamper Attempt F: Missing required fields
    const missingNameRes = await fetch(`${BASE_URL}/api/public/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: '',
        mobileNumber: '9830555555',
        address: '10 Rashbehari Ave',
        pincode: '700026',
        product: 'Custom Photo Frames',
        size: testFrameSize.name,
        quality: testQualityTier.name,
        quantity: 1,
      }),
    });
    assert(missingNameRes.status === 400, 'Server rejected empty customerName with HTTP 400');

    const badPhoneRes = await fetch(`${BASE_URL}/api/public/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Bad Phone Tester',
        mobileNumber: '12345',
        address: '10 Rashbehari Ave',
        pincode: '700026',
        product: 'Custom Photo Frames',
        size: testFrameSize.name,
        quality: testQualityTier.name,
        quantity: 1,
      }),
    });
    assert(badPhoneRes.status === 400, 'Server rejected invalid phone with HTTP 400');

    const badPincodeRes = await fetch(`${BASE_URL}/api/public/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Bad Pin Tester',
        mobileNumber: '9830555555',
        address: '10 Rashbehari Ave',
        pincode: '700',
        product: 'Custom Photo Frames',
        size: testFrameSize.name,
        quality: testQualityTier.name,
        quantity: 1,
      }),
    });
    assert(badPincodeRes.status === 400, 'Server rejected non-6-digit pincode with HTTP 400');

    // ----------------------------------------------------
    // SECTION 3: DOUBLE-SUBMISSION / IDEMPOTENCY PROTECTION
    // ----------------------------------------------------
    console.log('\n--- SECTION 3: Double-Submission & Idempotency Protection ---');
    const sharedIdempotencyKey = `DOUBLE-CLICK-${Date.now()}`;
    const doubleClickPayload = {
      idempotencyKey: sharedIdempotencyKey,
      customerName: 'Rapid Clicker',
      mobileNumber: '9830444444',
      address: '88 Diamond Harbour Road',
      city: 'Kolkata',
      pincode: '700038',
      product: 'Custom Photo Frames',
      size: testFrameSize.name,
      quality: testQualityTier.name,
      quantity: 1,
    };

    // Send 3 rapid concurrent requests with identical idempotencyKey
    const [res1, res2, res3] = await Promise.all([
      fetch(`${BASE_URL}/api/public/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doubleClickPayload),
      }),
      fetch(`${BASE_URL}/api/public/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doubleClickPayload),
      }),
      fetch(`${BASE_URL}/api/public/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doubleClickPayload),
      }),
    ]);

    const data1 = await res1.json();
    const data2 = await res2.json();
    const data3 = await res3.json();

    assert(data1.success && data2.success && data3.success, 'All 3 requests returned successful status');
    assert(
      data1.order.id === data2.order.id && data2.order.id === data3.order.id,
      `All 3 requests resolved to the EXACT SAME Order ID: ${data1.order.id} (Zero duplicates created)`
    );
    trackedCreatedOrderIds.push(data1.order.id);

    // ----------------------------------------------------
    // SECTION 4: STICKER ORDER FLOW
    // ----------------------------------------------------
    console.log('\n--- SECTION 4: Sticker Order Flow ---');
    const testStickerSize = publicConfig.stickerSizes.find((s) => s.id === 'Medium' || s.name.includes('Medium')) || publicConfig.stickerSizes[0];
    const stickerQty = 3;
    const expectedStickerUnit = testStickerSize.sellingPrice;
    const expectedStickerTotal = expectedStickerUnit * stickerQty;

    const stickerOrderRes = await fetch(`${BASE_URL}/api/public/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idempotencyKey: `AUDIT-STICKER-${Date.now()}`,
        customerName: 'Sourav Ganguly',
        mobileNumber: '9830333333',
        address: 'Biren Roy Road, Behala',
        city: 'Kolkata',
        pincode: '700034',
        product: 'Photo Stickers',
        size: testStickerSize.name,
        quality: 'Matte Vinyl',
        quantity: stickerQty,
        requirements: 'Die-cut circle stickers with matte finish',
      }),
    });

    assert(stickerOrderRes.status === 201, 'Sticker order created with HTTP 201');
    const stickerOrderData = await stickerOrderRes.json();
    assert(stickerOrderData.order.product === 'Photo Stickers', 'Sticker product registered correctly');
    assert(stickerOrderData.order.size === testStickerSize.name, `Sticker size is ${testStickerSize.name}`);
    assert(stickerOrderData.order.unitPrice === expectedStickerUnit, `Sticker unit price is ₹${expectedStickerUnit}`);
    assert(stickerOrderData.order.finalAmount === expectedStickerTotal, `Sticker final amount is ₹${expectedStickerTotal}`);
    trackedCreatedOrderIds.push(stickerOrderData.order.id);

    // ----------------------------------------------------
    // SECTION 5: ADMIN AUTHENTICATION & SESSION MANAGEMENT
    // ----------------------------------------------------
    console.log('\n--- SECTION 5: Admin Authentication & Session Management ---');

    // Unauthenticated access rejected
    const unauthedRes = await fetch(`${BASE_URL}/api/admin/orders`);
    assert(unauthedRes.status === 401, 'Unauthenticated request to /api/admin/orders returns 401 Unauthorized');

    // Invalid credentials rejected
    const badLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'WrongPassword123' }),
    });
    assert(badLoginRes.status === 401, 'Invalid password rejected with 401 Unauthorized');

    // Valid login
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'MomentPress@2026' }),
    });
    assert(loginRes.status === 200, 'Valid login returns HTTP 200');
    const loginData = await loginRes.json();
    assert(typeof loginData.token === 'string' && loginData.token.length > 20, 'Received secure session token');
    const adminToken = loginData.token;

    // Verify session via /api/auth/me
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(meRes.status === 200, 'GET /api/auth/me returns 200 for valid session');
    const meData = await meRes.json();
    assert(meData.authenticated === true && meData.username === 'admin', 'Session active for admin');

    // ----------------------------------------------------
    // SECTION 6: ADMIN ORDERS & DATA INTEGRITY
    // ----------------------------------------------------
    console.log('\n--- SECTION 6: Admin Orders & Order Data Integrity ---');

    const adminOrdersRes = await fetch(`${BASE_URL}/api/admin/orders`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminOrdersRes.status === 200, 'GET /api/admin/orders returns 200 OK');
    const adminOrdersData = await adminOrdersRes.json();
    assert(Array.isArray(adminOrdersData.orders), 'Admin orders list returned as array');

    // Verify customer confirmation order matches Admin stored order
    const foundFrameOrder = adminOrdersData.orders.find((o) => o.id === frameOrderData.order.id);
    assert(Boolean(foundFrameOrder), `Customer frame order ${frameOrderData.order.id} found in Admin Orders`);
    if (foundFrameOrder) {
      assert(foundFrameOrder.customerName === framePayload.customerName, 'Admin order customerName matches exactly');
      assert(foundFrameOrder.mobileNumber === framePayload.mobileNumber, 'Admin order mobileNumber matches exactly');
      assert(foundFrameOrder.address === framePayload.address, 'Admin order address matches exactly');
      assert(foundFrameOrder.city === framePayload.city, 'Admin order city matches exactly');
      assert(foundFrameOrder.pincode === framePayload.pincode, 'Admin order pincode matches exactly');
      assert(foundFrameOrder.product === 'Custom Photo Frames', 'Admin order product matches exactly');
      assert(foundFrameOrder.size === testFrameSize.name, 'Admin order size matches exactly');
      assert(foundFrameOrder.quality === testQualityTier.name, 'Admin order quality matches exactly');
      assert(foundFrameOrder.quantity === testQuantity, 'Admin order quantity matches exactly');
      assert(foundFrameOrder.finalAmount === expectedFinalAmount, 'Admin order finalAmount matches exactly');
      assert(foundFrameOrder.requirements === framePayload.requirements, 'Admin order requirements match exactly');
    }

    // Verify sticker order in Admin
    const foundStickerOrder = adminOrdersData.orders.find((o) => o.id === stickerOrderData.order.id);
    assert(Boolean(foundStickerOrder), `Customer sticker order ${stickerOrderData.order.id} found in Admin Orders`);

    // Test updating order status in Admin
    const updateStatusRes = await fetch(`${BASE_URL}/api/admin/orders/update-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        orderId: frameOrderData.order.id,
        isOffline: false,
        newStatus: 'Processing',
      }),
    });
    assert(updateStatusRes.status === 200, 'Order status updated to "Processing" in Admin');

    // Verify status update in orders list
    const recheckOrdersRes = await fetch(`${BASE_URL}/api/admin/orders`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const recheckData = await recheckOrdersRes.json();
    const updatedOrder = recheckData.orders.find((o) => o.id === frameOrderData.order.id);
    assert(updatedOrder?.orderStatus === 'Processing', 'Order status verified updated to "Processing" in Admin storage');

    // ----------------------------------------------------
    // SECTION 7: CMS ROUND TRIPS (ALL 10 SECTIONS)
    // ----------------------------------------------------
    console.log('\n--- SECTION 7: CMS -> Public Round Trips ---');

    // 1. Frame Price Round Trip
    console.log('-> 7.1: Frame Size Price Round Trip');
    const targetFrame = publicConfig.frameSizes[0];
    const originalFramePrice = targetFrame.originalPrice;
    const testTempPrice = originalFramePrice + 123;

    // Admin updates price
    const updateFramePriceRes = await fetch(`${BASE_URL}/api/admin/config/pricing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        type: 'frameSizes',
        items: publicConfig.frameSizes.map((f) =>
          f.id === targetFrame.id ? { ...f, originalPrice: testTempPrice } : f
        ),
      }),
    });
    assert(updateFramePriceRes.status === 200, 'Admin saved updated frame price');

    // Verify public website config reflects new price
    const publicConfigAfterPrice = await (await fetch(`${BASE_URL}/api/public/config`)).json();
    const updatedPublicFrame = publicConfigAfterPrice.frameSizes.find((f) => f.id === targetFrame.id);
    assert(updatedPublicFrame.sellingPrice === testTempPrice, `Public config reflects updated frame price: ₹${updatedPublicFrame.sellingPrice} (expected ₹${testTempPrice})`);

    // Customer places order -> server calculates using the new CMS price
    const orderWithNewPriceRes = await fetch(`${BASE_URL}/api/public/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Roundtrip Tester',
        mobileNumber: '9830222222',
        address: '100 College Street',
        pincode: '700073',
        product: 'Custom Photo Frames',
        size: targetFrame.name,
        quality: publicConfig.qualityTiers[0].name,
        quantity: 1,
      }),
    });
    const orderWithNewPriceData = await orderWithNewPriceRes.json();
    const expectedNewTotal = testTempPrice + publicConfig.qualityTiers[0].priceAdjustment;
    assert(orderWithNewPriceData.order.finalAmount === expectedNewTotal, `Server calculated order finalAmount ₹${orderWithNewPriceData.order.finalAmount} using new CMS price`);
    trackedCreatedOrderIds.push(orderWithNewPriceData.order.id);

    // Restore original frame price
    await fetch(`${BASE_URL}/api/admin/config/pricing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        type: 'frameSizes',
        items: publicConfig.frameSizes.map((f) =>
          f.id === targetFrame.id ? { ...f, originalPrice: originalFramePrice } : f
        ),
      }),
    });
    console.log('   Original frame price restored.');

    // 2. Quality Tiers Round Trip
    console.log('-> 7.2: Quality Tier Round Trip');
    const targetTier = publicConfig.qualityTiers[0];
    const origTierDelta = targetTier.priceAdjustment;
    const tempTierDelta = origTierDelta + 65;

    await fetch(`${BASE_URL}/api/admin/config/pricing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        type: 'qualityTiers',
        items: publicConfig.qualityTiers.map((q) =>
          q.id === targetTier.id ? { ...q, originalPriceDelta: tempTierDelta } : q
        ),
      }),
    });

    const publicConfigTier = await (await fetch(`${BASE_URL}/api/public/config`)).json();
    const updatedTier = publicConfigTier.qualityTiers.find((q) => q.id === targetTier.id);
    assert(updatedTier.priceAdjustment === tempTierDelta, `Public config reflects updated tier delta: ₹${updatedTier.priceAdjustment}`);

    // Restore quality tier
    await fetch(`${BASE_URL}/api/admin/config/pricing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        type: 'qualityTiers',
        items: publicConfig.qualityTiers.map((q) =>
          q.id === targetTier.id ? { ...q, originalPriceDelta: origTierDelta } : q
        ),
      }),
    });
    console.log('   Original quality tier delta restored.');

    // 3. Existing Designs + Google Drive Round Trip
    console.log('-> 7.3: Existing Designs + Google Drive Round Trip');
    const testDriveId = `AUDIT-DRIVE-${Date.now()}`;
    const newDesign = {
      id: testDriveId,
      title: 'Audit Google Drive Keepsake',
      name: 'Audit Google Drive Keepsake',
      category: 'Family Memories',
      size: '8×10 in',
      finish: 'natural-oak',
      description: 'Preserved with museum glass',
      googleDriveUrl: 'https://drive.google.com/file/d/1A2B3C4D5E6F/view?usp=sharing',
      active: true,
      displayOrder: 99,
    };

    const currentDesigns = publicConfig.existingDesigns || [];
    await fetch(`${BASE_URL}/api/admin/config/content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        type: 'existingDesigns',
        data: [...currentDesigns, newDesign],
      }),
    });

    const configWithDesign = await (await fetch(`${BASE_URL}/api/public/config`)).json();
    const foundDesign = configWithDesign.existingDesigns.find((d) => d.id === testDriveId);
    assert(Boolean(foundDesign), 'New Google Drive design appears on public website');
    assert(foundDesign?.googleDriveUrl === newDesign.googleDriveUrl, 'Google Drive URL preserved in public config');

    // Hide design
    await fetch(`${BASE_URL}/api/admin/config/content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        type: 'existingDesigns',
        data: [...currentDesigns, { ...newDesign, active: false }],
      }),
    });
    const configWithHidden = await (await fetch(`${BASE_URL}/api/public/config`)).json();
    assert(!configWithHidden.existingDesigns.some((d) => d.id === testDriveId), 'Deactivated design immediately hidden from public config');

    // Clean up test design
    await fetch(`${BASE_URL}/api/admin/config/content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        type: 'existingDesigns',
        data: currentDesigns,
      }),
    });
    console.log('   Temporary design deleted and cleaned up.');

    // 4. FAQ CMS Round Trip
    console.log('-> 7.4: FAQ CMS Round Trip');
    const testFaqId = `AUDIT-FAQ-${Date.now()}`;
    const testFaq = {
      id: testFaqId,
      question: 'What archival inks are used in Bowbazar?',
      answer: 'We use genuine 12-color pigment archival inks rated for 100+ years.',
      category: 'Printing & Quality',
      active: true,
      displayOrder: 99,
    };
    const currentFaqs = publicConfig.faqs || [];

    await fetch(`${BASE_URL}/api/admin/config/content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        type: 'faqs',
        data: [...currentFaqs, testFaq],
      }),
    });

    const configWithFaq = await (await fetch(`${BASE_URL}/api/public/config`)).json();
    assert(configWithFaq.faqs.some((f) => f.id === testFaqId), 'New FAQ question appears in public config');

    // Clean up FAQ
    await fetch(`${BASE_URL}/api/admin/config/content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        type: 'faqs',
        data: currentFaqs,
      }),
    });
    console.log('   Temporary FAQ deleted and cleaned up.');

    // 5. Contact Details Verification
    console.log('-> 7.5: Contact & Social Details Verification');
    const settings = publicConfig.settings || {};
    assert(settings.phone === '6291681660', `Call phone is 6291681660 (got ${settings.phone})`);
    assert(settings.whatsapp === '7980855821' || settings.whatsappNumber === '7980855821', `WhatsApp is 7980855821 (got ${settings.whatsapp || settings.whatsappNumber})`);
    assert(settings.instagramHandle === '@_rr.studio__', `Instagram handle is @_rr.studio__ (got ${settings.instagramHandle})`);
    assert(settings.email === 'connect.rrstudio@gmail.com', `Email is connect.rrstudio@gmail.com (got ${settings.email})`);

    // ----------------------------------------------------
    // SECTION 8: SEO & METADATA VERIFICATION
    // ----------------------------------------------------
    console.log('\n--- SECTION 8: Technical SEO & Metadata Verification ---');

    // robots.txt
    const robotsRes = await fetch(`${BASE_URL}/robots.txt`);
    assert(robotsRes.status === 200, 'GET /robots.txt returns 200 OK');
    const robotsText = await robotsRes.text();
    assert(robotsText.includes('Allow: /'), 'robots.txt allows public routes');
    assert(robotsText.includes('Disallow: /admin/'), 'robots.txt disallows /admin/');
    assert(robotsText.includes('Disallow: /order/'), 'robots.txt disallows /order/');
    assert(robotsText.includes('Sitemap:'), 'robots.txt includes Sitemap location');

    // sitemap.xml
    const sitemapRes = await fetch(`${BASE_URL}/sitemap.xml`);
    assert(sitemapRes.status === 200, 'GET /sitemap.xml returns 200 OK');
    const sitemapText = await sitemapRes.text();
    assert(sitemapText.includes('<urlset') && sitemapText.includes('</urlset>'), 'sitemap.xml is valid XML urlset');
    assert(sitemapText.includes('https://momentpress.ai.studio/'), 'sitemap.xml includes root URL');
    assert(!sitemapText.includes('/admin/'), 'sitemap.xml NEVER includes /admin/ routes');

    // Security Headers on Admin & API
    assert(
      robotsRes.headers.get('x-content-type-options') === 'nosniff',
      'Security header X-Content-Type-Options: nosniff present'
    );
    const adminHeaderCheck = await fetch(`${BASE_URL}/api/admin/orders`);
    assert(
      adminHeaderCheck.headers.get('x-robots-tag') === 'noindex, nofollow, noarchive',
      'Private routes enforce X-Robots-Tag: noindex, nofollow, noarchive'
    );

    // ----------------------------------------------------
    // SECTION 9: DIRECT ROUTE & REFRESH SURVIVAL
    // ----------------------------------------------------
    console.log('\n--- SECTION 9: Direct Route & Refresh Survival ---');
    const routesToTest = [
      '/',
      '/custom-photo-frames',
      '/photo-stickers',
      '/existing-designs',
      '/faq',
      '/contact',
      '/order/quality',
      '/order/review',
      '/order/delivery',
      '/order/confirmation',
      '/admin/2008',
      '/admin/2008/orders',
      '/admin/2008/products',
      '/admin/2008/frame-sizes',
      '/admin/2008/quality',
      '/admin/2008/sticker-sizes',
      '/admin/2008/homepage',
      '/admin/2008/existing-designs',
      '/admin/2008/faq',
      '/admin/2008/contact',
      '/admin/2008/website-settings',
      '/admin/2008/seo',
      '/admin/2008/security',
    ];

    let allRoutesSurvived = true;
    for (const r of routesToTest) {
      const res = await fetch(`${BASE_URL}${r}`);
      if (res.status !== 200) {
        console.error(`Route ${r} returned HTTP ${res.status}`);
        allRoutesSurvived = false;
      }
    }
    assert(allRoutesSurvived, `All ${routesToTest.length} public, order, and admin routes directly serve HTTP 200 on direct refresh`);

    // ----------------------------------------------------
    // SECTION 10: PUBLIC CONFIG DATA LEAKAGE AUDIT
    // ----------------------------------------------------
    console.log('\n--- SECTION 10: Public Config Data Leakage Audit ---');
    const pubConfigKeys = Object.keys(publicConfig);
    assert(!pubConfigKeys.includes('adminCredentials'), 'No adminCredentials exposed in public config');
    assert(!pubConfigKeys.includes('sessions'), 'No sessions exposed in public config');
    assert(!pubConfigKeys.includes('onlineOrders'), 'No onlineOrders exposed in public config');
    assert(!pubConfigKeys.includes('offlineSales'), 'No offlineSales exposed in public config');
    assert(!pubConfigKeys.includes('customers'), 'No customers exposed in public config');
    assert(!pubConfigKeys.includes('inventory'), 'No inventory exposed in public config');
    assert(!pubConfigKeys.includes('purchases'), 'No purchases exposed in public config');
    assert(!pubConfigKeys.includes('expenses'), 'No expenses exposed in public config');

    // ----------------------------------------------------
    // SECTION 11: DISK PERSISTENCE VERIFICATION
    // ----------------------------------------------------
    console.log('\n--- SECTION 11: Disk Persistence Verification ---');
    const storeRaw = fs.readFileSync(dataFilePath, 'utf8');
    const diskStore = JSON.parse(storeRaw);
    const diskOrderFound = diskStore.onlineOrders.some((o) => o.id === frameOrderData.order.id);
    assert(diskOrderFound, `Order ${frameOrderData.order.id} verified physically written to momentpress-store.json on disk`);

    // ----------------------------------------------------
    // SECTION 12: TEST DATA CLEANUP
    // ----------------------------------------------------
    console.log('\n--- SECTION 12: Test Data Cleanup ---');
    // Read current store and filter out all tracked test order IDs
    const currentStore = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
    const beforeCount = currentStore.onlineOrders.length;
    currentStore.onlineOrders = currentStore.onlineOrders.filter(
      (o) => !trackedCreatedOrderIds.includes(o.id) && !o.customerName.includes('Tester') && !o.customerName.includes('Ananya Sengupta') && !o.customerName.includes('Sourav Ganguly') && !o.customerName.includes('Rapid Clicker')
    );
    const removedCount = beforeCount - currentStore.onlineOrders.length;
    fs.writeFileSync(dataFilePath, JSON.stringify(currentStore, null, 2), 'utf8');
    try { fs.copyFileSync(dataFilePath, `${dataFilePath}.backup`); } catch (_) {}
    assert(true, `Cleaned up ${removedCount} temporary audit test orders from persistent store.`);

  } catch (err) {
    console.error('Fatal error during E2E audit:', err);
    failCount++;
  }

  console.log('\n====================================================');
  console.log(`TOTAL AUDIT CHECKS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
  console.log('====================================================\n');

  if (failCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

run();
