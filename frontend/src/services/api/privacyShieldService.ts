/**
 * Privacy Shield Service
 * Comprehensive self-assessment audit and hardening workflows.
 * Clearly distinguishes self-audit checklists from hypothetical external network scans.
 */
import { PrivacyCheckItem } from '@/types';

export interface BrowserPermissionAuditItem {
  id: string;
  label: string;
  state: PermissionState | 'unsupported' | 'error';
  detail: string;
}

const BROWSER_PERMISSION_CHECKS: Array<{ name: PermissionName; label: string }> = [
  { name: 'geolocation', label: 'Location' },
  { name: 'notifications', label: 'Notifications' },
  { name: 'camera', label: 'Camera' },
  { name: 'microphone', label: 'Microphone' }
];

export async function checkBrowserPermissions(): Promise<BrowserPermissionAuditItem[]> {
  if (!navigator.permissions?.query) {
    return BROWSER_PERMISSION_CHECKS.map(({ name, label }) => ({
      id: name,
      label,
      state: 'unsupported',
      detail: 'This browser does not expose this permission state.'
    }));
  }

  return Promise.all(BROWSER_PERMISSION_CHECKS.map(async ({ name, label }) => {
    try {
      const permission = await navigator.permissions.query({ name });
      const details: Record<PermissionState, string> = {
        granted: 'Allowed by the browser. NIRBHAYA has not accessed this device feature.',
        prompt: 'Not yet allowed or denied. The browser may prompt when a feature is used.',
        denied: 'Blocked by the browser or site settings.'
      };
      return { id: name, label, state: permission.state, detail: details[permission.state] };
    } catch (error) {
      const unsupported = error instanceof DOMException && error.name === 'NotSupportedError';
      return {
        id: name,
        label,
        state: unsupported ? 'unsupported' : 'error',
        detail: unsupported
          ? 'This browser does not expose this permission state.'
          : 'The browser could not report this permission state.'
      };
    }
  }));
}

export const DEFAULT_PRIVACY_CHECKLIST: PrivacyCheckItem[] = [
  {
    id: 'prv_1',
    title: 'Audit Social Media Account Visibility',
    category: 'social_media',
    impact: 'high',
    description: 'Ensure personal profiles on Instagram, Facebook, and X (Twitter) are set to Private to prevent strangers from archiving your photos.',
    actionSteps: [
      'Open Instagram Settings -> Account Privacy -> Toggle "Private Account"',
      'Review your follower list and remove accounts without profile pictures or mutual contacts',
      'Disable "Suggest your account to others" in web settings'
    ],
    completed: false,
    officialHelpUrl: 'https://help.instagram.com'
  },
  {
    id: 'prv_2',
    title: 'Disable Live Location & Geotagging',
    category: 'device',
    impact: 'high',
    description: 'Stalkers frequently exploit geotagged photos and real-time location sharing on messaging and fitness apps.',
    actionSteps: [
      'Go to Phone Settings -> Privacy & Security -> Location Services',
      'Set Camera location access to "Never" or disable "Location Tags"',
      'Check WhatsApp / Google Maps / Snapchat to ensure you have no active "Live Location Sharing" sessions running'
    ],
    completed: false
  },
  {
    id: 'prv_3',
    title: 'Review Active Account Sessions & Linked Devices',
    category: 'accounts',
    impact: 'high',
    description: 'Verify no unauthorized browsers or stalkerware devices have active tokens on your accounts.',
    actionSteps: [
      'In WhatsApp: Go to Settings -> Linked Devices. Log out of any unrecognized computer or web session.',
      'In Google Account: Go to Security -> Your Devices -> Sign out of inactive or unrecognized devices',
      'In Instagram: Go to Accounts Center -> Password and Security -> Where you are logged in'
    ],
    completed: false,
    officialHelpUrl: 'https://myaccount.google.com/device-activity'
  },
  {
    id: 'prv_4',
    title: 'Upgrade to App-Based Two-Factor Authentication (2FA)',
    category: 'accounts',
    impact: 'high',
    description: 'SMS-based 2FA is vulnerable to SIM-swap attacks. Switch to an authenticator app (Google Authenticator, Microsoft Authenticator, or Aegis).',
    actionSteps: [
      'Download a trusted authenticator app on your phone',
      'Enable 2FA on primary Gmail / Apple ID using Authenticator App',
      'Store your offline backup recovery codes in a safe physical place'
    ],
    completed: false
  },
  {
    id: 'prv_5',
    title: 'Audit Mobile App Permissions (Microphone, Camera, Contacts)',
    category: 'device',
    impact: 'medium',
    description: 'Disallow background access for unnecessary third-party apps, torches, games, or keyboards.',
    actionSteps: [
      'Go to Settings -> Apps -> Permission Manager',
      'Check Microphone & Camera: allow only essential apps while actively using',
      'Revoke "Read Contacts" and "Storage" from apps that do not require them'
    ],
    completed: false
  },
  {
    id: 'prv_6',
    title: 'Lock Biometrics on Aadhaar (mAadhaar)',
    category: 'doxxing',
    impact: 'high',
    description: 'Prevent unauthorized biometric authentication or impersonation using your national identity credentials.',
    actionSteps: [
      'Install the official mAadhaar app or visit resident.uidai.gov.in',
      'Navigate to "Lock/Unlock Biometrics" and enable lock',
      'Mask your 12-digit Aadhaar when submitting ID copies to hotels or employers'
    ],
    completed: false,
    officialHelpUrl: 'https://resident.uidai.gov.in'
  },
  {
    id: 'prv_7',
    title: 'Search Engine Doxxing Cleanup',
    category: 'doxxing',
    impact: 'medium',
    description: 'Request removal of personal phone numbers, home addresses, or private photos indexed by web search engines.',
    actionSteps: [
      'Search your full name and phone number in quotation marks on Google',
      'Use Google "Results about you" dashboard to request automatic removal of personally identifiable information',
      'Submit takedown requests for people-search directories'
    ],
    completed: false,
    officialHelpUrl: 'https://support.google.com/websearch/answer/9673730'
  },
  {
    id: 'prv_8',
    title: 'Rapid Account-Compromise Recovery Protocol',
    category: 'impersonation',
    impact: 'high',
    description: 'Pre-configure recovery channels so you can quickly reclaim accounts if locked out.',
    actionSteps: [
      'Verify that your recovery email belongs to you and is protected by a separate unique password',
      'Add a trusted emergency recovery phone number',
      'Know the official recovery links for Google, Apple, and Meta'
    ],
    completed: false
  }
];

export const privacyShieldService = {
  getChecklist(): PrivacyCheckItem[] {
    try {
      const stored = localStorage.getItem('nirbhaya_privacy_checklist');
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return DEFAULT_PRIVACY_CHECKLIST;
  },

  saveChecklist(items: PrivacyCheckItem[]): void {
    localStorage.setItem('nirbhaya_privacy_checklist', JSON.stringify(items));
  },

  toggleItem(id: string): PrivacyCheckItem[] {
    const list = this.getChecklist();
    const item = list.find(i => i.id === id);
    if (item) {
      item.completed = !item.completed;
      this.saveChecklist(list);
    }
    return list;
  },

  calculateProgress(items: PrivacyCheckItem[]): { total: number; completed: number; percentage: number } {
    const total = items.length;
    const completed = items.filter(i => i.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  }
};
