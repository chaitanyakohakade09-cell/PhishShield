import { Shield, ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react';
import { UrlAnalysis } from '@/lib/url-analyzer';

interface CheckListProps {
  analysis: UrlAnalysis | null;
}

export function CheckList({ analysis }: CheckListProps) {
  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-3">
        <Shield className="w-10 h-10 opacity-40" />
        <p className="font-mono text-sm">Enter a URL to begin scanning</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {analysis.checks.map((check, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-md border border-border bg-muted/30 px-3 py-2.5 transition-all duration-300"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          {check.passed ? (
            <ShieldCheck className="w-4 h-4 text-safe shrink-0" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-destructive shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <span className="font-mono text-xs font-semibold text-foreground">{check.label}</span>
            <p className="text-xs text-muted-foreground truncate">{check.detail}</p>
          </div>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${check.passed ? 'bg-safe/10 text-safe' : 'bg-destructive/10 text-destructive'}`}>
            {check.passed ? 'PASS' : 'FAIL'}
          </span>
        </div>
      ))}
    </div>
  );
}
