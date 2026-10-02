import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { createWhatsAppLink, WHATSAPP_MESSAGES } from '../../lib/whatsapp/whatsapp';

export const FloatingWhatsApp: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <aside
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center select-none"
      aria-label="Instant WhatsApp Assistance"
    >
      {/* Tooltip speech bubble on desktop */}
      <div
        className={`hidden sm:flex items-center gap-2 mr-3 rounded-lg bg-white px-3.5 py-2 text-xs font-semibold text-zinc-800 shadow-md border border-zinc-200 transition-all duration-200 ${
          showTooltip ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none'
        }`}
      >
        <span>Questions? Chat with our framing team</span>
      </div>

      {/* Floating Action Button (Refined: No aggressive animation, accessible, safe spacing) */}
      <a
        href={createWhatsAppLink(WHATSAPP_MESSAGES.general)}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="group relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#20ba59] hover:shadow-xl active:scale-95 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
        aria-label="Chat with MomentPress on WhatsApp (opens in new tab)"
      >
        <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true" />
      </a>
    </aside>
  );
};
