import React from 'react';
import { Home, PhoneCall, Headphones, User, Sparkles } from 'lucide-react';

export type ClientTab = 'home' | 'calls' | 'receptionist' | 'account';

interface ClientNavProps {
  activeTab: ClientTab;
  onChangeTab: (tab: ClientTab) => void;
  needsAttentionCount?: number;
}

export const ClientNav: React.FC<ClientNavProps> = ({
  activeTab,
  onChangeTab,
  needsAttentionCount = 0,
}) => {
  const navItems: { id: ClientTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'home', label: 'Home', icon: Home },
    {
      id: 'calls',
      label: 'Calls',
      icon: PhoneCall,
      badge: needsAttentionCount > 0 ? needsAttentionCount : undefined,
    },
    { id: 'receptionist', label: 'Receptionist', icon: Headphones },
    { id: 'account', label: 'Account', icon: User },
  ];

  return (
    <>
      {/* Desktop Left Sidebar */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 bg-white border border-gray-200 rounded-3xl p-4 shadow-sm h-fit sticky top-24 space-y-2">
        <div className="px-3 py-2 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Shop Portal
          </span>
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all min-h-[44px] ${
                isActive
                  ? 'bg-black text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-950 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#d6bcfa]' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-purple-600 text-white'
                      : 'bg-rose-500 text-white animate-pulse'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-2 py-1.5 shadow-lg flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 min-h-[44px] transition-colors relative ${
                isActive ? 'text-purple-700 font-bold' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-purple-700' : 'text-gray-400'}`} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
