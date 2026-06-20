import { useEffect, useState, useCallback, ReactNode } from 'react';
import { usePhishShield } from '@/context/PhishShieldContext';
import { ScanModal } from '@/components/ScanModal';
import { UrlAnalysis } from '@/lib/url-analyzer';

export function LinkInterceptor({ children }: { children: ReactNode }) {
  const { addScan, settings } = usePhishShield();
  const [modalOpen, setModalOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<UrlAnalysis | null>(null);
  const [interceptedUrl, setInterceptedUrl] = useState('');
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const handleClick = useCallback((e: MouseEvent) => {
    if (!settings.autoScan) return;
    const anchor = (e.target as HTMLElement).closest('a[href]') as HTMLAnchorElement | null;
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    if (!href) return;
    // Only intercept external links (http/https)
    if (!href.startsWith('http://') && !href.startsWith('https://')) return;
    // Don't intercept internal navigation
    if (anchor.getAttribute('data-no-intercept') === 'true') return;

    e.preventDefault();
    e.stopPropagation();
    setInterceptedUrl(href);
    setPendingHref(href);
    setResult(null);
    setScanning(true);
    setModalOpen(true);

    // Simulate scan delay
    setTimeout(() => {
      const scanResult = addScan(href);
      setResult(scanResult);
      setScanning(false);

      // Auto-close for safe links after a brief delay
      if (scanResult.level === 'safe') {
        setTimeout(() => {
          setModalOpen(false);
        }, 1200);
      }
    }, 800);
  }, [settings.autoScan, addScan]);

  useEffect(() => {
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [handleClick]);

  const handleProceed = () => {
    setModalOpen(false);
    if (pendingHref) window.open(pendingHref, '_blank');
  };

  const handleBlock = () => {
    setModalOpen(false);
    setPendingHref(null);
  };

  return (
    <>
      {children}
      <ScanModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        scanning={scanning}
        result={result}
        url={interceptedUrl}
        onProceed={handleProceed}
        onBlock={handleBlock}
      />
    </>
  );
}
