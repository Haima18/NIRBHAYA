"""AI guidance with explicit provider selection and a local fallback.

External providers are only contacted when a key is configured. The route layer
also verifies that the signed-in account has enabled AI consent. If every
configured provider fails, the response is labelled as the local engine rather
than pretending that a cloud model answered.
"""
from typing import List, Optional

import requests

from config import Config

LOCAL_PROVIDER = 'NIRBHAYA Local Safety Engine'
SYSTEM_PROMPT = (
    "You are NIRBHAYA, a concise, trauma-informed women's safety assistant for users in India. "
    "Prioritise immediate physical safety, preserve the user's agency, avoid victim-blaming, and never "
    "claim that you have contacted police, sent messages, or verified a person or organisation. "
    "For immediate danger, tell the user to call 112. Provide practical, lawful next steps and official "
    "Indian resources where relevant. You provide information, not legal advice or a medical diagnosis."
)


def configured_ai_providers() -> List[str]:
    providers = []
    if Config.ANTHROPIC_API_KEY:
        providers.append('Anthropic')
    if Config.OPENAI_API_KEY:
        providers.append('OpenAI')
    if Config.GEMINI_API_KEY:
        providers.append('Google Gemini')
    return providers


def _clean_history(history: Optional[list]) -> List[dict]:
    if not isinstance(history, list):
        return []
    cleaned = []
    for item in history[-8:]:
        if not isinstance(item, dict):
            continue
        role = item.get('role')
        content = item.get('content')
        if role not in {'user', 'assistant'} or not isinstance(content, str):
            continue
        cleaned.append({'role': role, 'content': content[:2000]})
    return cleaned


def _local_response(query: str, provider_note: Optional[str] = None) -> dict:
    lower_q = query.lower()
    emergency_phrases = (
        'immediate danger', 'in immediate danger', 'danger right now', 'emergency',
        'help me now', 'need help now', 'call 112', 'being attacked',
        'attacking me right now', 'he is here', 'she is here', 'they are here',
        'someone is here', 'about to hurt me', 'about to kill me',
        'threatening me right now', 'following me right now', 'trapped right now',
    )
    if 'danger' in lower_q or any(phrase in lower_q for phrase in emergency_phrases):
        reply = (
            "🚨 **Immediate safety priority**\n\n"
            "If you are in immediate danger:\n"
            "1. **Call 112 now** (or ask someone nearby to call).\n"
            "2. If it is safe, move toward an open public space, shop, hospital, or another person.\n"
            "3. The NIRBHAYA **Emergency Siren** can make a loud local alarm. The **SOS** button opens "
            "your device dialer; it does not dispatch police by itself.\n\n"
            "This assistant cannot contact emergency services for you."
        )
        actions = [
            {'label': 'Open SOS & Siren', 'route': '/physical-safety'},
            {'label': 'Emergency Directory', 'route': '/emergency-directory'},
        ]
    elif any(term in lower_q for term in (
        'domestic abuse', 'domestic violence', 'my husband', 'my boyfriend',
        'my partner', 'controlling partner', 'hit me', 'hitting me',
        'abusive partner', 'abusive husband', 'afraid to leave',
    )):
        reply = (
            "**Safety planning for abuse or control**\n\n"
            "You deserve support, and you can choose what steps feel safe. If you are in immediate danger, call 112.\n\n"
            "• If your device may be monitored, use a device and account the other person cannot access.\n"
            "• Consider identifying a trusted person and a place you could go; avoid changing plans on a monitored device.\n"
            "• Keep essential medicines, documents, keys, and emergency numbers accessible if it is safe.\n"
            "• In India, call Women Helpline 181 to ask about support and nearby One Stop Centres; availability varies.\n"
            "• NIRBHAYA's HerCircle stores planning notes locally; it does not connect you to a counselor or send alerts."
        )
        actions = [
            {'label': 'Open safety planning tools', 'route': '/hercircle'},
            {'label': 'Open Pathway', 'route': '/pathway'},
            {'label': 'Emergency Directory', 'route': '/emergency-directory'},
        ]
    elif any(word in lower_q for word in ('blackmail', 'photos', 'deepfake', 'extort', 'leak')):
        reply = (
            "🔒 **Extortion and fabricated-media defence**\n\n"
            "• **Do not pay or negotiate.** Demands often escalate after payment.\n"
            "• **Preserve evidence:** keep uncropped screenshots with the sender handle, date, and full thread.\n"
            "• **Limit spread:** consider StopNCII.org for intimate-image hash reporting and platform takedowns.\n"
            "• **Report:** call **1930** or use **cybercrime.gov.in**.\n"
            "• NIRBHAYA's media inspector checks file type and metadata only; it cannot prove authenticity."
        )
        actions = [
            {'label': 'Deepfake Detective', 'route': '/deepfake-detective'},
            {'label': 'Evidence Vault', 'route': '/evidence-vault'},
        ]
    elif any(word in lower_q for word in ('lawyer', 'legal', 'fir', 'court')):
        reply = (
            "⚖️ **Legal support starting points**\n\n"
            "• You can ask any police station to register a **Zero FIR** when immediate registration is required, "
            "even outside its jurisdiction; the case is later transferred.\n"
            "• Every woman is entitled to free legal aid under **Section 12 of the Legal Services Authorities Act, 1987**. "
            "Call **15100** or visit nalsa.gov.in.\n"
            "• Build a factual timeline and keep original files. NIRBHAYA's lawyer profiles are illustrative samples, "
            "not verified empanelment. Verify an advocate independently through the State Bar Council or NALSA."
        )
        actions = [
            {'label': 'Legal information', 'route': '/legal-support'},
            {'label': 'Emergency Directory', 'route': '/emergency-directory'},
        ]
    elif any(word in lower_q for word in ('stalk', 'instagram', 'whatsapp', 'harass', 'following')):
        reply = (
            "[ALERT] **Digital harassment and stalking**\n\n"
            "- Preserve the full conversation and profile URL before blocking.\n"
            "- Stop engaging after one clear request if it is safe to do so.\n"
            "- Review audience, tagged locations, and linked devices in the platform's privacy settings.\n"
            "- Report the account in-app and consider a cybercrime complaint at cybercrime.gov.in or 1930.\n"
            "- NIRBHAYA can organise evidence, but cannot force a platform to remove content."
        )
        actions = [
            {'label': 'Digital Guardian', 'route': '/digital-guardian'},
            {'label': 'Privacy Shield', 'route': '/privacy-shield'},
        ]
    elif any(word in lower_q for word in ('safe place', 'run away', 'escape', 'leave home')):
        reply = (
            "[SAFETY PLAN] **Safety planning - leaving or escaping a dangerous situation**\n\n"
            "If you are planning to leave a dangerous home or situation:\n"
            "1. Prepare a go-bag in a safe location: ID, cash, phone charger, any medications, and a change of clothes.\n"
            "2. Memorise or save (on a trusted person's phone) the numbers for 181 (Women Helpline) and 112.\n"
            "3. Identify a safe destination: a trusted friend, relative, One-Stop Centre, or government shelter.\n"
            "4. If you have children, plan how to take them safely.\n"
            "5. One-Stop Centres (administered by WCD Ministry) can arrange emergency shelter, legal aid, and counselling.\n\n"
            "[TIP] You do not have to leave tonight. Planning is okay. Reach 181 to speak with a counsellor confidentially."
        )
        actions = [
            {'label': 'Emergency Helplines', 'route': '/emergency-directory'},
            {'label': 'Physical Safety', 'route': '/physical-safety'},
        ]
    elif any(word in lower_q for word in ('fir', 'complaint', 'police', 'report')):
        reply = (
            "[LEGAL] **How to file an FIR or complaint**\n\n"
            "1. **Zero FIR:** Any police station must record your complaint regardless of jurisdiction. "
            "The case is then transferred to the correct station.\n"
            "2. **e-FIR:** Many states allow online FIR registration at the state police website.\n"
            "3. **Cybercrime:** Report online harassment, blackmail, or image abuse at cybercrime.gov.in or call 1930.\n"
            "4. **Bring to the station:** your ID, any printed evidence, and a written summary of events.\n"
            "5. Demand a copy of the FIR immediately - it is your right under Section 154(2) CrPC.\n\n"
            "[TIP] If a station refuses to register your FIR, you can complain to the Superintendent of Police, "
            "approach a Magistrate under Section 156(3) CrPC, or call the Women Helpline 181."
        )
        actions = [
            {'label': 'Legal Support', 'route': '/legal-support'},
            {'label': 'Emergency Directory', 'route': '/emergency-directory'},
        ]
    elif any(word in lower_q for word in ('suicide', 'depression', 'mental health', 'counselling', 'kiran')):
        reply = (
            "[CARE] **Mental health and crisis support**\n\n"
            "You are not alone, and reaching out is a sign of courage.\n\n"
            "- **KIRAN Mental Health Helpline:** 1800-599-0019 (free, 24/7, multilingual, Government of India)\n"
            "- **iCall (TISS):** 9152987821 - professional counselling support\n"
            "- **Vandrevala Foundation:** 1860-2662-345 - 24/7 crisis support\n\n"
            "If you or someone you know is in immediate danger, call 112.\n\n"
            "[TIP] KIRAN offers counselling in 13 languages and can connect you with local mental health services. "
            "Everything you share is confidential."
        )
        actions = [
            {'label': 'Emergency Helplines', 'route': '/emergency-directory'},
            {'label': 'NIRBHAYA AI Assistant', 'route': '/ai-assistant'},
        ]
    elif any(word in lower_q for word in ('privacy', 'account', 'password', 'hacked')):
        reply = (
            "[SECURE] **Digital privacy and account security**\n\n"
            "If your account has been compromised or you suspect unauthorised access:\n"
            "1. Change your password immediately from a safe, uncompromised device.\n"
            "2. Enable two-factor authentication (2FA) on all important accounts.\n"
            "3. Check active sessions and log out all other devices from account settings.\n"
            "4. Check if your email appears in a data breach at haveibeenpwned.com.\n"
            "5. Revoke access to any suspicious third-party apps linked to your account.\n"
            "6. Report account theft to the platform's support team and to cybercrime.gov.in or 1930.\n\n"
            "[TIP] Use a password manager to generate and store unique passwords for each account. "
            "Never share OTPs, even with people claiming to be from support teams."
        )
        actions = [
            {'label': 'Privacy Shield', 'route': '/privacy-shield'},
            {'label': 'Digital Guardian', 'route': '/digital-guardian'},
        ]
    else:
        reply = (
            "Welcome to the **NIRBHAYA AI Assistant**.\n\n"
            "I can help you think through physical safety, online harassment, evidence preservation, and "
            "preparing for legal or support conversations. I cannot dispatch help, contact a lawyer, or verify "
            "another person's identity.\n\n"
            "What are you dealing with right now?"
        )
        actions = [
            {'label': 'Explore NIRBHAYA Pathway', 'route': '/pathway'},
            {'label': 'Digital Guardian', 'route': '/digital-guardian'},
            {'label': 'Emergency Helplines', 'route': '/emergency-directory'},
        ]

    result = {'reply': reply, 'suggestedActions': actions, 'provider': LOCAL_PROVIDER}
    if provider_note:
        result['providerFallbackReason'] = provider_note
    return result


def _gemini(query: str, history: List[dict]) -> Optional[str]:
    if not Config.GEMINI_API_KEY:
        return None
    contents = []
    for item in history:
        contents.append({
            'role': 'user' if item['role'] == 'user' else 'model',
            'parts': [{'text': item['content']}],
        })
    contents.append({'role': 'user', 'parts': [{'text': query}]})
    response = requests.post(
        f'https://generativelanguage.googleapis.com/v1beta/models/{Config.GEMINI_MODEL}:generateContent',
        params={'key': Config.GEMINI_API_KEY},
        json={
            'systemInstruction': {'parts': [{'text': SYSTEM_PROMPT}]},
            'contents': contents,
            'generationConfig': {'maxOutputTokens': 700},
        },
        timeout=8,
    )
    if response.status_code != 200:
        return None
    data = response.json()
    return data['candidates'][0]['content']['parts'][0]['text']


def _openai(query: str, history: List[dict]) -> Optional[str]:
    if not Config.OPENAI_API_KEY:
        return None
    messages = [{'role': 'system', 'content': SYSTEM_PROMPT}]
    messages.extend(history)
    messages.append({'role': 'user', 'content': query})
    response = requests.post(
        'https://api.openai.com/v1/chat/completions',
        headers={
            'Authorization': f'Bearer {Config.OPENAI_API_KEY}',
            'Content-Type': 'application/json',
        },
        json={'model': 'gpt-4o-mini', 'messages': messages, 'max_tokens': 700},
        timeout=8,
    )
    if response.status_code != 200:
        return None
    return response.json()['choices'][0]['message']['content']


def _anthropic(query: str, history: List[dict]) -> Optional[str]:
    if not Config.ANTHROPIC_API_KEY:
        return None
    response = requests.post(
        'https://api.anthropic.com/v1/messages',
        headers={
            'x-api-key': Config.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
        },
        json={
            'model': 'claude-3-5-haiku-latest',
            'max_tokens': 700,
            'system': SYSTEM_PROMPT,
            'messages': history + [{'role': 'user', 'content': query}],
        },
        timeout=8,
    )
    if response.status_code != 200:
        return None
    blocks = response.json().get('content', [])
    text = ' '.join(block.get('text', '') for block in blocks if block.get('type') == 'text')
    return text.strip() or None


def get_ai_guidance(query: str, history: Optional[list] = None) -> dict:
    q = str(query or '').strip()
    if not q:
        return _local_response('')

    clean_history = _clean_history(history)
    providers = configured_ai_providers()
    if not providers:
        return _local_response(q)

    attempts = {
        'Anthropic': _anthropic,
        'OpenAI': _openai,
        'Google Gemini': _gemini,
    }
    for provider in providers:
        try:
            reply = attempts[provider](q, clean_history)
            if reply:
                return {
                    'reply': reply,
                    'suggestedActions': [],
                    'provider': provider,
                    'externalRequestMade': True,
                }
        except (requests.RequestException, ValueError, KeyError, TypeError, IndexError):
            # Never surface upstream response bodies or credentials.
            continue

    return _local_response(q, 'The configured external provider did not respond, so this answer came from the local safety engine.')
