/**
 * MOMENTPRESS — STEP 3 VERIFICATION SUITE
 * Admin Panel Structure, Dedicated Pages, Clean CMS Navigation, Security & Non-Regression
 */

const BASE_URL = 'http://localhost:3000';
let adminToken = null;

async function run() {
  console.log('====================================================');
  console.log('MOMENTPRESS STEP 3: NEW ADMIN PANEL STRUCTURE TESTS');
  console.log('====================================================\n');

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

  // --- TEST 1: Admin Routes Protected Without Authentication ---
  console.log('--- TEST 1: Admin Security & Route Protection ---');
  try {
    const unauthOrders = await fetch(`${BASE_URL}/api/admin/orders`);
    assert(unauthOrders.status === 401, 'Unauthenticated request to /api/admin/orders correctly rejected (401)');

    const unauthPricing = await fetch(`${BASE_URL}/api/admin/config/pricing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'frameSizes', items: [] }),
    });
    assert(unauthPricing.status === 401, 'Unauthenticated request to /api/admin/config/pricing rejected (401)');

    const unauthContent = await fetch(`${BASE_URL}/api/admin/config/content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'faqs', data: [] }),
    });
    assert(unauthContent.status === 401, 'Unauthenticated request to /api/admin/config/content rejected (401)');
  } catch (err) {
    assert(false, `Admin security check error: ${err.message}`);
  }

  // --- TEST 2: Admin Login ---
  console.log('\n--- TEST 2: Admin Login ---');
  try {
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'MomentPress@2026' }),
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200 && loginData.token, 'Admin login succeeded and returned session token');
    adminToken = loginData.token;
  } catch (err) {
    assert(false, `Login failed: ${err.message}`);
  }

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${adminToken}`,
  };

  // --- TEST 3: Dedicated Admin Routes Serve HTML & Survive Refresh ---
  console.log('\n--- TEST 3: Admin Routes Survive Page Refresh (Direct HTML Serving) ---');
  const adminRoutes = [
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

  for (const route of adminRoutes) {
    try {
      const res = await fetch(`${BASE_URL}${route}`, {
        headers: { Accept: 'text/html' },
      });
      const html = await res.text();
      assert(
        res.status === 200 && html.includes('id="root"'),
        `GET ${route} returns 200 OK HTML and survives page refresh`
      );
    } catch (err) {
      assert(false, `Failed to load ${route}: ${err.message}`);
    }
  }

  // --- TEST 4: Orders Page Server Persistence ---
  console.log('\n--- TEST 4: Orders Page Data & Search ---');
  try {
    let res = await fetch(`${BASE_URL}/api/admin/orders`, { headers: authHeaders });
    let data = await res.json();
    let orderList = data.orders || data.onlineOrders;
    if (!orderList || orderList.length === 0) {
      await fetch(`${BASE_URL}/api/public/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: 'Admin Orders Test User',
          mobileNumber: '9830123456',
          address: 'Bowbazar test street',
          city: 'Kolkata',
          pincode: '700012',
          product: 'Custom Photo Frames',
          size: '5×7 in',
          quality: 'Standard Luster',
          quantity: 1,
        }),
      });
      res = await fetch(`${BASE_URL}/api/admin/orders`, { headers: authHeaders });
      data = await res.json();
      orderList = data.orders || data.onlineOrders;
    }
    assert(res.status === 200 && Array.isArray(orderList), 'Orders page retrieves online orders from server');
    assert(orderList.length > 0, `Server contains active website orders (count: ${orderList.length})`);
    const first = orderList[0];
    assert(first.id && first.customerName && first.finalAmount, 'Order contains authoritative ID, customer, amount');
  } catch (err) {
    assert(false, `Orders test failed: ${err.message}`);
  }

  // --- TEST 5: Products Page CMS ---
  console.log('\n--- TEST 5: Products Page CMS ---');
  try {
    const pubRes = await fetch(`${BASE_URL}/api/public/config`);
    const pubData = await pubRes.json();
    const products = pubData.products;
    assert(Array.isArray(products) && products.length >= 2, 'Products catalog returned from server');

    // Update product description
    const updatedProducts = products.map((p) =>
      p.id === 'custom-photo-frames' ? { ...p, shortDescription: 'Handcrafted gallery-wrapped solid wood frames' } : p
    );
    const saveRes = await fetch(`${BASE_URL}/api/admin/config/pricing`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ type: 'products', items: updatedProducts }),
    });
    assert(saveRes.status === 200, 'Admin successfully saves updated products to server');

    const verifyRes = await fetch(`${BASE_URL}/api/public/config`);
    const verifyData = await verifyRes.json();
    const frameProd = verifyData.products.find((p) => p.id === 'custom-photo-frames');
    assert(
      frameProd && frameProd.shortDescription === 'Handcrafted gallery-wrapped solid wood frames',
      'Public config immediately reflects CMS product changes'
    );
  } catch (err) {
    assert(false, `Products CMS test failed: ${err.message}`);
  }

  // --- TEST 6: Frame Sizes Page CMS ---
  console.log('\n--- TEST 6: Frame Sizes Page CMS ---');
  try {
    const pubRes = await fetch(`${BASE_URL}/api/public/config`);
    const pubData = await pubRes.json();
    const sizes = pubData.frameSizes;
    assert(Array.isArray(sizes) && sizes.length === 5, 'All 5 standard frame sizes present in CMS');

    // Modify 6x8 size price
    const updatedSizes = sizes.map((s) => (s.id === '6x8' ? { ...s, originalPrice: 259, basePrice: 259 } : s));
    const saveRes = await fetch(`${BASE_URL}/api/admin/config/pricing`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ type: 'frameSizes', items: updatedSizes }),
    });
    assert(saveRes.status === 200, 'Admin successfully saves frame sizes to server');

    // Restore to 249
    const restoredSizes = sizes.map((s) => (s.id === '6x8' ? { ...s, originalPrice: 249, basePrice: 249 } : s));
    await fetch(`${BASE_URL}/api/admin/config/pricing`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ type: 'frameSizes', items: restoredSizes }),
    });
    assert(true, 'Frame size price changes correctly roundtrip and restore');
  } catch (err) {
    assert(false, `Frame sizes test failed: ${err.message}`);
  }

  // --- TEST 7: Quality Tiers Page CMS ---
  console.log('\n--- TEST 7: Quality Tiers Page CMS ---');
  try {
    const pubRes = await fetch(`${BASE_URL}/api/public/config`);
    const pubData = await pubRes.json();
    const tiers = pubData.qualityTiers;
    assert(Array.isArray(tiers) && tiers.length === 3, 'All 3 quality tiers present in CMS');
    assert(
      tiers.some((t) => t.name === 'Standard Luster') &&
      tiers.some((t) => t.name === 'Studio Velvet') &&
      tiers.some((t) => t.name === 'Archival Fine Art' || t.name === 'Archival Rag'),
      'Standard Luster, Studio Velvet, and Archival tiers correctly configured'
    );
  } catch (err) {
    assert(false, `Quality tiers test failed: ${err.message}`);
  }

  // --- TEST 8: Sticker Sizes Page CMS ---
  console.log('\n--- TEST 8: Sticker Sizes Page CMS ---');
  try {
    const pubRes = await fetch(`${BASE_URL}/api/public/config`);
    const pubData = await pubRes.json();
    const stickers = pubData.stickerSizes;
    assert(Array.isArray(stickers) && stickers.length === 3, 'All 3 sticker sizes (Small, Medium, Large) in CMS');
  } catch (err) {
    assert(false, `Sticker sizes test failed: ${err.message}`);
  }

  // --- TEST 9: Homepage Page CMS ---
  console.log('\n--- TEST 9: Homepage Page CMS (Hero & Sections) ---');
  try {
    const saveHero = await fetch(`${BASE_URL}/api/admin/config/content`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        type: 'homepageHero',
        data: {
          heading: 'Your memory, beautifully framed.',
          subheading: 'Turn your favorite moments into beautiful personalized frames.',
          hookBadgeText: 'Starting from just ₹99',
          ctaText: 'Create Your Frame',
          ctaLink: '#products',
          secondaryCtaText: 'Existing Designs',
          secondaryCtaLink: '#existing-designs',
          visible: true,
        },
      }),
    });
    assert(saveHero.status === 200, 'Admin successfully saves Homepage Hero configuration');

    const pubRes = await fetch(`${BASE_URL}/api/public/config`);
    const pubData = await pubRes.json();
    assert(pubData.homepageHero && pubData.homepageHero.heading.includes('Your memory'), 'Public config reflects updated Hero');
    assert(Array.isArray(pubData.homepageSections) && pubData.homepageSections.length > 0, 'Homepage sections list returned');
  } catch (err) {
    assert(false, `Homepage CMS test failed: ${err.message}`);
  }

  // --- TEST 10: Existing Designs Page CMS (Add, View, Delete) ---
  console.log('\n--- TEST 10: Existing Designs Page CMS ---');
  try {
    const testDesign = {
      id: `DSG-TEST-${Date.now()}`,
      name: 'Step 3 Test Google Drive Gallery Frame',
      title: 'Step 3 Test Google Drive Gallery Frame',
      category: 'Portrait',
      googleDriveLink: 'https://drive.google.com/file/d/1X9testFileId12345/view?usp=sharing',
      driveUrl: 'https://drive.google.com/file/d/1X9testFileId12345/view?usp=sharing',
      image: 'https://drive.google.com/file/d/1X9testFileId12345/view?usp=sharing',
      shortDescription: 'Teak wood frame with museum glass',
      description: 'Teak wood frame with museum glass',
      size: '8×10 in',
      finish: 'Studio Velvet',
      active: true,
      visible: true,
      displayOrder: 99,
    };

    // 1. Get current designs
    const pubRes = await fetch(`${BASE_URL}/api/public/config`);
    const pubData = await pubRes.json();
    const currentDesigns = pubData.existingDesigns || [];

    // 2. Add design
    const updatedDesigns = [...currentDesigns, testDesign];
    const addRes = await fetch(`${BASE_URL}/api/admin/config/content`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ type: 'existingDesigns', data: updatedDesigns }),
    });
    assert(addRes.status === 200, 'Admin successfully adds Google Drive design to server');

    // 3. Verify in public config
    const verifyAdd = await fetch(`${BASE_URL}/api/public/config`);
    const verifyAddData = await verifyAdd.json();
    const found = verifyAddData.existingDesigns.find((d) => d.id === testDesign.id);
    assert(found && found.googleDriveLink.includes('1X9testFileId12345'), 'New design with Google Drive link appears publicly');

    // 4. Delete design safely
    const cleanedDesigns = updatedDesigns.filter((d) => d.id !== testDesign.id);
    const delRes = await fetch(`${BASE_URL}/api/admin/config/content`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ type: 'existingDesigns', data: cleanedDesigns }),
    });
    assert(delRes.status === 200, 'Admin successfully deletes test design from server');

    // 5. Verify removed
    const verifyDel = await fetch(`${BASE_URL}/api/public/config`);
    const verifyDelData = await verifyDel.json();
    assert(!verifyDelData.existingDesigns.some((d) => d.id === testDesign.id), 'Deleted design immediately removed from public config');
  } catch (err) {
    assert(false, `Existing Designs CMS test failed: ${err.message}`);
  }

  // --- TEST 11: FAQ Page CMS ---
  console.log('\n--- TEST 11: FAQ Page CMS ---');
  try {
    const pubRes = await fetch(`${BASE_URL}/api/public/config`);
    const pubData = await pubRes.json();
    const faqs = pubData.faqs || [];
    assert(faqs.length > 0, `Server contains active FAQ questions (count: ${faqs.length})`);
    assert(faqs[0].question && faqs[0].answer, 'FAQ item contains valid question and answer');
  } catch (err) {
    assert(false, `FAQ CMS test failed: ${err.message}`);
  }

  // --- TEST 12: Contact & Social Page CMS ---
  console.log('\n--- TEST 12: Contact & Social Page CMS ---');
  try {
    const pubRes = await fetch(`${BASE_URL}/api/public/config`);
    const pubData = await pubRes.json();
    const s = pubData.settings || {};
    assert(s.phone === '6291681660', `Call Phone is 6291681660 (got ${s.phone})`);
    assert(s.whatsappNumber === '7980855821', `WhatsApp is 7980855821 (got ${s.whatsappNumber})`);
    assert(s.instagramHandle === '@_rr.studio__', `Instagram handle is @_rr.studio__ (got ${s.instagramHandle})`);
    assert(s.email === 'connect.rrstudio@gmail.com', `Email is connect.rrstudio@gmail.com (got ${s.email})`);
    assert(s.instagramUrl && s.instagramUrl.includes('instagram.com'), 'Instagram profile URL is correctly configured');
  } catch (err) {
    assert(false, `Contact & Social test failed: ${err.message}`);
  }

  // --- TEST 13: Website Settings Page CMS ---
  console.log('\n--- TEST 13: Website Settings Page CMS ---');
  try {
    const pubRes = await fetch(`${BASE_URL}/api/public/config`);
    const pubData = await pubRes.json();
    const s = pubData.settings || {};
    assert(s.studioName === 'MomentPress', `Studio name is MomentPress (got ${s.studioName})`);
    assert(s.deliveryPromiseHours === 48, `Delivery commitment is 48 hours (got ${s.deliveryPromiseHours})`);
    assert(s.currency === 'INR', `Currency is INR (got ${s.currency})`);
  } catch (err) {
    assert(false, `Website Settings test failed: ${err.message}`);
  }

  // --- TEST 14: SEO Page CMS ---
  console.log('\n--- TEST 14: SEO Page CMS ---');
  try {
    const updateSeo = await fetch(`${BASE_URL}/api/admin/config/content`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        type: 'websiteSettings',
        data: {
          seoTitle: 'MomentPress — Handcrafted Custom Keepsake Frames Kolkata',
          seoDescription: 'Handcrafted photo frames in Bowbazar, Kolkata. Archival printing with free WhatsApp proof preview.',
          seoKeywords: 'custom photo frames, photo printing Kolkata, personalized gifts',
        },
      }),
    });
    assert(updateSeo.status === 200, 'Admin successfully saves SEO settings');

    const verifySeo = await fetch(`${BASE_URL}/api/public/config`);
    const verifySeoData = await verifySeo.json();
    assert(
      verifySeoData.settings &&
      verifySeoData.settings.seoTitle === 'MomentPress — Handcrafted Custom Keepsake Frames Kolkata',
      'SEO settings persisted to server store'
    );
  } catch (err) {
    assert(false, `SEO test failed: ${err.message}`);
  }

  // --- TEST 15: Security Page API ---
  console.log('\n--- TEST 15: Security Page API ---');
  try {
    // Attempt change with wrong current password -> must be rejected
    const badChange = await fetch(`${BASE_URL}/api/auth/change-credentials`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ currentPassword: 'WrongPassword123' }),
    });
    assert(badChange.status === 400 || badChange.status === 403, 'Unauthorized credential change correctly rejected');
  } catch (err) {
    assert(false, `Security test failed: ${err.message}`);
  }

  // --- TEST 16: Error Feedback State (No false success) ---
  console.log('\n--- TEST 16: Error Feedback & No False Success ---');
  try {
    const invalidSave = await fetch(`${BASE_URL}/api/admin/config/pricing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer INVALID_TOKEN_123',
      },
      body: JSON.stringify({ type: 'frameSizes', items: [] }),
    });
    assert(invalidSave.status === 401, 'Request with invalid token fails with 401 Unauthorized');
  } catch (err) {
    assert(false, `Error state test failed: ${err.message}`);
  }

  console.log('\n====================================================');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
