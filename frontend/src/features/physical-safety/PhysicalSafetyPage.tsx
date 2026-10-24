import React, { useState } from 'react';
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
  ExternalLink
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { Tabs } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { useSiren } from '@/hooks/useSiren';
import { useCheckInTimer } from '@/hooks/useCheckInTimer';
import { useJourney } from '@/hooks/useJourney';
import { storageService } from '@/services/storage/storageService';
import { notificationService } from '@/services/notifications/notificationService';
import { locationService, NearbyResource } from '@/services/location/locationService';
import { FakeCallModal } from './FakeCallModal';
import { TrustedContact } from '@/types';

export const PhysicalSafetyPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('sos_siren');

  // Siren
  const { isPlaying, isMuted, audioBlocked, statusMessage, startSiren, stopSiren, toggleMute } = useSiren();

  // CheckIn Timer
  const { session, remainingSeconds, isExpired, startSession, confirmSafe, extendSession, cancelSession } = useCheckInTimer();
  const [timerDuration, setTimerDuration] = useState(15);
  const [timerNote, setTimerNote] = useState('');

  // Journey
  const { journey, isTracking, startJourney, confirmArrival, cancelJourney } = useJourney();
  const [destinationInput, setDestinationInput] = useState('');
  const [etaInput, setEtaInput] = useState(30);

  // Trusted Contacts
  const [contacts, setContacts] = useState<TrustedContact[]>(() => storageService.getTrustedContacts());
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRel, setNewContactRel] = useState('Friend');

  // Nearby Resources
  const [nearbyResources, setNearbyResources] = useState<NearbyResource[]>(() => locationService.getNearbyResources(null));
  const [locLoading, setLocLoading] = useState(false);

  // SOS state
  const [sosStatus, setSosStatus] = useState<string | null>(null);

  // Fake Call
  const [isFakeCallOpen, setIsFakeCallOpen] = useState(false);
  const [fakeCallerName, setFakeCallerName] = useState('Mom');
  const [fakeCallDelay, setFakeCallDelay] = useState(5);

  const handleTriggerSos = async () => {
    // 1. Trigger Direct Phone dialer to 112
    notificationService.triggerEmergencyDialer();

    // 2. Draft SMS to trusted circle
    const locRes = await locationService.getCurrentPosition();
    const alertRes = notificationService.draftTrustedContactsAlert(
      contacts,
      locRes.success && locRes.coords ? locRes.coords : null,
      'SOS BUTTON TRIGGERED ON NIRBHAYA'
    );

    setSosStatus(alertRes.statusMessage);
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) return;
    const newC: TrustedContact = {
      id: `contact_${Date.now()}`,
      name: newContactName,
      phone: newContactPhone,
      relationship: newContactRel,
      notifyOnSOS: true,
      notifyOnCheckInMissed: true
    };
    const updated = [...contacts, newC];
    storageService.saveTrustedContacts(updated);
    setContacts(updated);
    setNewContactName('');
    setNewContactPhone('');
  };

  const handleDeleteContact = (id: string) => {
    const updated = contacts.filter(c => c.id !== id);
    storageService.saveTrustedContacts(updated);
    setContacts(updated);
  };

  const handleRefreshLocationResources = async () => {
    setLocLoading(true);
    const loc = await locationService.getCurrentPosition();
    if (loc.success && loc.coords) {
      setNearbyResources(locationService.getNearbyResources(loc.coords));
    }
    setLocLoading(false);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--text-primary)' }}>
          Physical Safety & Rapid Response
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
          Real browser emergency siren, verified 112 SOS shortcuts, check-in timers, and journey guardian.
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

      {/* TAB 1: SOS & SIREN */}
      {activeTab === 'sos_siren' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--space-6)' }}>
          {/* Emergency Siren Card */}
          <Card variant={isPlaying ? 'danger' : 'default'}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'var(--color-danger-light)', color: 'var(--color-danger)' }}>
                <Radio size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 600, margin: 0 }}>Emergency Siren</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                  High-decibel dual-oscillator alarm (100% Offline)
                </p>
              </div>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.4 }}>
              Emits a loud 850Hz modulated dual-tone siren using your device’s Web Audio hardware to attract bystander assistance or deter an aggressor. Works without internet.
            </p>

            <Alert type="info">
              <strong>Device Notice:</strong> Ensure phone/laptop volume is turned up. The siren creates an audible local sound; it does not automatically call the police.
            </Alert>

            <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {isPlaying ? (
                <>
                  <Button
                    variant="danger"
                    size="lg"
                    className="siren-active-indicator"
                    onClick={stopSiren}
                  >
                    STOP SIREN
                  </Button>
                  <Button variant="outline" size="lg" onClick={toggleMute}>
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />} {isMuted ? 'Unmute' : 'Mute'}
                  </Button>
                </>
              ) : (
                <Button
                  variant="danger"
                  size="lg"
                  onClick={startSiren}
                  leftIcon={<Radio size={18} />}
                >
                  Activate Emergency Siren
                </Button>
              )}
            </div>

            <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: isPlaying ? 'var(--color-danger)' : 'var(--text-muted)' }}>
              Status: <strong>{statusMessage}</strong>
            </div>
          </Card>

          {/* Emergency SOS 112 Card */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'var(--color-danger-light)', color: 'var(--color-danger)' }}>
                <ShieldAlert size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 600, margin: 0 }}>Emergency SOS (112)</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                  National Emergency Response Support System
                </p>
              </div>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.4 }}>
              Deliberate one-tap activation that launches your native dialer to call 112, while generating SMS alerts with your real-time coordinates to your configured Trusted Circle.
            </p>

            <Alert type="warning">
              SOS will prompt your device to dial 112 and draft SMS alerts. It will never claim an alert was sent if it was only simulated or queued.
            </Alert>

            <div style={{ marginTop: '1.25rem' }}>
              <Button
                variant="emergency"
                size="lg"
                style={{ width: '100%', height: '56px', fontSize: '1.1rem' }}
                onClick={handleTriggerSos}
                leftIcon={<ShieldAlert size={24} />}
              >
                TRIGGER EMERGENCY SOS (112)
              </Button>
            </div>

            {sosStatus && (
              <div style={{ marginTop: '1rem', padding: '0.5rem', backgroundColor: 'var(--color-neutral-100)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Result: {sosStatus}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 2: CHECK-IN TIMER */}
      {activeTab === 'checkin' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--space-6)' }}>
          <Card>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Safety Check-in Timer
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.4 }}>
              Set a countdown when walking alone or entering unfamiliar situations. If you don't tap &ldquo;I Am Safe&rdquo; before it expires, alerts can escalate to your trusted contacts.
            </p>

            {session?.status === 'active' ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-6) 0' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Remaining Time:
                </p>
                <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--color-danger)', letterSpacing: '0.05em' }}>
                  {formatTimer(remainingSeconds)}
                </div>
                {session.note && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    Note: &ldquo;{session.note}&rdquo;
                  </p>
                )}

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                  <Button variant="primary" size="lg" onClick={confirmSafe} leftIcon={<CheckCircle size={18} />}>
                    I Am Safe (Check In)
                  </Button>
                  <Button variant="outline" onClick={() => extendSession(15)}>
                    +15 Min
                  </Button>
                  <Button variant="ghost" onClick={cancelSession}>
                    Cancel Session
                  </Button>
                </div>
              </div>
            ) : isExpired ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-4) 0' }}>
                <Alert type="danger" title="Check-in Deadline Missed!">
                  Your check-in timer expired. An alert notice was drafted for your trusted circle contacts.
                </Alert>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                  <Button variant="primary" onClick={confirmSafe}>
                    I Am Safe Now
                  </Button>
                  <Button variant="outline" onClick={() => extendSession(10)}>
                    Extend by 10m
                  </Button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                    Choose Timer Duration:
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {[5, 15, 30, 60].map(mins => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setTimerDuration(mins)}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          borderRadius: 'var(--radius-md)',
                          border: timerDuration === mins ? '2px solid var(--color-brand-primary)' : '1px solid var(--border-color-default)',
                          backgroundColor: timerDuration === mins ? 'var(--color-brand-primary-subtle)' : 'var(--bg-surface)',
                          fontWeight: timerDuration === mins ? 600 : 500,
                          color: timerDuration === mins ? 'var(--color-brand-primary)' : 'var(--text-primary)'
                        }}
                      >
                        {mins} min
                      </button>
                    ))}
                  </div>
                </div>

                <Input
                  label="Session Note (Optional, e.g. 'Taking cab to Rohini Sector 14')"
                  placeholder="e.g. In auto-rickshaw DL-1-XX-0000"
                  value={timerNote}
                  onChange={e => setTimerNote(e.target.value)}
                />

                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => startSession(timerDuration, timerNote)}
                  leftIcon={<Clock size={18} />}
                >
                  Start Check-in Timer ({timerDuration}m)
                </Button>
              </div>
            )}
          </Card>

          <Card>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Timer Limitations & Escalation Notice
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              • <strong>Browser Restrictions:</strong> If you close your browser or your device loses battery, JavaScript timers may freeze. Always keep NIRBHAYA in an open tab or pinned tab.
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginTop: '0.5rem' }}>
              • <strong>Escalation:</strong> When the deadline expires, the app triggers your SMS app with an emergency alert draft for your selected trusted contacts.
            </p>
          </Card>
        </div>
      )}

      {/* TAB 3: JOURNEY GUARDIAN */}
      {activeTab === 'journey' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--space-6)' }}>
          <Card>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Journey Guardian
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.4 }}>
              Track your trip safely. Only shares your real-time coordinates after explicit user consent.
            </p>

            {journey?.status === 'in_progress' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Alert type="success" title="Journey Active & Monitoring">
                  Destination: <strong>{journey.destination}</strong> (ETA: {journey.etaMinutes} mins).
                </Alert>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Waypoints logged: <strong>{journey.waypoints.length}</strong> location coordinates captured.
                </p>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Button variant="primary" size="md" onClick={confirmArrival} leftIcon={<CheckCircle size={18} />}>
                    I Have Arrived Safely
                  </Button>
                  <Button variant="outline" size="md" onClick={cancelJourney}>
                    Cancel Journey
                  </Button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Input
                  label="Destination Address or Landmark"
                  placeholder="e.g. Lajpat Nagar Central Market"
                  value={destinationInput}
                  onChange={e => setDestinationInput(e.target.value)}
                />

                <Input
                  label="Estimated Travel Time (Minutes)"
                  type="number"
                  min="5"
                  max="300"
                  value={etaInput}
                  onChange={e => setEtaInput(parseInt(e.target.value) || 30)}
                />

                <Button
                  variant="primary"
                  size="lg"
                  disabled={!destinationInput.trim()}
                  onClick={() => startJourney(destinationInput, etaInput, true)}
                  leftIcon={<Navigation size={18} />}
                >
                  Start Monitored Journey
                </Button>
              </div>
            )}
          </Card>

          {/* Nearby Verified Safety Hubs */}
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>
                Nearby Safety Hubs & Safe Havens
              </h3>
              <Button variant="outline" size="sm" onClick={handleRefreshLocationResources} isLoading={locLoading}>
                Refresh Distance
              </Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {nearbyResources.map(hub => (
                <div
                  key={hub.id}
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color-default)',
                    backgroundColor: 'var(--bg-app)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{hub.name}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-brand-primary)', fontWeight: 600 }}>
                      ~{hub.distanceKm} km
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0' }}>{hub.address}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.75rem' }}>
                    <a href={`tel:${hub.phone}`} style={{ color: 'var(--color-brand-primary)', fontWeight: 600 }}>
                      Call: {hub.phone}
                    </a>
                    <a
                      href={locationService.getMapsUrl(hub.coords)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--color-info)', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                    >
                      Maps Directions <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 4: DISCREET TOOLS & FAKE CALL */}
      {activeTab === 'discreet' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--space-6)' }}>
          <Card>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Simulated Incoming Call Pretext
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.4 }}>
              Trigger a realistic simulated phone call to provide a safe conversational pretext to step away from an uncomfortable cab ride, date, or social pressure.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Input
                label="Simulated Caller Name"
                value={fakeCallerName}
                onChange={e => setFakeCallerName(e.target.value)}
              />

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                  Ring Delay:
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[0, 5, 15, 30].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFakeCallDelay(s)}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        borderRadius: 'var(--radius-md)',
                        border: fakeCallDelay === s ? '2px solid var(--color-brand-secondary)' : '1px solid var(--border-color-default)',
                        backgroundColor: fakeCallDelay === s ? 'var(--color-brand-secondary-light)' : 'var(--bg-surface)',
                        fontWeight: fakeCallDelay === s ? 600 : 500
                      }}
                    >
                      {s === 0 ? 'Now' : `${s}s`}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                variant="secondary"
                size="lg"
                onClick={() => setIsFakeCallOpen(true)}
                leftIcon={<PhoneCall size={18} />}
              >
                Launch Simulated Call
              </Button>
            </div>
          </Card>

          <Card>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Discreet Safety Disclaimers
            </h3>
            <Alert type="warning">
              A fake incoming call is a browser simulation designed strictly as a conversational pretext. It is NOT a real cellular call.
            </Alert>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginTop: '0.75rem' }}>
              • <strong>Quick Exit:</strong> The &ldquo;Quick Exit&rdquo; button in the top bar instantly redirects your browser tab to AccuWeather or Wikipedia.
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginTop: '0.5rem' }}>
              • <strong>Browser History:</strong> Web applications cannot programmatically erase browser history due to browser security sandbox rules. In abusive living situations, always access NIRBHAYA via an Incognito / Private Window.
            </p>
          </Card>
        </div>
      )}

      {/* TAB 5: TRUSTED CIRCLE */}
      {activeTab === 'contacts' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--space-6)' }}>
          <Card>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Add Trusted Contact
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              These contacts will receive SOS SMS drafts and missed check-in alerts.
            </p>

            <form onSubmit={handleAddContact} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Input
                label="Full Name"
                placeholder="e.g. Sister, Best Friend"
                value={newContactName}
                onChange={e => setNewContactName(e.target.value)}
                required
              />

              <Input
                label="Phone Number (with Country Code)"
                placeholder="e.g. +91 98765 43210"
                value={newContactPhone}
                onChange={e => setNewContactPhone(e.target.value)}
                required
              />

              <Input
                label="Relationship (e.g. Sister, Mother, Friend)"
                value={newContactRel}
                onChange={e => setNewContactRel(e.target.value)}
              />

              <Button variant="primary" type="submit" leftIcon={<Plus size={18} />}>
                Save to Trusted Circle
              </Button>
            </form>
          </Card>

          <Card>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '1rem' }}>
              Configured Contacts ({contacts.length})
            </h3>

            {contacts.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No contacts added yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {contacts.map(c => (
                  <div
                    key={c.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-app)',
                      border: '1px solid var(--border-color-default)'
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{c.name}</strong>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                        {c.relationship} • {c.phone}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteContact(c.id)}
                      style={{ color: 'var(--color-danger)', padding: '4px' }}
                      title="Remove contact"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Fake Call Modal */}
      <FakeCallModal
        isOpen={isFakeCallOpen}
        onClose={() => setIsFakeCallOpen(false)}
        callerName={fakeCallerName}
        delaySeconds={fakeCallDelay}
      />
    </div>
  );
};
