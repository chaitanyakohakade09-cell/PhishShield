export interface EmailAnalysis {
  score: number; // 0-100
  level: 'safe' | 'suspicious' | 'dangerous';
  findings: { type: 'url' | 'urgency' | 'impersonation' | 'grammar' | 'attachment' | 'sender'; detail: string; severity: 'low' | 'medium' | 'high' }[];
  extractedUrls: string[];
  summary: string;
}

const URGENCY_PHRASES = [
  'act now', 'immediately', 'urgent', 'expires today', 'last chance',
  'account suspended', 'verify now', 'within 24 hours', 'action required',
  'limited time', 'don\'t miss', 'hurry', 'final warning', 'your account will be',
  'failure to comply', 'unauthorized access', 'security alert',
];

const IMPERSONATION_KEYWORDS = [
  'paypal', 'apple', 'microsoft', 'google', 'amazon', 'netflix', 'bank',
  'irs', 'fbi', 'dhl', 'fedex', 'ups', 'whatsapp', 'instagram', 'facebook',
  'chase', 'wells fargo', 'citibank', 'support team', 'security team',
  'customer service', 'helpdesk',
];

const SUSPICIOUS_SENDER_PATTERNS = [
  /noreply.*@.*\.(tk|ml|ga|cf|xyz|click)/i,
  /support@(?!google|apple|microsoft|amazon|paypal)/i,
  /\d{5,}@/,
  /@.*-.*-.*\./,
];

const URL_REGEX = /https?:\/\/[^\s<>"']+/gi;

export function analyzeEmail(text: string, senderEmail?: string): EmailAnalysis {
  const findings: EmailAnalysis['findings'] = [];
  let score = 0;

  // Extract URLs
  const extractedUrls = text.match(URL_REGEX) || [];
  if (extractedUrls.length > 0) {
    const suspiciousUrls = extractedUrls.filter(u => {
      try {
        const url = new URL(u);
        return /\.(tk|ml|ga|cf|xyz|click|info|top)$/.test(url.hostname) ||
          /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url.hostname) ||
          url.hostname.length > 30;
      } catch { return true; }
    });
    if (suspiciousUrls.length > 0) {
      score += 25;
      findings.push({ type: 'url', detail: `${suspiciousUrls.length} suspicious URL(s) detected`, severity: 'high' });
    } else if (extractedUrls.length > 3) {
      score += 10;
      findings.push({ type: 'url', detail: `${extractedUrls.length} URLs found — unusually many links`, severity: 'medium' });
    }
  }

  // Urgency detection
  const lower = text.toLowerCase();
  const urgencyFound = URGENCY_PHRASES.filter(p => lower.includes(p));
  if (urgencyFound.length >= 3) {
    score += 25;
    findings.push({ type: 'urgency', detail: `High-pressure language: "${urgencyFound.slice(0, 3).join('", "')}"`, severity: 'high' });
  } else if (urgencyFound.length > 0) {
    score += 10;
    findings.push({ type: 'urgency', detail: `Urgency phrases detected: "${urgencyFound.slice(0, 2).join('", "')}"`, severity: 'medium' });
  }

  // Impersonation
  const impersonation = IMPERSONATION_KEYWORDS.filter(k => lower.includes(k));
  if (impersonation.length > 0) {
    score += 15;
    findings.push({ type: 'impersonation', detail: `Mentions brand names: ${impersonation.slice(0, 3).join(', ')}`, severity: 'medium' });
  }

  // Grammar/spelling indicators
  const grammarIssues = [
    /dear (customer|user|member|sir\/madam)/i,
    /kindly\s+(click|verify|confirm|update)/i,
    /your\s+account\s+(has been|will be|is)\s+(suspend|block|lock|deactivat)/i,
    /click\s+(here|below)\s+to\s+(verify|confirm|update|secure)/i,
  ];
  const grammarFound = grammarIssues.filter(r => r.test(text));
  if (grammarFound.length > 0) {
    score += grammarFound.length * 8;
    findings.push({ type: 'grammar', detail: `${grammarFound.length} phishing template pattern(s) detected`, severity: grammarFound.length > 2 ? 'high' : 'medium' });
  }

  // Sender analysis
  if (senderEmail) {
    const senderSuspicious = SUSPICIOUS_SENDER_PATTERNS.some(p => p.test(senderEmail));
    if (senderSuspicious) {
      score += 15;
      findings.push({ type: 'sender', detail: `Sender address "${senderEmail}" appears suspicious`, severity: 'medium' });
    }
  }

  // Request for credentials
  if (/password|credit card|ssn|social security|cvv|pin number|routing number/i.test(text)) {
    score += 20;
    findings.push({ type: 'impersonation', detail: 'Requests sensitive information (passwords, financial data)', severity: 'high' });
  }

  score = Math.min(score, 100);
  const level = score <= 20 ? 'safe' : score <= 55 ? 'suspicious' : 'dangerous';

  const summary = level === 'safe'
    ? 'This message appears to be legitimate. No significant phishing indicators were found.'
    : level === 'suspicious'
    ? `This message shows ${findings.length} potential phishing indicator(s). Exercise caution before clicking any links or providing information.`
    : `🚨 This message has ${findings.length} strong phishing indicators. It likely attempts to steal your information or credentials. Do NOT click links or reply.`;

  return { score, level, findings, extractedUrls, summary };
}
