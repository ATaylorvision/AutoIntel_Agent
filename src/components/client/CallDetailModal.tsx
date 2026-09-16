import React, { useState } from 'react';
import { CallRecord } from '../../types/index.ts';
import {
  formatFriendlyTime,
  formatDuration,
  getOutcomeLabel,
  getOutcomeBadgeStyle,
} from './callHelpers.ts';
import {
  X,
  Phone,
  MessageSquare,
  CheckCircle2,
  Clock,
  Car,
  Wrench,
  Moon,
  ChevronDown,
  ChevronUp,
  Volume2,
  FileText,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface CallDetailModalProps {
  call: CallRecord;
  onClose: () => void;
  onMarkHandled: (callId: string) => Promise<void>;
  markingHandled?: boolean;
}

export const CallDetailModal: React.FC<CallDetailModalProps> = ({
  call,
  onClose,
  onMarkHandled,
  markingHandled = false,
}) => {
  const [showTranscript, setShowTranscript] = useState(false);
  const [localHandled, setLocalHandled] = useState(call.followUp === 'done');

  const vehicleString = [call.vehicleYear, call.vehicleMake, call.vehicleModel]
    .filter(Boolean)
    .join(' ');

  const handleMarkAsHandled = async () => {
    setLocalHandled(true);
    await onMarkHandled(call.id);
  };

  const cleanPhoneDigits = call.callerPhone.replace(/[^0-9]/g, '');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getOutcomeBadgeStyle(
                  call.outcome
                )}`}
              >
                {getOutcomeLabel(call.outcome)}
              </span>
              {call.afterHours && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 flex items-center gap-1">
                  <Moon className="w-3 h-3 text-indigo-600" />
                  <span>After Hours</span>
                </span>
              )}
              {localHandled ? (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Handled</span>
                </span>
              ) : call.followUp === 'new' ? (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-amber-600" />
                  <span>Needs Follow-up</span>
                </span>
              ) : null}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-gray-950">
              {call.callerName || call.callerPhone || 'Inbound Caller'}
            </h2>
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                {formatFriendlyTime(call.startedAt)}
              </span>
              <span>•</span>
              <span>{formatDuration(call.durationSeconds)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons: Call, Text, Mark as Handled */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          {call.callerPhone ? (
            <a
              href={`tel:${cleanPhoneDigits}`}
              className="py-3 px-4 bg-black hover:bg-gray-800 text-white font-bold text-xs rounded-xl min-h-[44px] flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Phone className="w-4 h-4 text-[#d6bcfa]" />
              <span>Call Customer</span>
            </a>
          ) : (
            <button
              disabled
              className="py-3 px-4 bg-gray-100 text-gray-400 font-bold text-xs rounded-xl min-h-[44px] flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>No Phone</span>
            </button>
          )}

          {call.callerPhone ? (
            <a
              href={`sms:${cleanPhoneDigits}`}
              className="py-3 px-4 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl min-h-[44px] flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <MessageSquare className="w-4 h-4 text-purple-200" />
              <span>Text Customer</span>
            </a>
          ) : (
            <button
              disabled
              className="py-3 px-4 bg-gray-100 text-gray-400 font-bold text-xs rounded-xl min-h-[44px] flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>No Phone</span>
            </button>
          )}

          {!localHandled ? (
            <button
              type="button"
              onClick={handleMarkAsHandled}
              disabled={markingHandled}
              className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl min-h-[44px] flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{markingHandled ? 'Saving...' : 'Mark as Handled'}</span>
            </button>
          ) : (
            <div className="py-3 px-4 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl min-h-[44px] flex items-center justify-center gap-1.5 border border-gray-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Resolved</span>
            </div>
          )}
        </div>

        {/* What the customer needs section (Summary) */}
        <div className="bg-[#faf5ff] border border-[#e9d8fd] rounded-2xl p-4 sm:p-5 space-y-2">
          <h3 className="text-xs font-bold text-purple-950 uppercase tracking-wide flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-purple-700" />
            <span>What the customer needs</span>
          </h3>
          <p className="text-sm text-gray-900 font-medium leading-relaxed">
            {call.summary || 'Caller inquired about services and store hours.'}
          </p>
        </div>

        {/* Details Grid: Phone, Vehicle, Service Requested */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3.5 space-y-1">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1">
              <Phone className="w-3 h-3" />
              Phone Number
            </span>
            <span className="text-sm font-bold text-gray-950 block">
              {call.callerPhone || 'Unknown'}
            </span>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3.5 space-y-1">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1">
              <Car className="w-3 h-3" />
              Vehicle
            </span>
            <span className="text-sm font-bold text-gray-950 block">
              {vehicleString || 'Not specified'}
            </span>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3.5 space-y-1 sm:col-span-2">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1">
              <Wrench className="w-3 h-3" />
              Service Requested
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm font-bold text-gray-950">
                {call.service || 'General inquiry'}
              </span>
              {call.serviceCategory && call.serviceCategory !== 'Other' && (
                <span className="text-xs font-semibold px-2 py-0.5 bg-gray-200 text-gray-800 rounded-md">
                  {call.serviceCategory}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Audio Recording if present */}
        {call.recordingUrl && (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-2">
            <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-purple-700" />
              <span>Call Audio Recording</span>
            </h4>
            <div className="pt-1">
              <audio controls className="w-full h-10">
                <source src={call.recordingUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
            <a
              href={call.recordingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold text-purple-700 hover:text-purple-900 inline-flex items-center gap-1 mt-1"
            >
              <span>Download / Open Recording in New Tab</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Transcript Accordion */}
        {call.transcript && (
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowTranscript(!showTranscript)}
              className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-xs font-bold text-gray-800 min-h-[44px] transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-purple-700" />
                <span>Show full conversation transcript</span>
              </span>
              {showTranscript ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showTranscript && (
              <div className="p-4 bg-white text-xs text-gray-700 leading-relaxed font-mono whitespace-pre-wrap max-h-60 overflow-y-auto border-t border-gray-200">
                {call.transcript}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
