import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange }) => {
  return (
    <div
      style={{
        display: 'flex',
        gap: 'var(--space-2)',
        borderBottom: '1px solid var(--border-color-default)',
        overflowX: 'auto',
        paddingBottom: '2px'
      }}
    >
      {tabs.map(tab => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1rem',
              fontSize: 'var(--font-size-sm)',
              fontWeight: isActive ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)',
              color: isActive ? 'var(--color-brand-primary)' : 'var(--text-secondary)',
              borderBottom: isActive ? '2px solid var(--color-brand-primary)' : '2px solid transparent',
              marginBottom: '-2px',
              transition: 'all var(--transition-fast)',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.icon}
            {tab.label}
            {tab.badge !== undefined && (
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: isActive ? 'var(--color-brand-primary-light)' : 'var(--color-neutral-200)',
                  color: isActive ? 'var(--color-brand-primary)' : 'var(--text-muted)'
                }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
