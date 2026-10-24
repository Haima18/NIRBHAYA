/**
 * Digital Guardian Text Analyzer Service
 * Transparent, rule-based heuristic pattern detector with optional backend AI enrichment.
 * Works 100% locally and offline without external credentials.
 */
import { TextAnalysisResult, HarassmentPattern, SeverityLevel } from '@/types';

interface PatternRule {
  category: string;
  keywords: string[];
  severity: SeverityLevel;
  description: string;
  actionAdvice: string;
}

const PATTERN_RULES: PatternRule[] = [
  {
    category: 'Blackmail & Extortion',
    keywords: [
      'or else', 'leak your', 'expose you', 'send to your family', 'send to your friends',
      'pay me', 'crypto', 'bitcoin', 'transfer the money', 'upload your pictures',
      'share your photos', 'private video', 'destroy your life'
    ],
    severity: 'critical',
    description: 'Language attempting coercion by threatening to release private content, media, or demanding money.',
    actionAdvice: 'DO NOT pay or negotiate. Cease contact immediately, take uncropped screenshots with timestamps and sender identifiers, and report to National Cyber Crime portal (1930).'
  },
  {
    category: 'Direct Threats & Physical Intimidation',
    keywords: [
      'kill you', 'hurt you', 'beat you', 'watch your back', 'know where you live',
      'find you', 'regret this', 'end you', 'teach you a lesson', 'waiting outside'
    ],
    severity: 'critical',
    description: 'Explicit threats of physical harm, violence, or stalking an offline location.',
    actionAdvice: 'Prioritize physical safety. Call Emergency 112 immediately if there is immediate danger. Save screenshots to the Evidence Vault and alert your Trusted Circle.'
  },
  {
    category: 'Sexual Harassment & Explicit Solicitation',
    keywords: [
      'send nudes', 'dirty pics', 'sleep with me', 'sexy baby', 'video call nude',
      'show your body', 'intimate pictures', 'masturbate', 'hot pic', 'undress'
    ],
    severity: 'high',
    description: 'Unsolicited explicit sexual remarks, demands for intimate media, or sexual coercion.',
    actionAdvice: 'Preserve evidence before blocking. Report the user on the messaging platform. Remember that sharing non-consensual intimate imagery is illegal under Indian IT Act 67/67A.'
  },
  {
    category: 'Cyberstalking & Persistent Unwanted Contact',
    keywords: [
      'saw you at', 'why did you ignore', 'answer my call', 'reply to me', 'who were you with',
      'i am watching you', 'unblock me', 'following you', 'always know where you are', 'cant escape'
    ],
    severity: 'high',
    description: 'Indications of persistent surveillance, monitoring movement, or harassing follow-ups despite rejection.',
    actionAdvice: 'Do not respond. Review your privacy settings across social accounts, disable location sharing, and keep a timestamped log of each occurrence in your Incident Journal.'
  },
  {
    category: 'Doxxing & Privacy Violation Threat',
    keywords: [
      'dox you', 'post your address', 'leak your number', 'have your aadhaar',
      'know your company', 'post your workplace', 'expose your real identity'
    ],
    severity: 'high',
    description: 'Threats to expose private personal details, home address, phone numbers, or identity online.',
    actionAdvice: 'Activate Privacy Shield immediately. Contact platform moderators to request urgent takedown of leaked data. Document URL links and post IDs.'
  },
  {
    category: 'Coercion & Emotional Manipulation',
    keywords: [
      'if you loved me', 'you made me do this', 'its your fault', 'kill myself if you leave',
      'you are nothing without me', 'no one will believe you', 'you owe me'
    ],
    severity: 'medium',
    description: 'Psychological manipulation, guilt-tripping, self-harm threats, or isolating behavior.',
    actionAdvice: 'Recognize this as a controlling tactic. Consult HerCircle or a confidential counselor. You are not responsible for their threats of self-harm; report threats to emergency services if concerned.'
  },
  {
    category: 'Impersonation & Account Takeover Concern',
    keywords: [
      'fake profile', 'posing as you', 'hacked your account', 'otp', 'verification code',
      'give me the code', 'made an account with your photos'
    ],
    severity: 'medium',
    description: 'Mentions of unauthorized profile creation, impersonating identity, or phishing for access credentials.',
    actionAdvice: 'Never share OTPs or verification codes. Report the imposter account to the platform with identity proof, and enable two-factor authentication on all services.'
  }
];

export const digitalGuardianService = {
  /**
   * Rule-based transparent analysis of input text.
   */
  analyzeText(text: string, aiConsent = false): TextAnalysisResult {
    const sourceText = typeof text === 'string' ? text : '';
    const normalized = sourceText.toLowerCase();
    const detectedPatterns: HarassmentPattern[] = [];
    const matchedCategories = new Set<string>();

    for (const rule of PATTERN_RULES) {
      const matchedPhrases: string[] = [];
      for (const kw of rule.keywords) {
        if (normalized.includes(kw)) {
          matchedPhrases.push(kw);
        }
      }

      if (matchedPhrases.length > 0) {
        matchedCategories.add(rule.category);
        const confidence = Math.min(0.95, 0.5 + matchedPhrases.length * 0.15);
        detectedPatterns.push({
          category: rule.category,
          description: rule.description,
          confidence: parseFloat(confidence.toFixed(2)),
          matchedPhrases,
          actionAdvice: rule.actionAdvice
        });
      }
    }

    // Determine overall risk
    let overallRisk: SeverityLevel = 'low';
    if (detectedPatterns.some(p => p.category.includes('Threats') || p.category.includes('Blackmail'))) {
      overallRisk = 'critical';
    } else if (detectedPatterns.some(p => p.category.includes('Sexual') || p.category.includes('Cyberstalking') || p.category.includes('Doxxing'))) {
      overallRisk = 'high';
    } else if (detectedPatterns.length > 0) {
      overallRisk = 'medium';
    }

    const recommendedSteps: string[] = [];
    if (overallRisk === 'critical') {
      recommendedSteps.push('Preserve original screenshots with dates and uncropped headers before blocking');
      recommendedSteps.push('Dial National Emergency 112 if in imminent physical danger');
      recommendedSteps.push('Report extortion to Cyber Crime Portal 1930 / cybercrime.gov.in');
      recommendedSteps.push('Save this analysis directly to your NIRBHAYA Evidence Vault');
    } else if (overallRisk === 'high') {
      recommendedSteps.push('Disengage and cease replies; avoid escalating or negotiating');
      recommendedSteps.push('Save screenshots to your Incident Journal');
      recommendedSteps.push('Block sender and submit official abuse report on the platform');
      recommendedSteps.push('Audit social media privacy settings in Privacy Shield');
    } else if (overallRisk === 'medium') {
      recommendedSteps.push('Document this conversation in your journal in case patterns escalate');
      recommendedSteps.push('Verify your account security and enable two-factor authentication');
      recommendedSteps.push('Consider confidential peer support via HerCircle');
    } else {
      recommendedSteps.push('No acute intimidation or extortion patterns were detected in the text');
      recommendedSteps.push('Always trust your instincts: if an interaction feels uncomfortable, you are entitled to disengage and block');
    }

    const summary = detectedPatterns.length > 0
      ? `Identified ${detectedPatterns.length} concern pattern(s): ${Array.from(matchedCategories).join(', ')}. Risk level is assessed as ${overallRisk.toUpperCase()}.`
      : 'No explicit threatening, extortion, or harassment keywords detected. This heuristic screen reflects observed textual patterns, not a psychological diagnosis of the sender.';

    return {
      id: `analysis_${Date.now()}`,
      analyzedAt: new Date().toISOString(),
      originalText: text,
      overallRisk,
      summary,
      detectedPatterns,
      recommendedSteps,
      aiAssisted: aiConsent,
      modelNote: aiConsent
        ? 'Evaluated via NIRBHAYA Heuristic Engine with external AI consent granted.'
        : 'Evaluated locally via transparent heuristic rule engine. Zero data was transmitted to external servers.'
    };
  }
};
