/**
 * MOMENTPRESS STEP 6 AUDIT TEST SUITE: PRODUCTION READINESS & ARCHITECTURAL VERIFICATION
 */

import fs from 'fs';
import path from 'path';

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

function assert(condition, message) {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`[PASS] ${message}`);
  } else {
    failedChecks++;
    console.error(`[FAIL] ${message}`);
  }
}

async function request(endpoint, options = {}) {
  const url = `http://127.0.0.1:3000${endpoint}`;
  const res = await fetch(url, options);
  let body;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    body = await res.json();
  } else {
    body = await res.text();
  }
  return { status: res.status, headers: res.headers, body };
}

async function runStep6Audit() {
  console.log('====================================================');
  console.log('MOMENTPRESS STEP 6: PRODUCTION READINESS AUDIT');
  console.log('====================================================\n');

  // --- SECTION 1: Dead & Obsolete Code Removal Audit ---
  console.log('--- SECTION 1: Dead Code & Legacy Dependency Removal ---');
  const obsoletePaths = [
    'src/components/admin/views',
    'src/components/admin/ExpenseModal.tsx',
    'src/components/admin/OfflineOrderModal.tsx',
    'src/components/admin/ChangePasswordModal.tsx',
    'src/components/common/Button.tsx',
    'src/components/common/WhatsAppButton.tsx',
    'src/lib/business',
    'src/types/business.ts',
  ];

  for (const relPath of obsoletePaths) {
    const fullPath = path.resolve(process.cwd(), relPath);
    const exists = fs.existsSync(fullPath);
    assert(!exists, `Obsolete legacy path removed from codebase: ${relPath}`);
  }

  // Check no dangling BusinessService references in src
  const srcFiles = [];
  function collectSrcFiles(dir) {
    for (const f of fs.readdirSync(dir)) {
      const full = path.join(dir, f);
      if (fs.statSync(full).isDirectory()) collectSrcFiles(full);
      else if (full.endsWith('.ts') || full.endsWith('.tsx')) srcFiles.push(full);
    }
  }
  collectSrcFiles(path.resolve(process.cwd(), 'src'));

  let businessServiceImports = 0;
  for (const file of srcFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    if (content.includes('BusinessService') || content.includes('types/business')) {
      businessServiceImports++;
    }
  }
  assert(businessServiceImports === 0, `Zero BusinessService or types/business imports remain in src (found: ${businessServiceImports})`);

  // --- SECTION 2: Atomic Persistence & Backup Integrity ---
  console.log('\n--- SECTION 2: Atomic Persistence & Backup Integrity ---');
  const storePath = path.resolve(process.cwd(), 'data/momentpress-store.json');
  const backupPath = path.resolve(process.cwd(), 'data/momentpress-store.json.backup');

  assert(fs.existsSync(storePath), 'Main database store (momentpress-store.json) exists');
  assert(fs.existsSync(backupPath), 'Persistent backup store (momentpress-store.json.backup) exists');

  const mainStoreContent = JSON.parse(fs.readFileSync(storePath, 'utf-8'));
  const backupStoreContent = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));

  assert(typeof mainStoreContent === 'object' && mainStoreContent !== null, 'Main store contains valid parsed JSON object');
  assert(typeof backupStoreContent === 'object' && backupStoreContent !== null, 'Backup store contains valid parsed JSON object');
  assert(Array.isArray(mainStoreContent.products), 'Store contains products array');
  assert(Array.isArray(mainStoreContent.frameSizes), 'Store contains frameSizes array');
  assert(Array.isArray(mainStoreContent.qualityTiers), 'Store contains qualityTiers array');
  assert(Array.isArray(mainStoreContent.stickerSizes), 'Store contains stickerSizes array');

  // --- SECTION 3: Single Source of Truth for Contact & Social Details ---
  console.log('\n--- SECTION 3: Single Source of Truth for Contact & Social ---');
  const configRes = await request('/api/public/config');

  assert(configRes.status === 200, 'GET /api/public/config returns 200 OK');
  const settings = configRes.body.settings;
  assert(settings.phone === '6291681660', `Authoritative Phone is 6291681660 (got ${settings.phone})`);
  assert(settings.whatsappNumber === '7980855821', `Authoritative WhatsApp is 7980855821 (got ${settings.whatsappNumber})`);
  assert(settings.email === 'connect.rrstudio@gmail.com', `Authoritative Email is connect.rrstudio@gmail.com (got ${settings.email})`);
  assert(settings.instagramHandle === '@_rr.studio__', `Authoritative Instagram handle is @_rr.studio__ (got ${settings.instagramHandle})`);
  assert(settings.instagramUrl === 'https://www.instagram.com/_rr.studio__/', `Authoritative Instagram URL is https://www.instagram.com/_rr.studio__/ (got ${settings.instagramUrl})`);

  // --- SECTION 4: Production Build Verification ---
  console.log('\n--- SECTION 4: Production Build Bundle Verification ---');
  const distHtml = path.resolve(process.cwd(), 'dist/index.html');
  const distAssets = path.resolve(process.cwd(), 'dist/assets');
  assert(fs.existsSync(distHtml), 'dist/index.html generated');
  assert(fs.existsSync(distAssets), 'dist/assets directory generated');

  const assetFiles = fs.readdirSync(distAssets);
  const jsBundle = assetFiles.find((f) => f.endsWith('.js'));
  const cssBundle = assetFiles.find((f) => f.endsWith('.css'));

  assert(Boolean(jsBundle), `Production JS bundle generated (${jsBundle})`);
  assert(Boolean(cssBundle), `Production CSS bundle generated (${cssBundle})`);

  // --- SECTION 5: Summary ---
  console.log('\n====================================================');
  console.log(`TOTAL PRODUCTION AUDIT CHECKS: ${totalChecks} | PASSED: ${passedChecks} | FAILED: ${failedChecks}`);
  console.log('====================================================');

  if (failedChecks > 0) {
    process.exit(1);
  }
}

runStep6Audit().catch((e) => {
  console.error('Fatal audit error:', e);
  process.exit(1);
});
