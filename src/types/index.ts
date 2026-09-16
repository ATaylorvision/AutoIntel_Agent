export type UserRole = 'owner' | 'admin';

export type ShopStatus = 'pending_payment' | 'paid_setup' | 'provisioning' | 'live' | 'active' | 'paused' | 'canceled';
export type SubscriptionStatus = 'none' | 'active' | 'past_due' | 'canceled';

export interface DayHours {
  open: boolean;
  openTime: string;
  closeTime: string;
}

export interface WeeklyHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface PriceRow {
  id: string;
  service: string;
  price: string;
}

export interface ReceptionistSetup {
  // Step 1: Your shop
  shopName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  mainPhone: string;
  website?: string;
  serviceArea: string;

  // Step 2: Hours
  hours: WeeklyHours;

  // Step 3: Services
  services: string[];
  otherService?: string;

  // Step 4: What your receptionist should never do
  neverDo: string[];
  neverDoOther?: string;

  // Step 5: Prices it can share
  pricingChoice: 'no_quote' | 'share_prices';
  prices: PriceRow[];

  // Step 6: Calls and alerts
  emergencyHandling: 'transfer' | 'message';
  emergencyPhone?: string;
  alertMobile: string;
  alertEmail: string;
  greeting: string;

  // Step 7: Anything else (all optional)
  policies?: string;
  faq?: string;
  promotions?: string;
  specialInstructions?: string;

  completedAt?: string | null;
  updatedAt: string;
}

export interface TestRecord {
  id?: string;
  scenario: string;
  result: 'handled_well' | 'something_off' | 'It handled this well' | 'Something was off' | string;
  note?: string;
  createdAt: string;
}

export interface UserRecord {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  role: UserRole;
  shopId: string;
  createdAt: string;
}

export interface ShopRecord {
  id: string;
  shopName: string;
  ownerUid: string;
  ownerName: string;
  ownerMobile: string;
  status: ShopStatus;
  subscriptionStatus: SubscriptionStatus;
  auditId?: string | null;
  createdAt: string;
  paidAt?: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  receptionistPhone?: string | null;
  assignedNumber?: string | null;
  autointelNumber?: string | null;
  locationId?: string | null;
  internalNotes?: string | null;
  liveAt?: string | null;
  setupScore?: number;
  receptionistSetup?: ReceptionistSetup | null;
}

export interface ChangeRecord {
  id?: string;
  section: string;
  oldValues?: any;
  newValues?: any;
  applied: boolean;
  appliedAt?: string | null;
  createdAt: string;
}

export interface IntakeError {
  id?: string;
  callerPhone?: string;
  locationId?: string;
  rawPayload?: any;
  errorReason: string;
  createdAt: string;
}

export type CallOutcome =
  | 'appointment_requested'
  | 'callback_needed'
  | 'transferred'
  | 'question_answered'
  | 'spam_or_hangup';

export type CallFollowUp = 'new' | 'done' | 'none';

export interface CallRecord {
  id: string;
  externalCallId: string;
  shopId: string;
  locationId: string;
  startedAt: string;
  durationSeconds: number;
  callerName: string;
  callerPhone: string;
  vehicleYear?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  service?: string;
  serviceCategory: string;
  summary: string;
  outcome: CallOutcome;
  transcript?: string;
  recordingUrl?: string;
  afterHours: boolean;
  followUp: CallFollowUp;
  handledAt?: string | null;
  receivedAt: string;
}

export interface AppSettings {
  sameDayCutoff: string; // e.g. "2:00 PM"
  timezone: string; // e.g. "America/New_York"
  supportPhone: string; // e.g. "888-212-1629"
  supportEmail: string; // e.g. "support@g2gintel.com"
}

export interface AuditRecord {
  id?: string;
  weeklyCalls: number;
  missedPercent: number;
  avgTicket: number;
  closeRate: number;
  monthlyMissedCalls: number;
  lostJobs: number;
  lostRevenue: number;
  createdAt: string;
}
