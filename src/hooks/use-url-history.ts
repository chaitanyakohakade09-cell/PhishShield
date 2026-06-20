import { useState, useCallback } from 'react';
import { UrlAnalysis, analyzeUrl } from '@/lib/url-analyzer';

export function useUrlHistory() {
  const [history, setHistory] = useState<UrlAnalysis[]>([]);

  const addScan = useCallback((url: string): UrlAnalysis => {
    const result = analyzeUrl(url);
    setHistory(prev => [result, ...prev].slice(0, 50));
    return result;
  }, []);

  const threatsToday = history.filter(
    h => h.level !== 'safe' && h.timestamp.toDateString() === new Date().toDateString()
  ).length;

  const clearHistory = useCallback(() => setHistory([]), []);

  return { history, addScan, threatsToday, clearHistory };
}
