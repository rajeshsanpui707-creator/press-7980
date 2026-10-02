import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Hero } from './components/hero/Hero';
import { TrustIndicators } from './components/trust/TrustIndicators';
import { ProductSection } from './components/products/ProductSection';
import { HowItWorks } from './components/how-it-works/HowItWorks';
import { ReviewsSection } from './components/reviews/ReviewsSection';
import { FaqSection } from './components/faq/FaqSection';
import { FinalCta } from './components/cta/FinalCta';
import { Footer } from './components/layout/Footer';
import { FloatingWhatsApp } from './components/common/FloatingWhatsApp';
import { ExistingDesignsPage } from './components/pages/ExistingDesignsPage';
import { OrderQualityPage } from './components/pages/OrderQualityPage';
import { OrderReviewPage } from './components/pages/OrderReviewPage';
import { OrderDeliveryPage } from './components/pages/OrderDeliveryPage';
import { OrderConfirmationPage } from './components/pages/OrderConfirmationPage';
import { PublicBillPage } from './components/pages/PublicBillPage';
import { NotFoundPage } from './components/common/NotFoundPage';
import { BusinessAdminDashboard } from './components/admin/BusinessAdminDashboard';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminService } from './lib/admin/admin-service';
import { HomepageSectionConfig } from './types/admin';
import { updatePageSeo } from './lib/seo/meta-manager';
import {
  CustomFrameOrderState,
  getStoredOrderState,
  saveStoredOrderState,
  resetStoredOrderState,
} from './lib/orders/order-state';
import { FRAME_SIZE_CONFIGS, FRAME_TIER_CONFIGS } from './data/products';
import { getFramePrice } from './lib/pricing/pricing';
import { generateOrderId } from './lib/orders/order-id';
import { FrameSizeId, FrameTierId, FrameFinish, CustomerDetails } from './types';
import { Container } from './components/layout/Container';
import { ArrowRight } from 'lucide-react';

export type PageType =
  | 'home'
  | 'custom-photo-frames'
  | 'photo-stickers'
  | 'existing-designs'
  | 'faq'
  | 'contact'
  | 'admin'
  | 'order-quality'
  | 'order-review'
  | 'order-delivery'
  | 'order-confirmation'
  | 'bill'
  | 'not-found';

function getBillTokenFromLocation(): string {
  if (typeof window === 'undefined') return '';
  const path = window.location.pathname;
  const hash = window.location.hash;
  if (path.startsWith('/bill/')) {
    return path.replace('/bill/', '').split('/')[0].split('?')[0];
  }
  if (hash.startsWith('#bill/')) {
    return hash.replace('#bill/', '').split('/')[0].split('?')[0];
  }
  if (hash.startsWith('#/bill/')) {
    return hash.replace('#/bill/', '').split('/')[0].split('?')[0];
  }
  return '';
}

function getPageFromLocation(): PageType {
  if (typeof window === 'undefined') return 'home';
  const hash = window.location.hash;
  const path = window.location.pathname;

  if (
    hash.startsWith('#bill/') ||
    path.startsWith('/bill/') ||
    hash.startsWith('#/bill/')
  ) {
    return 'bill';
  }

  if (
    hash.startsWith('#admin') ||
    path.startsWith('/admin') ||
    hash === '#business-sales' ||
    path === '/admin/2008'
  ) {
    return 'admin';
  }
  if (hash === '#existing-designs' || path === '/existing-designs') {
    return 'existing-designs';
  }
  if (hash === '#custom-photo-frames' || path === '/custom-photo-frames') {
    return 'custom-photo-frames';
  }
  if (hash === '#photo-stickers' || path === '/photo-stickers') {
    return 'photo-stickers';
  }
  if (hash === '#faq' || path === '/faq') {
    return 'faq';
  }
  if (hash === '#contact' || path === '/contact') {
    return 'contact';
  }
  if (
    hash.startsWith('#order/quality') ||
    path.startsWith('/order/quality') ||
    hash === '#order-quality'
  ) {
    return 'order-quality';
  }
  if (
    hash.startsWith('#order/review') ||
    path.startsWith('/order/review') ||
    hash === '#order-review'
  ) {
    return 'order-review';
  }
  if (
    hash.startsWith('#order/delivery') ||
    path.startsWith('/order/delivery') ||
    hash === '#order-delivery'
  ) {
    return 'order-delivery';
  }
  if (
    hash.startsWith('#order/confirmation') ||
    path.startsWith('/order/confirmation') ||
    hash === '#order-confirmation'
  ) {
    return 'order-confirmation';
  }

  // Known public anchor paths that belong on home
  if (
    path === '/' ||
    path === '/index.html' ||
    hash === '#home' ||
    hash === '' ||
    hash === '#products' ||
    hash === '#how-it-works' ||
    hash === '#reviews'
  ) {
    return 'home';
  }

  // Any unmatched clean URL returns 404
  return 'not-found';
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>(getPageFromLocation);
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => AdminService.isAuthenticated());
  const [homepageSections, setHomepageSections] = useState<HomepageSectionConfig[]>(() =>
    AdminService.getHomepageSections()
  );

  // Shared persistent order state across separate pages
  const [orderState, setOrderState] = useState<CustomFrameOrderState>(getStoredOrderState);

  // Sync order state to sessionStorage whenever it updates
  useEffect(() => {
    saveStoredOrderState(orderState);
  }, [orderState]);

  // Initialize and verify admin authentication and sync public config
  useEffect(() => {
    AdminService.init();
    AdminService.fetchPublicConfig().then(() => {
      setHomepageSections(AdminService.getHomepageSections());
    });
    AdminService.checkAuth().then((authed) => {
      setIsAdminAuthenticated(authed);
    });
  }, []);

  // Direct landing handler for products/features
  useEffect(() => {
    if (currentPage === 'custom-photo-frames' || currentPage === 'photo-stickers') {
      setCustomizerOpen(true);
      setTimeout(() => {
        const el = document.getElementById('products');
        if (el) el.scrollIntoView({ behavior: 'instant' });
      }, 50);
    } else if (currentPage === 'faq') {
      setTimeout(() => {
        const el = document.getElementById('faq');
        if (el) el.scrollIntoView({ behavior: 'instant' });
      }, 50);
    } else if (currentPage === 'contact') {
      setTimeout(() => {
        const el = document.getElementById('contact');
        if (el) el.scrollIntoView({ behavior: 'instant' });
      }, 50);
    }
  }, [currentPage]);

  // Update Page SEO (Titles, Meta, Canonicals, OpenGraph, Structured Data) on every route transition
  useEffect(() => {
    updatePageSeo(currentPage);
  }, [currentPage]);

  // Unconditionally scroll to top whenever page route changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [currentPage]);

  // Sync with browser back/forward navigation & hash changes
  useEffect(() => {
    const handlePopState = () => {
      const page = getPageFromLocation();
      setCurrentPage(page);
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const navigateTo = (page: PageType, hash: string) => {
    setCurrentPage(page);
    window.history.pushState(null, '', hash);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  const handleNavigateExistingDesigns = () => {
    navigateTo('existing-designs', '#existing-designs');
  };

  const handleNavigateAdmin = () => {
    navigateTo('admin', '/admin/2008/orders');
  };

  const handleNavigateHome = (targetSection?: string) => {
    setCurrentPage('home');
    window.history.pushState(null, '', targetSection ? `#${targetSection}` : '/');
    if (targetSection) {
      setTimeout(() => {
        const element = document.getElementById(targetSection);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }
      }, 100);
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  };

  const handleOpenCustomizer = () => {
    setCustomizerOpen(true);
    setResetSignal((prev) => prev + 1);
    if (currentPage !== 'home') {
      handleNavigateHome('products');
    } else {
      const element = document.getElementById('products');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Order state update handlers
  const handleSelectSize = (size: FrameSizeId) => {
    setOrderState((prev) => ({ ...prev, selectedSize: size }));
  };

  const handleSelectFinish = (finish: FrameFinish) => {
    setOrderState((prev) => ({ ...prev, selectedFinish: finish }));
  };

  const handleSelectTier = (tier: FrameTierId) => {
    setOrderState((prev) => ({ ...prev, selectedTier: tier }));
  };

  const handleChangeQuantity = (qty: number) => {
    setOrderState((prev) => ({ ...prev, quantity: Math.max(1, qty) }));
  };

  const handleCustomerChange = (customer: CustomerDetails) => {
    setOrderState((prev) => ({ ...prev, customer }));
  };

  // Step 1 -> Step 2: "Continue to Quality" button navigation
  const handleContinueToQuality = () => {
    navigateTo('order-quality', '#order/quality');
  };

  // Step 2 -> Step 3: "Continue to Review" button navigation
  const handleContinueToReview = () => {
    navigateTo('order-review', '#order/review');
  };

  // Step 3 -> Step 4: "Enter Delivery Details" button navigation
  const handleContinueToDelivery = () => {
    navigateTo('order-delivery', '#order/delivery');
  };

  // Back Navigation Handlers (Preserves all state & scrolls to top)
  const handleBackToSize = () => {
    handleNavigateHome('products');
  };

  const handleBackToQuality = () => {
    navigateTo('order-quality', '#order/quality');
  };

  const handleBackToReview = () => {
    navigateTo('order-review', '#order/review');
  };

  // Step 4 -> Step 5: "Place Order" submission
  const [orderSubmitError, setOrderSubmitError] = useState<string | null>(null);

  const handlePlaceOrder = async (customerDetails: CustomerDetails) => {
    setOrderSubmitError(null);
    setOrderState((prev) => ({
      ...prev,
      customer: customerDetails,
      isProcessing: true,
    }));

    const sizeConfig =
      FRAME_SIZE_CONFIGS.find((s) => s.id === orderState.selectedSize) || FRAME_SIZE_CONFIGS[1];
    const tierConfig =
      FRAME_TIER_CONFIGS.find((t) => t.id === orderState.selectedTier) || FRAME_TIER_CONFIGS[1];
    const activeRequirements = customerDetails.requirements || orderState.requirements || '';
    const idempotencyKey = `REQ-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const minDelayPromise = new Promise((resolve) => setTimeout(resolve, 2400));

    try {
      // 1. Call server public order endpoint with customer selections + guarantee 2.4s visual processing
      const [response] = await Promise.all([
        fetch('/api/public/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idempotencyKey,
            customerName: customerDetails.fullName,
            mobileNumber: customerDetails.mobileNumber,
            address: customerDetails.address,
            city: customerDetails.city,
            pincode: customerDetails.pincode,
            product: 'Custom Photo Frames',
            size: sizeConfig.name,
            quality: tierConfig.name,
            quantity: orderState.quantity,
            requirements: activeRequirements,
          }),
        }),
        minDelayPromise,
      ]);

      const data = await response.json().catch(() => null);

      // 2. Strict HTTP Response Validation
      if (!response.ok || !data || !data.success || !data.order || !data.order.id) {
        const errMsg =
          (data && data.error) ||
          `Order submission failed (HTTP ${response.status}). Please check your information and try again.`;
        setOrderSubmitError(errMsg);
        setOrderState((prev) => ({
          ...prev,
          isProcessing: false,
        }));
        return;
      }

      // 3. Only on confirmed server success: update order state with authoritative server data
      const createdOrder = data.order;
      setOrderState((prev) => ({
        ...prev,
        orderId: createdOrder.id,
        serverUnitPrice: createdOrder.unitPrice,
        serverFinalAmount: createdOrder.finalAmount,
        requirements: createdOrder.requirements || activeRequirements,
        customer: {
          ...customerDetails,
          requirements: createdOrder.requirements || activeRequirements,
        },
        isProcessing: false,
      }));

      // 4. Update Admin cache with authoritative server order
      AdminService.addOnlineOrder({
        orderId: createdOrder.id,
        customerName: createdOrder.customerName,
        mobileNumber: customerDetails.mobileNumber,
        address: customerDetails.address,
        city: customerDetails.city,
        pincode: customerDetails.pincode,
        product: createdOrder.product,
        size: createdOrder.size,
        quality: createdOrder.quality,
        quantity: createdOrder.quantity,
        sellingPrice: createdOrder.finalAmount,
        unitPrice: createdOrder.unitPrice,
        discount: createdOrder.discount || 0,
        requirements: createdOrder.requirements || activeRequirements,
      });

      // 5. Navigate to confirmation ONLY after server confirms success
      navigateTo('order-confirmation', '#order/confirmation');
    } catch (err: any) {
      console.error('Order submission network error:', err);
      setOrderSubmitError('Network connection error. Please verify your connection and try again.');
      setOrderState((prev) => ({
        ...prev,
        isProcessing: false,
      }));
    }
  };

  // Reset Order and return to Home / Customize
  const handleResetOrder = () => {
    const fresh = resetStoredOrderState();
    setOrderState(fresh);
    handleNavigateHome('products');
  };

  // Breadcrumb / Step bar navigation between steps
  const handleNavigateOrderStep = (stepNumber: 1 | 2 | 3 | 4) => {
    if (stepNumber === 1) {
      handleNavigateHome('products');
    } else if (stepNumber === 2) {
      navigateTo('order-quality', '#order/quality');
    } else if (stepNumber === 3) {
      navigateTo('order-review', '#order/review');
    } else if (stepNumber === 4) {
      navigateTo('order-delivery', '#order/delivery');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF8] text-[#171717] flex flex-col font-sans antialiased selection:bg-[#C25E34]/20 selection:text-[#10100F]">
      {/* Skip to Main Content Link for Keyboard Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-[#10100F] focus:text-white focus:px-4 focus:py-2.5 focus:rounded-md focus:shadow-lg focus:outline-2 focus:outline-white text-xs font-semibold"
      >
        Skip to main content
      </a>

      {/* 1. Sticky Navigation Header (shown on customer pages) */}
      {currentPage !== 'admin' && currentPage !== 'bill' && (
        <Header
          currentPage={currentPage === 'home' || currentPage === 'existing-designs' ? currentPage : undefined}
          onNavigateHome={handleNavigateHome}
          onNavigateExistingDesigns={handleNavigateExistingDesigns}
          onNavigateAdmin={handleNavigateAdmin}
        />
      )}

      {/* Main Content Router */}
      <main id="main-content" tabIndex={-1} className="flex-1 outline-hidden">
        {currentPage === 'admin' ? (
          isAdminAuthenticated ? (
            /* Protected Business & Offline Sales Management Admin Portal */
            <BusinessAdminDashboard
              onBackToWebsite={() => {
                setIsAdminAuthenticated(AdminService.isAuthenticated());
                handleNavigateHome();
              }}
            />
          ) : (
            /* Dedicated Admin Login Gateway */
            <AdminLogin
              onLoginSuccess={() => setIsAdminAuthenticated(true)}
              onBackToWebsite={() => handleNavigateHome()}
            />
          )
        ) : currentPage === 'bill' ? (
          /* Public Customer Bill / Invoice Page */
          <PublicBillPage
            token={getBillTokenFromLocation()}
            onNavigateHome={handleNavigateHome}
          />
        ) : currentPage === 'existing-designs' ? (
          /* Separate Existing Designs Page */
          <ExistingDesignsPage
            onNavigateHome={handleNavigateHome}
            onOpenCustomizer={handleOpenCustomizer}
          />
        ) : currentPage === 'order-quality' ? (
          /* 1. Separate Quality Selection Page */
          <OrderQualityPage
            selectedSize={orderState.selectedSize}
            selectedFinish={orderState.selectedFinish}
            selectedTier={orderState.selectedTier}
            onSelectTier={handleSelectTier}
            onBackToSize={handleBackToSize}
            onContinueToReview={handleContinueToReview}
            onNavigateStep={handleNavigateOrderStep}
          />
        ) : currentPage === 'order-review' ? (
          /* 2. Separate Order Review Page */
          <OrderReviewPage
            selectedSize={orderState.selectedSize}
            selectedTier={orderState.selectedTier}
            selectedFinish={orderState.selectedFinish}
            quantity={orderState.quantity}
            requirements={orderState.requirements || orderState.customer.requirements || ''}
            onChangeQuantity={handleChangeQuantity}
            onChangeRequirements={(req) =>
              setOrderState((prev) => ({
                ...prev,
                requirements: req,
                customer: { ...prev.customer, requirements: req },
              }))
            }
            onBackToQuality={handleBackToQuality}
            onModifySpecs={handleBackToSize}
            onContinueToDelivery={handleContinueToDelivery}
            onNavigateStep={handleNavigateOrderStep}
          />
        ) : currentPage === 'order-delivery' ? (
          /* 3. Separate Customer Delivery Details Page */
          <OrderDeliveryPage
            selectedSize={orderState.selectedSize}
            selectedTier={orderState.selectedTier}
            selectedFinish={orderState.selectedFinish}
            quantity={orderState.quantity}
            initialCustomer={orderState.customer}
            isProcessing={orderState.isProcessing}
            submitError={orderSubmitError}
            onCustomerChange={handleCustomerChange}
            onBackToReview={handleBackToReview}
            onSubmitOrder={handlePlaceOrder}
            onNavigateStep={handleNavigateOrderStep}
          />
        ) : currentPage === 'order-confirmation' && orderState.orderId ? (
          /* 4. Separate Order Confirmation Page */
          <OrderConfirmationPage
            orderId={orderState.orderId}
            customer={orderState.customer}
            selectedSize={orderState.selectedSize}
            selectedTier={orderState.selectedTier}
            selectedFinish={orderState.selectedFinish}
            quantity={orderState.quantity}
            serverFinalAmount={orderState.serverFinalAmount}
            requirements={orderState.requirements || orderState.customer.requirements || ''}
            onResetOrder={handleResetOrder}
          />
        ) : currentPage === 'not-found' ? (
          /* Proper 404 Not Found Page */
          <NotFoundPage
            onNavigateHome={handleNavigateHome}
            onNavigateExistingDesigns={handleNavigateExistingDesigns}
          />
        ) : (
          /* Homepage with Dynamic CMS-Controlled Sections */
          <>
            {homepageSections
              .filter((section) => section.visible !== false)
              .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
              .map((section) => {
                switch (section.id) {
                  case 'hero':
                    return (
                      <Hero
                        key="hero"
                        onOpenCustomizer={handleOpenCustomizer}
                        onNavigateExistingDesigns={handleNavigateExistingDesigns}
                      />
                    );
                  case 'trust':
                    return <TrustIndicators key="trust" />;
                  case 'products':
                    return (
                      <ProductSection
                        key="products"
                        initialTab={currentPage === 'photo-stickers' ? 'stickers' : 'frames'}
                        customizerOpen={customizerOpen}
                        setCustomizerOpen={setCustomizerOpen}
                        resetSignal={resetSignal}
                        selectedSize={orderState.selectedSize}
                        selectedFinish={orderState.selectedFinish}
                        onSelectSize={handleSelectSize}
                        onSelectFinish={handleSelectFinish}
                        onContinueToQuality={handleContinueToQuality}
                      />
                    );
                  case 'how-it-works':
                    return <HowItWorks key="how-it-works" />;
                  case 'existing-designs':
                    return (
                      <section
                        key="existing-designs"
                        id="existing-designs"
                        className="py-6 sm:py-20 bg-[#FCF9F3]/80 border-b border-[#F3F0EA]"
                      >
                        <Container size="wide">
                          <div className="rounded-xl sm:rounded-2xl border border-[#F3F0EA] bg-[#FFFDF8] p-3.5 sm:p-12 text-center flex flex-col items-center justify-center relative overflow-hidden shadow-2xs">
                            <div
                              className="pointer-events-none absolute -top-12 -right-12 w-48 h-48 bg-[#C25E34]/15 rounded-full blur-2xl"
                              aria-hidden="true"
                            />
                            <div
                              className="pointer-events-none absolute -bottom-12 -left-12 w-48 h-48 bg-[#C25E34]/10 rounded-full blur-2xl"
                              aria-hidden="true"
                            />

                            <span className="text-[10.5px] sm:text-xs font-bold uppercase tracking-wider text-[#C25E34] mb-1 sm:mb-2 z-10">
                              Tangible Memories
                            </span>
                            <h2 className="font-serif text-xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#171717] mb-2 sm:mb-3 [text-wrap:balance] z-10">
                              Explore Our Existing Designs
                            </h2>
                            <p className="text-xs sm:text-base text-[#6B6258] max-w-xl leading-relaxed mb-3.5 sm:mb-6 [text-wrap:balance] z-10">
                              Browse real handcrafted customer keepsakes, archival framing profiles, and inspiration on our dedicated gallery page.
                            </p>

                            <button
                              type="button"
                              onClick={handleNavigateExistingDesigns}
                              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#10100F] hover:bg-[#2A2927] px-4 sm:px-7 py-2.5 sm:py-3.5 text-xs sm:text-base font-semibold text-white shadow-sm active:scale-[0.98] transition-colors focus-visible:outline-2 focus-visible:outline-[#10100F] cursor-pointer min-h-[44px] sm:min-h-[48px] z-10"
                              aria-label="Existing Designs"
                            >
                              <span>Existing Designs</span>
                              <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </div>
                        </Container>
                      </section>
                    );
                  case 'reviews':
                    return <ReviewsSection key="reviews" />;
                  case 'faq':
                    return <FaqSection key="faq" />;
                  case 'final-cta':
                    return <FinalCta key="final-cta" onOpenCustomizer={handleOpenCustomizer} />;
                  default:
                    return null;
                }
              })}
          </>
        )}
      </main>

      {/* 10. Comprehensive Footer (shown on customer-facing pages) */}
      {currentPage !== 'admin' && currentPage !== 'bill' && (
        <Footer
          onNavigateHome={handleNavigateHome}
          onNavigateExistingDesigns={handleNavigateExistingDesigns}
          onNavigateAdmin={handleNavigateAdmin}
        />
      )}

      {/* 11. Floating Accessible WhatsApp Button */}
      {currentPage !== 'admin' && currentPage !== 'bill' && <FloatingWhatsApp />}
    </div>
  );
}

