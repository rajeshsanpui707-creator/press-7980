// Automated Step 2 Verification Script: CMS -> Public Website Synchronization & Single Source of Truth
import http from 'http';

const BASE_URL = 'http://localhost:3000';

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: data ? JSON.parse(data) : {} });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, rawBody: data });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runStep2Tests() {
  console.log('====================================================');
  console.log('MOMENTPRESS STEP 2: CMS -> PUBLIC WEBSITE SYNC TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, name, details = '') {
    if (condition) {
      console.log(`[PASS] ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name} ${details ? '- ' + details : ''}`);
      failed++;
    }
  }

  // 1. Admin Login to get token
  console.log('--- Step 1: Admin Authentication ---');
  const loginRes = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { username: 'admin', password: 'MomentPress@2026' }
  );

  assert(loginRes.status === 200 && loginRes.body.token, 'Admin login successfully retrieves auth token');
  const token = loginRes.body.token;

  // 2. Public Config Contact & Social Verification
  console.log('\n--- Step 2: Contact & Social Details in Public Config ---');
  const publicConfigRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/public/config',
    method: 'GET',
  });

  assert(publicConfigRes.status === 200, 'GET /api/public/config returns 200 OK');
  const settings = publicConfigRes.body.settings;
  assert(settings && settings.phone === '6291681660', `Call phone is 6291681660 (got ${settings?.phone})`);
  assert(settings && settings.whatsappNumber === '7980855821', `WhatsApp is 7980855821 (got ${settings?.whatsappNumber})`);
  assert(settings && settings.email === 'connect.rrstudio@gmail.com', `Email is connect.rrstudio@gmail.com (got ${settings?.email})`);
  assert(settings && settings.instagramHandle === '@_rr.studio__', `Instagram handle is @_rr.studio__ (got ${settings?.instagramHandle})`);

  // 3. Admin updates Contact info -> Verify immediate sync to Public Config
  console.log('\n--- Step 3: Admin Updates Contact Info & CMS Persistence ---');
  const updateContactRes = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/config/content',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
    {
      type: 'websiteSettings',
      data: {
        city: 'Kolkata Central Studio',
      },
    }
  );
  assert(updateContactRes.status === 200, 'Admin updates websiteSettings successfully');

  const verifyContactRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/public/config',
    method: 'GET',
  });
  assert(verifyContactRes.body.settings.city === 'Kolkata Central Studio', 'Public config immediately reflects updated city');

  // Restore city back
  await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/config/content',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
    { type: 'websiteSettings', data: { city: 'Kolkata' } }
  );

  // 4. Frame Price Modification & Order Price Sync
  console.log('\n--- Step 4: Admin Changes Frame Price -> Public Config & Order Engine ---');
  // First, get current frameSizes
  const currentFrameSizes = publicConfigRes.body.frameSizes;
  const targetFrame = currentFrameSizes.find((f) => f.name === '5×7 in' || f.id === '5x7');
  const originalBasePrice = targetFrame.originalPrice || 199;
  const newTestPrice = 289;

  const updateFrameSizes = currentFrameSizes.map((f) =>
    f.id === targetFrame.id ? { ...f, originalPrice: newTestPrice, basePrice: newTestPrice, discountActive: false } : f
  );

  const savePricingRes = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/config/pricing',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
    { type: 'frameSizes', items: updateFrameSizes }
  );
  assert(savePricingRes.status === 200, 'Admin modifies 5x7 frame price to ₹289');

  const afterFramePriceConfig = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/public/config',
    method: 'GET',
  });
  const updatedFrame = afterFramePriceConfig.body.frameSizes.find((f) => f.id === targetFrame.id);
  assert(updatedFrame && updatedFrame.sellingPrice === 289, `Public config reflects new frame price ₹289 (got ₹${updatedFrame?.sellingPrice})`);

  // Submit public order with tampered client price of ₹50 -> server must charge ₹289!
  const orderRes = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/public/orders',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      customerName: 'Step2 Test Customer',
      mobileNumber: '9830123456',
      address: '42 Park Street',
      city: 'Kolkata',
      pincode: '700016',
      product: 'Custom Photo Frames',
      size: '5×7 in',
      quality: 'Standard Luster',
      quantity: 1,
      unitPrice: 50, // client tampered price!
    }
  );
  assert(orderRes.status === 201, 'Order created successfully');
  assert(orderRes.body.order.finalAmount === 289, `Server pricing charges CMS ₹289, ignoring tampered ₹50 (charged ₹${orderRes.body.order.finalAmount})`);

  // Restore original frame price
  const restoredFrameSizes = currentFrameSizes.map((f) =>
    f.id === targetFrame.id ? { ...f, originalPrice: originalBasePrice, basePrice: originalBasePrice, discountActive: false } : f
  );
  await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/config/pricing',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
    { type: 'frameSizes', items: restoredFrameSizes }
  );

  // 5. Sticker Price Modification
  console.log('\n--- Step 5: Admin Changes Sticker Price -> Public Config & Order Engine ---');
  const currentStickers = publicConfigRes.body.stickerSizes;
  const targetSticker = currentStickers.find((s) => s.id === 'Small');
  const updatedStickers = currentStickers.map((s) =>
    s.id === 'Small' ? { ...s, originalPrice: 129, price: 129, discountActive: false } : s
  );

  await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/config/pricing',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
    { type: 'stickerSizes', items: updatedStickers }
  );

  const afterStickerConfig = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/public/config',
    method: 'GET',
  });
  const smallSticker = afterStickerConfig.body.stickerSizes.find((s) => s.id === 'Small');
  assert(smallSticker && smallSticker.sellingPrice === 129, `Public config reflects updated Small sticker price ₹129 (got ₹${smallSticker?.sellingPrice})`);

  // Restore sticker price back to 99
  const restoredStickers = currentStickers.map((s) =>
    s.id === 'Small' ? { ...s, originalPrice: 99, price: 99, discountActive: false } : s
  );
  await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/config/pricing',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
    { type: 'stickerSizes', items: restoredStickers }
  );

  // 6. Homepage Hero & Sections Order / Visibility Sync
  console.log('\n--- Step 6: Homepage Hero & Section Visibility / Order ---');
  const newHeroHeading = 'Handcrafted Memories For Kolkata Homes';
  const newHookBadge = 'Special Festive Launch Offer';

  const updateHeroRes = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/config/content',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
    {
      type: 'homepageHero',
      data: {
        heading: newHeroHeading,
        subheading: 'Custom frames and vinyl stickers.',
        hookBadgeText: newHookBadge,
        ctaText: 'Start Customizing Now',
        ctaLink: '#products',
        secondaryCtaText: 'View Designs',
        secondaryCtaLink: '#existing-designs',
        visible: true,
      },
    }
  );
  assert(updateHeroRes.status === 200, 'Admin saves homepageHero config');

  // Hide the "reviews" section and reorder sections
  const currentSections = publicConfigRes.body.homepageSections;
  const updatedSections = currentSections.map((s) => {
    if (s.id === 'reviews') return { ...s, visible: false };
    if (s.id === 'faq') return { ...s, displayOrder: 2 };
    if (s.id === 'trust') return { ...s, displayOrder: 7 };
    return s;
  });

  const updateSectionsRes = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/config/content',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
    { type: 'homepageSections', data: updatedSections }
  );
  assert(updateSectionsRes.status === 200, 'Admin saves homepageSections (hides reviews, reorders FAQ/trust)');

  const afterHomepageConfig = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/public/config',
    method: 'GET',
  });
  assert(afterHomepageConfig.body.homepageHero.heading === newHeroHeading, 'Public config returns updated hero heading');
  assert(afterHomepageConfig.body.homepageHero.hookBadgeText === newHookBadge, 'Public config returns updated hook badge text');

  const reviewsSection = afterHomepageConfig.body.homepageSections.find((s) => s.id === 'reviews');
  assert(reviewsSection && reviewsSection.visible === false, 'Public config reflects reviews section marked visible: false');

  const faqSection = afterHomepageConfig.body.homepageSections.find((s) => s.id === 'faq');
  assert(faqSection && faqSection.displayOrder === 2, 'Public config reflects FAQ section reordered to displayOrder 2');

  // Restore sections and hero back
  await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/config/content',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
    {
      type: 'homepageSections',
      data: currentSections.map((s) => ({ ...s, visible: true })),
    }
  );
  await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/config/content',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
    {
      type: 'homepageHero',
      data: {
        heading: 'Your memory, beautifully framed.',
        subheading: 'Turn your favorite moments into beautiful personalized frames and photo products.',
        hookBadgeText: 'Starting from just ₹99',
        ctaText: 'Create Your Frame',
        ctaLink: '#products',
        secondaryCtaText: 'Existing Designs',
        secondaryCtaLink: '#existing-designs',
        visible: true,
      },
    }
  );

  // 7. Existing Designs with Google Drive Link
  console.log('\n--- Step 7: Existing Designs with Google Drive Link & Active Toggle ---');
  const testDesign = {
    id: `test-gdrive-${Date.now()}`,
    title: 'Victoria Memorial Golden Sunset',
    name: 'Victoria Memorial Golden Sunset',
    category: 'Architecture & Street',
    size: '8×10 in',
    finish: 'warm-walnut',
    driveUrl: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/view?usp=sharing',
    googleDriveLink: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/view?usp=sharing',
    image: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/view?usp=sharing',
    description: 'Printed on Studio Velvet archival paper with natural wood frame.',
    shortDescription: 'Printed on Studio Velvet archival paper with natural wood frame.',
    active: true,
    displayOrder: 1,
  };

  const currentDesigns = publicConfigRes.body.existingDesigns || [];
  const addDesignRes = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/config/content',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
    { type: 'existingDesigns', data: [testDesign, ...currentDesigns] }
  );
  assert(addDesignRes.status === 200, 'Admin adds design with Google Drive link');

  const afterAddDesignConfig = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/public/config',
    method: 'GET',
  });
  const foundDesign = afterAddDesignConfig.body.existingDesigns.find((d) => d.id === testDesign.id);
  assert(foundDesign && foundDesign.title === testDesign.title, 'Newly added Google Drive design is returned in public config');
  assert(foundDesign && foundDesign.driveUrl.includes('drive.google.com'), 'Google Drive URL is preserved');

  // Deactivate design -> must disappear from public config immediately
  const deactivatedList = [
    { ...testDesign, active: false },
    ...currentDesigns,
  ];
  await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/config/content',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
    { type: 'existingDesigns', data: deactivatedList }
  );

  const afterDeactivateConfig = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/public/config',
    method: 'GET',
  });
  const hiddenDesign = afterDeactivateConfig.body.existingDesigns.find((d) => d.id === testDesign.id);
  assert(!hiddenDesign, 'Deactivated design is immediately removed from public config');

  // Restore designs list back
  await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/config/content',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
    { type: 'existingDesigns', data: currentDesigns }
  );

  // 8. FAQ Modification & Synchronization
  console.log('\n--- Step 8: FAQ Item Synchronization ---');
  const currentFaqs = publicConfigRes.body.faqs || [];
  const testFaq = {
    id: `faq-test-${Date.now()}`,
    question: 'Can I request delivery in Howrah or Salt Lake?',
    answer: 'Yes! We deliver across Kolkata, Salt Lake, New Town, and Howrah within 24 to 48 hours.',
    active: true,
    displayOrder: 1,
  };

  await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/config/content',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
    { type: 'faqs', data: [testFaq, ...currentFaqs] }
  );

  const afterFaqConfig = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/public/config',
    method: 'GET',
  });
  const foundFaq = afterFaqConfig.body.faqs.find((f) => f.id === testFaq.id);
  assert(foundFaq && foundFaq.question === testFaq.question, 'New FAQ item is immediately present in public config');

  // Restore FAQs
  await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/config/content',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
    { type: 'faqs', data: currentFaqs }
  );

  // 9. Public Config Security (No Administrative Leaks)
  console.log('\n--- Step 9: Public Config Security Audit ---');
  const secAudit = afterFaqConfig.body;
  assert(secAudit.onlineOrders === undefined, 'No onlineOrders exposed in public config');
  assert(secAudit.offlineSales === undefined, 'No offlineSales exposed in public config');
  assert(secAudit.customers === undefined, 'No customers exposed in public config');
  assert(secAudit.inventory === undefined, 'No inventory records exposed in public config');
  assert(secAudit.purchases === undefined, 'No purchase records exposed in public config');
  assert(secAudit.expenses === undefined, 'No expenses records exposed in public config');
  assert(secAudit.adminCredentials === undefined, 'No credentials exposed in public config');
  assert(secAudit.sessions === undefined, 'No sessions exposed in public config');

  // 10. Step 1 Non-Regression Checks
  console.log('\n--- Step 10: Step 1 Non-Regression Checks ---');
  const validOrderRes = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/public/orders',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      customerName: 'Regression Check User',
      mobileNumber: '9830123456',
      address: '77 Sarat Bose Road',
      city: 'Kolkata',
      pincode: '700025',
      product: 'Custom Photo Frames',
      size: '6×8 in',
      quality: 'Velvet Fine Art',
      quantity: 2,
      requirements: 'Special anniversary framing note',
    }
  );
  assert(validOrderRes.status === 201, 'Order submitted successfully (201 Created)');
  assert(validOrderRes.body.order.id.startsWith('MP-'), 'Server generated MP- sequential order ID');
  assert(validOrderRes.body.order.unitPrice === 299, 'Server calculated unit price ₹299 (249 + 50 Velvet)');
  assert(validOrderRes.body.order.finalAmount === 598, 'Server calculated final amount ₹598 (299 × 2)');
  assert(validOrderRes.body.order.requirements === 'Special anniversary framing note', 'Customer requirements persisted');

  // Input validation rejection
  const invalidOrderRes = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/public/orders',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      customerName: 'A', // too short
      mobileNumber: '123', // invalid
      address: '',
      pincode: '00',
      product: 'Custom Photo Frames',
      size: '5x7',
      quality: 'Standard',
      quantity: 1,
    }
  );
  assert(invalidOrderRes.status === 400, 'Invalid customer input correctly rejected with 400');

  console.log('\n====================================================');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runStep2Tests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
