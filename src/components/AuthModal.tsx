import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Phone, Building2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'signin' | 'signup';
  onClose: () => void;
  onSuccess: () => void;
  onSwitchToSignUp?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'signin',
  onClose,
  onSuccess,
  onSwitchToSignUp,
}) => {
  const {
    signUpWithEmail,
    signInWithEmail,
    signInWithGooglePopup,
    completeGoogleSignUp,
    resetPassword,
    savedAuditId,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot' | 'google_setup'>(initialMode);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setSuccessMessage(null);
    }
  }, [isOpen, initialMode]);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [shopName, setShopName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!firstName.trim() || !lastName.trim() || !shopName.trim() || !mobile.trim()) {
          throw new Error('Please fill in all fields.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }

        await signUpWithEmail({
          firstName,
          lastName,
          shopName,
          mobile,
          email,
          password,
          auditId: savedAuditId,
        });

        onSuccess();
      } else if (mode === 'signin') {
        await signInWithEmail(email, password);
        onSuccess();
      } else if (mode === 'forgot') {
        if (!email.trim()) throw new Error('Please enter your email address.');
        await resetPassword(email.trim());
        setSuccessMessage('Password reset link sent to your email. Check your inbox.');
      } else if (mode === 'google_setup') {
        if (!shopName.trim() || !mobile.trim()) {
          throw new Error('Please enter your shop name and phone number.');
        }
        await completeGoogleSignUp({
          shopName,
          mobile,
          firstName,
          lastName,
          auditId: savedAuditId,
        });
        onSuccess();
      }
    } catch (err: any) {
      let msg = err.message || 'An error occurred. Please try again.';
      if (msg.includes('auth/email-already-in-use')) {
        msg = 'An account with this email already exists. Please sign in instead.';
      } else if (msg.includes('auth/wrong-password') || msg.includes('auth/invalid-credential')) {
        msg = 'Incorrect email or password. Please check your credentials.';
      } else if (msg.includes('auth/user-not-found')) {
        msg = 'No account found with this email. Please sign up.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const { isNewUser } = await signInWithGooglePopup();
      if (isNewUser) {
        setMode('google_setup');
      } else {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Google sign-in could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1 mb-6">
          <div className="w-10 h-10 rounded-xl bg-black text-[#d6bcfa] font-bold text-lg flex items-center justify-center mx-auto mb-2">
            A
          </div>
          <h2 className="text-2xl font-bold text-gray-950">
            {mode === 'signup'
              ? 'Create Your Shop Account'
              : mode === 'signin'
              ? 'Sign In to Your Shop'
              : mode === 'forgot'
              ? 'Reset Your Password'
              : 'Complete Shop Details'}
          </h2>
          <p className="text-xs text-gray-500">
            {mode === 'signup'
              ? 'Start answering every customer call with AutoIntel Agent.'
              : mode === 'signin'
              ? 'Access your receptionist portal, calls, and settings.'
              : mode === 'forgot'
              ? "We'll send a password recovery link to your inbox."
              : 'Tell us your shop name to finish setting up your portal.'}
          </p>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* MAIN FORM */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mike"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:bg-white focus:border-black focus:outline-none min-h-[44px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Miller"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:bg-white focus:border-black focus:outline-none min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Shop Name
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Miller Precision Auto Repair"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:bg-white focus:border-black focus:outline-none min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Your Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                  <input
                    type="tel"
                    required
                    placeholder="e.g. (555) 234-5678"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:bg-white focus:border-black focus:outline-none min-h-[44px]"
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">Where call summaries and urgent transfers go.</p>
              </div>
            </>
          )}

          {mode === 'google_setup' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Shop Name
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Downtown Brake & Auto Care"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:bg-white focus:border-black focus:outline-none min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Owner Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                  <input
                    type="tel"
                    required
                    placeholder="e.g. (555) 789-0123"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:bg-white focus:border-black focus:outline-none min-h-[44px]"
                  />
                </div>
              </div>
            </>
          )}

          {mode !== 'google_setup' && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="owner@yourshop.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:bg-white focus:border-black focus:outline-none min-h-[44px]"
                />
              </div>
            </div>
          )}

          {mode !== 'forgot' && mode !== 'google_setup' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-gray-700">
                  Password
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setMode('forgot');
                    }}
                    className="text-xs text-purple-700 hover:text-purple-900 font-medium py-1"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:bg-white focus:border-black focus:outline-none min-h-[44px]"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-[#d6bcfa] hover:bg-[#c49efa] text-gray-950 font-bold text-sm rounded-xl min-h-[46px] flex items-center justify-center shadow-sm transition-all mt-4 disabled:opacity-50"
          >
            {loading ? (
              <span>Please wait...</span>
            ) : mode === 'signup' ? (
              <span>Create Account & Continue</span>
            ) : mode === 'signin' ? (
              <span>Sign In</span>
            ) : mode === 'forgot' ? (
              <span>Send Reset Email</span>
            ) : (
              <span>Save & Continue to Checkout</span>
            )}
          </button>
        </form>

        {/* GOOGLE SIGN IN (SECONDARY OPTION AS MANDATED: Email/Password must be default) */}
        {mode !== 'google_setup' && mode !== 'forgot' && (
          <div className="mt-5 pt-5 border-t border-gray-200">
            <div className="relative flex py-1 items-center justify-center mb-4">
              <span className="text-xs text-gray-400 uppercase tracking-wider bg-white px-2">
                Or continue with
              </span>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 px-4 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-800 min-h-[44px] flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>
          </div>
        )}

        {/* FOOTER SWITCH */}
        <div className="mt-6 text-center text-xs text-gray-600">
          {mode === 'signup' ? (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode('signin');
                }}
                className="font-bold text-black underline py-2 min-h-[44px] inline-flex items-center"
              >
                Sign in here
              </button>
            </p>
          ) : mode === 'signin' ? (
            <p>
              Need an account for your repair shop?{' '}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  if (onSwitchToSignUp) {
                    onSwitchToSignUp();
                  } else {
                    setMode('signup');
                  }
                }}
                className="font-bold text-black underline py-2 min-h-[44px] inline-flex items-center"
              >
                Sign up here
              </button>
            </p>
          ) : (
            <button
              type="button"
              onClick={() => {
                setError(null);
                setMode('signin');
              }}
              className="font-semibold text-black underline py-2 min-h-[44px] inline-flex items-center"
            >
              Back to Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
