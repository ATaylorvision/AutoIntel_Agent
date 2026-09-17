import React, { useState, useEffect } from 'react';
import {
  Phone,
  Calendar,
  Clock,
  Car,
  ChevronDown,
  ChevronUp,
  User,
  Users,
  Wrench,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  CalendarDays,
  Settings as SettingsIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { CalendarTab } from './dashboard/CalendarTab.tsx';
import { SettingsTab } from './dashboard/SettingsTab.tsx';

export type CallStatus = 'New' | 'Reviewed' | 'Called Back';
export type AppointmentStatus = 'New Request' | 'Confirmed' | 'Declined';
export type DashboardTabType = 'calls' | 'appointments' | 'calendar' | 'settings';

export interface DashboardCallItem {
  id: string;
  dateTime: string;
  callerName: string;
  phone: string;
  vehicle: string;
  serviceNeeded: string;
  urgency: string;
  appointmentRequested: boolean;
  preferredTime?: string;
  fullSummary: string;
  callStatus: CallStatus;
  appointmentStatus?: AppointmentStatus;
}

interface DashboardPageProps {
  initialTab?: DashboardTabType;
}

const INITIAL_CALLS: DashboardCallItem[] = [
  {
    id: 'call-1',
    dateTime: 'Today 6:47 PM',
    callerName: 'Maria Rodriguez',
    phone: '(555) 012-4789',
    vehicle: '2019 Honda CR-V',
    serviceNeeded: 'Brake squeal, pulling to the left',
    urgency: 'Wants earliest available',
    appointmentRequested: true,
    preferredTime: 'Tomorrow morning if possible',
    fullSummary: 'Hi, my name is Maria Rodriguez. I drive a 2019 Honda CR-V and I\'m hearing a squeal when I brake, and the car pulls to the left. I\'d like to get in as soon as possible, ideally tomorrow morning. My number is 555-012-4789.',
    callStatus: 'New',
    appointmentStatus: 'New Request',
  },
  {
    id: 'call-2',
    dateTime: 'Today 5:22 PM',
    callerName: 'Robert Chen',
    phone: '(555) 083-2156',
    vehicle: '2021 Ford F-150',
    serviceNeeded: 'Check engine light came on',
    urgency: 'Moderate',
    appointmentRequested: false,
    fullSummary: 'This is Robert Chen calling about my 2021 Ford F-150. The check engine light came on this afternoon. It\'s running fine but I want to get it looked at when you have availability. My number is 555-083-2156.',
    callStatus: 'New',
  },
  {
    id: 'call-3',
    dateTime: 'Today 3:15 PM',
    callerName: 'Angela Williams',
    phone: '(555) 047-9301',
    vehicle: '2018 Toyota Camry',
    serviceNeeded: 'Oil change and tire rotation',
    urgency: 'Routine',
    appointmentRequested: true,
    preferredTime: 'Saturday morning',
    fullSummary: 'Hi, I need to schedule an oil change and tire rotation for my 2018 Toyota Camry. Saturday morning works best for me. This is Angela Williams, 555-047-9301.',
    callStatus: 'New',
    appointmentStatus: 'New Request',
  },
  {
    id: 'call-4',
    dateTime: 'Yesterday 7:45 PM',
    callerName: 'David Martinez',
    phone: '(555) 091-8834',
    vehicle: '2020 Chevrolet Silverado',
    serviceNeeded: 'AC not blowing cold air',
    urgency: 'Moderate',
    appointmentRequested: true,
    preferredTime: 'Sometime this week',
    fullSummary: 'Hey, David Martinez here. My 2020 Silverado\'s AC stopped blowing cold. I know it\'s after hours but I\'d like to get in sometime this week if you can fit me in. 555-091-8834.',
    callStatus: 'Called Back',
    appointmentStatus: 'Confirmed',
  },
  {
    id: 'call-5',
    dateTime: 'Yesterday 12:30 PM',
    callerName: 'Karen Liu',
    phone: '(555) 063-5578',
    vehicle: '2017 BMW 328i',
    serviceNeeded: 'Squeaking noise from front suspension',
    urgency: 'Moderate',
    appointmentRequested: false,
    fullSummary: 'This is Karen Liu. I have a 2017 BMW 328i and there\'s a squeaking noise coming from the front end when I go over bumps. Can someone take a look? 555-063-5578.',
    callStatus: 'Reviewed',
  },
  {
    id: 'call-6',
    dateTime: '2 days ago 8:10 AM',
    callerName: 'Thomas Jackson',
    phone: '(555) 028-4412',
    vehicle: '2022 Jeep Wrangler',
    serviceNeeded: '30,000 mile service',
    urgency: 'Routine',
    appointmentRequested: true,
    preferredTime: 'Next Monday',
    fullSummary: 'Good morning, Thomas Jackson calling. I\'ve got a 2022 Jeep Wrangler that\'s coming up on 30,000 miles and needs its scheduled service. Next Monday would be ideal. 555-028-4412.',
    callStatus: 'Called Back',
    appointmentStatus: 'Confirmed',
  },
];

export const DashboardPage: React.FC<DashboardPageProps> = ({ initialTab = 'calls' }) => {
  const { currentUser, shopRecord } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTabType>(initialTab);
  const [calls, setCalls] = useState<DashboardCallItem[]>(INITIAL_CALLS);
  const [expandedCallId, setExpandedCallId] = useState<string | null>('call-1');

  // Synchronize if initialTab changes (e.g. from nav dropdown to settings)
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Filter for Tab 2: only calls where caller requested an appointment
  const appointmentCalls = calls.filter((c) => c.appointmentRequested);

  // Status changers
  const cycleCallStatus = (id: string) => {
    setCalls((prev) =>
      prev.map((call) => {
        if (call.id !== id) return call;
        const nextStatus: CallStatus =
          call.callStatus === 'New'
            ? 'Reviewed'
            : call.callStatus === 'Reviewed'
            ? 'Called Back'
            : 'New';
        return { ...call, callStatus: nextStatus };
      })
    );
  };

  const setSpecificCallStatus = (id: string, status: CallStatus) => {
    setCalls((prev) =>
      prev.map((call) => (call.id === id ? { ...call, callStatus: status } : call))
    );
  };

  const cycleAppointmentStatus = (id: string) => {
    setCalls((prev) =>
      prev.map((call) => {
        if (call.id !== id) return call;
        const nextStatus: AppointmentStatus =
          call.appointmentStatus === 'New Request'
            ? 'Confirmed'
            : call.appointmentStatus === 'Confirmed'
            ? 'Declined'
            : 'New Request';
        return { ...call, appointmentStatus: nextStatus };
      })
    );
  };

  const setSpecificAppointmentStatus = (id: string, status: AppointmentStatus) => {
    setCalls((prev) =>
      prev.map((call) => (call.id === id ? { ...call, appointmentStatus: status } : call))
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedCallId((curr) => (curr === id ? null : id));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#faf5ff] border border-[#d6bcfa] text-purple-900 px-3 py-1 rounded-full text-xs font-semibold mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Receptionist Queue</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-950 tracking-tight">
            Your Shop Dashboard
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {shopRecord?.shopName || 'Precision Auto Care'} &bull; Real-time AI call summaries &amp; appointment requests
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2 text-right">
            <p className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wide">Status</p>
            <p className="text-xs sm:text-sm font-bold text-emerald-900 flex items-center gap-1.5 justify-end">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              24/7 Call Guard Active
            </p>
          </div>
        </div>
      </div>

      {/* Row of Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Calls Answered */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Calls Answered
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-950">6</p>
          <p className="text-xs text-gray-500">100% answered without ringing out</p>
        </div>

        {/* Metric 2: Customers Captured */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Customers Captured
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-950">5</p>
          <p className="text-xs text-gray-500">Full name &amp; vehicle details logged</p>
        </div>

        {/* Metric 3: Appointment Requests */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Appointment Requests
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-950">4</p>
          <p className="text-xs text-gray-500">Booked directly into your queue</p>
        </div>

        {/* Metric 4: After-Hours Answered */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              After-Hours Answered
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-950">3</p>
          <p className="text-xs text-gray-500">Saved from calling your competitors</p>
        </div>
      </div>

      {/* Tabs Across the Top */}
      <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('calls')}
          className={`pb-3.5 px-4 font-bold text-sm sm:text-base border-b-2 flex items-center gap-2.5 transition-colors whitespace-nowrap min-h-[44px] ${
            activeTab === 'calls'
              ? 'border-purple-600 text-purple-950 font-extrabold'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <span>Recent Calls</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs ${
              activeTab === 'calls'
                ? 'bg-purple-100 text-purple-800 font-bold'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {calls.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('appointments')}
          className={`pb-3.5 px-4 font-bold text-sm sm:text-base border-b-2 flex items-center gap-2.5 transition-colors whitespace-nowrap min-h-[44px] ${
            activeTab === 'appointments'
              ? 'border-purple-600 text-purple-950 font-extrabold'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <span>Appointments</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs ${
              activeTab === 'appointments'
                ? 'bg-purple-100 text-purple-800 font-bold'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {appointmentCalls.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('calendar')}
          className={`pb-3.5 px-4 font-bold text-sm sm:text-base border-b-2 flex items-center gap-2.5 transition-colors whitespace-nowrap min-h-[44px] ${
            activeTab === 'calendar'
              ? 'border-purple-600 text-purple-950 font-extrabold'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <CalendarDays className="w-4 h-4 text-purple-600" />
          <span>Calendar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`pb-3.5 px-4 font-bold text-sm sm:text-base border-b-2 flex items-center gap-2.5 transition-colors whitespace-nowrap min-h-[44px] ${
            activeTab === 'settings'
              ? 'border-purple-600 text-purple-950 font-extrabold'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <SettingsIcon className="w-4 h-4 text-purple-600" />
          <span>Settings</span>
        </button>
      </div>

      {/* TAB 1: RECENT CALLS */}
      {activeTab === 'calls' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-500 px-1">
            <p>Click any row to expand the complete caller summary. Click any status badge to update.</p>
            <p className="font-medium text-gray-600">Showing {calls.length} recent calls</p>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-[#faf5ff] border-b border-gray-200 text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Date &amp; Time</th>
                  <th className="py-3.5 px-4">Caller</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Vehicle</th>
                  <th className="py-3.5 px-4">Service Needed</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {calls.map((call) => {
                  const isExpanded = expandedCallId === call.id;
                  return (
                    <React.Fragment key={call.id}>
                      <tr
                        onClick={() => toggleExpand(call.id)}
                        className="hover:bg-purple-50/40 cursor-pointer transition-colors"
                      >
                        <td className="py-4 px-4 font-medium text-gray-700 whitespace-nowrap">
                          {call.dateTime}
                        </td>
                        <td className="py-4 px-4 font-bold text-gray-950">
                          {call.callerName}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <a
                            href={`tel:${call.phone.replace(/[^0-9]/g, '')}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 font-semibold text-purple-700 hover:text-purple-900 hover:underline min-h-[32px]"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>{call.phone}</span>
                          </a>
                        </td>
                        <td className="py-4 px-4 font-medium text-gray-800 whitespace-nowrap">
                          {call.vehicle}
                        </td>
                        <td className="py-4 px-4 text-gray-700 max-w-xs truncate">
                          {call.serviceNeeded}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => cycleCallStatus(call.id)}
                            title="Click to cycle status"
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all shadow-2xs inline-flex items-center gap-1 min-h-[28px] ${
                              call.callStatus === 'New'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                                : call.callStatus === 'Reviewed'
                                ? 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-300 hover:bg-blue-100'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            <span>{call.callStatus}</span>
                          </button>
                        </td>
                        <td className="py-4 px-3 text-right">
                          <button
                            type="button"
                            aria-label="Toggle details"
                            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable full summary row */}
                      {isExpanded && (
                        <tr className="bg-[#faf5ff]/60 border-b border-gray-200">
                          <td colSpan={7} className="p-5">
                            <div className="space-y-3 bg-white p-4 rounded-xl border border-[#e9d8fd]">
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-gray-900 uppercase">
                                    Full Call Transcription &amp; Summary
                                  </span>
                                  {call.appointmentRequested && (
                                    <span className="text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                                      Appointment Requested: {call.preferredTime || 'Yes'}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">Urgency:</span>
                                  <span className="text-xs font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">
                                    {call.urgency}
                                  </span>
                                </div>
                              </div>

                              <p className="text-sm text-gray-800 italic leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-200">
                                &ldquo;{call.fullSummary}&rdquo;
                              </p>

                              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-gray-500">Change Status:</span>
                                  {(['New', 'Reviewed', 'Called Back'] as CallStatus[]).map((st) => (
                                    <button
                                      key={st}
                                      type="button"
                                      onClick={() => setSpecificCallStatus(call.id, st)}
                                      className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                                        call.callStatus === st
                                          ? 'bg-purple-700 text-white'
                                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                      }`}
                                    >
                                      {st}
                                    </button>
                                  ))}
                                </div>

                                <a
                                  href={`tel:${call.phone.replace(/[^0-9]/g, '')}`}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-bold text-xs shadow-xs min-h-[36px]"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                  <span>Call {call.callerName} Now</span>
                                </a>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card / Stacked List View */}
          <div className="lg:hidden space-y-3">
            {calls.map((call) => {
              const isExpanded = expandedCallId === call.id;
              return (
                <div
                  key={call.id}
                  className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3"
                >
                  <div
                    onClick={() => toggleExpand(call.id)}
                    className="flex items-start justify-between gap-2 cursor-pointer"
                  >
                    <div>
                      <span className="text-xs text-gray-500 block">{call.dateTime}</span>
                      <h3 className="font-bold text-gray-950 text-base">{call.callerName}</h3>
                      <p className="text-xs font-medium text-gray-700 mt-0.5">{call.vehicle}</p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        cycleCallStatus(call.id);
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 min-h-[32px] flex items-center gap-1 ${
                        call.callStatus === 'New'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                          : call.callStatus === 'Reviewed'
                          ? 'bg-gray-100 text-gray-700 border border-gray-300'
                          : 'bg-blue-50 text-blue-700 border border-blue-300'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      <span>{call.callStatus}</span>
                    </button>
                  </div>

                  <div className="text-xs text-gray-700 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                    <span className="font-semibold text-gray-900 block mb-0.5">Service:</span>
                    {call.serviceNeeded}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <a
                      href={`tel:${call.phone.replace(/[^0-9]/g, '')}`}
                      className="inline-flex items-center gap-1.5 font-bold text-purple-700 text-sm py-1 min-h-[44px]"
                    >
                      <Phone className="w-4 h-4" />
                      <span>{call.phone}</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => toggleExpand(call.id)}
                      className="text-xs font-semibold text-gray-600 flex items-center gap-1 min-h-[44px] px-2"
                    >
                      <span>{isExpanded ? 'Less' : 'Full Summary'}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Expanded Full Summary for Mobile */}
                  {isExpanded && (
                    <div className="pt-3 border-t border-gray-100 space-y-3 bg-[#faf5ff] p-3 rounded-xl">
                      <p className="text-xs text-gray-800 italic leading-relaxed">
                        &ldquo;{call.fullSummary}&rdquo;
                      </p>

                      <div className="flex flex-col gap-2 pt-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Urgency:</span>
                          <span className="font-semibold text-gray-900">{call.urgency}</span>
                        </div>
                        {call.appointmentRequested && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Appointment Requested:</span>
                            <span className="font-semibold text-purple-800">{call.preferredTime || 'Yes'}</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 flex items-center gap-1.5">
                        <span className="text-xs text-gray-500 mr-1">Status:</span>
                        {(['New', 'Reviewed', 'Called Back'] as CallStatus[]).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setSpecificCallStatus(call.id, st)}
                            className={`px-2 py-1 rounded text-xs font-semibold min-h-[32px] ${
                              call.callStatus === st
                                ? 'bg-purple-700 text-white'
                                : 'bg-white text-gray-700 border border-gray-200'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: APPOINTMENTS */}
      {activeTab === 'appointments' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-500 px-1">
            <p>Filtered view showing callers who requested an appointment. Click status badge to cycle or change.</p>
            <p className="font-medium text-gray-600">{appointmentCalls.length} appointment requests</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {appointmentCalls.map((entry) => (
              <div
                key={entry.id}
                className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Bar: Caller & Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-semibold text-gray-500 block mb-0.5">{entry.dateTime}</span>
                      <h3 className="font-extrabold text-gray-950 text-lg sm:text-xl">{entry.callerName}</h3>
                    </div>

                    {/* Interactive Appointment Status Badge */}
                    <button
                      type="button"
                      onClick={() => cycleAppointmentStatus(entry.id)}
                      title="Click to cycle status (New Request -> Confirmed -> Declined)"
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-2xs inline-flex items-center gap-1.5 min-h-[32px] ${
                        entry.appointmentStatus === 'New Request'
                          ? 'bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100'
                          : entry.appointmentStatus === 'Confirmed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-current"></span>
                      <span>{entry.appointmentStatus || 'New Request'}</span>
                    </button>
                  </div>

                  {/* Phone & Vehicle */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div>
                      <span className="text-gray-400 block text-[11px]">Phone Number</span>
                      <a
                        href={`tel:${entry.phone.replace(/[^0-9]/g, '')}`}
                        className="font-bold text-purple-700 hover:underline inline-flex items-center gap-1 text-sm mt-0.5 min-h-[24px]"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{entry.phone}</span>
                      </a>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px]">Vehicle Info</span>
                      <span className="font-bold text-gray-900 text-sm mt-0.5 block">{entry.vehicle}</span>
                    </div>
                  </div>

                  {/* Service Requested */}
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-gray-500">Service Requested:</span>
                    <p className="text-sm font-medium text-gray-900 bg-[#faf5ff] p-2.5 rounded-lg border border-[#e9d8fd]">
                      {entry.serviceNeeded}
                    </p>
                  </div>

                  {/* When They Want to Come In */}
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-gray-500">Requested Time:</span>
                    <div className="flex items-center gap-2 p-2.5 bg-amber-50/70 border border-amber-200 rounded-lg text-amber-950 font-bold text-sm">
                      <Calendar className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>{entry.preferredTime || 'Earliest available'}</span>
                    </div>
                  </div>

                  {/* Full Summary Quote */}
                  <p className="text-xs text-gray-600 italic bg-gray-50 p-3 rounded-lg border border-gray-200">
                    &ldquo;{entry.fullSummary}&rdquo;
                  </p>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                  {/* Status Picker Buttons */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-gray-400 text-[11px]">Status:</span>
                    {(['New Request', 'Confirmed', 'Declined'] as AppointmentStatus[]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setSpecificAppointmentStatus(entry.id, st)}
                        className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors min-h-[28px] ${
                          entry.appointmentStatus === st
                            ? 'bg-purple-700 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  {/* Call Back Button */}
                  <a
                    href={`tel:${entry.phone.replace(/[^0-9]/g, '')}`}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-full shadow-xs transition-colors min-h-[40px]"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Back</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CALENDAR */}
      {activeTab === 'calendar' && (
        <CalendarTab
          calls={calls}
          onUpdateAppointmentStatus={setSpecificAppointmentStatus}
        />
      )}

      {/* TAB 4: SETTINGS */}
      {activeTab === 'settings' && <SettingsTab />}
    </div>
  );
};
