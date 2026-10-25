/**
 * Notification and alert helpers.
 *
 * A browser cannot prove that a call connected or an SMS was sent. Every result
 * therefore separates "we opened an app / draft" from "delivery confirmed".
 * NIRBHAYA never claims confirmed delivery.
 */
import { TrustedContact } from '@/types';
import { LatLng, locationService } from '@/services/location/locationService';

export interface AlertDispatchResult {
  actionInitiated: 'tel_dialer_requested' | 'sms_app_opened' | 'browser_notification' | 'none';
  deliveryConfirmed: false;
  statusMessage: string;
  recipientsCount: number;
}

export interface AlertDraft {
  phones: string;
  body: string;
  recipientsCount: number;
}

export interface SmsSendResult {
  acceptedCount: number;
  failedCount: number;
  deliveryConfirmed: false;
  message: string;
}

export const notificationService = {
  triggerEmergencyDialer(): AlertDispatchResult {
    try {
      window.location.href = 'tel:112';
      return {
        actionInitiated: 'tel_dialer_requested',
        deliveryConfirmed: false,
        statusMessage: 'Requested the device dialer for 112. NIRBHAYA cannot confirm that the dialer opened or that a call connected.',
        recipientsCount: 0
      };
    } catch {
      return {
        actionInitiated: 'none',
        deliveryConfirmed: false,
        statusMessage: 'Could not open the dialer automatically. Please dial 112 manually.',
        recipientsCount: 0
      };
    }
  },

  buildTrustedContactsDraft(
    contacts: TrustedContact[],
    userCoords?: LatLng | null,
    customNote?: string,
    includeLocation = false,
    selection: 'sos' | 'checkin' = 'sos'
  ): AlertDraft {
    const flag = selection === 'checkin' ? 'notifyOnCheckInMissed' : 'notifyOnSOS';
    const validContacts = contacts.filter(c => c[flag] && c.phone.trim().length > 0);
    let body = 'EMERGENCY: I need assistance immediately.';
    if (customNote) body += ` Note: ${customNote}.`;
    if (includeLocation && userCoords) {
      body += ` My last known location (device estimate): ${locationService.getMapsUrl(userCoords)}`;
    } else {
      body += ' Location was not included.';
    }
    return {
      phones: validContacts.map(c => c.phone).join(';'),
      body,
      recipientsCount: validContacts.length
    };
  },

  /**
   * Must only be called after a deliberate user action. It opens the device SMS
   * composer; the user still reviews and sends the message.
   */
  openTrustedContactsSms(draft: AlertDraft): AlertDispatchResult {
    if (draft.recipientsCount === 0 || !draft.phones) {
      return {
        actionInitiated: 'none',
        deliveryConfirmed: false,
        statusMessage: 'No trusted contacts are enabled for SOS alerts. No message was opened.',
        recipientsCount: 0
      };
    }

    try {
      const encoded = encodeURIComponent(draft.body);
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const smsLink = isIOS
        ? `sms:${draft.phones}&body=${encoded}`
        : `sms:${draft.phones}?body=${encoded}`;
      const link = document.createElement('a');
      link.href = smsLink;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return {
        actionInitiated: 'sms_app_opened',
        deliveryConfirmed: false,
        statusMessage: `Requested an SMS draft for ${draft.recipientsCount} contact(s). Review and press send in your messaging app. NIRBHAYA cannot confirm that the app opened or that the message was delivered.`,
        recipientsCount: draft.recipientsCount
      };
    } catch {
      return {
        actionInitiated: 'none',
        deliveryConfirmed: false,
        statusMessage: 'Could not open the SMS app. Copy the alert text and send it manually.',
        recipientsCount: draft.recipientsCount
      };
    }
  },

  async sendSmsAlert(draft: AlertDraft): Promise<SmsSendResult> {
    const response = await fetch('/api/alerts/sms', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipients: draft.phones.split(';').filter(Boolean),
        message: draft.body
      })
    });
    const payload = await response.json().catch(() => ({})) as Partial<SmsSendResult> & { error?: string };
    if (!response.ok) {
      throw new Error(payload.error || 'SMS delivery could not be started.');
    }
    return payload as SmsSendResult;
  },

  async copyAlertText(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  },

  async sendBrowserNotification(title: string, body: string): Promise<boolean> {
    if (!('Notification' in window)) return false;
    try {
      if (Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/favicon.ico' });
        return true;
      }
      if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification(title, { body });
          return true;
        }
      }
    } catch {
      // Browser notification policy blocked the request.
    }
    return false;
  }
};
