/**
 * NIRBHAYA Pathway Generator
 * Interactive decision-tree and crisis triage engine.
 * Never pressures user; prioritizes physical safety, evidence preservation, and self-chosen steps.
 */
import { PathwaySituation, PathwayPlan, PathwayStep } from '@/types';

interface SituationConfig {
  title: string;
  isUrgentCheckNeeded: boolean;
  steps: Omit<PathwayStep, 'id'>[];
}

const SITUATION_CONFIGS: Record<PathwaySituation, SituationConfig> = {
  physical_danger: {
    title: 'Physical Danger or Immediate Stalking',
    isUrgentCheckNeeded: true,
    steps: [
      {
        title: 'Step 1: Immediate Physical Safety & Escape',
        description: 'Your life and physical well-being are the top priority. Do not prioritize collecting evidence if you are unsafe.',
        category: 'immediate_safety',
        isUrgent: true,
        actions: [
          { id: 'pd_act_1', text: 'Call National Emergency 112 or activate device SOS', completed: false, emergencyLink: 'tel:112' },
          { id: 'pd_act_2', text: 'Move toward a public location, 24/7 store, hospital lobby, or metro station', completed: false },
          { id: 'pd_act_3', text: 'Activate Emergency Siren to draw bystander attention if approached', completed: false },
          { id: 'pd_act_4', text: 'Send location link to your Trusted Circle', completed: false }
        ]
      },
      {
        title: 'Step 2: Safe Accommodation & Support',
        description: 'Ensure you have a secure refuge for the next 24 to 48 hours.',
        category: 'support',
        isUrgent: false,
        actions: [
          { id: 'pd_act_5', text: 'Call Women Helpline 181 to ask about a nearby One Stop Centre; availability is not verified by NIRBHAYA', completed: false },
          { id: 'pd_act_6', text: 'Notify a trusted family member or close friend of your whereabouts', completed: false }
        ]
      }
    ]
  },

  domestic_abuse: {
    title: 'Domestic Abuse or Controlling Environment',
    isUrgentCheckNeeded: true,
    steps: [
      {
        title: 'Step 1: Discretion & Immediate Protection Plan',
        description: 'Take careful steps that do not alert a controlling partner. Move at your own pace.',
        category: 'immediate_safety',
        isUrgent: true,
        actions: [
          { id: 'da_act_1', text: 'Use Quick Exit if someone enters the room', completed: false },
          { id: 'da_act_2', text: 'Keep a discreet "grab bag" with essential documents (Aadhaar, cash, medicines, duplicate keys)', completed: false },
          { id: 'da_act_3', text: 'Agree on a secret code word with a trusted contact that means "call the police for me"', completed: false }
        ]
      },
      {
        title: 'Step 2: Evidence Preservation (Without Exposure)',
        description: 'Document incidents discreetly in a place the abuser cannot discover.',
        category: 'evidence_preservation',
        isUrgent: false,
        actions: [
          { id: 'da_act_4', text: 'Store dated notes or medical records in NIRBHAYA Evidence Vault or a secure hidden email', completed: false },
          { id: 'da_act_5', text: 'Photograph visible bruises or damaged property immediately', completed: false }
        ]
      },
      {
        title: 'Step 3: Confidential Legal & Emotional Pathways',
        description: 'Explore options without any pressure to immediately leave or confront.',
        category: 'support',
        isUrgent: false,
        actions: [
          { id: 'da_act_6', text: 'Review HerCircle support-planning tools; this app does not connect peer listeners', completed: false },
          { id: 'da_act_7', text: 'Learn about Protection Orders under the Protection of Women from Domestic Violence Act (PWDVA)', completed: false },
          { id: 'da_act_8', text: 'Use Legal Support to find official legal-aid routes; its sample lawyer profiles are not real practitioners', completed: false }
        ]
      }
    ]
  },

  blackmail: {
    title: 'Blackmail, Extortion or Threat of Leak',
    isUrgentCheckNeeded: false,
    steps: [
      {
        title: 'Step 1: Immediate Disengagement & Safeguards',
        description: 'Extortion thrives on fear and panic. Ground yourself and do not comply with demands.',
        category: 'immediate_safety',
        isUrgent: true,
        actions: [
          { id: 'bm_act_1', text: 'DO NOT pay money, send cryptocurrency, or provide more photos (payments only trigger higher demands)', completed: false },
          { id: 'bm_act_2', text: 'Do not delete the chat thread yet; you will need it for official reporting', completed: false },
          { id: 'bm_act_3', text: 'Temporarily switch social media accounts to private and restrict message requests', completed: false }
        ]
      },
      {
        title: 'Step 2: Forensic Evidence Preservation',
        description: 'Capture comprehensive evidence before the perpetrator un-sends or deletes their account.',
        category: 'evidence_preservation',
        isUrgent: false,
        actions: [
          { id: 'bm_act_4', text: 'Take full uncropped screenshots including sender username, phone number, and exact timestamps', completed: false },
          { id: 'bm_act_5', text: 'Copy the URL/handle of the extortionist profile', completed: false },
          { id: 'bm_act_6', text: 'Store all artifacts in the NIRBHAYA Evidence Vault', completed: false }
        ]
      },
      {
        title: 'Step 3: Proactive Takedown & Cybercrime Reporting',
        description: 'Block distribution and submit an official complaint.',
        category: 'reporting',
        isUrgent: false,
        actions: [
          { id: 'bm_act_7', text: 'Visit StopNCII.org to generate hash stop-lists for intimate photos across major social platforms', completed: false },
          { id: 'bm_act_8', text: 'Call 1930 to lodge a complaint with the National Cyber Crime Helpline', completed: false },
          { id: 'bm_act_9', text: 'File a formal cybercrime report at cybercrime.gov.in under "Women/Children Related Cyber Crime"', completed: false }
        ]
      }
    ]
  },

  deepfake_abuse: {
    title: 'AI Deepfakes or Fabricated Media Abuse',
    isUrgentCheckNeeded: false,
    steps: [
      {
        title: 'Step 1: Verify & Catalog the Fabricated File',
        description: 'Analyze the media and gather digital artifacts without panic.',
        category: 'evidence_preservation',
        isUrgent: true,
        actions: [
          { id: 'df_act_1', text: 'Save the unaltered video or image file to disk', completed: false },
          { id: 'df_act_2', text: 'Run the file through NIRBHAYA Deepfake Detective to inspect container metadata', completed: false },
          { id: 'df_act_3', text: 'Record links to all web pages or accounts where the synthetic media was posted', completed: false }
        ]
      },
      {
        title: 'Step 2: Platform Takedowns & StopNCII',
        description: 'Stop the proliferation of synthetic media.',
        category: 'account_protection',
        isUrgent: false,
        actions: [
          { id: 'df_act_4', text: 'Submit urgent takedown notice to the hosting platform citing Non-Consensual Synthetic Media', completed: false },
          { id: 'df_act_5', text: 'Submit hashes to StopNCII.org or TakeItDown.ncmec.org', completed: false },
          { id: 'df_act_6', text: 'Report to IT Grievance Officer of the respective social media intermediary', completed: false }
        ]
      },
      {
        title: 'Step 3: Legal Injunctions & Cyber FIR',
        description: 'Explore legal remedies against defamation and criminal harassment.',
        category: 'legal_support',
        isUrgent: false,
        actions: [
          { id: 'df_act_7', text: 'File report on cybercrime.gov.in (IT Act Sec 66E / 67A)', completed: false },
          { id: 'df_act_8', text: 'Prepare consultation notes for a cyber law advocate via NIRBHAYA Legal Support', completed: false }
        ]
      }
    ]
  },

  cyberstalking: {
    title: 'Cyberstalking & Persistent Online Harassment',
    isUrgentCheckNeeded: false,
    steps: [
      {
        title: 'Step 1: Set Boundaries & Disengage',
        description: 'Break the reinforcement loop without putting yourself at risk.',
        category: 'immediate_safety',
        isUrgent: true,
        actions: [
          { id: 'cs_act_1', text: 'Send one unambiguous refusal message (e.g., "Do not contact me again. Any further messages will be reported to police") then stop replying completely', completed: false },
          { id: 'cs_act_2', text: 'Do not respond to attempts to bait you or question you', completed: false }
        ]
      },
      {
        title: 'Step 2: Digital Fortress & Privacy Hardening',
        description: 'Block the stalker from monitoring your daily movements.',
        category: 'account_protection',
        isUrgent: false,
        actions: [
          { id: 'cs_act_3', text: 'Run NIRBHAYA Privacy Shield checklist to audit account permissions', completed: false },
          { id: 'cs_act_4', text: 'Disable location tagging on Instagram, Snapchat, and fitness trackers', completed: false },
          { id: 'cs_act_5', text: 'Check for unknown linked devices in WhatsApp / Telegram', completed: false }
        ]
      },
      {
        title: 'Step 3: Document Stalking Incidents',
        description: 'Build a solid timeline for law enforcement.',
        category: 'evidence_preservation',
        isUrgent: false,
        actions: [
          { id: 'cs_act_6', text: 'Log every instance (call, message, presence) in the Incident Journal', completed: false },
          { id: 'cs_act_7', text: 'Export Evidence Summary for filing a complaint under Section 354D IPC / BNS', completed: false }
        ]
      }
    ]
  },

  online_harassment: {
    title: 'Online Harassment & Hate Speech',
    isUrgentCheckNeeded: false,
    steps: [
      {
        title: 'Step 1: Contain the Spread & Protect Mental Health',
        description: 'Harassment mobs rely on overwhelming notifications.',
        category: 'immediate_safety',
        isUrgent: false,
        actions: [
          { id: 'oh_act_1', text: 'Temporarily mute notifications or hand account access to a trusted friend', completed: false },
          { id: 'oh_act_2', text: 'Restrict comments to mutual followers only', completed: false },
          { id: 'oh_act_3', text: 'Report abusive accounts in bulk using platform safety tools', completed: false }
        ]
      },
      {
        title: 'Step 2: Analyze Threat Patterns',
        description: 'Separate general insults from actionable threats of violence.',
        category: 'evidence_preservation',
        isUrgent: false,
        actions: [
          { id: 'oh_act_4', text: 'Paste severe messages into Digital Guardian for pattern analysis', completed: false },
          { id: 'oh_act_5', text: 'Save high-risk threats to Evidence Vault', completed: false }
        ]
      }
    ]
  },

  doxxing: {
    title: 'Doxxing (Exposure of Private Data)',
    isUrgentCheckNeeded: true,
    steps: [
      {
        title: 'Step 1: Emergency Removal Requests',
        description: 'Work immediately to remove private addresses, phone numbers, or ID documents.',
        category: 'immediate_safety',
        isUrgent: true,
        actions: [
          { id: 'dx_act_1', text: 'Flag the post as "Exposing Private Personal Information" on the platform', completed: false },
          { id: 'dx_act_2', text: 'Submit Google Outdated Content & Personal Information Removal Request', completed: false },
          { id: 'dx_act_3', text: 'Alert your building security or local police if your home address was published', completed: false }
        ]
      },
      {
        title: 'Step 2: Identity & Financial Security',
        description: 'Prevent identity theft from leaked credentials.',
        category: 'account_protection',
        isUrgent: false,
        actions: [
          { id: 'dx_act_4', text: 'Lock your Aadhaar biometrics via mAadhaar app / UIDAI portal', completed: false },
          { id: 'dx_act_5', text: 'Notify your bank if PAN or banking details were leaked', completed: false },
          { id: 'dx_act_6', text: 'Change passwords and activate hardware / app 2FA on primary email', completed: false }
        ]
      }
    ]
  },

  impersonation: {
    title: 'Fake Profile or Impersonation',
    isUrgentCheckNeeded: false,
    steps: [
      {
        title: 'Step 1: Official Impersonation Takedown',
        description: 'Have the fraudulent profile removed with proof of your identity.',
        category: 'reporting',
        isUrgent: false,
        actions: [
          { id: 'imp_act_1', text: 'Report profile for "Pretending to be me" with government ID verification', completed: false },
          { id: 'imp_act_2', text: 'Post a story or status update from your real account warning friends not to accept requests or money transfers from the imposter', completed: false }
        ]
      },
      {
        title: 'Step 2: Preserving the Imposter Record',
        description: 'Collect URLs and handle history.',
        category: 'evidence_preservation',
        isUrgent: false,
        actions: [
          { id: 'imp_act_3', text: 'Copy the numeric profile ID / URL before the imposter changes their handle', completed: false },
          { id: 'imp_act_4', text: 'Record in NIRBHAYA Incident Journal', completed: false }
        ]
      }
    ]
  },

  ncii: {
    title: 'Non-Consensual Intimate Imagery (NCII)',
    isUrgentCheckNeeded: false,
    steps: [
      {
        title: 'Step 1: Stop Image Propagation via Hashes',
        description: 'Modern privacy tools prevent images from uploading without humans viewing them.',
        category: 'immediate_safety',
        isUrgent: true,
        actions: [
          { id: 'nc_act_1', text: 'Generate image hashes on StopNCII.org (hashes are cryptographic fingerprints; your actual image never leaves your phone)', completed: false },
          { id: 'nc_act_2', text: 'If under 18 years old, utilize TakeItDown.ncmec.org', completed: false }
        ]
      },
      {
        title: 'Step 2: Cyber Crime FIR & Platform Escalation',
        description: 'NCII is a severe crime under Section 67A IT Act punishable with imprisonment.',
        category: 'reporting',
        isUrgent: false,
        actions: [
          { id: 'nc_act_3', text: 'File urgent complaint on cybercrime.gov.in under Section 67A IT Act', completed: false },
          { id: 'nc_act_4', text: 'Call 1930 for priority cyber cell assistance', completed: false },
          { id: 'nc_act_5', text: 'Use Legal Support to find official legal-aid routes; its sample lawyer profiles are not real practitioners', completed: false }
        ]
      }
    ]
  },

  account_compromise: {
    title: 'Hacked Account or Compromised Device',
    isUrgentCheckNeeded: false,
    steps: [
      {
        title: 'Step 1: Regain Control & Terminate Sessions',
        description: 'Eject the attacker from your accounts.',
        category: 'account_protection',
        isUrgent: true,
        actions: [
          { id: 'ac_act_1', text: 'Use "Log out from all devices" in account security settings', completed: false },
          { id: 'ac_act_2', text: 'Reset password immediately using a strong passphrase (16+ chars)', completed: false },
          { id: 'ac_act_3', text: 'Change your recovery email and recovery phone number', completed: false },
          { id: 'ac_act_4', text: 'Enable Authenticator App 2FA (Google Authenticator / Aegis) rather than SMS 2FA', completed: false }
        ]
      },
      {
        title: 'Step 2: Device Malware Audit',
        description: 'Ensure no stalkerware remains on your physical phone.',
        category: 'account_protection',
        isUrgent: false,
        actions: [
          { id: 'ac_act_5', text: 'Check Settings -> Accessibility for suspicious unknown helper apps', completed: false },
          { id: 'ac_act_6', text: 'Review battery usage and background data permissions for strange apps', completed: false }
        ]
      }
    ]
  },

  uncertain: {
    title: 'Unsure if an Interaction is Harmful',
    isUrgentCheckNeeded: false,
    steps: [
      {
        title: 'Step 1: Trust Your Gut & Safety Check',
        description: 'You do not need to prove an emergency to prioritize your comfort and safety.',
        category: 'immediate_safety',
        isUrgent: false,
        actions: [
          { id: 'un_act_1', text: 'Remember that boundary-setting is your fundamental right', completed: false },
          { id: 'un_act_2', text: 'Analyze suspicious text messages in Digital Guardian', completed: false },
          { id: 'un_act_3', text: 'Ask the NIRBHAYA AI Assistant for an objective breakdown of red flags', completed: false }
        ]
      },
      {
        title: 'Step 2: Confidential Exploration',
        description: 'Talk it through in a safe space.',
        category: 'support',
        isUrgent: false,
        actions: [
          { id: 'un_act_4', text: 'Request a confidential listener chat on HerCircle', completed: false },
          { id: 'un_act_5', text: 'Browse Women Safety News and Awareness guides', completed: false }
        ]
      }
    ]
  }
};

export const pathwayService = {
  createPlan(situation: PathwaySituation, immediateDangerDetected = false): PathwayPlan {
    const config = SITUATION_CONFIGS[situation] || SITUATION_CONFIGS.uncertain;
    const steps: PathwayStep[] = config.steps.map((s, idx) => ({
      ...s,
      id: `step_${situation}_${idx + 1}`,
      actions: s.actions.map(a => ({ ...a }))
    }));

    return {
      situation,
      situationTitle: config.title,
      immediateDangerChecked: true,
      immediateDangerDetected,
      steps,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  },

  getSituationTitle(situation: PathwaySituation): string {
    return SITUATION_CONFIGS[situation]?.title || 'Safety Pathway';
  },

  getAllSituations(): { id: PathwaySituation; title: string; urgentCheck: boolean }[] {
    return Object.entries(SITUATION_CONFIGS).map(([key, val]) => ({
      id: key as PathwaySituation,
      title: val.title,
      urgentCheck: val.isUrgentCheckNeeded
    }));
  }
};
