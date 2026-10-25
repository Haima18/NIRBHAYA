"""
Digital Guardian Server-side Text Analyzer
Heuristic NLP pattern matching for intimidation, blackmail, and stalking.
"""
import re

PATTERNS = {
    'Blackmail & Extortion': {
        'keywords': [r'or else', r'leak your', r'expose you', r'send to your family', r'pay me', r'crypto', r'bitcoin', r'private video', r'destroy your life'],
        'severity': 'critical',
        'advice': 'Do not pay or negotiate. Cease contact immediately, preserve uncropped screenshots with timestamps, and report to 1930 / cybercrime.gov.in.'
    },
    'Physical Threats & Intimidation': {
        'keywords': [r'kill you', r'hurt you', r'beat you', r'watch your back', r'know where you live', r'find you', r'regret this', r'waiting outside'],
        'severity': 'critical',
        'advice': 'Prioritize physical safety. Call Emergency 112 immediately if there is imminent danger. Notify your Trusted Circle.'
    },
    'Sexual Harassment & Explicit Demands': {
        'keywords': [r'send nudes', r'dirty pics', r'sleep with me', r'video call nude', r'show your body', r'intimate pictures', r'hot pic'],
        'severity': 'high',
        'advice': 'Preserve evidence before blocking. Report the user on the messaging platform. Non-consensual sharing of intimate images is illegal under IT Act 67A.'
    },
    'Cyberstalking & Persistent Surveillance': {
        'keywords': [r'saw you at', r'why did you ignore', r'answer my call', r'who were you with', r'watching you', r'unblock me', r'following you', r'cant escape'],
        'severity': 'high',
        'advice': 'Do not respond. Review your privacy settings across social accounts, disable location sharing, and keep a timestamped log in your Incident Journal.'
    },
    'Doxxing & Personal Data Threat': {
        'keywords': [r'dox you', r'post your address', r'leak your number', r'have your aadhaar', r'know your company', r'post your workplace'],
        'severity': 'high',
        'advice': 'Activate Privacy Shield immediately. Contact platform moderators to request urgent takedown of leaked data.'
    }
}

def analyze_message_text(text: str) -> dict:
    normalized = str(text or '').strip().lower()
    detected = []

    for category, conf in PATTERNS.items():
        matched_kws = []
        for kw in conf['keywords']:
            if re.search(r'(?<!\w)' + re.escape(kw) + r'(?!\w)', normalized):
                matched_kws.append(kw)

        if matched_kws:
            confidence = min(0.95, 0.5 + len(matched_kws) * 0.15)
            detected.append({
                'category': category,
                'severity': conf['severity'],
                'matchedKeywords': matched_kws,
                'confidence': round(confidence, 2),
                'actionAdvice': conf['advice']
            })

    overall_risk = 'low'
    if any(d['severity'] == 'critical' for d in detected):
        overall_risk = 'critical'
    elif any(d['severity'] == 'high' for d in detected):
        overall_risk = 'high'
    elif detected:
        overall_risk = 'medium'

    summary = f"Identified {len(detected)} concern pattern(s). Evaluated risk level: {overall_risk.upper()}." if detected else "No acute intimidation or extortion patterns detected."

    # Build recommended steps from detected pattern advice, deduplicated
    recommended_steps = []
    seen = set()
    for d in detected:
        advice = d.get('actionAdvice', '')
        if advice and advice not in seen:
            seen.add(advice)
            recommended_steps.append(advice)
    if not recommended_steps:
        recommended_steps = [
            'Continue to monitor and save any concerning messages.',
            'Reach out to a trusted person or helpline if you feel unsafe.',
            'Report any escalation to cybercrime.gov.in or call 1930.',
        ]

    return {
        'overallRisk': overall_risk,
        'detectedPatterns': detected,
        'recommendedSteps': recommended_steps,
        'summary': summary,
    }
