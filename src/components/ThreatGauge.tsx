import { useEffect, useRef } from 'react';

interface ThreatGaugeProps {
  score: number;
  size?: number;
}

export function ThreatGauge({ score, size = 200 }: ThreatGaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2 + 10;
    const radius = size / 2 - 20;
    const startAngle = Math.PI * 0.8;
    const endAngle = Math.PI * 2.2;
    const totalAngle = endAngle - startAngle;

    let currentScore = 0;
    const targetScore = score;

    const animate = () => {
      currentScore += (targetScore - currentScore) * 0.08;
      if (Math.abs(currentScore - targetScore) < 0.5) currentScore = targetScore;

      ctx.clearRect(0, 0, size, size);

      // Background arc
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.strokeStyle = 'hsla(220, 15%, 20%, 0.8)';
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Value arc
      const valueAngle = startAngle + (currentScore / 100) * totalAngle;
      const gradient = ctx.createLinearGradient(0, size, size, 0);
      if (currentScore <= 25) {
        gradient.addColorStop(0, '#00ff88');
        gradient.addColorStop(1, '#00ff88');
      } else if (currentScore <= 60) {
        gradient.addColorStop(0, '#00ff88');
        gradient.addColorStop(1, '#ffaa00');
      } else {
        gradient.addColorStop(0, '#ffaa00');
        gradient.addColorStop(1, '#ff3366');
      }

      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, valueAngle);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Glow
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, valueAngle);
      ctx.strokeStyle = currentScore <= 25 ? 'hsla(155, 100%, 50%, 0.3)' : currentScore <= 60 ? 'hsla(38, 100%, 50%, 0.3)' : 'hsla(345, 100%, 60%, 0.3)';
      ctx.lineWidth = 20;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Score text
      ctx.fillStyle = currentScore <= 25 ? '#00ff88' : currentScore <= 60 ? '#ffaa00' : '#ff3366';
      ctx.font = `bold ${size * 0.22}px 'JetBrains Mono', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(Math.round(currentScore).toString(), cx, cy - 5);

      ctx.fillStyle = 'hsla(220, 10%, 55%, 1)';
      ctx.font = `500 ${size * 0.08}px 'Inter', sans-serif`;
      ctx.fillText('RISK SCORE', cx, cy + size * 0.15);

      if (currentScore !== targetScore) requestAnimationFrame(animate);
    };

    animate();
  }, [score, size]);

  return <canvas ref={canvasRef} style={{ width: size, height: size }} />;
}
