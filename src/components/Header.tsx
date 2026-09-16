import React, { useState } from 'react';
import { Phone, Menu, X, ShieldCheck, UserCheck, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useSettings } from '../context/SettingsContext.tsx';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, onOpenAuth }) => {
  const { currentUser, userRecord, shopRecord, isPaid, isAdmin, logOut } = useAuth();
  const { settings } = useSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  const supportPhone = settings.supportPhone || '888-212-1629';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200">
      {/* Top emergency/call banner for quick tap-to-call */}
      <div className="bg-[#faf5ff] border-b border-[#e9d8fd] px-4 py-2 text-xs text-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-medium truncate">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Live Demo Phone Line:</span>
          <span className="text-gray-900 font-semibold">{supportPhone}</span>
        </div>
        <a
          href={`tel:${supportPhone.replace(/[^0-9]/g, '')}`}
          className="inline-flex items-center gap-1 font-semibold text-gray-900 hover:text-black transition-colors"
          title="Call our AI receptionist now"
        >
          <Phone className="w-3.5 h-3.5 text-black" />
          <span>Call Now</span>
        </a>
      </div>

      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => handleNav('home')}
          className="flex items-center gap-2.5 text-left focus:outline-none min-h-[44px]"
        >
          <div className="w-9 h-9 rounded-xl bg-black text-[#d6bcfa] flex items-center justify-center font-bold text-lg shadow-sm border border-gray-800">
            A
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-gray-900 block leading-tight">AutoIntel Agent</span>
            <span className="text-[11px] text-gray-500 font-medium block">by G2G Intelligence</span>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <button
            onClick={() => handleNav('home')}
            className={`hover:text-black min-h-[44px] px-2 flex items-center transition-colors ${
              currentView === 'home' ? 'text-black font-semibold' : ''
            }`}
          >
            Home
          </button>

          {currentUser && (
            <button
              onClick={() => handleNav('dashboard')}
              className={`hover:text-black min-h-[44px] px-2 flex items-center transition-colors ${
                currentView === 'dashboard' ? 'text-black font-semibold' : ''
              }`}
            >
              Dashboard
            </button>
          )}

          <button
            onClick={() => handleNav('audit')}
            className={`hover:text-black min-h-[44px] px-2 flex items-center transition-colors ${
              currentView === 'audit' ? 'text-black font-semibold' : ''
            }`}
          >
            Missed-Call Audit
          </button>
          <button
            onClick={() => handleNav('pricing')}
            className={`hover:text-black min-h-[44px] px-2 flex items-center transition-colors ${
              currentView === 'pricing' ? 'text-black font-semibold' : ''
            }`}
          >
            Pricing
          </button>

          {currentUser && (
            <button
              onClick={() => handleNav(isPaid ? 'portal' : 'checkout-gate')}
              className={`hover:text-black min-h-[44px] px-2 flex items-center transition-colors ${
                currentView === 'portal' || currentView === 'checkout-gate' ? 'text-black font-semibold' : ''
              }`}
            >
              My Shop
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => handleNav('admin')}
              className={`hover:text-black min-h-[44px] px-2 flex items-center gap-1 text-purple-700 font-semibold transition-colors ${
                currentView === 'admin' ? 'underline' : ''
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Admin
            </button>
          )}
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href={`tel:${supportPhone.replace(/[^0-9]/g, '')}`}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg min-h-[44px] transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-gray-900" />
            <span>{supportPhone}</span>
          </a>

          {currentUser ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleNav(isPaid ? 'portal' : 'checkout-gate')}
                className="flex items-center gap-2 px-3 py-2 bg-[#faf5ff] border border-[#d6bcfa] text-gray-900 rounded-lg font-medium text-xs hover:bg-[#f3e8ff] transition-colors min-h-[44px]"
              >
                <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                <span className="max-w-[120px] truncate">{shopRecord?.shopName || userRecord?.firstName || 'Portal'}</span>
              </button>
              <button
                onClick={() => logOut()}
                title="Log Out"
                className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('signin')}
                className="px-3.5 py-2 text-xs font-semibold text-gray-700 hover:text-black min-h-[44px] flex items-center transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="px-4 py-2 text-xs font-bold text-gray-900 bg-[#d6bcfa] hover:bg-[#c49efa] rounded-lg min-h-[44px] flex items-center shadow-sm transition-all"
              >
                Get Started
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <a
            href={`tel:${supportPhone.replace(/[^0-9]/g, '')}`}
            className="p-2.5 bg-gray-100 rounded-lg text-gray-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Call Receptionist"
          >
            <Phone className="w-4 h-4" />
          </a>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-lg text-gray-700 hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
          <button
            onClick={() => handleNav('home')}
            className={`w-full text-left py-2.5 px-3 rounded-lg text-sm font-medium min-h-[44px] flex items-center ${
              currentView === 'home' ? 'bg-[#faf5ff] text-gray-900 font-bold' : 'text-gray-700'
            }`}
          >
            Home
          </button>

          {currentUser && (
            <button
              onClick={() => handleNav('dashboard')}
              className={`w-full text-left py-2.5 px-3 rounded-lg text-sm font-medium min-h-[44px] flex items-center ${
                currentView === 'dashboard' ? 'bg-[#faf5ff] text-gray-900 font-bold' : 'text-gray-700'
              }`}
            >
              Dashboard
            </button>
          )}

          <button
            onClick={() => handleNav('audit')}
            className={`w-full text-left py-2.5 px-3 rounded-lg text-sm font-medium min-h-[44px] flex items-center ${
              currentView === 'audit' ? 'bg-[#faf5ff] text-gray-900 font-bold' : 'text-gray-700'
            }`}
          >
            Missed-Call Audit
          </button>
          <button
            onClick={() => handleNav('pricing')}
            className={`w-full text-left py-2.5 px-3 rounded-lg text-sm font-medium min-h-[44px] flex items-center ${
              currentView === 'pricing' ? 'bg-[#faf5ff] text-gray-900 font-bold' : 'text-gray-700'
            }`}
          >
            Pricing ($199/mo)
          </button>

          {currentUser ? (
            <>
              <button
                onClick={() => handleNav(isPaid ? 'portal' : 'checkout-gate')}
                className={`w-full text-left py-2.5 px-3 rounded-lg text-sm font-medium min-h-[44px] flex items-center gap-2 ${
                  currentView === 'portal' || currentView === 'checkout-gate' ? 'bg-[#faf5ff] font-bold text-gray-900' : 'text-gray-700'
                }`}
              >
                <UserCheck className="w-4 h-4 text-purple-600" />
                <span>Shop Portal ({shopRecord?.shopName || 'Account'})</span>
              </button>
              {isAdmin && (
                <button
                  onClick={() => handleNav('admin')}
                  className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-bold min-h-[44px] flex items-center gap-2 text-purple-700 bg-purple-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Panel</span>
                </button>
              )}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500 truncate max-w-[200px]">{currentUser.email}</span>
                <button
                  onClick={() => {
                    logOut();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-red-600 font-semibold px-3 py-2 rounded min-h-[44px] flex items-center"
                >
                  Log Out
                </button>
              </div>
            </>
          ) : (
            <div className="pt-2 border-t border-gray-100 space-y-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth('signin');
                }}
                className="w-full py-2.5 px-3 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 min-h-[44px] flex items-center justify-center"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth('signup');
                }}
                className="w-full py-2.5 px-3 bg-[#d6bcfa] hover:bg-[#c49efa] rounded-lg text-sm font-bold text-gray-900 min-h-[44px] flex items-center justify-center shadow-sm"
              >
                Get Started
              </button>
            </div>
          )}

          <div className="pt-2">
            <a
              href={`tel:${supportPhone.replace(/[^0-9]/g, '')}`}
              className="w-full py-2.5 px-3 bg-gray-100 rounded-lg text-xs font-semibold text-gray-800 flex items-center justify-center gap-2 min-h-[44px]"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call AI Receptionist: {supportPhone}</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
