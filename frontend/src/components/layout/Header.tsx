import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Volume2, VolumeX, ShieldAlert, PhoneCall, Radio, AlertOctagon } from 'lucide-react';
import { useSiren } from '@/hooks/useSiren';
import { notificationService } from '@/services/notifications/notificationService';
import { FakeCallModal } from '@/features/physical-safety/FakeCallModal';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ButterflyMotif } from '@/components/ui/ButterflyMotif';
import { useTranslation } from '@/localization/useTranslation';

export const Header: React.FC = () => {
  const { isPlaying, isMuted, audioBlocked, statusMessage, startSiren, stopSiren, toggleMute } = useSiren();
  const { t } = useTranslation();
  const [isSosConfirmOpen, setIsSosConfirmOpen] = useState(false);
  const [isFakeCallOpen, setIsFakeCallOpen] = useState(false);

  const handleTriggerSos = () => {
    notificationService.triggerEmergencyDialer();
    setIsSosConfirmOpen(false);
  };

  return (
    <>
      <header className="app-header">
        <Link to="/" className="app-brand" aria-label="NIRBHAYA dashboard">
          <span className="app-brand__mark">
            <ButterflyMotif size={27} glowColor="rgba(118, 84, 180, .4)" />
          </span>
          <span>
            <span className="app-brand__name">NIRBHAYA</span>
            <span className="app-brand__tagline">{t('tagline')}</span>
          </span>
        </Link>

        <div className="app-header__actions">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFakeCallOpen(true)}
            leftIcon={<PhoneCall size={14} color="var(--color-brand-secondary)" />}
            title="Launch a simulated incoming-call pretext"
          >
            Fake Call
          </Button>

          {isPlaying ? (
            <>
              <Button
                variant="danger"
                size="sm"
                className="siren-active-indicator"
                onClick={stopSiren}
                leftIcon={<AlertOctagon size={15} />}
              >
                Stop Siren
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute siren' : 'Mute siren'}
                title={isMuted ? 'Unmute audio' : 'Mute audio'}
              >
                {isMuted ? <VolumeX size={15} color="var(--color-danger)" /> : <Volume2 size={15} />}
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={startSiren}
              leftIcon={<Radio size={15} color="var(--color-danger)" />}
              title="Activate a local browser siren to draw attention"
            >
              Activate Siren
            </Button>
          )}

          <Button
            variant="emergency"
            size="sm"
            onClick={() => setIsSosConfirmOpen(true)}
            leftIcon={<ShieldAlert size={15} />}
          >
            SOS 112
          </Button>
        </div>
      </header>

      {audioBlocked && (
        <div className="dashboard-note" role="status">
          {statusMessage}
        </div>
      )}

      <Modal
        isOpen={isSosConfirmOpen}
        onClose={() => setIsSosConfirmOpen(false)}
        title="Emergency SOS confirmation"
        maxWidth="460px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div
            style={{
              padding: '0.8rem 0.9rem',
              backgroundColor: 'var(--color-danger-subtle)',
              border: '1px solid var(--color-danger-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-danger-hover)',
              fontSize: '0.82rem',
              lineHeight: 1.55
            }}
          >
            <strong>Emergency 112 call:</strong> Tapping confirm opens your phone dialer with 112 filled in. You must
            press the call button yourself; NIRBHAYA cannot place the call or confirm that anyone answers.
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
            Only use this if you need immediate police, medical, or fire response. Never fake an emergency call.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '0.25rem' }}>
            <Button variant="outline" onClick={() => setIsSosConfirmOpen(false)}>Cancel</Button>
            <Button variant="emergency" onClick={handleTriggerSos}>Call 112 now</Button>
          </div>
        </div>
      </Modal>

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
