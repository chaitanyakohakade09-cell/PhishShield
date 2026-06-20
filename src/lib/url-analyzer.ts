export interface UrlAnalysis {
  url: string;
  score: number; // 0-100, higher = more dangerous
  level: 'safe' | 'suspicious' | 'dangerous';
  reasons: string[];
  timestamp: Date;
  checks: {
    label: string;
    passed: boolean;
    detail: string;
  }[];
}

const SUSPICIOUS_KEYWORDS = [
  'login', 'verify', 'secure', 'update', 'bank', 'free', 'account',
  'confirm', 'password', 'signin', 'paypal', 'ebay', 'amazon',
  'netflix', 'apple', 'microsoft', 'google', 'facebook', 'instagram',
  'wallet', 'crypto', 'reward', 'prize', 'winner', 'urgent', 'suspend',
  'expire', 'locked', 'unusual', 'click', 'immediately'
];

export function analyzeUrl(rawUrl: string, sensitivity: number = 1.0): UrlAnalysis {
  let url: URL;
  try {
    url = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
  } catch {
    return {
      url: rawUrl,
      score: 90,
      level: 'dangerous',
      reasons: ['Invalid URL format'],
      timestamp: new Date(),
      checks: [{ label: 'URL Format', passed: false, detail: 'Could not parse URL' }],
    };
  }

  let score = 0;
  const reasons: string[] = [];
  const checks: UrlAnalysis['checks'] = [];

  // HTTPS check
  const isHttps = url.protocol === 'https:';
  checks.push({ label: 'HTTPS', passed: isHttps, detail: isHttps ? 'Secure connection' : 'No SSL encryption' });
  if (!isHttps) { score += 20; reasons.push('No HTTPS encryption detected'); }

  // IP address check
  const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(url.hostname);
  checks.push({ label: 'Domain Type', passed: !isIp, detail: isIp ? 'IP address used instead of domain' : 'Standard domain name' });
  if (isIp) { score += 25; reasons.push('Uses IP address instead of domain name'); }

  // Domain length
  const longDomain = url.hostname.length > 30;
  checks.push({ label: 'Domain Length', passed: !longDomain, detail: `${url.hostname.length} characters` });
  if (longDomain) { score += 15; reasons.push('Unusually long domain name'); }

  // Suspicious keywords
  const foundKeywords = SUSPICIOUS_KEYWORDS.filter(k => url.href.toLowerCase().includes(k));
  const hasKeywords = foundKeywords.length > 0;
  checks.push({ label: 'Keywords', passed: !hasKeywords, detail: hasKeywords ? `Found: ${foundKeywords.slice(0, 3).join(', ')}` : 'No suspicious keywords' });
  if (hasKeywords) { score += Math.min(foundKeywords.length * 8, 25); reasons.push(`Suspicious keywords: ${foundKeywords.slice(0, 3).join(', ')}`); }

  // Special characters
  const specialChars = (url.href.match(/[@_~]/g) || []).length;
  const hasSpecial = specialChars > 1;
  checks.push({ label: 'Special Chars', passed: !hasSpecial, detail: hasSpecial ? `${specialChars} special characters found` : 'Normal character usage' });
  if (hasSpecial) { score += 10; reasons.push('Excessive special characters in URL'); }

  // Multiple subdomains
  const subdomains = url.hostname.split('.').length - 2;
  const manySubdomains = subdomains > 2;
  checks.push({ label: 'Subdomains', passed: !manySubdomains, detail: `${subdomains} subdomain(s)` });
  if (manySubdomains) { score += 15; reasons.push('Excessive subdomains detected'); }

  // Hyphen count in domain
  const hyphens = (url.hostname.match(/-/g) || []).length;
  const manyHyphens = hyphens > 2;
  checks.push({ label: 'Hyphens', passed: !manyHyphens, detail: `${hyphens} hyphen(s) in domain` });
  if (manyHyphens) { score += 10; reasons.push('Many hyphens in domain name'); }

  score = Math.min(Math.round(score * sensitivity), 100);
  const level = score <= 25 ? 'safe' : score <= 60 ? 'suspicious' : 'dangerous';
  if (reasons.length === 0) reasons.push('No threats detected');

  return { url: rawUrl, score, level, reasons, timestamp: new Date(), checks };
}
