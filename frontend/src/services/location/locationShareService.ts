/**
 * Client for NIRBHAYA's token-protected location-sharing API.
 * The recipient link contains a random public token. The owner secret stays in
 * this browser and is required to update or stop the share.
 */
import { LocationShare } from '@/types';

interface ShareResponse {
  share?: LocationShare;
  shares?: LocationShare[];
  error?: string;
}

async function request(path: string, method: string, body?: Record<string, unknown>): Promise<ShareResponse> {
  let response: Response;
  try {
    response = await fetch(path, {
      method,
      credentials: 'include',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined
    });
  } catch {
    throw new Error('The location-sharing service is unreachable. Check the backend connection.');
  }
  const data = await response.json().catch(() => ({})) as ShareResponse;
  if (!response.ok) {
    throw new Error(data.error || 'The location-sharing request failed.');
  }
  return data;
}

const OWNER_TOKEN_KEY = 'nirbhaya_location_owner_tokens';

function readOwnerTokens(): Record<string, string> {
  try {
    const raw = sessionStorage.getItem(OWNER_TOKEN_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeOwnerTokens(tokens: Record<string, string>) {
  try {
    sessionStorage.setItem(OWNER_TOKEN_KEY, JSON.stringify(tokens));
  } catch {
    // Session storage may be unavailable in hardened browser modes.
  }
}

export const locationShareService = {
  rememberOwnerToken(token: string, ownerToken: string): void {
    const tokens = readOwnerTokens();
    tokens[token] = ownerToken;
    writeOwnerTokens(tokens);
  },

  getOwnerToken(token: string): string | null {
    return readOwnerTokens()[token] || null;
  },

  forgetOwnerToken(token: string): void {
    const tokens = readOwnerTokens();
    delete tokens[token];
    writeOwnerTokens(tokens);
  },

  async create(options: {
    recipientLabel: string;
    message?: string;
    minutes: number;
    lat?: number | null;
    lng?: number | null;
    accuracyMeters?: number | null;
  }): Promise<LocationShare> {
    const data = await request('/api/location-shares', 'POST', {
      recipientLabel: options.recipientLabel,
      message: options.message || '',
      minutes: options.minutes,
      location: options.lat != null && options.lng != null
        ? { lat: options.lat, lng: options.lng, accuracyMeters: options.accuracyMeters }
        : undefined
    });
    if (!data.share) throw new Error('The server did not return a sharing session.');
    return data.share;
  },

  async update(token: string, ownerToken: string, lat: number, lng: number, accuracyMeters?: number | null): Promise<LocationShare> {
    const data = await request(`/api/location-shares/${encodeURIComponent(token)}`, 'PATCH', {
      ownerToken,
      location: { lat, lng, accuracyMeters }
    });
    if (!data.share) throw new Error('The server did not return the updated share.');
    return data.share;
  },

  async stop(token: string, ownerToken: string): Promise<void> {
    await request(`/api/location-shares/${encodeURIComponent(token)}/stop`, 'POST', { ownerToken });
  },

  async list(): Promise<LocationShare[]> {
    const data = await request('/api/location-shares', 'GET');
    return data.shares || [];
  },

  async getPublic(token: string): Promise<LocationShare | null> {
    try {
      const data = await request(`/api/location-shares/${encodeURIComponent(token)}/public`, 'GET');
      return data.share || null;
    } catch (error) {
      if (error instanceof Error && error.message.includes('does not exist')) return null;
      throw error;
    }
  },

  shareUrl(share: LocationShare): string {
    const path = share.sharePath || `/share/${share.token}`;
    return `${window.location.origin}${path}`;
  }
};
