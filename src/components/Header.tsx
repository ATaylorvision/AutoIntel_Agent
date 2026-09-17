import React, { useState, useRef, useEffect } from 'react';
import { Phone, Menu, X, ShieldCheck, UserCheck, LogOut, ChevronDown, LayoutDashboard, Settings } from 'lucide-react';
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
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNav = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const supportPhone = settings.supportPhone || '888-212-1629';
  const shopDisplayName = shopRecord?.shopName || 'Precision Auto Care';

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
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-3.5 py-2 bg-[#faf5ff] border border-[#d6bcfa] text-gray-900 rounded-lg font-medium text-xs hover:bg-[#f3e8ff] transition-colors min-h-[44px]"
                aria-expanded={userDropdownOpen}
                aria-haspopup="true"
              >
                <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                <span className="max-w-[140px] truncate">{shopDisplayName}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-600 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50 animate-in fade-in-50 zoom-in-95 duration-100">
                  <div className="px-3.5 py-2 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-900 truncate">{shopDisplayName}</p>
                    <p className="text-[11px] text-gray-500 truncate">{currentUser.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleNav('dashboard')}
                    className="w-full text-left px-3.5 py-2 text-xs font-medium text-gray-700 hover:bg-[#faf5ff] hover:text-purple-900 flex items-center gap-2 transition-colors min-h-[36px]"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-purple-700" />
                    <span>Dashboard</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNav('dashboard-settings')}
                    className="w-full text-left px-3.5 py-2 text-xs font-medium text-gray-700 hover:bg-[#faf5ff] hover:text-purple-900 flex items-center gap-2 transition-colors min-h-[36px]"
                  >
                    <Settings className="w-3.5 h-3.5 text-purple-700" />
                    <span>Settings</span>
                  </button>
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logOut();
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors min-h-[36px]"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-600" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
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
                  className="text-xs text-red-600 font-semibold px-3 py-2 rounded min-h-[44px] flex items-center hover:bg-rose-50"
                >
                  Sign Out
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
