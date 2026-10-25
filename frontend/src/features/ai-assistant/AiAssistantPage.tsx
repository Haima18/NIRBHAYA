import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bot,
  Send,
  User,
  Info,
  ArrowRight,
  Cpu
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { aiService, AiStatus } from '@/services/ai/aiService';
import { ChatMessage } from '@/types';
import { useAuth } from '@/hooks/useAuth';

export const AiAssistantPage: React.FC = () => {
  const { user, updatePreferences } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'assistant',
      content:
        'Hello, I am the **NIRBHAYA guidance assistant**.\n\n' +
        'I can share general safety steps, help you think through documentation, and point you to official helplines. I am not a lawyer, therapist, or emergency dispatcher, and I cannot contact anyone for you.\n\n' +
        '**What would you like help with?**',
      timestamp: Date.now(),
      suggestedActions: [
        { label: 'Steps for online harassment', route: '/digital-guardian' },
        { label: 'Blackmail / deepfake guidance', route: '/deepfake-detective' },
        { label: 'Emergency helplines', route: '/emergency-directory' }
      ]
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [cloudConsent, setCloudConsent] = useState(Boolean(user?.aiProcessingConsent));
  const [aiStatus, setAiStatus] = useState<AiStatus | null>(null);
  const [consentError, setConsentError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    let mounted = true;
    void aiService.getStatus().then(status => {
      if (mounted) setAiStatus(status);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (user) setCloudConsent(Boolean(user.aiProcessingConsent));
  }, [user]);

  const handleConsentChange = async (checked: boolean) => {
    setCloudConsent(checked);
    setConsentError(null);
    try {
      await updatePreferences({ aiProcessingConsent: checked });
    } catch (error) {
      setCloudConsent(!checked);
      setConsentError(error instanceof Error ? error.message : 'Unable to update AI consent.');
    }
  };

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
      setMessages([
        ...nextHistory,
        {
          id: `msg_error_${Date.now()}`,
          role: 'assistant',
          content:
            'I could not reach the guidance service. If you are in immediate danger, call 112. For non-emergency support, call 181 or 1930.',
          timestamp: Date.now()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', minHeight: 'calc(100dvh - 180px)' }}>
      <div>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--text-primary)' }}>
          NIRBHAYA Guidance Assistant
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
          General safety guidance and resource signposting. Not legal advice, therapy, or emergency response.
        </p>
      </div>

      {/* Consent & safety banner */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-info-subtle)',
          border: '1px solid var(--color-info-border)',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Info size={16} color="var(--color-info)" />
          <span>
            <strong>Disclaimer:</strong> This assistant gives general guidance. It is not a lawyer, therapist, or
            emergency dispatcher, and it cannot send an SOS or contact anyone for you.
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Cpu size={16} color="var(--text-muted)" />
          <span>
            <strong>Provider:</strong>{' '}
            {aiStatus
              ? aiStatus.externalAiConfigured
                ? `External provider configured (${aiStatus.providers.join(', ')})`
                : 'No external provider configured — local guidance engine only'
              : 'Provider status unavailable'}
          </span>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontWeight: 600 }}>
          <input
            type="checkbox"
            checked={cloudConsent}
            onChange={e => void handleConsentChange(e.target.checked)}
          />
          Allow external AI processing (saved to your account)
        </label>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          When no provider key is configured, enabling this does not create a connection; the local guidance engine is
          used. Messages may contain sensitive details, so enable this only if you understand the provider&apos;s data
          handling.
        </span>
      </div>

      {consentError && <Alert type="danger" title="Consent update failed">{consentError}</Alert>}

      {/* Chat Messages Container */}
      <Card
        style={{
          flex: '1 1 480px',
          minHeight: 'min(58vh, 640px)',
          maxHeight: '68vh',
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
                maxWidth: isUser ? '85%' : '100%',
                width: isUser ? 'fit-content' : '100%'
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
                  backgroundColor: isUser ? 'var(--color-brand-solid)' : 'var(--bg-surface)',
                  color: isUser ? '#ffffff' : 'var(--text-primary)',
                  padding: '0.85rem 1.15rem',
                  borderRadius: 'var(--radius-lg)',
                  border: isUser ? 'none' : '1px solid var(--border-color-default)',
                  boxShadow: 'var(--shadow-xs)',
                  fontSize: '0.9rem',
                  lineHeight: 1.55,
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'anywhere',
                  width: isUser ? 'fit-content' : 'min(100%, 760px)'
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
                    backgroundColor: 'var(--color-brand-solid)',
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
            <Bot size={16} /> Preparing guidance...
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

      {/* Character.ai link */}
      <button
        type="button"
        onClick={() => window.open('https://character.ai/chat/N0MDhwKwK9BuoONLYZfk5fcsDJ1lldABF2jQkZl2CYM', '_blank')}
        style={{
          marginTop: '1rem',
          padding: '0.9rem 1rem',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color-default)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          cursor: 'pointer',
          fontSize: '0.85rem',
          color: 'var(--text-primary)',
          fontWeight: 500,
          width: '100%',
          justifyContent: 'center',
          textAlign: 'left'
        }}
      >
        <Bot size={18} />
        <span>Chat on Character.ai — open your character in a new tab</span>
        <ArrowRight size={14} />
      </button>

      {/* Chat Input Bar */}
      <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.75rem', padding: '0.5rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '2px solid var(--color-brand-primary-light)', boxShadow: 'var(--shadow-md)' }}>
        <textarea
          placeholder="Type your safety question or describe your situation..."
          value={input}
          onChange={e => setInput(e.target.value)}
          rows={2}
          style={{
            flexGrow: 1,
            padding: '0.875rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color-default)',
            backgroundColor: 'var(--bg-app)',
            fontSize: '1rem',
            outline: 'none',
            resize: 'vertical',
            minHeight: '60px',
            fontFamily: 'inherit'
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend(e as any);
            }
          }}
        />
        <Button variant="primary" type="submit" disabled={!input.trim() || loading} leftIcon={<Send size={20} />} style={{ minWidth: '100px', height: 'fit-content', alignSelf: 'flex-end' }}>
          Send
        </Button>
      </form>
    </div>
  );
};
