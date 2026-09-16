import React from 'react';

interface PrivacyPageProps {
  onBack: () => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onBack }) => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <button
        onClick={onBack}
        className="text-xs font-semibold text-gray-500 hover:text-black py-2 min-h-[44px] flex items-center"
      >
        ← Back
      </button>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-10 shadow-sm space-y-6">
        <div className="border-b border-gray-100 pb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
            Privacy Policy
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Last Updated: September 2026. AutoIntel Agent by G2G Intelligence.
          </p>
        </div>

        <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">1. Customer Information We Collect</h2>
            <p>
              When callers contact your shop telephone line, our answering service records customer contact phone numbers, customer names, spoken vehicle descriptions, and reported service needs.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">2. How Information Is Shared</h2>
            <p>
              Inquiry details and call summaries are forwarded directly to the shop owner via secure mobile messages and your authenticated portal. We do not sell shop customer lists or phone numbers to third parties.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">3. Payment Security</h2>
            <p>
              Credit card data is collected directly by our payment processor (Stripe) and is never processed through or stored on our web app servers.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
