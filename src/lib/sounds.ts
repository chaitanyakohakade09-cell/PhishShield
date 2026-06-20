const AudioCtx = typeof window !== 'undefined' ? (window.AudioContext || (window as any).webkitAudioContext) : null;

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) {
  if (!AudioCtx) return;
  try {
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {}
}

export function playSafeSound() {
  playTone(880, 0.15, 'sine');
  setTimeout(() => playTone(1100, 0.2, 'sine'), 120);
}

export function playWarningSound() {
  playTone(440, 0.2, 'triangle');
  setTimeout(() => playTone(380, 0.25, 'triangle'), 180);
}

export function playDangerSound() {
  playTone(220, 0.3, 'sawtooth', 0.1);
  setTimeout(() => playTone(180, 0.3, 'sawtooth', 0.1), 200);
  setTimeout(() => playTone(150, 0.4, 'sawtooth', 0.1), 400);
}

export function playScanSound() {
  playTone(600, 0.1, 'sine', 0.08);
  setTimeout(() => playTone(800, 0.1, 'sine', 0.08), 100);
  setTimeout(() => playTone(1000, 0.1, 'sine', 0.08), 200);
}
