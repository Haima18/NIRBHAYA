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
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/', labelKey: 'navDashboard', icon: <LayoutDashboard size={18} /> },
  { path: '/map', labelKey: 'navMap', icon: <MapPinned size={18} /> },
  { path: '/profile', labelKey: 'navProfile', icon: <UserRound size={18} /> },
  { path: '/physical-safety', labelKey: 'navPhysicalSafety', icon: <ShieldAlert size={18} /> },
  { path: '/digital-guardian', labelKey: 'navDigitalGuardian', icon: <ShieldCheck size={18} /> },
  { path: '/privacy-shield', labelKey: 'navPrivacyShield', icon: <Eye size={18} /> },
  { path: '/deepfake-detective', labelKey: 'navDeepfake', icon: <FileSearch size={18} /> },
  { path: '/pathway', labelKey: 'navPathway', icon: <Compass size={18} /> },
  { path: '/hercircle', labelKey: 'navCircle', icon: <Users size={18} /> },
  { path: '/legal-support', labelKey: 'navLegal', icon: <Scale size={18} /> },
  { path: '/evidence-vault', labelKey: 'navVault', icon: <FolderLock size={18} /> },
  { path: '/ai-assistant', labelKey: 'navAssistant', icon: <Bot size={18} /> },
  { path: '/safety-news', labelKey: 'navNews', icon: <Newspaper size={18} /> },
  { path: '/empowerment', labelKey: 'navEmpowerment', icon: <Sparkles size={18} /> },
  { path: '/emergency-directory', labelKey: 'navEmergency', icon: <PhoneCall size={18} /> },
  { path: '/settings', labelKey: 'navSettings', icon: <Settings size={18} /> }
];

export const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  return (
    <aside
      style={{
        width: 'var(--layout-sidebar-width)',
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-color-default)',
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - var(--layout-header-height) - var(--layout-quick-exit-height))',
        position: 'sticky',
        top: 'calc(var(--layout-header-height) + var(--layout-quick-exit-height))',
        overflowY: 'auto',
        padding: 'var(--space-4) var(--space-3)'
      }}
    >
      <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', padding: '0.5rem 0.75rem 0.25rem' }}>
        {t('navGroupTitle')}
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.6rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: isActive ? 600 : 500,
              color: isActive ? 'var(--color-brand-primary)' : 'var(--text-secondary)',
              backgroundColor: isActive ? 'var(--color-brand-primary-subtle)' : 'transparent',
              textDecoration: 'none',
              transition: 'all var(--transition-fast)'
            })}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {item.icon}
              <span>{t(item.labelKey)}</span>
            </div>
            {item.badge && (
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-brand-primary-light)',
                  color: 'var(--color-brand-primary)'
                }}
              >
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Quick Emergency Reminder at Bottom of Sidebar */}
      <div
        style={{
          marginTop: 'auto',
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-danger-subtle)',
          border: '1px solid var(--color-danger-border)',
          fontSize: '0.75rem',
          color: 'var(--color-danger-hover)'
        }}
      >
        <p style={{ fontWeight: 700, marginBottom: '0.25rem' }}>🚨 {t('immediateHelp')}:</p>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{t('nationalEmergency')}: <strong>112</strong></p>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{t('cyberHelp')}: <strong>1930</strong></p>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{t('womenDistress')}: <strong>181</strong></p>
      </div>
    </aside>
  );
};
