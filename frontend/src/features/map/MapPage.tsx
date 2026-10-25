import React, { useState, useEffect } from 'react';
import { ExternalLink, LocateFixed, MapPinned, PhoneCall, ShieldAlert, Share2, Copy, RefreshCw, Trash2, Link2 } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { CurrentWeather, LatLng, NearbyPlace, locationService } from '@/services/location/locationService';
import { locationShareService } from '@/services/location/locationShareService';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/localization/useTranslation';

export const MapPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [coords, setCoords] = useState<LatLng | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [placesError, setPlacesError] = useState<string | null>(null);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [shareRecipient, setShareRecipient] = useState('Trusted contact');
  const [shareMinutes, setShareMinutes] = useState(60);
  const [activeShare, setActiveShare] = useState<import('@/types').LocationShare | null>(null);
  const [shareBusy, setShareBusy] = useState(false);
  const [shareNotice, setShareNotice] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);
  const [liveUpdates, setLiveUpdates] = useState(false);
  const [liveUpdateInterval, setLiveUpdateInterval] = useState<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const interval = window.setInterval(() => setCurrentTime(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadShares = async () => {
      try {
        const shares = await locationShareService.list();
        const current = shares.find(item => item.active) || null;
        if (current) {
          setActiveShare(current);
          // If an active share exists, start live updates immediately
          if (user?.locationConsent) {
            startLiveUpdates();
          }
        }
      } catch {
        // The sharing panel explains connection errors when the user acts.
      }
    };
    void loadShares();

    return () => {
      // Cleanup: stop live updates when the component unmounts
      stopLiveUpdates();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.locationConsent]);

  const findMyLocation = async () => {
    setError(null);
    setPlacesError(null);
    setWeatherError(null);
    setPlaces([]);
    setIsLoading(true);
    try {
      const result = await locationService.getCurrentPosition();
      if (!result.success || !result.coords) {
        setError(result.error || 'Unable to retrieve your location.');
        return;
      }

      setCoords(result.coords);
      setPlacesLoading(true);
      setWeatherLoading(true);
      const [nearbyResult, weatherResult] = await Promise.allSettled([
        locationService.getNearbyPlaces(result.coords),
        locationService.getCurrentWeather(result.coords)
      ]);
      if (nearbyResult.status === 'fulfilled') setPlaces(nearbyResult.value);
      else setPlacesError(nearbyResult.reason instanceof Error ? nearbyResult.reason.message : 'Nearby places are temporarily unavailable.');
      if (weatherResult.status === 'fulfilled') setWeather(weatherResult.value);
      else {
        setWeather(null);
        setWeatherError(weatherResult.reason instanceof Error ? weatherResult.reason.message : 'Current weather is unavailable.');
      }
      setPlacesLoading(false);
      setWeatherLoading(false);
    } catch (locationError) {
      setError(locationError instanceof Error ? locationError.message : 'Unable to retrieve your location.');
    } finally {
      setIsLoading(false);
    }
  };

  const createShare = async () => {
    setShareError(null);
    setShareNotice(null);
    try {
      if (!user?.locationConsent) {
        throw new Error('Location consent is off. Enable it in Settings before creating a share link.');
      }
      const position = await locationService.getCurrentPosition();
      if (!position.success || !position.coords) {
        throw new Error(position.error || 'A current device location is required to create a share link.');
      }
      const share = await locationShareService.create({
        recipientLabel: shareRecipient.trim() || 'Trusted contact',
        message: 'Live location shared from NIRBHAYA map.',
        minutes: shareMinutes,
        lat: position.coords.lat,
        lng: position.coords.lng,
        accuracyMeters: position.accuracyMeters
      });
      if (share.ownerToken) locationShareService.rememberOwnerToken(share.token, share.ownerToken);
      setCoords(position.coords);
      setActiveShare(share);
      setShareNotice(`Live location shared. Link expires ${new Date(share.expiresAt).toLocaleString()}. Send the link to people you trust — no message is sent automatically.`);
    } catch (error) {
      setShareError(error instanceof Error ? error.message : 'Could not start location sharing.');
    } finally {
      setShareBusy(false);
    }
  };

  const updateShareLocation = async () => {
    if (!activeShare) return;
    const ownerToken = activeShare.ownerToken || locationShareService.getOwnerToken(activeShare.token);
    if (!ownerToken) {
      setShareError('This browser no longer holds the owner secret for this share.');
      return;
    }
    setShareBusy(true);
    try {
      const position = await locationService.getCurrentPosition();
      if (!position.success || !position.coords) {
        throw new Error(position.error || 'Location is unavailable.');
      }
      const updated = await locationShareService.update(
        activeShare.token,
        ownerToken,
        position.coords.lat,
        position.coords.lng,
        position.accuracyMeters
      );
      setCoords(position.coords);
      setActiveShare({ ...updated, ownerToken });
      setShareNotice('Location updated.');
    } catch (error) {
      setShareError(error instanceof Error ? error.message : 'Could not update location.');
    } finally {
      setShareBusy(false);
    }
  };

  const stopSharing = async () => {
    if (!activeShare) return;
    const ownerToken = activeShare.ownerToken || locationShareService.getOwnerToken(activeShare.token);
    if (!ownerToken) {
      setShareError('The owner secret is not available in this browser. The link will expire automatically.');
      return;
    }
    setShareBusy(true);
    setLiveUpdates(false);
    if (liveUpdateInterval) {
      clearInterval(liveUpdateInterval);
      setLiveUpdateInterval(null);
    }
    try {
      await locationShareService.stop(activeShare.token, ownerToken);
      locationShareService.forgetOwnerToken(activeShare.token);
      setActiveShare(null);
      setShareNotice('Sharing stopped.');
    } catch (error) {
      setShareError(error instanceof Error ? error.message : 'Could not stop sharing.');
    } finally {
      setShareBusy(false);
    }
  };

  const startLiveUpdates = () => {
    setLiveUpdates(true);
    void updateShareLocation();
    const interval = setInterval(() => void updateShareLocation(), 30000);
    setLiveUpdateInterval(interval);
  };

  const stopLiveUpdates = () => {
    setLiveUpdates(false);
    if (liveUpdateInterval) {
      clearInterval(liveUpdateInterval);
      setLiveUpdateInterval(null);
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
  const liveLocationMapUrl = 'https://onlinemapmaker.com/my-location-right-now-get-your-location-on-live-map-share-latitude-and-longitude/fullscreen/';
  const nearbySearchUrl = coords
    ? `https://www.google.com/maps/search/railway+station+bus+stop+hotel+taxi+stand/@${coords.lat},${coords.lng},14z`
    : null;
  const emergencyServicePlaces = places.filter(place => ['police', 'hospital', 'clinic', 'shelter', 'legal'].includes(place.category));
  const uberUrl = coords
    ? `https://m.uber.com/ul/?action=setPickup&pickup[latitude]=${coords.lat}&pickup[longitude]=${coords.lng}`
    : 'https://m.uber.com/';

  const weatherDescription = (code: number) => {
    if (code === 0) return 'Clear sky';
    if (code <= 3) return 'Partly cloudy';
    if (code <= 48) return 'Fog';
    if (code <= 57) return 'Drizzle';
    if (code <= 67) return 'Rain';
    if (code <= 77) return 'Snow';
    if (code <= 82) return 'Rain showers';
    if (code <= 86) return 'Snow showers';
    if (code <= 99) return 'Thunderstorm';
    return 'Current conditions';
  };

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

      <div style={{ display: 'flex', gap: '0.75rem 1.25rem', flexWrap: 'wrap', alignItems: 'center', padding: '0.8rem 1rem', background: 'var(--bg-surface)', border: '1px solid var(--border-color-default)', borderRadius: 'var(--radius-md)' }}>
        <div><strong style={{ fontSize: '0.82rem' }}>{currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong><span style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Local date</span></div>
        <div><strong style={{ fontSize: '0.95rem', fontVariantNumeric: 'tabular-nums' }}>{currentTime.toLocaleTimeString()}</strong><span style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Local time</span></div>
        <div><strong style={{ fontSize: '0.82rem' }}>{weatherLoading ? 'Loading…' : weather ? `${Math.round(weather.temperatureC)}°C · ${weatherDescription(weather.weatherCode)}` : coords ? 'Unavailable' : 'Available after location lookup'}</strong><span style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Current weather · Open-Meteo</span></div>
        {weather && <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Feels like {Math.round(weather.apparentTemperatureC)}°C · Wind {Math.round(weather.windSpeedKmh)} km/h · Humidity {Math.round(weather.relativeHumidity)}%</span>}
      </div>
      {weatherError && <Alert type="warning" title="Weather unavailable">{weatherError}</Alert>}

      <Alert type="info" title={t('locationPrivacyTitle')}>
        {t('locationPrivacyText')}
      </Alert>
      <Alert type="warning" title={t('officialDataTitle')}>
        <p style={{ margin: '0 0 0.5rem' }}>{t('officialDataNotice')}</p>
        <a href="https://missionshakti.wcd.gov.in/" target="_blank" rel="noreferrer">
          {t('officialDirectory')}
        </a>
      </Alert>
      <Alert type="info" title="Location is shared only when you request it">
        When you choose “Find my location,” your coordinates are sent through NIRBHAYA to OpenStreetMap to show the
        map and query nearby mapped places, and to Open-Meteo for current weather. This public data can be incomplete or out of date; it is not an
        emergency dispatch service. The 112 and 181 call buttons below are India-specific; use your local emergency
        number if you are elsewhere. Opening the optional Google Maps search sends your coordinates to Google.
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
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
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
                <a
                  href={liveLocationMapUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-brand-primary)', fontWeight: 600 }}
                >
                  Open live location map <ExternalLink size={14} />
                </a>
              </div>
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

      {coords && (
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color-default)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-5)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)'
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Nearby mapped services</h2>
            <p style={{ margin: '0.3rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              OpenStreetMap contributors · within 5 km · listings, opening status, and lawyer credentials are not verified by NIRBHAYA.
            </p>
          </div>
          {placesLoading ? (
            <p role="status" style={{ margin: 0, color: 'var(--text-secondary)' }}>Searching public map data…</p>
          ) : placesError ? (
            <Alert type="warning" title="Nearby listings are unavailable">
              {placesError}{' '}
              {nearbySearchUrl && <a href={nearbySearchUrl} target="_blank" rel="noreferrer">Try an unverified Google Maps search</a>}
            </Alert>
          ) : emergencyServicePlaces.length === 0 ? (
            <div>
              <p style={{ margin: '0 0 0.5rem', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                No matching mapped listings were found nearby. This does not mean no services exist in your area.
              </p>
              {nearbySearchUrl && <a href={nearbySearchUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.82rem', color: 'var(--color-info)' }}>Try an unverified Google Maps search</a>}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '0.75rem' }}>
              {emergencyServicePlaces.map(place => (
                <div key={place.id} style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color-default)', background: 'var(--bg-app)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>{place.name}</strong>
                  <p style={{ margin: '0.25rem 0', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'capitalize' }}>
                    {place.category.replace('_', ' ')} · {place.distanceKm} km
                  </p>
                  <p style={{ margin: '0 0 0.55rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>{place.address}</p>
                  <a href={place.mapUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-brand-primary)', fontSize: '0.8rem' }}>
                    Open directions <ExternalLink size={13} />
                  </a>
                  {place.phone && <a href={`tel:${place.phone}`} style={{ marginLeft: '0.8rem', color: 'var(--color-brand-primary)', fontSize: '0.8rem' }}>Call {place.phone}</a>}
                </div>
              ))}
            </div>
          )}
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            © OpenStreetMap contributors · Shelters may not be survivor-specific or accepting visitors. Legal-office map tags do not confirm bar registration or current practice.
          </span>
        </div>
      )}

      {coords && (
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color-default)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
          <h2 style={{ margin: '0 0 0.3rem', fontSize: '1.1rem', color: 'var(--text-primary)' }}>Nearby transport & stays</h2>
          <p style={{ margin: '0 0 0.85rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Mapped public listings can be incomplete and are not verified by NIRBHAYA. Confirm availability and safety directly.</p>
          {placesLoading ? <p role="status" style={{ color: 'var(--text-secondary)' }}>Searching nearby places…</p> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.55rem' }}>
              {places.filter(place => ['railway_station', 'bus_stop', 'taxi', 'hotel'].includes(place.category)).map(place => (
                <a key={place.id} href={place.mapUrl} target="_blank" rel="noreferrer" style={{ padding: '0.65rem', border: '1px solid var(--border-color-default)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }}>
                  <strong style={{ display: 'block', fontSize: '0.84rem' }}>{place.name}</strong>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>{place.category.replace('_', ' ')} · {place.distanceKm} km</span>
                </a>
              ))}
              {!places.some(place => ['railway_station', 'bus_stop', 'taxi', 'hotel'].includes(place.category)) && <p style={{ gridColumn: '1 / -1', margin: 0, color: 'var(--text-secondary)', fontSize: '0.82rem' }}>No transit stops, taxi stands, or accommodation were returned by the public map data for this area.</p>}
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', marginTop: '0.9rem' }}>
            <a href={uberUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', padding: '0.55rem 0.8rem', border: '1px solid var(--border-color-default)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.82rem' }}>Open Uber</a>
            <a href="https://www.rapido.bike/" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', padding: '0.55rem 0.8rem', border: '1px solid var(--border-color-default)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.82rem' }}>Open Rapido</a>
            {nearbySearchUrl && <a href={nearbySearchUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', padding: '0.55rem 0.8rem', color: 'var(--color-info)', fontSize: '0.82rem' }}>Search nearby in Google Maps</a>}
          </div>
          <p style={{ margin: '0.55rem 0 0', color: 'var(--text-muted)', fontSize: '0.72rem' }}>Ride links open external services; NIRBHAYA does not book rides or verify drivers.</p>
        </div>
      )}

      {/* Live location sharing — send your map location to trusted people */}
      {coords && (
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Share2 size={20} color="var(--color-brand-primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Share live location on this map</h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
            Creates a random, expiring recipient link on the NIRBHAYA server. Send that link to people you trust
            so they can see your live map location. NIRBHAYA does not send the link for you.
          </p>

          {!user?.locationConsent && (
            <Alert type="warning" title="Location consent is off">
              Enable location consent in <a href="/settings" style={{ color: 'var(--color-brand-primary)', fontWeight: 600 }}>Settings</a> before sharing your location.
            </Alert>
          )}

          {shareError && <Alert type="danger" title="Sharing error">{shareError}</Alert>}
          {shareNotice && <Alert type="success" title="Sharing status">{shareNotice}</Alert>}

          {activeShare ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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
                    id="map-live-updates"
                    checked={liveUpdates}
                    onChange={() => (liveUpdates ? stopLiveUpdates() : startLiveUpdates())}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <label htmlFor="map-live-updates" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', cursor: 'pointer', margin: 0 }}>
                    {liveUpdates ? 'Stop live updates' : 'Send live location every 30s'}
                  </label>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(locationShareService.shareUrl(activeShare));
                  }}
                  style={{
                    padding: '0.65rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color-default)',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Copy size={14} /> Copy link
                </button>
                <button
                  onClick={updateShareLocation}
                  disabled={shareBusy}
                  style={{
                    padding: '0.65rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-brand-primary)',
                    backgroundColor: 'var(--color-brand-primary)',
                    color: '#fff',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: shareBusy ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  {shareBusy ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={14} />} Update now
                </button>
                <button
                  onClick={stopSharing}
                  disabled={shareBusy}
                  style={{
                    padding: '0.65rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-danger-border)',
                    backgroundColor: 'var(--color-danger-subtle)',
                    color: 'var(--color-danger-hover)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: shareBusy ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Trash2 size={14} /> Stop sharing
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label htmlFor="map-share-recipient" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Recipient label (for your reference)
                </label>
                <input
                  id="map-share-recipient"
                  value={shareRecipient}
                  onChange={e => setShareRecipient(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.625rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color-default)',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
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
              <button
                onClick={createShare}
                disabled={shareBusy || !user?.locationConsent}
                style={{
                  padding: '0.75rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  backgroundColor: shareBusy || !user?.locationConsent ? 'var(--text-muted)' : 'var(--color-brand-primary)',
                  color: '#fff',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: (shareBusy || !user?.locationConsent) ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                {shareBusy ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Link2 size={14} />}
                {shareBusy ? 'Creating share link…' : 'Start sharing live location'}
              </button>
              {shareBusy && <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>Fetching your location and creating the share link…</p>}
            </div>
          )}
        </div>
      )}

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

      <p style={{ margin: '-0.5rem 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        For global gender-based violence support organizations and helplines, visit{' '}
        <a href="https://lila.help/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-info)' }}>
          Lila.help
        </a>.
      </p>

    </div>
  );
};
