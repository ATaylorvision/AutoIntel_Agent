import React, { useState } from 'react';
import { ShopRecord, AppSettings, UserRecord } from '../../types/index.ts';
import {
  User,
  CreditCard,
  Building2,
  Phone,
  Mail,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  LogOut,
  HelpCircle,
  KeyRound,
  MessageSquare,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { auth } from '../../lib/firebase.ts';
import { updatePassword, sendPasswordResetEmail } from 'firebase/auth';

interface AccountTabProps {
  shop: ShopRecord;
  settings: AppSettings;
  userRecord?: UserRecord | null;
}

export const AccountTab: React.FC<AccountTabProps> = ({ shop, settings, userRecord }) => {
  const { logOut, refreshShop, user } = useAuth();

  // Profile Form State
  const [firstName, setFirstName] = useState(userRecord?.firstName || '');
  const [lastName, setLastName] = useState(userRecord?.lastName || '');
  const [mobile, setMobile] = useState(userRecord?.mobile || shop.ownerMobile || '');
  const email = userRecord?.email || user?.email || '';

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [mobileError, setMobileError] = useState<string | null>(null);

  // Password Update State
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Stripe Portal State
  const [openingPortal, setOpeningPortal] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const supportPhone = settings.supportPhone || '888-212-1629';
  const supportEmail = settings.supportEmail || 'support@autointelagent.com';

  const isPasswordProvider = user?.providerData.some((p) => p.providerId === 'password');

  // Human-friendly subscription label
  const getSubscriptionStatusLabel = (): { text: string; isError: boolean } => {
    if (shop.subscriptionStatus === 'past_due') {
      return { text: 'Payment Past Due', isError: true };
    }
    if (shop.subscriptionStatus === 'canceled') {
      return { text: 'Subscription Canceled', isError: true };
    }
    if (shop.status === 'live' || shop.subscriptionStatus === 'active') {
      return { text: 'Active (Renews monthly)', isError: false };
    }
    if (shop.status === 'provisioning') {
      return { text: 'Setup Active (Provisioning live line)', isError: false };
    }
    if (shop.status === 'paid_setup') {
      return { text: 'Paid Setup Active', isError: false };
    }
    return { text: 'Active ($199/month)', isError: false };
  };

  const statusLabel = getSubscriptionStatusLabel();

  // Save Profile Handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMobileError(null);
    setProfileFeedback(null);

    const cleanMobile = mobile.replace(/\D/g, '');
    if (cleanMobile.length < 10) {
      setMobileError('Please enter a valid 10-digit mobile phone number.');
      return;
    }

    setSavingProfile(true);
    try {
      const res = await fetch('/api/users/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user?.uid,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          mobile: mobile.trim(),
          shopId: shop.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile.');
      }

      await refreshShop();
      setProfileFeedback({
        type: 'success',
        message: 'Your profile has been saved successfully.',
      });

      setTimeout(() => setProfileFeedback(null), 5000);
    } catch (err: any) {
      setProfileFeedback({
        type: 'error',
        message: err.message || 'Unable to update profile. Please try again.',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  // Change Password Handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);

    if (newPassword.length < 6) {
      setPasswordFeedback({
        type: 'error',
        message: 'Password must be at least 6 characters long.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordFeedback({
        type: 'error',
        message: 'Passwords do not match.',
      });
      return;
    }

    setUpdatingPassword(true);
    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
        setPasswordFeedback({
          type: 'success',
          message: 'Your password has been changed successfully.',
        });
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordSection(false);
      }
    } catch (err: any) {
      if (err.code === 'auth/requires-recent-login') {
        setPasswordFeedback({
          type: 'error',
          message: 'For security, please send a password reset link to your email or sign out and back in first.',
        });
      } else {
        setPasswordFeedback({
          type: 'error',
          message: err.message || 'Unable to change password. Please try again.',
        });
      }
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleSendResetEmail = async () => {
    if (!email) return;
    setUpdatingPassword(true);
    setPasswordFeedback(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setPasswordFeedback({
        type: 'success',
        message: `Password reset email sent to ${email}. Check your inbox.`,
      });
    } catch (err: any) {
      setPasswordFeedback({
        type: 'error',
        message: err.message || 'Failed to send password reset email.',
      });
    } finally {
      setUpdatingPassword(false);
    }
  };

  // Open Stripe Billing Portal
  const handleOpenStripePortal = async () => {
    setOpeningPortal(true);
    setPortalError(null);
    try {
      const res = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: shop.stripeCustomerId,
          shopId: shop.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create billing session');
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setPortalError(err.message || 'Unable to open Stripe billing portal. Please contact support.');
    } finally {
      setOpeningPortal(false);
    }
  };

  const faqs = [
    {
      q: 'How do I test my receptionist?',
      a: 'Go to the Receptionist or Home tab and click "Test My AI Receptionist". You can run through real scenarios like scheduling a brake inspection, asking about warranty policies, or calling after hours.',
    },
    {
      q: 'How do I change my hours or services?',
      a: 'Open the Receptionist tab and tap "Edit" on the Hours or Services section. When you save your changes, our team reviews and updates your receptionist prompt, texting you as soon as it goes live.',
    },
    {
      q: 'What happens when a call comes in after hours?',
      a: 'Your receptionist politely informs callers that the shop is currently closed, shares your next open hours, answers questions about common services, and offers to capture their appointment request or transfer emergency towing calls according to your preferences.',
    },
    {
      q: 'How do I update my card or cancel?',
      a: 'Click the "Manage billing" button above. You will be taken to Stripe\'s secure billing portal where you can update your debit/credit card, download tax invoices, or manage your subscription anytime.',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. TOP HEADER & SHOP BADGE */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-black text-[#d6bcfa] rounded-2xl flex items-center justify-center font-black text-xl shrink-0">
            {shop.shopName ? shop.shopName.charAt(0).toUpperCase() : 'S'}
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-950">{shop.shopName}</h2>
            <p className="text-xs text-gray-500">
              Account managed by {shop.ownerName || 'Shop Owner'} • {shop.ownerMobile}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => logOut()}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl min-h-[44px] flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4 text-gray-600" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* 2. PROFILE SECTION */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="border-b border-gray-100 pb-3">
          <h3 className="text-base font-bold text-gray-950 flex items-center gap-2">
            <User className="w-4 h-4 text-purple-700" />
            <span>Owner Profile</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Your personal contact information for call summaries and account security.
          </p>
        </div>

        {profileFeedback && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
              profileFeedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-rose-50 border-rose-300 text-rose-950'
            }`}
          >
            {profileFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{profileFeedback.message}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Mike"
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Miller"
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm min-h-[44px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed min-h-[44px]"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">Primary login identifier</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Phone Number</label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => {
                  setMobile(e.target.value);
                  setMobileError(null);
                }}
                placeholder="e.g. 516-555-0199"
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm min-h-[44px]"
              />
              {mobileError && <p className="text-xs text-rose-600 mt-1">{mobileError}</p>}
              <span className="text-[11px] text-gray-400 mt-1 block">Receives instant call summaries and alerts</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="py-2.5 px-5 bg-black hover:bg-gray-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl min-h-[44px] flex items-center gap-2 shadow-sm transition-all"
            >
              {savingProfile ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#d6bcfa]" />
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#d6bcfa]" />
                  <span>Save Profile</span>
                </>
              )}
            </button>

            {isPasswordProvider && (
              <button
                type="button"
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1.5 min-h-[44px]"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{showPasswordSection ? 'Hide Password Settings' : 'Change Password'}</span>
              </button>
            )}
          </div>
        </form>

        {/* Change Password Sub-form */}
        {showPasswordSection && isPasswordProvider && (
          <div className="mt-4 p-4 bg-[#faf5ff] border border-[#e9d8fd] rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-purple-950 uppercase tracking-wide">
                Update Account Password
              </h4>
              <button
                type="button"
                onClick={handleSendResetEmail}
                disabled={updatingPassword}
                className="text-[11px] text-purple-700 font-semibold hover:underline"
              >
                Or send reset link via email
              </button>
            </div>

            {passwordFeedback && (
              <div
                className={`p-3 rounded-xl border text-xs ${
                  passwordFeedback.type === 'success'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-rose-50 border-rose-300 text-rose-950'
                }`}
              >
                {passwordFeedback.message}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs min-h-[44px]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={updatingPassword || !newPassword}
                className="py-2 px-4 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl min-h-[40px] flex items-center gap-2 transition-all"
              >
                {updatingPassword ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-200" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* 3. BILLING SECTION */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-gray-950 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-purple-700" />
              <span>Billing & Subscription</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              AutoIntel Agent, $199/month
            </p>
          </div>

          <div>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                statusLabel.isError
                  ? 'bg-rose-50 text-rose-800 border-rose-300'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  statusLabel.isError ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
                }`}
              />
              <span>{statusLabel.text}</span>
            </span>
          </div>
        </div>

        {shop.subscriptionStatus === 'past_due' && (
          <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl text-xs text-rose-950 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Payment Update Required</p>
              <p className="text-rose-800 mt-0.5">
                Your recent payment attempt did not clear. Please click Manage Billing below to update your payment method.
              </p>
            </div>
          </div>
        )}

        {portalError && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
            {portalError}
          </div>
        )}

        <div className="pt-2">
          <button
            type="button"
            onClick={handleOpenStripePortal}
            disabled={openingPortal}
            className="py-3 px-5 bg-black hover:bg-gray-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl min-h-[44px] flex items-center gap-2 shadow-sm transition-all"
          >
            {openingPortal ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#d6bcfa]" />
                <span>Opening Stripe Customer Portal...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 text-[#d6bcfa]" />
                <span>Manage billing</span>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400 ml-1" />
              </>
            )}
          </button>
          <p className="text-[11px] text-gray-400 mt-2">
            Opens Stripe to securely update your card, view past invoices, download tax receipts, or cancel your subscription.
          </p>
        </div>
      </div>

      {/* 4. HELP & CONTACT SECTION */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-gray-950 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-700" />
            <span>Help & Concierge Support</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Our automotive operations team is available to assist with phone carrier forwarding, custom voice instructions, or account changes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <a
            href={`sms:${supportPhone.replace(/[^0-9]/g, '')}`}
            className="p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl flex items-center gap-3 transition-colors min-h-[44px]"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide block">
                Text us
              </span>
              <span className="text-sm font-black text-gray-950 block">{supportPhone}</span>
            </div>
          </a>

          <a
            href={`mailto:${supportEmail}`}
            className="p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl flex items-center gap-3 transition-colors min-h-[44px]"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide block">
                Email us
              </span>
              <span className="text-sm font-black text-gray-950 block truncate">{supportEmail}</span>
            </div>
          </a>
        </div>

        {/* Short FAQ Accordion */}
        <div className="pt-4 border-t border-gray-100 space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-purple-700" />
            <span>Frequently Asked Questions</span>
          </h4>

          <div className="space-y-2">
            {faqs.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-2xl overflow-hidden bg-white"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-3.5 text-left flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors min-h-[44px]"
                  >
                    <span className="text-xs font-bold text-gray-900">{item.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="p-3.5 pt-0 text-xs text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/50">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
