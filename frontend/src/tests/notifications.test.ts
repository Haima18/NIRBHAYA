import { describe, it, expect } from 'vitest';
import { notificationService } from '../services/notifications/notificationService';
import { TrustedContact } from '../types';

const CONTACTS: TrustedContact[] = [
  {
    id: 'sos_only',
    name: 'SOS contact',
    phone: '+91 90000 00001',
    relationship: 'Friend',
    notifyOnSOS: true,
    notifyOnCheckInMissed: false
  },
  {
    id: 'checkin_only',
    name: 'Check-in contact',
    phone: '+91 90000 00002',
    relationship: 'Sibling',
    notifyOnSOS: false,
    notifyOnCheckInMissed: true
  }
];

describe('Trusted-contact alert drafts', () => {
  it('includes only SOS-enabled contacts in an SOS draft', () => {
    const draft = notificationService.buildTrustedContactsDraft(
      CONTACTS,
      { lat: 28.6139, lng: 77.209 },
      'SOS control activated',
      true,
      'sos'
    );

    expect(draft.recipientsCount).toBe(1);
    expect(draft.phones).toBe('+91 90000 00001');
    expect(draft.body).toContain('https://www.google.com/maps');
  });

  it('uses the missed-check-in flag for a check-in draft', () => {
    const draft = notificationService.buildTrustedContactsDraft(
      CONTACTS,
      null,
      'Check-in deadline passed',
      false,
      'checkin'
    );

    expect(draft.recipientsCount).toBe(1);
    expect(draft.phones).toBe('+91 90000 00002');
    expect(draft.body).toContain('Location was not included.');
  });
});
