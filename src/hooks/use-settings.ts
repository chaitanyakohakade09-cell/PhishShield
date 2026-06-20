import { useState, useCallback, useEffect } from 'react';

export interface Settings {
  notificationSounds: boolean;
  sensitivity: number; // 0.5 - 2.0 multiplier
  autoScan: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  notificationSounds: true,
  sensitivity: 1.0,
  autoScan: true,
};

const STORAGE_KEY = 'phishshield-settings';

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch { return DEFAULT_SETTINGS; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSetting = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return { settings, updateSetting, resetSettings };
}
