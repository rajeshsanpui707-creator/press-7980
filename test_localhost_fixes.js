/**
 * MOMENTPRESS: LOCALHOST UI + FUNCTIONALITY FIX VERIFICATION SUITE
 * Tests:
 * 1. Google Drive safe URL parsing & fallback thumbnail endpoints
 * 2. Admin & Public Existing Designs Google Drive image integration
 * 3. 2-3s visual processing state with single server request and real server order ID
 * 4. Compact Frame Size cards architecture & font hierarchy
 * 5. Admin-controlled "Most Popular" CMS toggle
 * 6. Frame preview contrast & authentic matboard distinction
 * 7. Clean craftsmanship copy "Handmade in Bowbazar, Kolkata"
 */

import fs from 'fs';
import path from 'path';
import { parseGoogleDriveUrl, getSafeImageSource, getFallbackImageSource } from './src/lib/drive/google-drive.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('MOMENTPRESS: LOCALHOST FIXES VERIFICATION');
  console.log('====================================================\n');

  // --- SECTION 1: Google Drive URL Conversion & Safe Extraction ---
  console.log('--- SECTION 1: Google Drive URL Conversion & Safe Extraction ---');
  const fileId = '1H4JeBuj3K5AbRqJZx2iHv4Y0LLl2Xrme';
  const urlsToTest = [
    `https://drive.google.com/file/d/${fileId}/view?usp=sharing`,
    `https://drive.google.com/open?id=${fileId}`,
    `https://drive.google.com/uc?id=${fileId}&export=view`,
    `https://lh3.googleusercontent.com/d/${fileId}`,
  ];

  for (const url of urlsToTest) {
    const parsed = parseGoogleDriveUrl(url);
    assert(parsed.isValid && parsed.id === fileId, `Correctly parsed file ID from: ${url.split('/')[2]}`);
    assert(parsed.renderableUrl.includes(fileId), `Generated valid renderable URL for ${fileId}`);
    assert(parsed.fallbackThumbnailUrl.includes('drive.google.com/thumbnail'), `Generated valid thumbnail fallback endpoint`);
  }

  const safeSrc = getSafeImageSource(urlsToTest[0]);
  assert(Boolean(safeSrc), `getSafeImageSource returns valid viewer URL: ${safeSrc}`);

  const fallbackSrc = getFallbackImageSource(urlsToTest[0]);
  assert(fallbackSrc.includes('drive.google.com/thumbnail'), `getFallbackImageSource returns thumbnail: ${fallbackSrc}`);

  // --- SECTION 2: Component Inspection for no-referrer & Error States ---
  console.log('\n--- SECTION 2: Image Security & Fallback Display ---');
  const existingDesignsView = fs.readFileSync('src/components/admin/pages/ExistingDesignsPageView.tsx', 'utf8');
  assert(existingDesignsView.includes('referrerPolicy="no-referrer"'), 'Admin Existing Designs includes referrerPolicy="no-referrer"');
  assert(existingDesignsView.includes('Preview unavailable'), 'Admin Existing Designs includes clean "Preview unavailable" state');
  assert(existingDesignsView.includes('Open in Drive'), 'Admin Existing Designs provides direct "Open in Drive" link');

  const galleryItemContent = fs.readFileSync('src/components/gallery/GalleryItem.tsx', 'utf8');
  assert(galleryItemContent.includes('referrerPolicy="no-referrer"'), 'GalleryItem includes referrerPolicy="no-referrer"');
  assert(galleryItemContent.includes('getFallbackImageSource'), 'GalleryItem attempts fallback image source on error');

  const galleryLightboxContent = fs.readFileSync('src/components/gallery/GalleryLightbox.tsx', 'utf8');
  assert(galleryLightboxContent.includes('referrerPolicy="no-referrer"'), 'GalleryLightbox includes referrerPolicy="no-referrer"');
  assert(!galleryLightboxContent.includes('Replaceable Image Slot'), 'GalleryLightbox removed outdated placeholder phase copy');
  assert(galleryLightboxContent.includes('Handmade in Bowbazar, Kolkata'), 'GalleryLightbox displays studio craftsmanship note');

  // --- SECTION 3: Order Submission 2-3s Visual Processing State ---
  console.log('\n--- SECTION 3: Order Submission Processing State ---');
  const processingStateContent = fs.readFileSync('src/components/order-flow/OrderProcessingState.tsx', 'utf8');
  assert(processingStateContent.includes('Placing your order...'), 'OrderProcessingState includes "Placing your order..." message');
  assert(processingStateContent.includes('Generating your order ID...'), 'OrderProcessingState includes "Generating your order ID..." message');
  assert(processingStateContent.includes('Finalizing your order...'), 'OrderProcessingState includes "Finalizing your order..." message');

  const appContent = fs.readFileSync('src/App.tsx', 'utf8');
  assert(appContent.includes('minDelayPromise') && appContent.includes('2400'), 'App.tsx enforces ~2.4s minimum duration for visual processing state');

  const orderFlowContent = fs.readFileSync('src/components/order-flow/OrderFlow.tsx', 'utf8');
  assert(orderFlowContent.includes('minDelayPromise') && orderFlowContent.includes('2400'), 'OrderFlow enforces ~2.4s minimum duration for visual processing state');
  assert(orderFlowContent.includes('<OrderProcessingState />'), 'OrderFlow renders OrderProcessingState during processing');

  const stickerSelectorContent = fs.readFileSync('src/components/products/StickerSelector.tsx', 'utf8');
  assert(stickerSelectorContent.includes('minDelayPromise') && stickerSelectorContent.includes('2400'), 'StickerSelector enforces ~2.4s minimum duration for visual processing state');
  assert(stickerSelectorContent.includes('<OrderProcessingState />'), 'StickerSelector renders OrderProcessingState during processing');

  // Verify Single Backend Request & Server Order ID
  const testOrderRes = await fetch('http://localhost:3000/api/public/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: 'Localhost Fixes Customer',
      mobileNumber: '9830112233',
      address: 'Bowbazar Verification Lane',
      city: 'Kolkata',
      pincode: '700012',
      product: 'Custom Photo Frames',
      size: '6×8 in',
      quality: 'Studio Velvet',
      quantity: 1,
      requirements: 'Localhost processing test',
    }),
  });
  const testOrderData = await testOrderRes.json();
  assert(testOrderRes.status === 201 && testOrderData.success, 'Server successfully created order with HTTP 201');
  assert(testOrderData.order.id.startsWith('MP-'), `Authoritative server order ID returned: ${testOrderData.order.id}`);

  // Cleanup test order
  const storePath = path.resolve('data/momentpress-store.json');
  if (fs.existsSync(storePath)) {
    const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));
    store.onlineOrders = (store.onlineOrders || []).filter((o) => o.id !== testOrderData.order.id);
    fs.writeFileSync(storePath, JSON.stringify(store, null, 2));
  }

  // --- SECTION 4: Frame Size Cards Typography & Layout ---
  console.log('\n--- SECTION 4: Frame Size Cards Typography & Layout ---');
  const frameStepContent = fs.readFileSync('src/components/order-flow/FrameStep.tsx', 'utf8');
  assert(frameStepContent.includes('grid grid-cols-2 gap-2 sm:gap-3'), 'FrameStep uses compact 2-column mobile grid');
  assert(frameStepContent.includes('border-2 border-[#10100F] bg-[#F8F5EE]'), 'FrameStep uses high-contrast selected state border and subtle warm background');
  assert(frameStepContent.includes('text-[15px] sm:text-base font-bold'), 'FrameStep size title is primary anchor (15-16px font-bold)');
  assert(frameStepContent.includes('text-[#78716C] font-mono'), 'FrameStep centimeter conversion is secondary and muted');
  assert(frameStepContent.includes('tabular-nums leading-tight'), 'FrameStep starting price is cleanly proportioned');
  assert(frameStepContent.includes('Handmade in Bowbazar, Kolkata'), 'FrameStep displays "Handmade in Bowbazar, Kolkata" craftsmanship stamp');

  // --- SECTION 5: Admin-Controlled "Most Popular" CMS Toggle ---
  console.log('\n--- SECTION 5: Admin-Controlled "Most Popular" CMS Toggle ---');
  const frameSizesViewContent = fs.readFileSync('src/components/admin/pages/FrameSizesPageView.tsx', 'utf8');
  assert(frameSizesViewContent.includes('handleTogglePopular'), 'FrameSizesPageView includes handleTogglePopular handler');
  assert(frameSizesViewContent.includes('Designate as "Most Popular" Size'), 'FrameSizesPageView edit modal includes dedicated Most Popular toggle');
  assert(frameSizesViewContent.includes('Star className'), 'FrameSizesPageView table includes one-click Most Popular toggle button');

  // Test Admin CMS round trip for Most Popular
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'MomentPress@2026' }),
  });
  const loginData = await loginRes.json();
  assert(loginRes.status === 200 && Boolean(loginData.token), 'Admin login successful for CMS Most Popular test');

  // Set 8x10 as Most Popular via Admin API
  const getSizesRes = await fetch('http://localhost:3000/api/public/config');
  const publicConfig = await getSizesRes.json();
  const currentSizes = publicConfig.frameSizes || [];

  const updatedSizes = currentSizes.map((s) => ({
    ...s,
    popular: s.id === '8x10',
    badge: s.id === '8x10' ? 'Most Popular' : undefined,
  }));

  const saveRes = await fetch('http://localhost:3000/api/admin/config/pricing', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${loginData.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type: 'frameSizes', items: updatedSizes }),
  });
  assert(saveRes.status === 200, 'Admin successfully designated 8×10 as Most Popular');

  const verifyConfigRes = await fetch('http://localhost:3000/api/public/config');
  const verifyConfig = await verifyConfigRes.json();
  const popularSize = (verifyConfig.frameSizes || []).find((s) => s.popular);
  assert(popularSize && popularSize.id === '8x10', `Public config immediately reflects 8×10 as Most Popular (got ${popularSize?.id})`);

  // Restore 6x8 as Most Popular
  const restoredSizes = currentSizes.map((s) => ({
    ...s,
    popular: s.id === '6x8',
    badge: s.id === '6x8' ? 'Most Popular' : undefined,
  }));
  await fetch('http://localhost:3000/api/admin/config/pricing', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${loginData.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type: 'frameSizes', items: restoredSizes }),
  });
  console.log('   Restored 6×8 as default Most Popular.');

  // --- SECTION 6: Frame Preview & Contrast ---
  console.log('\n--- SECTION 6: Frame Preview & Contrast ---');
  const frameMockupContent = fs.readFileSync('src/components/common/FrameMockup.tsx', 'utf8');
  assert(frameMockupContent.includes('imageSrc'), 'FrameMockup supports imageSrc prop');
  assert(!frameMockupContent.includes('bg-[#242426]'), 'FrameMockup eliminated muddy pitch-black photo aperture');
  assert(frameMockupContent.includes('bg-[#FAF8F3]'), 'FrameMockup features authentic ivory gallery matboard');

  console.log('\n====================================================');
  console.log(`TOTAL CHECKS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
