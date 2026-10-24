import React, { useState } from 'react';
import {
  Scale,
  Search,
  Filter,
  CheckCircle,
  HelpCircle,
  Phone,
  Video,
  FileText,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { Tabs } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { resourcesService } from '@/services/api/resourcesService';
import { LawyerProfile } from '@/types';

export const LegalSupportPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('directory');
  const [cityFilter, setCityFilter] = useState('all');
  const [areaFilter, setAreaFilter] = useState('all');
  const [selectedLawyer, setSelectedLawyer] = useState<LawyerProfile | null>(null);
  const [consultationBooked, setConsultationBooked] = useState(false);

  const lawyers = resourcesService.getLawyers(cityFilter, areaFilter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--text-primary)' }}>
          Women’s Legal Support & Advocates Directory
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
          Searchable directory of female cyber and domestic rights lawyers, free NALSA legal aid, and consultation preparation tools.
        </p>
      </div>

      <Alert type="info">
        <strong>Information Disclaimer:</strong> NIRBHAYA connects you with empanelled advocates and free NALSA aid. The directory provides general legal information and does not substitute for an attorney-client relationship.
      </Alert>

      <Tabs
        tabs={[
          { id: 'directory', label: 'Advocate Directory', icon: <Scale size={16} /> },
          { id: 'guides', label: 'Legal Rights & Zero FIR Guides', icon: <FileText size={16} /> },
          { id: 'prep', label: 'Consultation Preparation Checklist', icon: <HelpCircle size={16} /> }
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* TAB 1: ADVOCATE DIRECTORY */}
      {activeTab === 'directory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Filters Bar */}
          <Card style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                Filter by City:
              </label>
              <select
                value={cityFilter}
                onChange={e => setCityFilter(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color-default)' }}
              >
                <option value="all">All Cities (India)</option>
                <option value="New Delhi">New Delhi</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Kolkata">Kolkata</option>
              </select>
            </div>

            <div style={{ flex: 1, minWidth: '220px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                Practice Area:
              </label>
              <select
                value={areaFilter}
                onChange={e => setAreaFilter(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color-default)' }}
              >
                <option value="all">All Practice Areas</option>
                <option value="Cybercrime">Cybercrime & IT Act</option>
                <option value="Domestic Violence">Domestic Violence (PWDVA)</option>
                <option value="Harassment">Online Harassment</option>
                <option value="Non-Consensual Imagery">Non-Consensual Imagery (NCII)</option>
              </select>
            </div>

            <div style={{ alignSelf: 'flex-end' }}>
              <Button
                variant="outline"
                size="md"
                onClick={() => { setCityFilter('all'); setAreaFilter('all'); }}
              >
                Reset Filters
              </Button>
            </div>
          </Card>

          {/* Lawyer Profile Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--space-6)' }}>
            {lawyers.map(lawyer => (
              <Card key={lawyer.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                      {lawyer.name}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                      {lawyer.city}, {lawyer.state} • {lawyer.experienceYears} Years Bar Experience
                    </p>
                  </div>
                  <Badge variant={lawyer.feeType === 'pro_bono' ? 'success' : 'info'}>
                    {lawyer.feeType.replace('_', ' ')}
                  </Badge>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: '0.5rem 0' }}>
                  {lawyer.bio}
                </p>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  <div><strong>Bar Council Reg:</strong> {lawyer.barCouncilNumber}</div>
                  <div><strong>Languages:</strong> {lawyer.languages.join(', ')}</div>
                </div>

                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  {lawyer.practiceAreas.map((pa, idx) => (
                    <span key={idx} style={{ fontSize: '0.7rem', padding: '2px 6px', backgroundColor: 'var(--color-brand-primary-light)', color: 'var(--color-brand-primary)', borderRadius: '4px', fontWeight: 500 }}>
                      {pa}
                    </span>
                  ))}
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  style={{ width: '100%' }}
                  onClick={() => { setSelectedLawyer(lawyer); setConsultationBooked(false); }}
                >
                  Request Consultation
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: LEGAL GUIDES */}
      {activeTab === 'guides' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--space-6)' }}>
          <Card>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--color-brand-primary)', marginBottom: '0.5rem' }}>
              Zero FIR Rights in India
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              A <strong>Zero FIR</strong> can be filed at <em>any police station</em> across India, irrespective of where the crime occurred.
            </p>
            <ul style={{ margin: '0.5rem 0 0 1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <li>The police station cannot decline registration citing jurisdiction.</li>
              <li>Once registered, the station transfers the case to the appropriate jurisdiction police station.</li>
              <li>Under Section 166A IPC / BNS, police officers refusing to register FIR for offences against women face criminal penalty.</li>
            </ul>
          </Card>

          <Card>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--color-brand-primary)', marginBottom: '0.5rem' }}>
              Free Legal Aid (NALSA Section 12)
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Under <strong>Section 12 of the Legal Services Authorities Act, 1987</strong>, EVERY woman in India is entitled to completely free legal representation in court, regardless of income.
            </p>
            <ul style={{ margin: '0.5rem 0 0 1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <li>Covers fees of advocate, court fees, typing charges, and appeal costs.</li>
              <li>Call toll-free helpline <strong>1516</strong> or visit <a href="https://nalsa.gov.in" target="_blank" rel="noopener noreferrer">nalsa.gov.in</a>.</li>
            </ul>
          </Card>

          <Card>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--color-brand-primary)', marginBottom: '0.5rem' }}>
              Protection of Women from Domestic Violence Act (PWDVA)
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Provides civil remedies without immediate divorce proceedings:
            </p>
            <ul style={{ margin: '0.5rem 0 0 1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <li><strong>Protection Orders (Section 18):</strong> Restraining the abuser from entering your workplace or communicating.</li>
              <li><strong>Residence Orders (Section 19):</strong> Right to reside in the shared household without eviction.</li>
              <li><strong>Monetary Relief (Section 20):</strong> Expenses and maintenance for self and children.</li>
            </ul>
          </Card>
        </div>
      )}

      {/* TAB 3: CONSULTATION PREP */}
      {activeTab === 'prep' && (
        <Card>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Consultation Preparation Questionnaire
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.45 }}>
            Prepare these answers before speaking with an advocate to maximize legal clarity:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              '1. What is the chronological timeline of incidents? (Dates, places, medium)',
              '2. What electronic evidence is currently secured? (Uncropped screenshots, audio recordings, email headers)',
              '3. Has an informal complaint or police call (112 / 1091) been placed previously?',
              '4. What immediate relief is desired? (Cease contact, restraining order, custody, or cyber takedown?)',
              '5. Are there shared children, bank accounts, or residential lease agreements?'
            ].map((q, idx) => (
              <div key={idx} style={{ padding: '0.75rem', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color-default)' }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{q}</strong>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Consultation Request Modal */}
      {selectedLawyer && (
        <Modal
          isOpen={!!selectedLawyer}
          onClose={() => setSelectedLawyer(null)}
          title={`Consultation with ${selectedLawyer.name}`}
        >
          {consultationBooked ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <CheckCircle size={28} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Consultation Request Submitted
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Your confidential request has been logged. In the live platform, the advocate’s chamber contacts your provided email/phone within 24 hours.
              </p>
              <Button variant="primary" style={{ marginTop: '1rem' }} onClick={() => setSelectedLawyer(null)}>
                Close
              </Button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Consultation Type: <strong>{selectedLawyer.feeType.replace('_', ' ')}</strong> • Preferred City: <strong>{selectedLawyer.city}</strong>
              </p>

              <Input label="Your Contact Name / Alias" defaultValue="Devika" />
              <Input label="Email or Secure Phone" defaultValue="confidential.client@nirbhaya.internal" />
              <Input label="Preferred Mode (e.g. Secure Video Call or In-Person)" defaultValue="Secure Video Call" />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <Button variant="outline" onClick={() => setSelectedLawyer(null)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={() => setConsultationBooked(true)}>
                  Confirm Consultation Request
                </Button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};
