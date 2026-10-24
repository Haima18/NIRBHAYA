import React, { useState } from 'react';
import {
  ExternalLink,
  PhoneCall
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { resourcesService } from '@/services/api/resourcesService';

export const EmpowermentPage: React.FC = () => {
  const [category, setCategory] = useState('all');
  const items = resourcesService.getEmpowermentItems(category);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--text-primary)' }}>
          Independence & Empowerment Resources
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
          Links to official Indian government scheme information on financial inclusion, skills, digital safety, shelter,
          and legal aid. NIRBHAYA does not administer these schemes.
        </p>
      </div>

      <Alert type="info" title="Verify details with the official portal">
        Scheme rules, eligibility, fees, and availability change. The summaries here are general and may be incomplete.
        NIRBHAYA does not approve applications, charge fees, or guarantee a benefit. Confirm everything with the linked
        government portal or your local office before acting.
      </Alert>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: 'All resources' },
          { id: 'financial_literacy', label: 'Financial inclusion & loans' },
          { id: 'career_skills', label: 'Career & skills' },
          { id: 'digital_literacy', label: 'Digital literacy' },
          { id: 'government_schemes', label: 'Shelter & rehabilitation' },
          { id: 'legal_rights', label: 'Legal aid schemes' }
        ].map(cat => (
          <button
            key={cat.id}
            type="button"
            aria-pressed={category === cat.id}
            onClick={() => setCategory(cat.id)}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem',
              fontWeight: category === cat.id ? 600 : 500,
              backgroundColor: category === cat.id ? 'var(--color-brand-primary)' : 'var(--bg-surface)',
              color: category === cat.id ? '#ffffff' : 'var(--text-secondary)',
              border: '1px solid var(--border-color-default)',
              cursor: 'pointer'
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid of resources */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
        {items.map(item => (
          <Card key={item.id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>
                {item.title}
              </h3>

              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0.5rem 0 1rem' }}>
                {item.summary}
              </p>

              <div style={{ marginBottom: '1.25rem' }}>
                <strong style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  What the official scheme generally covers
                </strong>
                <ul style={{ margin: '0.35rem 0 0 1.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {item.keyBenefits.map((b, idx) => (
                    <li key={idx}>{b}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color-default)', flexWrap: 'wrap' }}>
              {item.contactHelpline ? (
                <a
                  href={`tel:${item.contactHelpline}`}
                  style={{ fontSize: '0.8rem', color: 'var(--color-brand-primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                >
                  <PhoneCall size={13} /> Dial {item.contactHelpline}
                </a>
              ) : (
                <span />
              )}

              <a
                href={item.officialPortal}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '0.8rem', color: 'var(--color-info)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}
              >
                Official portal <ExternalLink size={13} />
              </a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
