import React, { useState } from 'react';
import { Eye, ShieldCheck, CheckCircle2, Circle, ExternalLink, Filter, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { BrowserPermissionAuditItem, checkBrowserPermissions, privacyShieldService } from '@/services/api/privacyShieldService';
import { PrivacyCheckItem } from '@/types';
import { useAuth } from '@/hooks/useAuth';

export const PrivacyShieldPage: React.FC = () => {
  const [items, setItems] = useState<PrivacyCheckItem[]>(() => privacyShieldService.getChecklist());
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [permissionAudit, setPermissionAudit] = useState<BrowserPermissionAuditItem[] | null>(null);
  const [auditBusy, setAuditBusy] = useState(false);
  const { user } = useAuth();

  const { total, completed, percentage } = privacyShieldService.calculateProgress(items);

  const handleToggle = (id: string) => {
    const updated = privacyShieldService.toggleItem(id);
    setItems([...updated]);
  };

  const runPermissionAudit = async () => {
    setAuditBusy(true);
    try {
      setPermissionAudit(await checkBrowserPermissions());
    } finally {
      setAuditBusy(false);
    }
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

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Browser privacy check</h2>
            <p style={{ margin: '0.35rem 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Reads permission states exposed by this browser. It does not request access, change settings, or inspect your other accounts.
            </p>
          </div>
          <Button variant="outline" onClick={() => void runPermissionAudit()} isLoading={auditBusy} leftIcon={<RefreshCw size={16} />}>
            {auditBusy ? 'Checking…' : permissionAudit ? 'Check again' : 'Check browser permissions'}
          </Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.75rem', marginTop: '1rem' }}>
          <div style={{ borderTop: '1px solid var(--border-color-default)', paddingTop: '0.65rem' }}>
            <strong style={{ fontSize: '0.85rem' }}>NIRBHAYA location consent</strong>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              {user?.locationConsent ? 'Enabled in your account preferences.' : 'Disabled in your account preferences.'}
            </p>
          </div>
          <div style={{ borderTop: '1px solid var(--border-color-default)', paddingTop: '0.65rem' }}>
            <strong style={{ fontSize: '0.85rem' }}>External AI consent</strong>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              {user?.aiProcessingConsent ? 'Enabled in your account preferences.' : 'Disabled in your account preferences.'}
            </p>
          </div>
        </div>

        {permissionAudit && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.75rem', marginTop: '1rem' }}>
            {permissionAudit.map(permission => (
              <div key={permission.id} style={{ borderTop: '1px solid var(--border-color-default)', paddingTop: '0.65rem' }}>
                <strong style={{ fontSize: '0.85rem' }}>{permission.label}: {permission.state}</strong>
                <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{permission.detail}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

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
              backgroundColor: categoryFilter === cat.id ? 'var(--color-brand-solid)' : 'var(--bg-surface)',
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
