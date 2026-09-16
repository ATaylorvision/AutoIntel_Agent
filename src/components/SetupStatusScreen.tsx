import React, { useState } from 'react';
import { CheckCircle2, Clock, Smartphone, PhoneCall, Sparkles, ArrowRight, Play } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useSettings } from '../context/SettingsContext.tsx';

interface SetupStatusScreenProps {
  onContinueWizard: () => void;
  onGoLiveSimulate?: () => void;
}

export const SetupStatusScreen: React.FC<SetupStatusScreenProps> = ({
  onContinueWizard,
  onGoLiveSimulate,
}) => {
  const { shopRecord, refreshShop } = useAuth();
  const { settings } = useSettings();
  const [activating, setActivating] = useState(false);

  const shopName = shopRecord?.shopName || 'Your Shop';
  const cutoffTime = settings.sameDayCutoff || '2:00 PM';
  const isInfoSubmitted = Boolean(shopRecord?.receptionistSetup?.completedAt);

  const handleSimulateLive = async () => {
    if (!shopRecord?.id) return;
    setActivating(true);
    try {
      await fetch(`/api/shops/${shopRecord.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'live',
          autointelNumber: shopRecord.autointelNumber || '888-212-1629',
        }),
      });
      await refreshShop();
      if (onGoLiveSimulate) {
        onGoLiveSimulate();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActivating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-12 space-y-6">
      <div className="bg-white border-2 border-black rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
        {/* Header */}
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center gap-1.5 bg-[#faf5ff] border border-[#d6bcfa] text-purple-900 px-3.5 py-1.5 rounded-full text-xs font-bold">
            <Clock className="w-3.5 h-3.5 text-purple-700" />
            <span>Provisioning in Progress</span>
          </div>
          <h1 className="text-3xl font-black text-gray-950">
            {shopName} is getting ready
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
            Our team is linking your answers to your dedicated phone line.
          </p>
        </div>

        {/* 3-Step Tracker */}
        <div className="space-y-4">
          {/* Step 1: Payment received */}
          <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-gray-950 block">1. Payment received</span>
                <span className="text-xs text-emerald-800 font-medium">Monthly plan and setup confirmed</span>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md">
              Done
            </span>
          </div>

          {/* Step 2: Your info is in */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
              isInfoSubmitted
                ? 'border-emerald-200 bg-emerald-50/40'
                : 'border-amber-300 bg-amber-50/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  isInfoSubmitted
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-500 text-white'
                }`}
              >
                {isInfoSubmitted ? <CheckCircle2 className="w-5 h-5" /> : '2'}
              </div>
              <div>
                <span className="text-sm font-bold text-gray-950 block">2. Your info is in</span>
                <span className="text-xs text-gray-600">
                  {isInfoSubmitted
                    ? 'Shop hours, services, and greeting recorded'
                    : 'A few details still need your review'}
                </span>
              </div>
            </div>

            {isInfoSubmitted ? (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md">
                Done
              </span>
            ) : (
              <button
                type="button"
                onClick={onContinueWizard}
                className="px-3.5 py-2 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-lg min-h-[44px] flex items-center gap-1.5 transition-colors"
              >
                <span>Complete Info</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#d6bcfa]" />
              </button>
            )}
          </div>

          {/* Step 3: Receptionist going live */}
          <div className="p-4 rounded-2xl border border-purple-200 bg-[#faf5ff] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-700 text-white flex items-center justify-center font-bold text-xs shrink-0 animate-pulse">
                3
              </div>
              <div>
                <span className="text-sm font-bold text-gray-950 block">
                  3. Receptionist going live
                </span>
                <span className="text-xs text-purple-900 font-medium">
                  Configuring phone system and voice model
                </span>
              </div>
            </div>
            <span className="text-xs font-bold text-purple-800 bg-purple-100 px-2.5 py-1 rounded-md">
              In progress
            </span>
          </div>
        </div>

        {/* The Same-Day Message */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-2 text-center">
          <p className="text-xs sm:text-sm font-semibold text-gray-900 leading-relaxed">
            Sign up by {cutoffTime} ET and your receptionist goes live today. After that, it's live first thing the next business day.
          </p>
          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-600 font-medium pt-1">
            <Smartphone className="w-4 h-4 text-purple-700" />
            <span>We'll text you the moment it's live.</span>
          </div>
        </div>

        {/* Support or Edit Option */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <button
            type="button"
            onClick={onContinueWizard}
            className="hover:text-black font-semibold min-h-[44px] flex items-center gap-1"
          >
            <span>Review or update your answers</span>
          </button>

          <a
            href="tel:888-212-1629"
            className="hover:text-black font-semibold min-h-[44px] flex items-center gap-1"
          >
            <PhoneCall className="w-3.5 h-3.5 text-gray-600" />
            <span>Questions? Call 888-212-1629</span>
          </a>
        </div>
      </div>

      {/* Demo / Testing Quick Activation Banner */}
      <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <span className="font-bold text-purple-950 block">Ready to test call scenarios?</span>
          <span className="text-purple-800">
            Activate the line now to try the four test scenario cards immediately.
          </span>
        </div>
        <button
          type="button"
          onClick={handleSimulateLive}
          disabled={activating}
          className="px-4 py-2.5 bg-black hover:bg-gray-800 text-white font-bold rounded-xl min-h-[44px] inline-flex items-center justify-center gap-1.5 shrink-0 transition-all"
        >
          <Play className="w-3.5 h-3.5 text-[#d6bcfa]" />
          <span>{activating ? 'Activating...' : 'Switch to Live & Test'}</span>
        </button>
      </div>
    </div>
  );
};
