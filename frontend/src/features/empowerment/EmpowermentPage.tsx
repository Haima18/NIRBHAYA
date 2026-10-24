import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  Award,
  Laptop,
  Scale,
  Home,
  ExternalLink,
  PhoneCall
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { resourcesService } from '@/services/api/resourcesService';

export const EmpowermentPage: React.FC = () => {
  const [category, setCategory] = useState('all');
  const items = resourcesService.getEmpowermentItems(category);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--text-primary)' }}>
          Independence & Empowerment Hub
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
          Verified government schemes, financial literacy, career upskilling, and crisis independence resources for women in India.
        </p>
      </div>

      <Alert type="info">
        <strong>Government Resource Integrity:</strong> All programs listed below are official Indian government initiatives with verified portal links. NIRBHAYA never charges fees or invents arbitrary grants.
      </Alert>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: 'All Resources' },
          { id: 'financial_literacy', label: 'Financial Independence & Loans' },
          { id: 'career_skills', label: 'Career Upskilling & Jobs' },
          { id: 'digital_literacy', label: 'Digital Literacy' },
          { id: 'government_schemes', label: 'Shelters & Rehabilitation' },
          { id: 'legal_rights', label: 'Legal Aid Schemes' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem',
              fontWeight: category === cat.id ? 600 : 500,
              backgroundColor: category === cat.id ? 'var(--color-brand-primary)' : 'var(--bg-surface)',
              color: category === cat.id ? '#ffffff' : 'var(--text-secondary)',
              border: '1px solid var(--border-color-default)'
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid of Empowerment Items */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--space-6)' }}>
        {items.map(item => (
          <Card key={item.id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  {item.title}
                </h3>
              </div>

              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0.5rem 0 1rem' }}>
                {item.summary}
              </p>

              <div style={{ marginBottom: '1.25rem' }}>
                <strong style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Key Benefits:
                </strong>
                <ul style={{ margin: '0.35rem 0 0 1.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {item.keyBenefits.map((b, idx) => (
                    <li key={idx}>{b}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color-default)' }}>
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
                Official Government Portal <ExternalLink size={13} />
              </a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
