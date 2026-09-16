import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useSettings } from '../context/SettingsContext.tsx';
import { ShopRecord, AppSettings } from '../types/index.ts';
import { AdminShopsList } from './admin/AdminShopsList.tsx';
import { AdminShopDetail } from './admin/AdminShopDetail.tsx';
import { AdminIntakeErrors } from './admin/AdminIntakeErrors.tsx';
import { AdminSettings } from './admin/AdminSettings.tsx';
import {
  ShieldAlert,
  Building2,
  AlertTriangle,
  Settings as SettingsIcon,
  Sparkles,
  RefreshCw,
  LogOut,
  UserCheck,
} from 'lucide-react';

interface AdminDashboardProps {
  onViewAsShop?: (shop: ShopRecord) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onViewAsShop }) => {
  const { currentUser, userRecord, isAdmin, logout } = useAuth();
  const { settings, updateSettings, saving } = useSettings();

  const [activeTab, setActiveTab] = useState<'shops' | 'intake_errors' | 'settings'>('shops');
  const [selectedShop, setSelectedShop] = useState<ShopRecord | null>(null);

  const [shops, setShops] = useState<ShopRecord[]>([]);
  const [loadingShops, setLoadingShops] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const adminEmail = currentUser?.email || 'AleshaTaylor1@gmail.com';

  const fetchShops = async () => {
    if (!isAdmin && currentUser?.email !== 'AleshaTaylor1@gmail.com') return;
    setLoadingShops(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/admin/shops?adminEmail=${encodeURIComponent(adminEmail)}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setShops(data.shops || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load shops.');
    } finally {
      setLoadingShops(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, [adminEmail, isAdmin]);

  if (!isAdmin && currentUser?.email !== 'AleshaTaylor1@gmail.com') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-gray-950">Unauthorized Access</h1>
        <p className="text-sm text-gray-600">
          The G2G Admin Panel is restricted exclusively to authorized administrators.
        </p>
        <button
          type="button"
          onClick={() => {
            window.location.href = '/portal';
          }}
          className="px-6 py-2.5 bg-black text-white font-bold text-xs rounded-xl min-h-[44px]"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* ADMIN TOP NAV */}
      <div className="bg-gray-950 text-white rounded-3xl p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#d6bcfa]">
                G2G Internal Admin
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>AutoIntel Operations</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-purple-900/60 text-purple-200 border border-purple-700/50">
                HighLevel
              </span>
            </h1>
            <p className="text-xs text-gray-400">
              Manage shop provisioning, HighLevel linking, verification tests, and change requests.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs bg-gray-900 border border-gray-800 px-3 py-2 rounded-xl">
              <UserCheck className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-gray-300 font-mono text-[11px]">{adminEmail}</span>
            </div>

            <button
              type="button"
              onClick={fetchShops}
              className="p-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-800 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
              title="Refresh shops list"
            >
              <RefreshCw className={`w-4 h-4 ${loadingShops ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* ADMIN SUB-TABS */}
        <div className="flex items-center gap-2 pt-6 border-t border-gray-800/80 mt-6 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('shops');
              setSelectedShop(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold min-h-[40px] flex items-center gap-2 transition-all ${
              activeTab === 'shops' && !selectedShop
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-gray-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Shops Directory ({shops.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('intake_errors');
              setSelectedShop(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold min-h-[40px] flex items-center gap-2 transition-all ${
              activeTab === 'intake_errors'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-gray-900'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Intake Errors</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('settings');
              setSelectedShop(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold min-h-[40px] flex items-center gap-2 transition-all ${
              activeTab === 'settings'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-gray-900'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Storefront Settings & n8n</span>
          </button>
        </div>
      </div>

      {/* ERROR NOTICE IF ANY */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl text-xs text-rose-800 flex items-center justify-between gap-3">
          <span>{errorMsg}</span>
          <button
            type="button"
            onClick={fetchShops}
            className="font-bold underline hover:text-rose-950 text-xs"
          >
            Retry
          </button>
        </div>
      )}

      {/* MAIN VIEW CONTENT */}
      {selectedShop ? (
        <AdminShopDetail
          shopId={selectedShop.id}
          adminEmail={adminEmail}
          onBack={() => {
            setSelectedShop(null);
            fetchShops();
          }}
          onViewAsShop={(shop) => {
            if (onViewAsShop) {
              onViewAsShop(shop);
            }
          }}
        />
      ) : activeTab === 'shops' ? (
        <AdminShopsList
          shops={shops}
          cutoffTime={settings.sameDayCutoff || '2:00 PM'}
          onSelectShop={(shop) => setSelectedShop(shop)}
          loading={loadingShops}
          onRefresh={fetchShops}
        />
      ) : activeTab === 'intake_errors' ? (
        <AdminIntakeErrors adminEmail={adminEmail} />
      ) : (
        <AdminSettings
          settings={settings}
          adminEmail={adminEmail}
          onSaveSettings={async (newSettings) => {
            await updateSettings(newSettings);
          }}
          saving={saving}
        />
      )}
    </div>
  );
};
