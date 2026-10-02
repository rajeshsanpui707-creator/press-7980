import React, { useState } from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export const NewsletterForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();

    // Basic frontend email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmed) {
      setError('Please enter your email address.');
      return;
    }
    if (!emailRegex.test(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }

    setError(null);
    setIsSubmitted(true);
  };

  return (
    <div className="w-full">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#D6A64A] mb-2">
        Stay Connected
      </h3>
      <p className="text-sm font-serif font-bold text-[#FFFDF8] mb-1.5">
        Get 10% off your first order.
      </p>
      <p className="text-xs text-[#F3F0EA]/70 mb-4 leading-relaxed">
        Sign up for framing advice, new finishes, and holiday memory guides.
      </p>

      {isSubmitted ? (
        <div
          role="status"
          aria-live="polite"
          className="rounded-lg bg-[#10100F] border border-[#C25E34]/40 p-3.5 text-xs text-[#C25E34] flex items-start gap-2.5"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#C25E34] mt-0.5" aria-hidden="true" />
          <div>
            <span className="font-semibold block text-[#FFFDF8]">You're on the list.</span>
            <span className="text-[#F3F0EA]/70 text-[11px] block mt-0.5">
              Frontend confirmation only. Integration with your customer list will connect in Phase 5.
            </span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <label htmlFor="newsletter-email" className="sr-only">
              Enter your email
            </label>
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Enter your email"
              aria-describedby={error ? 'newsletter-error' : undefined}
              aria-invalid={Boolean(error)}
              className="w-full rounded-md border border-[#F3F0EA]/20 bg-[#10100F] px-3.5 py-2.5 text-xs text-[#FFFDF8] placeholder-[#6B6258] focus:border-[#C25E34] focus:outline-hidden focus:ring-1 focus:ring-[#C25E34] min-h-[42px]"
            />
            <button
              type="submit"
              className="shrink-0 rounded-md bg-white hover:bg-[#F3F0EA] px-4 py-2.5 text-xs font-semibold text-[#10100F] shadow-xs active:scale-[0.98] transition-colors focus-visible:outline-2 focus-visible:outline-white cursor-pointer min-h-[42px] flex items-center justify-center gap-1.5"
            >
              <span>Get My Offer</span>
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </button>
          </div>

          {error && (
            <p id="newsletter-error" role="alert" className="text-[11px] text-red-400 font-medium">
              {error}
            </p>
          )}

          <p className="text-[10px] text-[#F3F0EA]/50 font-mono">
            No spam. Unsubscribe anytime.
          </p>
        </form>
      )}
    </div>
  );
};
