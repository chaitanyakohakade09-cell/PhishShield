export interface BrowserFingerprint {
  userAgent: string;
  platform: string;
  language: string;
  languages: string[];
  screenResolution: string;
  colorDepth: number;
  timezone: string;
  timezoneOffset: number;
  cookiesEnabled: boolean;
  doNotTrack: string | null;
  hardwareConcurrency: number;
  deviceMemory: number | null;
  maxTouchPoints: number;
  webglRenderer: string;
  webglVendor: string;
  canvasHash: string;
  plugins: string[];
  connectionType: string;
  storageAvailable: { localStorage: boolean; sessionStorage: boolean; indexedDB: boolean };
  mediaDevices: number;
  privacyScore: number;
  privacyLevel: 'poor' | 'moderate' | 'good' | 'excellent';
  risks: { label: string; detail: string; severity: 'low' | 'medium' | 'high' }[];
}

export async function collectFingerprint(): Promise<BrowserFingerprint> {
  const nav = navigator as any;

  // WebGL info
  let webglRenderer = 'Unknown';
  let webglVendor = 'Unknown';
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        webglRenderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        webglVendor = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
      }
    }
  } catch {}

  // Canvas hash
  let canvasHash = 'N/A';
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200; canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('PhishShield', 2, 15);
      canvasHash = canvas.toDataURL().slice(-16);
    }
  } catch {}

  // Plugins
  const plugins = Array.from(nav.plugins || []).map((p: any) => p.name).slice(0, 10);

  // Media devices
  let mediaDevices = 0;
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    mediaDevices = devices.length;
  } catch {}

  // Storage
  const storageAvailable = {
    localStorage: (() => { try { localStorage.setItem('__test', '1'); localStorage.removeItem('__test'); return true; } catch { return false; } })(),
    sessionStorage: (() => { try { sessionStorage.setItem('__test', '1'); sessionStorage.removeItem('__test'); return true; } catch { return false; } })(),
    indexedDB: !!window.indexedDB,
  };

  // Connection
  const connectionType = (nav.connection?.effectiveType) || 'Unknown';

  // Build risks
  const risks: BrowserFingerprint['risks'] = [];
  let privacyScore = 100;

  if (!nav.doNotTrack || nav.doNotTrack === 'unspecified') {
    risks.push({ label: 'Do Not Track', detail: 'DNT header is not set — trackers can follow your browsing', severity: 'medium' });
    privacyScore -= 15;
  }
  if (webglRenderer !== 'Unknown') {
    risks.push({ label: 'WebGL Exposed', detail: `GPU info exposed: ${webglRenderer.slice(0, 50)}`, severity: 'medium' });
    privacyScore -= 10;
  }
  if (plugins.length > 0) {
    risks.push({ label: 'Plugins Visible', detail: `${plugins.length} browser plugins detectable`, severity: 'low' });
    privacyScore -= 5;
  }
  if (nav.hardwareConcurrency > 0) {
    risks.push({ label: 'Hardware Info', detail: `CPU cores exposed: ${nav.hardwareConcurrency}`, severity: 'low' });
    privacyScore -= 5;
  }
  if (mediaDevices > 2) {
    risks.push({ label: 'Media Devices', detail: `${mediaDevices} media devices enumerable`, severity: 'medium' });
    privacyScore -= 10;
  }
  if (canvasHash !== 'N/A') {
    risks.push({ label: 'Canvas Fingerprint', detail: 'Canvas rendering creates a unique identifier', severity: 'high' });
    privacyScore -= 15;
  }
  if (screen.width > 0 && screen.height > 0) {
    risks.push({ label: 'Screen Resolution', detail: `${screen.width}x${screen.height} — contributes to uniqueness`, severity: 'low' });
    privacyScore -= 5;
  }
  if (nav.deviceMemory) {
    risks.push({ label: 'Device Memory', detail: `${nav.deviceMemory}GB RAM exposed`, severity: 'low' });
    privacyScore -= 5;
  }

  privacyScore = Math.max(0, privacyScore);
  const privacyLevel = privacyScore >= 80 ? 'excellent' : privacyScore >= 60 ? 'good' : privacyScore >= 35 ? 'moderate' : 'poor';

  return {
    userAgent: navigator.userAgent,
    platform: nav.platform || 'Unknown',
    language: navigator.language,
    languages: [...navigator.languages],
    screenResolution: `${screen.width}x${screen.height}`,
    colorDepth: screen.colorDepth,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset(),
    cookiesEnabled: navigator.cookieEnabled,
    doNotTrack: nav.doNotTrack || null,
    hardwareConcurrency: nav.hardwareConcurrency || 0,
    deviceMemory: nav.deviceMemory || null,
    maxTouchPoints: navigator.maxTouchPoints || 0,
    webglRenderer,
    webglVendor,
    canvasHash,
    plugins,
    connectionType,
    storageAvailable,
    mediaDevices,
    privacyScore,
    privacyLevel,
    risks,
  };
}
