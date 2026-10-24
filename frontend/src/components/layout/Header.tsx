import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Volume2, VolumeX, ShieldAlert, PhoneCall, Radio, AlertOctagon, User } from 'lucide-react';
import { useSiren } from '@/hooks/useSiren';
import { useAuth } from '@/hooks/useAuth';
import { notificationService } from '@/services/notifications/notificationService';
import { FakeCallModal } from '@/features/physical-safety/FakeCallModal';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/localization/useTranslation';

export const Header: React.FC = () => {
  const { isPlaying, isMuted, audioBlocked, statusMessage, startSiren, stopSiren, toggleMute } = useSiren();
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [isSosConfirmOpen, setIsSosConfirmOpen] = useState(false);
  const [isFakeCallOpen, setIsFakeCallOpen] = useState(false);

  const handleTriggerSos = () => {
    notificationService.triggerEmergencyDialer();
    setIsSosConfirmOpen(false);
  };

  return (
    <>
      <header
        style={{
          height: 'var(--layout-header-height)',
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-color-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 var(--space-6)',
          zIndex: 'var(--z-header)',
          position: 'sticky',
          top: 'var(--layout-quick-exit-height)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-brand-primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-brand-primary)'
            }}
          >
            <ShieldAlert size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-brand-primary)', margin: 0, letterSpacing: '-0.01em' }}>
              NIRBHAYA
            </h1>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>
              {t('tagline')}
            </p>
          </div>
        </div>

        {/* Quick Safety Actions in Top Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {/* Fake Call Pretext Trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFakeCallOpen(true)}
            leftIcon={<PhoneCall size={15} color="var(--color-brand-secondary)" />}
            title="Launch simulated incoming call pretext"
          >
            Fake Call
          </Button>

          {/* Emergency Siren Quick Control */}
          {isPlaying ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
              <Button
                variant="danger"
                size="sm"
                className="siren-active-indicator"
                onClick={stopSiren}
                leftIcon={<AlertOctagon size={16} />}
              >
                STOP SIREN
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute siren' : 'Mute siren'}
                title={isMuted ? 'Unmute audio' : 'Mute audio'}
              >
                {isMuted ? <VolumeX size={16} color="var(--color-danger)" /> : <Volume2 size={16} />}
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={startSiren}
              leftIcon={<Radio size={16} color="var(--color-danger)" />}
              title="Activate piercing audio siren to draw attention"
            >
              Activate Siren
            </Button>
          )}

          {/* Emergency SOS Call Shortcut */}
          <Button
            variant="emergency"
            size="sm"
            onClick={() => setIsSosConfirmOpen(true)}
            leftIcon={<ShieldAlert size={16} />}
          >
            SOS (112)
          </Button>
        </div>
      </header>

      {/* Honest Siren Status Alert if Blocked */}
      {audioBlocked && (
        <div
          style={{
            backgroundColor: 'var(--color-warning-subtle)',
            borderBottom: '1px solid var(--color-warning-border)',
            padding: '0.35rem 1rem',
            fontSize: '0.75rem',
            color: 'var(--color-warning)',
            textAlign: 'center'
          }}
        >
          {statusMessage}
        </div>
      )}

      {/* SOS Confirmation Dialog */}
      <Modal
        isOpen={isSosConfirmOpen}
        onClose={() => setIsSosConfirmOpen(false)}
        title="Emergency SOS Confirmation"
        maxWidth="460px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div
            style={{
              padding: '0.75rem',
              backgroundColor: 'var(--color-danger-subtle)',
              border: '1px solid var(--color-danger-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-danger-hover)',
              fontSize: '0.875rem'
            }}
          >
            <strong>Emergency 112 Call:</strong> Tapping confirm will immediately launch your phone dialer to connect with the National Emergency Response Support System (112).
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            Only use this if you need immediate police, medical, or fire response. Never fake an emergency call.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button variant="outline" onClick={() => setIsSosConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="emergency" onClick={handleTriggerSos}>
              Call 112 Now
            </Button>
          </div>
        </div>
      </Modal>

      {/* Fake Call Pretext Modal */}
      <FakeCallModal
        isOpen={isFakeCallOpen}
        onClose={() => setIsFakeCallOpen(false)}
        callerName="Mom"
        callerNumber="+91 98765 43210"
        delaySeconds={3}
      />
    </>
  );
};
