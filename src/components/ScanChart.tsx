import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { usePhishShield } from '@/context/PhishShieldContext';

export function ScanChart() {
  const { history } = usePhishShield();

  const data = useMemo(() => {
    const grouped = new Map<string, { safe: number; suspicious: number; dangerous: number }>();
    history.forEach(h => {
      const key = h.timestamp.toLocaleDateString();
      const entry = grouped.get(key) || { safe: 0, suspicious: 0, dangerous: 0 };
      entry[h.level]++;
      grouped.set(key, entry);
    });
    return Array.from(grouped.entries())
      .map(([date, counts]) => ({ date, ...counts }))
      .reverse()
      .slice(-7);
  }, [history]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground font-mono text-xs">
        No scan data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="safeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(155, 100%, 50%)" stopOpacity={0.4} />
            <stop offset="100%" stopColor="hsl(155, 100%, 50%)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="dangerGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(345, 100%, 60%)" stopOpacity={0.4} />
            <stop offset="100%" stopColor="hsl(345, 100%, 60%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(220, 10%, 55%)' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 10, fill: 'hsl(220, 10%, 55%)' }} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{ background: 'hsl(220, 20%, 10%)', border: '1px solid hsl(220, 15%, 18%)', borderRadius: 8, fontSize: 11, fontFamily: 'JetBrains Mono' }}
          labelStyle={{ color: 'hsl(180, 100%, 95%)' }}
        />
        <Area type="monotone" dataKey="safe" stroke="hsl(155, 100%, 50%)" fill="url(#safeGrad)" strokeWidth={2} />
        <Area type="monotone" dataKey="suspicious" stroke="hsl(38, 100%, 50%)" fill="transparent" strokeWidth={2} />
        <Area type="monotone" dataKey="dangerous" stroke="hsl(345, 100%, 60%)" fill="url(#dangerGrad)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
