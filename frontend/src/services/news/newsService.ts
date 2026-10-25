/**
 * Evergreen safety-awareness library.
 *
 * This is deliberately NOT a live news feed. No news API is configured, so the
 * app must not present fabricated headlines, publishers, or dates as current
 * reporting. Each entry is general guidance with a link to an official source
 * the user can verify.
 */
import { SafetyNewsArticle } from '@/types';

interface GdeltArticle {
  url?: unknown;
  title?: unknown;
  domain?: unknown;
  seendate?: unknown;
}

interface GdeltResponse {
  articles?: unknown;
}

const AWARENESS_ARTICLES: SafetyNewsArticle[] = [
  {
    id: 'awareness_1',
    headline: 'Zero FIR: what it means and how to ask for one',
    summary:
      'A Zero FIR is a police practice that lets a First Information Report be registered at a police station even when the alleged offence happened outside its jurisdiction. The report is then transferred to the appropriate station.',
    publisher: 'NIRBHAYA awareness library',
    date: 'Evergreen guidance',
    category: 'legal_rights',
    sourceUrl: 'https://nalsa.gov.in',
    safetyLesson:
      'Ask for a copy of the FIR and note the station and officer details. If a station refuses, you can escalate in writing to the Superintendent of Police and seek help from legal aid. Confirm current procedure with a licensed advocate.',
    relatedFeatureRoute: '/legal-support',
    isEvergreen: true
  },
  {
    id: 'awareness_2',
    headline: 'Blackmail using intimate images: preserve evidence before blocking',
    summary:
      'Demands for money or more images often continue after payment. Preservation of the original messages, profile identifiers, and timestamps helps later reporting and takedown requests.',
    publisher: 'NIRBHAYA awareness library',
    date: 'Evergreen guidance',
    category: 'deepfakes',
    sourceUrl: 'https://cybercrime.gov.in',
    safetyLesson:
      'Do not pay or send more media. Save uncropped screenshots and original files, then report at cybercrime.gov.in or call 1930. StopNCII.org can help with hash-based takedown requests for intimate imagery.',
    relatedFeatureRoute: '/deepfake-detective',
    isEvergreen: true
  },
  {
    id: 'awareness_3',
    headline: 'Check linked devices and app permissions on messaging accounts',
    summary:
      'Unrecognised linked devices and broad app permissions can expose messages and location data. Reviewing active sessions is a practical first step when you suspect account compromise or stalkerware.',
    publisher: 'NIRBHAYA awareness library',
    date: 'Evergreen guidance',
    category: 'cybercrime',
    sourceUrl: 'https://www.cert-in.org.in',
    safetyLesson:
      'Open your messaging app settings, review linked devices, and revoke anything you do not recognise. Enable two-factor authentication and change the password from a device you trust.',
    relatedFeatureRoute: '/privacy-shield',
    isEvergreen: true
  },
  {
    id: 'awareness_4',
    headline: 'One Stop Centres (Sakhi): what they are intended to offer',
    summary:
      'The One Stop Centre scheme is intended to provide integrated support such as medical assistance, police facilitation, legal aid, counselling, and temporary shelter. Availability and services vary by centre and state.',
    publisher: 'NIRBHAYA awareness library',
    date: 'Evergreen guidance',
    category: 'domestic_abuse',
    sourceUrl: 'https://wcd.nic.in/schemes/one-stop-centre-scheme-1',
    safetyLesson:
      'Call 181 to ask about a One Stop Centre near you and confirm what it currently offers. NIRBHAYA has no live facility directory and cannot confirm bed availability or opening hours.',
    relatedFeatureRoute: '/emergency-directory',
    isEvergreen: true
  },
  {
    id: 'awareness_5',
    headline: 'Location permissions and photo geotags: a routine privacy check',
    summary:
      'Utility, ride, and social apps can retain location history. Photos may also carry location metadata. Reviewing permissions and removing geotags before sharing reduces unintended exposure.',
    publisher: 'NIRBHAYA awareness library',
    date: 'Evergreen guidance',
    category: 'advisory',
    sourceUrl: 'https://www.meity.gov.in',
    safetyLesson:
      'Set location access to "while using the app" where possible, review the app privacy settings, and remove location metadata before posting images publicly.',
    relatedFeatureRoute: '/privacy-shield',
    isEvergreen: true
  }
];

const DEMO_ARTICLES: SafetyNewsArticle[] = [
  {
    id: 'demo_1',
    headline: 'Demo: New cybercrime reporting portal launched',
    summary:
      'This is a demonstration headline only. It shows how a live news feed would appear in NIRBHAYA once a licensed news API or verified publisher feed is connected. No real incident or date is claimed.',
    publisher: 'NIRBHAYA demo feed',
    date: 'Demo — not a real date',
    category: 'cybercrime',
    sourceUrl: 'https://cybercrime.gov.in',
    safetyLesson:
      'For real cybercrime reporting in India, use cybercrime.gov.in or call 1930. Do not act on unverified headlines.',
    relatedFeatureRoute: '/safety-news'
  },
  {
    id: 'demo_2',
    headline: 'Demo: Women helpline expands weekend counseling hours',
    summary:
      'This is a demonstration headline only. It illustrates how verified government announcements would surface in the app. Confirm all operational hours directly with the helpline before relying on them.',
    publisher: 'NIRBHAYA demo feed',
    date: 'Demo — not a real date',
    category: 'domestic_abuse',
    sourceUrl: 'https://wcd.nic.in',
    safetyLesson:
      'The Women Helpline (181) and KIRAN (1800-599-0019) are available 24/7 in many states. Confirm local hours before visiting in person.',
    relatedFeatureRoute: '/emergency-directory'
  },
  {
    id: 'demo_3',
    headline: 'Demo: New free legal aid clinic opens in your state',
    summary:
      'This is a demonstration headline only. It shows how State Legal Services Authority announcements would appear. Verify eligibility and availability with NALSA or your State Legal Services Authority.',
    publisher: 'NIRBHAYA demo feed',
    date: 'Demo — not a real date',
    category: 'legal_rights',
    sourceUrl: 'https://nalsa.gov.in',
    safetyLesson:
      'Free legal aid is available under Section 12 of the Legal Services Authorities Act, 1987. Call NALSA at 15100 for details.',
    relatedFeatureRoute: '/legal-support'
  }
];

const formatGdeltDate = (value: string): string => {
  const match = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?$/);
  if (!match) return value;
  const [, year, month, day, hour, minute, second] = match;
  return new Date(Date.UTC(+year, +month - 1, +day, +hour, +minute, +second)).toLocaleString();
};

const toLiveArticle = (item: GdeltArticle): SafetyNewsArticle | null => {
  if (typeof item.url !== 'string' || typeof item.title !== 'string') return null;
  try {
    const url = new URL(item.url);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    const headline = item.title.trim();
    if (!headline) return null;
    const publisher = typeof item.domain === 'string' && item.domain.trim()
      ? item.domain.trim()
      : url.hostname;
    const date = typeof item.seendate === 'string' ? formatGdeltDate(item.seendate) : 'Date unavailable';
    return {
      id: `gdelt_${encodeURIComponent(url.href)}`,
      headline,
      summary: 'Open the publisher’s page to read the full report.',
      publisher,
      date,
      category: 'safety',
      sourceUrl: url.href,
      safetyLesson: 'This external report has not been independently verified by NIRBHAYA. Confirm details with the original publisher and relevant local authorities.',
      relatedFeatureRoute: '/safety-news'
    };
  } catch {
    return null;
  }
};

export const newsService = {
  async getLatestArticles(): Promise<SafetyNewsArticle[]> {
    const controller = new AbortController();
    const timeout = globalThis.setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch('/api/news/headlines', {
        credentials: 'include',
        signal: controller.signal
      });
      const data = await response.json() as GdeltResponse & { error?: unknown };
      if (!response.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : `Global news feed returned HTTP ${response.status}.`);
      }
      if (!Array.isArray(data.articles)) {
        throw new Error('Global news feed returned an unexpected response.');
      }
      const unique = new Map<string, SafetyNewsArticle>();
      (data.articles as GdeltArticle[])
        .map(toLiveArticle)
        .filter((article): article is SafetyNewsArticle => article !== null)
        .forEach(article => unique.set(article.sourceUrl, article));
      return [...unique.values()];
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('Global news feed timed out. Please try again later.');
      }
      throw error;
    } finally {
      globalThis.clearTimeout(timeout);
    }
  },

  getArticles(categoryFilter = 'all', searchQuery = ''): SafetyNewsArticle[] {
    let list = [...AWARENESS_ARTICLES];
    if (categoryFilter !== 'all') {
      list = list.filter(item => item.category === categoryFilter);
    }
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        item =>
          item.headline.toLowerCase().includes(q) ||
          item.summary.toLowerCase().includes(q) ||
          item.safetyLesson.toLowerCase().includes(q)
      );
    }
    return list;
  },

  getDemoArticles(): SafetyNewsArticle[] {
    return [...DEMO_ARTICLES];
  }
};
