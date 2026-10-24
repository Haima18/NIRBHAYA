/**
 * Women's Safety & Awareness News Service
 * Curated awareness feed with verified lessons and direct links to NIRBHAYA tools.
 */
import { SafetyNewsArticle } from '@/types';

const CURATED_NEWS_ARTICLES: SafetyNewsArticle[] = [
  {
    id: 'news_1',
    headline: 'Supreme Court of India Directs Prompt Registration of Zero FIRs in Crimes Against Women',
    summary: 'The Apex Court reaffirmed that any police station must register a Zero FIR irrespective of territorial jurisdiction when a woman reports sexual violence or grave harassment.',
    publisher: 'Legal Express & Law Commission Updates',
    date: 'October 18, 2026',
    category: 'legal_rights',
    sourceUrl: 'https://nalsa.gov.in',
    safetyLesson: 'You can approach ANY nearby police station to register a Zero FIR immediately, even if the incident occurred elsewhere. They cannot turn you away citing jurisdiction.',
    relatedFeatureRoute: '/legal-support'
  },
  {
    id: 'news_2',
    headline: 'Ministry of Home Affairs Issues Cyber Advisory on AI Deepfake Extortion Rackets',
    summary: 'Cybercrime units report a rise in bad actors harvesting social media photos to generate non-consensual synthetic media. Authorities emphasize using StopNCII hashes and dialing 1930 within the golden hour.',
    publisher: 'Cyber Swachhta Kendra',
    date: 'October 12, 2026',
    category: 'deepfakes',
    sourceUrl: 'https://cybercrime.gov.in',
    safetyLesson: 'Never send money or compromise to blackmailers. Report immediately to 1930; financial freeze and URL takedowns are most effective within the first 24 hours.',
    relatedFeatureRoute: '/deepfake-detective'
  },
  {
    id: 'news_3',
    headline: 'CERT-In Issues Guidelines on Securing Messaging Apps Against SIM-Swap and Remote Stalkerware',
    summary: 'New technical advisory warns against clicking unverified APK files and urges citizens to enable biometric lock and mandatory two-factor authentication on WhatsApp and Telegram.',
    publisher: 'Indian Computer Emergency Response Team',
    date: 'September 28, 2026',
    category: 'cybercrime',
    sourceUrl: 'https://cert-in.org.in',
    safetyLesson: 'Review active device sessions in WhatsApp/Telegram under Linked Devices. Revoke any unrecognized browser or device logins immediately.',
    relatedFeatureRoute: '/privacy-shield'
  },
  {
    id: 'news_4',
    headline: 'Sakhi One Stop Centres Expand Rapid Response Shelters Across 700 Districts',
    summary: 'The Ministry of Women & Child Development reports over 800 operational One Stop Centres offering integrated medical, legal, psychological, and temporary shelter under one roof.',
    publisher: 'Women & Child Development Ministry Release',
    date: 'September 15, 2026',
    category: 'domestic_abuse',
    sourceUrl: 'https://wcd.nic.in',
    safetyLesson: 'Sakhi centres provide free shelter, medical assistance, legal counselors, and police assistance in a secure, confidential environment.',
    relatedFeatureRoute: '/emergency-directory'
  },
  {
    id: 'news_5',
    headline: 'Understanding Digital Privacy: Why You Should Audit App Location Permissions Regularly',
    summary: 'Security researchers highlight how seemingly harmless utility and ride apps can leak background location traces that domestic stalkers exploit.',
    publisher: 'Digital Safety Research Group',
    date: 'August 30, 2026',
    category: 'advisory',
    sourceUrl: 'https://www.meity.gov.in',
    safetyLesson: 'Set location permissions to "Only while using app" and audit social media photo geotags before sharing online.',
    relatedFeatureRoute: '/privacy-shield'
  }
];

export const newsService = {
  getArticles(categoryFilter = 'all', searchQuery = ''): SafetyNewsArticle[] {
    let list = [...CURATED_NEWS_ARTICLES];
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
