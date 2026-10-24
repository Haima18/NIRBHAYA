import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Radio,
  Clock,
  Navigation,
  FolderLock,
  Compass,
  FileSearch,
  Users,
  Scale,
  Sparkles,
  PhoneCall,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { storageService } from '@/services/storage/storageService';
import { newsService } from '@/services/news/newsService';
import { useSiren } from '@/hooks/useSiren';
import { useCheckInTimer } from '@/hooks/useCheckInTimer';
import { useJourney } from '@/hooks/useJourney';
import { notificationService } from '@/services/notifications/notificationService';
import { IncidentRecord, PathwayPlan, SafetyNewsArticle, TrustedContact } from '@/types';

export const DashboardPage: React.FC = () => {
  const { isPlaying, startSiren, stopSiren } = useSiren();
  const { session: checkInSession, remainingSeconds, confirmSafe } = useCheckInTimer();
  const { journey: activeJourney, confirmArrival } = useJourney();

  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [plans, setPlans] = useState<PathwayPlan[]>([]);
  const [news, setNews] = useState<SafetyNewsArticle[]>([]);

  useEffect(() => {
    setIncidents(storageService.getIncidents());
    setContacts(storageService.getTrustedContacts());
    setPlans(storageService.getPathwayPlans());
    setNews(newsService.getArticles().slice(0, 3));
  }, []);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const handleDial112 = () => {
    notificationService.triggerEmergencyDialer();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* 1. Welcome & Primary Emergency Row */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-4)',
          backgroundColor: 'var(--bg-surface)',
          padding: 'var(--space-6)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-color-default)'
        }}
      >
        <div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            NIRBHAYA Safety Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
            Real-time physical protection, digital harassment shield, and crisis triage.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          {isPlaying ? (
            <Button
              variant="danger"
              size="lg"
              className="siren-active-indicator"
              onClick={stopSiren}
              leftIcon={<Radio size={20} />}
            >
              STOP EMERGENCY SIREN
            </Button>
          ) : (
            <Button
              variant="outline"
              size="lg"
              onClick={startSiren}
              leftIcon={<Radio size={20} color="var(--color-danger)" />}
            >
              Activate Siren
            </Button>
          )}

          <Button
            variant="emergency"
            size="lg"
            onClick={handleDial112}
            leftIcon={<ShieldAlert size={20} />}
          >
            EMERGENCY SOS (112)
          </Button>
        </div>
      </div>

      {/* 2. Active Session Banners (Truthful state only!) */}
      {(checkInSession?.status === 'active' || activeJourney?.status === 'in_progress') && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
          {/* Active Check-In Banner */}
          {checkInSession?.status === 'active' && (
            <Card variant="danger" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Clock size={28} color="var(--color-danger)" />
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-danger-hover)', margin: 0 }}>
                    Active Safety Check-in Timer
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Remaining: <strong>{formatTimer(remainingSeconds)}</strong>
                  </p>
                </div>
              </div>
              <Button variant="danger" size="sm" onClick={confirmSafe}>
                I Am Safe (Check In)
              </Button>
            </Card>
          )}

          {/* Active Journey Banner */}
          {activeJourney?.status === 'in_progress' && (
            <Card variant="highlight" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Navigation size={28} color="var(--color-brand-primary)" />
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-brand-primary)', margin: 0 }}>
                    Active Journey Guardian
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Destination: <strong>{activeJourney.destination}</strong> (ETA: {activeJourney.etaMinutes}m)
                  </p>
                </div>
              </div>
              <Button variant="primary" size="sm" onClick={confirmArrival}>
                Confirm Arrival
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* 3. Core Safety Modules Shortcuts */}
      <div>
        <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: 'var(--space-4)', color: 'var(--text-primary)' }}>
          Safety & Digital Defense Centers
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
          <Link to="/digital-guardian" style={{ textDecoration: 'none' }}>
            <Card style={{ height: '100%', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'var(--color-brand-primary-light)', color: 'var(--color-brand-primary)' }}>
                  <ShieldCheck size={22} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  Digital Guardian
                </h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                Scan messages for threats, blackmail, extortion, sexual solicitation, and cyberstalking patterns.
              </p>
            </Card>
          </Link>

          <Link to="/deepfake-detective" style={{ textDecoration: 'none' }}>
            <Card style={{ height: '100%', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'var(--color-brand-secondary-light)', color: 'var(--color-brand-secondary)' }}>
                  <FileSearch size={22} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  Deepfake Detective
                </h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                Analyze uploaded images/videos for synthetic artifacts, EXIF metadata tampering, and NCII hash shields.
              </p>
            </Card>
          </Link>

          <Link to="/pathway" style={{ textDecoration: 'none' }}>
            <Card style={{ height: '100%', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'var(--color-info-light)', color: 'var(--color-info)' }}>
                  <Compass size={22} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  NIRBHAYA Pathway
                </h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                Step-by-step guidance answering &ldquo;I am experiencing this situation. What can I do next?&rdquo;
              </p>
            </Card>
          </Link>

          <Link to="/privacy-shield" style={{ textDecoration: 'none' }}>
            <Card style={{ height: '100%', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#fef3c7', color: '#d97706' }}>
                  <Eye size={22} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  Privacy Shield
                </h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                Audit social media visibility, app permissions, active login sessions, and doxxing protection.
              </p>
            </Card>
          </Link>
        </div>
      </div>

      {/* 4. Split Grid: Evidence Vault & Active Safety Plans */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--space-6)' }}>
        {/* Recent Incidents & Evidence */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FolderLock size={20} color="var(--color-brand-primary)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Evidence Vault Records</h3>
            </div>
            <Link to="/evidence-vault" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              View All ({incidents.length})
            </Link>
          </div>

          {incidents.length === 0 ? (
            <EmptyState
              icon={<FolderLock size={24} />}
              title="No Incidents Logged"
              description="Your Evidence Vault is currently empty. You can log harassing texts, threats, or media anytime."
              actionLabel="Create First Incident Log"
              onAction={() => window.location.href = '/evidence-vault'}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {incidents.slice(0, 3).map(inc => (
                <div
                  key={inc.id}
                  style={{
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color-default)',
                    backgroundColor: 'var(--bg-app)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>{inc.title}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                      {inc.category} • {inc.incidentDate}
                    </p>
                  </div>
                  <Badge variant={inc.severity}>{inc.severity}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Pending Steps in Safety Plans */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Compass size={20} color="var(--color-info)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Active Safety Pathways</h3>
            </div>
            <Link to="/pathway" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              Explore Pathways
            </Link>
          </div>

          {plans.length === 0 ? (
            <EmptyState
              icon={<Compass size={24} />}
              title="No Active Safety Plans"
              description="Explore the NIRBHAYA Pathway to create an actionable, step-by-step protection plan."
              actionLabel="Generate a Safety Plan"
              onAction={() => window.location.href = '/pathway'}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {plans.map(p => (
                <div
                  key={p.situation}
                  style={{
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color-default)',
                    backgroundColor: 'var(--bg-app)'
                  }}
                >
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0, color: 'var(--color-brand-primary)' }}>
                    {p.situationTitle}
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {p.steps.reduce((acc, s) => acc + s.actions.filter(a => a.completed).length, 0)} of{' '}
                    {p.steps.reduce((acc, s) => acc + s.actions.length, 0)} action items completed.
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* 5. Trusted Circle & Awareness News Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--space-6)' }}>
        {/* Trusted Circle */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={20} color="var(--color-brand-secondary)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Trusted Circle Contacts</h3>
            </div>
            <Link to="/physical-safety" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              Manage Contacts
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {contacts.map(c => (
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-app)',
                  border: '1px solid var(--border-color-default)'
                }}
              >
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>{c.name}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>{c.relationship} • {c.phone}</p>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 600 }}>
                  Active Alert
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Latest Verified Safety News */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={20} color="var(--color-brand-primary)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Latest Safety Awareness</h3>
            </div>
            <Link to="/safety-news" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              All News
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {news.map(article => (
              <div
                key={article.id}
                style={{
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-app)',
                  border: '1px solid var(--border-color-default)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                    {article.headline}
                  </h4>
                  <Badge variant="info">{article.category}</Badge>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.35 }}>
                  💡 <strong>Safety Lesson:</strong> {article.safetyLesson}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
