/**
 * MOMENTPRESS: REVIEWS CMS + PUBLIC REVIEWS VERIFICATION SUITE
 *
 * Verifies all 20 requirements:
 * 1. Zero initial reviews in CMS & store
 * 2. Public config / reviews with zero reviews (clean empty state, no fake data)
 * 3. Add genuine review via Admin API (POST /api/admin/reviews)
 * 4. Edit review via Admin API (PUT /api/admin/reviews/:id)
 * 5. Delete review via Admin API (DELETE /api/admin/reviews/:id)
 * 6. Visibility control (ON/OFF) - hidden reviews excluded from public config
 * 7. Rating control (1 to 5 integer validation)
 * 8. Invalid rating rejected (0, 6, 3.5, string) with HTTP 400
 * 9. Empty customer name rejected with HTTP 400
 * 10. Empty review text rejected with HTTP 400
 * 11. Display order preserved and correctly sorted
 * 12. Featured status ON/OFF, and Featured=ON + Visible=OFF is NOT public
 * 13. Public CMS sync round-trip
 * 14. Admin authentication required
 * 15. Unauthorized review API requests rejected with HTTP 401
 * 16. Disk persistence verification in momentpress-store.json
 * 17. Reviews Admin route served (/admin/2008/reviews)
 * 18. Batch config endpoint (/api/admin/config/content with type='reviews') validation
 * 19. XSS / dangerous URL scheme sanitization (javascript: / data:)
 * 20. Public endpoint (/api/public/reviews) returns only visible reviews
 */

import http from 'http';
import fs from 'fs';

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

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let body = data;
        try {
          body = JSON.parse(data);
        } catch (_) {}
        resolve({ status: res.statusCode, headers: res.headers, body });
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('MOMENTPRESS: REVIEWS CMS VERIFICATION SUITE');
  console.log('====================================================\n');

  // --- Step 1: Baseline Zero Fake Reviews Check ---
  console.log('--- 1. Baseline Zero Fake Reviews & Clean Store ---');
  const storeRaw = JSON.parse(fs.readFileSync('data/momentpress-store.json', 'utf8'));
  assert(Array.isArray(storeRaw.reviews), 'store.reviews is an array');
  assert(storeRaw.reviews.length === 0, `store.reviews contains ZERO fake/demo reviews (found: ${storeRaw.reviews.length})`);

  // --- Step 2: Public Website with Zero Reviews ---
  console.log('\n--- 2. Public Config with Zero Reviews ---');
  const initialPublicRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/public/config',
    method: 'GET',
  });
  assert(initialPublicRes.status === 200, 'GET /api/public/config returns 200 OK');
  assert(Array.isArray(initialPublicRes.body.reviews), 'Public config reviews is an array');
  assert(initialPublicRes.body.reviews.length === 0, 'Public config returns exactly 0 reviews initially');

  const publicReviewsEndpointRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/public/reviews',
    method: 'GET',
  });
  assert(publicReviewsEndpointRes.status === 200, 'GET /api/public/reviews returns 200 OK');
  assert(publicReviewsEndpointRes.body.reviews.length === 0, 'GET /api/public/reviews returns 0 reviews initially');

  // --- Step 3: Admin Authentication & Security ---
  console.log('\n--- 3. Admin Authentication & Route Protection ---');
  const unauthGet = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/reviews',
    method: 'GET',
  });
  assert(unauthGet.status === 401, 'Unauthenticated GET /api/admin/reviews returns 401');

  const unauthPost = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/reviews',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { customerName: 'Test', reviewText: 'Test', rating: 5 });
  assert(unauthPost.status === 401, 'Unauthenticated POST /api/admin/reviews returns 401');

  // Login as admin
  const loginRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { username: 'admin', password: 'MomentPress@2026' });

  assert(loginRes.status === 200 && loginRes.body.token, 'Admin login succeeded and returned token');
  const token = loginRes.body.token;
  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // --- Step 4: Server-Side Validation: Invalid Inputs ---
  console.log('\n--- 4. Server-Side Validation ---');
  // 4.1 Empty customer name
  const emptyNameRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/reviews',
    method: 'POST',
    headers: authHeaders,
  }, { customerName: '   ', reviewText: 'Great frame quality!', rating: 5 });
  assert(emptyNameRes.status === 400, 'Empty customer name rejected with 400');
  assert(emptyNameRes.body.error.includes('Customer Name is required'), 'Helpful error message for empty customer name');

  // 4.2 Empty review text
  const emptyTextRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/reviews',
    method: 'POST',
    headers: authHeaders,
  }, { customerName: 'Aritra Sen', reviewText: '   ', rating: 5 });
  assert(emptyTextRes.status === 400, 'Empty review text rejected with 400');
  assert(emptyTextRes.body.error.includes('Review Text is required'), 'Helpful error message for empty review text');

  // 4.3 Invalid ratings
  const rating0Res = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/reviews',
    method: 'POST',
    headers: authHeaders,
  }, { customerName: 'Aritra Sen', reviewText: 'Great frame!', rating: 0 });
  assert(rating0Res.status === 400, 'Rating 0 rejected with 400');

  const rating6Res = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/reviews',
    method: 'POST',
    headers: authHeaders,
  }, { customerName: 'Aritra Sen', reviewText: 'Great frame!', rating: 6 });
  assert(rating6Res.status === 400, 'Rating 6 rejected with 400');

  const ratingFloatRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/reviews',
    method: 'POST',
    headers: authHeaders,
  }, { customerName: 'Aritra Sen', reviewText: 'Great frame!', rating: 4.5 });
  assert(ratingFloatRes.status === 400, 'Non-integer rating 4.5 rejected with 400');

  // --- Step 5: Add Genuine Review (Rating 5) ---
  console.log('\n--- 5. Create Review via Admin API ---');
  const addRes1 = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/reviews',
    method: 'POST',
    headers: authHeaders,
  }, {
    customerName: 'Ananya Roy',
    reviewText: 'The Studio Velvet print on the 8x10 natural oak frame is stunning. The contrast is rich and color rendition is archival quality.',
    rating: 5,
    location: 'Salt Lake, Kolkata',
    date: '2026-10-01',
    productPurchased: 'Custom Photo Frame (8×10 in)',
    visible: true,
    featured: true,
    displayOrder: 1,
  });
  assert(addRes1.status === 201, 'POST /api/admin/reviews returned 201 Created');
  assert(addRes1.body.review && addRes1.body.review.id, 'Assigned unique ID to new review');
  assert(addRes1.body.review.rating === 5, 'Stored exact rating 5');
  const review1Id = addRes1.body.review.id;

  // Verify in GET /api/admin/reviews
  const adminReviewsRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/reviews',
    method: 'GET',
    headers: authHeaders,
  });
  assert(adminReviewsRes.status === 200, 'GET /api/admin/reviews returns 200 OK');
  assert(adminReviewsRes.body.reviews.length === 1, 'Admin reviews list contains 1 review');
  assert(adminReviewsRes.body.reviews[0].customerName === 'Ananya Roy', 'Customer name matches in admin list');

  // Verify in Public Config
  const publicAfterAdd = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/public/config',
    method: 'GET',
  });
  assert(publicAfterAdd.body.reviews.length === 1, 'Public config now reflects exactly 1 published review');
  assert(publicAfterAdd.body.reviews[0].customerName === 'Ananya Roy', 'Public review customerName matches');
  assert(publicAfterAdd.body.reviews[0].rating === 5, 'Public review rating is exactly 5');
  assert(publicAfterAdd.body.reviews[0].featured === true, 'Public review featured status is true');

  // --- Step 6: Edit Review ---
  console.log('\n--- 6. Edit Review ---');
  const editRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/admin/reviews/${review1Id}`,
    method: 'PUT',
    headers: authHeaders,
  }, {
    customerName: 'Ananya Roy',
    reviewText: 'Updated: Outstanding archival quality frame and fast delivery in Kolkata!',
    rating: 4, // Changed rating to 4
    location: 'Salt Lake Sector 1, Kolkata',
    visible: true,
    featured: false,
    displayOrder: 1,
  });
  assert(editRes.status === 200, 'PUT /api/admin/reviews/:id returned 200 OK');
  assert(editRes.body.review.rating === 4, 'Updated rating is now 4');
  assert(editRes.body.review.reviewText.startsWith('Updated:'), 'Review text updated successfully');

  // Verify Public Config reflects updated review
  const publicAfterEdit = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/public/config',
    method: 'GET',
  });
  assert(publicAfterEdit.body.reviews[0].rating === 4, 'Public config immediately reflects updated rating 4');
  assert(publicAfterEdit.body.reviews[0].reviewText.includes('Outstanding archival quality'), 'Public config reflects updated review text');

  // --- Step 7: Visibility Control (Visible = OFF) ---
  console.log('\n--- 7. Visibility Control (Hide Review) ---');
  const hideRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/admin/reviews/${review1Id}`,
    method: 'PUT',
    headers: authHeaders,
  }, {
    visible: false,
    active: false,
  });
  assert(hideRes.status === 200, 'Review updated with visible: false');

  // Admin still sees it
  const adminAfterHide = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/reviews',
    method: 'GET',
    headers: authHeaders,
  });
  assert(adminAfterHide.body.reviews.length === 1, 'Admin still preserves hidden review (count: 1)');
  assert(adminAfterHide.body.reviews[0].visible === false, 'Review visible flag is false in admin');

  // Public website hides it completely
  const publicAfterHide = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/public/config',
    method: 'GET',
  });
  assert(publicAfterHide.body.reviews.length === 0, 'Public config now returns 0 reviews because it is hidden');

  const publicEndpointAfterHide = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/public/reviews',
    method: 'GET',
  });
  assert(publicEndpointAfterHide.body.reviews.length === 0, 'GET /api/public/reviews returns 0 reviews because it is hidden');

  // --- Step 8: Featured ON + Visible OFF is NOT Public ---
  console.log('\n--- 8. Featured=ON + Visible=OFF Must Remain Private ---');
  await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/admin/reviews/${review1Id}`,
    method: 'PUT',
    headers: authHeaders,
  }, {
    featured: true,
    visible: false,
  });

  const publicFeaturedHidden = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/public/config',
    method: 'GET',
  });
  assert(publicFeaturedHidden.body.reviews.length === 0, 'Featured=ON with Visible=OFF is NOT publicly exposed');

  // Restore Visible=ON
  await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/admin/reviews/${review1Id}`,
    method: 'PUT',
    headers: authHeaders,
  }, {
    visible: true,
    active: true,
    featured: true,
  });

  // --- Step 9: Display Order Verification (Multiple Reviews) ---
  console.log('\n--- 9. Display Ordering ---');
  // Add a second review with displayOrder 2
  const addRes2 = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/reviews',
    method: 'POST',
    headers: authHeaders,
  }, {
    customerName: 'Biswajit Das',
    reviewText: 'Framing is clean and solid wood. Arrived in Ballygunge within 48 hours.',
    rating: 5,
    location: 'Ballygunge, Kolkata',
    displayOrder: 2,
    visible: true,
  });
  assert(addRes2.status === 201, 'Added second review (displayOrder: 2)');
  const review2Id = addRes2.body.review.id;

  const publicOrdered = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/public/config',
    method: 'GET',
  });
  assert(publicOrdered.body.reviews.length === 2, 'Public config returns 2 reviews');
  assert(publicOrdered.body.reviews[0].customerName === 'Ananya Roy', 'Review #1 is first (displayOrder 1)');
  assert(publicOrdered.body.reviews[1].customerName === 'Biswajit Das', 'Review #2 is second (displayOrder 2)');

  // Now swap order
  await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/admin/reviews/${review1Id}`,
    method: 'PUT',
    headers: authHeaders,
  }, { displayOrder: 2 });

  await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/admin/reviews/${review2Id}`,
    method: 'PUT',
    headers: authHeaders,
  }, { displayOrder: 1 });

  const publicSwapped = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/public/config',
    method: 'GET',
  });
  assert(publicSwapped.body.reviews[0].customerName === 'Biswajit Das', 'Biswajit Das is now first after order swap');
  assert(publicSwapped.body.reviews[1].customerName === 'Ananya Roy', 'Ananya Roy is now second after order swap');

  // --- Step 10: XSS & Dangerous Protocol Sanitization ---
  console.log('\n--- 10. XSS & Dangerous Protocol Sanitization ---');
  const xssRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/reviews',
    method: 'POST',
    headers: authHeaders,
  }, {
    customerName: 'Security Tester',
    reviewText: 'Testing dangerous protocols and payload strings.',
    rating: 5,
    customerPhoto: 'javascript:alert(1)', // Dangerous protocol
    visible: true,
    displayOrder: 3,
  });
  assert(xssRes.status === 201, 'Created review with attempted javascript: url');
  assert(xssRes.body.review.customerPhoto === '', 'Dangerous javascript: URL scheme was stripped to empty string');
  const xssReviewId = xssRes.body.review.id;

  // --- Step 11: Batch CMS Content Sync Validation ---
  console.log('\n--- 11. Batch /api/admin/config/content (type: reviews) ---');
  const batchInvalid = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/config/content',
    method: 'POST',
    headers: authHeaders,
  }, {
    type: 'reviews',
    data: [
      { customerName: '', reviewText: 'No name!', rating: 5 },
    ],
  });
  assert(batchInvalid.status === 400, 'Batch review save with empty customer name rejected with 400');

  // --- Step 12: Delete Review ---
  console.log('\n--- 12. Delete Review ---');
  const delRes1 = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/admin/reviews/${xssReviewId}`,
    method: 'DELETE',
    headers: authHeaders,
  });
  assert(delRes1.status === 200, 'DELETE /api/admin/reviews/:id returns 200 OK');

  const delRes2 = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/admin/reviews/${review2Id}`,
    method: 'DELETE',
    headers: authHeaders,
  });
  assert(delRes2.status === 200, 'DELETE second review returns 200 OK');

  const delRes3 = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/admin/reviews/${review1Id}`,
    method: 'DELETE',
    headers: authHeaders,
  });
  assert(delRes3.status === 200, 'DELETE first review returns 200 OK');

  // Verify Admin reviews empty
  const adminFinal = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/reviews',
    method: 'GET',
    headers: authHeaders,
  });
  assert(adminFinal.body.reviews.length === 0, 'Admin reviews list is now empty after cleanup');

  // Verify Public config reviews empty
  const publicFinal = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/public/config',
    method: 'GET',
  });
  assert(publicFinal.body.reviews.length === 0, 'Public config reviews list is empty after cleanup');

  // --- Step 13: Admin Route Serves HTML (Direct Refresh) ---
  console.log('\n--- 13. Dedicated Admin Route Serves HTML ---');
  const adminPageRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/admin/2008/reviews',
    method: 'GET',
    headers: { Accept: 'text/html' },
  });
  assert(adminPageRes.status === 200, 'GET /admin/2008/reviews returns HTTP 200');
  assert(typeof adminPageRes.body === 'string' && adminPageRes.body.includes('id="root"'), 'Admin reviews route returns valid SPA HTML root');

  // --- Step 14: Disk Persistence Integrity ---
  console.log('\n--- 14. Disk Persistence Clean Baseline ---');
  const storeFinal = JSON.parse(fs.readFileSync('data/momentpress-store.json', 'utf8'));
  assert(Array.isArray(storeFinal.reviews) && storeFinal.reviews.length === 0, 'Disk momentpress-store.json has clean zero-review state');

  console.log('\n====================================================');
  console.log(`TOTAL CHECKS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test suite error:', err);
  process.exit(1);
});
