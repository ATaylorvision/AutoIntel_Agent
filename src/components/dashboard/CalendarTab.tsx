import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Phone, Car, Clock, Wrench, X, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { DashboardCallItem, AppointmentStatus } from '../DashboardPage.tsx';

export interface CalendarAppointmentItem {
  id: string;
  callId: string;
  callerName: string;
  phone: string;
  vehicle: string;
  serviceNeeded: string;
  shortService: string;
  preferredTime: string;
  appointmentDate: string; // YYYY-MM-DD
  status: AppointmentStatus;
  fullSummary: string;
}

interface CalendarTabProps {
  calls: DashboardCallItem[];
  onUpdateAppointmentStatus: (callId: string, status: AppointmentStatus) => void;
}

export const CalendarTab: React.FC<CalendarTabProps> = ({ calls, onUpdateAppointmentStatus }) => {
  // Reference date: Wednesday, September 16, 2026
  const [viewDate, setViewDate] = useState<Date>(new Date(2026, 8, 16)); // Sep 16, 2026
  const [selectedAppointment, setSelectedAppointment] = useState<CalendarAppointmentItem | null>(null);

  // Map calls to calendar appointments based on prompt specification:
  // - Maria Rodriguez: tomorrow (2026-09-17), New Request
  // - David Martinez: 2 days from now (2026-09-18), Confirmed
  // - Angela Williams: upcoming Saturday (2026-09-19), New Request
  // - Thomas Jackson: next Monday (2026-09-21), Confirmed
  const appointments: CalendarAppointmentItem[] = [
    {
      id: 'appt-1',
      callId: 'call-1',
      callerName: 'Maria Rodriguez',
      phone: '(555) 012-4789',
      vehicle: '2019 Honda CR-V',
      serviceNeeded: 'Brake squeal, pulling to the left',
      shortService: 'Brake Squeal Repair',
      preferredTime: 'Tomorrow morning if possible',
      appointmentDate: '2026-09-17',
      status: calls.find((c) => c.id === 'call-1')?.appointmentStatus || 'New Request',
      fullSummary: "Hi, my name is Maria Rodriguez. I drive a 2019 Honda CR-V and I'm hearing a squeal when I brake, and the car pulls to the left. I'd like to get in as soon as possible, ideally tomorrow morning. My number is 555-012-4789.",
    },
    {
      id: 'appt-2',
      callId: 'call-4',
      callerName: 'David Martinez',
      phone: '(555) 091-8834',
      vehicle: '2020 Chevrolet Silverado',
      serviceNeeded: 'AC not blowing cold air',
      shortService: 'AC Diagnostics / Repair',
      preferredTime: 'Sometime this week',
      appointmentDate: '2026-09-18',
      status: calls.find((c) => c.id === 'call-4')?.appointmentStatus || 'Confirmed',
      fullSummary: "Hey, David Martinez here. My 2020 Silverado's AC stopped blowing cold. I know it's after hours but I'd like to get in sometime this week if you can fit me in. 555-091-8834.",
    },
    {
      id: 'appt-3',
      callId: 'call-3',
      callerName: 'Angela Williams',
      phone: '(555) 047-9301',
      vehicle: '2018 Toyota Camry',
      serviceNeeded: 'Oil change and tire rotation',
      shortService: 'Oil Change & Rotation',
      preferredTime: 'Saturday morning',
      appointmentDate: '2026-09-19',
      status: calls.find((c) => c.id === 'call-3')?.appointmentStatus || 'New Request',
      fullSummary: 'Hi, I need to schedule an oil change and tire rotation for my 2018 Toyota Camry. Saturday morning works best for me. This is Angela Williams, 555-047-9301.',
    },
    {
      id: 'appt-4',
      callId: 'call-6',
      callerName: 'Thomas Jackson',
      phone: '(555) 028-4412',
      vehicle: '2022 Jeep Wrangler',
      serviceNeeded: '30,000 mile service',
      shortService: '30k Mile Service',
      preferredTime: 'Next Monday',
      appointmentDate: '2026-09-21',
      status: calls.find((c) => c.id === 'call-6')?.appointmentStatus || 'Confirmed',
      fullSummary: "Good morning, Thomas Jackson calling. I've got a 2022 Jeep Wrangler that's coming up on 30,000 miles and needs its scheduled service. Next Monday would be ideal. 555-028-4412.",
    },
  ];

  // Month navigation helpers
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const prevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setViewDate(new Date(2026, 8, 16));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthHeading = `${monthNames[month]} ${year}`;

  // Days in month calculation
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Calendar cells: empty padding + actual days
  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  // Get appointments for a specific day
  const getAppointmentsForDay = (day: number) => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateKey = `${year}-${formattedMonth}-${formattedDay}`;
    return appointments.filter((a) => a.appointmentDate === dateKey);
  };

  const getStatusBadgeStyle = (status: AppointmentStatus) => {
    switch (status) {
      case 'Confirmed':
        return {
          pill: 'bg-emerald-50 text-emerald-900 border border-emerald-300 hover:bg-emerald-100',
          dot: 'bg-emerald-500',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        };
      case 'Declined':
        return {
          pill: 'bg-rose-50 text-rose-900 border border-rose-300 hover:bg-rose-100',
          dot: 'bg-rose-500',
          badge: 'bg-rose-100 text-rose-800 border-rose-300',
        };
      case 'New Request':
      default:
        return {
          pill: 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100',
          dot: 'bg-amber-500',
          badge: 'bg-amber-100 text-amber-800 border-amber-300',
        };
    }
  };

  const handleStatusChangeInModal = (status: AppointmentStatus) => {
    if (!selectedAppointment) return;
    onUpdateAppointmentStatus(selectedAppointment.callId, status);
    setSelectedAppointment({ ...selectedAppointment, status });
  };

  // Synchronize modal selection when call state updates
  const activeSelected = selectedAppointment
    ? appointments.find((a) => a.id === selectedAppointment.id) || selectedAppointment
    : null;

  return (
    <div className="space-y-6">
      {/* Calendar Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight">
              {monthHeading}
            </h2>
            <p className="text-xs text-gray-500">
              {appointments.length} appointment requests scheduled this month
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={goToToday}
            className="px-3.5 py-2 text-xs font-bold text-purple-900 bg-[#faf5ff] hover:bg-purple-100 border border-[#d6bcfa] rounded-xl transition-colors min-h-[40px]"
          >
            Today
          </button>
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white">
            <button
              type="button"
              onClick={prevMonth}
              title="Previous Month"
              className="p-2 text-gray-600 hover:text-gray-950 hover:bg-gray-100 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-gray-200" />
            <button
              type="button"
              onClick={nextMonth}
              title="Next Month"
              className="p-2 text-gray-600 hover:text-gray-950 hover:bg-gray-100 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs px-1 text-gray-600">
        <span className="font-semibold text-gray-900">Status Legend:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>New Request</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Confirmed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>Declined</span>
        </div>
      </div>

      {/* Desktop Monthly Grid View */}
      <div className="hidden md:block bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-[#faf5ff] text-center text-xs font-bold text-gray-700 py-3">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-gray-100 text-sm">
          {calendarCells.map((cellDay, index) => {
            if (cellDay === null) {
              return <div key={`empty-${index}`} className="min-h-[110px] bg-gray-50/50 p-2" />;
            }

            const isToday = year === 2026 && month === 8 && cellDay === 16;
            const dayAppts = getAppointmentsForDay(cellDay);

            return (
              <div
                key={`day-${cellDay}`}
                className={`min-h-[110px] p-2 flex flex-col justify-between transition-colors ${
                  isToday ? 'bg-purple-50/40' : 'bg-white hover:bg-gray-50/70'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`inline-flex items-center justify-center text-xs font-bold rounded-full w-6 h-6 ${
                      isToday
                        ? 'bg-purple-700 text-white shadow-xs'
                        : 'text-gray-700'
                    }`}
                  >
                    {cellDay}
                  </span>
                  {isToday && (
                    <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wide">
                      Today
                    </span>
                  )}
                </div>

                {/* Appointment Pills */}
                <div className="space-y-1.5 flex-1 overflow-hidden">
                  {dayAppts.map((appt) => {
                    const style = getStatusBadgeStyle(appt.status);
                    return (
                      <button
                        key={appt.id}
                        type="button"
                        onClick={() => setSelectedAppointment(appt)}
                        className={`w-full text-left p-1.5 rounded-lg text-xs transition-all shadow-2xs block truncate cursor-pointer ${style.pill}`}
                        title={`${appt.callerName} - ${appt.serviceNeeded} (${appt.status})`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${style.dot}`} />
                          <span className="font-bold truncate text-[11px]">{appt.callerName}</span>
                        </div>
                        <p className="text-[10px] opacity-85 truncate mt-0.5 pl-3.5">
                          {appt.shortService}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Agenda / Chronological List View */}
      <div className="md:hidden space-y-4">
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-xs text-purple-900 font-medium">
          Showing upcoming appointment requests in chronological order for mobile view.
        </div>

        <div className="space-y-3">
          {appointments.map((appt) => {
            const style = getStatusBadgeStyle(appt.status);
            return (
              <div
                key={appt.id}
                className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-2.5">
                  <div>
                    <span className="text-xs font-bold text-purple-800 uppercase tracking-wide block">
                      {appt.appointmentDate === '2026-09-17'
                        ? 'Tomorrow • Thu, Sep 17'
                        : appt.appointmentDate === '2026-09-18'
                        ? '2 Days Away • Fri, Sep 18'
                        : appt.appointmentDate === '2026-09-19'
                        ? 'Upcoming Sat • Sep 19'
                        : 'Next Mon • Sep 21'}
                    </span>
                    <h3 className="font-extrabold text-gray-950 text-base mt-0.5">{appt.callerName}</h3>
                    <p className="text-xs text-gray-500">{appt.vehicle}</p>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 inline-flex items-center gap-1 ${style.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                    <span>{appt.status}</span>
                  </span>
                </div>

                <div className="text-xs text-gray-700 bg-gray-50 p-2.5 rounded-xl space-y-1">
                  <div>
                    <span className="text-gray-400 font-medium">Service: </span>
                    <span className="font-bold text-gray-900">{appt.serviceNeeded}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium">Requested Time: </span>
                    <span className="font-semibold text-purple-800">{appt.preferredTime}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <a
                    href={`tel:${appt.phone.replace(/[^0-9]/g, '')}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-900 min-h-[44px]"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{appt.phone}</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setSelectedAppointment(appt)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg text-xs font-bold transition-colors min-h-[44px]"
                  >
                    Details &amp; Status
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Appointment Detail Popup / Modal */}
      {activeSelected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="bg-white border border-gray-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
              <div>
                <span className="text-xs font-bold text-purple-700 uppercase tracking-wide">
                  Appointment Request Details
                </span>
                <h3 className="text-xl font-extrabold text-gray-950 mt-0.5">
                  {activeSelected.callerName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Information Grid */}
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-100 text-xs">
                <div>
                  <span className="text-gray-400 block text-[11px] font-medium">Phone Number</span>
                  <a
                    href={`tel:${activeSelected.phone.replace(/[^0-9]/g, '')}`}
                    className="font-bold text-purple-700 hover:underline inline-flex items-center gap-1 mt-0.5 text-sm"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{activeSelected.phone}</span>
                  </a>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px] font-medium">Vehicle Info</span>
                  <span className="font-bold text-gray-900 mt-0.5 block text-sm">
                    {activeSelected.vehicle}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-gray-500">Service Requested:</span>
                <p className="text-sm font-semibold text-gray-900 bg-[#faf5ff] p-2.5 rounded-xl border border-[#e9d8fd] mt-1">
                  {activeSelected.serviceNeeded}
                </p>
              </div>

              <div>
                <span className="text-xs font-semibold text-gray-500">Requested Time:</span>
                <div className="flex items-center gap-2 p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-950 font-bold text-sm mt-1">
                  <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>{activeSelected.preferredTime}</span>
                </div>
              </div>

              {/* Full transcription */}
              <div>
                <span className="text-xs font-semibold text-gray-500">Caller Transcription:</span>
                <p className="text-xs text-gray-700 italic bg-gray-50 p-3 rounded-xl border border-gray-200 mt-1 leading-relaxed">
                  &ldquo;{activeSelected.fullSummary}&rdquo;
                </p>
              </div>

              {/* Current Status and Toggles */}
              <div className="space-y-2 pt-1">
                <span className="text-xs font-semibold text-gray-700 block">
                  Current Status (Click to change):
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {(['New Request', 'Confirmed', 'Declined'] as AppointmentStatus[]).map((st) => {
                    const isSelected = activeSelected.status === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleStatusChangeInModal(st)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[38px] ${
                          isSelected
                            ? st === 'Confirmed'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : st === 'Declined'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-amber-600 text-white shadow-xs'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                        <span>{st}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl min-h-[42px] transition-colors"
              >
                Close
              </button>
              <a
                href={`tel:${activeSelected.phone.replace(/[^0-9]/g, '')}`}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl min-h-[42px] inline-flex items-center gap-2 shadow-xs transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Back Now</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
