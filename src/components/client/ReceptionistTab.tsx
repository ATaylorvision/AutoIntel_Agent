import React, { useState } from 'react';
import { ShopRecord, ReceptionistSetup, WeeklyHours, PriceRow, DayHours } from '../../types/index.ts';
import { ReceptionistTester } from '../ReceptionistTester.tsx';
import {
  calculateSetupScore,
  DEFAULT_HOURS,
  STANDARD_SERVICES,
  DEFAULT_NEVER_DO,
} from '../../lib/receptionistConstants.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  Headphones,
  Sparkles,
  Phone,
  Clock,
  Wrench,
  ShieldAlert,
  DollarSign,
  Bell,
  FileText,
  Tag,
  CheckCircle2,
  AlertCircle,
  Edit3,
  X,
  Plus,
  Trash2,
  Copy,
  ChevronRight,
  ArrowRight,
  Send,
  Loader2,
} from 'lucide-react';

interface ReceptionistTabProps {
  shop: ShopRecord;
  onOpenTest: () => void;
  onOpenWizard?: (step?: number) => void;
}

type SectionKey =
  | 'shop_info'
  | 'hours'
  | 'services'
  | 'never_do'
  | 'prices'
  | 'calls_alerts'
  | 'policies_questions'
  | 'promotions_instructions';

const SECTION_LABELS: Record<SectionKey, string> = {
  shop_info: 'Shop info',
  hours: 'Hours',
  services: 'Services',
  never_do: 'Never do',
  prices: 'Prices',
  calls_alerts: 'Calls and alerts',
  policies_questions: 'Policies and questions',
  promotions_instructions: 'Promotions and special instructions',
};

const DAYS_ORDER: (keyof WeeklyHours)[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export const ReceptionistTab: React.FC<ReceptionistTabProps> = ({ shop, onOpenTest }) => {
  const { refreshShop } = useAuth();
  const [activeSubView, setActiveSubView] = useState<'overview' | 'tester'>('overview');
  const [editingSection, setEditingSection] = useState<SectionKey | null>(null);

  const [saving, setSaving] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const currentSetup: ReceptionistSetup = shop.receptionistSetup || {
    shopName: shop.shopName || '',
    address: '',
    city: '',
    state: '',
    zip: '',
    mainPhone: shop.ownerMobile || '',
    website: '',
    serviceArea: '',
    hours: DEFAULT_HOURS,
    services: ['Oil changes', 'Brakes', 'Diagnostics and check engine light', 'Batteries'],
    otherService: '',
    neverDo: DEFAULT_NEVER_DO,
    neverDoOther: '',
    pricingChoice: 'no_quote',
    prices: [
      { id: '1', service: 'Standard Oil Change', price: '$49 - $69' },
      { id: '2', service: 'Brake Inspection', price: 'Free with repair or $35' },
    ],
    emergencyHandling: 'transfer',
    emergencyPhone: shop.ownerMobile || '',
    alertMobile: shop.ownerMobile || '',
    alertEmail: '',
    greeting: `Thanks for calling ${shop.shopName || 'our shop'}, how can I help you?`,
    policies: '',
    faq: '',
    promotions: '',
    specialInstructions: '',
    completedAt: null,
    updatedAt: new Date().toISOString(),
  };

  // Draft state for modal editor
  const [draftSetup, setDraftSetup] = useState<ReceptionistSetup>(currentSetup);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const scoreResult = calculateSetupScore(currentSetup);
  const isLive = shop.status === 'live';

  const openEditor = (section: SectionKey) => {
    setDraftSetup({ ...currentSetup });
    setValidationErrors({});
    setStatusFeedback(null);
    setEditingSection(section);
  };

  const closeEditor = () => {
    if (saving) return;
    setEditingSection(null);
    setValidationErrors({});
  };

  const validateDraft = (section: SectionKey): boolean => {
    const errors: Record<string, string> = {};

    if (section === 'shop_info') {
      if (!draftSetup.shopName.trim()) {
        errors.shopName = 'Shop name is required.';
      }
      if (!draftSetup.address.trim()) {
        errors.address = 'Street address is required.';
      }
      if (!draftSetup.city.trim()) {
        errors.city = 'City is required.';
      }
      if (!draftSetup.state.trim()) {
        errors.state = 'State is required.';
      }
      if (!draftSetup.zip.trim()) {
        errors.zip = 'ZIP code is required.';
      } else if (!/^\d{5}(-\d{4})?$/.test(draftSetup.zip.trim())) {
        errors.zip = 'Please enter a valid 5-digit ZIP code.';
      }
      if (!draftSetup.mainPhone.trim()) {
        errors.mainPhone = 'Main shop phone is required.';
      } else if (draftSetup.mainPhone.replace(/\D/g, '').length < 10) {
        errors.mainPhone = 'Please enter a valid 10-digit phone number.';
      }
    }

    if (section === 'calls_alerts') {
      if (draftSetup.emergencyHandling === 'transfer') {
        if (!draftSetup.emergencyPhone?.trim()) {
          errors.emergencyPhone = 'Transfer number is required when call transfer is enabled.';
        } else if (draftSetup.emergencyPhone.replace(/\D/g, '').length < 10) {
          errors.emergencyPhone = 'Please enter a valid 10-digit emergency transfer phone.';
        }
      }
      if (!draftSetup.alertMobile?.trim()) {
        errors.alertMobile = 'Alert mobile number is required for SMS summaries.';
      } else if (draftSetup.alertMobile.replace(/\D/g, '').length < 10) {
        errors.alertMobile = 'Please enter a valid 10-digit mobile number for alerts.';
      }
      if (draftSetup.alertEmail?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draftSetup.alertEmail.trim())) {
        errors.alertEmail = 'Please enter a valid email address.';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveSection = async (section: SectionKey) => {
    if (!validateDraft(section)) return;

    setSaving(true);
    setStatusFeedback(null);

    try {
      const sectionTitle = SECTION_LABELS[section];
      const newScore = calculateSetupScore(draftSetup).score;

      // Extract specific old & new values for this section
      let sectionOldValues: any = null;
      let sectionNewValues: any = null;

      if (section === 'shop_info') {
        sectionOldValues = {
          shopName: currentSetup.shopName,
          address: currentSetup.address,
          city: currentSetup.city,
          state: currentSetup.state,
          zip: currentSetup.zip,
          mainPhone: currentSetup.mainPhone,
          website: currentSetup.website,
          serviceArea: currentSetup.serviceArea,
        };
        sectionNewValues = {
          shopName: draftSetup.shopName,
          address: draftSetup.address,
          city: draftSetup.city,
          state: draftSetup.state,
          zip: draftSetup.zip,
          mainPhone: draftSetup.mainPhone,
          website: draftSetup.website,
          serviceArea: draftSetup.serviceArea,
        };
      } else if (section === 'hours') {
        sectionOldValues = currentSetup.hours;
        sectionNewValues = draftSetup.hours;
      } else if (section === 'services') {
        sectionOldValues = { services: currentSetup.services, otherService: currentSetup.otherService };
        sectionNewValues = { services: draftSetup.services, otherService: draftSetup.otherService };
      } else if (section === 'never_do') {
        sectionOldValues = { neverDo: currentSetup.neverDo, neverDoOther: currentSetup.neverDoOther };
        sectionNewValues = { neverDo: draftSetup.neverDo, neverDoOther: draftSetup.neverDoOther };
      } else if (section === 'prices') {
        sectionOldValues = { pricingChoice: currentSetup.pricingChoice, prices: currentSetup.prices };
        sectionNewValues = { pricingChoice: draftSetup.pricingChoice, prices: draftSetup.prices };
      } else if (section === 'calls_alerts') {
        sectionOldValues = {
          emergencyHandling: currentSetup.emergencyHandling,
          emergencyPhone: currentSetup.emergencyPhone,
          alertMobile: currentSetup.alertMobile,
          alertEmail: currentSetup.alertEmail,
          greeting: currentSetup.greeting,
        };
        sectionNewValues = {
          emergencyHandling: draftSetup.emergencyHandling,
          emergencyPhone: draftSetup.emergencyPhone,
          alertMobile: draftSetup.alertMobile,
          alertEmail: draftSetup.alertEmail,
          greeting: draftSetup.greeting,
        };
      } else if (section === 'policies_questions') {
        sectionOldValues = { policies: currentSetup.policies, faq: currentSetup.faq };
        sectionNewValues = { policies: draftSetup.policies, faq: draftSetup.faq };
      } else if (section === 'promotions_instructions') {
        sectionOldValues = { promotions: currentSetup.promotions, specialInstructions: currentSetup.specialInstructions };
        sectionNewValues = { promotions: draftSetup.promotions, specialInstructions: draftSetup.specialInstructions };
      }

      const res = await fetch(`/api/shops/${shop.id}/receptionist-settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: sectionTitle,
          oldValues: sectionOldValues,
          newValues: sectionNewValues,
          updatedSetup: draftSetup,
          setupScore: newScore,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save changes. Please try again.');
      }

      await refreshShop();
      setEditingSection(null);

      const message = isLive
        ? "Saved. We'll update your receptionist and text you when it's done."
        : 'Saved successfully.';

      setStatusFeedback({
        type: 'success',
        message,
      });

      // Auto clear feedback banner after 8 seconds
      setTimeout(() => {
        setStatusFeedback(null);
      }, 8000);
    } catch (err: any) {
      console.error('Error saving receptionist settings:', err);
      setStatusFeedback({
        type: 'error',
        message: err.message || 'Unable to save settings. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  // Helper for toggle hours
  const handleToggleDay = (day: keyof WeeklyHours) => {
    setDraftSetup((prev) => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: {
          ...prev.hours[day],
          open: !prev.hours[day].open,
        },
      },
    }));
  };

  const handleTimeChange = (
    day: keyof WeeklyHours,
    field: 'openTime' | 'closeTime',
    value: string
  ) => {
    setDraftSetup((prev) => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: {
          ...prev.hours[day],
          [field]: value,
        },
      },
    }));
  };

  const copyMondayToWeekdays = () => {
    const monday = draftSetup.hours.monday;
    setDraftSetup((prev) => ({
      ...prev,
      hours: {
        ...prev.hours,
        tuesday: { ...monday },
        wednesday: { ...monday },
        thursday: { ...monday },
        friday: { ...monday },
      },
    }));
  };

  // Helpers for Services
  const handleToggleService = (serviceName: string) => {
    setDraftSetup((prev) => {
      const exists = prev.services.includes(serviceName);
      return {
        ...prev,
        services: exists
          ? prev.services.filter((s) => s !== serviceName)
          : [...prev.services, serviceName],
      };
    });
  };

  // Helpers for Never Do
  const handleToggleNeverDo = (rule: string) => {
    setDraftSetup((prev) => {
      const exists = prev.neverDo.includes(rule);
      return {
        ...prev,
        neverDo: exists
          ? prev.neverDo.filter((r) => r !== rule)
          : [...prev.neverDo, rule],
      };
    });
  };

  // Helpers for Prices
  const handlePriceRowChange = (id: string, field: 'service' | 'price', value: string) => {
    setDraftSetup((prev) => ({
      ...prev,
      prices: prev.prices.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    }));
  };

  const addPriceRow = () => {
    setDraftSetup((prev) => ({
      ...prev,
      prices: [
        ...prev.prices,
        { id: String(Date.now()), service: '', price: '' },
      ],
    }));
  };

  const removePriceRow = (id: string) => {
    setDraftSetup((prev) => ({
      ...prev,
      prices: prev.prices.filter((p) => p.id !== id),
    }));
  };

  if (activeSubView === 'tester') {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setActiveSubView('overview')}
          className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1.5 min-h-[44px]"
        >
          &larr; Back to Receptionist Settings
        </button>
        <ReceptionistTester />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. SETUP SCORE CARD AT THE TOP */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-black text-[#d6bcfa] flex items-center justify-center font-black text-lg shrink-0 shadow-sm">
              {scoreResult.score}%
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-gray-950">Receptionist Setup Score</h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                    scoreResult.score >= 90
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : scoreResult.score >= 70
                      ? 'bg-purple-50 text-purple-800 border-purple-200'
                      : 'bg-amber-50 text-amber-900 border-amber-300'
                  }`}
                >
                  {scoreResult.score >= 90
                    ? 'Excellent Configuration'
                    : scoreResult.score >= 70
                    ? 'Strong Setup'
                    : 'Needs Details'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                The more complete your shop details are, the more accurately your AI receptionist answers caller questions.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveSubView('tester')}
            className="px-4 py-2.5 bg-[#d6bcfa] hover:bg-[#c49efa] text-gray-950 font-bold text-xs rounded-xl min-h-[44px] flex items-center justify-center gap-2 shadow-sm transition-all self-start sm:self-auto"
          >
            <Sparkles className="w-4 h-4 text-purple-950" />
            <span>Test My Receptionist</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                scoreResult.score >= 90
                  ? 'bg-emerald-500'
                  : scoreResult.score >= 70
                  ? 'bg-purple-600'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${Math.max(scoreResult.score, 6)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-gray-400 font-medium">
            <span>Essential Info ({scoreResult.requiredItems.filter((i) => i.done).length}/6 completed)</span>
            <span>Recommended Polish ({scoreResult.recommendedItems.filter((i) => i.done).length}/4 completed)</span>
          </div>
        </div>

        {/* Checklist of missing items that can be tapped to jump to edit */}
        <div className="pt-2 flex flex-wrap gap-2">
          {scoreResult.requiredItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => openEditor(item.sectionKey as SectionKey)}
              className={`text-left text-xs px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-colors ${
                item.done
                  ? 'bg-gray-50 text-gray-600 border-gray-200'
                  : 'bg-amber-50/80 text-amber-900 border-amber-200 font-medium hover:bg-amber-100'
              }`}
            >
              <CheckCircle2
                className={`w-3.5 h-3.5 shrink-0 ${
                  item.done ? 'text-emerald-600' : 'text-amber-500'
                }`}
              />
              <span>{item.label}</span>
              {!item.done && <ChevronRight className="w-3 h-3 text-amber-700" />}
            </button>
          ))}
          {scoreResult.recommendedItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => openEditor(item.sectionKey as SectionKey)}
              className={`text-left text-xs px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-colors ${
                item.done
                  ? 'bg-gray-50 text-gray-600 border-gray-200'
                  : 'bg-purple-50 text-purple-900 border-purple-200 font-medium hover:bg-purple-100'
              }`}
            >
              <CheckCircle2
                className={`w-3.5 h-3.5 shrink-0 ${
                  item.done ? 'text-emerald-600' : 'text-purple-400'
                }`}
              />
              <span>{item.label}</span>
              {!item.done && <ChevronRight className="w-3 h-3 text-purple-700" />}
            </button>
          ))}
        </div>
      </div>

      {/* Global Status Feedback Banner */}
      {statusFeedback && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-start gap-3 shadow-sm ${
            statusFeedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-rose-50 border-rose-300 text-rose-950'
          }`}
        >
          {statusFeedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className="font-bold text-sm">
              {statusFeedback.type === 'success' ? 'Settings Saved' : 'Unable to Save'}
            </p>
            <p className="mt-0.5 font-medium leading-relaxed">{statusFeedback.message}</p>
          </div>
          <button
            type="button"
            onClick={() => setStatusFeedback(null)}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. "TEST MY AI RECEPTIONIST" CARD */}
      <div className="bg-gradient-to-r from-gray-950 to-gray-900 text-white rounded-3xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-5 border border-gray-800">
        <div className="space-y-1 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-purple-900/60 border border-purple-700 text-[#d6bcfa] text-[11px] font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Verification Suite</span>
          </div>
          <h3 className="text-lg font-black tracking-tight">Test My AI Receptionist</h3>
          <p className="text-xs text-gray-300 leading-relaxed">
            Simulate realistic caller scenarios like emergency brake noise, after-hours appointment booking, and diagnostic quotes before answering customer calls.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveSubView('tester')}
          className="px-5 py-3 bg-[#d6bcfa] hover:bg-[#c49efa] text-gray-950 font-extrabold text-xs rounded-xl min-h-[44px] flex items-center justify-center gap-2 shadow-sm transition-all shrink-0"
        >
          <Headphones className="w-4 h-4 text-purple-950" />
          <span>Launch Receptionist Tester</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 3. EDITABLE SECTIONS REUSING WIZARD SCREENS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
            Receptionist Instructions & Protocols
          </h3>
          <span className="text-xs text-gray-400">
            {isLive ? 'Live changes trigger operations update & SMS notice' : 'Draft settings save immediately'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* SECTION 1: Shop info */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-gray-950 text-sm">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span>1. Shop Info</span>
                </div>
                <button
                  type="button"
                  onClick={() => openEditor('shop_info')}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors min-h-[36px]"
                >
                  <Edit3 className="w-3.5 h-3.5 text-gray-600" />
                  <span>Edit</span>
                </button>
              </div>

              <div className="text-xs space-y-1 text-gray-600">
                <p className="font-bold text-gray-900 text-sm">{currentSetup.shopName || shop.shopName}</p>
                <p>{currentSetup.address ? `${currentSetup.address}, ${currentSetup.city}, ${currentSetup.state} ${currentSetup.zip}` : 'No address specified'}</p>
                <p className="text-gray-500">Main Phone: <span className="font-semibold text-gray-800">{currentSetup.mainPhone || shop.ownerMobile}</span></p>
                {currentSetup.website && <p className="text-gray-500">Website: <span className="font-medium text-gray-800">{currentSetup.website}</span></p>}
                {currentSetup.serviceArea && <p className="text-gray-500">Area: <span className="font-medium text-gray-800">{currentSetup.serviceArea}</span></p>}
              </div>
            </div>
          </div>

          {/* SECTION 2: Hours */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-gray-950 text-sm">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span>2. Hours</span>
                </div>
                <button
                  type="button"
                  onClick={() => openEditor('hours')}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors min-h-[36px]"
                >
                  <Edit3 className="w-3.5 h-3.5 text-gray-600" />
                  <span>Edit</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-gray-600">
                {DAYS_ORDER.slice(0, 6).map((d) => {
                  const dayCfg = currentSetup.hours?.[d];
                  return (
                    <div key={d} className="flex justify-between py-0.5 border-b border-gray-50">
                      <span className="capitalize text-gray-400">{d.slice(0, 3)}:</span>
                      <span className="font-semibold text-gray-800">
                        {dayCfg?.open ? `${dayCfg.openTime} - ${dayCfg.closeTime}` : 'Closed'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION 3: Services */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-gray-950 text-sm">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <span>3. Services ({currentSetup.services?.length || 0})</span>
                </div>
                <button
                  type="button"
                  onClick={() => openEditor('services')}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors min-h-[36px]"
                >
                  <Edit3 className="w-3.5 h-3.5 text-gray-600" />
                  <span>Edit</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {currentSetup.services && currentSetup.services.length > 0 ? (
                  currentSetup.services.slice(0, 6).map((svc, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-gray-100 border border-gray-200 rounded-lg text-[11px] font-medium text-gray-800"
                    >
                      {svc}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-400">No services selected</span>
                )}
                {currentSetup.services && currentSetup.services.length > 6 && (
                  <span className="px-2 py-1 bg-purple-50 border border-purple-200 rounded-lg text-[11px] font-bold text-purple-700">
                    +{currentSetup.services.length - 6} more
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 4: Never do */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-gray-950 text-sm">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <span>4. Never Do ({currentSetup.neverDo?.length || 0} guardrails)</span>
                </div>
                <button
                  type="button"
                  onClick={() => openEditor('never_do')}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors min-h-[36px]"
                >
                  <Edit3 className="w-3.5 h-3.5 text-gray-600" />
                  <span>Edit</span>
                </button>
              </div>

              <ul className="text-xs space-y-1 text-gray-600">
                {currentSetup.neverDo?.slice(0, 3).map((r, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-rose-500 font-bold">•</span>
                    <span className="line-clamp-1">{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* SECTION 5: Prices */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-gray-950 text-sm">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <span>5. Prices</span>
                </div>
                <button
                  type="button"
                  onClick={() => openEditor('prices')}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors min-h-[36px]"
                >
                  <Edit3 className="w-3.5 h-3.5 text-gray-600" />
                  <span>Edit</span>
                </button>
              </div>

              <div className="text-xs space-y-1.5 text-gray-600">
                <p className="font-semibold text-gray-900">
                  {currentSetup.pricingChoice === 'no_quote'
                    ? 'Take message for all pricing questions'
                    : `Shares standard prices (${currentSetup.prices?.length || 0} configured)`}
                </p>
                {currentSetup.pricingChoice === 'share_prices' && currentSetup.prices?.length > 0 && (
                  <div className="space-y-1 pt-1">
                    {currentSetup.prices.slice(0, 2).map((p) => (
                      <div key={p.id} className="flex justify-between border-b border-gray-50 pb-0.5">
                        <span className="truncate max-w-[180px]">{p.service}</span>
                        <span className="font-bold text-gray-800">{p.price}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 6: Calls and alerts */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-gray-950 text-sm">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                    <Bell className="w-4 h-4" />
                  </div>
                  <span>6. Calls & Alerts</span>
                </div>
                <button
                  type="button"
                  onClick={() => openEditor('calls_alerts')}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors min-h-[36px]"
                >
                  <Edit3 className="w-3.5 h-3.5 text-gray-600" />
                  <span>Edit</span>
                </button>
              </div>

              <div className="text-xs space-y-1 text-gray-600">
                <p>
                  Emergency calls:{' '}
                  <span className="font-semibold text-gray-900 capitalize">
                    {currentSetup.emergencyHandling === 'transfer' ? `Transfer to ${currentSetup.emergencyPhone}` : 'Take urgent message'}
                  </span>
                </p>
                <p>SMS alerts to: <span className="font-semibold text-gray-900">{currentSetup.alertMobile || 'Not set'}</span></p>
                <p className="line-clamp-1 italic text-gray-500 mt-1">"{currentSetup.greeting}"</p>
              </div>
            </div>
          </div>

          {/* SECTION 7: Policies and questions */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-gray-950 text-sm">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span>7. Policies & Questions</span>
                </div>
                <button
                  type="button"
                  onClick={() => openEditor('policies_questions')}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors min-h-[36px]"
                >
                  <Edit3 className="w-3.5 h-3.5 text-gray-600" />
                  <span>Edit</span>
                </button>
              </div>

              <div className="text-xs space-y-1 text-gray-600">
                <p className="line-clamp-2">
                  <span className="font-semibold text-gray-900">Policies: </span>
                  {currentSetup.policies || 'None specified'}
                </p>
                <p className="line-clamp-2">
                  <span className="font-semibold text-gray-900">FAQs: </span>
                  {currentSetup.faq || 'None specified'}
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 8: Promotions and special instructions */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-gray-950 text-sm">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                    <Tag className="w-4 h-4" />
                  </div>
                  <span>8. Promotions & Instructions</span>
                </div>
                <button
                  type="button"
                  onClick={() => openEditor('promotions_instructions')}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors min-h-[36px]"
                >
                  <Edit3 className="w-3.5 h-3.5 text-gray-600" />
                  <span>Edit</span>
                </button>
              </div>

              <div className="text-xs space-y-1 text-gray-600">
                <p className="line-clamp-2">
                  <span className="font-semibold text-gray-900">Promos: </span>
                  {currentSetup.promotions || 'No active coupons'}
                </p>
                <p className="line-clamp-2">
                  <span className="font-semibold text-gray-900">Instructions: </span>
                  {currentSetup.specialInstructions || 'Standard operating voice'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL EDITOR REUSING EXACT WIZARD SCREEN INPUTS */}
      {editingSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-black text-[#d6bcfa] flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-gray-950 text-base">
                    Edit {SECTION_LABELS[editingSection]}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    {isLive
                      ? 'Saving creates an update entry and notifies our operations team.'
                      : 'Changes apply immediately to your setup.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeEditor}
                disabled={saving}
                className="w-8 h-8 rounded-xl hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* EDIT: SHOP INFO */}
              {editingSection === 'shop_info' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Shop Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={draftSetup.shopName}
                      onChange={(e) => setDraftSetup({ ...draftSetup, shopName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm min-h-[44px]"
                    />
                    {validationErrors.shopName && (
                      <p className="text-xs text-rose-600 mt-1">{validationErrors.shopName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Street Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={draftSetup.address}
                      onChange={(e) => setDraftSetup({ ...draftSetup, address: e.target.value })}
                      placeholder="e.g. 104 Main Street"
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm min-h-[44px]"
                    />
                    {validationErrors.address && (
                      <p className="text-xs text-rose-600 mt-1">{validationErrors.address}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                      <label className="block text-xs font-bold text-gray-700 mb-1">City *</label>
                      <input
                        type="text"
                        value={draftSetup.city}
                        onChange={(e) => setDraftSetup({ ...draftSetup, city: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm min-h-[44px]"
                      />
                      {validationErrors.city && (
                        <p className="text-xs text-rose-600 mt-1">{validationErrors.city}</p>
                      )}
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-bold text-gray-700 mb-1">State *</label>
                      <input
                        type="text"
                        value={draftSetup.state}
                        onChange={(e) => setDraftSetup({ ...draftSetup, state: e.target.value })}
                        maxLength={2}
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm min-h-[44px] uppercase"
                      />
                      {validationErrors.state && (
                        <p className="text-xs text-rose-600 mt-1">{validationErrors.state}</p>
                      )}
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-bold text-gray-700 mb-1">ZIP *</label>
                      <input
                        type="text"
                        value={draftSetup.zip}
                        onChange={(e) => setDraftSetup({ ...draftSetup, zip: e.target.value })}
                        maxLength={10}
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm min-h-[44px]"
                      />
                      {validationErrors.zip && (
                        <p className="text-xs text-rose-600 mt-1">{validationErrors.zip}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Main Shop Phone <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={draftSetup.mainPhone}
                      onChange={(e) => setDraftSetup({ ...draftSetup, mainPhone: e.target.value })}
                      placeholder="e.g. 516-555-0199"
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm min-h-[44px]"
                    />
                    {validationErrors.mainPhone && (
                      <p className="text-xs text-rose-600 mt-1">{validationErrors.mainPhone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Website (optional)</label>
                    <input
                      type="url"
                      value={draftSetup.website || ''}
                      onChange={(e) => setDraftSetup({ ...draftSetup, website: e.target.value })}
                      placeholder="https://yourshop.com"
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Service Area or Towns (optional)</label>
                    <input
                      type="text"
                      value={draftSetup.serviceArea || ''}
                      onChange={(e) => setDraftSetup({ ...draftSetup, serviceArea: e.target.value })}
                      placeholder="e.g. Farmingdale, Bethpage, Plainview"
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm min-h-[44px]"
                    />
                  </div>
                </div>
              )}

              {/* EDIT: HOURS */}
              {editingSection === 'hours' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">Set opening and closing hours for each day.</p>
                    <button
                      type="button"
                      onClick={copyMondayToWeekdays}
                      className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 min-h-[36px]"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Monday to Weekdays</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {DAYS_ORDER.map((day) => {
                      const dayHours = draftSetup.hours?.[day] || { open: false, openTime: '08:00', closeTime: '17:30' };
                      return (
                        <div
                          key={day}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-xl bg-white"
                        >
                          <div className="flex items-center gap-3 w-32">
                            <input
                              type="checkbox"
                              id={`check-${day}`}
                              checked={dayHours.open}
                              onChange={() => handleToggleDay(day)}
                              className="w-4 h-4 text-purple-700 rounded border-gray-300"
                            />
                            <label htmlFor={`check-${day}`} className="capitalize text-xs font-bold text-gray-950 cursor-pointer">
                              {day}
                            </label>
                          </div>

                          {dayHours.open ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="time"
                                value={dayHours.openTime}
                                onChange={(e) => handleTimeChange(day, 'openTime', e.target.value)}
                                className="px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg text-xs"
                              />
                              <span className="text-xs text-gray-400">to</span>
                              <input
                                type="time"
                                value={dayHours.closeTime}
                                onChange={(e) => handleTimeChange(day, 'closeTime', e.target.value)}
                                className="px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg text-xs"
                              />
                            </div>
                          ) : (
                            <span className="text-xs font-medium text-gray-400">Closed</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* EDIT: SERVICES */}
              {editingSection === 'services' && (
                <div className="space-y-4">
                  <p className="text-xs text-gray-500">
                    Select the repairs and services your shop performs. Your receptionist will confirm these when callers ask.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {STANDARD_SERVICES.map((svc) => {
                      const selected = draftSetup.services?.includes(svc);
                      return (
                        <button
                          key={svc}
                          type="button"
                          onClick={() => handleToggleService(svc)}
                          className={`p-3 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                            selected
                              ? 'bg-[#faf5ff] border-purple-400 text-purple-950 font-bold shadow-xs'
                              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span>{svc}</span>
                          {selected ? (
                            <CheckCircle2 className="w-4 h-4 text-purple-700 shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded border border-gray-300 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Other Custom Services
                    </label>
                    <input
                      type="text"
                      value={draftSetup.otherService || ''}
                      onChange={(e) => setDraftSetup({ ...draftSetup, otherService: e.target.value })}
                      placeholder="e.g. Classic car restorations, fleet diesel, EV charging diagnostics"
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm min-h-[44px]"
                    />
                  </div>
                </div>
              )}

              {/* EDIT: NEVER DO */}
              {editingSection === 'never_do' && (
                <div className="space-y-4">
                  <p className="text-xs text-gray-500">
                    Guardrails to protect your shop. Your receptionist will refuse to give unauthorized promises or advice.
                  </p>

                  <div className="space-y-2">
                    {DEFAULT_NEVER_DO.map((rule) => {
                      const active = draftSetup.neverDo?.includes(rule);
                      return (
                        <button
                          key={rule}
                          type="button"
                          onClick={() => handleToggleNeverDo(rule)}
                          className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                            active
                              ? 'bg-rose-50 border-rose-300 text-rose-950 font-bold shadow-xs'
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <span>Never {rule.toLowerCase()}</span>
                          {active ? (
                            <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded border border-gray-300 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Additional Prohibitions or Boundaries
                    </label>
                    <textarea
                      rows={3}
                      value={draftSetup.neverDoOther || ''}
                      onChange={(e) => setDraftSetup({ ...draftSetup, neverDoOther: e.target.value })}
                      placeholder="e.g. Never promise same-day transmission jobs or customer drop-offs after 6 PM."
                      className="w-full p-3 bg-white border border-gray-300 rounded-xl text-sm"
                    />
                  </div>
                </div>
              )}

              {/* EDIT: PRICES */}
              {editingSection === 'prices' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3.5 border rounded-2xl cursor-pointer transition-all bg-white border-gray-200">
                      <input
                        type="radio"
                        name="pricingChoice"
                        checked={draftSetup.pricingChoice === 'no_quote'}
                        onChange={() => setDraftSetup({ ...draftSetup, pricingChoice: 'no_quote' })}
                        className="w-4 h-4 text-purple-700"
                      />
                      <div>
                        <span className="text-xs font-bold text-gray-950 block">
                          Never quote prices over the phone
                        </span>
                        <span className="text-[11px] text-gray-500 block">
                          Takes vehicle details and notes that an inspection or service advisor callback is required.
                        </span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3.5 border rounded-2xl cursor-pointer transition-all bg-white border-gray-200">
                      <input
                        type="radio"
                        name="pricingChoice"
                        checked={draftSetup.pricingChoice === 'share_prices'}
                        onChange={() => setDraftSetup({ ...draftSetup, pricingChoice: 'share_prices' })}
                        className="w-4 h-4 text-purple-700"
                      />
                      <div>
                        <span className="text-xs font-bold text-gray-950 block">
                          Share approved starting prices or standard maintenance ranges
                        </span>
                        <span className="text-[11px] text-gray-500 block">
                          Only shares exact prices for the items you list below.
                        </span>
                      </div>
                    </label>
                  </div>

                  {draftSetup.pricingChoice === 'share_prices' && (
                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-gray-700">Approved Price List</label>
                        <button
                          type="button"
                          onClick={addPriceRow}
                          className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 min-h-[36px]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Price Item</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        {draftSetup.prices?.map((item) => (
                          <div key={item.id} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={item.service}
                              onChange={(e) => handlePriceRowChange(item.id, 'service', e.target.value)}
                              placeholder="Service name (e.g. Synthetic Oil Change)"
                              className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs min-h-[44px]"
                            />
                            <input
                              type="text"
                              value={item.price}
                              onChange={(e) => handlePriceRowChange(item.id, 'price', e.target.value)}
                              placeholder="Price or range ($79 - $99)"
                              className="w-36 px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs min-h-[44px]"
                            />
                            <button
                              type="button"
                              onClick={() => removePriceRow(item.id)}
                              className="w-8 h-8 rounded-lg hover:bg-rose-50 text-rose-600 flex items-center justify-center shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* EDIT: CALLS & ALERTS */}
              {editingSection === 'calls_alerts' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Emergency / Towing Calls Protocol
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDraftSetup({ ...draftSetup, emergencyHandling: 'transfer' })}
                        className={`p-3 rounded-xl border text-left text-xs transition-all ${
                          draftSetup.emergencyHandling === 'transfer'
                            ? 'bg-[#faf5ff] border-purple-400 font-bold text-purple-950'
                            : 'bg-white border-gray-200 text-gray-600'
                        }`}
                      >
                        Transfer Call Directly
                      </button>
                      <button
                        type="button"
                        onClick={() => setDraftSetup({ ...draftSetup, emergencyHandling: 'message' })}
                        className={`p-3 rounded-xl border text-left text-xs transition-all ${
                          draftSetup.emergencyHandling === 'message'
                            ? 'bg-[#faf5ff] border-purple-400 font-bold text-purple-950'
                            : 'bg-white border-gray-200 text-gray-600'
                        }`}
                      >
                        Take Urgent Message
                      </button>
                    </div>
                  </div>

                  {draftSetup.emergencyHandling === 'transfer' && (
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Emergency Transfer Mobile Phone *
                      </label>
                      <input
                        type="tel"
                        value={draftSetup.emergencyPhone || ''}
                        onChange={(e) => setDraftSetup({ ...draftSetup, emergencyPhone: e.target.value })}
                        placeholder="e.g. 516-555-8844"
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm min-h-[44px]"
                      />
                      {validationErrors.emergencyPhone && (
                        <p className="text-xs text-rose-600 mt-1">{validationErrors.emergencyPhone}</p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Mobile for Text Summaries & Alerts *
                    </label>
                    <input
                      type="tel"
                      value={draftSetup.alertMobile || ''}
                      onChange={(e) => setDraftSetup({ ...draftSetup, alertMobile: e.target.value })}
                      placeholder="e.g. 516-555-8844"
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm min-h-[44px]"
                    />
                    {validationErrors.alertMobile && (
                      <p className="text-xs text-rose-600 mt-1">{validationErrors.alertMobile}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Email for Call Summaries (optional)
                    </label>
                    <input
                      type="email"
                      value={draftSetup.alertEmail || ''}
                      onChange={(e) => setDraftSetup({ ...draftSetup, alertEmail: e.target.value })}
                      placeholder="owner@yourshop.com"
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm min-h-[44px]"
                    />
                    {validationErrors.alertEmail && (
                      <p className="text-xs text-rose-600 mt-1">{validationErrors.alertEmail}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      AI Receptionist Greeting Line
                    </label>
                    <input
                      type="text"
                      value={draftSetup.greeting || ''}
                      onChange={(e) => setDraftSetup({ ...draftSetup, greeting: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm min-h-[44px]"
                    />
                  </div>
                </div>
              )}

              {/* EDIT: POLICIES & QUESTIONS */}
              {editingSection === 'policies_questions' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Shop Policies (Warranties, Payment methods, Loaners, Towing partner)
                    </label>
                    <textarea
                      rows={3}
                      value={draftSetup.policies || ''}
                      onChange={(e) => setDraftSetup({ ...draftSetup, policies: e.target.value })}
                      placeholder="e.g. 24-month / 24,000-mile warranty on all repairs. Night drop box available. We accept all major cards, no personal checks."
                      className="w-full p-3 bg-white border border-gray-300 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Common Caller Questions & Answers (FAQs)
                    </label>
                    <textarea
                      rows={4}
                      value={draftSetup.faq || ''}
                      onChange={(e) => setDraftSetup({ ...draftSetup, faq: e.target.value })}
                      placeholder="e.g. Q: Do you work on European cars? A: Yes, we service BMW, Audi, VW, and Mercedes."
                      className="w-full p-3 bg-white border border-gray-300 rounded-xl text-sm"
                    />
                  </div>
                </div>
              )}

              {/* EDIT: PROMOTIONS & SPECIAL INSTRUCTIONS */}
              {editingSection === 'promotions_instructions' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Active Promotions & Specials
                    </label>
                    <textarea
                      rows={3}
                      value={draftSetup.promotions || ''}
                      onChange={(e) => setDraftSetup({ ...draftSetup, promotions: e.target.value })}
                      placeholder="e.g. $20 off full synthetic oil change this month."
                      className="w-full p-3 bg-white border border-gray-300 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Special Tone & Reception Instructions
                    </label>
                    <textarea
                      rows={3}
                      value={draftSetup.specialInstructions || ''}
                      onChange={(e) => setDraftSetup({ ...draftSetup, specialInstructions: e.target.value })}
                      placeholder="e.g. Speak warmly, mention that Mike is the head technician, and let customers know appointments are recommended for brake jobs."
                      className="w-full p-3 bg-white border border-gray-300 rounded-xl text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-100 flex items-center justify-end gap-2.5 bg-gray-50/50">
              <button
                type="button"
                onClick={closeEditor}
                disabled={saving}
                className="px-4 py-2.5 border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-xl min-h-[44px] transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleSaveSection(editingSection)}
                disabled={saving}
                className="px-5 py-2.5 bg-black hover:bg-gray-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl min-h-[44px] flex items-center gap-2 shadow-sm transition-all"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#d6bcfa]" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#d6bcfa]" />
                    <span>Save {SECTION_LABELS[editingSection]}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
