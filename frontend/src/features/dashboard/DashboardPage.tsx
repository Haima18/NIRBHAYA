import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Radio,
  Clock,
  Navigation,
  FolderLock,
  Compass,
  FileSearch,
  Users,
  Sparkles,
  ShieldCheck,
  Eye,
  Info,
  ArrowRight
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
import { useAuth } from '@/hooks/useAuth';
import { notificationService } from '@/services/notifications/notificationService';
import { IncidentRecord, PathwayPlan, SafetyNewsArticle, TrustedContact } from '@/types';

const FEATURE_TILES = [
  {
    to: '/digital-guardian',
    icon: <ShieldCheck size={20} />,
    title: 'Digital Guardian',
    text: 'Screen a message for threats, blackmail, coercion, and cyberstalking patterns with transparent, rule-based checks.'
  },
  {
    to: '/deepfake-detective',
    icon: <FileSearch size={20} />,
    title: 'Deepfake Detective',
    text: 'Inspect file signatures and EXIF metadata. This does not detect synthetic media or prove authenticity.'
  },
  {
    to: '/pathway',
    icon: <Compass size={20} />,
    title: 'NIRBHAYA Pathway',
    text: 'Step-by-step guidance for the question, “I am experiencing this. What can I do next?”'
  },
  {
    to: '/privacy-shield',
    icon: <Eye size={20} />,
    title: 'Privacy Shield',
    text: 'A self-assessment for social visibility, app permissions, sessions, and doxxing response.'
  },
  {
    to: '/map',
    icon: <Navigation size={20} />,
    title: 'Live map',
    text: 'Consent-based location sharing with a real-time map that updates automatically. Create expiring links for trusted contacts.'
  }
];

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPlaying, startSiren, stopSiren } = useSiren();
  const { session: checkInSession, remainingSeconds, confirmSafe } = useCheckInTimer();
  const { journey: activeJourney, confirmArrival } = useJourney();

  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [plans, setPlans] = useState<PathwayPlan[]>([]);
  const [news, setNews] = useState<SafetyNewsArticle[]>([]);
  const [newsUnavailable, setNewsUnavailable] = useState(false);

  useEffect(() => {
    setIncidents(storageService.getIncidents());
    setContacts(storageService.getTrustedContacts());
    setPlans(storageService.getPathwayPlans());
    newsService.getLatestArticles()
      .then(articles => {
        setNews(articles.slice(0, 3));
        setNewsUnavailable(false);
      })
      .catch(() => {
        setNews([]);
        setNewsUnavailable(true);
      });
  }, []);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const rest = seconds % 60;
    return `${mins}m ${rest < 10 ? '0' : ''}${rest}s`;
  };

  const handleDial112 = () => {
    notificationService.triggerEmergencyDialer();
  };

  const firstName = user?.name?.trim().split(/\s+/)[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.6rem' }}>
      {/* 1. Hero and primary emergency actions */}
      <section className="dashboard-hero" aria-labelledby="dashboard-title">
        <div>
          <p className="dashboard-hero__eyebrow">Your sanctuary today</p>
          <h1 id="dashboard-title">
            {firstName ? `Welcome back, ${firstName}.` : 'Welcome back to your safe space.'}
          </h1>
          <p>
            Device-local safety tools, server-backed consent controls, and guidance with its limits left visible.
            Take only the steps that feel right today.
          </p>
        </div>

        <div className="dashboard-hero__actions">
          {isPlaying ? (
            <Button
              variant="danger"
              size="lg"
              className="siren-active-indicator"
              onClick={stopSiren}
              leftIcon={<Radio size={19} />}
            >
              Stop siren
            </Button>
          ) : (
            <Button
              variant="outline"
              size="lg"
              onClick={startSiren}
              leftIcon={<Radio size={19} color="var(--color-danger)" />}
            >
              Activate siren
            </Button>
          )}

          <Button
            variant="emergency"
            size="lg"
            onClick={handleDial112}
            leftIcon={<ShieldAlert size={19} />}
          >
            Emergency SOS (112)
          </Button>
        </div>
      </section>

      <div className="dashboard-note" role="note">
        <Info size={16} color="var(--color-info)" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
        <span>
          The siren is a local browser sound and SOS opens your phone dialer; neither dispatches help. Trusted-contact
          SMS messages are drafts you send yourself. Sample directories and unconfigured integrations are labelled.
        </span>
      </div>

      {/* 2. Truthful active-session banners */}
      {(checkInSession?.status === 'active' || activeJourney?.status === 'in_progress') && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {checkInSession?.status === 'active' && (
            <Card variant="danger" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Clock size={26} color="var(--color-danger)" aria-hidden="true" />
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-danger-hover)', margin: 0 }}>
                    Safety check-in is active
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Remaining: <strong>{formatTimer(remainingSeconds)}</strong>
                  </p>
                </div>
              </div>
              <Button variant="danger" size="sm" onClick={confirmSafe}>
                I am safe — check in
              </Button>
            </Card>
          )}

          {activeJourney?.status === 'in_progress' && (
            <Card variant="highlight" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Navigation size={26} color="var(--color-brand-primary)" aria-hidden="true" />
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-brand-primary-dark)', margin: 0 }}>
                    Journey Guardian is active
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Destination: <strong>{activeJourney.destination}</strong> · ETA {activeJourney.etaMinutes}m
                  </p>
                </div>
              </div>
              <Button variant="primary" size="sm" onClick={confirmArrival}>
                Confirm arrival
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* 3. Feature shortcuts */}
      <section aria-labelledby="modules-heading">
        <div className="dashboard-section-title">
          <h2 id="modules-heading">Safety &amp; digital defence</h2>
          <p>Every destination below is a working part of NIRBHAYA.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.9rem' }}>
          {FEATURE_TILES.map(tile => (
            <Link key={tile.to} to={tile.to} style={{ textDecoration: 'none', display: 'block' }}>
              <Card className="feature-tile">
                <div className="feature-tile__icon" aria-hidden="true">{tile.icon}</div>
                <h3 style={{ marginTop: '0.8rem' }}>{tile.title}</h3>
                <p>{tile.text}</p>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    marginTop: '0.75rem',
                    color: 'var(--color-brand-primary)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.03em'
                  }}
                >
                  Open <ArrowRight size={13} aria-hidden="true" />
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Evidence Vault and safety pathways */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.1rem' }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FolderLock size={19} color="var(--color-brand-primary)" aria-hidden="true" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Evidence Vault records</h3>
            </div>
            <Link to="/evidence-vault" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
              View all ({incidents.length})
            </Link>
          </div>

          {incidents.length === 0 ? (
            <EmptyState
              icon={<FolderLock size={24} />}
              title="No incidents logged"
              description="Your Evidence Vault is empty. You can record harassing messages, threats, or media whenever you are ready."
              actionLabel="Create first incident record"
              onAction={() => navigate('/evidence-vault')}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {incidents.slice(0, 3).map(incident => (
                <div
                  key={incident.id}
                  style={{
                    padding: '0.7rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color-muted)',
                    backgroundColor: 'var(--color-brand-primary-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '0.6rem'
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '0.86rem', fontWeight: 600, margin: 0 }}>{incident.title}</h4>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                      {incident.category} · {incident.incidentDate}
                    </p>
                  </div>
                  <Badge variant={incident.severity}>{incident.severity}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Compass size={19} color="var(--color-info)" aria-hidden="true" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Active safety pathways</h3>
            </div>
            <Link to="/pathway" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
              Explore pathways
            </Link>
          </div>

          {plans.length === 0 ? (
            <EmptyState
              icon={<Compass size={24} />}
              title="No active safety plans"
              description="Explore the NIRBHAYA Pathway to build an actionable, step-by-step protection plan at your own pace."
              actionLabel="Create a safety plan"
              onAction={() => navigate('/pathway')}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {plans.map(plan => (
                <div
                  key={plan.situation}
                  style={{
                    padding: '0.7rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color-muted)',
                    backgroundColor: 'var(--color-brand-primary-subtle)'
                  }}
                >
                  <h4 style={{ fontSize: '0.86rem', fontWeight: 600, margin: 0, color: 'var(--color-brand-primary-dark)' }}>
                    {plan.situationTitle}
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 3 }}>
                    {plan.steps.reduce((acc, step) => acc + step.actions.filter(action => action.completed).length, 0)} of{' '}
                    {plan.steps.reduce((acc, step) => acc + step.actions.length, 0)} action items completed.
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* 5. Trusted circle and awareness */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.1rem' }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={19} color="var(--color-brand-secondary)" aria-hidden="true" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Trusted circle</h3>
            </div>
            <Link to="/physical-safety" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
              Manage contacts
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {contacts.length === 0 ? (
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                No trusted contacts are stored in this browser. Add one to prepare a manual SMS draft you control.
              </p>
            ) : (
              contacts.map(contact => (
                <div
                  key={contact.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.7rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-brand-primary-subtle)',
                    border: '1px solid var(--border-color-muted)',
                    gap: '0.5rem'
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '0.86rem', fontWeight: 600, margin: 0 }}>{contact.name}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                      {contact.relationship} · {contact.phone}
                    </p>
                  </div>
                  <Badge variant={contact.notifyOnSOS ? 'info' : 'neutral'}>
                    {contact.notifyOnSOS ? 'In SOS draft' : 'Not in SOS'}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={19} color="var(--color-brand-primary)" aria-hidden="true" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Latest global safety reports</h3>
            </div>
            <Link to="/safety-news" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
              All news & awareness
            </Link>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 0.6rem' }}>
            GDELT Project + UN Women RSS. External reporting is not independently verified by NIRBHAYA.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {newsUnavailable && (
              <p role="status" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Live headlines are temporarily unavailable. The awareness library is available from the news page.
              </p>
            )}
            {!newsUnavailable && news.length === 0 && (
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>No current headlines were returned.</p>
            )}
            {news.map(article => (
              <div
                key={article.id}
                style={{
                  padding: '0.7rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-brand-primary-subtle)',
                  border: '1px solid var(--border-color-muted)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <h4 style={{ fontSize: '0.84rem', fontWeight: 600, margin: 0 }}>{article.headline}</h4>
                  <Badge variant="neutral">{article.publisher}</Badge>
                </div>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.45 }}>
                  {article.date} · {article.summary}
                </p>
                <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.76rem', color: 'var(--color-info)' }}>
                  Read original report
                </a>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
