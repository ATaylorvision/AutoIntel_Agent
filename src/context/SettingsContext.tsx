import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase.ts';
import { AppSettings } from '../types/index.ts';

const defaultSettings: AppSettings = {
  sameDayCutoff: '2:00 PM',
  timezone: 'America/New_York',
  supportPhone: '888-212-1629',
  supportEmail: 'support@autointelagent.com',
};

interface SettingsContextType {
  settings: AppSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  loading: false,
  refreshSettings: async () => {},
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings/app');
      if (res.ok) {
        const data = await res.json();
        setSettings((prev) => ({ ...prev, ...data }));
      }
    } catch (e) {
      console.warn('Failed to fetch settings from API, using fallback', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();

    // Listen to real-time updates from Firestore if available
    try {
      const unsub = onSnapshot(
        doc(db, 'settings', 'app'),
        (snapshot) => {
          if (snapshot.exists()) {
            setSettings((prev) => ({ ...prev, ...(snapshot.data() as AppSettings) }));
          }
        },
        (error) => {
          console.warn('Firestore settings listener error (falling back to API):', error);
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn('Firestore snapshot setup skipped:', e);
    }
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
