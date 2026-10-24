/**
 * NIRBHAYA Shared Data Types
 * Independent of UI presentation to ensure 100% frontend replaceability.
 */

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  phone?: string;
  bio?: string;
  emergencyPin?: string;
  emergencyCodeWord?: string;
  quickExitUrl: string;
  aiProcessingConsent: boolean;
  locationConsent: boolean;
  discreetMode: boolean;
  preferredLanguage: string;
  joinedDate?: string;
  trustedContactsCount?: number;
  rememberMe?: boolean;
}

export interface AuthSession {
  user: UserProfile | null;
  token?: string;
  isAuthenticated: boolean;
}

// Module B: Physical Safety Types
export type SOSStatus = 'idle' | 'activating' | 'active' | 'cancelled' | 'demo_active';

export interface SirenState {
  isPlaying: boolean;
  isMuted: boolean;
  audioBlocked: boolean;
  volume: number;
}

export interface CheckInSession {
  id: string;
  durationMinutes: number;
  startTime: number;
  targetTime: number;
  status: 'active' | 'completed' | 'expired' | 'cancelled';
  note?: string;
  contactsNotified: boolean;
}

export interface JourneyWaypoint {
  lat: number;
  lng: number;
  timestamp: number;
}

export interface Journey {
  id: string;
  destination: string;
  etaMinutes: number;
  startTime: number;
  targetArrivalTime: number;
  status: 'in_progress' | 'arrived' | 'delayed' | 'alert_triggered';
  currentLocation?: { lat: number; lng: number };
  waypoints: JourneyWaypoint[];
  shareWithCircle: boolean;
}

export interface TrustedContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  notifyOnSOS: boolean;
  notifyOnCheckInMissed: boolean;
}

export interface FakeCallConfig {
  callerName: string;
  callerNumber: string;
  delaySeconds: number;
  ringtone: 'classic' | 'chime' | 'gentle';
  scriptType: 'urgent_family' | 'work_emergency' | 'doctor_appointment';
}

// Module C: Digital Guardian
export interface HarassmentPattern {
  category: string;
  description: string;
  confidence: number;
  matchedPhrases: string[];
  actionAdvice: string;
}

export interface TextAnalysisResult {
  id: string;
  analyzedAt: string;
  originalText: string;
  overallRisk: SeverityLevel;
  summary: string;
  detectedPatterns: HarassmentPattern[];
  recommendedSteps: string[];
  aiAssisted: boolean;
  modelNote: string;
}

// Module D: Privacy Shield
export interface PrivacyCheckItem {
  id: string;
  title: string;
  category: 'social_media' | 'device' | 'accounts' | 'doxxing' | 'impersonation';
  impact: 'high' | 'medium' | 'low';
  description: string;
  actionSteps: string[];
  completed: boolean;
  officialHelpUrl?: string;
}

// Module E: Deepfake Detective
export interface MediaMetadata {
  fileName: string;
  fileSize: number;
  mimeType: string;
  dimensions?: string;
  durationSeconds?: number;
  hasExif: boolean;
  deviceModel?: string;
  software?: string;
}

export interface ForensicHeuristic {
  checkName: string;
  status: 'pass' | 'warning' | 'anomaly';
  explanation: string;
}

export interface DeepfakeReport {
  id: string;
  fileName: string;
  analyzedAt: string;
  mediaType: 'image' | 'video' | 'audio';
  metadata: MediaMetadata;
  heuristics: ForensicHeuristic[];
  suspiciousTimestamps?: string[];
  authenticityStatus: 'unverified_heuristics_only' | 'suspicious_artifacts' | 'standard_metadata';
  disclaimer: string;
  guidance: string[];
}

// Module F: NIRBHAYA Pathway
export type PathwaySituation =
  | 'domestic_abuse'
  | 'physical_danger'
  | 'cyberstalking'
  | 'online_harassment'
  | 'blackmail'
  | 'doxxing'
  | 'impersonation'
  | 'deepfake_abuse'
  | 'ncii'
  | 'account_compromise'
  | 'uncertain';

export interface PathwayActionItem {
  id: string;
  text: string;
  completed: boolean;
  emergencyLink?: string;
}

export interface PathwayStep {
  id: string;
  title: string;
  description: string;
  category: 'immediate_safety' | 'evidence_preservation' | 'account_protection' | 'reporting' | 'support' | 'legal_support';
  isUrgent: boolean;
  actions: PathwayActionItem[];
}

export interface PathwayPlan {
  situation: PathwaySituation;
  situationTitle: string;
  immediateDangerChecked: boolean;
  immediateDangerDetected: boolean;
  steps: PathwayStep[];
  createdAt: string;
  updatedAt: string;
}

// Module G: HerCircle
export interface HerCircleRequest {
  id: string;
  alias: string;
  category: string;
  preferredLanguage: string;
  preferredChannel: 'chat' | 'call' | 'in_person';
  notes: string;
  status: 'submitted' | 'matched' | 'scheduled' | 'completed';
  createdAt: string;
  scheduledTime?: string;
}

export interface SupporterProfile {
  id: string;
  name: string;
  title: string;
  verifiedOrganization: string;
  languages: string[];
  experienceYears: number;
  specializations: string[];
  bio: string;
  isVerifiedSample: boolean;
}

// Module H: Legal Support
export interface LawyerProfile {
  id: string;
  name: string;
  barCouncilNumber: string;
  city: string;
  state: string;
  languages: string[];
  practiceAreas: string[];
  feeType: 'pro_bono' | 'sliding_scale' | 'standard';
  experienceYears: number;
  consultationModes: string[];
  bio: string;
  isVerifiedSample: boolean;
}

// Module I: Evidence Vault
export interface IncidentRecord {
  id: string;
  title: string;
  category: string;
  incidentDate: string;
  severity: SeverityLevel;
  description: string;
  perpetratorInfo?: string;
  notes: string;
  pastedText?: string;
  attachmentNames?: string[];
  relatedReportId?: string;
  createdAt: string;
  updatedAt: string;
}

// Module J: AI Assistant
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  suggestedActions?: { label: string; route: string }[];
}

// Module K: Safety News
export interface SafetyNewsArticle {
  id: string;
  headline: string;
  summary: string;
  publisher: string;
  date: string;
  category: 'safety' | 'cybercrime' | 'legal_rights' | 'deepfakes' | 'domestic_abuse' | 'advisory';
  sourceUrl: string;
  safetyLesson: string;
  relatedFeatureRoute: string;
  isSaved?: boolean;
}

// Module L: Empowerment Resources
export interface EmpowermentResource {
  id: string;
  title: string;
  category: 'financial_literacy' | 'career_skills' | 'digital_literacy' | 'legal_rights' | 'government_schemes';
  summary: string;
  officialPortal: string;
  keyBenefits: string[];
  contactHelpline?: string;
}

// Module M: Emergency Helplines
export interface EmergencyContact {
  id: string;
  title: string;
  number: string;
  category: 'police' | 'women' | 'cyber' | 'domestic' | 'legal' | 'counselling';
  description: string;
  operationalHours: string;
  website: string;
}
