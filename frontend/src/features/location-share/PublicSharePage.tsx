import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Clock, ShieldAlert, RefreshCw, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { QuickExitBar } from '@/components/layout/QuickExitBar';
import { locationShareService } from '@/services/location/locationShareService';
import { locationService } from '@/services/location/locationService';
import { LocationShare } from '@/types';

export const PublicSharePage: React.FC = () => {
  const { token = '' } = useParams();
  const [share, setShare] = useState<LocationShare | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await locationShareService.getPublic(token);
      if (!result) {
        setShare(null);
        setError('This sharing link is invalid, expired, or has been stopped.');
      } else {
        setShare(result);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load this location share.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex, nofollow, noarchive';
    document.head.appendChild(robots);
    void load();
    const interval = setInterval(() => { void load(); }, 30000);
    return () => {
      clearInterval(interval);
      document.head.removeChild(robots);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const location = share?.location;
  const mapUrl = location
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${location.lng - 0.01}%2C${location.lat - 0.01}%2C${location.lng + 0.01}%2C${location.lat + 0.01}&layer=mapnik&marker=${location.lat}%2C${location.lng}`
    : null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-app)' }}>
      <QuickExitBar />
      <main style={{ flexGrow: 1, width: '100%', maxWidth: '820px', margin: '0 auto', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-brand-primary)' }}>
            NIRBHAYA shared location
          </span>
          <h1 style={{ fontSize: '1.8rem', margin: '0.3rem 0' }}>A location shared with you</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
            This page is visible only through its random link. It refreshes automatically and stops showing coordinates when the share expires or is stopped.
          </p>
        </div>

        <Alert type="warning" title="Check the link source">
          Only rely on a link you received directly from someone you trust. This page cannot confirm who created it or that the device location is accurate.
        </Alert>

        {error && <Alert type="danger" title="Share unavailable">{error}</Alert>}

        {loading && !share && <Card>Loading the current share…</Card>}

        {share && (
          <>
            <Card variant={share.active ? 'highlight' : 'default'}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{share.recipientLabel || 'Trusted contact'}</h2>
                  {share.message && <p style={{ margin: '0.4rem 0 0', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{share.message}</p>}
                </div>
                <Badge variant={share.active ? 'success' : 'neutral'}>{share.active ? 'Active' : share.revoked ? 'Stopped' : 'Expired'}</Badge>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Clock size={14} /> Expires {new Date(share.expiresAt).toLocaleString()}
                </span>
                {location?.recordedAt && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <RefreshCw size={14} /> Updated {new Date(location.recordedAt).toLocaleString()}
                  </span>
                )}
              </div>
            </Card>

            {share.active && location ? (
              <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1.05rem' }}>
                    <MapPin size={19} color="var(--color-brand-primary)" /> Last shared location
                  </h3>
                  <a href={locationService.getMapsUrl({ lat: location.lat, lng: location.lng })} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', display: 'inline-flex', gap: '0.3rem', alignItems: 'center' }}>
                    Open in Maps <ExternalLink size={13} />
                  </a>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 0 }}>
                  Device estimate: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                  {location.accuracyMeters != null ? ` · reported accuracy ±${Math.round(location.accuracyMeters)} m` : ' · accuracy not reported'}
                </p>
                {mapUrl && (
                  <iframe
                    title="Shared location on OpenStreetMap"
                    src={mapUrl}
                    width="100%"
                    height="360"
                    loading="lazy"
                    style={{ border: 0, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-app)' }}
                  />
                )}
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 0 }}>
                  Coordinates are device estimates and can be wrong, delayed, or spoofed. Do not use this page as the only way to check on someone in danger.
                  The embedded OpenStreetMap view also receives these coordinates to render the map.
                </p>
              </Card>
            ) : share.active ? (
              <Card>
                <Alert type="info" title="No coordinates received yet">
                  The link is active, but the owner has not shared a device location with it. Ask them directly if you need their location.
                </Alert>
              </Card>
            ) : (
              <Card>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <ShieldAlert size={24} color="var(--color-danger)" />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem' }}>This share is no longer live</h3>
                    <p style={{ margin: '0.35rem 0 0', color: 'var(--text-secondary)', fontSize: '0.86rem' }}>
                      Coordinates have been cleared. Contact the person directly if you are concerned for their safety.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </>
        )}

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <Button variant="outline" onClick={() => void load()} isLoading={loading} leftIcon={<RefreshCw size={16} />}>
            Refresh now
          </Button>
          <a href="tel:112" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-danger)', color: '#fff', fontWeight: 700 }}>
            Call 112 if someone is in immediate danger
          </a>
        </div>
      </main>
    </div>
  );
};
