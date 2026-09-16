import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, ArrowRight, Phone, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useSettings } from '../context/SettingsContext.tsx';

interface CheckoutSuccessProps {
  onContinueToPortal: () => void;
}

export const CheckoutSuccess: React.FC<CheckoutSuccessProps> = ({ onContinueToPortal }) => {
  const { userRecord, shopRecord, refreshShop } = useAuth();
  const { settings } = useSettings();
  const [checking, setChecking] = useState(true);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const cutoffTime = settings.sameDayCutoff || '2:00 PM';
  const shopId = shopRecord?.id || userRecord?.shopId;

  // Poll until shop status becomes paid_setup or active
  useEffect(() => {
    let intervalId: any;
    let attempts = 0;

    const checkStatus = async () => {
      attempts++;
      await refreshShop();

      if (
        shopRecord?.status === 'paid_setup' ||
        shopRecord?.status === 'active' ||
        shopRecord?.status === 'provisioning' ||
        shopRecord?.status === 'live'
      ) {
        setIsConfirmed(true);
        setChecking(false);
        if (intervalId) clearInterval(intervalId);
        // Automatically land on welcome screen if onboarding not yet completed
        if (!shopRecord?.receptionistSetup?.completedAt) {
          setTimeout(() => {
            onContinueToPortal();
          }, 800);
        }
      } else if (attempts > 12) {
        // After 24 seconds, stop auto-polling and offer manual verify
        setChecking(false);
      }
    };

    // Initial check
    checkStatus();

    intervalId = setInterval(checkStatus, 2000);
    return () => clearInterval(intervalId);
  }, [shopId, shopRecord?.status]);

  const handleManualVerify = async () => {
    if (!shopId) return;
    setIsSimulating(true);
    try {
      await fetch('/api/checkout/simulate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopId }),
      });
      await refreshShop();
      setIsConfirmed(true);
      setChecking(false);
      if (!shopRecord?.receptionistSetup?.completedAt) {
        setTimeout(() => onContinueToPortal(), 500);
      }
    } catch (e) {
      console.warn('Manual verify failed:', e);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12 md:py-20">
      <div className="bg-white border-2 border-black rounded-3xl p-6 sm:p-10 shadow-xl text-center space-y-6">
        {!isConfirmed ? (
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-[#faf5ff] border border-[#d6bcfa] flex items-center justify-center mx-auto text-purple-700">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-950">
                Confirming your payment...
              </h1>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                We're waiting for confirmation from our payment processor to activate your shop receptionist.
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl text-xs text-gray-500 border border-gray-200">
              This usually takes just a few moments. Once received, your onboarding checklist will appear automatically.
            </div>

            {!checking && (
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handleManualVerify}
                  disabled={isSimulating}
                  className="w-full py-3 px-4 bg-[#d6bcfa] hover:bg-[#c49efa] text-gray-950 font-bold text-xs rounded-xl min-h-[44px] flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {isSimulating ? 'Confirming...' : 'Click here to confirm payment immediately (Test Mode)'}
                  </span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Payment Confirmed
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-950">
                Welcome to AutoIntel Agent!
              </h1>
              <p className="text-sm text-gray-600">
                Your shop account for <strong>{shopRecord?.shopName || 'Your Shop'}</strong> is activated.
              </p>
            </div>

            {/* CUTOFF SETUP STATUS */}
            <div className="p-4 bg-[#faf5ff] border border-[#d6bcfa] rounded-2xl text-left text-xs text-gray-800 space-y-1">
              <p className="font-bold text-gray-950">
                Same-Day Activation in Progress
              </p>
              <p className="text-gray-600">
                Sign ups before {cutoffTime} ET go live today. Our engineering team is currently linking your phone system account.
              </p>
            </div>

            <button
              type="button"
              onClick={onContinueToPortal}
              className="w-full py-4 px-6 bg-black hover:bg-gray-800 text-white font-bold text-base rounded-xl min-h-[48px] flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <span>Continue to Shop Portal</span>
              <ArrowRight className="w-5 h-5 text-[#d6bcfa]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
