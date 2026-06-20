import { useMemo, useRef, useEffect, useState } from 'react';
import { Map, ZoomIn, ZoomOut } from 'lucide-react';
import { usePhishShield } from '@/context/PhishShieldContext';
import { PageTransition } from '@/components/PageTransition';

interface Node {
  id: string;
  label: string;
  level: 'safe' | 'suspicious' | 'dangerous';
  score: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

const LEVEL_COLORS = {
  safe: '#00ff8c',
  suspicious: '#ff9500',
  dangerous: '#ff3366',
};

export default function ThreatMapPage() {
  const { history } = usePhishShield();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [zoom, setZoom] = useState(1);

  const nodes = useMemo(() => {
    const domainMap: Record<string, { level: 'safe' | 'suspicious' | 'dangerous'; score: number; count: number }> = {};
    history.forEach(h => {
      try {
        const hostname = new URL(h.url.startsWith('http') ? h.url : `https://${h.url}`).hostname;
        const existing = domainMap[hostname];
        if (!existing || h.score > existing.score) {
          domainMap[hostname] = { level: h.level, score: h.score, count: (existing?.count || 0) + 1 };
        } else {
          domainMap[hostname] = { ...existing, count: existing.count + 1 };
        }
      } catch {}
    });

    const centerX = 400;
    const centerY = 300;
    const result: Node[] = [];
    const entries = Object.entries(domainMap);
    let i = 0;
    entries.forEach(([domain, data]) => {
      const angle = (i / entries.length) * Math.PI * 2;
      const dist = 120 + Math.random() * 100;
      result.push({
        id: domain,
        label: domain.length > 20 ? domain.slice(0, 17) + '...' : domain,
        level: data.level,
        score: data.score,
        x: centerX + Math.cos(angle) * dist,
        y: centerY + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.max(8, Math.min(20, data.count * 5 + 6)),
      });
      i++;
    });
    return result;
  }, [history]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || nodes.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nodesRef = nodes.map(n => ({ ...n }));

    const draw = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;

      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.translate(w / 2 * (1 - zoom), h / 2 * (1 - zoom));
      ctx.scale(zoom, zoom);

      // Draw connections between nodes of same risk level
      ctx.globalAlpha = 0.1;
      for (let i = 0; i < nodesRef.length; i++) {
        for (let j = i + 1; j < nodesRef.length; j++) {
          if (nodesRef[i].level === nodesRef[j].level && nodesRef[i].level !== 'safe') {
            ctx.beginPath();
            ctx.moveTo(nodesRef[i].x, nodesRef[i].y);
            ctx.lineTo(nodesRef[j].x, nodesRef[j].y);
            ctx.strokeStyle = LEVEL_COLORS[nodesRef[i].level];
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;

      // Update positions (gentle float)
      nodesRef.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        // Bounce off edges
        if (n.x < 50 || n.x > w / zoom - 50) n.vx *= -1;
        if (n.y < 50 || n.y > h / zoom - 50) n.vy *= -1;
        // Damping
        n.vx *= 0.999;
        n.vy *= 0.999;
      });

      // Draw nodes
      nodesRef.forEach(n => {
        const color = LEVEL_COLORS[n.level];
        // Glow
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius + 4, 0, Math.PI * 2);
        ctx.fillStyle = color + '20';
        ctx.fill();

        // Node
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = color + '40';
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.fill();
        ctx.stroke();

        // Label
        ctx.fillStyle = '#e0e8f0';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(n.label, n.x, n.y + n.radius + 14);

        // Score
        ctx.fillStyle = color;
        ctx.font = 'bold 8px JetBrains Mono, monospace';
        ctx.fillText(n.score.toString(), n.x, n.y + 3);
      });

      ctx.restore();
      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [nodes, zoom]);

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <Map className="w-5 h-5 text-primary" />
          <h1 className="font-mono text-lg font-bold text-foreground">THREAT MAP</h1>
          <span className="font-mono text-xs text-muted-foreground">({nodes.length} domains)</span>
          <div className="ml-auto flex items-center gap-1">
            <button onClick={() => setZoom(z => Math.min(z + 0.2, 2.5))} className="p-1.5 rounded border border-border text-muted-foreground hover:text-foreground transition-colors">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))} className="p-1.5 rounded border border-border text-muted-foreground hover:text-foreground transition-colors">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4">
          {Object.entries(LEVEL_COLORS).map(([level, color]) => (
            <div key={level} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="font-mono text-[10px] text-muted-foreground uppercase">{level}</span>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card/50 glass overflow-hidden">
          {nodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground font-mono text-xs gap-3">
              <Map className="w-8 h-8 opacity-30" />
              <p>Scan some URLs to populate the threat map</p>
            </div>
          ) : (
            <canvas ref={canvasRef} className="w-full" style={{ height: '500px' }} />
          )}
        </div>
      </div>
    </PageTransition>
  );
}
