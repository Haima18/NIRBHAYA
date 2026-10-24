/**
 * Storage Service
 * Centralizes persistent client-side data for offline resilience and privacy.
 */
import {
  UserProfile,
  IncidentRecord,
  CheckInSession,
  Journey,
  TrustedContact,
  PathwayPlan,
  HerCircleRequest,
  LegalConsultationRequest,
  SafePlacePlan,
  TextAnalysisResult,
  DeepfakeReport
} from '@/types';

const STORAGE_KEYS = {
  PROFILE: 'nirbhaya_user_profile',
  INCIDENTS: 'nirbhaya_incidents',
  CHECKIN: 'nirbhaya_active_checkin',
  JOURNEY: 'nirbhaya_active_journey',
  CONTACTS: 'nirbhaya_trusted_contacts',
  PATHWAY_PLANS: 'nirbhaya_pathway_plans',
  HERCIRCLE_REQUESTS: 'nirbhaya_hercircle_requests',
  HERCIRCLE_SAFE_PLAN: 'nirbhaya_hercircle_safe_plan',
  HERCIRCLE_DOCUMENTS: 'nirbhaya_hercircle_documents',
  LEGAL_CONSULTATIONS: 'nirbhaya_legal_consultations',
  TEXT_ANALYSES: 'nirbhaya_text_analyses',
  DEEPFAKE_REPORTS: 'nirbhaya_deepfake_reports',
  SAVED_NEWS: 'nirbhaya_saved_news'
};

const DEFAULT_PROFILE: UserProfile = {
  id: 'usr_local_default',
  name: 'Default User',
  email: 'safe.user@nirbhaya.internal',
  quickExitUrl: 'https://www.accuweather.com',
  aiProcessingConsent: false,
  locationConsent: false,
  discreetMode: false,
  preferredLanguage: 'English'
};

let activeUserScope: string | null = null;
const scopedKey = (key: string) => activeUserScope ? `${key}:${activeUserScope}` : `${key}:guest`;

export const storageService = {
  setUserScope(userId: string | null): void {
    activeUserScope = userId;
  },

  getProfile(): UserProfile {
    try {
      const data = localStorage.getItem(scopedKey(STORAGE_KEYS.PROFILE));
      return data ? JSON.parse(data) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  },

  saveProfile(profile: UserProfile): void {
    localStorage.setItem(scopedKey(STORAGE_KEYS.PROFILE), JSON.stringify(profile));
  },

  getIncidents(): IncidentRecord[] {
    try {
      const data = localStorage.getItem(scopedKey(STORAGE_KEYS.INCIDENTS));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveIncident(incident: IncidentRecord): void {
    const list = this.getIncidents();
    const index = list.findIndex(i => i.id === incident.id);
    if (index >= 0) {
      list[index] = incident;
    } else {
      list.unshift(incident);
    }
    localStorage.setItem(scopedKey(STORAGE_KEYS.INCIDENTS), JSON.stringify(list));
  },

  deleteIncident(id: string): void {
    const list = this.getIncidents().filter(i => i.id !== id);
    localStorage.setItem(scopedKey(STORAGE_KEYS.INCIDENTS), JSON.stringify(list));
  },

  getCheckIn(): CheckInSession | null {
    try {
      const data = localStorage.getItem(scopedKey(STORAGE_KEYS.CHECKIN));
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveCheckIn(session: CheckInSession | null): void {
    if (session) {
      localStorage.setItem(scopedKey(STORAGE_KEYS.CHECKIN), JSON.stringify(session));
    } else {
      localStorage.removeItem(scopedKey(STORAGE_KEYS.CHECKIN));
    }
  },

  getJourney(): Journey | null {
    try {
      const data = localStorage.getItem(scopedKey(STORAGE_KEYS.JOURNEY));
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveJourney(journey: Journey | null): void {
    if (journey) {
      localStorage.setItem(scopedKey(STORAGE_KEYS.JOURNEY), JSON.stringify(journey));
    } else {
      localStorage.removeItem(scopedKey(STORAGE_KEYS.JOURNEY));
    }
  },

  getTrustedContacts(): TrustedContact[] {
    try {
      const data = localStorage.getItem(scopedKey(STORAGE_KEYS.CONTACTS));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveTrustedContacts(contacts: TrustedContact[]): void {
    localStorage.setItem(scopedKey(STORAGE_KEYS.CONTACTS), JSON.stringify(contacts));
  },

  getPathwayPlans(): PathwayPlan[] {
    try {
      const data = localStorage.getItem(scopedKey(STORAGE_KEYS.PATHWAY_PLANS));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  savePathwayPlan(plan: PathwayPlan): void {
    const list = this.getPathwayPlans().filter(p => p.situation !== plan.situation);
    list.unshift(plan);
    localStorage.setItem(scopedKey(STORAGE_KEYS.PATHWAY_PLANS), JSON.stringify(list));
  },

  getHerCircleRequests(): HerCircleRequest[] {
    try {
      const data = localStorage.getItem(scopedKey(STORAGE_KEYS.HERCIRCLE_REQUESTS));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveHerCircleRequest(req: HerCircleRequest): void {
    const list = this.getHerCircleRequests();
    list.unshift(req);
    localStorage.setItem(scopedKey(STORAGE_KEYS.HERCIRCLE_REQUESTS), JSON.stringify(list));
  },

  deleteHerCircleRequest(id: string): void {
    const list = this.getHerCircleRequests().filter(req => req.id !== id);
    localStorage.setItem(scopedKey(STORAGE_KEYS.HERCIRCLE_REQUESTS), JSON.stringify(list));
  },

  getSafePlacePlan(): SafePlacePlan | null {
    try {
      const data = localStorage.getItem(scopedKey(STORAGE_KEYS.HERCIRCLE_SAFE_PLAN));
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveSafePlacePlan(plan: SafePlacePlan | null): void {
    if (plan) {
      localStorage.setItem(scopedKey(STORAGE_KEYS.HERCIRCLE_SAFE_PLAN), JSON.stringify(plan));
    } else {
      localStorage.removeItem(scopedKey(STORAGE_KEYS.HERCIRCLE_SAFE_PLAN));
    }
  },

  getCompletedDocumentIds(): string[] {
    try {
      const data = localStorage.getItem(scopedKey(STORAGE_KEYS.HERCIRCLE_DOCUMENTS));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveCompletedDocumentIds(ids: string[]): void {
    localStorage.setItem(scopedKey(STORAGE_KEYS.HERCIRCLE_DOCUMENTS), JSON.stringify(ids));
  },

  getLegalConsultationRequests(): LegalConsultationRequest[] {
    try {
      const data = localStorage.getItem(scopedKey(STORAGE_KEYS.LEGAL_CONSULTATIONS));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveLegalConsultationRequest(request: LegalConsultationRequest): void {
    const list = this.getLegalConsultationRequests();
    list.unshift(request);
    localStorage.setItem(scopedKey(STORAGE_KEYS.LEGAL_CONSULTATIONS), JSON.stringify(list.slice(0, 30)));
  },

  deleteLegalConsultationRequest(id: string): void {
    const list = this.getLegalConsultationRequests().filter(request => request.id !== id);
    localStorage.setItem(scopedKey(STORAGE_KEYS.LEGAL_CONSULTATIONS), JSON.stringify(list));
  },

  getTextAnalyses(): TextAnalysisResult[] {
    try {
      const data = localStorage.getItem(scopedKey(STORAGE_KEYS.TEXT_ANALYSES));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveTextAnalysis(result: TextAnalysisResult): void {
    const list = this.getTextAnalyses();
    list.unshift(result);
    localStorage.setItem(scopedKey(STORAGE_KEYS.TEXT_ANALYSES), JSON.stringify(list.slice(0, 20)));
  },

  getDeepfakeReports(): DeepfakeReport[] {
    try {
      const data = localStorage.getItem(scopedKey(STORAGE_KEYS.DEEPFAKE_REPORTS));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveDeepfakeReport(report: DeepfakeReport): void {
    const list = this.getDeepfakeReports();
    list.unshift(report);
    localStorage.setItem(scopedKey(STORAGE_KEYS.DEEPFAKE_REPORTS), JSON.stringify(list.slice(0, 20)));
  },

  getSavedNewsIds(): string[] {
    try {
      const data = localStorage.getItem(scopedKey(STORAGE_KEYS.SAVED_NEWS));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  toggleSaveNews(newsId: string): boolean {
    const current = this.getSavedNewsIds();
    const index = current.indexOf(newsId);
    let isSaved = false;
    if (index >= 0) {
      current.splice(index, 1);
      isSaved = false;
    } else {
      current.push(newsId);
      isSaved = true;
    }
    localStorage.setItem(scopedKey(STORAGE_KEYS.SAVED_NEWS), JSON.stringify(current));
    return isSaved;
  },

  exportAllData(): string {
    const backup = {
      exportedAt: new Date().toISOString(),
      platform: 'NIRBHAYA Women Safety Platform',
      version: '1.1.0',
      profile: this.getProfile(),
      incidents: this.getIncidents(),
      trustedContacts: this.getTrustedContacts(),
      pathwayPlans: this.getPathwayPlans(),
      herCircleRequests: this.getHerCircleRequests(),
      herCircleSafePlan: this.getSafePlacePlan(),
      herCircleCompletedDocuments: this.getCompletedDocumentIds(),
      legalConsultationRequests: this.getLegalConsultationRequests(),
      textAnalyses: this.getTextAnalyses(),
      deepfakeReports: this.getDeepfakeReports()
    };
    return JSON.stringify(backup, null, 2);
  },

  wipeAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(scopedKey(key)));
  }
};
