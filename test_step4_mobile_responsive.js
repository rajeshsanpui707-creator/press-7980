// test_step4_mobile_responsive.js
// Automated verification for Step 4 Mobile UI + Responsive Polish + Compact Premium UX

import fs from 'fs';
import path from 'path';

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${message}`);
    failCount++;
  }
}

console.log('====================================================');
console.log('MOMENTPRESS STEP 4: MOBILE RESPONSIVE UX VERIFICATION');
console.log('====================================================\n');

// 1. ProcessStep & HowItWorks Component Checks
console.log('--- TEST 1: How It Works & Process Step Mobile Specs ---');
const howItWorksPath = path.resolve('./src/components/how-it-works/HowItWorks.tsx');
const processStepPath = path.resolve('./src/components/how-it-works/ProcessStep.tsx');

const howItWorksContent = fs.readFileSync(howItWorksPath, 'utf8');
const processStepContent = fs.readFileSync(processStepPath, 'utf8');

// Gap between cards max 12px on mobile (gap-2.5 or gap-3)
assert(
  howItWorksContent.includes('gap-3 sm:gap-6') || howItWorksContent.includes('gap-2.5'),
  'HowItWorks uses compact gap (<= 12px) between cards on mobile'
);

// Card height ~150-180px bounds on mobile
assert(
  processStepContent.includes('min-h-[150px]') && processStepContent.includes('max-h-[185px]'),
  'ProcessStep card has ~150-180px height bounds on mobile'
);

// Icon container max 40x40px (h-[38px] w-[38px])
assert(
  processStepContent.includes('h-[38px] w-[38px]'),
  'ProcessStep icon container is compact (38x38px, <= 40x40px) on mobile'
);

// Icon 20-22px (h-5 w-5 = 20px)
assert(
  processStepContent.includes('h-5 w-5'),
  'ProcessStep icon is 20px (20-22px range)'
);

// Step number 18-22px (text-[19px])
assert(
  processStepContent.includes('text-[19px]'),
  'ProcessStep step number is 19px (18-22px range)'
);

// Heading max 18px (text-[16.5px] or text-base)
assert(
  processStepContent.includes('text-[16.5px]'),
  'ProcessStep heading is <= 18px on mobile (16.5px)'
);

// Description 13-14px (text-[13px])
assert(
  processStepContent.includes('text-[13px]'),
  'ProcessStep description is 13px (13-14px range) on mobile'
);

// 2. Frame Size Selector (FrameStep.tsx)
console.log('\n--- TEST 2: Frame Size Selector 2-Column Grid ---');
const frameStepPath = path.resolve('./src/components/order-flow/FrameStep.tsx');
const frameStepContent = fs.readFileSync(frameStepPath, 'utf8');

// Compact 2-column grid
assert(
  frameStepContent.includes('grid grid-cols-2 gap-2 sm:gap-3'),
  'FrameStep uses compact 2-column grid (grid-cols-2 gap-2 sm:gap-3) on mobile'
);

// Preserves dynamic CMS pricing
assert(
  frameStepContent.includes('getFrameDiscountInfo') && frameStepContent.includes('info.sellingPrice'),
  'FrameStep displays dynamic CMS pricing on size cards'
);

// 3. Product CTA Buttons (Black button with White text)
console.log('\n--- TEST 3: Product CTA Buttons (Black with White Text) ---');
const productSectionPath = path.resolve('./src/components/products/ProductSection.tsx');
const productCardPath = path.resolve('./src/components/products/ProductCard.tsx');

const productSectionContent = fs.readFileSync(productSectionPath, 'utf8');
const productCardContent = fs.readFileSync(productCardPath, 'utf8');

// Custom Photo Frames and Photo Stickers CTA buttons are bg-[#10100F] text-white
assert(
  productSectionContent.includes('bg-[#10100F] text-white') &&
  productSectionContent.includes('Custom Photo Frames') &&
  productSectionContent.includes('Photo Stickers'),
  'Product customizer buttons are black (#10100F) with white text'
);

assert(
  productCardContent.includes('bg-[#10100F]') && productCardContent.includes('text-white'),
  'ProductCard CTA buttons use bg-[#10100F] with white text'
);

// 4. Order Progress Indicator & Scroll-to-Top
console.log('\n--- TEST 4: Order Progress & Scroll-to-Top ---');
const orderProgressPath = path.resolve('./src/components/order-flow/OrderProgress.tsx');
const appPath = path.resolve('./src/App.tsx');

const orderProgressContent = fs.readFileSync(orderProgressPath, 'utf8');
const appContent = fs.readFileSync(appPath, 'utf8');

// Compact labels on mobile
assert(
  orderProgressContent.includes('shortLabel') &&
  orderProgressContent.includes('sm:hidden') &&
  orderProgressContent.includes('hidden sm:inline'),
  'OrderProgress renders compact short labels on mobile and full titles on desktop'
);

// Unconditional scroll to top on route transition
assert(
  appContent.includes('useEffect(() => {\n    window.scrollTo({ top: 0, left: 0, behavior: \'instant\' });\n  }, [currentPage]);') ||
  (appContent.includes('window.scrollTo({ top: 0, left: 0, behavior: \'instant\' })') && appContent.includes('[currentPage]')),
  'App.tsx unconditionally scrolls to top on every currentPage route transition'
);

// 5. Admin Panel Mobile Responsiveness
console.log('\n--- TEST 5: Admin Panel Mobile Responsive Views ---');
const ordersPagePath = path.resolve('./src/components/admin/pages/OrdersPageView.tsx');
const ordersPageContent = fs.readFileSync(ordersPagePath, 'utf8');

// Mobile card view for orders
assert(
  ordersPageContent.includes('md:hidden') && ordersPageContent.includes('filteredOrders.map'),
  'OrdersPageView provides responsive card layout on mobile (<md)'
);

// Desktop table preserved
assert(
  ordersPageContent.includes('hidden md:block overflow-x-auto') && ordersPageContent.includes('<table'),
  'OrdersPageView preserves full data table on desktop (>=md)'
);

// Responsive modal padding
assert(
  ordersPageContent.includes('p-3 sm:p-4') && ordersPageContent.includes('p-4 sm:p-6'),
  'OrdersPageView modal uses responsive mobile padding (p-3 sm:p-4, p-4 sm:p-6)'
);

// 6. Zero Horizontal Overflow Principles
console.log('\n--- TEST 6: Container & Viewport Width Integrity ---');
const containerPath = path.resolve('./src/components/layout/Container.tsx');
const containerContent = fs.readFileSync(containerPath, 'utf8');

// Container padding mobile safety
assert(
  containerContent.includes('px-3.5 sm:px-6 lg:px-8'),
  'Container uses mobile-safe px-3.5 padding to prevent 320px screen squeezing'
);

// Check that no major component specifies w-[>320px] without max-w or responsive breakpoint
const componentsToCheck = [
  'src/components/hero/Hero.tsx',
  'src/components/products/ProductSection.tsx',
  'src/components/order-flow/FrameStep.tsx',
  'src/components/pages/OrderQualityPage.tsx',
  'src/components/pages/OrderReviewPage.tsx',
  'src/components/pages/OrderDeliveryPage.tsx',
  'src/components/pages/OrderConfirmationPage.tsx',
];

let allComponentsSafe = true;
for (const file of componentsToCheck) {
  const filePath = path.resolve(file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    // Regex looking for fixed pixel widths larger than 300px without responsiveness
    const badWidthRegex = /(?<![a-zA-Z-])(?:w|min-w)-\[(\d{3,4})px\]/g;
    let match;
    while ((match = badWidthRegex.exec(content)) !== null) {
      const px = parseInt(match[1], 10);
      if (px > 300) {
        // Check if prefixed by a responsive breakpoint like sm:, md:, lg:
        const index = match.index;
        const preceding = content.slice(Math.max(0, index - 5), index);
        if (!preceding.includes('sm:') && !preceding.includes('md:') && !preceding.includes('lg:')) {
          console.warn(`Warning: Large fixed width ${match[0]} found without breakpoint in ${file}`);
          allComponentsSafe = false;
        }
      }
    }
  }
}

assert(allComponentsSafe, 'No un-breakpoint-protected fixed widths > 300px found in core flow components');

console.log('\n====================================================');
console.log(`TOTAL TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
console.log('====================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
