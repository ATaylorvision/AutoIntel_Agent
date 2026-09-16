import React, { useState } from 'react';
import { CreditCard, Lock, Shield, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface TestModeCheckoutProps {
  shopId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const TestModeCheckout: React.FC<TestModeCheckoutProps> = ({ shopId, onSuccess, onCancel }) => {
  const { userRecord, shopRecord, refreshShop } = useAuth();
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('123');
  const [name, setName] = useState(userRecord?.firstName ? `${userRecord.firstName} ${userRecord.lastName}` : 'Shop Owner');

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/checkout/simulate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopId }),
      });
      if (!res.ok) {
        throw new Error('Payment processing failed');
      }
      await refreshShop();
      onSuccess();
    } catch (err) {
      alert('Payment simulation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="bg-white border-2 border-black rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
              Stripe Test Mode
            </span>
            <h1 className="text-xl font-black text-gray-950 mt-1">AutoIntel Agent Checkout</h1>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-gray-950">$498.00</span>
            <span className="text-xs text-gray-500 block">Due today</span>
          </div>
        </div>

        {/* ORDER SUMMARY */}
        <div className="bg-gray-50 rounded-xl p-4 text-xs space-y-2 border border-gray-200">
          <div className="flex justify-between font-medium text-gray-800">
            <span>AutoIntel Agent (Monthly)</span>
            <span>$199.00 / mo</span>
          </div>
          <div className="flex justify-between font-medium text-gray-800">
            <span>One-Time System Setup Fee</span>
            <span>$299.00</span>
          </div>
          <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-950">
            <span>Total billed today</span>
            <span>$498.00</span>
          </div>
        </div>

        {/* PAYMENT FORM */}
        <form onSubmit={handlePay} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Cardholder Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Card Information (Test Mode)
            </label>
            <div className="relative">
              <CreditCard className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono font-medium min-h-[44px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Expires
              </label>
              <input
                type="text"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono font-medium min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                CVC
              </label>
              <input
                type="text"
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono font-medium min-h-[44px]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 bg-black hover:bg-gray-800 text-white font-bold text-sm rounded-xl min-h-[48px] flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
          >
            <Lock className="w-4 h-4 text-[#d6bcfa]" />
            <span>{loading ? 'Processing Payment...' : 'Pay $498.00 & Activate Receptionist'}</span>
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-semibold text-gray-500 hover:text-black py-2 min-h-[44px]"
          >
            Cancel and return to Pricing
          </button>
        </div>
      </div>
    </div>
  );
};
