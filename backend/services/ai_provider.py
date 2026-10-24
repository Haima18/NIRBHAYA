"""
Provider-Independent AI Assistant Service
Supports Google Gemini, OpenAI, and Anthropic Claude with resilient rule-based safety fallback.
"""
import requests
from config import Config

def get_ai_guidance(query: str, history: list = None) -> dict:
    q = str(query or '').strip()
    lower_q = q.lower()

    if not q:
        reply = (
            "Welcome to **NIRBHAYA AI Assistant**.\n\n"
            "I provide guidance on physical safety, digital harassment defense, evidence preservation, and legal resources.\n"
            "How can I assist you with your safety today?"
        )
        actions = [{'label': 'Explore NIRBHAYA Pathway', 'route': '/pathway'}, {'label': 'Digital Guardian', 'route': '/digital-guardian'}]
        return {
            'reply': reply,
            'suggestedActions': actions,
            'provider': 'NIRBHAYA Local Safety Engine'
        }

    # 1. Attempt Gemini if configured
    if Config.GEMINI_API_KEY:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={Config.GEMINI_API_KEY}"
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": f"You are NIRBHAYA, an empowering, compassionate, concise women's safety AI assistant. Provide actionable safety steps, legal resources in India, and evidence preservation advice. Query: {q}"}
                        ]
                    }
                ]
            }
            res = requests.post(url, json=payload, timeout=6)
            if res.status_code == 200:
                data = res.json()
                reply = data['candidates'][0]['content']['parts'][0]['text']
                return {'reply': reply, 'provider': 'Google Gemini'}
        except Exception:
            pass

    # 2. Attempt OpenAI if configured
    if Config.OPENAI_API_KEY:
        try:
            headers = {"Authorization": f"Bearer {Config.OPENAI_API_KEY}", "Content-Type": "application/json"}
            payload = {
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": "You are NIRBHAYA, a trauma-informed women's safety AI. Keep responses actionable, safety-first, and concise."},
                    {"role": "user", "content": q}
                ]
            }
            res = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload, timeout=6)
            if res.status_code == 200:
                data = res.json()
                reply = data['choices'][0]['message']['content']
                return {'reply': reply, 'provider': 'OpenAI'}
        except Exception:
            pass

    # 3. Resilient Local Rule-Based Safety Knowledge Fallback
    if 'danger' in lower_q or 'emergency' in lower_q or 'help' in lower_q or 'attack' in lower_q:
        reply = (
            "🚨 **Immediate Safety Priority**:\n\n"
            "If you are in immediate danger right now:\n"
            "1. **Call National Emergency 112** immediately.\n"
            "2. If safe, move towards an open public space, shop, or hospital lobby.\n"
            "3. You can trigger the **Emergency Siren** or **SOS** on the NIRBHAYA dashboard to summon attention."
        )
        actions = [{'label': 'Trigger SOS (112)', 'route': '/physical-safety'}, {'label': 'Emergency Directory', 'route': '/emergency-directory'}]
    elif 'blackmail' in lower_q or 'photos' in lower_q or 'deepfake' in lower_q or 'extort' in lower_q:
        reply = (
            "🔒 **Extortion & Fabricated Media Defense**:\n\n"
            "• **Do NOT pay money or negotiate**: Demands escalate after payment.\n"
            "• **Preserve Evidence**: Take uncropped screenshots with sender IDs and dates.\n"
            "• **Prevent Spread**: Create hash stop-lists at StopNCII.org.\n"
            "• **Report**: Dial **1930** or file at cybercrime.gov.in."
        )
        actions = [{'label': 'Deepfake Detective', 'route': '/deepfake-detective'}, {'label': 'Evidence Vault', 'route': '/evidence-vault'}]
    elif 'lawyer' in lower_q or 'legal' in lower_q or 'fir' in lower_q:
        reply = (
            "⚖️ **Legal Support & Rights Information**:\n\n"
            "• You are entitled to file a **Zero FIR** at ANY police station in India regardless of jurisdiction.\n"
            "• Under Section 12 of the Legal Services Authorities Act, every woman is entitled to **free legal aid** (Call 1516).\n"
            "• Prepare a chronological timeline in the NIRBHAYA Evidence Vault before your consultation."
        )
        actions = [{'label': 'Find Female Advocates', 'route': '/legal-support'}, {'label': 'Emergency Helplines', 'route': '/emergency-directory'}]
    else:
        reply = (
            "Welcome to **NIRBHAYA AI Assistant**.\n\n"
            "I provide guidance on physical safety, digital harassment defense, evidence preservation, and legal resources.\n"
            "How can I assist you with your safety today?"
        )
        actions = [{'label': 'Explore NIRBHAYA Pathway', 'route': '/pathway'}, {'label': 'Digital Guardian', 'route': '/digital-guardian'}]

    return {
        'reply': reply,
        'suggestedActions': actions,
        'provider': 'NIRBHAYA Local Safety Engine'
    }
