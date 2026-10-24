/**
 * Resources Service
 * Verified directory data for legal aid, emergency helplines, HerCircle, and empowerment.
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
    title: 'Women Helpline (Police Response)',
    number: '1091',
    category: 'women',
    description: 'Dedicated women safety police control desk for immediate on-ground intervention and distress dispatch.',
    operationalHours: '24/7 (Toll-Free)',
    website: 'https://wcd.nic.in'
  },
  {
    id: 'em_181',
    title: 'Women in Distress (One Stop Centre)',
    number: '181',
    category: 'domestic',
    description: 'Confidential crisis support for domestic violence, family disputes, shelter referrals, and counseling.',
    operationalHours: '24/7 (Toll-Free)',
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
    id: 'em_1516',
    title: 'NALSA Free Legal Aid Helpline',
    number: '1516',
    category: 'legal',
    description: 'Free legal services and legal advice for women under Section 12 of the Legal Services Authorities Act.',
    operationalHours: '9:30 AM – 6:00 PM (Working days)',
    website: 'https://nalsa.gov.in'
  },
  {
    id: 'em_ncw',
    title: 'National Commission for Women (NCW)',
    number: '7827170170',
    category: 'women',
    description: '24/7 helpline for reporting gender discrimination, workplace harassment, and domestic atrocities.',
    operationalHours: '24/7 (Helpline)',
    website: 'http://ncw.nic.in'
  },
  {
    id: 'em_kiran',
    title: 'KIRAN Mental Health Support (MoSJE)',
    number: '1800-599-0019',
    category: 'counselling',
    description: 'Government toll-free helpline providing psychological support, trauma counseling, and crisis distress care.',
    operationalHours: '24/7 (Toll-Free)',
    website: 'https://disabilityaffairs.gov.in'
  }
];

export const LAWYER_PROFILES: LawyerProfile[] = [
  {
    id: 'lawyer_1',
    name: 'Adv. Meenakshi Sundaram',
    barCouncilNumber: 'D/1482/2012 (Bar Council of Delhi)',
    city: 'New Delhi',
    state: 'Delhi',
    languages: ['English', 'Hindi'],
    practiceAreas: ['Cybercrime', 'Online Harassment', 'Non-Consensual Imagery', 'Privacy Violations'],
    feeType: 'sliding_scale',
    experienceYears: 14,
    consultationModes: ['In-Person', 'Secure Video Call'],
    bio: 'Specialized in cyber law, IT Act offences, digital evidence preservation, and injunctions against online blackmail.',
    isVerifiedSample: true
  },
  {
    id: 'lawyer_2',
    name: 'Adv. Rashmi Kulkarni',
    barCouncilNumber: 'MAH/3901/2015 (Bar Council of Maharashtra)',
    city: 'Mumbai',
    state: 'Maharashtra',
    languages: ['English', 'Hindi', 'Marathi'],
    practiceAreas: ['Domestic Violence', 'Family Law', 'Restraining Orders', 'Custody'],
    feeType: 'pro_bono',
    experienceYears: 11,
    consultationModes: ['In-Person', 'Phone Call'],
    bio: 'Empanelled legal aid advocate for survivors of domestic violence under the PWDV Act. Dedicated to women seeking immediate protection.',
    isVerifiedSample: true
  },
  {
    id: 'lawyer_3',
    name: 'Adv. Anindita Sen',
    barCouncilNumber: 'WB/894/2010 (Bar Council of West Bengal)',
    city: 'Kolkata',
    state: 'West Bengal',
    languages: ['English', 'Bengali', 'Hindi'],
    practiceAreas: ['Workplace Sexual Harassment (POSH)', 'Criminal Law', 'Stalking'],
    feeType: 'standard',
    experienceYears: 16,
    consultationModes: ['In-Person', 'Secure Video Call'],
    bio: 'Former member of State POSH consultative committee. Guides working professionals and students facing coercion or retaliation.',
    isVerifiedSample: true
  },
  {
    id: 'lawyer_4',
    name: 'Adv. Kavitha Nair',
    barCouncilNumber: 'KAR/2115/2018 (Bar Council of Karnataka)',
    city: 'Bengaluru',
    state: 'Karnataka',
    languages: ['English', 'Kannada', 'Malayalam', 'Hindi'],
    practiceAreas: ['Cybercrime', 'Doxxing', 'Data Protection', 'Family Law'],
    feeType: 'sliding_scale',
    experienceYears: 8,
    consultationModes: ['Secure Video Call', 'Phone Call'],
    bio: 'Focuses on digital rights, combating online impersonation, and assisting women tech professionals in cyberstalking matters.',
    isVerifiedSample: true
  }
];

export const HERCIRCLE_SUPPORTERS: SupporterProfile[] = [
  {
    id: 'supporter_1',
    name: 'Dr. Radhika Menon',
    title: 'Trauma-Informed Counselor & Crisis Advocate',
    verifiedOrganization: 'Aasra Crisis Care Alliance',
    languages: ['English', 'Hindi', 'Malayalam'],
    experienceYears: 12,
    specializations: ['Domestic Abuse Recovery', 'Anxiety & Panic Management', 'Safe-Place Planning'],
    bio: 'Provides a non-judgmental listening ear, emotional stabilization, and step-by-step guidance for women navigating abusive environments.',
    isVerifiedSample: true
  },
  {
    id: 'supporter_2',
    name: 'Pooja Bhattacharya',
    title: 'Digital Safety Advocate & Survivor Mentor',
    verifiedOrganization: 'Internet Freedom & Women Network',
    languages: ['English', 'Bengali', 'Hindi'],
    experienceYears: 7,
    specializations: ['Cyberstalking Trauma', 'Account Recovery', 'Disengagement Strategy'],
    bio: 'Passionate about helping women reclaim their confidence and digital space after experiences of online stalking or non-consensual media sharing.',
    isVerifiedSample: true
  },
  {
    id: 'supporter_3',
    name: 'Amina Sheikh',
    title: 'Social Worker & Community Mediator',
    verifiedOrganization: 'Sakhi Women Resource Circle',
    languages: ['English', 'Hindi', 'Urdu'],
    experienceYears: 9,
    specializations: ['Financial Independence', 'Family Coercion', 'Emergency Shelter Navigation'],
    bio: 'Assists women in creating emergency document binders, finding safe temporary housing, and accessing government benefit programs.',
    isVerifiedSample: true
  }
];

export const EMPOWERMENT_RESOURCES: EmpowermentResource[] = [
  {
    id: 'emp_1',
    title: 'PM Mudra Yojana — Women Enterprise Scheme (Tarun/Kishore)',
    category: 'financial_literacy',
    summary: 'Government-backed micro-credit scheme providing collateral-free loans up to ₹10 Lakhs for women launching small enterprises, catering, crafts, or digital ventures.',
    officialPortal: 'https://www.mudra.org.in',
    keyBenefits: ['No collateral requirement', 'Low interest concessions for women entrepreneurs', 'Digital processing through banks'],
    contactHelpline: '1800-180-1111'
  },
  {
    id: 'emp_2',
    title: 'Digital Saksharta Abhiyan (DISHA) — Digital Literacy for Women',
    category: 'digital_literacy',
    summary: 'Free foundational digital literacy modules teaching internet banking security, cyber defense, smartphone utilization, and government services.',
    officialPortal: 'https://www.meity.gov.in',
    keyBenefits: ['Learn secure passwords & 2FA', 'Detect phishing & online scams', 'Access DigiLocker and citizen portals']
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
    keyBenefits: ['Subsidized skill training', 'Certification recognized nationwide', 'Employment matching networks']
  },
  {
    id: 'emp_5',
    title: 'NALSA Scheme for Legal Services to Victims of Domestic Violence',
    category: 'legal_rights',
    summary: 'Free legal representation in court, drafting of interim protection applications, residence orders, and monetary relief petitions regardless of income bracket.',
    officialPortal: 'https://nalsa.gov.in',
    keyBenefits: ['Completely free court representation', 'Court fee exemption for women', 'Access to paralegal volunteers'],
    contactHelpline: '1516'
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
