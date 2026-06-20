import { useState } from 'react';
import { Mail, ShieldCheck, ShieldAlert, ShieldX, AlertTriangle, Link, User, FileWarning, Type, Send } from 'lucide-react';
import { analyzeEmail, EmailAnalysis } from '@/lib/email-analyzer';
import { PageTransition } from '@/components/PageTransition';

const severityColors = { low: 'text-safe', medium: 'text-suspicious', high: 'text-destructive' };
const typeIcons = { url: Link, urgency: AlertTriangle, impersonation: User, grammar: Type, attachment: FileWarning, sender: Send };

const SAMPLE_EMAILS = [
  { label: 'Phishing Email', text: `Dear Customer,\n\nYour PayPal account has been suspended due to unusual activity. You must verify your identity immediately to restore access.\n\nClick here to verify: http://paypal-secure-login.suspicious-domain.info/confirm\n\nFailure to comply within 24 hours will result in permanent account suspension.\n\nPayPal Security Team` },
  { label: 'Legitimate Email', text: `Hi there,\n\nThank you for your recent purchase! Your order #12345 has been shipped and should arrive within 3-5 business days.\n\nYou can track your package at https://amazon.com/track/12345\n\nBest regards,\nCustomer Support` },
  { label: 'SMS Scam', text: `URGENT: Your bank account has been locked! Verify now at http://192.168.1.1/login/verify-account or your funds will be frozen. Act immediately! Your password needs to be updated.` },
];

export default function EmailScanner() {
  const [text, setText] = useState('');
  const [sender, setSender] = useState('');
  const [result, setResult] = useState<EmailAnalysis | null>(null);
  const [scanning, setScanning] = useState(false);

  const handleScan = async () => {
    if (!text.trim()) return;
    setScanning(true);
    await new Promise(r => setTimeout(r, 800));
    const analysis = analyzeEmail(text, sender || undefined);
    setResult(analysis);
    setScanning(false);
  };

  const StatusIcon = result ? result.level === 'safe' ? ShieldCheck : result.level === 'suspicious' ? ShieldAlert : ShieldX : Mail;
  const statusColor = result ? result.level === 'safe' ? 'text-safe' : result.level === 'suspicious' ? 'text-suspicious' : 'text-destructive' : 'text-primary';

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Mail className="w-5 h-5 text-primary" />
          <h1 className="font-mono text-lg font-bold text-foreground">EMAIL / SMS SCANNER</h1>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <span className="text-[10px] text-muted-foreground font-mono mr-1 self-center">Try:</span>
          {SAMPLE_EMAILS.map((s, i) => (
            <button key={i} onClick={() => setText(s.text)} className="text-[10px] font-mono px-2 py-1 rounded border border-border bg-muted/20 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
              {s.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-3">
            <input
              type="email"
              value={sender}
              onChange={e => setSender(e.target.value)}
              placeholder="Sender email (optional)"
              className="w-full rounded-lg border border-border bg-muted/30 px-4 py-2.5 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Paste email body or SMS text here..."
              rows={12}
              className="w-full rounded-lg border border-border bg-muted/30 px-4 py-3 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
            />
            <button
              onClick={handleScan}
              disabled={scanning || !text.trim()}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 font-mono text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 disabled:opacity-40 neon-border"
            >
              {scanning ? 'Analyzing...' : 'Analyze Message'}
            </button>
          </div>

          <div className="rounded-xl border border-border bg-card/50 glass p-5">
            {!result && !scanning && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground font-mono text-xs gap-3 py-12">
                <Mail className="w-8 h-8 opacity-30" />
                <p>Paste an email or SMS to analyze</p>
              </div>
            )}

            {scanning && (
              <div className="flex flex-col items-center justify-center h-full gap-3 py-12">
                <Mail className="w-8 h-8 text-primary animate-pulse" />
                <p className="font-mono text-sm text-primary neon-text animate-pulse">ANALYZING...</p>
              </div>
            )}

            {result && !scanning && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <StatusIcon className={`w-8 h-8 ${statusColor}`} />
                  <div>
                    <p className={`font-mono text-lg font-bold ${statusColor}`}>{result.level.toUpperCase()}</p>
                    <p className="font-mono text-2xl font-bold text-foreground">{result.score}/100</p>
                  </div>
                </div>

                <p className="font-mono text-xs text-muted-foreground leading-relaxed">{result.summary}</p>

                {result.findings.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-mono text-[10px] font-bold text-foreground tracking-wide">FINDINGS</h3>
                    {result.findings.map((f, i) => {
                      const Icon = typeIcons[f.type] || AlertTriangle;
                      return (
                        <div key={i} className="flex items-start gap-2 rounded-md bg-muted/20 px-3 py-2">
                          <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${severityColors[f.severity]}`} />
                          <div>
                            <span className={`text-[10px] font-mono font-bold uppercase ${severityColors[f.severity]}`}>{f.severity}</span>
                            <p className="text-xs font-mono text-foreground">{f.detail}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {result.extractedUrls.length > 0 && (
                  <div className="space-y-1">
                    <h3 className="font-mono text-[10px] font-bold text-foreground tracking-wide">EXTRACTED URLS</h3>
                    {result.extractedUrls.map((u, i) => (
                      <p key={i} className="font-mono text-[10px] text-muted-foreground truncate">
                        <span className="text-accent">›</span> {u}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
