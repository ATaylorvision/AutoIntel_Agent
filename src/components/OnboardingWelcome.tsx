import React from 'react';
import { ArrowRight, Clock, ShieldCheck, Sparkles, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface OnboardingWelcomeProps {
  onStartWizard: () => void;
}

export const OnboardingWelcome: React.FC<OnboardingWelcomeProps> = ({ onStartWizard }) => {
  const { shopRecord } = useAuth();
  const shopName = shopRecord?.shopName || 'Your Shop';

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 md:py-16">
      <div className="bg-white border-2 border-black rounded-3xl p-6 sm:p-10 shadow-lg space-y-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-[#faf5ff] border border-[#d6bcfa] text-gray-900 px-3.5 py-1.5 rounded-full text-xs font-semibold mx-auto">
          <Sparkles className="w-3.5 h-3.5 text-purple-700" />
          <span>Payment Confirmed</span>
        </div>

        {/* Headline */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight">
            You're in. Let's set up your receptionist.
          </h1>
          <p className="text-base text-gray-600 max-w-lg mx-auto leading-relaxed">
            This takes about 10 minutes, and you can stop and come back anytime.
          </p>
        </div>

        {/* Key Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-1">
            <span className="text-xs font-bold text-gray-900 block">Step-by-Step</span>
            <p className="text-xs text-gray-600">
              One simple screen at a time. Nothing technical.
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-1">
            <span className="text-xs font-bold text-gray-900 block">Auto-Saved</span>
            <p className="text-xs text-gray-600">
              Saves after every question so you never lose progress.
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-1">
            <span className="text-xs font-bold text-gray-900 block">Same-Day Go-Live</span>
            <p className="text-xs text-gray-600">
              Our team begins configuring your line the moment you finish.
            </p>
          </div>
        </div>

        {/* Start Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onStartWizard}
            className="w-full sm:w-auto px-8 py-4 bg-[#d6bcfa] hover:bg-[#c49efa] text-gray-950 font-bold text-base rounded-xl min-h-[48px] shadow-sm inline-flex items-center justify-center gap-2 transition-all"
          >
            <span>Start Setting Up {shopName}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-gray-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Need help? Call our support team at 888-212-1629 anytime.</span>
        </p>
      </div>
    </div>
  );
};
