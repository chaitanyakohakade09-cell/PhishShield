import { Shield, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';
import { usePhishShield } from '@/context/PhishShieldContext';

export function StatCards() {
  const { totalScans, safeCount, suspiciousCount, dangerousCount } = usePhishShield();

  const cards = [
    { label: 'Total Scans', value: totalScans, icon: Shield, color: 'text-accent' },
    { label: 'Safe', value: safeCount, icon: ShieldCheck, color: 'text-safe' },
    { label: 'Suspicious', value: suspiciousCount, icon: ShieldAlert, color: 'text-suspicious' },
    { label: 'Blocked', value: dangerousCount, icon: ShieldX, color: 'text-destructive' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map(c => (
        <div key={c.label} className="rounded-xl border border-border bg-card/50 glass p-4 flex items-center gap-3">
          <c.icon className={`w-6 h-6 ${c.color} shrink-0`} />
          <div>
            <p className="font-mono text-xl font-bold text-foreground">{c.value}</p>
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">{c.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
