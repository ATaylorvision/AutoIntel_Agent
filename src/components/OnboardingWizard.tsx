import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check, Plus, Trash2, Copy, Save, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { ReceptionistSetup, WeeklyHours, PriceRow } from '../types/index.ts';

interface OnboardingWizardProps {
  initialStep?: number;
  onCompleteToScore: (setup: ReceptionistSetup) => void;
  onExit: () => void;
}

const DEFAULT_HOURS: WeeklyHours = {
  monday: { open: true, openTime: '08:00', closeTime: '17:30' },
  tuesday: { open: true, openTime: '08:00', closeTime: '17:30' },
  wednesday: { open: true, openTime: '08:00', closeTime: '17:30' },
  thursday: { open: true, openTime: '08:00', closeTime: '17:30' },
  friday: { open: true, openTime: '08:00', closeTime: '17:30' },
  saturday: { open: false, openTime: '08:00', closeTime: '14:00' },
  sunday: { open: false, openTime: '09:00', closeTime: '13:00' },
};

const STANDARD_SERVICES = [
  'Oil changes',
  'Brakes',
  'Tires',
  'Diagnostics and check engine light',
  'AC and heating',
  'Batteries',
  'Alignment',
  'Suspension',
  'Transmission',
  'Engine repair',
  'State inspections',
  'Scheduled maintenance',
  'Towing',
];

const DEFAULT_NEVER_DO = [
  "Diagnose what's wrong with a vehicle.",
  "Quote prices you haven't approved.",
  "Promise when a repair will be finished.",
  "Say a vehicle is safe to drive.",
];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  initialStep = 1,
  onCompleteToScore,
  onExit,
}) => {
  const { userRecord, shopRecord, refreshShop } = useAuth();
  const shopId = shopRecord?.id || userRecord?.shopId;

  const [step, setStep] = useState<number>(initialStep);
  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const existingSetup = shopRecord?.receptionistSetup;

  // Step 1: Your shop
  const [shopName, setShopName] = useState(existingSetup?.shopName || shopRecord?.shopName || '');
  const [address, setAddress] = useState(existingSetup?.address || '');
  const [city, setCity] = useState(existingSetup?.city || '');
  const [state, setState] = useState(existingSetup?.state || '');
  const [zip, setZip] = useState(existingSetup?.zip || '');
  const [mainPhone, setMainPhone] = useState(existingSetup?.mainPhone || shopRecord?.ownerMobile || '');
  const [website, setWebsite] = useState(existingSetup?.website || '');
  const [serviceArea, setServiceArea] = useState(existingSetup?.serviceArea || '');

  // Step 2: Hours
  const [hours, setHours] = useState<WeeklyHours>(existingSetup?.hours || DEFAULT_HOURS);

  // Step 3: Services
  const [services, setServices] = useState<string[]>(
    existingSetup?.services || ['Oil changes', 'Brakes', 'Diagnostics and check engine light', 'Batteries']
  );
  const [otherService, setOtherService] = useState(existingSetup?.otherService || '');

  // Step 4: Never do
  const [neverDo, setNeverDo] = useState<string[]>(existingSetup?.neverDo || DEFAULT_NEVER_DO);
  const [neverDoOther, setNeverDoOther] = useState(existingSetup?.neverDoOther || '');

  // Step 5: Prices
  const [pricingChoice, setPricingChoice] = useState<'no_quote' | 'share_prices'>(
    existingSetup?.pricingChoice || 'no_quote'
  );
  const [prices, setPrices] = useState<PriceRow[]>(
    existingSetup?.prices || [
      { id: '1', service: 'Standard Oil Change', price: '$49 - $69' },
      { id: '2', service: 'Brake Inspection', price: 'Free with repair or $35' },
    ]
  );

  // Step 6: Calls & Alerts
  const [emergencyHandling, setEmergencyHandling] = useState<'transfer' | 'message'>(
    existingSetup?.emergencyHandling || 'transfer'
  );
  const [emergencyPhone, setEmergencyPhone] = useState(
    existingSetup?.emergencyPhone || shopRecord?.ownerMobile || ''
  );
  const [alertMobile, setAlertMobile] = useState(
    existingSetup?.alertMobile || shopRecord?.ownerMobile || userRecord?.mobile || ''
  );
  const [alertEmail, setAlertEmail] = useState(
    existingSetup?.alertEmail || userRecord?.email || ''
  );
  const defaultGreeting = `Thanks for calling ${shopName || 'our shop'}, how can I help you?`;
  const [greeting, setGreeting] = useState(existingSetup?.greeting || defaultGreeting);

  // Step 7: Anything else
  const [policies, setPolicies] = useState(existingSetup?.policies || '');
  const [faq, setFaq] = useState(existingSetup?.faq || '');
  const [promotions, setPromotions] = useState(existingSetup?.promotions || '');
  const [specialInstructions, setSpecialInstructions] = useState(existingSetup?.specialInstructions || '');

  // Keep greeting synced to shopName if untouched
  useEffect(() => {
    if (!existingSetup?.greeting && shopName) {
      setGreeting(`Thanks for calling ${shopName}, how can I help you?`);
    }
  }, [shopName]);

  const compileSetupObject = (): ReceptionistSetup => {
    return {
      shopName: shopName.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      zip: zip.trim(),
      mainPhone: mainPhone.trim(),
      website: website.trim(),
      serviceArea: serviceArea.trim(),
      hours,
      services,
      otherService: otherService.trim(),
      neverDo,
      neverDoOther: neverDoOther.trim(),
      pricingChoice,
      prices,
      emergencyHandling,
      emergencyPhone: emergencyPhone.trim(),
      alertMobile: alertMobile.trim(),
      alertEmail: alertEmail.trim(),
      greeting: greeting.trim(),
      policies: policies.trim(),
      faq: faq.trim(),
      promotions: promotions.trim(),
      specialInstructions: specialInstructions.trim(),
      completedAt: existingSetup?.completedAt || null,
      updatedAt: new Date().toISOString(),
    };
  };

  // Save after every step so nothing is lost if they close the browser
  const saveCurrentStep = async (nextStepNumber?: number) => {
    if (!shopId) return;
    setSaving(true);
    setError(null);
    const setupData = compileSetupObject();

    try {
      const res = await fetch(`/api/shops/${shopId}/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receptionistSetup: setupData,
          isComplete: false,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save step to server.');
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
      await refreshShop();

      if (nextStepNumber !== undefined) {
        if (nextStepNumber > 7) {
          onCompleteToScore(setupData);
        } else {
          setStep(nextStepNumber);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Auto-save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleNext = () => {
    saveCurrentStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onExit();
    }
  };

  // Step 2 Helper: Copy Monday to weekdays
  const copyMondayToWeekdays = () => {
    const monday = hours.monday;
    setHours((prev) => ({
      ...prev,
      tuesday: { ...monday },
      wednesday: { ...monday },
      thursday: { ...monday },
      friday: { ...monday },
    }));
  };

  // Step 3 Helper: Toggle service checkbox
  const toggleService = (srv: string) => {
    setServices((prev) =>
      prev.includes(srv) ? prev.filter((s) => s !== srv) : [...prev, srv]
    );
  };

  // Step 4 Helper: Toggle never-do checkbox
  const toggleNeverDo = (item: string) => {
    setNeverDo((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  // Step 5 Helpers: Price rows
  const addPriceRow = () => {
    setPrices((prev) => [
      ...prev,
      { id: Date.now().toString(), service: '', price: '' },
    ]);
  };

  const updatePriceRow = (id: string, field: 'service' | 'price', val: string) => {
    setPrices((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: val } : row))
    );
  };

  const removePriceRow = (id: string) => {
    setPrices((prev) => prev.filter((row) => row.id !== id));
  };

  const totalSteps = 7;
  const progressPct = Math.round((step / totalSteps) * 100);

  const stepTitles = [
    'Your Shop',
    'Hours of Operation',
    'Services Offered',
    'What Your Receptionist Should Never Do',
    'Prices It Can Share',
    'Calls & Alerts',
    'Anything Else',
  ];

  const days: (keyof WeeklyHours)[] = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
      {/* Top Header / Progress */}
      <div className="space-y-3 mb-8">
        <div className="flex items-center justify-between text-xs text-gray-500 font-semibold">
          <button
            type="button"
            onClick={handleBack}
            className="hover:text-black py-2 min-h-[44px] flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{step === 1 ? 'Exit Setup' : 'Back'}</span>
          </button>

          <span className="text-gray-900 font-bold">
            Step {step} of {totalSteps}: {stepTitles[step - 1]}
          </span>

          <span className="text-purple-700 font-bold">{progressPct}%</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-[#d6bcfa] h-2.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPct}%` }}
          ></div>
        </div>

        {savedSuccess && (
          <div className="text-[11px] text-emerald-700 font-medium text-right flex items-center justify-end gap-1">
            <Check className="w-3 h-3 text-emerald-600" />
            <span>Saved progress</span>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* CARD CONTAINER */}
      <div className="bg-white border-2 border-black rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
        {/* STEP 1: YOUR SHOP */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-gray-950">Your shop</h2>
              <p className="text-xs text-gray-600">
                Basic details your receptionist uses when answering location questions.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Shop Name
                </label>
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full px-3.5 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:border-black min-h-[44px]"
                  placeholder="e.g. Miller Precision Auto Repair"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:bg-white focus:border-black min-h-[44px]"
                  placeholder="e.g. 104 Main Street"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:bg-white focus:border-black min-h-[44px]"
                    placeholder="e.g. Farmingdale"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3.5 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:bg-white focus:border-black min-h-[44px]"
                    placeholder="e.g. NY"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    required
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    className="w-full px-3.5 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:bg-white focus:border-black min-h-[44px]"
                    placeholder="e.g. 11735"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Main Shop Phone
                </label>
                <input
                  type="tel"
                  required
                  value={mainPhone}
                  onChange={(e) => setMainPhone(e.target.value)}
                  className="w-full px-3.5 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:bg-white focus:border-black min-h-[44px]"
                  placeholder="e.g. (555) 345-6789"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Website <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-3.5 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:bg-white focus:border-black min-h-[44px]"
                  placeholder="e.g. https://millerautorepair.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Service Area
                </label>
                <input
                  type="text"
                  value={serviceArea}
                  onChange={(e) => setServiceArea(e.target.value)}
                  className="w-full px-3.5 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:bg-white focus:border-black min-h-[44px]"
                  placeholder='e.g. Farmingdale and towns within 10 miles'
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Helps the receptionist let out-of-town callers know if you service their location.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: HOURS */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-2xl font-bold text-gray-950">Hours</h2>
                <p className="text-xs text-gray-600">
                  Set when your bays are open. Callers asking about hours will get accurate times.
                </p>
              </div>

              <button
                type="button"
                onClick={copyMondayToWeekdays}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-lg min-h-[44px] transition-colors self-start sm:self-auto"
              >
                <Copy className="w-3.5 h-3.5 text-purple-700" />
                <span>Copy Monday to all weekdays</span>
              </button>
            </div>

            <div className="space-y-3 pt-2">
              {days.map((day) => {
                const dayHour = hours[day];
                const dayLabel = day.charAt(0).toUpperCase() + day.slice(1);
                return (
                  <div
                    key={day}
                    className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      dayHour.open ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200 opacity-75'
                    }`}
                  >
                    <div className="flex items-center gap-3 w-32">
                      <button
                        type="button"
                        onClick={() =>
                          setHours((prev) => ({
                            ...prev,
                            [day]: { ...prev[day], open: !prev[day].open },
                          }))
                        }
                        className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors min-h-[44px] ${
                          dayHour.open ? 'bg-black' : 'bg-gray-300'
                        }`}
                        aria-label={`Toggle ${dayLabel}`}
                      >
                        <div
                          className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                            dayHour.open ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <span className="text-sm font-bold text-gray-900">{dayLabel}</span>
                    </div>

                    {dayHour.open ? (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-500 font-medium">Open:</span>
                        <input
                          type="time"
                          value={dayHour.openTime}
                          onChange={(e) =>
                            setHours((prev) => ({
                              ...prev,
                              [day]: { ...prev[day], openTime: e.target.value },
                            }))
                          }
                          className="px-2.5 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold min-h-[44px]"
                        />
                        <span className="text-gray-500 font-medium">Close:</span>
                        <input
                          type="time"
                          value={dayHour.closeTime}
                          onChange={(e) =>
                            setHours((prev) => ({
                              ...prev,
                              [day]: { ...prev[day], closeTime: e.target.value },
                            }))
                          }
                          className="px-2.5 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold min-h-[44px]"
                        />
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-gray-400 italic">
                        Closed all day
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: SERVICES */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-gray-950">Services</h2>
              <p className="text-xs text-gray-600">
                Check off all services your shop provides so the receptionist can confirm them for callers.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {STANDARD_SERVICES.map((srv) => {
                const isSelected = services.includes(srv);
                return (
                  <button
                    key={srv}
                    type="button"
                    onClick={() => toggleService(srv)}
                    className={`p-3.5 rounded-xl border text-left flex items-center justify-between text-xs font-bold min-h-[48px] transition-all ${
                      isSelected
                        ? 'bg-[#faf5ff] border-black text-gray-950'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <span>{srv}</span>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                        isSelected
                          ? 'bg-black text-white border-black'
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Other services */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Other specialty services <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                value={otherService}
                onChange={(e) => setOtherService(e.target.value)}
                className="w-full px-3.5 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:bg-white focus:border-black min-h-[44px]"
                placeholder="e.g. Classic car restorations, fleet diesel, EV charging diagnostics"
              />
            </div>
          </div>
        )}

        {/* STEP 4: WHAT YOUR RECEPTIONIST SHOULD NEVER DO */}
        {step === 4 && (
          <div className="space-y-5">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-gray-950">
                What your receptionist should never do
              </h2>
              <p className="text-xs text-gray-600">
                Guardrails to keep your shop protected. These are pre-checked for your safety.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {DEFAULT_NEVER_DO.map((ruleText) => {
                const isChecked = neverDo.includes(ruleText);
                return (
                  <button
                    key={ruleText}
                    type="button"
                    onClick={() => toggleNeverDo(ruleText)}
                    className={`w-full p-4 rounded-xl border text-left flex items-start justify-between gap-3 text-sm min-h-[48px] transition-all ${
                      isChecked
                        ? 'bg-[#faf5ff] border-black text-gray-950 font-bold'
                        : 'bg-white border-gray-200 text-gray-500'
                    }`}
                  >
                    <span>{ruleText}</span>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 mt-0.5 ${
                        isChecked
                          ? 'bg-black text-white border-black'
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Anything else it should never do?
              </label>
              <textarea
                rows={3}
                value={neverDoOther}
                onChange={(e) => setNeverDoOther(e.target.value)}
                className="w-full px-3.5 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:bg-white focus:border-black min-h-[44px]"
                placeholder="e.g. Never promise same-day transmission jobs or customer drop-offs after 6 PM."
              />
            </div>
          </div>
        )}

        {/* STEP 5: PRICES IT CAN SHARE */}
        {step === 5 && (
          <div className="space-y-5">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-gray-950">Prices it can share</h2>
              <p className="text-xs text-gray-600">
                Decide whether the receptionist should share standard maintenance rates or take messages.
              </p>
            </div>

            {/* Radio choices */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => setPricingChoice('no_quote')}
                className={`w-full p-4 rounded-xl border text-left flex items-start gap-3 min-h-[48px] transition-all ${
                  pricingChoice === 'no_quote'
                    ? 'bg-[#faf5ff] border-black shadow-sm'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                    pricingChoice === 'no_quote'
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300'
                  }`}
                >
                  {pricingChoice === 'no_quote' && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div>
                  <span className="text-sm font-bold text-gray-950 block">
                    Don't quote prices. Take a message instead.
                  </span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Recommended default. Prevents misunderstandings before seeing the vehicle.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPricingChoice('share_prices')}
                className={`w-full p-4 rounded-xl border text-left flex items-start gap-3 min-h-[48px] transition-all ${
                  pricingChoice === 'share_prices'
                    ? 'bg-[#faf5ff] border-black shadow-sm'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                    pricingChoice === 'share_prices'
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300'
                  }`}
                >
                  {pricingChoice === 'share_prices' && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div>
                  <span className="text-sm font-bold text-gray-950 block">
                    It can share these prices.
                  </span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Share known standard price ranges for routine maintenance items.
                  </p>
                </div>
              </button>
            </div>

            {/* Repeatable Price Rows */}
            {pricingChoice === 'share_prices' && (
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">Approved Prices or Ranges:</span>
                  <button
                    type="button"
                    onClick={addPriceRow}
                    className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 hover:text-purple-900 py-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Service Price</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {prices.map((row) => (
                    <div key={row.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={row.service}
                        onChange={(e) => updatePriceRow(row.id, 'service', e.target.value)}
                        placeholder="Service (e.g. Synthetic Oil Change)"
                        className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium min-h-[44px]"
                      />
                      <input
                        type="text"
                        value={row.price}
                        onChange={(e) => updatePriceRow(row.id, 'price', e.target.value)}
                        placeholder="Price or range (e.g. $79 - $99)"
                        className="w-36 px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium min-h-[44px]"
                      />
                      <button
                        type="button"
                        onClick={() => removePriceRow(row.id)}
                        className="p-2.5 text-gray-400 hover:text-red-600 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
                        aria-label="Remove price row"
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

        {/* STEP 6: CALLS AND ALERTS */}
        {step === 6 && (
          <div className="space-y-5">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-gray-950">Calls and alerts</h2>
              <p className="text-xs text-gray-600">
                Configure urgent call forwarding, your mobile text alerts, and greeting.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Emergency or Tow Calls
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setEmergencyHandling('transfer')}
                    className={`p-3 rounded-xl border text-left text-xs font-bold min-h-[44px] ${
                      emergencyHandling === 'transfer'
                        ? 'bg-[#faf5ff] border-black text-gray-950'
                        : 'bg-white border-gray-200 text-gray-600'
                    }`}
                  >
                    Transfer to this number
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmergencyHandling('message')}
                    className={`p-3 rounded-xl border text-left text-xs font-bold min-h-[44px] ${
                      emergencyHandling === 'message'
                        ? 'bg-[#faf5ff] border-black text-gray-950'
                        : 'bg-white border-gray-200 text-gray-600'
                    }`}
                  >
                    Take a message
                  </button>
                </div>

                {emergencyHandling === 'transfer' && (
                  <input
                    type="tel"
                    required
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="Mobile number for urgent transfers"
                    className="w-full px-3.5 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:bg-white focus:border-black min-h-[44px]"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Where should new call alerts go?
                </label>
                <div className="space-y-2">
                  <input
                    type="tel"
                    required
                    value={alertMobile}
                    onChange={(e) => setAlertMobile(e.target.value)}
                    placeholder="Mobile number for text summaries"
                    className="w-full px-3.5 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:bg-white focus:border-black min-h-[44px]"
                  />
                  <input
                    type="email"
                    required
                    value={alertEmail}
                    onChange={(e) => setAlertEmail(e.target.value)}
                    placeholder="Email address for summaries"
                    className="w-full px-3.5 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:bg-white focus:border-black min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Greeting: How should the receptionist answer?
                </label>
                <textarea
                  rows={2}
                  value={greeting}
                  onChange={(e) => setGreeting(e.target.value)}
                  className="w-full px-3.5 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:border-black min-h-[44px]"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: ANYTHING ELSE (ALL OPTIONAL) */}
        {step === 7 && (
          <div className="space-y-5">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-gray-950">Anything else (all optional)</h2>
              <p className="text-xs text-gray-600">
                Helpful details that make your receptionist sound like an experienced shop veteran.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Shop policies <span className="font-normal text-gray-400">(payment, warranties, loaner cars, drop-off)</span>
                </label>
                <textarea
                  rows={3}
                  value={policies}
                  onChange={(e) => setPolicies(e.target.value)}
                  className="w-full px-3.5 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:bg-white focus:border-black min-h-[44px]"
                  placeholder="e.g. 24-month / 24,000-mile warranty. Night drop box available by bay 3. We accept all major cards, no personal checks."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Common questions and answers
                </label>
                <textarea
                  rows={3}
                  value={faq}
                  onChange={(e) => setFaq(e.target.value)}
                  className="w-full px-3.5 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:bg-white focus:border-black min-h-[44px]"
                  placeholder="e.g. Q: Do you do European cars? A: Yes, we specialize in BMW and Audi diagnostics."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Current promotions
                </label>
                <textarea
                  rows={2}
                  value={promotions}
                  onChange={(e) => setPromotions(e.target.value)}
                  className="w-full px-3.5 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:bg-white focus:border-black min-h-[44px]"
                  placeholder="e.g. $25 off any brake pad and rotor replacement this month."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Special instructions
                </label>
                <textarea
                  rows={2}
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="w-full px-3.5 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:bg-white focus:border-black min-h-[44px]"
                  placeholder="e.g. Ask for Mike when calling back. Closed on major holiday Mondays."
                />
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM NAVIGATION BUTTONS */}
        <div className="flex items-center justify-between gap-3 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-2.5 text-xs font-semibold text-gray-600 hover:text-black border border-gray-200 rounded-xl min-h-[44px] flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{step === 1 ? 'Exit' : 'Back'}</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={saving}
            className="px-6 py-3 bg-black hover:bg-gray-800 text-white font-bold text-sm rounded-xl min-h-[44px] flex items-center gap-2 shadow-sm transition-all disabled:opacity-50 ml-auto"
          >
            <span>{saving ? 'Saving...' : step === totalSteps ? 'Save & Review Setup Score' : 'Save & Continue'}</span>
            <ArrowRight className="w-4 h-4 text-[#d6bcfa]" />
          </button>
        </div>
      </div>
    </div>
  );
};
