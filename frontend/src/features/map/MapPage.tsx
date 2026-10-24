import React, { useState } from 'react';
import { ExternalLink, LocateFixed, MapPinned, PhoneCall, ShieldAlert } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { LatLng, locationService } from '@/services/location/locationService';
import { useTranslation } from '@/localization/useTranslation';

export const MapPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { t } = useTranslation();
  const [coords, setCoords] = useState<LatLng | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const findMyLocation = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const result = await locationService.getCurrentPosition();
      if (!result.success || !result.coords) {
        setError(result.error || 'Unable to retrieve your location.');
        return;
      }

      setCoords(result.coords);
      if (!user?.locationConsent) {
        await updateProfile({ locationConsent: true });
      }
    } catch (locationError) {
      setError(locationError instanceof Error ? locationError.message : 'Unable to retrieve your location.');
    } finally {
      setIsLoading(false);
    }
  };

  const mapUrl = coords
    ? (() => {
        const offset = 0.012;
        const west = coords.lng - offset;
        const south = coords.lat - offset;
        const east = coords.lng + offset;
        const north = coords.lat + offset;
        return `https://www.openstreetmap.org/export/embed.html?bbox=${west}%2C${south}%2C${east}%2C${north}&layer=mapnik&marker=${coords.lat}%2C${coords.lng}`;
      })()
    : null;

  const fullMapUrl = coords
    ? `https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lng}#map=16/${coords.lat}/${coords.lng}`
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--text-primary)' }}>
          {t('mapTitle')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
          {t('mapDescription')}
        </p>
      </div>

      <Alert type="info" title={t('locationPrivacyTitle')}>
        {t('locationPrivacyText')}
      </Alert>
      <Alert type="warning" title={t('officialDataTitle')}>
        <p style={{ margin: '0 0 0.5rem' }}>{t('officialDataNotice')}</p>
        <a href="https://missionshakti.wcd.gov.in/" target="_blank" rel="noreferrer">
          {t('officialDirectory')}
        </a>
      </Alert>

      {error && <Alert type="danger" title={t('locationUnavailable')}>{error}</Alert>}

      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color-default)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-5)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <MapPinned size={22} color="var(--color-brand-primary)" />
            <div>
              <h2 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{t('yourMap')}</h2>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {coords
                  ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
                  : t('locationNotRequested')}
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            onClick={findMyLocation}
            disabled={isLoading}
            leftIcon={<LocateFixed size={17} />}
          >
            {isLoading ? t('findingLocation') : coords ? t('refreshLocation') : t('findLocation')}
          </Button>
        </div>

        {mapUrl ? (
          <>
            <iframe
              title="OpenStreetMap showing your current location"
              src={mapUrl}
              width="100%"
              height="460"
              loading="lazy"
              style={{ border: 0, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-app)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {t('mapAttribution')}
              </span>
              {fullMapUrl && (
                <a
                  href={fullMapUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-brand-primary)' }}
                >
                  {t('openFullMap')} <ExternalLink size={14} />
                </a>
              )}
            </div>
          </>
        ) : (
          <div
            style={{
              minHeight: '280px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--border-color-default)',
              backgroundColor: 'var(--bg-app)',
              color: 'var(--text-secondary)',
              textAlign: 'center',
              padding: 'var(--space-6)'
            }}
          >
            <LocateFixed size={32} color="var(--color-brand-primary)" />
            <strong>{t('locationNotTracked')}</strong>
            <span style={{ maxWidth: '440px', fontSize: '0.88rem' }}>
              {t('locationPermissionText')}
            </span>
          </div>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--space-4)'
        }}
      >
        <a
          href="tel:112"
          style={{
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-danger-subtle)',
            border: '1px solid var(--color-danger-border)',
            color: 'var(--color-danger-hover)',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.7rem',
            fontWeight: 700
          }}
        >
          <ShieldAlert size={20} />
          {t('emergencyCall')}
          <PhoneCall size={16} />
        </a>
        <a
          href="tel:181"
          style={{
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color-default)',
            color: 'var(--text-primary)',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.7rem',
            fontWeight: 600
          }}
        >
          <PhoneCall size={20} color="var(--color-brand-primary)" />
          {t('womenHelpline')}
        </a>
      </div>
    </div>
  );
};
