/**
 * Location service: permission-guarded browser geolocation, distance maths, and
 * national support links.
 *
 * There is no bundled live facility dataset. We deliberately do not invent
 * "nearby verified shelters" or distances. The resource list below contains
 * official national helplines only, with no fabricated physical addresses.
 */

export interface LatLng {
  lat: number;
  lng: number;
}

export interface PositionResult {
  success: boolean;
  coords?: LatLng;
  accuracyMeters?: number;
  timestamp?: number;
  error?: string;
}

export interface NearbyResource {
  id: string;
  name: string;
  category: 'police' | 'hospital' | 'one_stop_centre' | 'shelter' | 'women' | 'cyber' | 'legal';
  address: string;
  phone: string;
  distanceKm: number | null;
  coords: LatLng | null;
  officialUrl: string;
  isNationalHelpline: true;
}

export interface NearbyPlace {
  id: string;
  name: string;
  category: 'police' | 'hospital' | 'clinic' | 'shelter' | 'legal' | 'railway_station' | 'bus_stop' | 'taxi' | 'hotel';
  address: string;
  phone: string | null;
  distanceKm: number;
  coords: LatLng;
  mapUrl: string;
}

export interface CurrentWeather {
  temperatureC: number;
  apparentTemperatureC: number;
  relativeHumidity: number;
  precipitationMm: number;
  windSpeedKmh: number;
  weatherCode: number;
}

export const locationService = {
  async getCurrentPosition(): Promise<PositionResult> {
    if (!navigator.geolocation) {
      return { success: false, error: 'Geolocation is not supported by this browser.' };
    }

    return new Promise(resolve => {
      navigator.geolocation.getCurrentPosition(
        position => {
          resolve({
            success: true,
            coords: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            },
            accuracyMeters: Number.isFinite(position.coords.accuracy)
              ? Math.round(position.coords.accuracy)
              : undefined,
            timestamp: position.timestamp
          });
        },
        error => {
          let message = 'Unable to retrieve location.';
          if (error.code === error.PERMISSION_DENIED) {
            message = 'Location permission was denied. You can still use NIRBHAYA without sharing coordinates.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            message = 'Location information is currently unavailable.';
          } else if (error.code === error.TIMEOUT) {
            message = 'The location request timed out. Try again in an open area.';
          }
          resolve({ success: false, error: message });
        },
        { enableHighAccuracy: true, timeout: 30000, maximumAge: 10000 }
      );
    });
  },

  calculateHaversineDistance(pt1: LatLng, pt2: LatLng): number {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const earthRadiusKm = 6371;
    const dLat = toRad(pt2.lat - pt1.lat);
    const dLon = toRad(pt2.lng - pt1.lng);
    const lat1 = toRad(pt1.lat);
    const lat2 = toRad(pt2.lat);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((earthRadiusKm * c).toFixed(2));
  },

  getMapsUrl(coords: LatLng): string {
    return `https://www.google.com/maps?q=${coords.lat},${coords.lng}`;
  },

  async getCurrentWeather(coords: LatLng): Promise<CurrentWeather> {
    const params = new URLSearchParams({
      latitude: String(coords.lat),
      longitude: String(coords.lng),
      current: 'temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m',
      timezone: 'auto'
    });
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
    if (!response.ok) throw new Error('Current weather is temporarily unavailable.');
    const payload = await response.json() as { current?: Record<string, unknown> };
    const current = payload.current;
    if (!current) throw new Error('Weather provider returned no current conditions.');
    const values = {
      temperatureC: current.temperature_2m,
      apparentTemperatureC: current.apparent_temperature,
      relativeHumidity: current.relative_humidity_2m,
      precipitationMm: current.precipitation,
      windSpeedKmh: current.wind_speed_10m,
      weatherCode: current.weather_code
    };
    if (Object.values(values).some(value => typeof value !== 'number' || !Number.isFinite(value))) {
      throw new Error('Weather provider returned incomplete current conditions.');
    }
    return values as CurrentWeather;
  },

  async getNearbyPlaces(coords: LatLng, radiusMeters = 5000): Promise<NearbyPlace[]> {
    if (
      !Number.isFinite(coords.lat) || coords.lat < -90 || coords.lat > 90 ||
      !Number.isFinite(coords.lng) || coords.lng < -180 || coords.lng > 180
    ) {
      throw new Error('A valid location is required to search nearby places.');
    }
    const radius = Number.isFinite(radiusMeters) ? Math.min(10000, Math.max(1000, Math.round(radiusMeters))) : 5000;
    const controller = new AbortController();
    const timeout = globalThis.setTimeout(() => controller.abort(), 30000);

    try {
      const params = new URLSearchParams({
        lat: String(coords.lat),
        lng: String(coords.lng),
        radius: String(radius)
      });
      const response = await fetch(`/api/location/nearby?${params}`, {
        credentials: 'include',
        signal: controller.signal
      });
      const data = await response.json() as { places?: unknown; error?: unknown };
      if (!response.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : `Nearby-place lookup returned HTTP ${response.status}.`);
      }
      if (!Array.isArray(data.places)) {
        throw new Error('OpenStreetMap returned an unexpected nearby-places response.');
      }

      const places = data.places.flatMap((item): NearbyPlace[] => {
        if (!item || typeof item !== 'object') return [];
        const place = item as Partial<NearbyPlace>;
        const category = (['police', 'hospital', 'clinic', 'shelter', 'legal', 'railway_station', 'bus_stop', 'taxi', 'hotel'] as const)
          .find(candidate => candidate === place.category);
        if (
          typeof place.id !== 'string' || typeof place.name !== 'string' ||
          !category || typeof place.address !== 'string' ||
          typeof place.distanceKm !== 'number' || !Number.isFinite(place.distanceKm) ||
          !place.coords || typeof place.coords.lat !== 'number' || typeof place.coords.lng !== 'number' ||
          !Number.isFinite(place.coords.lat) || !Number.isFinite(place.coords.lng)
        ) {
          return [];
        }
        const placeCoords = { lat: place.coords.lat, lng: place.coords.lng };
        return [{
          id: place.id,
          name: place.name,
          category,
          address: place.address,
          phone: typeof place.phone === 'string' ? place.phone : null,
          distanceKm: place.distanceKm,
          coords: placeCoords,
          mapUrl: this.getMapsUrl(placeCoords)
        }];
      });
      return places.sort((a, b) => a.distanceKm - b.distanceKm);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('Nearby-place lookup timed out. Your map is still available; try again later.');
      }
      throw error;
    } finally {
      globalThis.clearTimeout(timeout);
    }
  },

  /**
   * National helplines are not "nearby facilities". No live government facility
   * feed is configured, so distances remain null instead of being invented.
   */
  getNearbyResources(_userCoords: LatLng | null): NearbyResource[] {
    return [
      {
        id: 'national_112',
        name: 'Emergency Response Support System (ERSS)',
        category: 'police',
        address: 'National emergency number — police, fire, and ambulance',
        phone: '112',
        distanceKm: null,
        coords: null,
        officialUrl: 'https://112.gov.in',
        isNationalHelpline: true
      },
      {
        id: 'national_181',
        name: 'Women Helpline / One Stop Centre',
        category: 'women',
        address: 'National women-in-distress helpline',
        phone: '181',
        distanceKm: null,
        coords: null,
        officialUrl: 'https://wcd.nic.in',
        isNationalHelpline: true
      },
      {
        id: 'national_1930',
        name: 'National Cyber Crime Reporting Helpline',
        category: 'cyber',
        address: 'National cybercrime reporting line',
        phone: '1930',
        distanceKm: null,
        coords: null,
        officialUrl: 'https://cybercrime.gov.in',
        isNationalHelpline: true
      },
      {
        id: 'national_15100',
        name: 'NALSA National Free Legal Aid Helpline',
        category: 'legal',
        address: 'National free legal aid line (24/7, toll-free)',
        phone: '15100',
        distanceKm: null,
        coords: null,
        officialUrl: 'https://nalsa.gov.in',
        isNationalHelpline: true
      }
    ];
  },

  /**
   * Official directory lookup links for finding a physical service. The user
   * verifies the address and availability with the official source.
   */
  getOfficialDirectoryLinks() {
    return [
      {
        label: 'One Stop Centres (Ministry of WCD)',
        url: 'https://wcd.nic.in/schemes/one-stop-centre-scheme-1'
      },
      {
        label: 'National Legal Services Authority',
        url: 'https://nalsa.gov.in'
      },
      {
        label: 'National Cyber Crime Portal',
        url: 'https://cybercrime.gov.in'
      }
    ];
  }
};
