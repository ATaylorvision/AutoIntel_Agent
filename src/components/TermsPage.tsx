import React from 'react';

interface TermsPageProps {
  onBack: () => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onBack }) => {
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
            Terms of Service
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Last Updated: September 2026. AutoIntel Agent by G2G Intelligence.
          </p>
        </div>

        <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">1. Overview and Service Scope</h2>
            <p>
              AutoIntel Agent provides automated telephone answering and customer inquiry intake for independent auto repair shops. The service forwards urgent calls, captures caller symptoms, vehicle details, and appointment requests, and sends notifications to the designated shop mobile number.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">2. Subscriptions and Payments</h2>
            <p>
              The service is billed on a monthly subscription rate of $199 per month with a one-time non-refundable setup fee of $299. Subscriptions renew automatically each month until canceled by the shop owner in their portal or via support.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">3. Same-Day Activation</h2>
            <p>
              Shops that complete registration and setup fee payment before the posted daily cutoff time (Eastern Time) receive activation by end of business that day. Accounts registered after the cutoff are activated on the following business day.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
