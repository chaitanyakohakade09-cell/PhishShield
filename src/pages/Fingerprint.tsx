import { useState, useEffect } from 'react';
import { Fingerprint, Shield, Lock, Clock, Globe, AlertTriangle, Eye, Cpu, Monitor, Wifi } from 'lucide-react';
import { collectFingerprint, BrowserFingerprint } from '@/lib/fingerprint';
import { PageTransition } from '@/components/PageTransition';

const severityColors = { low: 'text-safe', medium: 'text-suspicious', high: 'text-destructive' };
const privacyColors = { poor: 'text-destructive', moderate: 'text-suspicious', good: 'text-accent', excellent: 'text-safe' };

export default function FingerprintPage() {
  const [fp, setFp] = useState<BrowserFingerprint | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    collectFingerprint().then(data => {
      setFp(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <PageTransition>
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Fingerprint className="w-10 h-10 text-primary animate-pulse" />
          <p className="font-mono text-sm text-primary neon-text animate-pulse">COLLECTING FINGERPRINT...</p>
        </div>
      </PageTransition>
    );
  }

  if (!fp) return null;

  const infoItems = [
    { icon: Monitor, label: 'Screen', value: `${fp.screenResolution} · ${fp.colorDepth}-bit` },
    { icon: Globe, label: 'Language', value: fp.languages.join(', ') },
    { icon: Clock, label: 'Timezone', value: fp.timezone },
    { icon: Cpu, label: 'CPU Cores', value: fp.hardwareConcurrency.toString() },
    { icon: Wifi, label: 'Connection', value: fp.connectionType },
    { icon: Eye, label: 'Touch Points', value: fp.maxTouchPoints.toString() },
  ];

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Fingerprint className="w-5 h-5 text-primary" />
          <h1 className="font-mono text-lg font-bold text-foreground">BROWSER FINGERPRINT</h1>
        </div>

        {/* Privacy Score */}
        <div className="rounded-xl border border-border bg-card/50 glass p-6 flex items-center gap-6">
          <div className="relative">
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--primary))" strokeWidth="6"
                strokeDasharray={`${fp.privacyScore * 2.64} 264`} strokeLinecap="round"
                transform="rotate(-90 50 50)" className="transition-all duration-1000" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-mono text-xl font-bold text-foreground">{fp.privacyScore}</span>
            </div>
          </div>
          <div>
            <p className={`font-mono text-lg font-bold ${privacyColors[fp.privacyLevel]}`}>{fp.privacyLevel.toUpperCase()}</p>
            <p className="font-mono text-xs text-muted-foreground">Privacy Protection Score</p>
            <p className="font-mono text-[10px] text-muted-foreground mt-1">{fp.risks.length} exposure points detected</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Risks */}
          <div className="rounded-xl border border-border bg-card/50 glass p-5 space-y-3">
            <h2 className="font-mono text-xs font-bold text-foreground tracking-wide">PRIVACY RISKS</h2>
            {fp.risks.map((r, i) => (
              <div key={i} className="flex items-start gap-2 rounded-md bg-muted/20 px-3 py-2.5">
                <AlertTriangle className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${severityColors[r.severity]}`} />
                <div>
                  <p className="font-mono text-xs font-medium text-foreground">{r.label}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">{r.detail}</p>
                </div>
                <span className={`ml-auto text-[9px] font-mono font-bold uppercase ${severityColors[r.severity]}`}>{r.severity}</span>
              </div>
            ))}
          </div>

          {/* Info */}
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card/50 glass p-5 space-y-2">
              <h2 className="font-mono text-xs font-bold text-foreground tracking-wide">DEVICE INFO</h2>
              {infoItems.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-mono">
                  <item.icon className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span className="text-muted-foreground">{item.label}:</span>
                  <span className="text-foreground ml-auto">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-border bg-card/50 glass p-5 space-y-2">
              <h2 className="font-mono text-xs font-bold text-foreground tracking-wide">RENDERING</h2>
              <div className="space-y-1.5 font-mono text-[10px]">
                <p className="text-muted-foreground">GPU: <span className="text-foreground">{fp.webglRenderer.slice(0, 60)}</span></p>
                <p className="text-muted-foreground">Vendor: <span className="text-foreground">{fp.webglVendor}</span></p>
                <p className="text-muted-foreground">Canvas: <span className="text-foreground">{fp.canvasHash}</span></p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card/50 glass p-5 space-y-2">
              <h2 className="font-mono text-xs font-bold text-foreground tracking-wide">STORAGE & COOKIES</h2>
              <div className="flex flex-wrap gap-2">
                {Object.entries(fp.storageAvailable).map(([k, v]) => (
                  <span key={k} className={`text-[10px] font-mono px-2 py-1 rounded border ${v ? 'border-safe/30 text-safe bg-safe/5' : 'border-destructive/30 text-destructive bg-destructive/5'}`}>
                    {k}: {v ? '✓' : '✗'}
                  </span>
                ))}
                <span className={`text-[10px] font-mono px-2 py-1 rounded border ${fp.cookiesEnabled ? 'border-safe/30 text-safe bg-safe/5' : 'border-destructive/30 text-destructive bg-destructive/5'}`}>
                  cookies: {fp.cookiesEnabled ? '✓' : '✗'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card/50 glass p-4">
          <h2 className="font-mono text-[10px] font-bold text-foreground mb-1">USER AGENT</h2>
          <p className="font-mono text-[9px] text-muted-foreground break-all">{fp.userAgent}</p>
        </div>
      </div>
    </PageTransition>
  );
}
