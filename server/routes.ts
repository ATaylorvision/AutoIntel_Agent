import express, { Request, Response, Router } from 'express';
import Stripe from 'stripe';
import { adminDb, adminAuth } from './firebaseAdmin.ts';

const router = Router();

// Lazy Stripe initialization
let stripeClient: Stripe | null = null;
function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key === 'sk_test_...' || key.includes('placeholder')) {
    return null;
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

function checkIsAdmin(email?: string): boolean {
  if (!email) return false;
  const rawAdmins = process.env.ADMIN_EMAILS || 'AleshaTaylor1@gmail.com,admin@autointel.com';
  const adminList = rawAdmins.split(',').map((e) => e.trim().toLowerCase());
  return adminList.includes(email.trim().toLowerCase());
}

// N8N Webhook Dispatcher
async function dispatchN8nEvent(payload: Record<string, any>): Promise<{ success: boolean; simulated?: boolean; status?: number; payload?: any; error?: string }> {
  const n8nUrl = process.env.N8N_EVENTS_WEBHOOK_URL;
  const sharedSecret = process.env.N8N_SHARED_SECRET || '';

  console.log(`[N8N Webhook] Dispatching event '${payload.event}' for shop ${payload.shopId || 'global'}`);
  if (!n8nUrl || n8nUrl.includes('example.com')) {
    console.log('[N8N Webhook Simulation] N8N_EVENTS_WEBHOOK_URL not configured for external dispatch. Payload:', payload);
    return { success: true, simulated: true, payload };
  }

  try {
    const res = await fetch(n8nUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-AutoIntel-Secret': sharedSecret,
      },
      body: JSON.stringify(payload),
    });
    console.log('[N8N Webhook] Response status:', res.status);
    return { success: res.ok, status: res.status };
  } catch (error) {
    console.error('[N8N Webhook Error]:', error);
    return { success: false, error: String(error) };
  }
}

// 1. App Settings (GET & Admin UPDATE)
router.get('/settings/app', async (_req: Request, res: Response) => {
  try {
    const docRef = adminDb.collection('settings').doc('app');
    const snap = await docRef.get();
    if (snap.exists) {
      return res.json(snap.data());
    }

    const defaultSettings = {
      sameDayCutoff: '2:00 PM',
      timezone: 'America/New_York',
      supportPhone: '888-212-1629',
      supportEmail: 'support@autointelagent.com',
    };
    await docRef.set(defaultSettings);
    return res.json(defaultSettings);
  } catch (err) {
    console.warn('Error reading settings/app from Firestore, returning defaults:', err);
    return res.json({
      sameDayCutoff: '2:00 PM',
      timezone: 'America/New_York',
      supportPhone: '888-212-1629',
      supportEmail: 'support@autointelagent.com',
    });
  }
});

router.post('/admin/settings', async (req: Request, res: Response) => {
  try {
    const { sameDayCutoff, timezone, supportPhone, supportEmail, adminEmail } = req.body;
    if (!checkIsAdmin(adminEmail)) {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }

    const docRef = adminDb.collection('settings').doc('app');
    const updateData: any = {};
    if (sameDayCutoff) updateData.sameDayCutoff = sameDayCutoff;
    if (timezone) updateData.timezone = timezone;
    if (supportPhone) updateData.supportPhone = supportPhone;
    if (supportEmail) updateData.supportEmail = supportEmail;

    await docRef.set(updateData, { merge: true });
    return res.json({ success: true, settings: updateData });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 2. Missed-Call Audit save
router.post('/audits', async (req: Request, res: Response) => {
  try {
    const { weeklyCalls, missedPercent, avgTicket, closeRate, monthlyMissedCalls, lostJobs, lostRevenue } = req.body;
    const auditData = {
      weeklyCalls: Number(weeklyCalls) || 0,
      missedPercent: Number(missedPercent) || 0,
      avgTicket: Number(avgTicket) || 0,
      closeRate: Number(closeRate) || 0,
      monthlyMissedCalls: Number(monthlyMissedCalls) || 0,
      lostJobs: Number(lostJobs) || 0,
      lostRevenue: Number(lostRevenue) || 0,
      createdAt: new Date().toISOString(),
    };

    const docRef = await adminDb.collection('audits').add(auditData);
    return res.json({ success: true, auditId: docRef.id, audit: { id: docRef.id, ...auditData } });
  } catch (err: any) {
    console.error('Error saving audit:', err);
    return res.status(500).json({ error: err.message });
  }
});

router.get('/audits/:auditId', async (req: Request, res: Response) => {
  try {
    const { auditId } = req.params;
    const snap = await adminDb.collection('audits').doc(auditId).get();
    if (!snap.exists) {
      return res.status(404).json({ error: 'Audit not found' });
    }
    return res.json({ id: snap.id, ...snap.data() });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 3. Complete Sign-up (Server creates users/{uid} and shops/{shopId})
router.post('/auth/complete-signup', async (req: Request, res: Response) => {
  try {
    const { uid, firstName, lastName, email, mobile, shopName, auditId } = req.body;

    if (!uid || !email || !shopName || !firstName || !lastName || !mobile) {
      return res.status(400).json({ error: 'Missing required sign-up fields.' });
    }

    const isAdmin = checkIsAdmin(email);
    const role = isAdmin ? 'admin' : 'owner';
    const createdAt = new Date().toISOString();
    const shopId = `shop_${uid.slice(0, 8)}_${Date.now().toString(36)}`;

    // 1. Create or update user doc
    const userDocRef = adminDb.collection('users').doc(uid);
    const existingUser = await userDocRef.get();
    let finalShopId = shopId;

    if (existingUser.exists && existingUser.data()?.shopId) {
      finalShopId = existingUser.data()!.shopId;
    }

    const userData = {
      uid,
      firstName,
      lastName,
      email,
      mobile,
      role,
      shopId: finalShopId,
      createdAt: existingUser.exists ? existingUser.data()?.createdAt : createdAt,
      updatedAt: createdAt,
    };
    await userDocRef.set(userData, { merge: true });

    // 2. Create or update shop doc
    const shopDocRef = adminDb.collection('shops').doc(finalShopId);
    const existingShop = await shopDocRef.get();

    const shopData = {
      id: finalShopId,
      shopName,
      ownerUid: uid,
      ownerName: `${firstName} ${lastName}`.trim(),
      ownerMobile: mobile,
      status: existingShop.exists ? (existingShop.data()?.status || 'pending_payment') : 'pending_payment',
      subscriptionStatus: existingShop.exists ? (existingShop.data()?.subscriptionStatus || 'none') : 'none',
      auditId: auditId || existingShop.data()?.auditId || null,
      createdAt: existingShop.exists ? existingShop.data()?.createdAt : createdAt,
      updatedAt: createdAt,
    };
    await shopDocRef.set(shopData, { merge: true });

    return res.json({
      success: true,
      user: userData,
      shop: shopData,
    });
  } catch (err: any) {
    console.error('Error in complete-signup:', err);
    return res.status(500).json({ error: err.message });
  }
});

// 4. Shop Status & Details
router.get('/shops/:shopId', async (req: Request, res: Response) => {
  try {
    const { shopId } = req.params;
    const snap = await adminDb.collection('shops').doc(shopId).get();
    if (!snap.exists) {
      return res.status(404).json({ error: 'Shop not found' });
    }
    return res.json(snap.data());
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 5. Stripe Checkout Session Creation
router.post('/checkout/create-session', async (req: Request, res: Response) => {
  try {
    const { shopId, email, returnUrl } = req.body;
    if (!shopId) {
      return res.status(400).json({ error: 'shopId is required' });
    }

    const shopDoc = await adminDb.collection('shops').doc(shopId).get();
    if (!shopDoc.exists) {
      return res.status(404).json({ error: 'Shop does not exist' });
    }
    const shop = shopDoc.data()!;

    const baseUrl = process.env.APP_URL || (req.headers.origin as string) || 'http://localhost:3000';
    const successUrl = `${baseUrl}/checkout/success?shop_id=${shopId}&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/pricing?canceled=true`;

    const stripe = getStripe();
    if (!stripe) {
      // In development or when Stripe keys aren't configured yet, provide seamless test mode URL
      console.log('[Stripe] STRIPE_SECRET_KEY not set or is test placeholder. Returning simulation checkout link.');
      return res.json({
        url: `${baseUrl}/checkout/test-mode?shop_id=${shopId}`,
        mode: 'simulation',
        message: 'Stripe keys not set in environment. Use the built-in test checkout screen.',
      });
    }

    const priceMonthly = process.env.STRIPE_PRICE_MONTHLY;
    const priceSetup = process.env.STRIPE_PRICE_SETUP;

    let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];

    if (priceMonthly && priceSetup && priceMonthly.startsWith('price_') && priceSetup.startsWith('price_')) {
      lineItems = [
        { price: priceMonthly, quantity: 1 },
        { price: priceSetup, quantity: 1 },
      ];
    } else {
      // Inline price data fallback if price IDs are not yet created in Stripe dashboard
      lineItems = [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'AutoIntel Agent Receptionist Plan',
              description: '24/7 AI phone answering for auto repair shop',
            },
            unit_amount: 19900, // $199.00
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'AutoIntel Agent One-Time Setup Fee',
              description: 'Custom voice, greeting, services, and routing configuration',
            },
            unit_amount: 29900, // $299.00
          },
          quantity: 1,
        },
      ];
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: lineItems,
      customer_email: email || undefined,
      metadata: {
        shopId,
        ownerUid: shop.ownerUid,
        shopName: shop.shopName,
      },
      subscription_data: {
        metadata: {
          shopId,
        },
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return res.json({ url: session.url, sessionId: session.id });
  } catch (err: any) {
    console.error('Error creating Stripe checkout session:', err);
    return res.status(500).json({ error: err.message });
  }
});

// 6. Test Mode / Simulated Payment Endpoint (For immediate verification & testing)
router.post('/checkout/simulate-payment', async (req: Request, res: Response) => {
  try {
    const { shopId } = req.body;
    if (!shopId) {
      return res.status(400).json({ error: 'shopId is required' });
    }

    const shopRef = adminDb.collection('shops').doc(shopId);
    const snap = await shopRef.get();
    if (!snap.exists) {
      return res.status(404).json({ error: 'Shop not found' });
    }
    const shop = snap.data()!;

    const paidAt = new Date().toISOString();
    const fakeCustomerId = `cus_test_${Date.now()}`;
    const fakeSubId = `sub_test_${Date.now()}`;

    // Update shop: set status "paid_setup", subscriptionStatus "active", save stripeCustomerId, stripeSubscriptionId, paidAt
    await shopRef.update({
      status: 'paid_setup',
      subscriptionStatus: 'active',
      stripeCustomerId: fakeCustomerId,
      stripeSubscriptionId: fakeSubId,
      paidAt,
    });

    // Dispatch to N8N webhook
    const n8nResult = await dispatchN8nEvent({
      event: 'shop_paid',
      shopId,
      shopName: shop.shopName,
      ownerName: shop.ownerName,
      ownerMobile: shop.ownerMobile,
      paidAt,
    });

    return res.json({
      success: true,
      shopId,
      status: 'paid_setup',
      subscriptionStatus: 'active',
      paidAt,
      n8nResult,
    });
  } catch (err: any) {
    console.error('Error in simulate-payment:', err);
    return res.status(500).json({ error: err.message });
  }
});

// 6b. Stripe Customer Portal Session
router.post('/create-portal-session', async (req: Request, res: Response) => {
  try {
    const { customerId, shopId } = req.body;
    const stripe = getStripe();
    const baseUrl = process.env.APP_URL || (req.headers.origin as string) || 'http://localhost:3000';
    const returnUrl = `${baseUrl}/client-dashboard`;

    if (!stripe || !customerId || customerId.startsWith('cus_test_')) {
      return res.json({
        url: `${baseUrl}/checkout/test-mode?mode=portal&shop_id=${shopId || ''}`,
        simulated: true,
      });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return res.json({ url: portalSession.url });
  } catch (err: any) {
    console.error('Error creating Stripe billing portal session:', err);
    return res.status(500).json({ error: 'Unable to open billing portal. Please contact support or try again.' });
  }
});

// 6c. User Profile Update
router.post('/users/profile', async (req: Request, res: Response) => {
  try {
    const { uid, firstName, lastName, mobile, shopId } = req.body;
    if (!uid) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    const userRef = adminDb.collection('users').doc(uid);
    const now = new Date().toISOString();
    await userRef.set(
      {
        firstName: firstName || '',
        lastName: lastName || '',
        mobile: mobile || '',
        updatedAt: now,
      },
      { merge: true }
    );

    if (shopId) {
      const fullName = `${firstName || ''} ${lastName || ''}`.trim();
      const shopRef = adminDb.collection('shops').doc(shopId);
      await shopRef.set(
        {
          ownerName: fullName,
          ownerMobile: mobile,
          updatedAt: now,
        },
        { merge: true }
      );
    }

    return res.json({ success: true, message: 'Profile updated successfully' });
  } catch (err: any) {
    console.error('Error updating profile:', err);
    return res.status(500).json({ error: 'Unable to update profile. Please try again.' });
  }
});

// 7. Stripe Webhook Route (Verified with STRIPE_WEBHOOK_SECRET)
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  if (stripe && webhookSecret && webhookSecret !== 'whsec_...') {
    const sig = req.headers['stripe-signature'] as string;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error(`Stripe Webhook signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  } else {
    // If running in development without raw payload signature verification
    try {
      event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch (e) {
      return res.status(400).json({ error: 'Invalid JSON payload' });
    }
  }

  console.log(`[Stripe Webhook Received] Event type: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const shopId = session.metadata?.shopId;
        if (!shopId) {
          console.warn('checkout.session.completed received without shopId in metadata');
          break;
        }

        const shopRef = adminDb.collection('shops').doc(shopId);
        const shopSnap = await shopRef.get();
        if (!shopSnap.exists) {
          console.warn(`Shop ${shopId} not found in database for checkout completion`);
          break;
        }

        const shop = shopSnap.data()!;
        const paidAt = new Date().toISOString();

        await shopRef.update({
          status: 'paid_setup',
          subscriptionStatus: 'active',
          stripeCustomerId: (session.customer as string) || null,
          stripeSubscriptionId: (session.subscription as string) || null,
          paidAt,
        });

        // POST to N8N_EVENTS_WEBHOOK_URL with header X-AutoIntel-Secret
        await dispatchN8nEvent({
          event: 'shop_paid',
          shopId,
          shopName: shop.shopName,
          ownerName: shop.ownerName,
          ownerMobile: shop.ownerMobile,
          paidAt,
        });
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        if (customerId) {
          const snapshot = await adminDb.collection('shops').where('stripeCustomerId', '==', customerId).get();
          for (const doc of snapshot.docs) {
            await doc.ref.update({ subscriptionStatus: 'active' });
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        if (customerId) {
          const snapshot = await adminDb.collection('shops').where('stripeCustomerId', '==', customerId).get();
          for (const doc of snapshot.docs) {
            await doc.ref.update({ subscriptionStatus: 'past_due' });
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        if (customerId) {
          const snapshot = await adminDb.collection('shops').where('stripeCustomerId', '==', customerId).get();
          for (const doc of snapshot.docs) {
            await doc.ref.update({
              subscriptionStatus: 'canceled',
              status: 'canceled',
            });
          }
        }
        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return res.json({ received: true });
  } catch (err: any) {
    console.error('Error handling Stripe webhook:', err);
    return res.status(500).json({ error: err.message });
  }
});

// 8. Admin Shops List (for G2G internal management)
router.get('/admin/shops', async (req: Request, res: Response) => {
  try {
    const adminEmail = (req.query.adminEmail as string) || '';
    if (!checkIsAdmin(adminEmail)) {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }

    const shopsSnap = await adminDb.collection('shops').orderBy('createdAt', 'desc').limit(100).get();
    const shops = shopsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return res.json({ shops });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 9. Receptionist Setup Save & Complete
router.post('/shops/:shopId/setup', async (req: Request, res: Response) => {
  try {
    const { shopId } = req.params;
    const { receptionistSetup, setupScore, isComplete } = req.body;

    const shopRef = adminDb.collection('shops').doc(shopId);
    const shopSnap = await shopRef.get();
    if (!shopSnap.exists) {
      return res.status(404).json({ error: 'Shop not found' });
    }
    const shop = shopSnap.data()!;

    const now = new Date().toISOString();
    const setupData = {
      ...receptionistSetup,
      updatedAt: now,
    };

    if (isComplete) {
      setupData.completedAt = now;
    }

    const updatePayload: Record<string, any> = {
      receptionistSetup: setupData,
      setupScore: Number(setupScore) || 0,
      updatedAt: now,
    };

    // If completed and currently paid_setup, can progress to provisioning
    if (isComplete && shop.status === 'paid_setup') {
      updatePayload.status = 'provisioning';
    }

    await shopRef.update(updatePayload);

    // If completed, dispatch setup_completed to N8N
    if (isComplete) {
      await dispatchN8nEvent({
        event: 'setup_completed',
        shopId,
        shopName: shop.shopName,
        setupScore: Number(setupScore) || 0,
      });
    }

    return res.json({
      success: true,
      shopId,
      receptionistSetup: setupData,
      setupScore: updatePayload.setupScore,
      completedAt: setupData.completedAt || null,
    });
  } catch (err: any) {
    console.error('Error in /shops/:shopId/setup:', err);
    return res.status(500).json({ error: err.message });
  }
});

// 9b. Receptionist Settings Update from Client Dashboard
router.post('/shops/:shopId/receptionist-settings', async (req: Request, res: Response) => {
  try {
    const { shopId } = req.params;
    const { section, newValues, oldValues, updatedSetup, setupScore } = req.body;

    const shopRef = adminDb.collection('shops').doc(shopId);
    const shopSnap = await shopRef.get();
    if (!shopSnap.exists) {
      return res.status(404).json({ error: 'Shop not found' });
    }
    const shop = shopSnap.data()!;
    const now = new Date().toISOString();

    const mergedSetup = {
      ...(shop.receptionistSetup || {}),
      ...(updatedSetup || {}),
      updatedAt: now,
    };

    const updatePayload: Record<string, any> = {
      receptionistSetup: mergedSetup,
      updatedAt: now,
    };

    if (typeof setupScore === 'number') {
      updatePayload.setupScore = setupScore;
    }
    if (mergedSetup.shopName) {
      updatePayload.shopName = mergedSetup.shopName;
    }
    if (mergedSetup.mainPhone) {
      updatePayload.phone = mergedSetup.mainPhone;
    }

    await shopRef.update(updatePayload);

    const isLive = shop.status === 'live';
    if (isLive) {
      // 1. Add document to shops/{shopId}/changes
      const changeRef = await shopRef.collection('changes').add({
        section: section || 'General',
        oldValues: oldValues || null,
        newValues: newValues || {},
        createdAt: now,
        applied: false,
      });

      // 2. POST { event: "settings_changed", shopId, shopName, section } to N8N_EVENTS_WEBHOOK_URL
      await dispatchN8nEvent({
        event: 'settings_changed',
        shopId,
        shopName: shop.shopName,
        section: section || 'General',
        changeId: changeRef.id,
      });

      return res.json({
        success: true,
        isLive: true,
        receptionistSetup: mergedSetup,
        message: "Saved. We'll update your receptionist and text you when it's done.",
      });
    }

    return res.json({
      success: true,
      isLive: false,
      receptionistSetup: mergedSetup,
      message: 'Saved successfully.',
    });
  } catch (err: any) {
    console.error('Error in /shops/:shopId/receptionist-settings:', err);
    return res.status(500).json({ error: 'Unable to save receptionist settings. Please try again.' });
  }
});

// 10. Receptionist Tests (Save scenario test & dispatch issue if off)
router.post('/shops/:shopId/tests', async (req: Request, res: Response) => {
  try {
    const { shopId } = req.params;
    const { scenario, result, note } = req.body;

    if (!scenario || !result) {
      return res.status(400).json({ error: 'Scenario and result are required' });
    }

    const shopRef = adminDb.collection('shops').doc(shopId);
    const shopSnap = await shopRef.get();
    if (!shopSnap.exists) {
      return res.status(404).json({ error: 'Shop not found' });
    }
    const shop = shopSnap.data()!;

    const testData = {
      scenario,
      result, // 'handled_well' | 'something_off'
      note: note || '',
      createdAt: new Date().toISOString(),
    };

    const docRef = await shopRef.collection('tests').add(testData);

    // If result is "something_off", dispatch N8N event test_issue
    if (result === 'something_off' || result === 'Something was off') {
      await dispatchN8nEvent({
        event: 'test_issue',
        shopId,
        shopName: shop.shopName,
        scenario,
        note: note || '',
      });
    }

    return res.json({ success: true, testId: docRef.id, ...testData });
  } catch (err: any) {
    console.error('Error in /shops/:shopId/tests:', err);
    return res.status(500).json({ error: err.message });
  }
});

router.get('/shops/:shopId/tests', async (req: Request, res: Response) => {
  try {
    const { shopId } = req.params;
    const testsSnap = await adminDb.collection('shops').doc(shopId).collection('tests').orderBy('createdAt', 'desc').get();
    const tests = testsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return res.json({ tests });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 11. Shop Status Update (for transitioning to live, active, or provisioning)
router.post('/shops/:shopId/status', async (req: Request, res: Response) => {
  try {
    const { shopId } = req.params;
    const { status, autointelNumber } = req.body;

    const shopRef = adminDb.collection('shops').doc(shopId);
    const shopSnap = await shopRef.get();
    if (!shopSnap.exists) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    const updateData: any = {
      status,
      updatedAt: new Date().toISOString(),
    };

    if (autointelNumber) {
      updateData.autointelNumber = autointelNumber;
    } else if (status === 'live' || status === 'active') {
      updateData.autointelNumber = shopSnap.data()?.autointelNumber || '888-212-1629';
    }

    await shopRef.update(updateData);
    return res.json({ success: true, status, autointelNumber: updateData.autointelNumber });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// PHASE 3: ADMIN ENDPOINTS (G2G ONLY)
// ==========================================

function checkAdminAuth(req: Request): boolean {
  const adminEmail =
    (req.query.adminEmail as string) ||
    (req.body && req.body.adminEmail) ||
    (req.headers['x-admin-email'] as string) ||
    '';
  return checkIsAdmin(adminEmail);
}

// Admin: Get Single Shop with subcollections (tests, changes) & audit data
router.get('/admin/shops/:shopId', async (req: Request, res: Response) => {
  try {
    if (!checkAdminAuth(req)) {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }

    const { shopId } = req.params;
    const shopDoc = await adminDb.collection('shops').doc(shopId).get();
    if (!shopDoc.exists) {
      return res.status(404).json({ error: 'Shop not found' });
    }
    const shop = { id: shopDoc.id, ...shopDoc.data() } as any;

    // Load audit if present
    let auditData = null;
    if (shop.auditId) {
      const auditSnap = await adminDb.collection('audits').doc(shop.auditId).get();
      if (auditSnap.exists) {
        auditData = { id: auditSnap.id, ...auditSnap.data() };
      }
    }

    // Load tests
    const testsSnap = await adminDb
      .collection('shops')
      .doc(shopId)
      .collection('tests')
      .orderBy('createdAt', 'desc')
      .get();
    const tests = testsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Load changes
    const changesSnap = await adminDb
      .collection('shops')
      .doc(shopId)
      .collection('changes')
      .orderBy('createdAt', 'desc')
      .get();
    const changes = changesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    return res.json({
      shop,
      audit: auditData,
      tests,
      changes,
    });
  } catch (err: any) {
    console.error('Error fetching admin shop details:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Admin: Linking HighLevel location ID & AutoIntel number (with uniqueness check)
router.post('/admin/shops/:shopId/linking', async (req: Request, res: Response) => {
  try {
    if (!checkAdminAuth(req)) {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }

    const { shopId } = req.params;
    const { locationId, autointelNumber } = req.body;

    const trimmedLocationId = locationId ? String(locationId).trim() : '';
    const trimmedNumber = autointelNumber ? String(autointelNumber).trim() : '';

    const shopRef = adminDb.collection('shops').doc(shopId);
    const shopSnap = await shopRef.get();
    if (!shopSnap.exists) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    // Ensure locationId is unique across all shops
    if (trimmedLocationId) {
      const existingWithLoc = await adminDb
        .collection('shops')
        .where('locationId', '==', trimmedLocationId)
        .get();

      const conflict = existingWithLoc.docs.find((d) => d.id !== shopId);
      if (conflict) {
        const conflictData = conflict.data();
        return res.status(400).json({
          error: `Location ID "${trimmedLocationId}" is already linked to another shop (${conflictData.shopName || conflict.id}). HighLevel location IDs must be unique.`,
        });
      }
    }

    const updatePayload: Record<string, any> = {
      locationId: trimmedLocationId,
      autointelNumber: trimmedNumber,
      updatedAt: new Date().toISOString(),
    };

    await shopRef.update(updatePayload);
    return res.json({ success: true, ...updatePayload });
  } catch (err: any) {
    console.error('Error in admin linking:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Admin: Status controls (provisioning, live, paused, reactivate)
router.post('/admin/shops/:shopId/status-control', async (req: Request, res: Response) => {
  try {
    if (!checkAdminAuth(req)) {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }

    const { shopId } = req.params;
    const { action, locationId, autointelNumber } = req.body;

    const shopRef = adminDb.collection('shops').doc(shopId);
    const shopSnap = await shopRef.get();
    if (!shopSnap.exists) {
      return res.status(404).json({ error: 'Shop not found' });
    }
    const shop = shopSnap.data()!;
    const now = new Date().toISOString();

    if (action === 'live') {
      const effectiveLocId = locationId || shop.locationId;
      const effectiveNumber = autointelNumber || shop.autointelNumber;

      if (!effectiveLocId || !effectiveNumber) {
        return res.status(400).json({
          error: 'Marking as live requires both HighLevel Location ID and AutoIntel Number to be filled in.',
        });
      }

      const updateData: Record<string, any> = {
        status: 'live',
        liveAt: now,
        locationId: effectiveLocId,
        autointelNumber: effectiveNumber,
        updatedAt: now,
      };

      await shopRef.update(updateData);

      const appUrl = process.env.APP_URL || (req.headers.origin as string) || 'https://autointelagent.com';
      await dispatchN8nEvent({
        event: 'shop_live',
        shopId,
        shopName: shop.shopName,
        ownerName: shop.ownerName,
        ownerMobile: shop.ownerMobile,
        autointelNumber: effectiveNumber,
        appUrl,
      });

      return res.json({ success: true, status: 'live', liveAt: now });
    }

    if (action === 'provisioning') {
      await shopRef.update({
        status: 'provisioning',
        updatedAt: now,
      });
      return res.json({ success: true, status: 'provisioning' });
    }

    if (action === 'pause') {
      await shopRef.update({
        status: 'paused',
        updatedAt: now,
      });
      return res.json({ success: true, status: 'paused' });
    }

    if (action === 'reactivate') {
      await shopRef.update({
        status: 'live',
        updatedAt: now,
      });
      return res.json({ success: true, status: 'live' });
    }

    return res.status(400).json({ error: `Unknown action: ${action}` });
  } catch (err: any) {
    console.error('Error in status-control:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Admin: Save internal notes (admin only, never visible to owner)
router.post('/admin/shops/:shopId/notes', async (req: Request, res: Response) => {
  try {
    if (!checkAdminAuth(req)) {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }

    const { shopId } = req.params;
    const { internalNotes } = req.body;

    const shopRef = adminDb.collection('shops').doc(shopId);
    await shopRef.update({
      internalNotes: internalNotes || '',
      updatedAt: new Date().toISOString(),
    });

    return res.json({ success: true, internalNotes });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Admin: Mark change as applied
router.post('/admin/shops/:shopId/changes/:changeId/apply', async (req: Request, res: Response) => {
  try {
    if (!checkAdminAuth(req)) {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }

    const { shopId, changeId } = req.params;
    const shopSnap = await adminDb.collection('shops').doc(shopId).get();
    if (!shopSnap.exists) {
      return res.status(404).json({ error: 'Shop not found' });
    }
    const shop = shopSnap.data()!;

    const changeRef = adminDb.collection('shops').doc(shopId).collection('changes').doc(changeId);
    const changeSnap = await changeRef.get();
    if (!changeSnap.exists) {
      return res.status(404).json({ error: 'Change record not found' });
    }
    const change = changeSnap.data()!;

    const appliedAt = new Date().toISOString();
    await changeRef.update({
      applied: true,
      appliedAt,
    });

    // POST { event: "change_applied", shopId, shopName, ownerMobile, section } to N8N
    await dispatchN8nEvent({
      event: 'change_applied',
      shopId,
      shopName: shop.shopName,
      ownerMobile: shop.ownerMobile,
      section: change.section || 'General',
    });

    return res.json({ success: true, applied: true, appliedAt });
  } catch (err: any) {
    console.error('Error applying change:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Helper: check if a call startedAt is outside shop's saved hours in America/New_York
function checkIsAfterHours(startedAtStr: string, hoursObj: any): boolean {
  if (!hoursObj || typeof hoursObj !== 'object') return false;

  try {
    const date = new Date(startedAtStr);
    if (isNaN(date.getTime())) return false;

    // Get weekday in New York time: e.g. "Monday"
    const weekdayFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      weekday: 'long',
    });
    const weekday = weekdayFormatter.format(date).toLowerCase();

    const dayConfig = hoursObj[weekday];
    if (!dayConfig || !dayConfig.open) {
      return true; // closed on this day, so it is after hours
    }

    // Get hour and minute in New York time:
    const timeFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const timeParts = timeFormatter.format(date);
    const [hh, mm] = timeParts.split(':').map((s) => parseInt(s, 10));
    const currentMins = hh * 60 + mm;

    const [openH, openM] = (dayConfig.openTime || '08:00').split(':').map((s: string) => parseInt(s, 10));
    const [closeH, closeM] = (dayConfig.closeTime || '17:30').split(':').map((s: string) => parseInt(s, 10));

    const openMins = openH * 60 + openM;
    const closeMins = closeH * 60 + closeM;

    return currentMins < openMins || currentMins > closeMins;
  } catch (err) {
    console.error('Error calculating afterHours:', err);
    return false;
  }
}

// Helper: match service text to shop's selected services or fallback
function matchServiceCategory(serviceText: string, shopServices: any[]): string {
  if (!serviceText || !Array.isArray(shopServices) || shopServices.length === 0) {
    return 'Other';
  }
  const cleanText = serviceText.toLowerCase();

  for (const s of shopServices) {
    const sName = (typeof s === 'string' ? s : s.name || '').trim();
    if (!sName) continue;
    if (cleanText.includes(sName.toLowerCase()) || sName.toLowerCase().includes(cleanText)) {
      return sName;
    }
  }

  const commonKeywords: Record<string, string> = {
    oil: 'Oil changes',
    brake: 'Brakes',
    tire: 'Tires',
    align: 'Alignments',
    engine: 'Diagnostics and check engine light',
    diagnostic: 'Diagnostics and check engine light',
    ac: 'AC and heating',
    heat: 'AC and heating',
    battery: 'Batteries',
    batteries: 'Batteries',
    transmission: 'Transmission',
    suspension: 'Suspension and steering',
    steering: 'Suspension and steering',
    inspection: 'State inspection',
    tune: 'Tune-up',
    exhaust: 'Exhaust and mufflers',
    muffler: 'Exhaust and mufflers',
  };

  for (const [kw, cat] of Object.entries(commonKeywords)) {
    if (cleanText.includes(kw)) {
      const match = shopServices.find(
        (s) => (typeof s === 'string' ? s : s.name || '').toLowerCase() === cat.toLowerCase()
      );
      if (match) {
        return typeof match === 'string' ? match : match.name;
      }
      return cat;
    }
  }

  return 'Other';
}

// PART A: POST /api/intake/test
router.post('/intake/test', (req: Request, res: Response) => {
  const secret = process.env.N8N_SHARED_SECRET || process.env.AUTOINTEL_SHARED_SECRET || 'autointel-shared-n8n-secret-key-2025';
  const provided = req.headers['x-autointel-secret'];
  if (!provided || provided !== secret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return res.json({ ok: true });
});

// PART A: POST /api/intake/call
router.post('/intake/call', async (req: Request, res: Response) => {
  try {
    const secret = process.env.N8N_SHARED_SECRET || process.env.AUTOINTEL_SHARED_SECRET || 'autointel-shared-n8n-secret-key-2025';
    const provided = req.headers['x-autointel-secret'];
    if (!provided || provided !== secret) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      locationId,
      externalCallId,
      startedAt,
      durationSeconds,
      callerName,
      callerPhone,
      vehicleYear,
      vehicleMake,
      vehicleModel,
      service,
      summary,
      outcome,
      transcript,
      recordingUrl,
    } = req.body;

    const locId = typeof locationId === 'string' ? locationId.trim() : '';
    const callId = typeof externalCallId === 'string' ? externalCallId.trim() : '';
    const startAt = typeof startedAt === 'string' ? startedAt.trim() : '';

    if (!locId || !callId || !startAt) {
      return res.status(400).json({ error: 'Missing required fields: locationId, externalCallId, startedAt' });
    }

    // Find shop whose ghlLocationId or locationId equals locationId
    let shopId: string | null = null;
    let shopData: any = null;

    const locQuery = await adminDb.collection('shops').where('locationId', '==', locId).limit(1).get();
    if (!locQuery.empty) {
      shopId = locQuery.docs[0].id;
      shopData = locQuery.docs[0].data();
    } else {
      const ghlQuery = await adminDb.collection('shops').where('ghlLocationId', '==', locId).limit(1).get();
      if (!ghlQuery.empty) {
        shopId = ghlQuery.docs[0].id;
        shopData = ghlQuery.docs[0].data();
      }
    }

    if (!shopId || !shopData) {
      // Save payload plus time and reason to "intakeErrors"
      await adminDb.collection('intakeErrors').add({
        callerPhone: typeof callerPhone === 'string' ? callerPhone.trim() : '',
        locationId: locId,
        rawPayload: req.body,
        errorReason: `Unmatched location ID: ${locId}`,
        createdAt: new Date().toISOString(),
      });
      return res.status(404).json({ error: 'Shop not found for location ID' });
    }

    // Validate outcome
    const validOutcomes = ['appointment_requested', 'callback_needed', 'transferred', 'question_answered', 'spam_or_hangup'];
    const rawOutcome = typeof outcome === 'string' ? outcome.trim().toLowerCase() : '';
    const cleanOutcome = validOutcomes.includes(rawOutcome) ? rawOutcome : 'question_answered';

    // followUp: "new" if outcome is appointment_requested or callback_needed, otherwise "none"
    const followUp = cleanOutcome === 'appointment_requested' || cleanOutcome === 'callback_needed' ? 'new' : 'none';

    // serviceCategory
    const setup = shopData.receptionistSetup || {};
    const shopServices = setup.services || [];
    const rawService = typeof service === 'string' ? service.trim() : '';
    const serviceCategory = matchServiceCategory(rawService, shopServices);

    // afterHours in America/New_York
    const shopHours = setup.hours || {};
    const afterHours = checkIsAfterHours(startAt, shopHours);

    const callDoc: any = {
      externalCallId: callId,
      shopId,
      locationId: locId,
      startedAt: startAt,
      durationSeconds: typeof durationSeconds === 'number' ? Math.max(0, durationSeconds) : 0,
      callerName: typeof callerName === 'string' ? callerName.trim() : '',
      callerPhone: typeof callerPhone === 'string' ? callerPhone.trim() : '',
      vehicleYear: typeof vehicleYear === 'string' ? vehicleYear.trim() : '',
      vehicleMake: typeof vehicleMake === 'string' ? vehicleMake.trim() : '',
      vehicleModel: typeof vehicleModel === 'string' ? vehicleModel.trim() : '',
      service: rawService,
      serviceCategory,
      summary: typeof summary === 'string' ? summary.trim() : '',
      outcome: cleanOutcome,
      afterHours,
      followUp,
      receivedAt: new Date().toISOString(),
    };

    if (typeof transcript === 'string' && transcript.trim()) {
      callDoc.transcript = transcript.trim();
    }
    if (typeof recordingUrl === 'string' && recordingUrl.trim()) {
      callDoc.recordingUrl = recordingUrl.trim();
    }

    // Write to shops/{shopId}/calls/{externalCallId}
    await adminDb
      .collection('shops')
      .doc(shopId)
      .collection('calls')
      .doc(callId)
      .set(callDoc, { merge: true });

    return res.json({ ok: true, callId });
  } catch (err: any) {
    console.error('Error handling /api/intake/call:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Mark call as handled
router.post('/shops/:shopId/calls/:callId/handled', async (req: Request, res: Response) => {
  try {
    const { shopId, callId } = req.params;
    const handledAt = new Date().toISOString();
    await adminDb
      .collection('shops')
      .doc(shopId)
      .collection('calls')
      .doc(callId)
      .update({
        followUp: 'done',
        handledAt,
      });
    return res.json({ ok: true, handledAt });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Admin: Intake Errors List
router.get('/admin/intake-errors', async (req: Request, res: Response) => {
  try {
    if (!checkAdminAuth(req)) {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }

    const errorsSnap = await adminDb
      .collection('intakeErrors')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();
    const errors = errorsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    return res.json({ errors });
  } catch (err: any) {
    console.error('Error reading intakeErrors:', err);
    return res.json({ errors: [] });
  }
});

// Admin: Test N8N Webhook Event
router.post('/admin/test-n8n', async (req: Request, res: Response) => {
  try {
    if (!checkAdminAuth(req)) {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }

    const result = await dispatchN8nEvent({ event: 'test', timestamp: new Date().toISOString() });
    return res.json({ success: result.success, result });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
