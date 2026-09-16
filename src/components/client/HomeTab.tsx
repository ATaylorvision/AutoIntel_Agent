import React from 'react';
import { ShopRecord, CallRecord, AppSettings } from '../../types/index.ts';
import { formatFriendlyTime, getOutcomeDotColor, getOutcomeLabel } from './callHelpers.ts';
import {
  PhoneCall,
  Users,
  CalendarCheck,
  Moon,
  Sparkles,
  AlertTriangle,
  CreditCard,
  Phone,
  Mail,
  ChevronRight,
  Inbox,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { SetupStatusScreen } from '../SetupStatusScreen.tsx';

interface HomeTabProps {
  shop: ShopRecord;
  calls: CallRecord[];
  settings: AppSettings;
  onOpenTest: () => void;
  onSelectCall: (call: CallRecord) => void;
  onGoToBilling: () => void;
  onContinueWizard?: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  shop,
  calls,
  settings,
  onOpenTest,
  onSelectCall,
  onGoToBilling,
  onContinueWizard,
}) => {
  const isLive = shop.status === 'live' || shop.status === 'active';
  const isProvisioningOrSetup = shop.status === 'paid_setup' || shop.status === 'provisioning';
  const isPaused = shop.status === 'paused';
  const isPastDue = shop.subscriptionStatus === 'past_due';

  const supportPhone = settings.supportPhone || '888-212-1629';
  const supportEmail = settings.supportEmail || 'support@autointelagent.com';

  // Metrics for "This Month"
  const now = new Date();
  const thisMonthCalls = calls.filter((c) => {
    try {
      const d = new Date(c.startedAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    } catch {
      return true;
    }
  });

  // 1. Calls answered (all calls except spam_or_hangup)
  const callsAnswered = thisMonthCalls.filter((c) => c.outcome !== 'spam_or_hangup').length;

  // 2. Customers captured (calls with caller name or phone and outcome appointment_requested or callback_needed)
  const customersCaptured = thisMonthCalls.filter(
    (c) =>
      (Boolean(c.callerName) || Boolean(c.callerPhone)) &&
      (c.outcome === 'appointment_requested' || c.outcome === 'callback_needed')
  ).length;

  // 3. Appointment requests
  const appointmentRequests = thisMonthCalls.filter(
    (c) => c.outcome === 'appointment_requested'
  ).length;

  // 4. After-hours calls answered
  const afterHoursCalls = thisMonthCalls.filter(
    (c) => c.afterHours && c.outcome !== 'spam_or_hangup'
  ).length;

  // "Needs your attention": calls where followUp is "new", newest first
  const needsAttentionCalls = calls
    .filter((c) => c.followUp === 'new')
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

  return (
    <div className="space-y-6">
      {/* Past Due Warning Banner */}
      {isPastDue && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-rose-950">
          <div className="flex items-start gap-3">
            <CreditCard className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold">Payment Past Due</h4>
              <p className="text-xs text-rose-800 mt-0.5">
                Your payment didn't go through. Update your card to keep your receptionist answering.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onGoToBilling}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl min-h-[44px] transition-colors self-start sm:self-auto shrink-0"
          >
            Update Card
          </button>
        </div>
      )}

      {/* Status Card */}
      {isLive ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500" />
            </span>
            <div>
              <h2 className="text-base font-bold text-gray-950">Your AI receptionist is live</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Answering calls 24/7 on forward line: <span className="font-semibold text-gray-800">{shop.autointelNumber || supportPhone}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenTest}
            className="px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-bold text-xs rounded-xl min-h-[44px] flex items-center gap-2 transition-colors self-start sm:self-auto"
          >
            <Sparkles className="w-4 h-4 text-purple-700" />
            <span>Test Receptionist</span>
          </button>
        </div>
      ) : isPaused ? (
        <div className="bg-amber-50 border border-amber-300 rounded-3xl p-6 text-amber-950 space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-base font-bold">Your receptionist is paused. Contact us.</h2>
              <p className="text-xs text-amber-800 mt-0.5">
                Inbound call handling is currently paused. Please get in touch with our operations team to reactivate service.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href={`tel:${supportPhone.replace(/[^0-9]/g, '')}`}
              className="px-4 py-2 bg-black hover:bg-gray-800 text-white font-bold text-xs rounded-xl min-h-[44px] inline-flex items-center gap-2"
            >
              <Phone className="w-3.5 h-3.5 text-[#d6bcfa]" />
              <span>Call Support ({supportPhone})</span>
            </a>
            <a
              href={`mailto:${supportEmail}`}
              className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-900 font-bold text-xs rounded-xl min-h-[44px] inline-flex items-center gap-2 border border-gray-300"
            >
              <Mail className="w-3.5 h-3.5 text-gray-600" />
              <span>Email Support</span>
            </a>
          </div>
        </div>
      ) : (
        /* paid_setup or provisioning tracker */
        <SetupStatusScreen
          onContinueWizard={onContinueWizard || (() => {})}
          onGoLiveSimulate={onOpenTest}
        />
      )}

      {/* Large button: "Test My AI Receptionist." */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-black text-white rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#d6bcfa]">
            Interactive Verification
          </span>
          <h3 className="text-xl sm:text-2xl font-black">Test My AI Receptionist</h3>
          <p className="text-xs text-purple-200/90 max-w-md">
            Simulate realistic customer scenarios (oil quotes, check engine diagnostics, after-hours towing) to hear how your receptionist responds.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenTest}
          className="px-6 py-3.5 bg-white hover:bg-gray-100 text-black font-black text-sm rounded-2xl min-h-[48px] shadow-lg flex items-center justify-center gap-2 shrink-0 transition-all active:scale-[0.98]"
        >
          <Sparkles className="w-4 h-4 text-purple-700" />
          <span>Launch Receptionist Tester</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* "This month" stat cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900">This Month</h3>
          <span className="text-xs text-gray-500">Live reception statistics</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-semibold">Calls Answered</span>
              <PhoneCall className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-gray-950">{callsAnswered}</p>
            <p className="text-[11px] text-gray-400">Excludes spam & hang-ups</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-semibold">Customers Captured</span>
              <Users className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-700">{customersCaptured}</p>
            <p className="text-[11px] text-gray-400">With verified contact info</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-semibold">Appointment Requests</span>
              <CalendarCheck className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-blue-700">{appointmentRequests}</p>
            <p className="text-[11px] text-gray-400">Ready to schedule</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-semibold">After-Hours Answered</span>
              <Moon className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-indigo-700">{afterHoursCalls}</p>
            <p className="text-[11px] text-gray-400">Captured while closed</p>
          </div>
        </div>
      </div>

      {/* "Needs your attention" */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-gray-950">Needs Your Attention</h3>
            {needsAttentionCalls.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200">
                {needsAttentionCalls.length}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400">Requires owner follow-up</span>
        </div>

        {needsAttentionCalls.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-xs">
            <Inbox className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="font-semibold text-gray-700">All caught up!</p>
            <p className="text-gray-400 mt-0.5">No appointment requests or callbacks waiting for follow-up.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {needsAttentionCalls.map((call) => (
              <button
                key={call.id}
                type="button"
                onClick={() => onSelectCall(call)}
                className="w-full text-left py-3.5 px-3 -mx-3 hover:bg-gray-50 rounded-2xl transition-colors flex items-center justify-between gap-3 min-h-[44px]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${getOutcomeDotColor(call.outcome)}`}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-950 truncate">
                      {call.callerName || call.callerPhone || 'Inbound Caller'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {call.service || 'Service inquiry'} • {getOutcomeLabel(call.outcome)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-gray-400 font-medium">
                    {formatFriendlyTime(call.startedAt)}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Empty state when there are NO calls at all */}
      {calls.length === 0 && (
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-3xl p-8 text-center space-y-2">
          <PhoneCall className="w-8 h-8 text-gray-400 mx-auto" />
          <h4 className="text-sm font-bold text-gray-900">No calls yet</h4>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Once your receptionist starts answering, every call shows up here in real time with customer details, transcripts, and audio recordings.
          </p>
        </div>
      )}
    </div>
  );
};
