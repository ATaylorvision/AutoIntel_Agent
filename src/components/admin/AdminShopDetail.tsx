import React, { useState, useEffect } from 'react';
import { ShopRecord, TestRecord, ChangeRecord, AuditRecord } from '../../types/index.ts';
import {
  ArrowLeft,
  Copy,
  Check,
  Phone,
  Clock,
  Sparkles,
  ExternalLink,
  Save,
  AlertTriangle,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  Send,
  HelpCircle,
  DollarSign,
  Building,
  MapPin,
  Calendar,
} from 'lucide-react';
import { formatReceptionistInstructions } from './adminHelpers.ts';

interface AdminShopDetailProps {
  shopId: string;
  adminEmail: string;
  onBack: () => void;
  onViewAsShop: (shop: ShopRecord) => void;
}

export const AdminShopDetail: React.FC<AdminShopDetailProps> = ({
  shopId,
  adminEmail,
  onBack,
  onViewAsShop,
}) => {
  const [shop, setShop] = useState<ShopRecord | null>(null);
  const [audit, setAudit] = useState<AuditRecord | null>(null);
  const [tests, setTests] = useState<TestRecord[]>([]);
  const [changes, setChanges] = useState<ChangeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [locationId, setLocationId] = useState('');
  const [autointelNumber, setAutointelNumber] = useState('');
  const [savingLinking, setSavingLinking] = useState(false);
  const [linkingError, setLinkingError] = useState<string | null>(null);
  const [linkingSuccess, setLinkingSuccess] = useState(false);

  // Status control state
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusActionError, setStatusActionError] = useState<string | null>(null);

  // Internal notes
  const [internalNotes, setInternalNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSuccess, setNotesSuccess] = useState(false);

  // Clipboard copy feedback
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Applying change state
  const [applyingChangeId, setApplyingChangeId] = useState<string | null>(null);

  const fetchShopDetail = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/admin/shops/${shopId}?adminEmail=${encodeURIComponent(adminEmail)}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with ${res.status}`);
      }
      const data = await res.json();
      setShop(data.shop);
      setAudit(data.audit || null);
      setTests(data.tests || []);
      setChanges(data.changes || []);
      setLocationId(data.shop?.locationId || '');
      setAutointelNumber(data.shop?.autointelNumber || '888-212-1629');
      setInternalNotes(data.shop?.internalNotes || '');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load shop details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShopDetail();
  }, [shopId, adminEmail]);

  const copyToClipboard = (text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleCopyAllForReceptionist = () => {
    if (!shop) return;
    const text = formatReceptionistInstructions(shop.receptionistSetup, shop.shopName);
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 3000);
  };

  // 3. Save Linking (Location ID & AutoIntel number)
  const handleSaveLinking = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingLinking(true);
    setLinkingError(null);
    setLinkingSuccess(false);

    try {
      const res = await fetch(`/api/admin/shops/${shopId}/linking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminEmail,
          locationId: locationId.trim(),
          autointelNumber: autointelNumber.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save HighLevel linking.');
      }

      setLinkingSuccess(true);
      if (shop) {
        setShop({
          ...shop,
          locationId: data.locationId,
          autointelNumber: data.autointelNumber,
        });
      }
      setTimeout(() => setLinkingSuccess(false), 3000);
    } catch (err: any) {
      setLinkingError(err.message);
    } finally {
      setSavingLinking(false);
    }
  };

  // 4. Status Controls
  const handleStatusAction = async (action: 'provisioning' | 'live' | 'pause' | 'reactivate') => {
    setUpdatingStatus(true);
    setStatusActionError(null);

    try {
      const res = await fetch(`/api/admin/shops/${shopId}/status-control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminEmail,
          action,
          locationId: locationId.trim(),
          autointelNumber: autointelNumber.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Failed to perform status action: ${action}`);
      }

      // Refresh shop state
      await fetchShopDetail();
    } catch (err: any) {
      setStatusActionError(err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // 5. Apply Change
  const handleApplyChange = async (changeId: string) => {
    setApplyingChangeId(changeId);
    try {
      const res = await fetch(`/api/admin/shops/${shopId}/changes/${changeId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminEmail }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to apply change');
      }
      // Update local changes
      setChanges((prev) =>
        prev.map((c) =>
          c.id === changeId
            ? { ...c, applied: true, appliedAt: new Date().toISOString() }
            : c
        )
      );
    } catch (err: any) {
      alert(`Error applying change: ${err.message}`);
    } finally {
      setApplyingChangeId(null);
    }
  };

  // 7. Save Internal Notes
  const handleSaveNotes = async () => {
    setSavingNotes(true);
    setNotesSuccess(false);
    try {
      const res = await fetch(`/api/admin/shops/${shopId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminEmail, internalNotes }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save notes');
      }
      setNotesSuccess(true);
      setTimeout(() => setNotesSuccess(false), 2500);
    } catch (err: any) {
      alert(`Error saving notes: ${err.message}`);
    } finally {
      setSavingNotes(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
        <Clock className="w-6 h-6 animate-spin text-purple-700 mx-auto mb-2" />
        <p className="text-xs text-gray-500 font-medium">Loading shop details...</p>
      </div>
    );
  }

  if (errorMsg || !shop) {
    return (
      <div className="bg-white border border-rose-200 rounded-2xl p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
          <AlertTriangle className="w-5 h-5" />
          <span>Error loading shop</span>
        </div>
        <p className="text-xs text-gray-600">{errorMsg || 'Shop record not found.'}</p>
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 bg-black text-white font-bold text-xs rounded-xl min-h-[44px]"
        >
          Back to Shops List
        </button>
      </div>
    );
  }

  const s = shop.receptionistSetup || ({} as any);
  const isLiveEnabled = Boolean(locationId.trim() && autointelNumber.trim());
  const unappliedChanges = changes.filter((c) => !c.applied);

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Back to shops list"
          >
            <ArrowLeft className="w-4 h-4 text-gray-700" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-gray-950">{shop.shopName}</h1>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  shop.status === 'live' || shop.status === 'active'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : shop.status === 'provisioning'
                    ? 'bg-purple-50 text-purple-800 border-purple-300'
                    : shop.status === 'paid_setup'
                    ? 'bg-amber-50 text-amber-900 border-amber-300'
                    : shop.status === 'paused'
                    ? 'bg-gray-100 text-gray-700 border-gray-300'
                    : 'bg-rose-50 text-rose-800 border-rose-300'
                }`}
              >
                {shop.status}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Owner: <span className="font-semibold text-gray-800">{shop.ownerName}</span> &bull; Mobile:{' '}
              <a href={`tel:${shop.ownerMobile}`} className="text-purple-700 font-semibold hover:underline">
                {shop.ownerMobile}
              </a>{' '}
              &bull; ID: <span className="font-mono text-gray-400">{shop.id}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons: View as shop & Open in Stripe */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 9. View as shop */}
          <button
            type="button"
            onClick={() => onViewAsShop(shop)}
            className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-bold text-xs rounded-xl min-h-[44px] flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Eye className="w-4 h-4 text-purple-700" />
            <span>View as Shop (Read-Only)</span>
          </button>

          {/* 8. Open in Stripe */}
          {shop.stripeCustomerId ? (
            <a
              href={`https://dashboard.stripe.com/customers/${shop.stripeCustomerId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-300 font-bold text-xs rounded-xl min-h-[44px] flex items-center gap-1.5 transition-all"
            >
              <ExternalLink className="w-4 h-4 text-gray-500" />
              <span>Open in Stripe</span>
            </a>
          ) : (
            <span className="text-xs text-gray-400 italic px-2">No Stripe customer ID</span>
          )}
        </div>
      </div>

      {/* 4. STATUS CONTROLS */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-950 uppercase tracking-wider">Status Controls</h2>
            <p className="text-xs text-gray-500">
              Advance shop from provisioning to live or toggle operational state.
            </p>
          </div>
          {shop.liveAt && (
            <div className="text-xs text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
              Live since: {new Date(shop.liveAt).toLocaleString()}
            </div>
          )}
        </div>

        {statusActionError && (
          <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{statusActionError}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-1">
          {/* Mark as Provisioning */}
          <button
            type="button"
            disabled={updatingStatus || shop.status === 'provisioning'}
            onClick={() => handleStatusAction('provisioning')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs min-h-[44px] border transition-all ${
              shop.status === 'provisioning'
                ? 'bg-purple-100 text-purple-900 border-purple-300 opacity-60 cursor-default'
                : 'bg-white hover:bg-purple-50 text-purple-900 border-purple-300 shadow-sm'
            }`}
          >
            Mark as Provisioning
          </button>

          {/* Mark as Live */}
          <div className="relative group">
            <button
              type="button"
              disabled={updatingStatus || !isLiveEnabled || shop.status === 'live' || shop.status === 'active'}
              onClick={() => handleStatusAction('live')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs min-h-[44px] border transition-all flex items-center gap-2 ${
                shop.status === 'live' || shop.status === 'active'
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300 opacity-60 cursor-default'
                  : !isLiveEnabled
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-sm hover:shadow'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Mark as Live</span>
            </button>
            {!isLiveEnabled && (
              <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block z-10 w-64 p-2 bg-gray-900 text-white text-[11px] rounded-lg shadow-lg">
                Requires both HighLevel Location ID and AutoIntel Number below before marking live.
              </div>
            )}
          </div>

          {/* Pause */}
          {shop.status === 'live' || shop.status === 'active' ? (
            <button
              type="button"
              disabled={updatingStatus}
              onClick={() => handleStatusAction('pause')}
              className="px-4 py-2.5 rounded-xl font-bold text-xs min-h-[44px] bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 transition-all"
            >
              Pause Service
            </button>
          ) : null}

          {/* Reactivate */}
          {shop.status === 'paused' && (
            <button
              type="button"
              disabled={updatingStatus}
              onClick={() => handleStatusAction('reactivate')}
              className="px-4 py-2.5 rounded-xl font-bold text-xs min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-600 transition-all"
            >
              Reactivate (Set Live)
            </button>
          )}
        </div>
      </div>

      {/* 3. LINKING (HighLevel Location ID & AutoIntel Number) */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-sm font-bold text-gray-950 uppercase tracking-wider">
            HighLevel & Voice Line Linking
          </h2>
          <p className="text-xs text-gray-500">
            Link the HighLevel account location ID and receptionist phone number. Location ID must be unique across all shops.
          </p>
        </div>

        {linkingError && (
          <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{linkingError}</span>
          </div>
        )}

        {linkingSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>HighLevel linking saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSaveLinking} className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              HighLevel Location ID <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              placeholder="e.g. loc_9KxLmQ2z9P"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-mono min-h-[44px] focus:bg-white focus:outline-none focus:border-black transition-all"
            />
            <p className="text-[11px] text-gray-400 mt-1">Unique account ID in HighLevel</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              AutoIntel Receptionist Phone Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="text"
                required
                value={autointelNumber}
                onChange={(e) => setAutointelNumber(e.target.value)}
                placeholder="e.g. 888-212-1629"
                className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-semibold min-h-[44px] focus:bg-white focus:outline-none focus:border-black transition-all"
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Number answered by the AI receptionist</p>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={savingLinking}
              className="px-5 py-2.5 bg-black hover:bg-gray-800 text-white font-bold text-xs rounded-xl min-h-[44px] flex items-center gap-2 shadow-sm transition-all"
            >
              <Save className="w-4 h-4 text-[#d6bcfa]" />
              <span>{savingLinking ? 'Saving Linking...' : 'Save HighLevel Linking'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 1. SETUP INFO & "COPY ALL FOR RECEPTIONIST" BUTTON */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-gray-950">Receptionist Setup Info</h2>
            <p className="text-xs text-gray-500">
              Each field has a copy button. Use the master button to copy the prompt block for HighLevel.
            </p>
          </div>

          {/* Master Copy Button */}
          <button
            type="button"
            onClick={handleCopyAllForReceptionist}
            className={`px-4 py-2.5 rounded-xl font-black text-xs min-h-[44px] flex items-center gap-2 shadow-sm transition-all ${
              copiedAll
                ? 'bg-emerald-600 text-white'
                : 'bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white'
            }`}
          >
            {copiedAll ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied All For Receptionist!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[#d6bcfa]" />
                <span>Copy All For Receptionist</span>
              </>
            )}
          </button>
        </div>

        {/* 12 SETUP FIELDS WITH INDIVIDUAL COPY BUTTONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. Shop Info */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-purple-700" />
                1. Shop Info
              </span>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    `${s.shopName || shop.shopName}\n${[s.address, s.city, s.state, s.zip].filter(Boolean).join(', ')}\n${s.mainPhone || ''}\n${s.website || ''}`,
                    'shop_info'
                  )
                }
                className="text-[11px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 min-h-[32px]"
              >
                {copiedField === 'shop_info' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedField === 'shop_info' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="text-xs text-gray-700 space-y-0.5">
              <p className="font-semibold">{s.shopName || shop.shopName}</p>
              <p>{[s.address, s.city, s.state, s.zip].filter(Boolean).join(', ') || 'Address not entered'}</p>
              <p>Phone: {s.mainPhone || 'None'}</p>
              {s.website && <p>Website: {s.website}</p>}
            </div>
          </div>

          {/* 2. Service Area */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-purple-700" />
                2. Service Area
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(s.serviceArea || '', 'service_area')}
                className="text-[11px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 min-h-[32px]"
              >
                {copiedField === 'service_area' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedField === 'service_area' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-gray-700">{s.serviceArea || 'Not specified'}</p>
          </div>

          {/* 3. Hours */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2 md:col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-700" />
                3. Hours
              </span>
              <button
                type="button"
                onClick={() => {
                  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
                  const text = s.hours
                    ? days
                        .map((d) => {
                          const config = s.hours[d];
                          const label = d.charAt(0).toUpperCase() + d.slice(1);
                          return !config?.open ? `${label}: Closed` : `${label}: ${config.openTime} - ${config.closeTime}`;
                        })
                        .join('\n')
                    : 'Monday - Friday: 8:00 AM - 5:00 PM';
                  copyToClipboard(text, 'hours');
                }}
                className="text-[11px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 min-h-[32px]"
              >
                {copiedField === 'hours' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedField === 'hours' ? 'Copied' : 'Copy'}
              </button>
            </div>
            {s.hours ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-[11px]">
                {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const).map((day) => {
                  const config = s.hours?.[day];
                  return (
                    <div key={day} className="bg-white p-2 rounded-lg border border-gray-200">
                      <div className="font-bold text-gray-800 capitalize">{day.slice(0, 3)}</div>
                      <div className="text-gray-600">
                        {config?.open ? `${config.openTime} - ${config.closeTime}` : 'Closed'}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-500">Default: Mon-Fri 8am-5pm</p>
            )}
          </div>

          {/* 4. Services */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900">4. Services Offered</span>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    [...(s.services || []), s.otherService ? `Other: ${s.otherService}` : null]
                      .filter(Boolean)
                      .join(', '),
                    'services'
                  )
                }
                className="text-[11px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 min-h-[32px]"
              >
                {copiedField === 'services' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedField === 'services' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(s.services || []).map((srv: string) => (
                <span key={srv} className="text-[11px] bg-white border border-gray-300 px-2 py-0.5 rounded-md text-gray-800">
                  {srv}
                </span>
              ))}
              {s.otherService && (
                <span className="text-[11px] bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md text-purple-900">
                  Other: {s.otherService}
                </span>
              )}
            </div>
          </div>

          {/* 5. Never-Do Rules */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900">5. Never-Do Rules</span>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    [...(s.neverDo || []), s.neverDoOther ? `Other: ${s.neverDoOther}` : null]
                      .filter(Boolean)
                      .join('\n'),
                    'never_do'
                  )
                }
                className="text-[11px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 min-h-[32px]"
              >
                {copiedField === 'never_do' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedField === 'never_do' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <ul className="text-xs text-rose-900 space-y-1">
              {(s.neverDo || []).map((rule: string) => (
                <li key={rule} className="flex items-start gap-1">
                  <span className="font-bold">&bull;</span>
                  <span>{rule}</span>
                </li>
              ))}
              {s.neverDoOther && (
                <li className="flex items-start gap-1">
                  <span className="font-bold">&bull;</span>
                  <span>{s.neverDoOther}</span>
                </li>
              )}
            </ul>
          </div>

          {/* 6. Pricing Rules */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-purple-700" />
                6. Pricing Rules
              </span>
              <button
                type="button"
                onClick={() => {
                  const text =
                    s.pricingChoice === 'no_quote'
                      ? 'No quotes over phone. Take vehicle details and message.'
                      : (s.prices || []).map((p: any) => `${p.service}: ${p.price}`).join('\n');
                  copyToClipboard(text, 'prices');
                }}
                className="text-[11px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 min-h-[32px]"
              >
                {copiedField === 'prices' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedField === 'prices' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="text-xs text-gray-700">
              <p className="font-semibold text-gray-900">
                {s.pricingChoice === 'no_quote'
                  ? 'Policy: Do not quote prices over phone.'
                  : 'Policy: Share approved pricing list'}
              </p>
              {s.pricingChoice === 'share_prices' && s.prices && (
                <div className="mt-2 space-y-1">
                  {s.prices.map((p: any, idx: number) => (
                    <div key={idx} className="flex justify-between bg-white px-2 py-1 rounded border border-gray-200">
                      <span>{p.service}</span>
                      <span className="font-bold text-purple-700">{p.price}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 7. Emergency and Tow Handling */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900">7. Emergency & Tow Handling</span>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    s.emergencyHandling === 'transfer'
                      ? `Transfer urgent calls to ${s.emergencyPhone || 'shop phone'}`
                      : 'Take caller name, vehicle, location and mobile number for immediate follow-up',
                    'emergency'
                  )
                }
                className="text-[11px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 min-h-[32px]"
              >
                {copiedField === 'emergency' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedField === 'emergency' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-gray-700">
              {s.emergencyHandling === 'transfer'
                ? `Transfer directly to: ${s.emergencyPhone || 'Main shop phone'}`
                : 'Take full caller details, vehicle condition, and text alert owner immediately.'}
            </p>
          </div>

          {/* 8. Greeting */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900">8. Greeting</span>
              <button
                type="button"
                onClick={() => copyToClipboard(s.greeting || '', 'greeting')}
                className="text-[11px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 min-h-[32px]"
              >
                {copiedField === 'greeting' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedField === 'greeting' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-gray-700 italic">"{s.greeting || `Thanks for calling ${shop.shopName}, how can I help you?`}"</p>
          </div>

          {/* 9. Policies */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900">9. Policies</span>
              <button
                type="button"
                onClick={() => copyToClipboard(s.policies || '', 'policies')}
                className="text-[11px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 min-h-[32px]"
              >
                {copiedField === 'policies' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedField === 'policies' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-gray-700">{s.policies || 'Standard shop terms.'}</p>
          </div>

          {/* 10. Common Questions (FAQ) */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-purple-700" />
                10. Common Questions
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(s.faq || '', 'faq')}
                className="text-[11px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 min-h-[32px]"
              >
                {copiedField === 'faq' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedField === 'faq' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-gray-700 whitespace-pre-wrap">{s.faq || 'None entered.'}</p>
          </div>

          {/* 11. Promotions */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900">11. Promotions</span>
              <button
                type="button"
                onClick={() => copyToClipboard(s.promotions || '', 'promotions')}
                className="text-[11px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 min-h-[32px]"
              >
                {copiedField === 'promotions' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedField === 'promotions' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-gray-700">{s.promotions || 'No active promotions.'}</p>
          </div>

          {/* 12. Special Instructions */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2 md:col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900">12. Special Instructions</span>
              <button
                type="button"
                onClick={() => copyToClipboard(s.specialInstructions || '', 'special_instructions')}
                className="text-[11px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 min-h-[32px]"
              >
                {copiedField === 'special_instructions' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedField === 'special_instructions' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-gray-700 whitespace-pre-wrap">
              {s.specialInstructions || 'None provided.'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. MISSED-CALL AUDIT RESULTS (If any) */}
      {audit && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-950 uppercase tracking-wider">
              Missed-Call Audit Benchmark
            </h2>
            <span className="text-xs text-gray-400">ID: {audit.id}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-center">
              <div className="text-[11px] text-gray-500 font-medium">Weekly Calls</div>
              <div className="text-base font-black text-gray-900">{audit.weeklyCalls}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-center">
              <div className="text-[11px] text-gray-500 font-medium">Missed %</div>
              <div className="text-base font-black text-rose-700">{audit.missedPercent}%</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-center">
              <div className="text-[11px] text-gray-500 font-medium">Avg Repair Ticket</div>
              <div className="text-base font-black text-gray-900">${audit.avgTicket}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-center">
              <div className="text-[11px] text-gray-500 font-medium">Close Rate</div>
              <div className="text-base font-black text-gray-900">{audit.closeRate}%</div>
            </div>
            <div className="bg-rose-50 p-3 rounded-xl border border-rose-200 text-center">
              <div className="text-[11px] text-rose-700 font-medium">Lost Jobs / Mo</div>
              <div className="text-base font-black text-rose-800">{audit.lostJobs}</div>
            </div>
            <div className="bg-rose-50 p-3 rounded-xl border border-rose-200 text-center">
              <div className="text-[11px] text-rose-700 font-medium">Lost Revenue / Mo</div>
              <div className="text-base font-black text-rose-800">${audit.lostRevenue?.toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}

      {/* 5. CHANGES TO APPLY */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-950 uppercase tracking-wider">
              Pending Changes ({unappliedChanges.length})
            </h2>
            <p className="text-xs text-gray-500">
              Modifications submitted by the shop owner requiring receptionist prompt adjustment.
            </p>
          </div>
        </div>

        {changes.length === 0 ? (
          <p className="text-xs text-gray-500 italic py-2">No post-onboarding changes submitted for this shop.</p>
        ) : (
          <div className="space-y-3">
            {changes.map((ch) => (
              <div
                key={ch.id}
                className={`p-4 rounded-xl border transition-all ${
                  ch.applied ? 'bg-gray-50 border-gray-200 opacity-75' : 'bg-amber-50/50 border-amber-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-gray-900">{ch.section}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ch.applied ? 'bg-gray-200 text-gray-700' : 'bg-amber-200 text-amber-900'
                      }`}
                    >
                      {ch.applied ? 'Applied' : 'Pending Review'}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {new Date(ch.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {!ch.applied && (
                    <button
                      type="button"
                      disabled={applyingChangeId === ch.id}
                      onClick={() => ch.id && handleApplyChange(ch.id)}
                      className="px-3.5 py-1.5 bg-black hover:bg-gray-800 text-white font-bold text-xs rounded-lg min-h-[38px] flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#d6bcfa]" />
                      <span>{applyingChangeId === ch.id ? 'Applying...' : 'Mark as Applied'}</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-gray-200">
                    <span className="text-[11px] font-bold text-gray-400 uppercase">Old Values</span>
                    <pre className="text-[11px] text-gray-600 mt-1 whitespace-pre-wrap font-sans">
                      {typeof ch.oldValues === 'object' ? JSON.stringify(ch.oldValues, null, 2) : String(ch.oldValues || 'None')}
                    </pre>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-gray-200">
                    <span className="text-[11px] font-bold text-purple-700 uppercase">New Values</span>
                    <pre className="text-[11px] text-gray-900 font-semibold mt-1 whitespace-pre-wrap font-sans">
                      {typeof ch.newValues === 'object' ? JSON.stringify(ch.newValues, null, 2) : String(ch.newValues || 'None')}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. TEST RESULTS */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-950 uppercase tracking-wider">
              Verification Test Results ({tests.length})
            </h2>
            <p className="text-xs text-gray-500">
              Scenario test verification calls performed by the shop owner.
            </p>
          </div>
        </div>

        {tests.length === 0 ? (
          <p className="text-xs text-gray-500 italic py-2">
            No verification test calls recorded yet. The owner can run tests on the Test tab.
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {tests.map((t, idx) => {
              const isGood = t.result === 'handled_well' || t.result === 'It handled this well';
              return (
                <div key={t.id || idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-gray-900">{t.scenario}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isGood ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' : 'bg-rose-50 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {isGood ? 'Handled Well' : 'Something was off'}
                      </span>
                    </div>
                    {t.note && <p className="text-xs text-gray-600 italic">"{t.note}"</p>}
                  </div>
                  <span className="text-[11px] text-gray-400 shrink-0">
                    {new Date(t.createdAt).toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 7. INTERNAL NOTES (Admin Only) */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-sm font-bold text-gray-950 uppercase tracking-wider">
            Internal Notes (G2G Admin Only)
          </h2>
          <p className="text-xs text-gray-500">
            Private notes for onboarding staff. Never visible to the shop owner.
          </p>
        </div>

        {notesSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Internal notes saved!</span>
          </div>
        )}

        <textarea
          rows={4}
          value={internalNotes}
          onChange={(e) => setInternalNotes(e.target.value)}
          placeholder="e.g. Call owner on Tuesday to confirm Saturday schedule change..."
          className="w-full p-3.5 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-black transition-all"
        />

        <div>
          <button
            type="button"
            disabled={savingNotes}
            onClick={handleSaveNotes}
            className="px-5 py-2.5 bg-black hover:bg-gray-800 text-white font-bold text-xs rounded-xl min-h-[44px] flex items-center gap-2 shadow-sm transition-all"
          >
            <Save className="w-4 h-4 text-[#d6bcfa]" />
            <span>{savingNotes ? 'Saving Notes...' : 'Save Internal Notes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
