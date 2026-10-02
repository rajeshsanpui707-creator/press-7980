import React from 'react';
import {
  ShoppingCart,
  Home,
  Package,
  Maximize2,
  Sparkles,
  Layers,
  Image as ImageIcon,
  HelpCircle,
  PhoneCall,
  Settings,
  Globe,
  Shield,
  LogOut,
  X,
  ExternalLink,
  ChevronRight,
  Star,
} from 'lucide-react';

export type AdminRoute =
  | 'orders'
  | 'homepage'
  | 'products'
  | 'frame-sizes'
  | 'quality'
  | 'sticker-sizes'
  | 'existing-designs'
  | 'reviews'
  | 'faq'
  | 'contact'
  | 'website-settings'
  | 'seo'
  | 'security';

export type AdminViewType = AdminRoute | string;

interface AdminSidebarProps {
  currentRoute: AdminRoute;
  onNavigate: (route: AdminRoute) => void;
  onBackToWebsite: () => void;
  onLogout: () => void;
  pendingOrdersCount?: number;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentRoute,
  onNavigate,
  onBackToWebsite,
  onLogout,
  pendingOrdersCount = 0,
  isMobileOpen,
  onCloseMobile,
}) => {
  const handleItemClick = (route: AdminRoute) => {
    onNavigate(route);
    onCloseMobile();
  };

  const websiteNavItems: { route: AdminRoute; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { route: 'homepage', label: 'Homepage', icon: Home },
    { route: 'products', label: 'Products', icon: Package },
    { route: 'frame-sizes', label: 'Frame Sizes', icon: Maximize2 },
    { route: 'quality', label: 'Quality / Paper Finish', icon: Sparkles },
    { route: 'sticker-sizes', label: 'Sticker Sizes', icon: Layers },
    { route: 'existing-designs', label: 'Existing Designs', icon: ImageIcon },
    { route: 'reviews', label: 'Reviews', icon: Star },
    { route: 'faq', label: 'FAQ', icon: HelpCircle },
  ];

  const settingsNavItems: { route: AdminRoute; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { route: 'contact', label: 'Contact & Social', icon: PhoneCall },
    { route: 'website-settings', label: 'Website Settings', icon: Settings },
    { route: 'seo', label: 'SEO', icon: Globe },
    { route: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-2xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Responsive Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#10100F] text-gray-300 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-[#262624] font-sans`}
      >
        {/* Brand Header */}
        <div className="h-14 border-b border-[#262624] px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#C25E34] text-white flex items-center justify-center text-xs font-serif font-bold shadow-xs">
              M
            </div>
            <div>
              <span className="text-sm font-bold text-white tracking-tight">
                MOMENTPRESS
              </span>
              <span className="text-[10px] text-gray-400 block -mt-0.5 tracking-wider uppercase font-semibold">
                Admin Panel
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-[#262624] cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Link Groups */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-5 text-xs font-medium scrollbar-thin">
          {/* Group 1: Orders */}
          <div>
            <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Orders
            </div>
            <button
              type="button"
              onClick={() => handleItemClick('orders')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-left cursor-pointer ${
                currentRoute === 'orders'
                  ? 'bg-[#C25E34] text-white font-semibold shadow-xs'
                  : 'text-gray-300 hover:text-white hover:bg-[#22211F]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingCart className="h-4 w-4 shrink-0" />
                <span>Online Orders</span>
              </div>
              {pendingOrdersCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 animate-pulse">
                  {pendingOrdersCount}
                </span>
              )}
            </button>
          </div>

          {/* Group 2: Website CMS */}
          <div>
            <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Website
            </div>
            <div className="space-y-1">
              {websiteNavItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = currentRoute === item.route;
                return (
                  <button
                    key={item.route}
                    type="button"
                    onClick={() => handleItemClick(item.route)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-left cursor-pointer ${
                      isActive
                        ? 'bg-[#C25E34] text-white font-semibold shadow-xs'
                        : 'text-gray-300 hover:text-white hover:bg-[#22211F]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <IconComponent className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="h-3 w-3 shrink-0 opacity-70" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Group 3: Settings */}
          <div>
            <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Settings
            </div>
            <div className="space-y-1">
              {settingsNavItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = currentRoute === item.route;
                return (
                  <button
                    key={item.route}
                    type="button"
                    onClick={() => handleItemClick(item.route)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-left cursor-pointer ${
                      isActive
                        ? 'bg-[#C25E34] text-white font-semibold shadow-xs'
                        : 'text-gray-300 hover:text-white hover:bg-[#22211F]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <IconComponent className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="h-3 w-3 shrink-0 opacity-70" />}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t border-[#262624] space-y-1.5 shrink-0">
          <button
            type="button"
            onClick={onBackToWebsite}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#1F1E1B] hover:bg-[#2B2925] text-gray-200 hover:text-white text-xs font-semibold transition-colors cursor-pointer border border-[#33312C]"
          >
            <ExternalLink className="h-3.5 w-3.5 text-[#C25E34]" />
            <span>View Public Website</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-950/20 text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
