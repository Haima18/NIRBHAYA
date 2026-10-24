import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPinned,
  ShieldAlert,
  ShieldCheck,
  Eye,
  FileSearch,
  Compass,
  Users,
  Scale,
  FolderLock,
  Bot,
  Newspaper,
  Sparkles,
  PhoneCall,
  Settings,
  UserRound
} from 'lucide-react';
import { useTranslation } from '@/localization/useTranslation';
import { TranslationKey } from '@/localization/translations';

interface NavItem {
  path: string;
  labelKey: TranslationKey;
  icon: React.ReactNode;
  end?: boolean;
}

interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    id: 'home',
    label: 'Your space',
    items: [
      { path: '/', labelKey: 'navDashboard', icon: <LayoutDashboard size={17} />, end: true },
      { path: '/map', labelKey: 'navMap', icon: <MapPinned size={17} /> },
      { path: '/profile', labelKey: 'navProfile', icon: <UserRound size={17} /> }
    ]
  },
  {
    id: 'protect',
    label: 'Protect',
    items: [
      { path: '/physical-safety', labelKey: 'navPhysicalSafety', icon: <ShieldAlert size={17} /> },
      { path: '/digital-guardian', labelKey: 'navDigitalGuardian', icon: <ShieldCheck size={17} /> },
      { path: '/privacy-shield', labelKey: 'navPrivacyShield', icon: <Eye size={17} /> },
      { path: '/deepfake-detective', labelKey: 'navDeepfake', icon: <FileSearch size={17} /> }
    ]
  },
  {
    id: 'navigate',
    label: 'Navigate',
    items: [
      { path: '/pathway', labelKey: 'navPathway', icon: <Compass size={17} /> },
      { path: '/hercircle', labelKey: 'navCircle', icon: <Users size={17} /> },
      { path: '/legal-support', labelKey: 'navLegal', icon: <Scale size={17} /> },
      { path: '/evidence-vault', labelKey: 'navVault', icon: <FolderLock size={17} /> }
    ]
  },
  {
    id: 'grow',
    label: 'Grow',
    items: [
      { path: '/ai-assistant', labelKey: 'navAssistant', icon: <Bot size={17} /> },
      { path: '/safety-news', labelKey: 'navNews', icon: <Newspaper size={17} /> },
      { path: '/empowerment', labelKey: 'navEmpowerment', icon: <Sparkles size={17} /> },
      { path: '/emergency-directory', labelKey: 'navEmergency', icon: <PhoneCall size={17} /> }
    ]
  },
  {
    id: 'account',
    label: 'Account',
    items: [{ path: '/settings', labelKey: 'navSettings', icon: <Settings size={17} /> }]
  }
];

export const Sidebar: React.FC = () => {
  const { t } = useTranslation();

  return (
    <aside className="app-sidebar" aria-label="NIRBHAYA feature navigation">
      {NAV_GROUPS.map(group => (
        <div className="app-sidebar__group" key={group.id}>
          <p className="app-sidebar__label">{group.label}</p>
          <nav className="app-sidebar__nav">
            {group.items.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) => `app-nav-link${isActive ? ' active' : ''}`}
              >
                <span className="app-nav-link__inner">
                  <span aria-hidden="true" style={{ display: 'inline-flex' }}>{item.icon}</span>
                  <span>{t(item.labelKey)}</span>
                </span>
              </NavLink>
            ))}
          </nav>
        </div>
      ))}

      <div className="app-sidebar__emergency">
        <p>{t('immediateHelp')}</p>
        <p>
          {t('nationalEmergency')}: <strong><a href="tel:112">112</a></strong>
          <br />
          {t('cyberHelp')}: <strong>1930</strong>
          <br />
          {t('womenDistress')}: <strong>181</strong>
        </p>
        <p style={{ marginTop: '0.45rem', fontSize: '0.64rem' }}>
          NIRBHAYA cannot dispatch these services for you.
        </p>
      </div>
    </aside>
  );
};
