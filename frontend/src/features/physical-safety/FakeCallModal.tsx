import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Mic, Volume2, User } from 'lucide-react';
import { audioService } from '@/services/audio/audioService';

export interface FakeCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  callerName?: string;
  callerNumber?: string;
  delaySeconds?: number;
}

export const FakeCallModal: React.FC<FakeCallModalProps> = ({
  isOpen,
  onClose,
  callerName = 'Mom',
  callerNumber = '+91 98765 43210',
  delaySeconds = 0
}) => {
  const [phase, setPhase] = useState<'countdown' | 'ringing' | 'active'>('countdown');
  const [countdown, setCountdown] = useState(delaySeconds);
  const [callDuration, setCallDuration] = useState(0);

  // Handle countdown delay
  useEffect(() => {
    if (!isOpen) return;

    if (delaySeconds > 0) {
      setPhase('countdown');
      setCountdown(delaySeconds);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setPhase('ringing');
            audioService.startRingtone();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setPhase('ringing');
      audioService.startRingtone();
    }
  }, [isOpen, delaySeconds]);

  // Handle call duration counter
  useEffect(() => {
    if (phase === 'active') {
      const timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [phase]);

  // Cleanup audio
  useEffect(() => {
    return () => {
      audioService.stopRingtone();
    };
  }, []);

  const handleAccept = () => {
    audioService.stopRingtone();
    setPhase('active');
    setCallDuration(0);
  };

  const handleDecline = () => {
    audioService.stopRingtone();
    onClose();
  };

  if (!isOpen) return null;

  const formatCallTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 'var(--z-emergency-overlay)',
        backgroundColor: '#090d16',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--space-8) var(--space-6)',
        fontFamily: 'var(--font-family-sans)'
      }}
    >
      {/* Top Disclaimer Header */}
      <div
        style={{
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          border: '1px solid #ef4444',
          borderRadius: 'var(--radius-md)',
          padding: '0.4rem 0.8rem',
          fontSize: '0.75rem',
          color: '#fca5a5',
          textAlign: 'center',
          maxWidth: '400px'
        }}
      >
        DISCREET PRETEXT SIMULATION: Not a real incoming cellular call. Designed to provide a safe conversational exit pretext.
      </div>

      {phase === 'countdown' && (
        <div style={{ textAlign: 'center', margin: 'auto' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Preparing Pretext Call...</h2>
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
            Simulated call from <strong>{callerName}</strong> will ring in <strong>{countdown}</strong> second(s).
          </p>
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem 1.25rem',
              backgroundColor: '#334155',
              color: '#ffffff',
              borderRadius: 'var(--radius-md)'
            }}
          >
            Cancel Simulation
          </button>
        </div>
      )}

      {(phase === 'ringing' || phase === 'active') && (
        <>
          {/* Caller Details */}
          <div style={{ textAlign: 'center', marginTop: 'var(--space-6)' }}>
            <div
              style={{
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                backgroundColor: '#1e293b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                border: '2px solid #334155'
              }}
            >
              <User size={48} color="#94a3b8" />
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              {callerName}
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '0.5rem' }}>
              {callerNumber}
            </p>
            <p style={{ color: phase === 'ringing' ? '#38bdf8' : '#4ade80', fontSize: '0.9rem', fontWeight: 500 }}>
              {phase === 'ringing' ? 'Incoming call...' : `Active Call: ${formatCallTime(callDuration)}`}
            </p>
          </div>

          {/* Active Call Controls / Pretext Script */}
          {phase === 'active' && (
            <div
              style={{
                backgroundColor: '#1e293b',
                borderRadius: 'var(--radius-lg)',
                padding: '1rem 1.25rem',
                maxWidth: '420px',
                width: '100%',
                textAlign: 'left',
                border: '1px solid #334155'
              }}
            >
              <p style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600, marginBottom: '0.25rem' }}>
                💡 Suggested Pretext Dialogue:
              </p>
              <p style={{ fontSize: '0.875rem', color: '#cbd5e1', fontStyle: 'italic', lineHeight: 1.4 }}>
                &ldquo;Hi, yes, I'm almost there right now. I'm just getting out of the taxi / office. I see your car waiting outside, be there in 3 minutes.&rdquo;
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '1rem', color: '#94a3b8' }}>
                <div style={{ textAlign: 'center', fontSize: '0.75rem' }}><Mic size={20} /><br />Mute</div>
                <div style={{ textAlign: 'center', fontSize: '0.75rem' }}><Volume2 size={20} /><br />Speaker</div>
              </div>
            </div>
          )}

          {/* Call Action Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              width: '100%',
              maxWidth: '350px',
              marginBottom: 'var(--space-6)'
            }}
          >
            {phase === 'ringing' ? (
              <>
                <button
                  onClick={handleDecline}
                  aria-label="Decline call"
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    backgroundColor: '#dc2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)'
                  }}
                >
                  <PhoneOff size={32} />
                </button>
                <button
                  onClick={handleAccept}
                  aria-label="Answer call"
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    backgroundColor: '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.4)',
                    animation: 'siren-pulse-smooth 1.5s infinite'
                  }}
                >
                  <Phone size={32} />
                </button>
              </>
            ) : (
              <button
                onClick={handleDecline}
                aria-label="End call"
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  backgroundColor: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)'
                }}
              >
                <PhoneOff size={32} />
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};
