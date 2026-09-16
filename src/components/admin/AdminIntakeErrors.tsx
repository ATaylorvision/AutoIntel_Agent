import React, { useState, useEffect } from 'react';
import { IntakeError } from '../../types/index.ts';
import {
  AlertTriangle,
  RefreshCw,
  Phone,
  Clock,
  ChevronDown,
  ChevronUp,
  MapPin,
  CheckCircle2,
  FileCode,
} from 'lucide-react';

interface AdminIntakeErrorsProps {
  adminEmail: string;
}

export const AdminIntakeErrors: React.FC<AdminIntakeErrorsProps> = ({ adminEmail }) => {
  const [errors, setErrors] = useState<IntakeError[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchErrors = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/intake-errors?adminEmail=${encodeURIComponent(adminEmail)}`);
      if (res.ok) {
        const data = await res.json();
        setErrors(data.errors || []);
      }
    } catch (err) {
      console.error('Error fetching intake errors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchErrors();
  }, [adminEmail]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-950 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>HighLevel Intake Errors ({errors.length})</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Documents logged from the HighLevel webhook when inbound calls fail to match an active shop or location ID.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchErrors}
          disabled={loading}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl min-h-[44px] flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* List */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-xs text-gray-500 flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 animate-spin text-purple-700" />
            <span>Checking intake errors...</span>
          </div>
        ) : errors.length === 0 ? (
          <div className="text-center py-16 px-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-gray-900">No Unmatched Intake Errors</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
              All inbound call webhooks received from HighLevel have successfully matched valid registered shops.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {errors.map((err, idx) => {
              const isExpanded = expandedId === (err.id || String(idx));
              return (
                <div key={err.id || idx} className="p-5 space-y-2 hover:bg-gray-50/60 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                        {err.errorReason || 'Unmatched Location ID'}
                      </span>
                      {err.callerPhone && (
                        <span className="text-xs text-gray-700 font-semibold flex items-center gap-1">
                          <Phone className="w-3 h-3 text-gray-400" />
                          Caller: {err.callerPhone}
                        </span>
                      )}
                      {err.locationId && (
                        <span className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                          Location: {err.locationId}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-gray-400">
                        {new Date(err.createdAt).toLocaleString()}
                      </span>
                      {err.rawPayload && (
                        <button
                          type="button"
                          onClick={() => setExpandedId(isExpanded ? null : (err.id || String(idx)))}
                          className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
                        >
                          <FileCode className="w-3.5 h-3.5" />
                          <span>{isExpanded ? 'Hide Payload' : 'View Payload'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {isExpanded && err.rawPayload && (
                    <div className="mt-3 bg-gray-950 text-gray-200 p-3.5 rounded-xl text-xs overflow-x-auto font-mono">
                      <pre>{JSON.stringify(err.rawPayload, null, 2)}</pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
