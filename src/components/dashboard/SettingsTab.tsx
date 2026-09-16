import React, { useState } from 'react';
import {
  Building2,
  Clock,
  Sparkles,
  User,
  CreditCard,
  Bell,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Phone,
  Mail,
  ExternalLink,
  Wrench,
  DollarSign,
  AlertTriangle,
  X,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useSettings } from '../../context/SettingsContext.tsx';

interface OperatingDay {
  open: boolean;
  openTime: string;
  closeTime: string;
}

type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

export const SettingsTab: React.FC = () => {
  const { shopRecord, userRecord, currentUser } = useAuth();
  const { settings } = useSettings();

  // Collapsible sections state: all expanded on desktop, all collapsed on mobile
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const isDesktop = typeof window !== 'undefined' ? window.innerWidth >= 768 : true;
    return {
      shop_info: isDesktop,
      receptionist_config: isDesktop,
      account_billing: isDesktop,
      notifications: isDesktop,
    };
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // -------------------------------------------------------------
  // SECTION 1: SHOP INFO & HOURS
  // -------------------------------------------------------------
  const [shopName, setShopName] = useState(shopRecord?.shopName || 'Precision Auto Care');
  const [address, setAddress] = useState(shopRecord?.address || '1420 Auto Center Drive');
  const [city, setCity] = useState(shopRecord?.city || 'Austin');
  const [stateVal, setStateVal] = useState(shopRecord?.state || 'TX');
  const [zipVal, setZipVal] = useState(shopRecord?.zip || '78704');
  const [mainPhone, setMainPhone] = useState(shopRecord?.mainPhone || '(512) 555-0198');

  const [hours, setHours] = useState<Record<DayKey, OperatingDay>>({
    mon: { open: true, openTime: '08:00', closeTime: '18:00' },
    tue: { open: true, openTime: '08:00', closeTime: '18:00' },
    wed: { open: true, openTime: '08:00', closeTime: '18:00' },
    thu: { open: true, openTime: '08:00', closeTime: '18:00' },
    fri: { open: true, openTime: '08:00', closeTime: '18:00' },
    sat: { open: true, openTime: '08:00', closeTime: '14:00' },
  });

  const [shopInfoSaving, setShopInfoSaving] = useState(false);
  const [shopInfoFeedback, setShopInfoFeedback] = useState<string | null>(null);

  const handleSaveShopInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setShopInfoSaving(true);
    setShopInfoFeedback(null);
    setTimeout(() => {
      setShopInfoSaving(false);
      setShopInfoFeedback('Shop information and operating hours saved successfully.');
      setTimeout(() => setShopInfoFeedback(null), 4000);
    }, 600);
  };

  const handleHourToggle = (day: DayKey) => {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], open: !prev[day].open },
    }));
  };

  const handleTimeChange = (day: DayKey, field: 'openTime' | 'closeTime', val: string) => {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: val },
    }));
  };

  // -------------------------------------------------------------
  // SECTION 2: RECEPTIONIST CONFIGURATION
  // -------------------------------------------------------------
  const [activeConfigModal, setActiveConfigModal] = useState<string | null>(null);

  // Configuration items
  const [services, setServices] = useState<string[]>([
    'Brake Service & Pad Replacement',
    'Oil Change & Fluid Flushes',
    'Engine Diagnostics (Check Engine Light)',
    'Air Conditioning & Heating',
    'Suspension & Steering',
    'Tire Rotation & Wheel Balancing',
    '30k / 60k / 90k Scheduled Maintenance',
    'Transmission Diagnostics',
  ]);

  const [emergencyTransfer, setEmergencyTransfer] = useState(true);
  const [emergencyPhone, setEmergencyPhone] = useState('(512) 555-0199');
  const [priceQuotes, setPriceQuotes] = useState<{ service: string; price: string }[]>([
    { service: 'Synthetic Oil Change (up to 5 qts)', price: '$69.95' },
    { service: 'Comprehensive Vehicle Inspection', price: '$89.00' },
    { service: 'Brake Pad Replacement (per axle)', price: '$189.00' },
    { service: 'AC System Evac & Recharge', price: '$149.00' },
  ]);

  const [configFeedback, setConfigFeedback] = useState<string | null>(null);

  // -------------------------------------------------------------
  // SECTION 3: ACCOUNT & BILLING
  // -------------------------------------------------------------
  const [firstName, setFirstName] = useState(userRecord?.firstName || 'Mike');
  const [lastName, setLastName] = useState(userRecord?.lastName || 'Reynolds');
  const [email, setEmail] = useState(userRecord?.email || currentUser?.email || 'mike@precisionautocare.com');
  const [mobilePhone, setMobilePhone] = useState(userRecord?.mobile || '(512) 555-0142');

  const [profileSaving, setProfileSaving] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<string | null>(null);
  const [openingPortal, setOpeningPortal] = useState(false);
  const [portalMessage, setPortalMessage] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileFeedback(null);
    setTimeout(() => {
      setProfileSaving(false);
      setProfileFeedback('Owner profile updated successfully.');
      setTimeout(() => setProfileFeedback(null), 4000);
    }, 600);
  };

  const handleManageBilling = () => {
    setOpeningPortal(true);
    setPortalMessage(null);
    setTimeout(() => {
      setOpeningPortal(false);
      setPortalMessage('Redirecting to Stripe Customer Portal...');
      setTimeout(() => setPortalMessage(null), 3000);
    }, 800);
  };

  // -------------------------------------------------------------
  // SECTION 4: NOTIFICATIONS
  // -------------------------------------------------------------
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [emailSummaries, setEmailSummaries] = useState(true);
  const [afterHoursAlerts, setAfterHoursAlerts] = useState(true);
  const [notificationsSaving, setNotificationsSaving] = useState(false);
  const [notificationsFeedback, setNotificationsFeedback] = useState<string | null>(null);

  const handleSaveNotifications = () => {
    setNotificationsSaving(true);
    setNotificationsFeedback(null);
    setTimeout(() => {
      setNotificationsSaving(false);
      setNotificationsFeedback('Notification preferences saved.');
      setTimeout(() => setNotificationsFeedback(null), 4000);
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* SECTION 1: SHOP INFO & HOURS */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => toggleSection('shop_info')}
          className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 hover:bg-gray-50/75 transition-colors"
          aria-expanded={openSections.shop_info}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-950">Shop Info &amp; Hours</h3>
              <p className="text-xs text-gray-500">
                Operating address, contact number, and business hours for receptionist scheduling
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-xs font-semibold text-gray-400">
              {openSections.shop_info ? 'Collapse' : 'Expand'}
            </span>
            {openSections.shop_info ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </button>

        {openSections.shop_info && (
          <div className="p-5 sm:p-6 border-t border-gray-100 space-y-6 animate-in fade-in-50 duration-200">
            {shopInfoFeedback && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{shopInfoFeedback}</span>
              </div>
            )}

            <form onSubmit={handleSaveShopInfo} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Shop Name
                  </label>
                  <input
                    type="text"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Main Shop Phone
                  </label>
                  <input
                    type="text"
                    value={mainPhone}
                    onChange={(e) => setMainPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-3 sm:col-span-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      value={stateVal}
                      onChange={(e) => setStateVal(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">ZIP</label>
                    <input
                      type="text"
                      value={zipVal}
                      onChange={(e) => setZipVal(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Operating Hours Grid (Mon-Sat) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-purple-600" />
                    <span>Operating Hours (Mon &ndash; Sat)</span>
                  </h4>
                  <span className="text-[11px] text-gray-500">AutoIntel uses this for after-hours rules</span>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 sm:p-4 divide-y divide-gray-200">
                  {(
                    [
                      { key: 'mon', label: 'Monday' },
                      { key: 'tue', label: 'Tuesday' },
                      { key: 'wed', label: 'Wednesday' },
                      { key: 'thu', label: 'Thursday' },
                      { key: 'fri', label: 'Friday' },
                      { key: 'sat', label: 'Saturday' },
                    ] as { key: DayKey; label: string }[]
                  ).map(({ key, label }) => {
                    const item = hours[key];
                    return (
                      <div
                        key={key}
                        className="py-2.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id={`hour-check-${key}`}
                            checked={item.open}
                            onChange={() => handleHourToggle(key)}
                            className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                          />
                          <label
                            htmlFor={`hour-check-${key}`}
                            className={`text-xs font-bold cursor-pointer ${
                              item.open ? 'text-gray-900' : 'text-gray-400 line-through'
                            }`}
                          >
                            {label}
                          </label>
                        </div>

                        {item.open ? (
                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            <input
                              type="time"
                              value={item.openTime}
                              onChange={(e) => handleTimeChange(key, 'openTime', e.target.value)}
                              className="px-2 py-1 text-xs bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-1 focus:ring-purple-600"
                            />
                            <span className="text-xs text-gray-400">to</span>
                            <input
                              type="time"
                              value={item.closeTime}
                              onChange={(e) => handleTimeChange(key, 'closeTime', e.target.value)}
                              className="px-2 py-1 text-xs bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-1 focus:ring-purple-600"
                            />
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-gray-400 self-end sm:self-auto">
                            Closed
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={shopInfoSaving}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl min-h-[44px] transition-colors shadow-xs flex items-center gap-2"
                >
                  {shopInfoSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* SECTION 2: RECEPTIONIST CONFIGURATION */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => toggleSection('receptionist_config')}
          className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 hover:bg-gray-50/75 transition-colors"
          aria-expanded={openSections.receptionist_config}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-gray-950">
                  Receptionist Configuration
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-purple-100 text-purple-800">
                  73% Ready
                </span>
              </div>
              <p className="text-xs text-gray-500">
                AI rules, services offered, pricing ranges, and emergency towing transfer policies
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-xs font-semibold text-gray-400">
              {openSections.receptionist_config ? 'Collapse' : 'Expand'}
            </span>
            {openSections.receptionist_config ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </button>

        {openSections.receptionist_config && (
          <div className="p-5 sm:p-6 border-t border-gray-100 space-y-6 animate-in fade-in-50 duration-200">
            {/* Setup Score Indicator (73% score and progress bar) */}
            <div className="bg-gradient-to-r from-[#faf5ff] to-white border border-[#e9d8fd] rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-purple-900 uppercase tracking-wide">
                    Knowledge Base Completeness
                  </span>
                  <p className="text-xl sm:text-2xl font-black text-gray-950">
                    73% <span className="text-xs font-medium text-gray-500">Setup Score</span>
                  </p>
                </div>
                <div className="px-3 py-1.5 bg-purple-600 text-white rounded-xl text-xs font-bold shadow-xs">
                  Active &amp; Guarding Calls
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600 rounded-full transition-all duration-500"
                    style={{ width: '73%' }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-gray-500 font-medium">
                  <span>Essential Info (6/6 completed)</span>
                  <span>Recommended Polish (2/4 completed)</span>
                </div>
              </div>
            </div>

            {/* Checklist of configuration items */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                Configuration Checklist &amp; Customization Rules
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Item 1: Services Offered */}
                <div
                  onClick={() => setActiveConfigModal('services')}
                  className="p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50/30 transition-all cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-gray-900 group-hover:text-purple-900">
                        Services Offered
                      </span>
                    </div>
                    <span className="text-[11px] text-purple-700 font-bold group-hover:underline">
                      Configure &rarr;
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {services.length} services configured (Brakes, AC, Oil &amp; Filters, Diagnostics, etc.)
                  </p>
                </div>

                {/* Item 2: Emergency & Towing Rules */}
                <div
                  onClick={() => setActiveConfigModal('emergency')}
                  className="p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50/30 transition-all cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-gray-900 group-hover:text-purple-900">
                        Emergency &amp; Towing Rules
                      </span>
                    </div>
                    <span className="text-[11px] text-purple-700 font-bold group-hover:underline">
                      Configure &rarr;
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Call transfer enabled to {emergencyPhone} for stranded motorist emergencies.
                  </p>
                </div>

                {/* Item 3: Pricing & Estimates */}
                <div
                  onClick={() => setActiveConfigModal('pricing')}
                  className="p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50/30 transition-all cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-gray-900 group-hover:text-purple-900">
                        Pricing Preferences
                      </span>
                    </div>
                    <span className="text-[11px] text-purple-700 font-bold group-hover:underline">
                      Configure &rarr;
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    4 fixed service quotes provided to callers asking for pricing over the phone.
                  </p>
                </div>

                {/* Item 4: Warranty & Policies */}
                <div
                  onClick={() => setActiveConfigModal('warranty')}
                  className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 hover:border-amber-300 hover:bg-amber-50/60 transition-all cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-bold text-amber-900 group-hover:text-amber-950">
                        Warranty &amp; Guarantee Policy
                      </span>
                    </div>
                    <span className="text-[11px] text-amber-800 font-bold group-hover:underline">
                      Add details &rarr;
                    </span>
                  </div>
                  <p className="text-xs text-amber-800/80">
                    Standard 24-month / 24,000-mile parts and labor nationwide warranty.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: ACCOUNT & BILLING */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => toggleSection('account_billing')}
          className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 hover:bg-gray-50/75 transition-colors"
          aria-expanded={openSections.account_billing}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-950">Account &amp; Billing</h3>
              <p className="text-xs text-gray-500">
                Owner profile credentials, subscription tier, and Stripe payment settings
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-xs font-semibold text-gray-400">
              {openSections.account_billing ? 'Collapse' : 'Expand'}
            </span>
            {openSections.account_billing ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </button>

        {openSections.account_billing && (
          <div className="p-5 sm:p-6 border-t border-gray-100 space-y-6 animate-in fade-in-50 duration-200">
            {profileFeedback && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{profileFeedback}</span>
              </div>
            )}

            {/* Owner Profile Form */}
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                Owner Profile
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Mobile Phone (For Alerts)
                  </label>
                  <input
                    type="text"
                    value={mobilePhone}
                    onChange={(e) => setMobilePhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="px-5 py-2.5 bg-gray-900 hover:bg-black text-white font-bold text-xs rounded-xl min-h-[44px] transition-colors shadow-xs flex items-center gap-2"
                >
                  {profileSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Profile</span>
                </button>
              </div>
            </form>

            <div className="border-t border-gray-100 my-4" />

            {/* Billing Status & Stripe Portal */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5 text-purple-600" />
                <span>Subscription &amp; Billing</span>
              </h4>

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold text-gray-950">
                      AutoIntel Standard Plan
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Active ($199/month)
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Includes 24/7 call answering, appointment queue, instant SMS notifications, and monthly call audits.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <button
                    type="button"
                    onClick={handleManageBilling}
                    disabled={openingPortal}
                    className="px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-900 font-bold text-xs rounded-xl min-h-[44px] flex items-center gap-2 shadow-2xs transition-colors"
                  >
                    {openingPortal ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <ExternalLink className="w-3.5 h-3.5 text-gray-600" />
                    )}
                    <span>Manage Billing</span>
                  </button>
                </div>
              </div>

              {portalMessage && (
                <p className="text-xs font-medium text-purple-700 bg-purple-50 p-2.5 rounded-lg border border-purple-200">
                  {portalMessage}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 4: NOTIFICATIONS */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => toggleSection('notifications')}
          className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 hover:bg-gray-50/75 transition-colors"
          aria-expanded={openSections.notifications}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-950">Notifications</h3>
              <p className="text-xs text-gray-500">
                Configure immediate text message alerts, daily email summaries, and after-hours alerts
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-xs font-semibold text-gray-400">
              {openSections.notifications ? 'Collapse' : 'Expand'}
            </span>
            {openSections.notifications ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </button>

        {openSections.notifications && (
          <div className="p-5 sm:p-6 border-t border-gray-100 space-y-6 animate-in fade-in-50 duration-200">
            {notificationsFeedback && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{notificationsFeedback}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Toggle 1: Text Message Alerts */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50/50">
                <div className="space-y-0.5 pr-4">
                  <span className="text-sm font-bold text-gray-900 block">
                    Text Message Alerts
                  </span>
                  <p className="text-xs text-gray-500">
                    Receive immediate SMS notifications with caller summary and vehicle details whenever an appointment is requested.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={smsAlerts}
                  onClick={() => setSmsAlerts(!smsAlerts)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    smsAlerts ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      smsAlerts ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 2: Email Summaries */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50/50">
                <div className="space-y-0.5 pr-4">
                  <span className="text-sm font-bold text-gray-900 block">
                    Email Summaries
                  </span>
                  <p className="text-xs text-gray-500">
                    Receive daily morning digests of all call logs, captured customers, and completed appointments.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={emailSummaries}
                  onClick={() => setEmailSummaries(!emailSummaries)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    emailSummaries ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      emailSummaries ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 3: After-Hours Alerts */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50/50">
                <div className="space-y-0.5 pr-4">
                  <span className="text-sm font-bold text-gray-900 block">
                    After-Hours Alerts
                  </span>
                  <p className="text-xs text-gray-500">
                    High-priority notification banner when calls occur after closing or during weekend hours.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={afterHoursAlerts}
                  onClick={() => setAfterHoursAlerts(!afterHoursAlerts)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    afterHoursAlerts ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      afterHoursAlerts ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSaveNotifications}
                disabled={notificationsSaving}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl min-h-[44px] transition-colors shadow-xs flex items-center gap-2"
              >
                {notificationsSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Notification Preferences</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CONFIGURATION DETAIL MODAL (Services / Emergency / Pricing / Warranty) */}
      {activeConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
              <div>
                <span className="text-xs font-bold text-purple-700 uppercase tracking-wide">
                  Receptionist Configuration
                </span>
                <h3 className="text-lg font-extrabold text-gray-950 mt-0.5">
                  {activeConfigModal === 'services' && 'Configure Offered Services'}
                  {activeConfigModal === 'emergency' && 'Emergency & Towing Policies'}
                  {activeConfigModal === 'pricing' && 'Pricing Estimates for Inquiries'}
                  {activeConfigModal === 'warranty' && 'Warranty & Guarantee Policy'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveConfigModal(null)}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body depending on config item */}
            {activeConfigModal === 'services' && (
              <div className="space-y-3">
                <p className="text-xs text-gray-600">
                  Select which services AutoIntel will confirm your shop handles:
                </p>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {services.map((svc, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-medium text-gray-900 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{svc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeConfigModal === 'emergency' && (
              <div className="space-y-4 text-xs">
                <p className="text-gray-600">
                  When a caller has an emergency breakdown or requires immediate towing:
                </p>
                <div className="space-y-2">
                  <label className="font-bold text-gray-700 block">
                    Emergency Transfer Number:
                  </label>
                  <input
                    type="text"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium text-gray-900"
                  />
                </div>
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-900">
                  Calls flagged as towing or highway emergencies will be transferred directly to this line after informing the driver.
                </div>
              </div>
            )}

            {activeConfigModal === 'pricing' && (
              <div className="space-y-3">
                <p className="text-xs text-gray-600">
                  Standard quotes your receptionist shares with callers asking for quick price estimates:
                </p>
                <div className="space-y-2">
                  {priceQuotes.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between text-xs font-medium"
                    >
                      <span className="text-gray-800">{p.service}</span>
                      <span className="font-bold text-purple-900">{p.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeConfigModal === 'warranty' && (
              <div className="space-y-3 text-xs">
                <p className="text-gray-600">
                  AutoIntel explains your warranty to build trust with first-time callers:
                </p>
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 font-medium leading-relaxed">
                  &ldquo;All repairs at Precision Auto Care are backed by our 24-Month / 24,000-Mile Nationwide Warranty on parts and labor.&rdquo;
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setActiveConfigModal(null);
                  setConfigFeedback('Receptionist rules updated.');
                  setTimeout(() => setConfigFeedback(null), 3000);
                }}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl min-h-[40px] transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
