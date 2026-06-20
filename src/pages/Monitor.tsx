import { useState } from 'react';
import { Radio, ExternalLink, ShieldCheck, ShieldAlert, ShieldX, Globe } from 'lucide-react';
import { usePhishShield } from '@/context/PhishShieldContext';

const SAMPLE_SITES = [
  { name: 'Google', url: 'https://google.com', desc: 'Search engine - Safe' },
  { name: 'GitHub', url: 'https://github.com', desc: 'Code hosting - Safe' },
  { name: 'Suspicious Login', url: 'http://192.168.1.1/login/verify-account', desc: 'IP-based login page' },
  { name: 'Fake Bank', url: 'https://secure-bank-login-update.xyz/account', desc: 'Phishing bank page' },
  { name: 'Prize Scam', url: 'http://free-prize-winner.click/claim-reward-now', desc: 'Scam reward page' },
  { name: 'Netflix Phish', url: 'http://netflix-verify-account-update.tk/signin', desc: 'Fake Netflix page' },
  { name: 'PayPal Fake', url: 'https://paypal-secure-login.suspicious-domain.info/confirm', desc: 'PayPal phishing' },
  { name: 'Stack Overflow', url: 'https://stackoverflow.com', desc: 'Dev community - Safe' },
];

const levelIcons = { safe: ShieldCheck, suspicious: ShieldAlert, dangerous: ShieldX };
const levelColors = { safe: 'text-safe', suspicious: 'text-suspicious', dangerous: 'text-destructive' };

export default function Monitor() {
  const { history, settings } = usePhishShield();
  const recentScans = history.slice(0, 15);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Radio className="w-5 h-5 text-primary" />
        <h1 className="font-mono text-lg font-bold text-foreground">LIVE MONITOR</h1>
        <span className={`ml-auto flex items-center gap-1.5 font-mono text-[10px] ${settings.autoScan ? 'text-safe' : 'text-muted-foreground'}`}>
          <span className={`w-2 h-2 rounded-full ${settings.autoScan ? 'bg-safe animate-pulse' : 'bg-muted-foreground'}`} />
          {settings.autoScan ? 'AUTO-SCAN ON' : 'AUTO-SCAN OFF'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Simulated browser area */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card/50 glass overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border-b border-border">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-suspicious/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-safe/60" />
            </div>
            <div className="flex-1 rounded bg-muted/60 px-3 py-1 font-mono text-[10px] text-muted-foreground">
              <Globe className="w-3 h-3 inline mr-1.5" />
              simulated-browser://sample-page
            </div>
          </div>

          <div className="p-4 space-y-2">
            <p className="font-mono text-xs text-muted-foreground mb-3">
              Click any link below — PhishShield will intercept and scan it automatically:
            </p>
            {SAMPLE_SITES.map((site, i) => (
              <a
                key={i}
                href={site.url}
                className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 px-4 py-3 hover:bg-muted/40 hover:border-primary/30 transition-all group cursor-pointer"
              >
                <ExternalLink className="w-4 h-4 text-accent shrink-0 group-hover:text-primary transition-colors" />
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm text-foreground font-medium">{site.name}</p>
                  <p className="font-mono text-[10px] text-muted-foreground truncate">{site.url}</p>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono">{site.desc}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Live feed */}
        <div className="rounded-xl border border-border bg-card/50 glass p-4">
          <h2 className="font-mono text-xs font-bold text-foreground mb-3 tracking-wide">LIVE FEED</h2>
          {recentScans.length === 0 ? (
            <p className="text-xs text-muted-foreground font-mono text-center py-8">No scans yet. Click a link!</p>
          ) : (
            <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
              {recentScans.map((item, i) => {
                const Icon = levelIcons[item.level];
                return (
                  <div key={i} className="flex items-center gap-2 rounded-md bg-muted/20 px-2.5 py-2">
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${levelColors[item.level]}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-mono truncate text-foreground">{item.url}</p>
                      <p className="text-[9px] text-muted-foreground">{item.timestamp.toLocaleTimeString()}</p>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-muted-foreground">{item.score}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
