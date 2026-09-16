import React, { useState, useMemo } from 'react';
import { CallRecord } from '../../types/index.ts';
import { formatFriendlyTime, getOutcomeDotColor, getOutcomeLabel } from './callHelpers.ts';
import {
  Search,
  Filter,
  PhoneCall,
  Clock,
  ChevronRight,
  Inbox,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-react';

interface CallsTabProps {
  calls: CallRecord[];
  onSelectCall: (call: CallRecord) => void;
}

type FilterOption = 'all' | 'needs_follow_up' | 'appointments' | 'after_hours' | 'transferred';

export const CallsTab: React.FC<CallsTabProps> = ({ calls, onSelectCall }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('all');
  const [showHangUps, setShowHangUps] = useState(false);
  const [visibleCount, setVisibleCount] = useState(25);

  const filterChips: { id: FilterOption; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'needs_follow_up', label: 'Needs follow-up' },
    { id: 'appointments', label: 'Appointments' },
    { id: 'after_hours', label: 'After hours' },
    { id: 'transferred', label: 'Transferred' },
  ];

  // Filter & Search logic
  const filteredCalls = useMemo(() => {
    // 1. Sort newest first
    const sorted = [...calls].sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );

    return sorted.filter((call) => {
      // Hide hang-ups unless toggled on
      if (!showHangUps && call.outcome === 'spam_or_hangup') {
        return false;
      }

      // Filter chips
      if (selectedFilter === 'needs_follow_up' && call.followUp !== 'new') {
        return false;
      }
      if (selectedFilter === 'appointments' && call.outcome !== 'appointment_requested') {
        return false;
      }
      if (selectedFilter === 'after_hours' && !call.afterHours) {
        return false;
      }
      if (selectedFilter === 'transferred' && call.outcome !== 'transferred') {
        return false;
      }

      // Search by caller name or phone
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const nameMatch = (call.callerName || '').toLowerCase().includes(query);
        const phoneMatch = (call.callerPhone || '').toLowerCase().includes(query);
        const serviceMatch = (call.service || '').toLowerCase().includes(query);
        if (!nameMatch && !phoneMatch && !serviceMatch) {
          return false;
        }
      }

      return true;
    });
  }, [calls, selectedFilter, showHangUps, searchQuery]);

  const displayedCalls = filteredCalls.slice(0, visibleCount);
  const hasMore = visibleCount < filteredCalls.length;

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-gray-950 flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-purple-700" />
              <span>Call Records</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                {filteredCalls.length}
              </span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Live receptionist call log with transcripts, customer requests, and audio recordings.
            </p>
          </div>

          {/* Show hang-ups toggle */}
          <button
            type="button"
            onClick={() => setShowHangUps(!showHangUps)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border min-h-[44px] flex items-center gap-2 transition-colors self-start sm:self-auto ${
              showHangUps
                ? 'bg-purple-50 text-purple-900 border-purple-300'
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
            }`}
          >
            {showHangUps ? <Eye className="w-4 h-4 text-purple-700" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
            <span>{showHangUps ? 'Hide Hang-ups' : 'Show Hang-ups'}</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setVisibleCount(25);
            }}
            placeholder="Search by customer name or phone number..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm min-h-[44px] focus:bg-white focus:outline-none focus:border-black transition-all"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {filterChips.map((chip) => {
            const isSelected = selectedFilter === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => {
                  setSelectedFilter(chip.id);
                  setVisibleCount(25);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all min-h-[36px] ${
                  isSelected
                    ? 'bg-black text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Call List */}
      <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
        {displayedCalls.length === 0 ? (
          <div className="text-center py-16 px-6 space-y-2">
            <Inbox className="w-10 h-10 text-gray-300 mx-auto" />
            <h3 className="text-sm font-bold text-gray-800">No Calls Matching Filter</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {searchQuery || selectedFilter !== 'all'
                ? 'Try adjusting your search query or switching to the "All" filter.'
                : 'Your call log is currently empty. As calls are received, they will appear here in real time.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {displayedCalls.map((call) => (
              <button
                key={call.id}
                type="button"
                onClick={() => onSelectCall(call)}
                className="w-full text-left p-4 sm:p-5 hover:bg-gray-50/80 transition-colors flex items-center justify-between gap-3 min-h-[44px]"
              >
                {/* Left: Status Dot & Caller info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <span
                    className={`w-3 h-3 rounded-full shrink-0 ${getOutcomeDotColor(call.outcome)}`}
                    title={getOutcomeLabel(call.outcome)}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-black text-gray-950 truncate">
                        {call.callerName || call.callerPhone || 'Inbound Caller'}
                      </span>
                      {call.afterHours && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                          After Hours
                        </span>
                      )}
                      {call.followUp === 'new' && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300">
                          Needs Follow-up
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {call.service || 'Service inquiry'}
                    </p>
                  </div>
                </div>

                {/* Right: Outcome badge & Time */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs font-semibold text-gray-800 block">
                      {getOutcomeLabel(call.outcome)}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {formatFriendlyTime(call.startedAt)}
                    </span>
                  </div>
                  <div className="sm:hidden text-right">
                    <span className="text-[11px] text-gray-400 block">
                      {formatFriendlyTime(call.startedAt)}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Load More Button (25 at a time) */}
        {hasMore && (
          <div className="p-4 border-t border-gray-100 bg-gray-50/50 text-center">
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => prev + 25)}
              className="px-5 py-2.5 bg-white hover:bg-gray-100 text-gray-900 border border-gray-200 font-bold text-xs rounded-xl min-h-[44px] transition-colors shadow-sm"
            >
              Load More Calls ({filteredCalls.length - visibleCount} remaining)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
