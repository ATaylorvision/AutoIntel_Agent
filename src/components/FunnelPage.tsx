import React, { useState } from 'react';
import {
  Phone, ArrowRight, Clock, Shield, ChevronDown, CheckCircle, PhoneMissed,
  Car, BellRing, Siren, Wrench,
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext.tsx';

interface FunnelPageProps {
  onOpenSignUp: () => void;
  onOpenAudit: () => void;
  onOpenPricing: () => void;
}

// Share of missed callers who would have booked a job. Shown to the visitor, not hidden.
const BOOKING_RATE = 0.25;
const WEEKS_PER_MONTH = 4.33;
const MONTHLY_PRICE = 199;
const SETUP_FEE = 299;

const money = (n: number) => '$' + Math.round(n).toLocaleString('en-US');

const faqs = [
  {
    q: 'What happens with emergency or tow calls?',
    a: 'They are transferred live to the number you choose. The receptionist recognizes urgency and routes the call instead of taking a message.',
  },
  {
    q: 'Do I need a new phone number or hardware?',
    a: 'No. We set up call forwarding from your current business line. When your team cannot answer, calls roll to your receptionist.',
  },
  {
    q: 'Will callers know it is AI?',
    a: 'It is built to sound natural and professional. Call the demo line and judge for yourself before you spend anything.',
  },
  {
    q: 'How fast can it be live?',
    a: 'Sign up before the daily cutoff and it goes live the same day. After that, first thing the next business day.',
  },
  {
    q: 'Can I cancel?',
    a: 'Yes, any time. No long-term contract. The subscription ends at the close of your billing period.',
  },
  {
    q: 'Does it handle Spanish-speaking callers?',
    a: 'Not yet. It is English only today. Multilingual support is on the roadmap.',
  },
];

export const FunnelPage: React.FC<FunnelPageProps> = ({ onOpenSignUp, onOpenAudit, onOpenPricing }) => {
  const { settings } = useSettings();
  const cutoffTime = settings.sameDayCutoff || '2:00 PM';
  const supportPhone = settings.supportPhone || '888-212-1629';
  const telHref = `tel:${supportPhone.replace(/[^0-9]/g, '')}`;

  const [weeklyCalls, setWeeklyCalls] = useState(100);
  const [missedPct, setMissedPct] = useState(20);
  const [ticket, setTicket] = useState(450);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const missedPerMonth = Math.round(weeklyCalls * (missedPct / 100) * WEEKS_PER_MONTH);
  const jobsLost = Math.round(missedPerMonth * BOOKING_RATE);
  const revenueLost = jobsLost * ticket;
  const jobsToPayBack = Math.max(1, Math.ceil(MONTHLY_PRICE / ticket));

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const Slider = ({
    label, value, min, max, step, onChange, display,
  }: {
    label: string; value: number; min: number; max: number; step: number;
    onChange: (v: number) => void; display: string;
  }) => (
    <label className="block">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-sm font-semibold text-gray-800">{label}</span>
        <span className="text-lg font-black text-gray-950 tabular-nums">{display}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 accent-purple-600 cursor-pointer"
      />
    </label>
  );

  return (
    <div className="bg-[#fcfcfd] text-gray-900">
      {/* Minimal funnel bar: logo, call, one CTA. No site navigation. */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-black text-[#d6bcfa] flex items-center justify-center text-sm font-black">A</div>
            <span className="font-extrabold text-gray-950 tracking-tight">AutoIntel</span>
          </div>
          <div className="flex items-center gap-2">
            <a href={telHref} className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-gray-800 px-3 min-h-[40px]">
              <Phone className="w-4 h-4" /> {supportPhone}
            </a>
            <button
              type="button" onClick={onOpenSignUp}
              className="px-4 min-h-[40px] bg-black hover:bg-gray-800 text-white text-sm font-bold rounded-full"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* 1. HERO */}
      <section className="max-w-4xl mx-auto px-4 pt-10 sm:pt-16 pb-12 text-center space-y-6">
        <div className="inline-flex items-center gap-2 bg-[#faf5ff] border border-[#d6bcfa] px-3.5 py-1.5 rounded-full text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          For independent auto repair shops
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-gray-950 tracking-tight leading-[1.08]">
          Stop sending repair jobs <span className="text-purple-600">to voicemail.</span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
          An AI receptionist that answers every call your team can't, captures the customer and their vehicle, and texts you the job. Live today, from $199/month.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto pt-2">
          <button
            type="button" onClick={() => scrollTo('calculator')}
            className="w-full sm:w-auto px-7 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full min-h-[52px] shadow-sm flex items-center justify-center gap-2"
          >
            See what missed calls cost me <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href={telHref}
            className="w-full sm:w-auto px-7 py-4 bg-white border-2 border-gray-900 text-gray-950 font-bold rounded-full min-h-[52px] flex items-center justify-center gap-2"
          >
            <Phone className="w-4 h-4" /> Hear it live
          </a>
        </div>
        <p className="text-xs text-gray-500">Call {supportPhone} any time. It picks up 24/7.</p>
      </section>

      {/* 2. PROBLEM */}
      <section className="max-w-5xl mx-auto px-4 pb-14">
        <div className="bg-gray-950 text-white rounded-3xl p-6 sm:p-12 grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <PhoneMissed className="w-8 h-8 text-[#d6bcfa]" />
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Your techs are under a lift. The phone is ringing.
            </h2>
            <p className="text-gray-300 leading-relaxed">
              A driver with a warning light doesn't leave a voicemail. They call the next shop on the list until a person picks up. Every unanswered ring is a job that went somewhere else.
            </p>
          </div>
          <ul className="space-y-3 text-sm">
            {[
              'Calls during busy hours and lunch',
              'Calls after you close, when people finally have time to call',
              'Calls while you are on another call',
              'Weekend calls for Monday-morning jobs',
            ].map((t) => (
              <li key={t} className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-3.5">
                <CheckCircle className="w-5 h-5 text-[#d6bcfa] shrink-0 mt-0.5" /> {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3. CALCULATOR: the micro-commitment step */}
      <section id="calculator" className="max-w-4xl mx-auto px-4 pb-16 scroll-mt-20">
        <div className="text-center space-y-2 mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
            10-second estimate
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-950 tracking-tight">
            What are missed calls costing your shop?
          </h2>
        </div>
        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 sm:p-10 grid md:grid-cols-2 gap-8 sm:gap-10">
          <div className="space-y-7">
            <Slider label="Calls per week" value={weeklyCalls} min={20} max={400} step={5} onChange={setWeeklyCalls} display={String(weeklyCalls)} />
            <Slider label="Share you miss" value={missedPct} min={5} max={60} step={1} onChange={setMissedPct} display={`${missedPct}%`} />
            <Slider label="Average repair ticket" value={ticket} min={100} max={1500} step={25} onChange={setTicket} display={money(ticket)} />
            <p className="text-xs text-gray-500 leading-relaxed">
              Assumes {Math.round(BOOKING_RATE * 100)}% of missed callers would have booked. Move the sliders to match your shop. This is an estimate, not a guarantee.
            </p>
          </div>

          <div className="bg-[#faf5ff] border-2 border-[#d6bcfa] rounded-2xl p-6 flex flex-col justify-between gap-5" aria-live="polite">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-600">Estimated revenue walking out the door</p>
              <p className="text-5xl sm:text-6xl font-black text-gray-950 tracking-tight tabular-nums mt-1">
                {money(revenueLost)}<span className="text-lg font-bold text-gray-600">/mo</span>
              </p>
              <p className="text-sm text-gray-700 mt-2">
                About {missedPerMonth} missed calls and {jobsLost} lost jobs a month.
              </p>
            </div>
            <div className="text-sm text-gray-800 bg-white rounded-xl border border-[#e9d8fd] p-3.5">
              AutoIntel costs {money(MONTHLY_PRICE)}/month. At your ticket size, recovering <strong>{jobsToPayBack} job{jobsToPayBack > 1 ? 's' : ''} a month</strong> covers it.
            </div>
            <button
              type="button" onClick={onOpenSignUp}
              className="w-full py-4 bg-black hover:bg-gray-800 text-white font-bold rounded-xl min-h-[52px] flex items-center justify-center gap-2"
            >
              Start recovering these jobs <ArrowRight className="w-4 h-4 text-[#d6bcfa]" />
            </button>
            <button type="button" onClick={onOpenAudit} className="text-xs font-semibold text-purple-700 underline underline-offset-2">
              Want a fuller breakdown? Run the full audit
            </button>
          </div>
        </div>
      </section>

      {/* 4. SOLUTION / WHAT YOU GET */}
      <section className="max-w-5xl mx-auto px-4 pb-16 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-950 tracking-tight">Every call answered. Every detail captured.</h2>
          <p className="text-gray-600">Built for auto repair, not a generic answering service.</p>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { i: BellRing, t: 'Answers 24/7', d: 'Busy, closed, or on another line. Every caller gets an instant pickup.' },
            { i: Car, t: 'Gets the vehicle', d: 'Year, make, model, symptoms and urgency, collected before you call back.' },
            { i: Wrench, t: 'Requests appointments', d: 'Callers who want to come in are captured as appointment requests.' },
            { i: Siren, t: 'Transfers emergencies', d: 'Tow and emergency calls go live to your number.' },
          ].map(({ i: Icon, t, d }) => (
            <div key={t} className="bg-white border border-gray-200 rounded-2xl p-5 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-black text-[#d6bcfa] flex items-center justify-center"><Icon className="w-5 h-5" /></div>
              <h3 className="font-bold text-gray-950">{t}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{d}</p>
            </div>
          ))}
        </div>

        {/* Sample summary */}
        <div className="max-w-md mx-auto bg-white border border-gray-200 rounded-3xl shadow-lg p-5 space-y-3 text-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-black text-[#d6bcfa] flex items-center justify-center text-xs font-black">A</div>
              <span className="font-bold text-gray-950">New call summary</span>
            </div>
            <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">6:47 PM · After hours</span>
          </div>
          {[
            ['Caller', 'Maria Rodriguez'],
            ['Vehicle', '2019 Honda CR-V'],
            ['Needs', 'Brake squeal, pulling left'],
            ['Appointment', 'Tomorrow morning if possible'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3">
              <span className="text-gray-500">{k}</span>
              <span className="font-semibold text-gray-950 text-right">{v}</span>
            </div>
          ))}
          <p className="text-[11px] text-gray-400 text-center pt-1">Sample summary. This is what lands on your phone.</p>
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section className="max-w-4xl mx-auto px-4 pb-16 space-y-8">
        <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-950 tracking-tight text-center">Live in three steps</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            ['01', 'Sign up', 'Shop name and phone details. Under two minutes.'],
            ['02', 'We configure it', 'Your hours, services, vehicle questions and call routing, set up for you.'],
            ['03', 'Calls get answered', 'Forward your line. Summaries arrive on your phone.'],
          ].map(([n, t, d], idx) => (
            <div key={n} className={`rounded-2xl p-6 bg-white ${idx === 1 ? 'border-2 border-black' : 'border border-gray-200'}`}>
              <span className={`text-3xl font-black ${idx === 1 ? 'text-[#d6bcfa]' : 'text-gray-300'}`}>{n}</span>
              <h3 className="font-bold text-lg text-gray-950 mt-1">{t}</h3>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. OFFER */}
      <section id="offer" className="max-w-lg mx-auto px-4 pb-16 scroll-mt-20">
        <div className="bg-white border-2 border-gray-950 rounded-3xl p-6 sm:p-10 shadow-lg space-y-5">
          <div>
            <h2 className="text-2xl font-black text-gray-950">AutoIntel Agent</h2>
            <p className="text-sm text-gray-500">Complete shop receptionist</p>
          </div>
          <div className="flex items-baseline gap-2 py-3 border-y border-gray-100">
            <span className="text-5xl font-black text-gray-950">$199</span>
            <span className="font-bold text-gray-600">/month</span>
            <span className="ml-auto text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-1 rounded">+ {money(SETUP_FEE)} one-time setup</span>
          </div>
          <ul className="space-y-2.5 text-sm text-gray-800">
            {[
              '24/7 AI receptionist built for auto repair',
              'After-hours and missed-call answering',
              'Name, phone, vehicle and service on every call',
              'Call summaries on your phone',
              'Appointment requests',
              'Emergency and tow calls transferred to you',
              'Same-day setup',
            ].map((t) => (
              <li key={t} className="flex items-start gap-2.5">
                <CheckCircle className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" /> {t}
              </li>
            ))}
          </ul>
          <button
            type="button" onClick={onOpenSignUp}
            className="w-full py-4 bg-black hover:bg-gray-800 text-white font-bold text-base rounded-xl min-h-[52px] flex items-center justify-center gap-2"
          >
            Get Started <ArrowRight className="w-5 h-5 text-[#d6bcfa]" />
          </button>
          <div className="flex items-start gap-2 text-xs text-gray-600 bg-[#faf5ff] border border-[#d6bcfa] rounded-xl p-3">
            <Clock className="w-4 h-4 text-purple-800 shrink-0 mt-0.5" />
            <span><strong>Sign up by {cutoffTime} ET and it goes live today.</strong> After that, first thing next business day.</span>
          </div>
          <p className="text-[11px] text-gray-500 flex items-center justify-center gap-1.5">
            <Shield className="w-3.5 h-3.5" /> Cancel anytime. No lock-in contract.
          </p>
          <button type="button" onClick={onOpenPricing} className="block mx-auto text-xs font-semibold text-gray-500 underline underline-offset-2">
            Full pricing details
          </button>
        </div>
      </section>

      {/* 7. FAQ */}
      <section className="max-w-3xl mx-auto px-4 pb-16 space-y-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight text-center">Questions shop owners ask</h2>
        <div className="space-y-3">
          {faqs.map((f, idx) => {
            const open = openFaq === idx;
            return (
              <div key={f.q} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <button
                  type="button" aria-expanded={open}
                  onClick={() => setOpenFaq(open ? null : idx)}
                  className="w-full py-4 px-5 text-left flex items-center justify-between gap-4 font-bold text-gray-950 min-h-[48px]"
                >
                  <span>{f.q}</span>
                  <ChevronDown className={`w-5 h-5 shrink-0 transition-transform ${open ? 'rotate-180 text-purple-700' : 'text-gray-500'}`} />
                </button>
                {open && <div className="px-5 pb-4 text-sm text-gray-700 leading-relaxed">{f.a}</div>}
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. FINAL CTA */}
      <section className="max-w-4xl mx-auto px-4 pb-28 sm:pb-16 text-center">
        <div className="bg-[#faf5ff] border-2 border-[#d6bcfa] rounded-3xl p-8 sm:p-12 space-y-5">
          <h2 className="text-2xl sm:text-4xl font-black text-gray-950 tracking-tight">The next call is coming in. Who answers it?</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto">
            <button type="button" onClick={onOpenSignUp} className="w-full sm:w-auto px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full min-h-[52px] flex items-center justify-center gap-2">
              Get Started <ArrowRight className="w-4 h-4" />
            </button>
            <a href={telHref} className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-gray-900 text-gray-950 font-bold rounded-full min-h-[52px] flex items-center justify-center gap-2">
              <Phone className="w-4 h-4" /> {supportPhone}
            </a>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-6">
          © AutoIntel Agent · <button type="button" onClick={() => (window.location.href = '/terms')} className="underline">Terms</button> · <button type="button" onClick={() => (window.location.href = '/privacy')} className="underline">Privacy</button>
        </p>
      </section>

      {/* Mobile sticky CTA */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-gray-200 p-3 flex gap-2">
        <a href={telHref} aria-label="Call demo line" className="w-12 min-h-[48px] rounded-xl border-2 border-gray-900 flex items-center justify-center">
          <Phone className="w-5 h-5" />
        </a>
        <button type="button" onClick={onOpenSignUp} className="flex-1 min-h-[48px] bg-black text-white font-bold rounded-xl">
          Get Started · $199/mo
        </button>
      </div>
    </div>
  );
};
