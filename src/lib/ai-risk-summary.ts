import { UrlAnalysis } from './url-analyzer';

// Simulated domain reputation data
export interface DomainReputation {
  domainAge: string;
  ageRisk: 'new' | 'young' | 'established';
  sslIssuer: string;
  sslValid: boolean;
  sslExpiry: string;
  registrar: string;
  trustScore: number; // 0-100
  trustBadges: { label: string; icon: 'shield' | 'lock' | 'clock' | 'globe' | 'alert'; earned: boolean }[];
  category: string;
}

const KNOWN_DOMAINS: Record<string, Partial<DomainReputation>> = {
  'google.com': { domainAge: '26 years', ageRisk: 'established', sslIssuer: 'Google Trust Services', trustScore: 98, registrar: 'MarkMonitor Inc.', category: 'Search Engine' },
  'github.com': { domainAge: '17 years', ageRisk: 'established', sslIssuer: 'DigiCert Inc', trustScore: 97, registrar: 'MarkMonitor Inc.', category: 'Developer Tools' },
  'stackoverflow.com': { domainAge: '16 years', ageRisk: 'established', sslIssuer: 'Let\'s Encrypt', trustScore: 95, registrar: 'Namecheap', category: 'Developer Community' },
  'facebook.com': { domainAge: '21 years', ageRisk: 'established', sslIssuer: 'DigiCert Inc', trustScore: 90, registrar: 'RegistrarSafe', category: 'Social Media' },
  'amazon.com': { domainAge: '30 years', ageRisk: 'established', sslIssuer: 'Amazon', trustScore: 96, registrar: 'MarkMonitor Inc.', category: 'E-Commerce' },
};

export function getDomainReputation(url: string): DomainReputation {
  let hostname: string;
  try {
    hostname = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
  } catch {
    hostname = url;
  }

  const rootDomain = hostname.split('.').slice(-2).join('.');
  const known = KNOWN_DOMAINS[rootDomain];

  if (known) {
    return {
      domainAge: known.domainAge!,
      ageRisk: known.ageRisk!,
      sslIssuer: known.sslIssuer!,
      sslValid: true,
      sslExpiry: '2026-12-15',
      registrar: known.registrar!,
      trustScore: known.trustScore!,
      category: known.category!,
      trustBadges: [
        { label: 'Verified Domain', icon: 'shield', earned: true },
        { label: 'SSL Certified', icon: 'lock', earned: true },
        { label: 'Established (5+ yrs)', icon: 'clock', earned: true },
        { label: 'Global Reach', icon: 'globe', earned: true },
        { label: 'No Incidents', icon: 'alert', earned: true },
      ],
    };
  }

  // Simulated unknown/suspicious domain
  const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);
  const isSuspiciousTld = /\.(tk|ml|ga|cf|gq|xyz|click|info|top|buzz|work)$/.test(hostname);
  const domainLength = hostname.length;

  const ageMonths = Math.floor(Math.random() * 36);
  const ageRisk: DomainReputation['ageRisk'] = ageMonths < 3 ? 'new' : ageMonths < 12 ? 'young' : 'established';
  const trustScore = isIp ? 5 : isSuspiciousTld ? 15 : domainLength > 30 ? 20 : Math.max(10, 50 - ageMonths);

  return {
    domainAge: ageMonths < 1 ? 'Less than 1 month' : `${ageMonths} months`,
    ageRisk,
    sslIssuer: isIp ? 'None' : 'Unknown CA',
    sslValid: !isIp && Math.random() > 0.3,
    sslExpiry: isIp ? 'N/A' : '2025-06-01',
    registrar: 'Unknown Registrar',
    trustScore,
    category: isIp ? 'Direct IP' : isSuspiciousTld ? 'Suspicious TLD' : 'Unknown',
    trustBadges: [
      { label: 'Verified Domain', icon: 'shield', earned: false },
      { label: 'SSL Certified', icon: 'lock', earned: !isIp },
      { label: 'Established (5+ yrs)', icon: 'clock', earned: ageRisk === 'established' },
      { label: 'Global Reach', icon: 'globe', earned: false },
      { label: 'No Incidents', icon: 'alert', earned: ageMonths > 6 },
    ],
  };
}

export function generateAiRiskSummary(analysis: UrlAnalysis, reputation: DomainReputation): string {
  if (analysis.level === 'safe') {
    return `This URL appears to be safe. The domain "${extractDomain(analysis.url)}" is ${reputation.domainAge} old with a trust score of ${reputation.trustScore}/100. ${reputation.sslValid ? 'SSL certificate is valid and issued by ' + reputation.sslIssuer + '.' : ''} No significant risk indicators were detected during the analysis. The domain is categorized as "${reputation.category}" and has earned ${reputation.trustBadges.filter(b => b.earned).length}/5 trust badges.`;
  }

  if (analysis.level === 'suspicious') {
    const topReasons = analysis.reasons.slice(0, 2).join('; ');
    return `⚠️ Caution advised. This URL shows moderate risk indicators: ${topReasons}. The domain is ${reputation.domainAge} old with a trust score of only ${reputation.trustScore}/100. ${reputation.ageRisk === 'new' ? 'The domain was recently registered, which is common with phishing sites.' : ''} ${!reputation.sslValid ? 'No valid SSL certificate was detected.' : ''} Proceed with caution and avoid entering personal information.`;
  }

  // Dangerous
  const topReasons = analysis.reasons.slice(0, 3).join('; ');
  return `🚨 HIGH RISK ALERT. Multiple severe threat indicators detected: ${topReasons}. The domain has a trust score of only ${reputation.trustScore}/100. ${reputation.ageRisk === 'new' ? 'This domain was registered very recently — a hallmark of phishing campaigns.' : ''} ${!reputation.sslValid ? 'No valid SSL certificate found.' : ''} This URL strongly resembles known phishing patterns. DO NOT enter any personal information, credentials, or payment details.`;
}

function extractDomain(url: string): string {
  try {
    return new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
  } catch { return url; }
}
