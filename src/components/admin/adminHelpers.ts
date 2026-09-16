import { WeeklyHours, DayHours, PriceRow, ReceptionistSetup } from '../../types/index.ts';

/**
 * Formats receptionist setup into a clean, labeled plain-text block in the exact order:
 * 1. shop info
 * 2. service area
 * 3. hours
 * 4. services
 * 5. never-do rules
 * 6. pricing rules
 * 7. emergency and tow handling
 * 8. greeting
 * 9. policies
 * 10. common questions
 * 11. promotions
 * 12. special instructions
 * 
 * This block is pasted into the AI receptionist's instructions in HighLevel.
 */
export function formatReceptionistInstructions(setup: Partial<ReceptionistSetup> | null | undefined, fallbackShopName: string): string {
  const s = setup || {};
  const shopName = s.shopName || fallbackShopName || 'Auto Repair Shop';
  const addressLine = [s.address, s.city, s.state, s.zip].filter(Boolean).join(', ');

  // 1. Shop info
  const shopInfo = [
    `Shop Name: ${shopName}`,
    `Address: ${addressLine || 'Not provided'}`,
    `Main Phone: ${s.mainPhone || 'Not provided'}`,
    s.website ? `Website: ${s.website}` : null,
  ].filter(Boolean).join('\n');

  // 2. Service area
  const serviceArea = s.serviceArea?.trim() || 'Local area';

  // 3. Hours
  const days: (keyof WeeklyHours)[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const hoursLines = s.hours
    ? days.map((d) => {
        const dayConfig: DayHours = s.hours![d];
        const dayLabel = d.charAt(0).toUpperCase() + d.slice(1);
        if (!dayConfig || !dayConfig.open) return `${dayLabel}: Closed`;
        return `${dayLabel}: ${dayConfig.openTime || '8:00 AM'} - ${dayConfig.closeTime || '5:00 PM'}`;
      }).join('\n')
    : 'Monday - Friday: 8:00 AM - 5:00 PM\nSaturday: Closed\nSunday: Closed';

  // 4. Services
  const servicesList = (s.services && s.services.length > 0)
    ? s.services.map((srv) => `- ${srv}`).join('\n')
    : '- General Automotive Repair & Maintenance';
  const servicesSection = s.otherService?.trim()
    ? `${servicesList}\n- Other: ${s.otherService.trim()}`
    : servicesList;

  // 5. Never-do rules
  const neverDoList = (s.neverDo && s.neverDo.length > 0)
    ? s.neverDo.map((rule) => `- NEVER: ${rule}`).join('\n')
    : '- NEVER: Diagnose vehicles over the phone.\n- NEVER: Promise completion times without shop review.';
  const neverDoSection = s.neverDoOther?.trim()
    ? `${neverDoList}\n- NEVER: ${s.neverDoOther.trim()}`
    : neverDoList;

  // 6. Pricing rules
  let pricingRules = '';
  if (s.pricingChoice === 'no_quote') {
    pricingRules = "Do not quote prices. Take vehicle details and a message instead.";
  } else if (s.pricingChoice === 'share_prices') {
    pricingRules = "The receptionist may share these approved prices:\n" +
      ((s.prices && s.prices.length > 0)
        ? s.prices.map((p: PriceRow) => `- ${p.service}: ${p.price}`).join('\n')
        : '- Standard Oil Change: Take message for vehicle details');
  } else {
    pricingRules = "Do not quote prices. Take vehicle details and a message instead.";
  }

  // 7. Emergency and tow handling
  const emergencyHandling = s.emergencyHandling === 'transfer'
    ? `Urgent or tow calls: Immediately transfer to ${s.emergencyPhone || s.mainPhone || 'shop phone'}.`
    : 'Urgent or tow calls: Take caller name, location, vehicle, and mobile number. Notify shop immediately.';

  // 8. Greeting
  const greeting = s.greeting?.trim() || `Thanks for calling ${shopName}, how can I help you?`;

  // 9. Policies
  const policies = s.policies?.trim() || 'Standard shop payment upon completion. Contact shop for warranty details.';

  // 10. Common questions
  const commonQuestions = s.faq?.trim() || 'None provided.';

  // 11. Promotions
  const promotions = s.promotions?.trim() || 'No active promotions.';

  // 12. Special instructions
  const specialInstructions = s.specialInstructions?.trim() || 'Be polite, friendly, professional, and collect year, make, model for all intake.';

  return `=== AUTOINTEL AI RECEPTIONIST INSTRUCTIONS ===
Location: ${shopName}

1. SHOP INFO:
${shopInfo}

2. SERVICE AREA:
${serviceArea}

3. HOURS:
${hoursLines}

4. SERVICES:
${servicesSection}

5. NEVER-DO RULES:
${neverDoSection}

6. PRICING RULES:
${pricingRules}

7. EMERGENCY AND TOW HANDLING:
${emergencyHandling}

8. GREETING:
"${greeting}"

9. POLICIES:
${policies}

10. COMMON QUESTIONS & ANSWERS:
${commonQuestions}

11. CURRENT PROMOTIONS:
${promotions}

12. SPECIAL INSTRUCTIONS:
${specialInstructions}
`;
}

/**
 * Calculates hours elapsed since payment.
 */
export function getHoursSincePayment(paidAt?: string | null): number | null {
  if (!paidAt) return null;
  const time = new Date(paidAt).getTime();
  if (isNaN(time)) return null;
  const diffMs = Date.now() - time;
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
}

/**
 * Checks if a shop paid before today's cutoff time and is not yet live.
 */
export function isPaidBeforeCutoffAndNotLive(shop: any, cutoffTimeStr: string = '2:00 PM'): boolean {
  if (!shop.paidAt) return false;
  const status = shop.status;
  if (status === 'live' || status === 'active') return false;

  const paidDate = new Date(shop.paidAt);
  if (isNaN(paidDate.getTime())) return false;

  const now = new Date();
  // Check if paid on a previous day
  const isPreviousDay =
    paidDate.getFullYear() < now.getFullYear() ||
    paidDate.getMonth() < now.getMonth() ||
    paidDate.getDate() < now.getDate();

  if (isPreviousDay) {
    return true;
  }

  // Same day: parse cutoff time (e.g. "2:00 PM")
  const cutoffMatch = (cutoffTimeStr || '2:00 PM').match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (cutoffMatch) {
    let hours = parseInt(cutoffMatch[1], 10);
    const minutes = parseInt(cutoffMatch[2], 10);
    const meridiem = cutoffMatch[3].toUpperCase();
    if (meridiem === 'PM' && hours < 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;

    const cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
    return paidDate.getTime() <= cutoffDate.getTime();
  }

  return false;
}
