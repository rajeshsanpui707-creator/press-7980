import React, { useState, useEffect, useCallback } from 'react';
import {
  Menu,
  LogOut,
  RefreshCw,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { AdminSidebar, AdminRoute } from './AdminSidebar';
import { OrdersPageView } from './pages/OrdersPageView';
import { ProductsPageView } from './pages/ProductsPageView';
import { FrameSizesPageView } from './pages/FrameSizesPageView';
import { QualityPageView } from './pages/QualityPageView';
import { StickerSizesPageView } from './pages/StickerSizesPageView';
import { HomepagePageView } from './pages/HomepagePageView';
import { ExistingDesignsPageView } from './pages/ExistingDesignsPageView';
import { ReviewsPageView } from './pages/ReviewsPageView';
import { FaqPageView } from './pages/FaqPageView';
import { ContactPageView } from './pages/ContactPageView';
import { WebsiteSettingsPageView } from './pages/WebsiteSettingsPageView';
import { SeoPageView } from './pages/SeoPageView';
import { SecurityPageView } from './pages/SecurityPageView';
import { AdminService } from '../../lib/admin/admin-service';

interface BusinessAdminDashboardProps {
  onBackToWebsite: () => void;
}

function getAdminRouteFromLocation(): AdminRoute {
  if (typeof window === 'undefined') return 'orders';
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();

  const check = (sub: string) => path.includes(`/admin/2008/${sub}`) || hash.includes(`admin/2008/${sub}`);

  if (check('orders')) return 'orders';
  if (check('homepage')) return 'homepage';
  if (check('products')) return 'products';
  if (check('frame-sizes')) return 'frame-sizes';
  if (check('quality')) return 'quality';
  if (check('sticker-sizes')) return 'sticker-sizes';
  if (check('existing-designs')) return 'existing-designs';
  if (check('reviews')) return 'reviews';
  if (check('faq')) return 'faq';
  if (check('contact')) return 'contact';
  if (check('website-settings')) return 'website-settings';
  if (check('seo')) return 'seo';
  if (check('security')) return 'security';

  return 'orders';
}

export const BusinessAdminDashboard: React.FC<BusinessAdminDashboardProps> = ({
  onBackToWebsite,
}) => {
  const [currentRoute, setCurrentRoute] = useState<AdminRoute>(getAdminRouteFromLocation);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isGlobalRefreshing, setIsGlobalRefreshing] = useState(false);
  const [dataVersion, setDataVersion] = useState(0);

  // Initialize and ensure canonical URL on mount
  useEffect(() => {
    AdminService.init();

    const initial = getAdminRouteFromLocation();
    setCurrentRoute(initial);

    // Normalize path to /admin/2008/{route}
    const targetPath = `/admin/2008/${initial}`;
    if (window.location.pathname !== targetPath) {
      window.history.replaceState(null, '', targetPath);
    }
  }, []);

  // Listen to popstate for browser Back & Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const route = getAdminRouteFromLocation();
      setCurrentRoute(route);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Navigate to route and record browser history
  const handleNavigate = useCallback((route: AdminRoute) => {
    setCurrentRoute(route);
    const targetUrl = `/admin/2008/${route}`;
    if (window.location.pathname !== targetUrl) {
      window.history.pushState(null, '', targetUrl);
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const handleGlobalRefresh = async () => {
    setIsGlobalRefreshing(true);
    try {
      await AdminService.syncFromServer();
      setDataVersion((v) => v + 1);
    } finally {
      setIsGlobalRefreshing(false);
    }
  };

  const handleLogout = async () => {
    await AdminService.logout();
    onBackToWebsite();
  };

  const onlineOrders = AdminService.getOnlineOrders();
  const pendingOrdersCount = onlineOrders.filter(
    (o) => o.orderStatus === 'New' || o.orderStatus === 'Pending'
  ).length;

  const getPageTitle = (): string => {
    switch (currentRoute) {
      case 'orders':
        return 'Online Orders';
      case 'homepage':
        return 'Website CMS — Homepage';
      case 'products':
        return 'Website CMS — Products';
      case 'frame-sizes':
        return 'Website CMS — Frame Sizes';
      case 'quality':
        return 'Website CMS — Quality / Paper Finish';
      case 'sticker-sizes':
        return 'Website CMS — Sticker Sizes';
      case 'existing-designs':
        return 'Website CMS — Existing Designs';
      case 'reviews':
        return 'Website CMS — Reviews';
      case 'faq':
        return 'Website CMS — FAQ';
      case 'contact':
        return 'Settings — Contact & Social';
      case 'website-settings':
        return 'Settings — Website Settings';
      case 'seo':
        return 'Settings — SEO';
      case 'security':
        return 'Settings — Security';
      default:
        return 'Admin Panel';
    }
  };

  return (
    <div key={dataVersion} className="min-h-screen bg-gray-100 flex font-sans text-gray-900 antialiased">
      {/* Responsive Fixed Sidebar */}
      <AdminSidebar
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        onBackToWebsite={onBackToWebsite}
        onLogout={handleLogout}
        pendingOrdersCount={pendingOrdersCount}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-14 bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 cursor-pointer shrink-0"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb path */}
            <div className="flex items-center gap-1.5 text-xs min-w-0">
              <span className="text-gray-400 font-semibold tracking-wide hidden sm:inline uppercase text-[10px]">
                Admin
              </span>
              <ChevronRight className="h-3 w-3 text-gray-300 hidden sm:inline" />
              <span className="font-bold text-gray-900 truncate">{getPageTitle()}</span>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleGlobalRefresh}
              disabled={isGlobalRefreshing}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors"
              title="Refresh All Server Data"
            >
              <RefreshCw className={`h-4 w-4 ${isGlobalRefreshing ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={onBackToWebsite}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-gray-700 transition-colors cursor-pointer"
            >
              <ExternalLink className="h-3.5 w-3.5 text-[#C25E34]" />
              <span className="hidden sm:inline">Storefront</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Dedicated Page Router Body */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden min-w-0">
          {currentRoute === 'orders' && <OrdersPageView />}
          {currentRoute === 'products' && <ProductsPageView />}
          {currentRoute === 'frame-sizes' && <FrameSizesPageView />}
          {currentRoute === 'quality' && <QualityPageView />}
          {currentRoute === 'sticker-sizes' && <StickerSizesPageView />}
          {currentRoute === 'homepage' && <HomepagePageView />}
          {currentRoute === 'existing-designs' && <ExistingDesignsPageView />}
          {currentRoute === 'reviews' && <ReviewsPageView />}
          {currentRoute === 'faq' && <FaqPageView />}
          {currentRoute === 'contact' && <ContactPageView />}
          {currentRoute === 'website-settings' && <WebsiteSettingsPageView />}
          {currentRoute === 'seo' && <SeoPageView />}
          {currentRoute === 'security' && <SecurityPageView />}
        </main>
      </div>
    </div>
  );
};
