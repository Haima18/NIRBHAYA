/**
 * Evergreen safety-awareness library.
 *
 * This is deliberately NOT a live news feed. No news API is configured, so the
 * app must not present fabricated headlines, publishers, or dates as current
 * reporting. Each entry is general guidance with a link to an official source
 * the user can verify.
 */
import { SafetyNewsArticle } from '@/types';

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

export const newsService = {
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
  }
};
