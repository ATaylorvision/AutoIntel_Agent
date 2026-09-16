import React from 'react';
import { Check, Clock, Phone, Shield, ArrowRight } from 'lucide-react';
import { useSettings } from '../context/SettingsContext.tsx';

interface PricingPageProps {
  onGetStarted: () => void;
  canceled?: boolean;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onGetStarted, canceled = false }) => {
  const { settings } = useSettings();
  const cutoffTime = settings.sameDayCutoff || '2:00 PM';
  const supportPhone = settings.supportPhone || '888-212-1629';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-16">
      {/* CANCELED RETURN BANNER */}
      {canceled && (
        <div className="mb-8 p-4 bg-gray-100 border border-gray-300 rounded-xl text-center text-sm font-medium text-gray-800">
          No problem. Your account is saved whenever you're ready.
        </div>
      )}

      {/* HEADER */}
      <div className="text-center space-y-3 mb-10">
        <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
          Simple, Transparent Pricing
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight">
          One plan. Everything your shop needs.
        </h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
          No per-minute penalties. No hidden fees. Your AI receptionist picks up 24/7 so you never lose another repair order.
        </p>
      </div>

      {/* SAME-DAY CUTOFF BANNER */}
      <div className="mb-8 p-4 bg-[#faf5ff] border border-[#d6bcfa] rounded-2xl flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
        <div className="w-10 h-10 rounded-full bg-[#d6bcfa] text-black flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5" />
        </div>
        <div className="text-sm text-gray-800">
          <span className="font-bold text-gray-900 block sm:inline">
            Sign up by {cutoffTime} ET and your receptionist goes live today.
          </span>{' '}
          <span>After that, it's live first thing the next business day.</span>
        </div>
      </div>

      {/* THE PLAN CARD */}
      <div className="max-w-lg mx-auto bg-white border-2 border-gray-950 rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
        {/* Top badge */}
        <div className="absolute top-0 right-0 bg-[#d6bcfa] text-gray-950 text-xs font-extrabold px-4 py-1.5 rounded-bl-xl uppercase tracking-wider">
          Complete Shop Receptionist
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-black text-gray-950">AutoIntel Agent</h2>
            <p className="text-xs text-gray-500 mt-1">Built specifically for independent auto repair shops.</p>
          </div>

          {/* Pricing figures */}
          <div className="py-3 border-y border-gray-100 flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black text-gray-950 tracking-tight">$199</span>
            <span className="text-sm font-bold text-gray-600">/month</span>
            <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded ml-auto">
              + $299 one-time setup
            </span>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed">
            The setup fee covers full custom voice configuration, your shop services, hours, vehicle question flows, and call-routing setup.
          </p>

          {/* Feature List */}
          <div className="pt-3">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
              Included in your plan:
            </p>
            <ul className="space-y-3 text-sm text-gray-800">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#faf5ff] border border-[#d6bcfa] text-purple-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>24/7 AI receptionist built for auto repair</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#faf5ff] border border-[#d6bcfa] text-purple-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>After-hours and missed-call answering</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#faf5ff] border border-[#d6bcfa] text-purple-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Customer name, phone, vehicle, and service captured on every call</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#faf5ff] border border-[#d6bcfa] text-purple-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Call summaries on your phone</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#faf5ff] border border-[#d6bcfa] text-purple-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Appointment requests</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#faf5ff] border border-[#d6bcfa] text-purple-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Emergency and tow calls transferred to your number</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#faf5ff] border border-[#d6bcfa] text-purple-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold text-gray-950">Same-day setup</span>
              </li>
            </ul>
          </div>

          {/* Primary CTA */}
          <div className="pt-4 space-y-3">
            <button
              onClick={onGetStarted}
              className="w-full py-4 px-6 bg-black hover:bg-gray-800 text-white font-bold text-base rounded-xl min-h-[48px] flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5 text-[#d6bcfa]" />
            </button>

            <a
              href={`tel:${supportPhone.replace(/[^0-9]/g, '')}`}
              className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 text-gray-800 font-semibold text-xs rounded-xl min-h-[44px] flex items-center justify-center gap-2 border border-gray-200 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-black" />
              <span>Hear it live right now: {supportPhone}</span>
            </a>
          </div>

          {/* Guarantee / trust line */}
          <div className="pt-3 text-center">
            <p className="text-[11px] text-gray-500 flex items-center justify-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-gray-400" />
              <span>Cancel anytime. No lock-in contracts.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
