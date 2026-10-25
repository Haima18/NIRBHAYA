import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Radio,
  Clock,
  Navigation,
  PhoneCall,
  Volume2,
  VolumeX,
  Plus,
  Trash2,
  AlertTriangle,
  MapPin,
  CheckCircle,
  ExternalLink,
  Copy,
  Link2,
  RefreshCw,
  Pencil,
  Share2,
  Info
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { Tabs } from '@/components/ui/Tabs';
import { useSiren } from '@/hooks/useSiren';
import { useCheckInTimer } from '@/hooks/useCheckInTimer';
import { useJourney } from '@/hooks/useJourney';
import { useAuth } from '@/hooks/useAuth';
import { storageService } from '@/services/storage/storageService';
import { notificationService, AlertDraft } from '@/services/notifications/notificationService';
import { locationService } from '@/services/location/locationService';
import { locationShareService } from '@/services/location/locationShareService';
import { FakeCallModal } from './FakeCallModal';
import { LocationShare, TrustedContact } from '@/types';

export const PhysicalSafetyPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('sos_siren');
  const { user } = useAuth();

  const { isPlaying, isMuted, audioBlocked, statusMessage, startSiren, stopSiren, toggleMute } = useSiren();
  const { session, remainingSeconds, isExpired, startSession, confirmSafe, extendSession, cancelSession } = useCheckInTimer();
  const { journey, isOverdue, trackingError, startJourney, confirmArrival, cancelJourney } = useJourney();

  const [timerDuration, setTimerDuration] = useState(15);
  const [timerNote, setTimerNote] = useState('');
  const [destinationInput, setDestinationInput] = useState('');
  const [etaInput, setEtaInput] = useState(30);

  const [contacts, setContacts] = useState<TrustedContact[]>(() => storageService.getTrustedContacts());
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRel, setNewContactRel] = useState('Friend');
  const [editingContactId, setEditingContactId] = useState<string | null>(null);

  const [sosStatus, setSosStatus] = useState<string | null>(null);
  const [sosDraft, setSosDraft] = useState<AlertDraft | null>(null);
  const [checkInDraft, setCheckInDraft] = useState<AlertDraft | null>(null);
  const [copyNotice, setCopyNotice] = useState<string | null>(null);
  const [smsSending, setSmsSending] = useState(false);

  const [isFakeCallOpen, setIsFakeCallOpen] = useState(false);
  const [fakeCallerName, setFakeCallerName] = useState('Mom');
  const [fakeCallDelay, setFakeCallDelay] = useState(5);

  const [shareRecipient, setShareRecipient] = useState('Trusted contact');
  const [shareMinutes, setShareMinutes] = useState(60);
  const [activeShare, setActiveShare] = useState<LocationShare | null>(null);
  const [shareBusy, setShareBusy] = useState(false);
  const [shareNotice, setShareNotice] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);
  const [liveUpdates, setLiveUpdates] = useState(false);
  const [liveUpdateInterval, setLiveUpdateInterval] = useState<ReturnType<typeof setInterval> | null>(null);

  const nearbyResources = locationService.getNearbyResources(null);
  const directoryLinks = locationService.getOfficialDirectoryLinks();

  useEffect(() => {
    const loadShares = async () => {
      try {
        const shares = await locationShareService.list();
        const current = shares.find(item => item.active) || null;
        if (current) setActiveShare(current);
      } catch {
        // The sharing panel explains connection errors when the user acts.
      }
    };
    void loadShares();
  }, []);

  const handleTriggerSos = async () => {
    setCopyNotice(null);
    const dialResult = notificationService.triggerEmergencyDialer();
    let coords = null;
    if (user?.locationConsent) {
      const location = await locationService.getCurrentPosition();
      if (location.success && location.coords) coords = location.coords;
    }
    const draft = notificationService.buildTrustedContactsDraft(
      contacts,
      coords,
      'SOS control activated in NIRBHAYA',
      Boolean(user?.locationConsent && coords)
    );
    setSosDraft(draft.recipientsCount > 0 ? draft : null);
    setSosStatus(
      draft.recipientsCount > 0
        ? `${dialResult.statusMessage} An SMS draft is ready below; it has NOT been sent.`
        : `${dialResult.statusMessage} No trusted contacts are enabled for SOS, so no message draft was created.`
    );
  };

  const handleOpenDraft = (draft: AlertDraft) => {
    const result = notificationService.openTrustedContactsSms(draft);
    setSosStatus(result.statusMessage);
    setCopyNotice(null);
  };

  const handleSendSms = async (draft: AlertDraft) => {
    if (!window.confirm(`Send an emergency SMS through the configured provider to ${draft.recipientsCount} selected contact(s)? Carrier charges may apply. NIRBHAYA cannot confirm delivery.`)) return;
    setSmsSending(true);
    setSosStatus(null);
    try {
      const result = await notificationService.sendSmsAlert(draft);
      setSosStatus(`${result.message} Accepted: ${result.acceptedCount}; failed: ${result.failedCount}.`);
    } catch (error) {
      setSosStatus(error instanceof Error ? error.message : 'SMS could not be sent. Use the manual SMS draft instead.');
    } finally {
      setSmsSending(false);
    }
  };

  const handleCopyDraft = async (draft: AlertDraft) => {
    const copied = await notificationService.copyAlertText(draft.body);
    setCopyNotice(copied ? 'Alert text copied. Send it only through a channel you trust.' : 'Could not copy automatically. Select the text below and copy it manually.');
  };

  const handleBuildCheckInDraft = () => {
    const draft = notificationService.buildTrustedContactsDraft(
      contacts,
      null,
      'My NIRBHAYA check-in deadline passed. Please check on me.',
      false,
      'checkin'
    );
    setCheckInDraft(draft.recipientsCount > 0 ? draft : null);
    if (draft.recipientsCount === 0) {
      setCheckInDraft({
        ...draft,
        body: 'No trusted contacts are enabled for missed check-ins. Add or enable one in the Trusted Circle tab.'
      });
    }
  };

  const resetContactForm = () => {
    setEditingContactId(null);
    setNewContactName('');
    setNewContactPhone('');
    setNewContactRel('Friend');
  };

  const handleSaveContact = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) return;

    if (editingContactId) {
      const updated = contacts.map(contact => contact.id === editingContactId
        ? { ...contact, name: newContactName.trim(), phone: newContactPhone.trim(), relationship: newContactRel.trim() || 'Contact' }
        : contact);
      storageService.saveTrustedContacts(updated);
      setContacts(updated);
      resetContactForm();
      return;
    }

    const newContact: TrustedContact = {
      id: `contact_${Date.now()}`,
      name: newContactName.trim(),
      phone: newContactPhone.trim(),
      relationship: newContactRel.trim() || 'Contact',
      notifyOnSOS: true,
      notifyOnCheckInMissed: true
    };
    const updated = [...contacts, newContact];
    storageService.saveTrustedContacts(updated);
    setContacts(updated);
    resetContactForm();
  };

  const handleEditContact = (contact: TrustedContact) => {
    setEditingContactId(contact.id);
    setNewContactName(contact.name);
    setNewContactPhone(contact.phone);
    setNewContactRel(contact.relationship);
  };

  const handleToggleContact = (id: string, field: 'notifyOnSOS' | 'notifyOnCheckInMissed') => {
    const updated = contacts.map(contact => contact.id === id ? { ...contact, [field]: !contact[field] } : contact);
    storageService.saveTrustedContacts(updated);
    setContacts(updated);
  };

  const handleDeleteContact = (id: string) => {
    if (!window.confirm('Remove this trusted contact from this browser?')) return;
    const updated = contacts.filter(contact => contact.id !== id);
    storageService.saveTrustedContacts(updated);
    setContacts(updated);
    if (editingContactId === id) resetContactForm();
  };

  const createShare = async () => {
    setShareBusy(true);
    setShareError(null);
    setShareNotice(null);
    try {
      if (!user?.locationConsent) {
        throw new Error('Location consent is off. Enable it in Settings before creating a share link.');
      }
      const position = await locationService.getCurrentPosition();
      if (!position.success || !position.coords) {
        throw new Error(position.error || 'A current device location is required to create a live share.');
      }
      const share = await locationShareService.create({
        recipientLabel: shareRecipient.trim() || 'Trusted contact',
        message: journey?.status === 'in_progress' ? `Journey to ${journey.destination}` : 'Location shared from NIRBHAYA.',
        minutes: shareMinutes,
        lat: position.coords.lat,
        lng: position.coords.lng,
        accuracyMeters: position.accuracyMeters
      });
      if (share.ownerToken) locationShareService.rememberOwnerToken(share.token, share.ownerToken);
      setActiveShare(share);
      setShareNotice(`Share link created. It expires ${new Date(share.expiresAt).toLocaleString()}. The recipient must still open the link; no message is sent automatically.`);
    } catch (error) {
      setShareError(error instanceof Error ? error.message : 'Could not create the share link.');
    } finally {
      setShareBusy(false);
    }
  };

  const updateShare = async () => {
    if (!activeShare) return;
    const ownerToken = activeShare.ownerToken || locationShareService.getOwnerToken(activeShare.token);
    if (!ownerToken) {
      setShareError('This browser no longer holds the owner secret for this share. Stop it and create a new link.');
      return;
    }
    setShareBusy(true);
    setShareError(null);
    try {
      const position = await locationService.getCurrentPosition();
      if (!position.success || !position.coords) throw new Error(position.error || 'Location is unavailable.');
      const updated = await locationShareService.update(
        activeShare.token,
        ownerToken,
        position.coords.lat,
        position.coords.lng,
        position.accuracyMeters
      );
      setActiveShare({ ...updated, ownerToken });
      setShareNotice('Shared coordinates updated.');
    } catch (error) {
      setShareError(error instanceof Error ? error.message : 'Could not update the shared location.');
    } finally {
      setShareBusy(false);
    }
  };

  const stopShare = async () => {
    if (!activeShare) return;
    const ownerToken = activeShare.ownerToken || locationShareService.getOwnerToken(activeShare.token);
    if (!ownerToken) {
      setShareError('The owner secret is not available in this browser. The link will expire automatically at its stated time.');
      return;
    }
    setShareBusy(true);
    setShareError(null);
    try {
      await locationShareService.stop(activeShare.token, ownerToken);
      locationShareService.forgetOwnerToken(activeShare.token);
      setActiveShare(null);
      setLiveUpdates(false);
      if (liveUpdateInterval) {
        clearInterval(liveUpdateInterval);
        setLiveUpdateInterval(null);
      }
      setShareNotice('Sharing stopped and the stored coordinates were cleared on the server.');
    } catch (error) {
      setShareError(error instanceof Error ? error.message : 'Could not stop the share.');
    } finally {
      setShareBusy(false);
    }
  };

  const fetchAndUpdateLocation = async () => {
    if (!activeShare) return;
    const ownerToken = activeShare.ownerToken || locationShareService.getOwnerToken(activeShare.token);
    if (!ownerToken) return;
    try {
      const position = await locationService.getCurrentPosition();
      if (!position.success || !position.coords) return;
      const updated = await locationShareService.update(
        activeShare.token,
        ownerToken,
        position.coords.lat,
        position.coords.lng,
        position.accuracyMeters
      );
      setActiveShare({ ...updated, ownerToken });
    } catch {
      // Silent on intermittent update failures; the panel retries on the next tick.
    }
  };

  const startLiveUpdates = () => {
    setLiveUpdates(true);
    void fetchAndUpdateLocation();
    const interval = setInterval(() => void fetchAndUpdateLocation(), 30000);
    setLiveUpdateInterval(interval);
  };

  const stopLiveUpdates = () => {
    setLiveUpdates(false);
    if (liveUpdateInterval) {
      clearInterval(liveUpdateInterval);
      setLiveUpdateInterval(null);
    }
  };

  const copyShareLink = async () => {
    if (!activeShare) return;
    const copied = await notificationService.copyAlertText(locationShareService.shareUrl(activeShare));
    setCopyNotice(copied ? 'Share link copied.' : 'Could not copy the link. Select it manually.');
  };

  const formatTimer = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const renderSharePanel = () => (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <Share2 size={20} color="var(--color-brand-primary)" />
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Consent-based location sharing</h3>
      </div>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
        Creates a random, expiring recipient link on the NIRBHAYA server. It is not a public live map and nobody can list your location.
        NIRBHAYA does not send the link for you.
      </p>

      {!user?.locationConsent && (
        <Alert type="warning" title="Location consent is off">
          Enable location consent in <Link to="/settings">Settings</Link> before creating a share link.
        </Alert>
      )}

      {shareError && <Alert type="danger" title="Sharing error">{shareError}</Alert>}
      {shareNotice && <Alert type="success" title="Sharing status">{shareNotice}</Alert>}
      {copyNotice && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{copyNotice}</div>}

      {activeShare ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem' }}>
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color-default)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
              <strong style={{ fontSize: '0.9rem' }}>{activeShare.recipientLabel}</strong>
              <span style={{ fontSize: '0.78rem', color: activeShare.active ? 'var(--color-success)' : 'var(--color-danger)' }}>
                {activeShare.active ? 'Active until ' : 'Not active — '}{new Date(activeShare.expiresAt).toLocaleString()}
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', wordBreak: 'break-all', margin: '0.4rem 0 0' }}>
              {locationShareService.shareUrl(activeShare)}
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.4rem 0 0' }}>
              {activeShare.location
                ? `Last fetched: ${new Date(activeShare.location.recordedAt || activeShare.updatedAt || '').toLocaleString()} (±${activeShare.location.accuracyMeters ? Math.round(activeShare.location.accuracyMeters) + ' m' : 'accuracy not reported'})`
                : 'No coordinates have been sent to this link yet.'}
            </p>
            <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                id={`live-updates-${activeShare.token}`}
                checked={liveUpdates}
                onChange={() => (liveUpdates ? stopLiveUpdates() : startLiveUpdates())}
                style={{ width: '16px', height: '16px' }}
              />
              <label htmlFor={`live-updates-${activeShare.token}`} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', cursor: 'pointer', margin: 0 }}>
                {liveUpdates ? 'Stop live updates' : 'Send live location updates every 30s'}
              </label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Button variant="outline" size="sm" onClick={copyShareLink} leftIcon={<Copy size={15} />}>Copy link</Button>
            <Button variant="primary" size="sm" onClick={updateShare} isLoading={shareBusy} leftIcon={<RefreshCw size={15} />}>Update now</Button>
            <Button variant="danger" size="sm" onClick={stopShare} isLoading={shareBusy} leftIcon={<Trash2 size={15} />}>Stop sharing</Button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem' }}>
          <Input label="Recipient label (for your reference)" value={shareRecipient} onChange={e => setShareRecipient(e.target.value)} />
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              Link lifetime
            </label>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {[15, 30, 60, 240].map(minutes => (
                <button
                  key={minutes}
                  type="button"
                  onClick={() => setShareMinutes(minutes)}
                  style={{
                    padding: '0.4rem 0.7rem',
                    borderRadius: 'var(--radius-full)',
                    border: shareMinutes === minutes ? '2px solid var(--color-brand-primary)' : '1px solid var(--border-color-default)',
                    backgroundColor: shareMinutes === minutes ? 'var(--color-brand-primary-subtle)' : 'var(--bg-surface)',
                    fontWeight: shareMinutes === minutes ? 700 : 500
                  }}
                >
                  {minutes < 60 ? `${minutes} min` : `${minutes / 60} hr`}
                </button>
              ))}
            </div>
          </div>
          <Button variant="primary" onClick={createShare} isLoading={shareBusy} leftIcon={<Link2 size={16} />}>
            Create expiring share link
          </Button>
        </div>
      )}
    </Card>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--text-primary)' }}>
          Physical Safety & Rapid Response
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
          A local siren, a 112 dialer shortcut, check-in timers, journey tracking, and consent-based expiring location links.
        </p>
      </div>

      <Tabs
        tabs={[
          { id: 'sos_siren', label: 'Emergency Siren & SOS', icon: <Radio size={16} /> },
          { id: 'checkin', label: 'Safety Check-in Timer', icon: <Clock size={16} /> },
          { id: 'journey', label: 'Journey Guardian', icon: <Navigation size={16} /> },
          { id: 'discreet', label: 'Discreet Tools & Fake Call', icon: <PhoneCall size={16} /> },
          { id: 'contacts', label: 'Trusted Circle Contacts', icon: <Plus size={16} /> }
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'sos_siren' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
          <Card variant={isPlaying ? 'danger' : 'default'}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'var(--color-danger-light)', color: 'var(--color-danger)' }}>
                <Radio size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 600, margin: 0 }}>Emergency Siren</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Loud local alarm generated by this browser</p>
              </div>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.4 }}>
              Uses your device's Web Audio output to make a loud modulated tone. It can attract attention or disrupt an aggressor, but it does not call the police.
            </p>

            <Alert type="info">
              <strong>Device notice:</strong> Turn up the device volume. This is a local sound only; it is not a monitored alarm.
            </Alert>

            <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {isPlaying ? (
                <>
                  <Button variant="danger" size="lg" className="siren-active-indicator" onClick={stopSiren}>STOP SIREN</Button>
                  <Button variant="outline" size="lg" onClick={toggleMute}>
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />} {isMuted ? 'Unmute' : 'Mute'}
                  </Button>
                </>
              ) : (
                <Button variant="danger" size="lg" onClick={startSiren} leftIcon={<Radio size={18} />}>Activate Emergency Siren</Button>
              )}
            </div>

            <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: isPlaying ? 'var(--color-danger)' : 'var(--text-muted)' }}>
              Status: <strong>{statusMessage}</strong>
            </div>
            {audioBlocked && <div style={{ marginTop: '0.5rem' }}><Alert type="warning">Audio was blocked by the browser. Tap the siren button again and allow sound.</Alert></div>}
          </Card>

          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'var(--color-danger-light)', color: 'var(--color-danger)' }}>
                <ShieldAlert size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 600, margin: 0 }}>Emergency SOS (112)</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Opens your device dialer. Does not dispatch help.</p>
              </div>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.4 }}>
              Tapping SOS opens <strong>tel:112 (India)</strong> and prepares an optional SMS draft for enabled trusted contacts. Outside India, call your local emergency number. You must press send in your messaging app; NIRBHAYA cannot confirm delivery.
            </p>

            <Alert type="warning">
              If you cannot speak, use the siren and try to reach another person. Do not wait for an app to summon help.
            </Alert>

            <div style={{ marginTop: '1.25rem' }}>
              <Button variant="emergency" size="lg" style={{ width: '100%', height: '56px', fontSize: '1.1rem' }} onClick={handleTriggerSos} leftIcon={<ShieldAlert size={24} />}>
                OPEN 112 DIALER & PREPARE ALERT
              </Button>
            </div>

            {sosStatus && (
              <div style={{ marginTop: '1rem', padding: '0.65rem', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {sosStatus}
              </div>
            )}

            {sosDraft && (
              <div style={{ marginTop: '0.75rem', padding: '0.75rem', border: '1px solid var(--border-color-default)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface)' }}>
                <strong style={{ fontSize: '0.85rem' }}>SMS draft (not sent)</strong>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', margin: '0.35rem 0' }}>{sosDraft.body}</p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <Button variant="outline" size="sm" onClick={() => handleOpenDraft(sosDraft)}>Open SMS app</Button>
                  <Button variant="ghost" size="sm" onClick={() => void handleCopyDraft(sosDraft)} leftIcon={<Copy size={14} />}>Copy text</Button>
                  <Button variant="primary" size="sm" isLoading={smsSending} disabled={smsSending} onClick={() => void handleSendSms(sosDraft)}>Send via configured gateway</Button>
                </div>
              </div>
            )}
          </Card>

          <div style={{ gridColumn: '1 / -1' }}>{renderSharePanel()}</div>
        </div>
      )}

      {activeTab === 'checkin' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
          <Card>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>Safety Check-in Timer</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.4 }}>
              Set a countdown when walking alone or entering an unfamiliar situation. When it expires, NIRBHAYA shows a manual alert option. It does not send SMS automatically.
            </p>

            {session?.status === 'active' ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-6) 0' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Remaining time:</p>
                <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--color-danger)', letterSpacing: '0.05em' }}>{formatTimer(remainingSeconds)}</div>
                {session.note && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Note: “{session.note}”</p>}
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                  <Button variant="primary" size="lg" onClick={confirmSafe} leftIcon={<CheckCircle size={18} />}>I Am Safe (Check In)</Button>
                  <Button variant="outline" onClick={() => extendSession(15)}>+15 min</Button>
                  <Button variant="ghost" onClick={cancelSession}>Cancel session</Button>
                </div>
              </div>
            ) : isExpired ? (
              <div style={{ padding: 'var(--space-4) 0' }}>
                <Alert type="danger" title="Check-in deadline missed">
                  The timer expired. No message has been sent. You can review and open an SMS draft below, or confirm that you are safe.
                </Alert>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <Button variant="primary" onClick={confirmSafe}>I am safe now</Button>
                  <Button variant="outline" onClick={() => extendSession(10)}>Extend by 10 min</Button>
                  <Button variant="outline" onClick={handleBuildCheckInDraft} leftIcon={<PhoneCall size={16} />}>Prepare check-in alert</Button>
                </div>
                {checkInDraft && (
                  <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)' }}>
                    <p style={{ fontSize: '0.8rem', whiteSpace: 'pre-wrap', margin: 0 }}>{checkInDraft.body}</p>
                    {checkInDraft.recipientsCount > 0 && (
                      <Button variant="outline" size="sm" style={{ marginTop: '0.5rem' }} onClick={() => handleOpenDraft(checkInDraft)}>Open SMS app</Button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Choose timer duration:</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {[5, 15, 30, 60].map(minutes => (
                      <button
                        key={minutes}
                        type="button"
                        onClick={() => setTimerDuration(minutes)}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          borderRadius: 'var(--radius-md)',
                          border: timerDuration === minutes ? '2px solid var(--color-brand-primary)' : '1px solid var(--border-color-default)',
                          backgroundColor: timerDuration === minutes ? 'var(--color-brand-primary-subtle)' : 'var(--bg-surface)',
                          fontWeight: timerDuration === minutes ? 600 : 500
                        }}
                      >
                        {minutes} min
                      </button>
                    ))}
                  </div>
                </div>
                <Input label="Session note (optional)" placeholder="e.g. Taking cab to Rohini Sector 14" value={timerNote} onChange={e => setTimerNote(e.target.value)} />
                <Button variant="primary" size="lg" onClick={() => startSession(timerDuration, timerNote)} leftIcon={<Clock size={18} />}>Start check-in timer ({timerDuration}m)</Button>
              </div>
            )}
          </Card>

          <Card>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Timer limitations</h3>
            <ul style={{ margin: '0 0 0 1.1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <li>If the browser is closed or the device loses power, JavaScript timers stop. Keep the tab open or use a real alarm as backup.</li>
              <li>Expiry only reveals a manual alert option. It does not contact anyone automatically.</li>
              <li>Only contacts with “missed check-in” enabled are included in the prepared draft.</li>
              <li>If you are in immediate danger, call <strong>112</strong> rather than waiting for a timer.</li>
            </ul>
          </Card>
        </div>
      )}

      {activeTab === 'journey' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
          <Card>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>Journey Guardian</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.4 }}>
              Records device-location waypoints while this browser tab is open. Sharing is separate: create an expiring link only when you choose.
            </p>

            {journey?.status === 'in_progress' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Alert type={isOverdue ? 'warning' : 'success'} title={isOverdue ? 'ETA passed — no alert was sent' : 'Journey active in this browser'}>
                  Destination: <strong>{journey.destination}</strong> · ETA: <strong>{journey.etaMinutes} minutes</strong>
                </Alert>
                {isOverdue && <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>If you are concerned, use the share panel or call 112. NIRBHAYA does not contact anyone on its own.</p>}
                {trackingError && <Alert type="warning" title="Location update failed">{trackingError}</Alert>}
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Waypoints recorded: <strong>{journey.waypoints.length}</strong>
                  {journey.currentLocation && <> · Last position: {journey.currentLocation.lat.toFixed(5)}, {journey.currentLocation.lng.toFixed(5)}</>}
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <Button variant="primary" size="md" onClick={confirmArrival} leftIcon={<CheckCircle size={18} />}>I Have Arrived Safely</Button>
                  <Button variant="outline" size="md" onClick={cancelJourney}>Cancel Journey</Button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Input label="Destination address or landmark" placeholder="e.g. Lajpat Nagar Central Market" value={destinationInput} onChange={e => setDestinationInput(e.target.value)} />
                <Input label="Estimated travel time (minutes)" type="number" min="5" max="300" value={etaInput} onChange={e => setEtaInput(parseInt(e.target.value, 10) || 30)} />
                <Button variant="primary" size="lg" disabled={!destinationInput.trim()} onClick={() => void startJourney(destinationInput, etaInput, false)} leftIcon={<Navigation size={18} />}>Start journey tracking</Button>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>Starting a journey does not share your location. Use the share panel to create a recipient link.</p>
              </div>
            )}
          </Card>

          {renderSharePanel()}

          <Card style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>India helplines & official directories</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              These numbers and government links are for India. If you are elsewhere, use your local emergency service;
              find global gender-based violence support organizations through{' '}
              <a href="https://lila.help/" target="_blank" rel="noopener noreferrer">Lila.help</a>.
              Nearby public map listings may be incomplete and are not a verified facility feed.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              {nearbyResources.map(resource => (
                <div key={resource.id} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color-default)', backgroundColor: 'var(--bg-app)' }}>
                  <strong style={{ fontSize: '0.9rem' }}>{resource.name}</strong>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.25rem 0' }}>{resource.address}</p>
                  <a href={`tel:${resource.phone}`} style={{ color: 'var(--color-brand-primary)', fontWeight: 700, fontSize: '0.82rem' }}>Call {resource.phone}</a>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
              {directoryLinks.map(link => (
                <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: 'var(--color-info)', display: 'inline-flex', gap: '0.3rem', alignItems: 'center' }}>
                  {link.label} <ExternalLink size={13} />
                </a>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'discreet' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
          <Card>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>Simulated incoming call pretext</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.4 }}>
              Launches a browser-only fake call screen to give you a conversational pretext. It is not a real cellular call.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Input label="Simulated caller name" value={fakeCallerName} onChange={e => setFakeCallerName(e.target.value)} />
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Ring delay:</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[0, 5, 15, 30].map(seconds => (
                    <button key={seconds} type="button" onClick={() => setFakeCallDelay(seconds)} style={{ flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-md)', border: fakeCallDelay === seconds ? '2px solid var(--color-brand-secondary)' : '1px solid var(--border-color-default)', backgroundColor: fakeCallDelay === seconds ? 'var(--color-brand-secondary-light)' : 'var(--bg-surface)', fontWeight: fakeCallDelay === seconds ? 600 : 500 }}>
                      {seconds === 0 ? 'Now' : `${seconds}s`}
                    </button>
                  ))}
                </div>
              </div>
              <Button variant="secondary" size="lg" onClick={() => setIsFakeCallOpen(true)} leftIcon={<PhoneCall size={18} />}>Launch simulated call</Button>
            </div>
          </Card>

          <Card>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Discreet safety limits</h3>
            <Alert type="warning">A fake call is a visual/audio simulation only. It cannot place a real call or contact anyone.</Alert>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '0.75rem' }}>
              <strong>Quick Exit:</strong> ESC or the top-bar button replaces this tab with your chosen neutral site. Browsers do not allow a website to erase history.
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '0.5rem' }}>
              If a device is monitored, consider a private/incognito window and a device you control. NIRBHAYA cannot hide activity from someone with device-level access.
            </p>
          </Card>
        </div>
      )}

      {activeTab === 'contacts' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
          <Card>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>{editingContactId ? 'Edit trusted contact' : 'Add trusted contact'}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Contacts are stored only in this browser. They receive no automatic messages; they are used to prepare an SMS draft when you choose.
            </p>
            <form onSubmit={handleSaveContact} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Input label="Name or alias" placeholder="e.g. Sister, best friend" value={newContactName} onChange={e => setNewContactName(e.target.value)} required />
              <Input label="Phone number (with country code)" placeholder="e.g. +91 98765 43210" value={newContactPhone} onChange={e => setNewContactPhone(e.target.value)} required />
              <Input label="Relationship" value={newContactRel} onChange={e => setNewContactRel(e.target.value)} />
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <Button variant="primary" type="submit" leftIcon={<Plus size={18} />}>{editingContactId ? 'Save changes' : 'Save contact'}</Button>
                {editingContactId && <Button variant="ghost" type="button" onClick={resetContactForm}>Cancel edit</Button>}
              </div>
            </form>
          </Card>

          <Card>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '1rem' }}>Configured contacts ({contacts.length})</h3>
            {contacts.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No contacts added yet. Add someone you trust and choose which alerts include them.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {contacts.map(contact => (
                  <div key={contact.id} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color-default)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <div>
                        <strong style={{ fontSize: '0.9rem' }}>{contact.name}</strong>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>{contact.relationship} · {contact.phone}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button type="button" onClick={() => handleEditContact(contact)} title="Edit contact" style={{ padding: '4px', color: 'var(--color-brand-primary)' }}><Pencil size={15} /></button>
                        <button type="button" onClick={() => handleDeleteContact(contact.id)} title="Remove contact" style={{ padding: '4px', color: 'var(--color-danger)' }}><Trash2 size={15} /></button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.5rem', fontSize: '0.8rem' }}>
                      <label style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <input type="checkbox" checked={contact.notifyOnSOS} onChange={() => handleToggleContact(contact.id, 'notifyOnSOS')} />
                        Include in SOS SMS drafts
                      </label>
                      <label style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <input type="checkbox" checked={contact.notifyOnCheckInMissed} onChange={() => handleToggleContact(contact.id, 'notifyOnCheckInMissed')} />
                        Include in missed check-in drafts
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginTop: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', gap: '0.35rem' }}>
              <Info size={14} /> NIRBHAYA cannot deliver an SMS or call on your behalf. Always confirm that a message was sent.
            </div>
          </Card>
        </div>
      )}

      <FakeCallModal isOpen={isFakeCallOpen} onClose={() => setIsFakeCallOpen(false)} callerName={fakeCallerName} delaySeconds={fakeCallDelay} />
    </div>
  );
};
