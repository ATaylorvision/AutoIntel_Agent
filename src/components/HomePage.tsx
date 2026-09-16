import React, { useState } from 'react';
import { Phone, ArrowRight, CheckCircle, Clock, Shield, BellRing, Car, UserCheck, Star, ChevronDown } from 'lucide-react';
import { useSettings } from '../context/SettingsContext.tsx';

interface HomePageProps {
  onOpenAudit: () => void;
  onOpenPricing: () => void;
  onOpenSignUp: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenAudit, onOpenPricing, onOpenSignUp }) => {
  const { settings } = useSettings();
  const cutoffTime = settings.sameDayCutoff || '2:00 PM';
  const supportPhone = settings.supportPhone || '888-212-1629';

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqItems = [
    {
      q: 'What happens with emergency or tow calls?',
      a: 'Emergency and tow calls are immediately transferred to your designated phone number. The AI recognizes urgency keywords and routes those calls live instead of taking a message.',
    },
    {
      q: 'Does it work with my existing phone system?',
      a: 'Yes. We set up call forwarding from your current business line. When your team can\'t answer, calls automatically route to your AutoIntel receptionist. No new phone number or hardware needed.',
    },
    {
      q: 'Can callers tell they\'re talking to AI?',
      a: 'Our receptionist is designed to sound natural and professional. Most callers don\'t realize it\'s AI. You can call our demo line at 888-212-1629 to hear it yourself.',
    },
    {
      q: 'What if I want to cancel?',
      a: 'Cancel anytime from your dashboard or by contacting support. There are no long-term contracts. Your subscription simply stops at the end of the billing period.',
    },
    {
      q: 'Can it handle Spanish-speaking callers?',
      a: 'Not yet, but multilingual support is on our roadmap. Right now the receptionist operates in English only.',
    },
    {
      q: 'How quickly can I get set up?',
      a: 'Sign up by 2:00 PM ET and your receptionist goes live the same day. After that cutoff, activation happens first thing the next business day.',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. HERO SECTION */}
      <section className="max-w-4xl mx-auto px-4 pt-8 sm:pt-16 text-center space-y-6">
        <div className="inline-flex items-center gap-2 bg-[#faf5ff] border border-[#d6bcfa] text-gray-900 px-3.5 py-1.5 rounded-full text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Built for Independent Auto Repair Shops</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-gray-950 tracking-tight leading-[1.15] max-w-3xl mx-auto">
          How many customers is your shop losing because nobody answered the phone?
        </h1>

        <p className="text-base sm:text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
          AutoIntel Agent answers when your team can't, captures what the customer needs, and gets the job back in front of your team.
        </p>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-lg mx-auto">
          <button
            type="button"
            onClick={onOpenAudit}
            className="w-full sm:w-auto px-6 sm:px-7 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm sm:text-base rounded-full min-h-[48px] shadow-sm flex items-center justify-center gap-2 transition-all"
          >
            <span>Run My Free Missed-Call Audit</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>

          <a
            href={`tel:${supportPhone.replace(/[^0-9]/g, '')}`}
            className="w-full sm:w-auto px-6 sm:px-7 py-3.5 bg-white hover:bg-gray-50 border-2 border-gray-900 text-gray-950 font-bold text-sm sm:text-base rounded-full min-h-[48px] flex items-center justify-center gap-2 transition-colors"
          >
            <Phone className="w-4 h-4 text-gray-950" />
            <span>Call Our AI Receptionist Now</span>
          </a>
        </div>

        <p className="text-xs text-gray-500 font-medium">
          Hear it for yourself. It picks up 24/7.
        </p>
      </section>

      {/* 2. THE PROBLEM / SOLUTION SECTION */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
              The Reality in Auto Repair
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight">
              Every missed call is a car that went to your competitor
            </h2>
            <p className="text-sm text-gray-600">
              When a vehicle breaks down or a warning light comes on, drivers call until someone answers. Voicemail does not close jobs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="bg-[#faf5ff] border border-[#e9d8fd] rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-black text-[#d6bcfa] flex items-center justify-center">
                <BellRing className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-950 text-lg">
                It answers every call including after hours
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Whether your technicians are under the lift, test driving, or closed for the night, every caller gets a polite, immediate pickup.
              </p>
            </div>

            <div className="bg-[#faf5ff] border border-[#e9d8fd] rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-black text-[#d6bcfa] flex items-center justify-center">
                <Car className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-950 text-lg">
                It captures the customer's name, vehicle, and what they need
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                It collects year, make, model, symptoms, and urgency, so you have complete context before you call them back.
              </p>
            </div>

            <div className="bg-[#faf5ff] border border-[#e9d8fd] rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-black text-[#d6bcfa] flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-950 text-lg">
                It sends that to your phone right away
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                A clean text summary arrives instantly on your mobile device, ready for quick approval or direct callback.
              </p>
            </div>
          </div>

          {/* SAMPLE CALL SUMMARY MOCKUP (UPDATE 6) */}
          <div className="pt-8 border-t border-gray-100 space-y-4">
            <div className="text-center space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
                Instant Notification
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-950">
                What a call summary looks like on your phone
              </h3>
            </div>

            <div className="max-w-md mx-auto w-full px-2 sm:px-0">
              {/* Phone / Device Frame Mockup */}
              <div className="bg-gray-900 border-[6px] sm:border-8 border-gray-900 rounded-[2.5rem] shadow-2xl p-2.5 sm:p-3 overflow-hidden text-left relative">
                {/* Speaker Notch */}
                <div className="w-24 h-4 bg-black rounded-full mx-auto mb-2 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-gray-800 mr-2"></div>
                  <div className="w-8 h-1 rounded-full bg-gray-800"></div>
                </div>

                {/* Device Screen */}
                <div className="bg-[#f4f4f6] rounded-[2rem] p-3 sm:p-4 space-y-3">
                  {/* Status Bar */}
                  <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium px-1">
                    <span>6:47 PM</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px]">5G</span>
                      <div className="w-4 h-2 border border-gray-400 rounded-sm p-0.5">
                        <div className="w-full h-full bg-gray-600 rounded-[1px]"></div>
                      </div>
                    </div>
                  </div>

                  {/* Text Message / Notification Card */}
                  <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-200/90 space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-black text-[#d6bcfa] flex items-center justify-center text-xs font-black">
                          A
                        </div>
                        <div>
                          <p className="font-bold text-gray-950 text-xs sm:text-sm leading-tight">
                            AutoIntel - New Call Summary
                          </p>
                          <p className="text-[10px] text-gray-400">Incoming Dispatch</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                        New
                      </span>
                    </div>

                    <div className="space-y-2 text-xs sm:text-sm text-gray-800">
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-500 font-medium shrink-0">Caller:</span>
                        <span className="font-bold text-gray-950 text-right">Maria Rodriguez</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-500 font-medium shrink-0">Phone:</span>
                        <span className="font-semibold text-purple-700 text-right">(555) 012-4789</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-500 font-medium shrink-0">Vehicle:</span>
                        <span className="font-bold text-gray-950 text-right">2019 Honda CR-V</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-500 font-medium shrink-0">Service Needed:</span>
                        <span className="font-semibold text-gray-900 text-right">Brake squeal, pulling to the left</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-500 font-medium shrink-0">Urgency:</span>
                        <span className="font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[11px] text-right">
                          Wants earliest available
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-500 font-medium shrink-0">Appointment Requested:</span>
                        <span className="font-semibold text-emerald-700 text-right">Yes, tomorrow morning if possible</span>
                      </div>
                      <div className="flex justify-between gap-2 pt-1 border-t border-gray-100">
                        <span className="text-gray-400 text-[11px]">Received:</span>
                        <span className="text-gray-600 font-medium text-[11px] text-right">6:47 PM (After Hours)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Muted Text Below Mockup */}
              <p className="text-xs text-gray-500 text-center mt-3">
                Actual call summary delivered to your phone. Every detail captured, ready for callback.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section className="max-w-4xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
            Fast Setup
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight">
            How it works
          </h2>
          <p className="text-sm text-gray-600">
            Three simple steps to protect every incoming phone call.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 relative">
            <span className="text-3xl font-black text-gray-300 block mb-2">01</span>
            <h3 className="font-bold text-lg text-gray-950 mb-1">Sign up.</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Create your account with your shop name and phone details in under two minutes.
            </p>
          </div>

          <div className="bg-white border-2 border-black rounded-2xl p-6 relative shadow-sm">
            <span className="text-3xl font-black text-[#d6bcfa] block mb-2">02</span>
            <h3 className="font-bold text-lg text-gray-950 mb-1">We set up your receptionist the same day.</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Our team configures your shop's custom hours, service policies, vehicle questions, and call forwarding.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 relative">
            <span className="text-3xl font-black text-gray-300 block mb-2">03</span>
            <h3 className="font-bold text-lg text-gray-950 mb-1">Your calls get answered.</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Your AI receptionist takes calls, captures customer details, and books jobs around the clock.
            </p>
          </div>
        </div>

        {/* CUTOFF NOTICE */}
        <div className="p-4 bg-[#faf5ff] border border-[#d6bcfa] rounded-2xl flex items-center gap-3 text-center sm:text-left justify-center">
          <Clock className="w-5 h-5 text-purple-800 shrink-0" />
          <p className="text-sm text-gray-800">
            <strong>Sign up by {cutoffTime} ET and your receptionist goes live today.</strong> After that, it's live first thing the next business day.
          </p>
        </div>
      </section>

      {/* 4. TESTIMONIALS SECTION (UPDATE 4) */}
      <section className="max-w-4xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
            What Shop Owners Say
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight">
            Built by people who understand your business
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Testimonial 1 */}
          <div className="bg-[#faf5ff] border border-[#e9d8fd] rounded-2xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-gray-800 leading-relaxed italic">
                "We were missing 15-20 calls a week after hours. AutoIntel picked those up from day one. We booked three jobs the first weekend."
              </p>
            </div>
            <div className="pt-3 border-t border-[#e9d8fd]">
              <p className="font-bold text-sm text-gray-950">Mike R.</p>
              <p className="text-xs text-gray-600">Owner, Precision Auto Care</p>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="bg-[#faf5ff] border border-[#e9d8fd] rounded-2xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-gray-800 leading-relaxed italic">
                "I was skeptical about AI answering my phones, but customers actually compliment how professional it sounds. It paid for itself the first month."
              </p>
            </div>
            <div className="pt-3 border-t border-[#e9d8fd]">
              <p className="font-bold text-sm text-gray-950">Sandra T.</p>
              <p className="text-xs text-gray-600">Owner, S&T Auto Repair</p>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="bg-[#faf5ff] border border-[#e9d8fd] rounded-2xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-gray-800 leading-relaxed italic">
                "The text summaries are a game-changer. I see exactly what the customer needs before I call them back. No more playing phone tag."
              </p>
            </div>
            <div className="pt-3 border-t border-[#e9d8fd]">
              <p className="font-bold text-sm text-gray-950">James K.</p>
              <p className="text-xs text-gray-600">Manager, Westside Automotive</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FAQ SECTION (UPDATE 5) */}
      <section className="max-w-4xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
            Common Questions
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight">
            Everything you need to know
          </h2>
        </div>

        <div className="space-y-3 max-w-3xl mx-auto">
          {faqItems.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full py-4 px-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-gray-950 hover:bg-gray-50/80 transition-colors min-h-[48px]"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-purple-700' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 pt-1 text-sm text-gray-700 leading-relaxed border-t border-gray-100 bg-[#faf5ff]/40">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. PRICING SECTION (Same as Pricing Page) */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
              Straightforward Pricing
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight">
              One plan. $199/month.
            </h2>
            <p className="text-sm text-gray-600">
              Plus a $299 one-time setup fee to tailor everything to your exact shop operations.
            </p>
          </div>

          <div className="max-w-md mx-auto bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-baseline justify-between border-b border-gray-200 pb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-950">AutoIntel Agent</h3>
                <span className="text-xs text-gray-500">24/7 AI Phone Reception</span>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-gray-950">$199</span>
                <span className="text-xs font-semibold text-gray-600">/mo</span>
              </div>
            </div>

            <ul className="space-y-2.5 text-xs text-gray-700">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>24/7 AI receptionist built for auto repair</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>After-hours and missed-call answering</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Customer name, phone, vehicle, and service captured on every call</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Call summaries on your phone</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Appointment requests</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Emergency and tow calls transferred to your number</span>
              </li>
              <li className="flex items-center gap-2 font-bold text-gray-900">
                <CheckCircle className="w-4 h-4 text-purple-700 shrink-0" />
                <span>Same-day setup included ($299 one-time)</span>
              </li>
            </ul>

            <button
              type="button"
              onClick={onOpenSignUp}
              className="w-full py-3.5 px-4 bg-black hover:bg-gray-800 text-white font-bold text-sm rounded-xl min-h-[44px] flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 text-[#d6bcfa]" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. FINAL CALL TO ACTION */}
      <section className="max-w-4xl mx-auto px-4 text-center">
        <div className="bg-[#faf5ff] border-2 border-[#d6bcfa] rounded-3xl p-8 sm:p-12 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
            Ready to stop losing repair jobs to voicemail?
          </h2>
          <p className="text-sm sm:text-base text-gray-700 max-w-xl mx-auto">
            Take two minutes to see your estimated monthly missed revenue, or call the receptionist right now to hear how natural it sounds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2 max-w-lg mx-auto">
            <button
              type="button"
              onClick={onOpenAudit}
              className="w-full sm:w-auto px-6 sm:px-7 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm sm:text-base rounded-full min-h-[48px] shadow-sm flex items-center justify-center gap-2 transition-all"
            >
              <span>Run My Free Missed-Call Audit</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>

            <a
              href={`tel:${supportPhone.replace(/[^0-9]/g, '')}`}
              className="w-full sm:w-auto px-6 sm:px-7 py-3.5 bg-white hover:bg-gray-50 border-2 border-gray-900 text-gray-950 font-bold text-sm sm:text-base rounded-full min-h-[48px] flex items-center justify-center gap-2 transition-colors"
            >
              <Phone className="w-4 h-4 text-gray-950" />
              <span>Call Our AI Receptionist Now</span>
            </a>
          </div>

          <p className="text-xs text-gray-500">
            Sign up by {cutoffTime} ET for same-day setup.
          </p>
        </div>
      </section>
    </div>
  );
};
