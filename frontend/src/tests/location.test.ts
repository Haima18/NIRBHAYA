import { describe, it, expect } from 'vitest';
import { locationService } from '../services/location/locationService';

describe('Spatial & Location Service', () => {
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
});
