/**
 * NIRBHAYA AI Assistant Service
 * Provides compassionate, safety-first guidance with a robust local rule-based fallback.
 * Strictly respects external AI consent preferences and never leaks user credentials.
 */
import { ChatMessage } from '@/types';

interface BotResponse {
  reply: string;
  suggestedActions?: { label: string; route: string }[];
}

export interface AiStatus {
  externalAiConfigured: boolean;
  providers: string[];
  fallback: string;
  requiresAccountConsent: boolean;
}

export const aiService = {
  async getStatus(): Promise<AiStatus | null> {
    try {
      const response = await fetch('/api/ai/status', { credentials: 'include' });
      if (!response.ok) return null;
      return await response.json() as AiStatus;
    } catch {
      return null;
    }
  },

  /**
   * Generates a thoughtful, structured response to user questions.
   * If backend AI endpoint is accessible and user gave consent, attempts backend call.
   * Otherwise uses comprehensive local safety-rule reasoning engine.
   */
  async sendMessage(
    messageText: string,
    history: ChatMessage[],
    hasExternalConsent: boolean
  ): Promise<ChatMessage> {
    // If user explicitly consented and backend is running, attempt backend call
    if (hasExternalConsent) {
      try {
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: messageText,
            history: history.slice(0, -1).slice(-6)
          })
        });

        if (response.ok) {
          const data = await response.json();
          return {
            id: `msg_${Date.now()}`,
            role: 'assistant',
            content: data.reply,
            timestamp: Date.now(),
            suggestedActions: data.suggestedActions
          };
        }
      } catch {
        // Fall back gracefully to rule-based engine
      }
    }

    // Local Rule-Based Safety Knowledge Engine
    const localResult = this.generateLocalResponse(messageText);
    return {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content: localResult.reply,
      timestamp: Date.now(),
      suggestedActions: localResult.suggestedActions
    };
  },

  generateLocalResponse(query: string): BotResponse {
    const q = query.toLowerCase();

    // 1. Imminent Danger / Emergency
    const emergencyPhrases = [
      'immediate danger', 'in immediate danger', 'danger right now', 'emergency',
      'help me now', 'need help now', 'call 112', 'being attacked',
      'attacking me right now', 'he is here', 'she is here', 'they are here',
      'someone is here', 'about to hurt me', 'about to kill me',
      'threatening me right now', 'following me right now', 'trapped right now'
    ];
    if (emergencyPhrases.some(phrase => q.includes(phrase))) {
      return {
        reply:
          "🚨 **Immediate Safety Priority**:\n\n" +
          "If you are in immediate physical danger right now:\n" +
          "1. **Call National Emergency 112** immediately.\n" +
          "2. If safe to do so, move to a crowded public space, a neighbour's home, or an open shop.\n" +
          "3. You can trigger the **Emergency Siren** on your NIRBHAYA dashboard to draw bystander attention, or tap **SOS** to open your emergency dialer.\n\n" +
          "*Disclaimer: I am an automated safety assistant, not an emergency dispatcher or police agent.*",
        suggestedActions: [
          { label: 'Activate SOS / Dial 112', route: '/physical-safety' },
          { label: 'Emergency Directory', route: '/emergency-directory' }
        ]
      };
    }

    // 2. Blackmail & Extortion / Morphing
    if (q.includes('blackmail') || q.includes('extort') || q.includes('morph') || q.includes('photos') || q.includes('leak') || q.includes('deepfake')) {
      return {
        reply:
          "🔒 **Dealing with Blackmail or Fabricated Images**:\n\n" +
          "I am so sorry you are facing this. Please remember: **You are the victim, not the wrongdoer.**\n\n" +
          "Key protective steps:\n" +
          "• **Do NOT pay money or send additional media**: Demands almost never stop after payment.\n" +
          "• **Preserve Evidence**: Take clear screenshots showing the perpetrator's handle, phone number, date, and messages before blocking them.\n" +
          "• **Inspect Media Carefully**: The Deepfake Detective can record container metadata and signatures, but it cannot prove whether media is fake. Keep the original file and report the threat.\n" +
          "• **Stop Intimate Image Spread**: Visit **StopNCII.org** or **TakeItDown.ncmec.org** to generate digital hashes preventing cross-platform sharing.\n" +
          "• **Report to Cyber Crime**: Dial **1930** or file at [cybercrime.gov.in](https://cybercrime.gov.in).",
        suggestedActions: [
          { label: 'Open Deepfake Detective', route: '/deepfake-detective' },
          { label: 'Save to Evidence Vault', route: '/evidence-vault' },
          { label: 'Explore NIRBHAYA Pathway', route: '/pathway' }
        ]
      };
    }

    // 3. Domestic Abuse / Controlling Partner
    if (q.includes('husband') || q.includes('boyfriend') || q.includes('domestic') || q.includes('partner') || q.includes('hit me') || q.includes('abusive') || q.includes('trapped')) {
      return {
        reply:
          "💜 **Domestic Abuse & Safety Planning**:\n\n" +
          "Living with controlling or abusive behavior is exhausting, and your physical and emotional well-being matters.\n\n" +
          "Important safety considerations:\n" +
          "• **Device Discretion**: If your partner inspects your phone, remember the **Quick Exit** button at the top of every screen. Consider clearing browser history or using private tabs.\n" +
          "• **Safe Haven**: Identify a friend, relative, or One Stop Centre (Sakhi) where you can go if tensions escalate.\n" +
          "• **Essential Documents**: Keep Aadhaar, bank details, certificates, and keys in an accessible grab-bag.\n" +
          "• **Confidential Helplines**: Call the Women Helpline **181** (24/7 toll-free) or National Commission for Women **7827170170**.",
        suggestedActions: [
          { label: 'HerCircle planning tools', route: '/hercircle' },
          { label: 'Legal aid routes', route: '/legal-support' },
          { label: 'NIRBHAYA Pathway Plan', route: '/pathway' }
        ]
      };
    }

    // 4. Stalking / Harassment on Social Media
    if (q.includes('stalk') || q.includes('instagram') || q.includes('whatsapp') || q.includes('harass') || q.includes('following') || q.includes('creepy')) {
      return {
        reply:
          "🛡️ **Digital Harassment & Cyberstalking Response**:\n\n" +
          "Unwanted persistent contact is a serious violation under Section 354D of the Indian Penal Code / BNS.\n\n" +
          "Recommended steps:\n" +
          "1. **Analyze the Message**: Paste the text into **Digital Guardian** to evaluate threat patterns and save to your Evidence Vault.\n" +
          "2. **Do Not Engage**: Perpetrators often thrive on any reaction. Firmly state once that you do not consent to contact, then stop responding.\n" +
          "3. **Lock Down Privacy**: Run our **Privacy Shield** checklist to verify social media audience, story viewers, and disable live location sharing.\n" +
          "4. **Report**: Use the platform's in-app reporting tool and document URLs.",
        suggestedActions: [
          { label: 'Scan Text in Digital Guardian', route: '/digital-guardian' },
          { label: 'Run Privacy Shield Audit', route: '/privacy-shield' }
        ]
      };
    }

    // 5. Preparing for a Lawyer / Legal Consultation
    if (q.includes('lawyer') || q.includes('court') || q.includes('fir') || q.includes('legal') || q.includes('consult')) {
      return {
        reply:
          "⚖️ **Preparing for Legal Consultation**:\n\n" +
          "Consulting a lawyer is most effective when you bring structured facts:\n" +
          "• **Timeline of Events**: Have a chronological sequence of dates, times, and incidents ready (you can generate this automatically in **Evidence Vault**).\n" +
          "• **Uncropped Records**: Keep original electronic files with timestamps.\n" +
          "• **Key Questions to Ask**:\n" +
          "  1. What immediate protection orders (e.g. under Domestic Violence Act) can we seek?\n" +
          "  2. How do we file a Zero FIR or Cyber Complaint without revealing my address?\n" +
          "  3. What is the fee structure or legal aid eligibility (e.g. through NALSA)?\n\n" +
          "*Notice: I provide legal information, not formal legal advice. Please consult a licensed advocate.*",
        suggestedActions: [
          { label: 'Legal aid & sample directory', route: '/legal-support' },
          { label: 'Export Evidence Summary', route: '/evidence-vault' }
        ]
      };
    }

    // Default Guidance
    return {
      reply:
        "Welcome to **NIRBHAYA AI Assistant**. I am here to help you navigate safety resources, digital privacy, and evidence documentation.\n\n" +
        "You can ask me about:\n" +
        "• How to handle online harassment or cyberstalking\n" +
        "• Steps to protect yourself against blackmail or deepfakes\n" +
        "• Safety planning for domestic abuse or physical threats\n" +
        "• Preparing for a legal consultation\n" +
        "• Finding official Indian helplines and support centres\n\n" +
        "How can I assist you right now?",
      suggestedActions: [
        { label: 'Explore NIRBHAYA Pathway', route: '/pathway' },
        { label: 'Text Harassment Analyzer', route: '/digital-guardian' },
        { label: 'Emergency Helplines', route: '/emergency-directory' }
      ]
    };
  }
};
