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
    if any(word in lower_q for word in ('danger', 'emergency', 'help', 'attack', 'he is here')):
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
            "Call **1516** or visit nalsa.gov.in.\n"
            "• Build a factual timeline and keep original files. NIRBHAYA's lawyer profiles are illustrative samples, "
            "not verified empanelment. Verify an advocate independently through the State Bar Council or NALSA."
        )
        actions = [
            {'label': 'Legal information', 'route': '/legal-support'},
            {'label': 'Emergency Directory', 'route': '/emergency-directory'},
        ]
    elif any(word in lower_q for word in ('stalk', 'instagram', 'whatsapp', 'harass', 'following')):
        reply = (
            "🛡️ **Digital harassment and stalking**\n\n"
            "• Preserve the full conversation and profile URL before blocking.\n"
            "• Stop engaging after one clear request if it is safe to do so.\n"
            "• Review audience, tagged locations, and linked devices in the platform's privacy settings.\n"
            "• Report the account in-app and consider a cybercrime complaint at cybercrime.gov.in or 1930.\n"
            "• NIRBHAYA can organise evidence, but cannot force a platform to remove content."
        )
        actions = [
            {'label': 'Digital Guardian', 'route': '/digital-guardian'},
            {'label': 'Privacy Shield', 'route': '/privacy-shield'},
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
    contents.append({'role': 'user', 'parts': [{'text': f"{SYSTEM_PROMPT}\n\nUser: {query}"}]})
    response = requests.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
        params={'key': Config.GEMINI_API_KEY},
        json={'contents': contents, 'generationConfig': {'maxOutputTokens': 700}},
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
