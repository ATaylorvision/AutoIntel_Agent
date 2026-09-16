import React from 'react';
import { useSettings } from '../context/SettingsContext.tsx';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { settings } = useSettings();
  const supportPhone = settings.supportPhone || '888-212-1629';

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <p className="font-semibold text-gray-900 text-sm">
              AutoIntel Agent by G2G Intelligence.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              24/7 AI Phone Answering for Independent Auto Repair Shops.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-600">
            <button
              onClick={() => onNavigate('home')}
              className="hover:text-black py-2 min-h-[44px] flex items-center transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('audit')}
              className="hover:text-black py-2 min-h-[44px] flex items-center transition-colors"
            >
              Missed-Call Audit
            </button>
            <button
              onClick={() => onNavigate('pricing')}
              className="hover:text-black py-2 min-h-[44px] flex items-center transition-colors"
            >
              Pricing
            </button>
            <button
              onClick={() => onNavigate('terms')}
              className="hover:text-black py-2 min-h-[44px] flex items-center transition-colors"
            >
              Terms of Service
            </button>
            <button
              onClick={() => onNavigate('privacy')}
              className="hover:text-black py-2 min-h-[44px] flex items-center transition-colors"
            >
              Privacy Policy
            </button>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-6 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 text-center sm:text-left">
            <p>© {new Date().getFullYear()} G2G Intelligence. All rights reserved.</p>
            <span className="hidden sm:inline text-gray-300">•</span>
            <p>Built by G2G Intelligence, Farmingdale, NY</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-center sm:text-right">
            <p>
              Questions? Call{' '}
              <a href={`tel:${supportPhone.replace(/[^0-9]/g, '')}`} className="font-semibold text-gray-800 underline">
                {supportPhone}
              </a>
            </p>
            <span className="text-gray-300">•</span>
            <p>
              Email:{' '}
              <a href="mailto:support@autointelagent.com" className="font-semibold text-gray-800 underline">
                support@autointelagent.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
