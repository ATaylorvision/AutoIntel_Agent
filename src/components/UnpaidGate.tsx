import React, { useState } from 'react';
import { CreditCard, Clock, Shield, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useSettings } from '../context/SettingsContext.tsx';

interface UnpaidGateProps {
  onPaymentSuccess: () => void;
}

export const UnpaidGate: React.FC<UnpaidGateProps> = ({ onPaymentSuccess }) => {
  const { userRecord, shopRecord, refreshShop } = useAuth();
  const { settings } = useSettings();
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cutoffTime = settings.sameDayCutoff || '2:00 PM';
  const shopId = shopRecord?.id || userRecord?.shopId;

  const handleCheckout = async () => {
    if (!shopId) {
      setError('No shop profile found. Please contact support.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId,
          email: userRecord?.email,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize checkout.');
      }

      if (data.url) {
        // Redirect to Stripe Checkout (or test mode URL)
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received from server.');
      }
    } catch (err: any) {
      setError(err.message || 'Checkout failed to start.');
      setLoading(false);
    }
  };

  // Test mode simulation handler for instant verification
  const handleSimulatePayment = async () => {
    if (!shopId) return;
    setSimulating(true);
    setError(null);
    try {
      const res = await fetch('/api/checkout/simulate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Simulated payment failed.');
      }
      await refreshShop();
      onPaymentSuccess();
    } catch (err: any) {
      setError(err.message || 'Simulation error.');
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10 md:py-16">
      <div className="bg-white border-2 border-black rounded-3xl p-6 sm:p-10 shadow-lg space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
            Action Required: Finish Signing Up
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950">
            Activate Receptionist for {shopRecord?.shopName || 'Your Shop'}
          </h1>
          <p className="text-sm text-gray-600">
            Your account is created. Complete payment to activate your AI receptionist.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* CUTOFF NOTICE */}
        <div className="p-4 bg-[#faf5ff] border border-[#d6bcfa] rounded-2xl flex items-start gap-3">
          <Clock className="w-5 h-5 text-purple-800 shrink-0 mt-0.5" />
          <div className="text-xs text-gray-800">
            <p className="font-bold text-gray-950">
              Sign up by {cutoffTime} ET and your receptionist goes live today.
            </p>
            <p className="text-gray-600 mt-0.5">
              After that, it's live first thing the next business day.
            </p>
          </div>
        </div>

        {/* SUMMARY OF CHARGES */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-3">
          <div className="flex justify-between items-center text-sm font-semibold text-gray-900 border-b border-gray-200 pb-3">
            <span>AutoIntel Agent Monthly Subscription</span>
            <span>$199.00 / mo</span>
          </div>
          <div className="flex justify-between items-center text-sm font-semibold text-gray-900 border-b border-gray-200 pb-3">
            <div>
              <span>One-Time System Setup Fee</span>
              <span className="block text-[11px] font-normal text-gray-500">
                Custom voice, shop hours, vehicle intake, and routing
              </span>
            </div>
            <span>$299.00</span>
          </div>
          <div className="flex justify-between items-center text-base font-bold text-gray-950 pt-1">
            <span>Due Today</span>
            <span>$498.00</span>
          </div>
        </div>

        {/* BENEFITS CHECKLIST */}
        <ul className="space-y-2 text-xs text-gray-700">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>24/7 call answering so no customer goes to voicemail</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Instant SMS call summaries with customer and vehicle details</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Emergency and tow calls transferred to your mobile number</span>
          </li>
        </ul>

        {/* PRIMARY CHECKOUT BUTTON */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={handleCheckout}
            disabled={loading || simulating}
            className="w-full py-4 px-6 bg-black hover:bg-gray-800 text-white font-bold text-base rounded-xl min-h-[48px] flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
          >
            <CreditCard className="w-5 h-5 text-[#d6bcfa]" />
            <span>{loading ? 'Preparing Checkout...' : 'Proceed to Stripe Checkout'}</span>
          </button>

          {/* QUICK TEST MODE HELPER BUTTON */}
          <div className="pt-2 border-t border-gray-200 text-center">
            <p className="text-[11px] text-gray-400 mb-2">Development / Stripe Test Mode Evaluation:</p>
            <button
              type="button"
              onClick={handleSimulatePayment}
              disabled={loading || simulating}
              className="w-full py-2.5 px-4 bg-[#faf5ff] hover:bg-[#f3e8ff] border border-[#d6bcfa] text-gray-900 rounded-xl text-xs font-bold min-h-[44px] flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-purple-700" />
              <span>{simulating ? 'Simulating Payment...' : 'Instant Test Checkout (1-Click Test Simulation)'}</span>
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-gray-500 flex items-center justify-center gap-1">
          <Shield className="w-3.5 h-3.5 text-gray-400" />
          <span>Encrypted and processed securely with Stripe. Cancel anytime.</span>
        </p>
      </div>
    </div>
  );
};
