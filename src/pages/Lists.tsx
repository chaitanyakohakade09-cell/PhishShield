import { useState } from 'react';
import { ListChecks, Plus, Trash2, ShieldX, ShieldCheck } from 'lucide-react';
import { usePhishShield } from '@/context/PhishShieldContext';

export default function ListsPage() {
  const { blacklist, whitelist, addToBlacklist, removeFromBlacklist, addToWhitelist, removeFromWhitelist } = usePhishShield();
  const [tab, setTab] = useState<'blacklist' | 'whitelist'>('blacklist');
  const [input, setInput] = useState('');

  const handleAdd = () => {
    if (!input.trim()) return;
    if (tab === 'blacklist') addToBlacklist(input.trim());
    else addToWhitelist(input.trim());
    setInput('');
  };

  const list = tab === 'blacklist' ? blacklist : whitelist;
  const removeItem = tab === 'blacklist' ? removeFromBlacklist : removeFromWhitelist;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <ListChecks className="w-5 h-5 text-primary" />
        <h1 className="font-mono text-lg font-bold text-foreground">BLACK / WHITELIST</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1">
        <button
          onClick={() => setTab('blacklist')}
          className={`flex items-center gap-2 font-mono text-xs px-4 py-2 rounded-lg border transition-colors ${tab === 'blacklist' ? 'border-destructive bg-destructive/10 text-destructive' : 'border-border text-muted-foreground hover:text-foreground'}`}
        >
          <ShieldX className="w-3.5 h-3.5" /> Blacklist ({blacklist.length})
        </button>
        <button
          onClick={() => setTab('whitelist')}
          className={`flex items-center gap-2 font-mono text-xs px-4 py-2 rounded-lg border transition-colors ${tab === 'whitelist' ? 'border-safe bg-safe/10 text-safe' : 'border-border text-muted-foreground hover:text-foreground'}`}
        >
          <ShieldCheck className="w-3.5 h-3.5" /> Whitelist ({whitelist.length})
        </button>
      </div>

      {/* Add input */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="Enter domain (e.g. example.com)"
          className="flex-1 rounded-lg border border-border bg-muted/30 px-3 py-2.5 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
        />
        <button onClick={handleAdd} className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 font-mono text-xs font-semibold text-primary-foreground hover:brightness-110 transition-all neon-border">
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>

      {/* List */}
      <div className="space-y-1.5">
        {list.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground font-mono text-xs">
            No domains in {tab}
          </div>
        ) : list.map((domain, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-card/50 glass px-4 py-2.5">
            {tab === 'blacklist'
              ? <ShieldX className="w-4 h-4 text-destructive shrink-0" />
              : <ShieldCheck className="w-4 h-4 text-safe shrink-0" />
            }
            <span className="flex-1 font-mono text-sm text-foreground">{domain}</span>
            <button onClick={() => removeItem(domain)} className="text-muted-foreground hover:text-destructive transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
