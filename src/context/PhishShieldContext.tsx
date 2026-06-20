import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { UrlAnalysis, analyzeUrl } from '@/lib/url-analyzer';
import { useSettings, Settings } from '@/hooks/use-settings';
import { useLists } from '@/hooks/use-lists';

interface PhishShieldContextType {
  history: UrlAnalysis[];
  addScan: (url: string) => UrlAnalysis;
  clearHistory: () => void;
  threatsToday: number;
  totalScans: number;
  safeCount: number;
  suspiciousCount: number;
  dangerousCount: number;
  settings: Settings;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  resetSettings: () => void;
  blacklist: string[];
  whitelist: string[];
  addToBlacklist: (d: string) => void;
  removeFromBlacklist: (d: string) => void;
  addToWhitelist: (d: string) => void;
  removeFromWhitelist: (d: string) => void;
  isBlacklisted: (url: string) => boolean;
  isWhitelisted: (url: string) => boolean;
}

const PhishShieldContext = createContext<PhishShieldContextType | null>(null);

const HISTORY_KEY = 'phishshield-history';

export function PhishShieldProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<UrlAnalysis[]>(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((item: any) => ({ ...item, timestamp: new Date(item.timestamp) }));
      }
    } catch {}
    return [];
  });

  const { settings, updateSetting, resetSettings } = useSettings();
  const lists = useLists();

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  const addScan = useCallback((url: string): UrlAnalysis => {
    // Check blacklist/whitelist overrides
    if (lists.isBlacklisted(url)) {
      const result: UrlAnalysis = {
        url, score: 100, level: 'dangerous',
        reasons: ['Domain is on your blacklist'],
        timestamp: new Date(),
        checks: [{ label: 'Blacklist', passed: false, detail: 'Manually blacklisted domain' }],
      };
      setHistory(prev => [result, ...prev].slice(0, 200));
      return result;
    }
    if (lists.isWhitelisted(url)) {
      const result: UrlAnalysis = {
        url, score: 0, level: 'safe',
        reasons: ['Domain is on your whitelist'],
        timestamp: new Date(),
        checks: [{ label: 'Whitelist', passed: true, detail: 'Manually whitelisted domain' }],
      };
      setHistory(prev => [result, ...prev].slice(0, 200));
      return result;
    }

    const result = analyzeUrl(url, settings.sensitivity);
    setHistory(prev => [result, ...prev].slice(0, 200));
    return result;
  }, [lists, settings.sensitivity]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  }, []);

  const threatsToday = history.filter(
    h => h.level !== 'safe' && h.timestamp.toDateString() === new Date().toDateString()
  ).length;

  const totalScans = history.length;
  const safeCount = history.filter(h => h.level === 'safe').length;
  const suspiciousCount = history.filter(h => h.level === 'suspicious').length;
  const dangerousCount = history.filter(h => h.level === 'dangerous').length;

  return (
    <PhishShieldContext.Provider value={{
      history, addScan, clearHistory, threatsToday,
      totalScans, safeCount, suspiciousCount, dangerousCount,
      settings, updateSetting, resetSettings,
      ...lists,
    }}>
      {children}
    </PhishShieldContext.Provider>
  );
}

export function usePhishShield() {
  const ctx = useContext(PhishShieldContext);
  if (!ctx) throw new Error('usePhishShield must be used within PhishShieldProvider');
  return ctx;
}
