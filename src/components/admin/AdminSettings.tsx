import React, { useState } from 'react';
import { AppSettings } from '../../types/index.ts';
import {
  Save,
  Clock,
  Phone,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Server,
} from 'lucide-react';

interface AdminSettingsProps {
  settings: AppSettings;
  adminEmail: string;
  onSaveSettings: (settings: AppSettings) => Promise<void>;
  saving: boolean;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  settings,
  adminEmail,
  onSaveSettings,
  saving,
}) => {
  const [sameDayCutoff, setSameDayCutoff] = useState(settings.sameDayCutoff || '2:00 PM');
  const [timezone, setTimezone] = useState(settings.timezone || 'America/New_York');
  const [supportPhone, setSupportPhone] = useState(settings.supportPhone || '888-212-1629');
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail || 'support@autointelagent.com');

  const [saveSuccess, setSaveSuccess] = useState(false);

  // N8N Test State
  const [testingN8n, setTestingN8n] = useState(false);
  const [n8nResult, setN8nResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveSettings({
      sameDayCutoff,
      timezone,
      supportPhone,
      supportEmail,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleTestN8n = async () => {
    setTestingN8n(true);
    setN8nResult(null);

    try {
      const res = await fetch('/api/admin/test-n8n', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'N8N webhook test failed.');
      }
      setN8nResult({
        success: true,
        message: data.result?.simulated
          ? 'N8N test event dispatched in simulation mode (N8N_EVENTS_WEBHOOK_URL not configured).'
          : `N8N test event successfully delivered to webhook (HTTP ${data.result?.status || 200}).`,
      });
    } catch (err: any) {
      setN8nResult({
        success: false,
        message: err.message || 'Failed to dispatch N8N test event.',
      });
    } finally {
      setTestingN8n(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Global App Configuration */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-gray-950">Storefront & Cutoff Settings</h2>
          <p className="text-xs text-gray-500">
            Configure system-wide parameters, same-day cutoff time, and primary support channels.
          </p>
        </div>

        {saveSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Settings successfully saved to Firestore!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Daily Same-Day Cutoff Time
            </label>
            <div className="relative">
              <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="text"
                required
                value={sameDayCutoff}
                onChange={(e) => setSameDayCutoff(e.target.value)}
                placeholder="2:00 PM"
                className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm min-h-[44px] focus:bg-white focus:outline-none focus:border-black transition-all"
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Shops paid before this time will be highlighted in yellow if onboarding is incomplete.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Cutoff Timezone
            </label>
            <input
              type="text"
              required
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              placeholder="America/New_York"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm min-h-[44px] focus:bg-white focus:outline-none focus:border-black transition-all"
            />
            <p className="text-[11px] text-gray-400 mt-1">IANA Time Zone identifier</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Support / AI Demo Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="text"
                required
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                placeholder="888-212-1629"
                className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm min-h-[44px] focus:bg-white focus:outline-none focus:border-black transition-all"
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Displayed on storefront & support links</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Support Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="email"
                required
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                placeholder="support@autointelagent.com"
                className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm min-h-[44px] focus:bg-white focus:outline-none focus:border-black transition-all"
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Primary notification contact</p>
          </div>

          <div className="sm:col-span-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="py-2.5 px-5 bg-black hover:bg-gray-800 text-white font-bold text-xs rounded-xl min-h-[44px] flex items-center gap-2 shadow-sm transition-all"
            >
              <Save className="w-4 h-4 text-[#d6bcfa]" />
              <span>{saving ? 'Saving Settings...' : 'Save Settings to Firestore'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. N8N Webhook Test Event Dispatch */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-gray-950 flex items-center gap-2">
            <Server className="w-4 h-4 text-purple-700" />
            <span>n8n Integration & Webhook Diagnostics</span>
          </h2>
          <p className="text-xs text-gray-500">
            Send a test event payload ({`{ event: "test" }`}) to <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800">N8N_EVENTS_WEBHOOK_URL</code> to verify connectivity.
          </p>
        </div>

        {n8nResult && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-start gap-2 ${
              n8nResult.success
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}
          >
            {n8nResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <span>{n8nResult.message}</span>
          </div>
        )}

        <div>
          <button
            type="button"
            disabled={testingN8n}
            onClick={handleTestN8n}
            className="py-2.5 px-5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl min-h-[44px] flex items-center gap-2 shadow-sm transition-all"
          >
            <Send className={`w-4 h-4 ${testingN8n ? 'animate-spin' : ''}`} />
            <span>{testingN8n ? 'Dispatching Test Event...' : 'Send Test Event to n8n'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
