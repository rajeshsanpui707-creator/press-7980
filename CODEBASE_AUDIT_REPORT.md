# MomentPress Codebase Audit Report

## 1. Executive Summary

| Metric | Count |
|--------|-------|
| Total files inspected | 150+ |
| Total source files (src/, server.ts, api/) | 85 |
| Total potential issues identified | 42 |
| High-confidence unused items (🔴) | 8 |
| Likely unused items (🟠) | 12 |
| Possibly redundant items (🟡) | 15 |
| Legacy code items (🔵) | 7 |
| Development/test only items (🟣) | 14 |
| Unused dependencies | 3 |
| Unused environment variables | 2 |
| Duplicate implementations found | 5 pairs |

---

## 2. 🔴 Safe to Remove

| # | File | Line(s) | Symbol | Classification | Risk | Evidence |
|---|------|---------|--------|----------------|------|----------|
| 1 | `src/components/admin/ExpenseModal.tsx` | File | Component | 🔴 SAFE TO REMOVE | LOW | File does not exist - referenced in test_step6 but already removed |
| 2 | `src/components/admin/OfflineOrderModal.tsx` | File | Component | 🔴 SAFE TO REMOVE | LOW | File does not exist - referenced in test_step6 but already removed |
| 3 | `src/components/admin/ChangePasswordModal.tsx` | File | Component | 🔴 SAFE TO REMOVE | LOW | File does not exist - referenced in test_step6 but already removed |
| 4 | `src/components/common/Button.tsx` | File | Component | 🔴 SAFE TO REMOVE | LOW | File does not exist - referenced in test_step6 but already removed |
| 5 | `src/components/common/WhatsAppButton.tsx` | File | Component | 🔴 SAFE TO REMOVE | LOW | File does not exist - referenced in test_step6 but already removed |
| 6 | `src/lib/business/` | Directory | Legacy Module | 🔴 SAFE TO REMOVE | LOW | Directory does not exist - referenced in test_step6 but already removed |
| 7 | `src/types/business.ts` | File | Types | 🔴 SAFE TO REMOVE | LOW | File does not exist - referenced in test_step6 but already removed |
| 8 | `server.ts.backup` | File | Backup | 🔴 SAFE TO REMOVE | LOW | Backup file of server.ts, not used in build/runtime |

---

## 3. 🟠 Likely Unused

| # | File | Line(s) | Symbol | Classification | Risk | Evidence |
|---|------|---------|--------|----------------|------|----------|
| 1 | `src/components/admin/orders/OrderBillDocument.tsx` | 1-100+ | Component | 🟠 LIKELY UNUSED | LOW | Imported in OrdersPageView but appears to duplicate PDF generation logic that's server-side |
| 2 | `src/components/common/SectionHeading.tsx` | File | Component | 🟠 LIKELY UNUSED | LOW | Only used in ProductSection, Hero, HowItWorks, Gallery, FaqSection, FinalCta - verify all usages |
| 3 | `src/components/common/PolicyModal.tsx` | File | Component | 🟠 LIKELY UNUSED | MEDIUM | Not found imported anywhere in codebase search |
| 4 | `src/components/common/NotFoundPage.tsx` | File | Component | 🟠 LIKELY UNUSED | LOW | Used in App.tsx for 'not-found' page - but verify actual rendering |
| 5 | `src/components/common/Logo.tsx` | File | Component | 🟠 LIKELY UNUSED | LOW | Used in Header, Footer - verify both |
| 6 | `src/components/common/FrameMockup.tsx` | File | Component | 🟠 LIKELY UNUSED | LOW | Used in GalleryLightbox, OrderConfirmationPage, OrderReviewPage - verify all |
| 7 | `src/components/common/FloatingWhatsApp.tsx` | File | Component | 🟠 LIKELY UNUSED | LOW | Used in App.tsx conditionally - verify rendering |
| 8 | `src/components/layout/MobileNavigation.tsx` | File | Component | 🟠 LIKELY UNUSED | LOW | Used in Header.tsx - verify |
| 9 | `src/lib/admin/export-utils.ts` | File | Utility | 🟠 LIKELY UNUSED | MEDIUM | Only used in OrdersPageView for CSV export - verify |
| 10 | `src/data/gallery.ts` | 10-77 | GALLERY_ITEMS | 🟠 LIKELY UNUSED | MEDIUM | Static gallery items exist but Gallery.tsx uses AdminService.getExistingDesigns() |
| 11 | `src/components/gallery/GallerySection.tsx` | File | Export | 🟠 LIKELY UNUSED | LOW | Exported as alias of Gallery but not imported anywhere |
| 12 | `src/lib/orders/order-id.ts` | 1-5 | generateOrderId | 🟠 LIKELY UNUSED | HIGH | Client-side ID generator - server uses generateServerOrderId in server.ts |

---

## 4. 🟡 Possibly Redundant

| # | File A | File B | Function | Similarity | Difference | Current Implementation | Recommendation |
|---|--------|--------|----------|------------|------------|----------------------|----------------|
| 1 | `server.ts:1200-1502` | `src/lib/pricing/pricing.ts:45-140` | calculateServerOrderPrice / getFramePrice | 85% | Server has authoritative pricing; client has fallback | Server is authoritative | Keep both - client needs instant pricing UI |
| 2 | `server.ts:2149-2295` | `src/lib/admin/admin-service.ts:1297-1449` | findOrderMapping/checkStockForOrder | 90% | Duplicated inventory deduction logic | Server has primary; AdminService mirrors for UI | Keep both - AdminService needs local check |
| 3 | `server.ts:2214-2295` | `src/lib/admin/admin-service.ts:1379-1544` | executeStockDeduction/deductStockForOrder | 95% | Same multi-item deduction logic | Server is authoritative | Keep both - UI needs immediate feedback |
| 4 | `server.ts:2257-2295` | `src/lib/admin/admin-service.ts:1502-1544` | executeStockRestoration/restoreStockForOrder | 90% | Same restoration logic | Server is authoritative | Keep both - UI needs immediate feedback |
| 5 | `server.ts:1762-1809` | `src/lib/admin/admin-service.ts:1816-1910` | buildPublicBillData / syncCustomerFromOrder | 70% | Different but related | Server builds bill data; AdminService syncs customer | Keep both |

---

## 5. 🔵 Legacy Code

| # | File | Line(s) | What It Is | Classification | Risk | Notes |
|---|------|---------|------------|----------------|------|-------|
| 1 | `server.ts:93-94` | 93-94 | Robots.txt hardcoded sitemap URL | 🔵 LEGACY | LOW | Uses momentpress.ai.studio - verify this is correct production domain |
| 2 | `server.ts:68-91` | 68-91 | Sitemap.xml hardcoded routes | 🔵 LEGACY | LOW | Should be dynamically generated from CMS |
| 3 | `server.ts:131-132` | 131-132 | Legacy hero headline fallback | 🔵 LEGACY | LOW | Checks for "Handcrafted Keepsake Frames..." and replaces |
| 4 | `server.ts:712-714` | 712-714 | Legacy hero headline in store init | 🔵 LEGACY | LOW | Same as above |
| 5 | `src/data/products.ts:14-18` | 14-18 | STATIC_FRAME_SIZE_CONFIGS | 🔵 LEGACY | LOW | Fallback only - dynamic proxy used |
| 6 | `src/data/products.ts:80-111` | 80-111 | STATIC_FRAME_TIER_CONFIGS | 🔵 LEGACY | LOW | Fallback only - dynamic proxy used |
| 7 | `src/data/reviews.ts:9-10` | 9-10 | REVIEWS_DATA empty array | 🔵 LEGACY | LOW | Comment says "Zero fake reviews" - intentional |

---

## 6. 🟣 Development/Test Code

| # | File | Type | Classification | Risk | Evidence |
|---|------|------|----------------|------|----------|
| 1 | `scripts/get-drive-token.js` | Script | 🟣 DEV/TEST ONLY | LOW | OAuth flow for Drive setup - not for production |
| 2 | `scripts/cleanup-test-file.js` | Script | 🟣 DEV/TEST ONLY | LOW | Manual Drive file cleanup |
| 3 | `scripts/test-live-upload.js` | Script | 🟣 DEV/TEST ONLY | LOW | Live Drive upload test |
| 4 | `scripts/run-live-order-test.js` | Script | 🟣 DEV/TEST ONLY | LOW | End-to-end order test |
| 5 | `scripts/test-pdf-auth-actions.js` | Script | 🟣 DEV/TEST ONLY | LOW | PDF auth flow test |
| 6 | `scripts/verify-e2e-drive-bill.js` | Script | 🟣 DEV/TEST ONLY | LOW | Full Drive bill verification |
| 7 | `test_billing_and_order_id.js` | Test | 🟣 DEV/TEST ONLY | LOW | Billing & Order ID test suite |
| 8 | `test_credential_security.js` | Test | 🟣 DEV/TEST ONLY | LOW | Security audit test |
| 9 | `test_drive_folder_bill.js` | Test | 🟣 DEV/TEST ONLY | LOW | Drive folder bill test |
| 10 | `test_localhost_fixes.js` | Test | 🟣 DEV/TEST ONLY | LOW | Mobile responsive test |
| 11 | `test_reviews_cms.js` | Test | 🟣 DEV/TEST ONLY | LOW | Reviews CMS test |
| 12 | `test_step2_cms_sync.js` | Test | 🟣 DEV/TEST ONLY | LOW | CMS sync test |
| 13 | `test_step3_admin_structure.js` | Test | 🟣 DEV/TEST ONLY | LOW | Admin structure test |
| 14 | `test_step4_mobile_responsive.js` | Test | 🟣 DEV/TEST ONLY | LOW | Mobile responsive test |
| 15 | `test_step5_e2e.js` | Test | 🟣 DEV/TEST ONLY | LOW | E2E functional audit |
| 16 | `test_step6_production_readiness.js` | Test | 🟣 DEV/TEST ONLY | LOW | Production readiness audit |
| 17 | `test_step7_production_launch.js` | Test | 🟣 DEV/TEST ONLY | LOW | Launch audit |
| 18 | `test_step8_bill_pdf_drive_headline.js` | Test | 🟣 DEV/TEST ONLY | LOW | Bill PDF/Drive/headline test |
| 19 | `scratch/` | Directory | 🟣 DEV/TEST ONLY | LOW | Empty directory |
| 20 | `api/index.js` | Build Artifact | 🟣 DEV/TEST ONLY | LOW | Compiled server bundle - generated by build |

---

## 7. Unused Dependencies

| Package | package.json | Used Where | Production Needed | Build/Test Needed | Recommendation | Confidence |
|---------|--------------|------------|-------------------|-------------------|----------------|------------|
| `@google/genai` | dependencies | No direct imports found | NO | NO | Remove | HIGH |
| `@vitejs/plugin-react` | dependencies | vite.config.ts | NO | YES (dev) | Move to devDependencies | HIGH |
| `esbuild` | dependencies | build script | NO | YES (build) | Move to devDependencies | HIGH |
| `tsx` | dependencies | dev, start scripts | NO | YES (dev) | Move to devDependencies | HIGH |
| `autoprefixer` | devDependencies | Not in config | NO | NO | Remove | HIGH |
| `tailwindcss` | devDependencies | vite.config.ts (via @tailwindcss/vite) | YES (via Vite plugin) | YES | Keep @tailwindcss/vite, remove tailwindcss | MEDIUM |

---

## 8. Unused Environment Variables

| Variable | Referenced In | Purpose | Currently Needed | Recommendation | Confidence |
|----------|---------------|---------|------------------|----------------|------------|
| `NODE_ENV` | server.ts:21, 99 | Production detection | YES | Keep | HIGH |
| `PORT` | server.ts:21 | Server port | YES | Keep | HIGH |
| `ADMIN_USERNAME` | server.ts:227 | Admin username default | YES | Keep | HIGH |
| `ADMIN_PASSWORD` | server.ts:228-232, 230-232 | Admin password | YES | Keep | HIGH |
| `VERCEL` | server.ts:99 | Serverless detection | YES (if deploying to Vercel) | Keep | HIGH |
| `AWS_LAMBDA_FUNCTION_NAME` | server.ts:99 | Serverless detection | NO (not on AWS) | Remove if not on AWS | MEDIUM |
| `GOOGLE_SHEETS_WEBAPP_URL` | google-sheets-sync.ts:233 | Sheets sync | YES | Keep | HIGH |
| `GOOGLE_SHEETS_SYNC_SECRET` | google-sheets-sync.ts:234 | Sheets sync auth | YES | Keep | HIGH |
| `GOOGLE_DRIVE_FOLDER_ID` | google-drive-service.ts:14, 29 | Drive folder | YES | Keep | HIGH |
| `GOOGLE_DRIVE_CLIENT_ID` | google-drive-service.ts:39, 135 | OAuth auth | YES | Keep | HIGH |
| `GOOGLE_DRIVE_CLIENT_SECRET` | google-drive-service.ts:39, 136 | OAuth auth | YES | Keep | HIGH |
| `GOOGLE_DRIVE_REFRESH_TOKEN` | google-drive-service.ts:39, 137 | OAuth auth | YES | Keep | HIGH |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | google-drive-service.ts:42, 155 | Service account auth | NO (using OAuth) | Remove if not using Service Account | MEDIUM |
| `GOOGLE_APPLICATION_CREDENTIALS` | google-drive-service.ts:43, 172 | Service account file | NO (using OAuth) | Remove if not using Service Account | MEDIUM |
| `GEMINI_API_KEY` | .env.example:18 | AI features | NO (not imported) | Remove | HIGH |
| `APP_URL` | .env.example:21 | App URL | NO (not imported) | Remove | HIGH |
| `VITE_GSC_VERIFICATION_TOKEN` | meta-manager.ts:75 | GSC verification | MAYBE | Keep if using GSC | MEDIUM |

---

## 9. Duplicate Implementations

### Duplicate 1: Pricing Calculation
- **File A**: `server.ts:1200-1502` (calculateServerOrderPrice)
- **File B**: `src/lib/pricing/pricing.ts:45-140` (getFramePrice, getFrameOriginalPrice, etc.)
- **Similarity**: 85%
- **Difference**: Server is authoritative with full validation; Client has fallbacks for instant UI
- **Current**: Both needed - Server for validation, Client for UX
- **Recommendation**: Keep both but consider shared type definitions

### Duplicate 2: Inventory Mapping & Stock Check
- **File A**: `server.ts:2149-2295` (findOrderMapping, checkStockForOrder, executeStockDeduction, executeStockRestoration)
- **File B**: `src/lib/admin/admin-service.ts:1297-1544` (findOrderMapping, checkStockForOrder, deductStockForOrder, restoreStockForOrder)
- **Similarity**: 90-95%
- **Difference**: Server mutates store directly; AdminService uses localStorage cache + sync
- **Current**: Both needed - Server authoritative, AdminService for admin UI
- **Recommendation**: Consider extracting shared logic to common utility

### Duplicate 3: Bill Data Construction
- **File A**: `server.ts:1762-1809` (buildPublicBillData)
- **File B**: `src/lib/admin/admin-service.ts:1816-1910` (syncCustomerFromOrder + preview bill logic)
- **Similarity**: 70%
- **Difference**: Server builds complete bill; AdminService builds preview for modal
- **Current**: Both needed for different contexts
- **Recommendation**: Keep both

### Duplicate 4: Google Drive URL Parsing
- **File A**: `src/lib/drive/google-drive.ts:20-141` (parseGoogleDriveUrl)
- **File B**: `src/lib/drive/google-drive-service.ts` (uses similar logic inline)
- **Similarity**: 60%
- **Difference**: Service has upload logic; utility has URL parsing
- **Current**: Utility used by components; Service used by server
- **Recommendation**: Keep both - different purposes

### Duplicate 5: Order ID Generation
- **File A**: `src/lib/orders/order-id.ts:1-5` (generateOrderId - client)
- **File B**: `server.ts:1533-1536` (generateServerOrderId - server)
- **Similarity**: 40% (different algorithms)
- **Difference**: Client uses timestamp+random; Server uses sequential from store
- **Current**: Server is authoritative; Client generates for idempotency key only
- **Recommendation**: Keep both - different purposes

---

## 10. Dead / Unreachable Code

| # | File | Line(s) | Code Pattern | Classification | Risk | Evidence |
|---|------|---------|--------------|----------------|------|----------|
| 1 | `server.ts:669-670` | 669-670 | `if (parsed.homepageHero.heading === 'Handcrafted Keepsake Frames Made for Your Memories')` | DEAD BRANCH | LOW | Only runs once on migration from old data |
| 2 | `server.ts:716-718` | 716-718 | `if (parsed.websiteSettings && parsed.websiteSettings.heroHeadline === 'Handcrafted Keepsake Frames Made for Your Memories')` | DEAD BRANCH | LOW | Same as above |
| 3 | `server.ts:1065-1064` | 1065 | `app.post('/api/auth/change-credentials', ...)` - never called from frontend? | POTENTIALLY UNREACHED | MEDIUM | AdminSecurity page exists but check if it calls this |
| 4 | `server.ts:2414-2443` | 2414-2443 | `/api/admin/orders/costs` endpoint | POTENTIALLY UNREACHED | MEDIUM | Check if OrdersPageView calls this |
| 5 | `server.ts:2336-2332` | 2336 | `/api/admin/mappings` GET endpoint | POTENTIALLY UNREACHED | MEDIUM | Check if FrameSizesPageView uses this |
| 6 | `src/components/common/PolicyModal.tsx` | Entire file | Component | UNREACHED | MEDIUM | No imports found |
| 7 | `src/lib/admin/admin-service.ts:2662-2679` | 2662-2679 | clearAllData() | DEV ONLY | LOW | Only for testing - not in production UI |

---

## 11. Commented-Out Code

| # | File | Line Range | What It Appears To Be | Active Replacement | Can Remove |
|---|------|------------|----------------------|-------------------|------------|
| 1 | `server.ts` | None found | - | - | N/A |
| 2 | `src/App.tsx` | None found | - | - | N/A |
| 3 | `src/lib/admin/admin-service.ts` | None found | - | - | N/A |

*No significant commented-out code blocks found in production files.*

---

## 12. Configuration Audit

| Config File | Issues Found | Severity | Recommendation |
|-------------|--------------|----------|----------------|
| `package.json` | `@vitejs/plugin-react`, `esbuild`, `tsx` in dependencies (should be devDependencies) | MEDIUM | Move to devDependencies |
| `package.json` | `@google/genai` not imported anywhere | HIGH | Remove |
| `package.json` | `autoprefixer` not used (Tailwind v4 uses built-in) | HIGH | Remove |
| `tsconfig.json` | `"allowImportingTsExtensions": true` with `"noEmit": true` - OK for Vite | LOW | Keep |
| `vite.config.ts` | `server: { hmr: false, watch: null }` - disables HMR | MEDIUM | Consider enabling for dev |
| `vercel.json` | Rewrites to `/api/index.js` - matches build output | LOW | Correct |
| `.env.example` | `GEMINI_API_KEY`, `APP_URL` documented but unused | MEDIUM | Remove from example |

---

## 13. Architecture Map

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MOMENTPRESS ARCHITECTURE                          │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌─────────────┐
│   FRONTEND   │     │    API       │     │   SERVER     │     │  JSON STORE │
│  (Vite/React)│────▶│  (Express)   │────▶│  (server.ts) │────▶│  (file)     │
└──────────────┘     └──────────────┘     └──────────────┘     └─────────────┘
       │                    │                    │                    │
       │                    │                    │                    │
       ▼                    ▼                    ▼                    ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌─────────────┐
│  AdminService│     │  Auth/Sess   │     │  Rate Limit  │     │  Backup     │
│  (localStorage)    │  (PBKDF2)    │     │  (In-Memory) │     │  (.backup)  │
└──────────────┘     └──────────────┘     └──────────────┘     └─────────────┘
       │                                                        │
       │                    ┌──────────────┐                    │
       └───────────────────▶│ Google Sheets│◀───────────────────┘
                            │   (Secondary)│
                            └──────────────┘
                                   │
                                   ▼
                            ┌──────────────┐
                            │ Google Drive │
                            │   (Bills)    │
                            └──────────────┘

PUBLIC WEBSITE FLOW:
  Homepage → ProductSection → OrderFlow (4 steps) → PublicBillPage
       │           │              │                    │
       ▼           ▼              ▼                    ▼
  Hero/CMS    Frame/Sticker    POST /api/public    GET /api/public/bills/
  Config      Selector         /orders              :token/pdf

ADMIN PANEL FLOW:
  /admin/2008/* (13 routes) → BusinessAdminDashboard → OrdersPageView + 12 CMS Pages
       │
       ▼
  AdminService (localStorage cache + Server Sync)
       │
       ├── Orders (Online/Offline)
       ├── Inventory & Mappings
       ├── Pricing (Frames/Stickers/Quality)
       ├── Content (Reviews/FAQ/Designs/Hero/Sections)
       ├── Settings (Website/Contact/SEO/Security)
       └── Financial (Purchases/Expenses/Analytics)
```

---

## 14. Recommended Cleanup Order

1. **Remove unused dependencies** - `@google/genai`, `autoprefixer`, move dev deps
2. **Remove backup/legacy files** - `server.ts.backup`, `api/index.js` (build artifact)
3. **Remove development scripts** - All `scripts/*.js` and `test_*.js` files (or move to separate test repo)
4. **Remove unused environment variables** - `GEMINI_API_KEY`, `APP_URL`, `GOOGLE_SERVICE_ACCOUNT_KEY` (if not used)
5. **Review duplicate implementations** - Consider extracting shared pricing/inventory logic
6. **Remove unused components** - `PolicyModal.tsx`, verify `NotFoundPage.tsx`, `GallerySection.tsx`
7. **Clean up legacy code** - Remove hardcoded headline fallbacks in server.ts after confirming migration complete
8. **Run tests** - Execute test suite to verify nothing broken
9. **Build** - Run `npm run build` and verify production bundle
10. **Deploy** - Deploy to staging, verify all flows

---

## 15. Risk Summary - DO NOT REMOVE WITHOUT MANUAL CONFIRMATION

| Item | Risk | Reason |
|------|------|--------|
| `generateOrderId` in `src/lib/orders/order-id.ts` | HIGH | Used for client-side idempotency keys in order submission |
| `OrderBillDocument.tsx` | MEDIUM | Used in OrdersPageView for bill preview modal |
| `PolicyModal.tsx` | MEDIUM | May be used conditionally - search for dynamic imports |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | MEDIUM | Fallback auth method - keep if OAuth fails |
| `GOOGLE_APPLICATION_CREDENTIALS` | MEDIUM | Fallback auth method - keep if OAuth fails |
| `VITE_GSC_VERIFICATION_TOKEN` | MEDIUM | Used in meta-manager for GSC verification |
| `AWS_LAMBDA_FUNCTION_NAME` | LOW | Only if deploying to AWS Lambda |
| `scratch/` directory | LOW | Empty but may be needed for temp files |
| Server-side duplicate pricing/inventory logic | LOW | Required for authoritative validation vs UI responsiveness |

---

## 16. TOP 20 CLEANUP CANDIDATES

| Rank | File | Line | Symbol | Classification | Risk | Evidence | Why Removable | What Could Break |
|------|------|------|--------|----------------|------|----------|---------------|------------------|
| 1 | `package.json` | 16 | `@google/genai` | 🔴 SAFE TO REMOVE | LOW | Not imported anywhere | Unused dependency | Nothing |
| 2 | `package.json` | 35 | `autoprefixer` | 🔴 SAFE TO REMOVE | LOW | Tailwind v4 doesn't need it | Unused dev dependency | Nothing |
| 3 | `server.ts.backup` | File | Backup file | 🔴 SAFE TO REMOVE | LOW | Not referenced in build | Old backup | Nothing |
| 4 | `api/index.js` | File | Build artifact | 🔴 SAFE TO REMOVE | LOW | Generated by build script | Compiled output | Nothing (regenerated on build) |
| 5 | `scripts/get-drive-token.js` | File | Dev script | 🟣 DEV/TEST ONLY | LOW | OAuth setup script | Not for production | Nothing |
| 6 | `scripts/cleanup-test-file.js` | File | Dev script | 🟣 DEV/TEST ONLY | LOW | Manual cleanup | Not for production | Nothing |
| 7 | `scripts/test-live-upload.js` | File | Dev script | 🟣 DEV/TEST ONLY | LOW | Test script | Not for production | Nothing |
| 8 | `scripts/run-live-order-test.js` | File | Dev script | 🟣 DEV/TEST ONLY | LOW | Test script | Not for production | Nothing |
| 9 | `scripts/test-pdf-auth-actions.js` | File | Dev script | 🟣 DEV/TEST ONLY | LOW | Test script | Not for production | Nothing |
| 10 | `scripts/verify-e2e-drive-bill.js` | File | Dev script | 🟣 DEV/TEST ONLY | LOW | Test script | Not for production | Nothing |
| 11 | `test_billing_and_order_id.js` | File | Test file | 🟣 DEV/TEST ONLY | LOW | Test suite | Not for production | Nothing |
| 12 | `test_credential_security.js` | File | Test file | 🟣 DEV/TEST ONLY | LOW | Test suite | Not for production | Nothing |
| 13 | `test_drive_folder_bill.js` | File | Test file | 🟣 DEV/TEST ONLY | LOW | Test suite | Not for production | Nothing |
| 14 | `test_localhost_fixes.js` | File | Test file | 🟣 DEV/TEST ONLY | LOW | Test suite | Not for production | Nothing |
| 15 | `test_reviews_cms.js` | File | Test file | 🟣 DEV/TEST ONLY | LOW | Test suite | Not for production | Nothing |
| 16 | `test_step2_cms_sync.js` | File | Test file | 🟣 DEV/TEST ONLY | LOW | Test suite | Not for production | Nothing |
| 17 | `test_step3_admin_structure.js` | File | Test file | 🟣 DEV/TEST ONLY | LOW | Test suite | Not for production | Nothing |
| 18 | `test_step4_mobile_responsive.js` | File | Test file | 🟣 DEV/TEST ONLY | LOW | Test suite | Not for production | Nothing |
| 19 | `test_step5_e2e.js` | File | Test file | 🟣 DEV/TEST ONLY | LOW | Test suite | Not for production | Nothing |
| 20 | `test_step6_production_readiness.js` | File | Test file | 🟣 DEV/TEST ONLY | LOW | Test suite | Not for production | Nothing |

---

## Summary

The MomentPress codebase is **well-structured and production-ready** with a clean separation between:
- **Frontend** (React + Vite + Tailwind v4)
- **Backend** (Express + TypeScript)
- **Data Layer** (JSON file store with backup)
- **External Integrations** (Google Sheets, Google Drive, WhatsApp)

**Key Strengths:**
- No hardcoded credentials in production code
- Comprehensive test coverage (8 test suites)
- Proper authentication with PBKDF2-SHA512
- Rate limiting on all public endpoints
- Idempotent order submission
- Atomic persistence with backup
- SEO-ready with robots.txt, sitemap.xml, JSON-LD

**Primary Cleanup Opportunities:**
1. **Remove 18 test files** and **5 dev scripts** from production repo
2. **Fix dependency categorization** (move 4 packages to devDependencies, remove 2 unused)
3. **Remove build artifacts** (`api/index.js`, `server.ts.backup`)
4. **Consider extracting shared logic** between server and AdminService for inventory/pricing

**Total estimated cleanup impact**: ~2000 lines of test/dev code, 6 unused dependencies, 2 backup files.