import { useState, useRef } from 'react';
import { Shield, ShieldCheck, ShieldAlert, ShieldX, Search, Zap, AlertTriangle, Scan, Brain } from 'lucide-react';
import { ThreatGauge } from '@/components/ThreatGauge';
import { CheckList } from '@/components/CheckList';
import { ScanHistory } from '@/components/ScanHistory';
import { StatCards } from '@/components/StatCards';
import { ScanChart } from '@/components/ScanChart';
import { DomainReputationCard } from '@/components/DomainReputation';
import { usePhishShield } from '@/context/PhishShieldContext';
import { UrlAnalysis } from '@/lib/url-analyzer';
import { getDomainReputation, generateAiRiskSummary, DomainReputation } from '@/lib/ai-risk-summary';
import { PageTransition } from '@/components/PageTransition';
import { playSafeSound, playWarningSound, playDangerSound, playScanSound } from '@/lib/sounds';

const SAMPLE_URLS = [
  'https://google.com',
  'http://192.168.1.1/login/verify-account',
  'https://secure-bank-login-update.xyz/account',
  'https://github.com',
  'http://free-prize-winner.click/claim-reward-now',
];

export default function Dashboard() {
  const [url, setUrl] = useState('');
  const [currentAnalysis, setCurrentAnalysis] = useState<UrlAnalysis | null>(null);
  const [reputation, setReputation] = useState<DomainReputation | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const { history, addScan, threatsToday, settings } = usePhishShield();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleScan = async () => {
    if (!url.trim()) return;
    setScanning(true);
    if (settings.notificationSounds) playScanSound();
    await new Promise(r => setTimeout(r, 1200));
    const result = addScan(url.trim());
    const rep = getDomainReputation(url.trim());
    const summary = generateAiRiskSummary(result, rep);
    setCurrentAnalysis(result);
    setReputation(rep);
    setAiSummary(summary);
    setScanning(false);

    if (settings.notificationSounds) {
      if (result.level === 'safe') playSafeSound();
      else if (result.level === 'suspicious') playWarningSound();
      else playDangerSound();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleScan();
  };

  const StatusIcon = currentAnalysis
    ? currentAnalysis.level === 'safe' ? ShieldCheck
    : currentAnalysis.level === 'suspicious' ? ShieldAlert
    : ShieldX
    : Shield;

  const statusLabel = currentAnalysis
    ? currentAnalysis.level === 'safe' ? 'SAFE'
    : currentAnalysis.level === 'suspicious' ? 'SUSPICIOUS'
    : 'DANGEROUS'
    : 'READY';

  const statusColor = currentAnalysis
    ? currentAnalysis.level === 'safe' ? 'text-safe neon-text'
    : currentAnalysis.level === 'suspicious' ? 'text-suspicious'
    : 'text-destructive neon-text-red'
    : 'text-muted-foreground';

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header bar */}
        <div className="flex items-center justify-between">
          <h1 className="font-mono text-lg font-bold text-foreground">DASHBOARD</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
              <span className="font-mono text-xs text-foreground">{threatsToday}</span>
              <span className="text-[10px] text-muted-foreground">threats today</span>
            </div>
          </div>
        </div>

        <StatCards />

        {/* URL Input */}
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter URL to analyze..."
              className="w-full rounded-lg border border-border bg-muted/30 pl-10 pr-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
            />
            {scanning && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Scan className="w-4 h-4 text-primary animate-spin" />
              </div>
            )}
          </div>
          <button
            onClick={handleScan}
            disabled={scanning || !url.trim()}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-mono text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed neon-border"
          >
            <Zap className="w-4 h-4" />
            {scanning ? 'Scanning...' : 'Scan'}
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[10px] text-muted-foreground font-mono mr-1 self-center">Try:</span>
          {SAMPLE_URLS.map((s, i) => (
            <button
              key={i}
              onClick={() => { setUrl(s); inputRef.current?.focus(); }}
              className="text-[10px] font-mono px-2 py-1 rounded border border-border bg-muted/20 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors truncate max-w-[200px]"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 rounded-xl border border-border bg-card/50 glass p-6 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <StatusIcon className={`w-5 h-5 ${statusColor}`} />
              <span className={`font-mono text-sm font-bold tracking-widest ${statusColor}`}>{statusLabel}</span>
            </div>
            <ThreatGauge score={currentAnalysis?.score ?? 0} size={180} />
            {currentAnalysis && currentAnalysis.reasons.length > 0 && (
              <div className="w-full space-y-1">
                {currentAnalysis.reasons.map((r, i) => (
                  <p key={i} className="text-xs text-muted-foreground font-mono flex items-start gap-1.5">
                    <span className="text-destructive mt-0.5">›</span> {r}
                  </p>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-2 rounded-xl border border-border bg-card/50 glass p-6">
            <div className="flex items-center gap-2 mb-4">
              <Scan className="w-4 h-4 text-accent" />
              <h2 className="font-mono text-sm font-bold text-foreground tracking-wide">SECURITY CHECKS</h2>
            </div>
            <CheckList analysis={currentAnalysis} />
          </div>
        </div>

        {/* AI Risk Summary */}
        {aiSummary && (
          <div className="rounded-xl border border-border bg-card/50 glass p-5">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-primary" />
              <h2 className="font-mono text-xs font-bold text-foreground tracking-wide">AI RISK ANALYSIS</h2>
            </div>
            <p className="font-mono text-xs text-muted-foreground leading-relaxed">{aiSummary}</p>
          </div>
        )}

        {/* Domain Reputation */}
        {reputation && <DomainReputationCard reputation={reputation} />}

        {/* Activity Chart */}
        <div className="rounded-xl border border-border bg-card/50 glass p-6">
          <h2 className="font-mono text-sm font-bold text-foreground tracking-wide mb-4">SCAN ACTIVITY</h2>
          <ScanChart />
        </div>

        {/* Recent History */}
        <div className="rounded-xl border border-border bg-card/50 glass p-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-mono text-sm font-bold text-foreground tracking-wide">RECENT SCANS</h2>
            <span className="font-mono text-[10px] text-muted-foreground">({history.length})</span>
          </div>
          <ScanHistory history={history.slice(0, 10)} />
        </div>
      </div>
    </PageTransition>
  );
}
