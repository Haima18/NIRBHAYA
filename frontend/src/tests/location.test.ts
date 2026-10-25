import { afterEach, describe, it, expect, vi } from 'vitest';
import { locationService } from '../services/location/locationService';

describe('Spatial & Location Service', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('correctly calculates Haversine distance between two coordinates', () => {
    // Connaught Place to AIIMS Delhi (~7.5 km)
    const cp = { lat: 28.6315, lng: 77.2167 };
    const aiims = { lat: 28.5672, lng: 77.2100 };

    const distance = locationService.calculateHaversineDistance(cp, aiims);
    expect(distance).toBeGreaterThan(6.5);
    expect(distance).toBeLessThan(8.5);
  });

  it('generates valid Google Maps URL', () => {
    const coords = { lat: 28.6139, lng: 77.2090 };
    const url = locationService.getMapsUrl(coords);
    expect(url).toContain('https://www.google.com/maps?q=28.6139,77.209');
  });

  it('does not invent distances for national helplines', () => {
    const cp = { lat: 28.6315, lng: 77.2167 };
    const resources = locationService.getNearbyResources(cp);
    expect(resources.length).toBeGreaterThan(0);
    // No live facility feed is configured, so every distance must stay null
    // rather than being fabricated.
    expect(resources.every(resource => resource.distanceKm === null)).toBe(true);
    expect(resources.every(resource => resource.coords === null)).toBe(true);
  });

  it('parses mapped nearby services and calculates their distances', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        places: [
          {
            id: 'node_12',
            name: 'Central Police Station',
            category: 'police',
            address: 'Address not listed',
            phone: '+911234',
            distanceKm: 0.05,
            coords: { lat: 28.632, lng: 77.217 }
          },
          {
            id: 'way_13',
            name: 'City Hospital',
            category: 'hospital',
            address: 'Delhi',
            phone: null,
            distanceKm: 1.1,
            coords: { lat: 28.64, lng: 77.22 }
          },
          { id: 'invalid', category: 'clinic' }
        ]
      })
    });
    vi.stubGlobal('fetch', fetchMock);

    const places = await locationService.getNearbyPlaces({ lat: 28.6315, lng: 77.2167 }, 50000);
    expect(places).toHaveLength(2);
    expect(places[0].name).toBe('Central Police Station');
    expect(places[0].phone).toBe('+911234');
    expect(places[1].address).toBe('Delhi');
    expect(fetchMock.mock.calls[0][0]).toContain('radius=10000');
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ credentials: 'include' });
  });

  it('rejects invalid coordinates before requesting public map data', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await expect(locationService.getNearbyPlaces({ lat: 91, lng: 0 })).rejects.toThrow('valid location');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('loads current weather for a user-requested location', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        current: {
          temperature_2m: 24.2,
          apparent_temperature: 25.1,
          relative_humidity_2m: 61,
          precipitation: 0,
          weather_code: 2,
          wind_speed_10m: 8.4
        }
      })
    });
    vi.stubGlobal('fetch', fetchMock);

    const weather = await locationService.getCurrentWeather({ lat: 28.6315, lng: 77.2167 });

    expect(weather.temperatureC).toBe(24.2);
    expect(weather.weatherCode).toBe(2);
    expect(String(fetchMock.mock.calls[0][0])).toContain('api.open-meteo.com');
  });
});
