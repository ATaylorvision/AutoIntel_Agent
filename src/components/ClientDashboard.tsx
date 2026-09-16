import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useSettings } from '../context/SettingsContext.tsx';
import { ShopRecord, CallRecord } from '../types/index.ts';
import { ClientNav, ClientTab } from './client/ClientNav.tsx';
import { HomeTab } from './client/HomeTab.tsx';
import { CallsTab } from './client/CallsTab.tsx';
import { ReceptionistTab } from './client/ReceptionistTab.tsx';
import { AccountTab } from './client/AccountTab.tsx';
import { CallDetailModal } from './client/CallDetailModal.tsx';
import { ReceptionistTester } from './ReceptionistTester.tsx';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase.ts';
import { Sparkles, X, Plus } from 'lucide-react';

interface ClientDashboardProps {
  onOpenWizard?: (step?: number) => void;
  viewingAsShop?: ShopRecord | null;
  onExitViewAsShop?: () => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  onOpenWizard,
  viewingAsShop,
  onExitViewAsShop,
}) => {
  const { userRecord, shopRecord: authShopRecord, refreshShop } = useAuth();
  const { settings } = useSettings();

  const shopRecord = viewingAsShop || authShopRecord;
  const isReadOnly = Boolean(viewingAsShop);

  const [activeTab, setActiveTab] = useState<ClientTab>('home');
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loadingCalls, setLoadingCalls] = useState(true);
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);
  const [testerOpen, setTesterOpen] = useState(false);
  const [markingHandled, setMarkingHandled] = useState(false);

  // Real-time Firestore listener on shops/{shopId}/calls
  useEffect(() => {
    if (!shopRecord?.id) {
      setLoadingCalls(false);
      return;
    }

    setLoadingCalls(true);
    try {
      const callsRef = collection(db, 'shops', shopRecord.id, 'calls');
      const q = query(callsRef, orderBy('startedAt', 'desc'));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: CallRecord[] = [];
          snapshot.forEach((d) => {
            list.push({ id: d.id, ...(d.data() as any) });
          });
          setCalls(list);
          setLoadingCalls(false);
        },
        (error) => {
          console.warn('Real-time listener warning:', error);
          setLoadingCalls(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error('Failed to attach real-time listener:', err);
      setLoadingCalls(false);
    }
  }, [shopRecord?.id]);

  // Mark Call as Handled
  const handleMarkHandled = async (callId: string) => {
    if (!shopRecord?.id) return;
    setMarkingHandled(true);
    const handledAt = new Date().toISOString();

    // Optimistically update local call list
    setCalls((prev) =>
      prev.map((c) => (c.id === callId ? { ...c, followUp: 'done', handledAt } : c))
    );
    if (selectedCall?.id === callId) {
      setSelectedCall((prev) => (prev ? { ...prev, followUp: 'done', handledAt } : null));
    }

    try {
      // 1. Try Firestore direct update
      const callDocRef = doc(db, 'shops', shopRecord.id, 'calls', callId);
      await updateDoc(callDocRef, {
        followUp: 'done',
        handledAt,
      });
    } catch (err) {
      console.warn('Direct Firestore update fallback, using API route:', err);
      // 2. Fallback to API route
      await fetch(`/api/shops/${shopRecord.id}/calls/${callId}/handled`, {
        method: 'POST',
      });
    } finally {
      setMarkingHandled(false);
    }
  };

  const needsAttentionCount = calls.filter((c) => c.followUp === 'new').length;

  if (!shopRecord) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Loading Shop Details...</h2>
        <p className="text-xs text-gray-500">Preparing your receptionist dashboard.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6 pb-24 md:pb-12">
      {/* Read-Only Admin Banner if viewing as shop */}
      {isReadOnly && (
        <div className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white px-4 py-3 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs sm:text-sm font-bold">
              Viewing as <span className="underline font-black">{shopRecord.shopName}</span> (Read-Only Admin Mode)
            </span>
          </div>
          {onExitViewAsShop && (
            <button
              type="button"
              onClick={onExitViewAsShop}
              className="px-3 py-1.5 bg-white text-purple-900 font-bold text-xs rounded-xl hover:bg-gray-100 min-h-[36px] transition-colors self-start sm:self-auto"
            >
              &larr; Back to Admin Panel
            </button>
          )}
        </div>
      )}

      {/* Main Layout: Desktop Sidebar + Content Panel */}
      <div className="flex flex-col md:flex-row items-start gap-6">
        {/* Navigation Sidebar (Desktop) / Bottom Bar (Mobile) */}
        <ClientNav
          activeTab={activeTab}
          onChangeTab={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          needsAttentionCount={needsAttentionCount}
        />

        {/* Content Pane */}
        <main className="flex-1 w-full min-w-0">
          {activeTab === 'home' && (
            <HomeTab
              shop={shopRecord}
              calls={calls}
              settings={settings}
              onOpenTest={() => setTesterOpen(true)}
              onSelectCall={(call) => setSelectedCall(call)}
              onGoToBilling={() => setActiveTab('account')}
              onContinueWizard={() => onOpenWizard && onOpenWizard(1)}
            />
          )}

          {activeTab === 'calls' && (
            <CallsTab
              calls={calls}
              onSelectCall={(call) => setSelectedCall(call)}
            />
          )}

          {activeTab === 'receptionist' && (
            <ReceptionistTab
              shop={shopRecord}
              onOpenTest={() => setTesterOpen(true)}
              onOpenWizard={onOpenWizard}
            />
          )}

          {activeTab === 'account' && (
            <AccountTab
              shop={shopRecord}
              settings={settings}
              userRecord={userRecord}
            />
          )}
        </main>
      </div>

      {/* Call Detail Modal */}
      {selectedCall && (
        <CallDetailModal
          call={selectedCall}
          onClose={() => setSelectedCall(null)}
          onMarkHandled={handleMarkHandled}
          markingHandled={markingHandled}
        />
      )}

      {/* Receptionist Tester Modal */}
      {testerOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setTesterOpen(false)}
              className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="pt-2">
              <ReceptionistTester />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
