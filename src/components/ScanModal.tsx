import { useEffect, useState } from 'react';
import { ShieldCheck, ShieldAlert, ShieldX, Scan, X } from 'lucide-react';
import { UrlAnalysis } from '@/lib/url-analyzer';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface ScanModalProps {
  open: boolean;
  onClose: () => void;
  scanning: boolean;
  result: UrlAnalysis | null;
  url: string;
  onProceed?: () => void;
  onBlock?: () => void;
}

export function ScanModal({ open, onClose, scanning, result, url, onProceed, onBlock }: ScanModalProps) {
  const Icon = result
    ? result.level === 'safe' ? ShieldCheck
    : result.level === 'suspicious' ? ShieldAlert
    : ShieldX
    : Scan;

  const colorClass = result
    ? result.level === 'safe' ? 'text-safe'
    : result.level === 'suspicious' ? 'text-suspicious'
    : 'text-destructive'
    : 'text-primary';

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogTitle className="sr-only">URL Scan Result</DialogTitle>
        <div className="flex flex-col items-center gap-4 py-2">
          <div className={`relative ${scanning ? 'animate-spin' : ''}`}>
            <Icon className={`w-12 h-12 ${colorClass}`} />
          </div>

          <p className="font-mono text-xs text-muted-foreground truncate max-w-full">{url}</p>

          {scanning && (
            <div className="flex flex-col items-center gap-2">
              <p className="font-mono text-sm text-primary neon-text animate-pulse">SCANNING...</p>
              <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary animate-pulse rounded-full" style={{ width: '60%' }} />
              </div>
            </div>
          )}

          {result && !scanning && (
            <>
              <div className="text-center">
                <p className={`font-mono text-lg font-bold ${colorClass} ${result.level === 'safe' ? 'neon-text' : result.level === 'dangerous' ? 'neon-text-red' : ''}`}>
                  {result.level.toUpperCase()}
                </p>
                <p className="font-mono text-2xl font-bold text-foreground">{result.score}/100</p>
              </div>

              {result.reasons.map((r, i) => (
                <p key={i} className="text-xs text-muted-foreground font-mono">
                  <span className="text-destructive">›</span> {r}
                </p>
              ))}

              <div className="flex gap-2 mt-2 w-full">
                {result.level === 'safe' ? (
                  <button onClick={onClose} className="flex-1 rounded-lg bg-safe/20 text-safe font-mono text-xs py-2.5 hover:bg-safe/30 transition-colors">
                    OK — Safe
                  </button>
                ) : (
                  <>
                    <button onClick={onBlock || onClose} className="flex-1 rounded-lg bg-destructive/20 text-destructive font-mono text-xs py-2.5 hover:bg-destructive/30 transition-colors">
                      Block
                    </button>
                    <button onClick={onProceed || onClose} className="flex-1 rounded-lg bg-muted text-muted-foreground font-mono text-xs py-2.5 hover:bg-muted/80 transition-colors">
                      Proceed Anyway
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
