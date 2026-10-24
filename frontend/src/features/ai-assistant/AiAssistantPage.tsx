import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bot,
  Send,
  User,
  ShieldAlert,
  Sparkles,
  Info,
  ArrowRight
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { aiService } from '@/services/ai/aiService';
import { storageService } from '@/services/storage/storageService';
import { ChatMessage } from '@/types';

export const AiAssistantPage: React.FC = () => {
  const profile = storageService.getProfile();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'assistant',
      content:
        'Hello, I am the **NIRBHAYA AI Assistant**.\n\n' +
        'I am designed to provide immediate safety guidance, help you document incidents, evaluate digital threats, and prepare for legal or counselor consultations.\n\n' +
        '**How can I assist you today?**',
      timestamp: Date.now(),
      suggestedActions: [
        { label: 'Steps for online harassment', route: '/digital-guardian' },
        { label: 'Blackmail / Deepfake defense', route: '/deepfake-detective' },
        { label: 'Emergency Helplines', route: '/emergency-directory' }
      ]
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [cloudConsent, setCloudConsent] = useState(profile.aiProcessingConsent);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput('');
    setLoading(true);

    try {
      const assistantMsg = await aiService.sendMessage(input, nextHistory, cloudConsent);
      setMessages([...nextHistory, assistantMsg]);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', height: 'calc(100vh - 180px)' }}>
      <div>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--text-primary)' }}>
          NIRBHAYA AI Assistant
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
          Trauma-informed conversational guide for threat response, privacy audit preparation, and legal consultation summaries.
        </p>
      </div>

      {/* Consent & Safety Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
          padding: '0.6rem 1rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-info-subtle)',
          border: '1px solid var(--color-info-border)',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Info size={16} color="var(--color-info)" />
          <span>
            <strong>Disclaimer:</strong> Automated assistant provides safety guidance; it is not a lawyer, therapist, or emergency dispatcher.
          </span>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontWeight: 600 }}>
          <input
            type="checkbox"
            checked={cloudConsent}
            onChange={e => {
              setCloudConsent(e.target.checked);
              storageService.saveProfile({ ...profile, aiProcessingConsent: e.target.checked });
            }}
          />
          Cloud AI Sync Enabled (Default: Offline Heuristic Engine)
        </label>
      </div>

      {/* Chat Messages Container */}
      <Card
        style={{
          flexGrow: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
          padding: 'var(--space-6)',
          backgroundColor: 'var(--bg-app)'
        }}
      >
        {messages.map(msg => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                gap: '0.75rem',
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '85%'
              }}
            >
              {!isUser && (
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-brand-primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-brand-primary)',
                    flexShrink: 0
                  }}
                >
                  <Bot size={18} />
                </div>
              )}

              <div
                style={{
                  backgroundColor: isUser ? 'var(--color-brand-primary)' : 'var(--bg-surface)',
                  color: isUser ? '#ffffff' : 'var(--text-primary)',
                  padding: '0.85rem 1.15rem',
                  borderRadius: 'var(--radius-lg)',
                  border: isUser ? 'none' : '1px solid var(--border-color-default)',
                  boxShadow: 'var(--shadow-xs)',
                  fontSize: '0.9rem',
                  lineHeight: 1.55,
                  whiteSpace: 'pre-wrap'
                }}
              >
                {msg.content}

                {/* Suggested Shortcut Actions */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color-default)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {msg.suggestedActions.map((act, aIdx) => (
                      <Link
                        key={aIdx}
                        to={act.route}
                        style={{
                          fontSize: '0.75rem',
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: 'var(--color-brand-primary-subtle)',
                          border: '1px solid var(--color-brand-primary-light)',
                          color: 'var(--color-brand-primary)',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        {act.label} <ArrowRight size={10} />
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {isUser && (
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-neutral-800)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    flexShrink: 0
                  }}
                >
                  <User size={18} />
                </div>
              )}
            </div>
          );
        })}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <Bot size={16} /> NIRBHAYA Assistant is analyzing guidance...
          </div>
        )}
        <div ref={messagesEndRef} />
      </Card>

      {/* Suggested Quick Prompts */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {[
          'Someone is blackmailing me with photos, what do I do?',
          'What questions should I ask when consulting a female lawyer?',
          'How do I prepare an emergency bag for domestic safety?',
          'Someone created a fake profile with my pictures'
        ].map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSuggestedPrompt(p)}
            style={{
              fontSize: '0.75rem',
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color-default)',
              color: 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            💬 {p}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          placeholder="Type your safety question or describe your situation..."
          value={input}
          onChange={e => setInput(e.target.value)}
          style={{
            flexGrow: 1,
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color-default)',
            backgroundColor: 'var(--bg-surface)',
            fontSize: '0.9rem',
            outline: 'none'
          }}
        />
        <Button variant="primary" type="submit" disabled={!input.trim() || loading} leftIcon={<Send size={18} />}>
          Send
        </Button>
      </form>
    </div>
  );
};
