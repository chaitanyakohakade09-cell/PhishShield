import { Shield, Lock, Clock, Globe, AlertTriangle, Award } from 'lucide-react';
import { DomainReputation as DomainReputationType } from '@/lib/ai-risk-summary';

const iconMap = { shield: Shield, lock: Lock, clock: Clock, globe: Globe, alert: AlertTriangle };
const ageColors = { new: 'text-destructive', young: 'text-suspicious', established: 'text-safe' };

export function DomainReputationCard({ reputation }: { reputation: DomainReputationType }) {
  return (
    <div className="rounded-xl border border-border bg-card/50 glass p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Award className="w-4 h-4 text-accent" />
        <h2 className="font-mono text-xs font-bold text-foreground tracking-wide">DOMAIN REPUTATION</h2>
        <span className="ml-auto font-mono text-sm font-bold text-primary">{reputation.trustScore}/100</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        <div className="rounded-md bg-muted/20 px-3 py-2">
          <p className="text-[10px] text-muted-foreground">Domain Age</p>
          <p className={`font-medium ${ageColors[reputation.ageRisk]}`}>{reputation.domainAge}</p>
        </div>
        <div className="rounded-md bg-muted/20 px-3 py-2">
          <p className="text-[10px] text-muted-foreground">SSL Issuer</p>
          <p className={`font-medium ${reputation.sslValid ? 'text-safe' : 'text-destructive'}`}>{reputation.sslIssuer}</p>
        </div>
        <div className="rounded-md bg-muted/20 px-3 py-2">
          <p className="text-[10px] text-muted-foreground">Registrar</p>
          <p className="text-foreground font-medium">{reputation.registrar}</p>
        </div>
        <div className="rounded-md bg-muted/20 px-3 py-2">
          <p className="text-[10px] text-muted-foreground">Category</p>
          <p className="text-foreground font-medium">{reputation.category}</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="font-mono text-[10px] text-muted-foreground tracking-wide">TRUST BADGES</p>
        <div className="flex flex-wrap gap-1.5">
          {reputation.trustBadges.map((badge, i) => {
            const Icon = iconMap[badge.icon] || Shield;
            return (
              <div key={i} className={`flex items-center gap-1.5 text-[10px] font-mono px-2 py-1 rounded border ${badge.earned ? 'border-safe/30 text-safe bg-safe/5' : 'border-border text-muted-foreground bg-muted/10 opacity-50'}`}>
                <Icon className="w-3 h-3" />
                {badge.label}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
