import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, Building2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSwitchToSignIn: () => void;
}

export const SignUpModal: React.FC<SignUpModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onSwitchToSignIn,
}) => {
  const { signUpWithEmail, savedAuditId } = useAuth();

  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!shopName.trim()) {
      setError('Shop Name is required.');
      return;
    }
    if (!ownerName.trim()) {
      setError('Owner Name is required.');
      return;
    }
    if (!email.trim()) {
      setError('Email Address is required.');
      return;
    }
    if (!phone.trim()) {
      setError('Phone Number is required.');
      return;
    }

    const pwd = password.trim() || 'AutoIntel@2026!';
    if (pwd.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const nameParts = ownerName.trim().split(/\s+/);
      const firstName = nameParts[0] || 'Owner';
      const lastName = nameParts.slice(1).join(' ') || '';

      await signUpWithEmail({
        firstName,
        lastName,
        shopName: shopName.trim(),
        email: email.trim(),
        mobile: phone.trim(),
        password: pwd,
        auditId: savedAuditId,
      });

      onSuccess();
    } catch (err: any) {
      let msg = err.message || 'An error occurred while creating your account.';
      if (msg.includes('auth/email-already-in-use')) {
        msg = 'An account with this email already exists. Click "Sign in here" below.';
      } else if (msg.includes('auth/weak-password')) {
        msg = 'Password should be at least 6 characters.';
      } else if (msg.includes('auth/invalid-email')) {
        msg = 'Please enter a valid email address.';
      }
      setError(msg);
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
            Create Your Shop Account
          </h2>
          <p className="text-xs text-gray-500">
            Start answering every customer call with AutoIntel Agent.
          </p>
        </div>

        {/* Error Feedback */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Shop Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Shop Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="text"
                required
                placeholder="e.g. Precision Auto Care"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:bg-white focus:border-black focus:outline-none min-h-[44px]"
              />
            </div>
          </div>

          {/* Owner Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Owner Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="text"
                required
                placeholder="e.g. Mike Miller"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:bg-white focus:border-black focus:outline-none min-h-[44px]"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
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

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="tel"
                required
                placeholder="e.g. (555) 234-5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:bg-white focus:border-black focus:outline-none min-h-[44px]"
              />
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">Where call summaries and urgent alerts will arrive.</p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Password <span className="text-gray-400 font-normal">(at least 6 characters)</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:bg-white focus:border-black focus:outline-none min-h-[44px]"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-[#d6bcfa] hover:bg-[#c49efa] text-gray-950 font-bold text-sm rounded-xl min-h-[46px] flex items-center justify-center shadow-sm transition-all mt-4 disabled:opacity-50"
          >
            {loading ? <span>Creating Account...</span> : <span>Create My Account</span>}
          </button>
        </form>

        {/* Below Submit Button: Already have an account? Sign in here */}
        <div className="mt-5 text-center text-xs text-gray-600">
          <p>
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToSignIn}
              className="font-bold text-purple-800 hover:text-purple-950 underline py-2 min-h-[44px] inline-flex items-center"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
