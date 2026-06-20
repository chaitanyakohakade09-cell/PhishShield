import { useState, useMemo } from 'react';
import { History as HistoryIcon, Search, Download, ShieldCheck, ShieldAlert, ShieldX, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { usePhishShield } from '@/context/PhishShieldContext';
import { PageTransition } from '@/components/PageTransition';
import { generatePdfReport } from '@/lib/pdf-report';

type Filter = 'all' | 'safe' | 'suspicious' | 'dangerous';
type SortBy = 'date' | 'score';

export default function HistoryPage() {
  const { history } = usePhishShield();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const filtered = useMemo(() => {
    let items = [...history];
    if (search) items = items.filter(h => h.url.toLowerCase().includes(search.toLowerCase()));
    if (filter !== 'all') items = items.filter(h => h.level === filter);
    if (sortBy === 'score') items.sort((a, b) => b.score - a.score);
    return items;
  }, [history, search, filter, sortBy]);

  const exportData = (format: 'csv' | 'json') => {
    let content: string;
    if (format === 'json') {
      content = JSON.stringify(filtered, null, 2);
    } else {
      const rows = [['URL', 'Score', 'Level', 'Timestamp']];
      filtered.forEach(h => rows.push([h.url, h.score.toString(), h.level, h.timestamp.toISOString()]));
      content = rows.map(r => r.join(',')).join('\n');
    }
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `phishshield-history.${format}`;
    a.click();
  };

  const levelIcons = { safe: ShieldCheck, suspicious: ShieldAlert, dangerous: ShieldX };
  const levelColors = { safe: 'text-safe', suspicious: 'text-suspicious', dangerous: 'text-destructive' };
  const filterBtns: Filter[] = ['all', 'safe', 'suspicious', 'dangerous'];

  return (
    <PageTransition>
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <HistoryIcon className="w-5 h-5 text-primary" />
        <h1 className="font-mono text-lg font-bold text-foreground">SCAN HISTORY</h1>
        <span className="font-mono text-xs text-muted-foreground">({filtered.length})</span>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search URLs..."
            className="w-full rounded-lg border border-border bg-muted/30 pl-9 pr-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>
        <div className="flex gap-1">
          {filterBtns.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`font-mono text-[10px] px-2.5 py-1.5 rounded-md border transition-colors ${filter === f ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as SortBy)}
          className="font-mono text-[10px] px-2 py-1.5 rounded-md border border-border bg-muted/30 text-foreground"
        >
          <option value="date">Sort: Date</option>
          <option value="score">Sort: Score</option>
        </select>
        <button onClick={() => exportData('csv')} className="flex items-center gap-1 font-mono text-[10px] px-2.5 py-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground transition-colors">
          <Download className="w-3 h-3" /> CSV
        </button>
        <button onClick={() => exportData('json')} className="flex items-center gap-1 font-mono text-[10px] px-2.5 py-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground transition-colors">
          <Download className="w-3 h-3" /> JSON
        </button>
        <button onClick={() => generatePdfReport(filtered)} className="flex items-center gap-1 font-mono text-[10px] px-2.5 py-1.5 rounded-md border border-primary/30 text-primary hover:bg-primary/10 transition-colors">
          <FileText className="w-3 h-3" /> PDF Report
        </button>
      </div>

      <div className="space-y-1.5">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground font-mono text-xs">No results found</div>
        ) : filtered.map((item, i) => {
          const Icon = levelIcons[item.level];
          const expanded = expandedIdx === i;
          return (
            <div key={i} className="rounded-lg border border-border bg-card/50 glass overflow-hidden">
              <button
                onClick={() => setExpandedIdx(expanded ? null : i)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors text-left"
              >
                <Icon className={`w-4 h-4 shrink-0 ${levelColors[item.level]}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono truncate text-foreground">{item.url}</p>
                  <p className="text-[10px] text-muted-foreground">{item.timestamp.toLocaleString()}</p>
                </div>
                <span className="font-mono text-sm font-bold text-foreground">{item.score}</span>
                <span className={`font-mono text-[10px] font-bold uppercase ${levelColors[item.level]}`}>{item.level}</span>
                {expanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
              </button>
              {expanded && (
                <div className="px-4 pb-3 space-y-1.5 border-t border-border pt-2">
                  {item.checks.map((c, j) => (
                    <div key={j} className="flex items-center gap-2 text-xs font-mono">
                      <span className={c.passed ? 'text-safe' : 'text-destructive'}>{c.passed ? '✓' : '✗'}</span>
                      <span className="text-foreground font-medium">{c.label}:</span>
                      <span className="text-muted-foreground">{c.detail}</span>
                    </div>
                  ))}
                  {item.reasons.map((r, j) => (
                    <p key={j} className="text-[10px] text-muted-foreground"><span className="text-destructive">›</span> {r}</p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
    </PageTransition>
  );
}
