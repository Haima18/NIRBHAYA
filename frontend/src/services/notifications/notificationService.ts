/**
 * Notification & Alert Service
 * Manages device calling shortcuts, SMS drafting, and honest delivery state reporting.
 */
import { TrustedContact } from '@/types';
import { LatLng, locationService } from '@/services/location/locationService';

export interface AlertDispatchResult {
  actionInitiated: 'tel_emergency' | 'sms_drafted' | 'browser_notification' | 'demo_simulation';
  isRealDelivery: boolean;
  statusMessage: string;
  recipientsCount: number;
}

export const notificationService = {
  /**
   * Initiates direct emergency call to 112 via system dialer.
   */
  triggerEmergencyDialer(): { success: boolean; message: string } {
    try {
      window.location.href = 'tel:112';
      return {
        success: true,
        message: 'Device phone dialer opened for National Emergency 112.'
      };
    } catch {
      return {
        success: false,
        message: 'Unable to open device dialer automatically. Please dial 112 manually.'
      };
    }
  },

  /**
   * Drafts an SMS alert to trusted contacts with optional coordinates.
   */
  draftTrustedContactsAlert(
    contacts: TrustedContact[],
    userCoords?: LatLng | null,
    customNote?: string
  ): AlertDispatchResult {
    const validContacts = contacts.filter(c => c.notifyOnSOS && c.phone.trim().length > 0);
    const phones = validContacts.map(c => c.phone).join(';');

    let body = 'EMERGENCY: I need assistance immediately.';
    if (customNote) {
      body += ` Note: ${customNote}.`;
    }
    if (userCoords) {
      const mapsUrl = locationService.getMapsUrl(userCoords);
      body += ` My estimated location: ${mapsUrl}`;
    } else {
      body += ' (Location was not shared or was unavailable).';
    }

    if (validContacts.length === 0) {
      return {
        actionInitiated: 'demo_simulation',
        isRealDelivery: false,
        statusMessage: 'No trusted contacts configured. Alert simulated in local demo mode.',
        recipientsCount: 0
      };
    }

    // Try to trigger device SMS protocol
    try {
      const encoded = encodeURIComponent(body);
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const smsLink = isIOS ? `sms:${phones}&body=${encoded}` : `sms:${phones}?body=${encoded}`;
      
      const link = document.createElement('a');
      link.href = smsLink;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return {
        actionInitiated: 'sms_drafted',
        isRealDelivery: true,
        statusMessage: `SMS drafted for ${validContacts.length} trusted contact(s). Confirm send in your messaging app.`,
        recipientsCount: validContacts.length
      };
    } catch {
      return {
        actionInitiated: 'demo_simulation',
        isRealDelivery: false,
        statusMessage: 'Could not launch SMS client. Alert was recorded locally in demo mode.',
        recipientsCount: validContacts.length
      };
    }
  },

  /**
   * Optional browser notification
   */
  async sendBrowserNotification(title: string, body: string): Promise<boolean> {
    if (!('Notification' in window)) return false;
    try {
      if (Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/favicon.ico' });
        return true;
      } else if (Notification.permission !== 'denied') {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          new Notification(title, { body });
          return true;
        }
      }
    } catch {
      // Notification policy
    }
    return false;
  }
};
