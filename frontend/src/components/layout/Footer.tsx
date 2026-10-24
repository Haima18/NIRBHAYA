import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-color-default)',
        padding: 'var(--space-6) var(--space-8)',
        marginTop: 'auto',
        fontSize: 'var(--font-size-xs)',
        color: 'var(--text-muted)'
      }}
    >
      <div
        style={{
          maxWidth: 'var(--layout-max-width)',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-4)'
        }}
      >
        <div>
          <strong style={{ color: 'var(--color-brand-primary)' }}>NIRBHAYA</strong> — Complete Women’s Safety, Digital Privacy & Empowerment Platform.
          <p style={{ marginTop: '0.25rem' }}>Tagline: <em>Your safety. Your voice. Your choice.</em></p>
        </div>

        <div style={{ maxWidth: '650px', textAlign: 'right' }}>
          <p>
            NIRBHAYA provides protective technology, evidence logging, and triage guidance. It is not an emergency dispatcher, court, or police authority.
            In life-threatening situations, always dial <strong>112</strong> or visit the nearest police station immediately.
          </p>
        </div>
      </div>
    </footer>
  );
};
