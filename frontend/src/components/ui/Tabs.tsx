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

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange }) => (
  <div className="ui-tabs" role="tablist">
    {tabs.map(tab => {
      const isActive = tab.id === activeTab;
      return (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={isActive}
          onClick={() => onChange(tab.id)}
          className={`ui-tab${isActive ? ' active' : ''}`}
        >
          {tab.icon}
          {tab.label}
          {tab.badge !== undefined && <span className="ui-tab__badge">{tab.badge}</span>}
        </button>
      );
    })}
  </div>
);
