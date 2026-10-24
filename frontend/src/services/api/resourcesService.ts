/**
 * Resources Service
 * Official helpline references plus clearly labelled sample records for legal
 * aid, HerCircle, and empowerment. Nothing here is a live verified directory;
 * numbers, hours, and scheme rules can change and must be confirmed with the
 * official source.
 */
import {
  EmergencyContact,
  LawyerProfile,
  SupporterProfile,
  EmpowermentResource
} from '@/types';

export const EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: 'em_112',
    title: 'National Emergency Helpline (ERSS)',
    number: '112',
    category: 'police',
    description: 'All-in-one national emergency number connecting Police, Fire, and Ambulance services across India.',
    operationalHours: '24/7 (Toll-Free)',
    website: 'https://112.gov.in'
  },
  {
    id: 'em_1091',
    title: 'Women Helpline (1091)',
    number: '1091',
    category: 'women',
    description: 'State-level women\'s police helpline available in many states. Services and hours vary by state; verify locally.',
    operationalHours: 'Varies by state',
    website: 'https://wcd.nic.in'
  },
  {
    id: 'em_181',
    title: 'Women Helpline / One Stop Centre (181)',
    number: '181',
    category: 'domestic',
    description: 'National women\'s helpline for domestic violence, family disputes, shelter referrals, and counselling. Services vary by state.',
    operationalHours: '24/7 in many states — confirm locally',
    website: 'https://wcd.nic.in'
  },
  {
    id: 'em_1930',
    title: 'National Cyber Crime Reporting Helpline',
    number: '1930',
    category: 'cyber',
    description: 'Immediate reporting of online financial fraud, cyberstalking, non-consensual media, and identity theft.',
    operationalHours: '24/7 (Toll-Free)',
    website: 'https://cybercrime.gov.in'
  },
  {
    id: 'em_15100',
    title: 'NALSA National Free Legal Aid Helpline',
    number: '15100',
    category: 'legal',
    description: 'Toll-free free legal aid and advice under the Legal Services Authorities Act. Women are eligible under Section 12. For Delhi-specific legal aid, 1516 is also available.',
    operationalHours: '24/7 (NALSA national helpline)',
    website: 'https://nalsa.gov.in'
  },
  {
    id: 'em_ncw',
    title: 'National Commission for Women (NCW)',
    number: '7827170170',
    category: 'women',
    description: 'Helpline for reporting gender discrimination, workplace harassment, and domestic atrocities. Confirm current hours on the NCW site.',
    operationalHours: 'Confirm current hours with NCW',
    website: 'https://ncw.nic.in'
  },
  {
    id: 'em_kiran',
    title: 'KIRAN Mental Health Support (MoSJE)',
    number: '1800-599-0019',
    category: 'counselling',
    description: 'Government toll-free helpline providing psychological support, trauma counseling, and crisis distress care.',
    operationalHours: '24/7 (Toll-Free)',
    website: 'https://socialjustice.gov.in'
  }
];

/**
 * These are UI demonstration records, not real practitioners. No lawyer or
 * listener has been verified or onboarded by NIRBHAYA. The page labels them and
 * directs users to official legal-aid and government support routes.
 */
export const LAWYER_PROFILES: LawyerProfile[] = [
  {
    id: 'lawyer_sample_1',
    name: 'Sample advocate profile A',
    barCouncilNumber: 'Not a real registration — sample layout only',
    city: 'New Delhi',
    state: 'Delhi',
    languages: ['English', 'Hindi'],
    practiceAreas: ['Cybercrime', 'Online Harassment', 'Non-Consensual Imagery'],
    feeType: 'sliding_scale',
    experienceYears: 0,
    consultationModes: ['Sample only'],
    bio: 'Illustrative profile layout. This is not a real lawyer, a verified partner, or a booking channel. Use NALSA 15100 or your State Legal Services Authority to find a licensed advocate.',
    isVerifiedSample: false
  },
  {
    id: 'lawyer_sample_2',
    name: 'Sample advocate profile B',
    barCouncilNumber: 'Not a real registration — sample layout only',
    city: 'Mumbai',
    state: 'Maharashtra',
    languages: ['English', 'Hindi', 'Marathi'],
    practiceAreas: ['Domestic Violence', 'Family Law', 'Protection Orders'],
    feeType: 'pro_bono',
    experienceYears: 0,
    consultationModes: ['Sample only'],
    bio: 'Illustrative profile layout only. NIRBHAYA cannot confirm fees, availability, or credentials. Contact the District Legal Services Authority or call 15100 for free legal aid.',
    isVerifiedSample: false
  },
  {
    id: 'lawyer_sample_3',
    name: 'Sample advocate profile C',
    barCouncilNumber: 'Not a real registration — sample layout only',
    city: 'Bengaluru',
    state: 'Karnataka',
    languages: ['English', 'Kannada'],
    practiceAreas: ['Cybercrime', 'Doxxing', 'Workplace Harassment'],
    feeType: 'standard',
    experienceYears: 0,
    consultationModes: ['Sample only'],
    bio: 'Illustrative profile layout only. For a licensed advocate, use the official Karnataka State Legal Services Authority directory or the National Legal Services Authority portal.',
    isVerifiedSample: false
  }
];

export const HERCIRCLE_SUPPORTERS: SupporterProfile[] = [
  {
    id: 'supporter_sample_1',
    name: 'Sample listener profile A',
    title: 'Illustrative counselor layout',
    verifiedOrganization: 'Not a real organization — demonstration only',
    languages: ['English', 'Hindi'],
    experienceYears: 0,
    specializations: ['Domestic abuse', 'Safety planning'],
    bio: 'This card demonstrates how a future verified listener directory could look. No counselor is contacted and no live peer-support network is connected.',
    isVerifiedSample: false
  },
  {
    id: 'supporter_sample_2',
    name: 'Sample listener profile B',
    title: 'Illustrative digital-safety advocate layout',
    verifiedOrganization: 'Not a real organization — demonstration only',
    languages: ['English', 'Bengali', 'Hindi'],
    experienceYears: 0,
    specializations: ['Cyberstalking', 'Account recovery'],
    bio: 'Illustrative only. For real emotional support, call the government KIRAN helpline at 1800-599-0019 or the Women Helpline at 181.',
    isVerifiedSample: false
  }
];

export const EMPOWERMENT_RESOURCES: EmpowermentResource[] = [
  {
    id: 'emp_1',
    title: 'Pradhan Mantri MUDRA Yojana (Micro-Enterprise Loans)',
    category: 'financial_literacy',
    summary: 'Government-backed micro-credit scheme for eligible small businesses. It is not women-only; women entrepreneurs can apply through participating banks and approved lenders.',
    officialPortal: 'https://www.mudra.org.in',
    keyBenefits: ['Loan categories for different business sizes', 'Collateral requirements depend on the lender and scheme', 'Apply through official banks or approved financial institutions'],
    contactHelpline: '1800-180-1111'
  },
  {
    id: 'emp_2',
    title: 'Digital Literacy and Cyber-Safety Learning',
    category: 'digital_literacy',
    summary: 'Use official government and CERT-In guidance to learn secure passwords, two-factor authentication, phishing detection, and safe use of citizen portals. Program availability varies by state.',
    officialPortal: 'https://www.meity.gov.in',
    keyBenefits: ['Learn secure passwords and app-based 2FA', 'Recognise phishing and online scams', 'Find official digital-government portals'],
  },
  {
    id: 'emp_3',
    title: 'SWADHAR Greh — Comprehensive Shelter & Rehabilitation Scheme',
    category: 'government_schemes',
    summary: 'Central government residential support scheme providing shelter, food, clothing, medical assistance, and vocational training for women in difficult circumstances or distress.',
    officialPortal: 'https://wcd.nic.in/schemes/swadhar-greh-scheme-women-difficult-circumstances',
    keyBenefits: ['Safe temporary housing', 'Free legal aid and counseling on premise', 'Vocational training for self-reliance'],
    contactHelpline: '181'
  },
  {
    id: 'emp_4',
    title: 'Step Scheme — Support to Training & Employment Programme for Women',
    category: 'career_skills',
    summary: 'Skill development and upskilling programme aimed at improving employability for women in traditional and modern sectors including IT, agriculture, and handicrafts.',
    officialPortal: 'https://wcd.nic.in/schemes/support-training-and-employment-programme-women-step',
    keyBenefits: ['Subsidised skill training where available', 'Certification as provided under the scheme', 'Employment-linkage support where available']
  },
  {
    id: 'emp_5',
    title: 'NALSA Scheme for Legal Services to Victims of Domestic Violence',
    category: 'legal_rights',
    summary: 'Free legal services for eligible victims of domestic violence, including representation and help with protection, residence, and monetary-relief applications. Eligibility is decided by the legal services authority.',
    officialPortal: 'https://nalsa.gov.in',
    keyBenefits: ['Free legal representation for eligible applicants', 'Court-fee and procedural support as applicable', 'Access to paralegal volunteers where available'],
    contactHelpline: '15100'
  }
];

export const resourcesService = {
  getHelplines(category = 'all'): EmergencyContact[] {
    if (category === 'all') return EMERGENCY_CONTACTS;
    return EMERGENCY_CONTACTS.filter(c => c.category === category);
  },

  getLawyers(cityFilter = 'all', practiceAreaFilter = 'all'): LawyerProfile[] {
    let list = [...LAWYER_PROFILES];
    if (cityFilter !== 'all') {
      list = list.filter(l => l.city.toLowerCase() === cityFilter.toLowerCase());
    }
    if (practiceAreaFilter !== 'all') {
      list = list.filter(l => l.practiceAreas.some(pa => pa.toLowerCase().includes(practiceAreaFilter.toLowerCase())));
    }
    return list;
  },

  getSupporters(): SupporterProfile[] {
    return HERCIRCLE_SUPPORTERS;
  },

  getEmpowermentItems(category = 'all'): EmpowermentResource[] {
    if (category === 'all') return EMPOWERMENT_RESOURCES;
    return EMPOWERMENT_RESOURCES.filter(e => e.category === category);
  }
};
