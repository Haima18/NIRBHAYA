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
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 10000 }
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
        id: 'national_1516',
        name: 'NALSA Free Legal Aid Helpline',
        category: 'legal',
        address: 'National free legal aid line (working hours may vary)',
        phone: '1516',
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
