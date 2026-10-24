import React, { useState } from 'react';
import {
  PhoneCall,
  ExternalLink,
  Clock,
  Search
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { resourcesService } from '@/services/api/resourcesService';

export const EmergencyDirectoryPage: React.FC = () => {
  const [filterCategory, setFilterCategory] = useState('all');
  const [search, setSearch] = useState('');

  const allHelplines = resourcesService.getHelplines(filterCategory);

  const filtered = allHelplines.filter(h =>
    h.title.toLowerCase().includes(search.toLowerCase()) ||
    h.number.includes(search) ||
    h.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--text-primary)' }}>
          Emergency & Official Helpline Directory
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
          Official national emergency numbers, women’s helplines, and cybercrime reporting portals in India. Numbers and
          hours can change; verify with the official source before relying on them.
        </p>
      </div>

      <Alert type="warning" title="Static reference list">
        This is a hand-maintained list, not a live verified directory. Some numbers operate only in certain states or
        during certain hours. Confirm the current number and service with the official portal.
      </Alert>

      <Alert type="info">
        <strong>Direct Dialing Notice:</strong> Clicking &ldquo;Call Helpline&rdquo; immediately triggers your device dialer. In urgent life-threatening danger, dial <strong>112</strong> immediately.
      </Alert>

      {/* Filter and Search */}
      <Card style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 2, minWidth: '220px' }}>
          <Input
            placeholder="Search by helpline name, number, or keyword..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div style={{ flex: 1, minWidth: '180px' }}>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color-default)' }}
          >
            <option value="all">All Helplines</option>
            <option value="police">National Emergency (112)</option>
            <option value="women">Women Distress & Police</option>
            <option value="cyber">Cyber Crime (1930)</option>
            <option value="domestic">Domestic Abuse (181)</option>
            <option value="legal">Free Legal Aid (1516)</option>
            <option value="counselling">Mental Health & Crisis</option>
          </select>
        </div>
      </Card>

      {/* Helpline Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--space-6)' }}>
        {filtered.map(contact => (
          <Card key={contact.id} variant={contact.category === 'police' ? 'danger' : 'default'}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  {contact.title}
                </h3>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-brand-primary)', margin: '4px 0' }}>
                  {contact.number}
                </div>
              </div>
              <Badge variant={contact.category === 'police' ? 'critical' : 'success'}>
                {contact.category.toUpperCase()}
              </Badge>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '0.75rem' }}>
              {contact.description}
            </p>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '1.25rem' }}>
              <Clock size={14} /> Operational Hours: <strong>{contact.operationalHours}</strong>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <a
                href={`tel:${contact.number}`}
                style={{ flex: 1, textDecoration: 'none' }}
              >
                <Button
                  variant={contact.category === 'police' ? 'emergency' : 'primary'}
                  size="md"
                  style={{ width: '100%' }}
                  leftIcon={<PhoneCall size={18} />}
                >
                  Call {contact.number}
                </Button>
              </a>

              <a
                href={contact.website}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '0.625rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color-default)',
                  color: 'var(--color-info)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  textDecoration: 'none'
                }}
              >
                Official Portal <ExternalLink size={13} />
              </a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
