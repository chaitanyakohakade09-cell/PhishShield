import { useState, useCallback, useEffect } from 'react';

const BL_KEY = 'phishshield-blacklist';
const WL_KEY = 'phishshield-whitelist';

function loadList(key: string): string[] {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

export function useLists() {
  const [blacklist, setBlacklist] = useState<string[]>(() => loadList(BL_KEY));
  const [whitelist, setWhitelist] = useState<string[]>(() => loadList(WL_KEY));

  useEffect(() => { localStorage.setItem(BL_KEY, JSON.stringify(blacklist)); }, [blacklist]);
  useEffect(() => { localStorage.setItem(WL_KEY, JSON.stringify(whitelist)); }, [whitelist]);

  const addToBlacklist = useCallback((domain: string) => {
    const d = domain.toLowerCase().trim();
    if (d && !blacklist.includes(d)) {
      setBlacklist(prev => [...prev, d]);
      setWhitelist(prev => prev.filter(x => x !== d));
    }
  }, [blacklist]);

  const removeFromBlacklist = useCallback((domain: string) => {
    setBlacklist(prev => prev.filter(x => x !== domain));
  }, []);

  const addToWhitelist = useCallback((domain: string) => {
    const d = domain.toLowerCase().trim();
    if (d && !whitelist.includes(d)) {
      setWhitelist(prev => [...prev, d]);
      setBlacklist(prev => prev.filter(x => x !== d));
    }
  }, [whitelist]);

  const removeFromWhitelist = useCallback((domain: string) => {
    setWhitelist(prev => prev.filter(x => x !== domain));
  }, []);

  const isBlacklisted = useCallback((url: string) => {
    try {
      const hostname = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
      return blacklist.some(d => hostname.includes(d));
    } catch { return false; }
  }, [blacklist]);

  const isWhitelisted = useCallback((url: string) => {
    try {
      const hostname = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
      return whitelist.some(d => hostname.includes(d));
    } catch { return false; }
  }, [whitelist]);

  return {
    blacklist, whitelist,
    addToBlacklist, removeFromBlacklist,
    addToWhitelist, removeFromWhitelist,
    isBlacklisted, isWhitelisted,
  };
}
