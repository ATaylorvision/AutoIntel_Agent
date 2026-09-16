import { WeeklyHours, PriceRow, ReceptionistSetup, DayHours } from '../types/index.ts';

export const DEFAULT_HOURS: WeeklyHours = {
  monday: { open: true, openTime: '08:00', closeTime: '17:30' },
  tuesday: { open: true, openTime: '08:00', closeTime: '17:30' },
  wednesday: { open: true, openTime: '08:00', closeTime: '17:30' },
  thursday: { open: true, openTime: '08:00', closeTime: '17:30' },
  friday: { open: true, openTime: '08:00', closeTime: '17:30' },
  saturday: { open: false, openTime: '08:00', closeTime: '14:00' },
  sunday: { open: false, openTime: '09:00', closeTime: '13:00' },
};

export const STANDARD_SERVICES = [
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

export const DEFAULT_NEVER_DO = [
  "Diagnose what's wrong with a vehicle.",
  "Quote prices you haven't approved.",
  "Promise when a repair will be finished.",
  "Say a vehicle is safe to drive.",
];

export interface SetupScoreResult {
  score: number;
  requiredItems: { id: string; label: string; done: boolean; sectionKey: string }[];
  recommendedItems: { id: string; label: string; done: boolean; sectionKey: string }[];
  allRequiredDone: boolean;
}

export function calculateSetupScore(setup?: ReceptionistSetup | null): SetupScoreResult {
  if (!setup) {
    return {
      score: 0,
      requiredItems: [
        { id: 'address', label: 'Shop street address, city, state, and ZIP', done: false, sectionKey: 'shop_info' },
        { id: 'phone', label: 'Main shop phone number', done: false, sectionKey: 'shop_info' },
        { id: 'hours', label: 'Operating hours (at least 1 open day)', done: false, sectionKey: 'hours' },
        { id: 'services', label: 'Services offered (at least 1 selected)', done: false, sectionKey: 'services' },
        { id: 'emergency', label: 'Emergency or towing rule configured', done: false, sectionKey: 'calls_alerts' },
        { id: 'alertMobile', label: 'Mobile number for text summaries and alerts', done: false, sectionKey: 'calls_alerts' },
      ],
      recommendedItems: [
        { id: 'prices', label: 'Prices choice made (take message or share prices)', done: false, sectionKey: 'prices' },
        { id: 'policies', label: 'Shop policies (payment, warranties, drop-off)', done: false, sectionKey: 'policies_questions' },
        { id: 'faq', label: 'Common questions and answers', done: false, sectionKey: 'policies_questions' },
        { id: 'greeting', label: 'Phone greeting reviewed', done: false, sectionKey: 'calls_alerts' },
      ],
      allRequiredDone: false,
    };
  }

  const reqAddress = Boolean(setup.address && setup.city && setup.state && setup.zip);
  const reqPhone = Boolean(setup.mainPhone && setup.mainPhone.length >= 7);
  const reqHours = Boolean(
    setup.hours &&
      (Object.values(setup.hours) as DayHours[]).some(
        (h) => h && h.open && h.openTime && h.closeTime
      )
  );
  const reqServices = Boolean(setup.services && setup.services.length > 0);
  const reqEmergency = Boolean(
    setup.emergencyHandling &&
      (setup.emergencyHandling === 'message' ||
        (setup.emergencyHandling === 'transfer' && setup.emergencyPhone))
  );
  const reqAlertMobile = Boolean(setup.alertMobile && setup.alertMobile.length >= 7);

  const requiredItems = [
    { id: 'address', label: 'Shop street address, city, state, and ZIP', done: reqAddress, sectionKey: 'shop_info' },
    { id: 'phone', label: 'Main shop phone number', done: reqPhone, sectionKey: 'shop_info' },
    { id: 'hours', label: 'Operating hours (at least 1 open day)', done: reqHours, sectionKey: 'hours' },
    { id: 'services', label: 'Services offered (at least 1 selected)', done: reqServices, sectionKey: 'services' },
    { id: 'emergency', label: 'Emergency or towing rule configured', done: reqEmergency, sectionKey: 'calls_alerts' },
    { id: 'alertMobile', label: 'Mobile number for text summaries and alerts', done: reqAlertMobile, sectionKey: 'calls_alerts' },
  ];

  const recPrices = Boolean(
    setup.pricingChoice === 'no_quote' ||
      (setup.pricingChoice === 'share_prices' && setup.prices && setup.prices.length > 0)
  );
  const recPolicies = Boolean(setup.policies && setup.policies.trim().length > 0);
  const recFaq = Boolean(setup.faq && setup.faq.trim().length > 0);
  const recGreeting = Boolean(setup.greeting && setup.greeting.trim().length > 0);

  const recommendedItems = [
    { id: 'prices', label: 'Prices choice made (take message or share prices)', done: recPrices, sectionKey: 'prices' },
    { id: 'policies', label: 'Shop policies (payment, warranties, drop-off)', done: recPolicies, sectionKey: 'policies_questions' },
    { id: 'faq', label: 'Common questions and answers', done: recFaq, sectionKey: 'policies_questions' },
    { id: 'greeting', label: 'Phone greeting reviewed', done: recGreeting, sectionKey: 'calls_alerts' },
  ];

  const reqDoneCount = requiredItems.filter((i) => i.done).length;
  const recDoneCount = recommendedItems.filter((i) => i.done).length;

  const score = Math.round(
    (reqDoneCount / requiredItems.length) * 70 +
      (recDoneCount / recommendedItems.length) * 30
  );

  return {
    score,
    requiredItems,
    recommendedItems,
    allRequiredDone: reqDoneCount === requiredItems.length,
  };
}
