import { Clock, ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react';
import { UrlAnalysis } from '@/lib/url-analyzer';

interface ScanHistoryProps {
  history: UrlAnalysis[];
}

const icons = {
  safe: ShieldCheck,
  suspicious: ShieldAlert,
  dangerous: ShieldX,
};

const levelColors = {
  safe: 'text-safe',
  suspicious: 'text-suspicious',
  dangerous: 'text-destructive',
};

export function ScanHistory({ history }: ScanHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
        <Clock className="w-8 h-8 opacity-30" />
        <p className="text-xs font-mono">No scans yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin">
      {history.map((item, i) => {
        const Icon = icons[item.level];
        return (
          <div key={i} className="flex items-center gap-2.5 rounded-md border border-border bg-muted/20 px-3 py-2 transition-colors hover:bg-muted/40">
            <Icon className={`w-4 h-4 shrink-0 ${levelColors[item.level]}`} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-mono truncate text-foreground">{item.url}</p>
              <p className="text-[10px] text-muted-foreground">
                {item.timestamp.toLocaleTimeString()} · Score: {item.score}
              </p>
            </div>
            <span className={`text-[10px] font-mono font-bold uppercase ${levelColors[item.level]}`}>
              {item.level}
            </span>
          </div>
        );
      })}
    </div>
  );
}
