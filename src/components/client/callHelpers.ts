import { CallRecord, CallOutcome } from '../../types/index.ts';

export function formatFriendlyTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    const timeStr = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    if (isToday) return `Today, ${timeStr}`;
    if (isYesterday) return `Yesterday, ${timeStr}`;

    return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${timeStr}`;
  } catch {
    return dateStr;
  }
}

export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0s';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  if (m === 0) return `${s}s`;
  return `${m}m ${s > 0 ? `${s}s` : ''}`;
}

export function getOutcomeLabel(outcome: CallOutcome): string {
  switch (outcome) {
    case 'appointment_requested':
      return 'Appointment Requested';
    case 'callback_needed':
      return 'Callback Needed';
    case 'transferred':
      return 'Call Transferred';
    case 'question_answered':
      return 'Question Answered';
    case 'spam_or_hangup':
      return 'Hang-up / Spam';
    default:
      return 'Question Answered';
  }
}

export function getOutcomeDotColor(outcome: CallOutcome): string {
  switch (outcome) {
    case 'appointment_requested':
      return 'bg-emerald-500';
    case 'callback_needed':
      return 'bg-amber-500';
    case 'transferred':
      return 'bg-blue-500';
    default:
      return 'bg-gray-400';
  }
}

export function getOutcomeBadgeStyle(outcome: CallOutcome): string {
  switch (outcome) {
    case 'appointment_requested':
      return 'bg-emerald-50 text-emerald-800 border-emerald-300';
    case 'callback_needed':
      return 'bg-amber-50 text-amber-800 border-amber-300';
    case 'transferred':
      return 'bg-blue-50 text-blue-800 border-blue-300';
    case 'spam_or_hangup':
      return 'bg-gray-100 text-gray-600 border-gray-300';
    default:
      return 'bg-purple-50 text-purple-800 border-purple-300';
  }
}
