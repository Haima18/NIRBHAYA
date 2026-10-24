import React, { useState } from 'react';
import { Eye, ShieldCheck, CheckCircle2, Circle, ExternalLink, Filter } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { privacyShieldService } from '@/services/api/privacyShieldService';
import { PrivacyCheckItem } from '@/types';

export const PrivacyShieldPage: React.FC = () => {
  const [items, setItems] = useState<PrivacyCheckItem[]>(() => privacyShieldService.getChecklist());
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { total, completed, percentage } = privacyShieldService.calculateProgress(items);

  const handleToggle = (id: string) => {
    const updated = privacyShieldService.toggleItem(id);
    setItems([...updated]);
  };

  const filteredItems = categoryFilter === 'all'
    ? items
    : items.filter(i => i.category === categoryFilter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--text-primary)' }}>
          Privacy Shield — Personal Defense Center
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
          A step-by-step checklist for reviewing social accounts, app permissions, and private records yourself. NIRBHAYA does not scan or change your accounts.
        </p>
      </div>

      {/* Distinction Alert */}
      <Alert type="info">
        <strong>Self-Assessment Scope Notice:</strong> NIRBHAYA guides your personal hardening through established security practices. It does not perform illegal external hacking scans or promise total erasure from the entire internet.
      </Alert>

      {/* Progress Card */}
      <Card variant="highlight">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--color-brand-primary)', margin: 0 }}>
              Checklist progress: {percentage}%
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
              {completed} of {total} checklist items marked complete. Completion is self-reported, not verified.
            </p>
          </div>
          <Badge variant={percentage === 100 ? 'success' : percentage > 50 ? 'medium' : 'high'}>
            {percentage === 100 ? 'Checklist complete' : `${total - completed} Actions Remaining`}
          </Badge>
        </div>

        <Progress value={percentage} height="10px" />
      </Card>

      {/* Category Filter Pills */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: 'All Safeguards' },
          { id: 'social_media', label: 'Social Media' },
          { id: 'device', label: 'Device & Location' },
          { id: 'accounts', label: 'Accounts & 2FA' },
          { id: 'doxxing', label: 'Doxxing & ID Protection' },
          { id: 'impersonation', label: 'Impersonation & Recovery' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id)}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem',
              fontWeight: categoryFilter === cat.id ? 600 : 500,
              backgroundColor: categoryFilter === cat.id ? 'var(--color-brand-primary)' : 'var(--bg-surface)',
              color: categoryFilter === cat.id ? '#ffffff' : 'var(--text-secondary)',
              border: '1px solid var(--border-color-default)'
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Checklist Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {filteredItems.map(item => (
          <Card
            key={item.id}
            style={{
              display: 'flex',
              gap: 'var(--space-4)',
              alignItems: 'flex-start',
              opacity: item.completed ? 0.85 : 1
            }}
          >
            <button
              onClick={() => handleToggle(item.id)}
              aria-label={item.completed ? 'Mark incomplete' : 'Mark complete'}
              style={{
                marginTop: '4px',
                color: item.completed ? 'var(--color-success)' : 'var(--color-neutral-400)',
                flexShrink: 0
              }}
            >
              {item.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
            </button>

            <div style={{ flexGrow: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', textDecoration: item.completed ? 'line-through' : 'none' }}>
                  {item.title}
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <Badge variant={item.impact === 'high' ? 'critical' : item.impact === 'medium' ? 'medium' : 'low'}>
                    {item.impact} Impact
                  </Badge>
                  {item.officialHelpUrl && (
                    <a
                      href={item.officialHelpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '2px', color: 'var(--color-info)' }}
                    >
                      Official Guide <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.35rem 0 0.75rem' }}>
                {item.description}
              </p>

              <div style={{ backgroundColor: 'var(--bg-app)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color-default)' }}>
                <strong style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Action Steps:
                </strong>
                <ol style={{ margin: '0.25rem 0 0 1.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {item.actionSteps.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ol>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
