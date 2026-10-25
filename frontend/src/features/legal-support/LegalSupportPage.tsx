import React, { useState } from 'react';
import {
  Scale,
  FileText,
  HelpCircle,
  Phone,
  ExternalLink,
  Save,
  Info,
  Trash2
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { Tabs } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { resourcesService } from '@/services/api/resourcesService';
import { storageService } from '@/services/storage/storageService';
import { LawyerProfile, LegalConsultationRequest } from '@/types';

const LAWYER_DIRECTORIES = {
  india: [
    { label: 'NALSA — State and District Legal Services Authorities', url: 'https://nalsa.gov.in/' },
    { label: 'Bar Council of India', url: 'https://www.barcouncilofindia.org/' }
  ],
  'england-wales': [
    { label: 'Solicitors Regulation Authority — Solicitors Register', url: 'https://www.sra.org.uk/consumers/register/' }
  ],
  other: [
    { label: 'International Bar Association — bar associations by country', url: 'https://www.ibanet.org/bar-associations' }
  ]
} as const;

export const LegalSupportPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('directory');
  const [jurisdiction, setJurisdiction] = useState<keyof typeof LAWYER_DIRECTORIES>('other');
  const [cityFilter, setCityFilter] = useState('all');
  const [areaFilter, setAreaFilter] = useState('all');
  const [selectedLawyer, setSelectedLawyer] = useState<LawyerProfile | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);

  const [contactName, setContactName] = useState('');
  const [contactDetails, setContactDetails] = useState('');
  const [preferredMode, setPreferredMode] = useState('Phone call');
  const [notes, setNotes] = useState('');
  const [savedRequests, setSavedRequests] = useState<LegalConsultationRequest[]>(
    () => storageService.getLegalConsultationRequests()
  );

  const lawyers = resourcesService.getLawyers(cityFilter, areaFilter);

  const openPrepNote = (lawyer: LawyerProfile) => {
    setSelectedLawyer(lawyer);
    setSavedNotice(false);
  };

  const handleSaveRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLawyer) return;
    const request: LegalConsultationRequest = {
      id: `legal_${Date.now()}`,
      lawyerId: selectedLawyer.id,
      lawyerName: selectedLawyer.name,
      contactName,
      contactDetails,
      preferredMode,
      notes,
      status: 'saved_locally',
      createdAt: new Date().toISOString()
    };
    storageService.saveLegalConsultationRequest(request);
    setSavedRequests(prev => [request, ...prev].slice(0, 30));
    setSavedNotice(true);
    setNotes('');
  };

  const handleDeleteRequest = (id: string) => {
    if (!window.confirm('Delete this locally saved consultation note?')) return;
    storageService.deleteLegalConsultationRequest(id);
    setSavedRequests(prev => prev.filter(req => req.id !== id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--text-primary)' }}>
          Legal Information & Official Legal Aid
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
          General legal information, official free-aid routes, and a private consultation-preparation tool. NIRBHAYA
          does not provide legal representation or a verified lawyer network.
        </p>
      </div>

      <Alert type="info" title="Not legal advice">
        This page provides general information, not legal advice, and does not create a lawyer-client relationship. The
        legal guides and NALSA resources are India-specific. The advocate cards are layout samples, not real practitioners.
        For free legal aid in India, call NALSA at{' '}
        <a href="tel:15100" style={{ color: 'inherit', fontWeight: 600 }}>15100</a> or contact your State Legal Services
        Authority.
      </Alert>

      <Tabs
        tabs={[
          { id: 'directory', label: 'Find Legal Help', icon: <Scale size={16} /> },
          { id: 'guides', label: 'Legal Rights Guides', icon: <FileText size={16} /> },
          { id: 'prep', label: 'Consultation Preparation', icon: <HelpCircle size={16} /> }
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* TAB 1: DIRECTORY + OFFICIAL AID */}
      {activeTab === 'directory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <Card style={{ border: '1px solid var(--color-brand-primary-light)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Find a regulator or legal-aid service
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.8rem', lineHeight: 1.5 }}>
              There is no single reliable global register of currently licensed lawyers. Choose a jurisdiction and check
              a regulator’s own register before sharing sensitive information or paying anyone.
            </p>
            <label htmlFor="legal-jurisdiction" style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
              Jurisdiction
            </label>
            <select
              id="legal-jurisdiction"
              value={jurisdiction}
              onChange={event => setJurisdiction(event.target.value as keyof typeof LAWYER_DIRECTORIES)}
              style={{ width: '100%', maxWidth: '360px', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color-default)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', marginBottom: '0.8rem' }}
            >
              <option value="other">Other countries / regions</option>
              <option value="india">India</option>
              <option value="england-wales">England & Wales</option>
            </select>
            <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
              {LAWYER_DIRECTORIES[jurisdiction].map(directory => (
                <a key={directory.url} href={directory.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-info)', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  {directory.label} <ExternalLink size={14} />
                </a>
              ))}
              <a href="https://lila.help/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-info)', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                Lila.help — global gender-based violence support directory <ExternalLink size={14} />
              </a>
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '0.8rem 0 0' }}>
              The International Bar Association lists bar associations; it is not a lawyer licensing register. For other
              jurisdictions, use that country’s official regulator or legal-aid authority. Lila.help is a support directory,
              not a lawyer directory.
            </p>
          </Card>

          <Card style={{ border: '1px solid var(--color-brand-primary-light)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              India: free legal-aid routes
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
              In India, Section 12 of the Legal Services Authorities Act, 1987 includes women among those entitled to
              free legal services.
              Eligibility and scope are determined by the legal services authority, not by NIRBHAYA.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <a href="tel:15100" style={{ textDecoration: 'none' }}>
                <Button variant="primary" size="sm" leftIcon={<Phone size={16} />}>NALSA 15100</Button>
              </a>
              <a href="https://nalsa.gov.in" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <Button variant="outline" size="sm" leftIcon={<ExternalLink size={16} />}>NALSA portal</Button>
              </a>
              <a href="https://dslsa.org" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <Button variant="outline" size="sm" leftIcon={<ExternalLink size={16} />}>Delhi SLSA (example)</Button>
              </a>
              <a href="https://ncw.nic.in" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <Button variant="outline" size="sm" leftIcon={<ExternalLink size={16} />}>NCW</Button>
              </a>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.75rem 0 0' }}>
              Find your State Legal Services Authority through the NALSA portal. NIRBHAYA cannot confirm which office is
              nearest to you.
            </p>
          </Card>

          <Card style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <label htmlFor="legal-city" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                Filter sample profiles by city
              </label>
              <select
                id="legal-city"
                value={cityFilter}
                onChange={e => setCityFilter(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color-default)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}
              >
                <option value="all">All sample cities</option>
                <option value="New Delhi">New Delhi</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Bengaluru">Bengaluru</option>
              </select>
            </div>

            <div style={{ flex: 1, minWidth: '220px' }}>
              <label htmlFor="legal-area" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                Practice area
              </label>
              <select
                id="legal-area"
                value={areaFilter}
                onChange={e => setAreaFilter(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color-default)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}
              >
                <option value="all">All practice areas</option>
                <option value="Cybercrime">Cybercrime & IT Act</option>
                <option value="Domestic Violence">Domestic Violence (PWDVA)</option>
                <option value="Online Harassment">Online Harassment</option>
                <option value="Non-Consensual Imagery">Non-Consensual Imagery (NCII)</option>
              </select>
            </div>

            <div style={{ alignSelf: 'flex-end' }}>
              <Button variant="outline" size="md" onClick={() => { setCityFilter('all'); setAreaFilter('all'); }}>
                Reset filters
              </Button>
            </div>
          </Card>

          <Alert type="warning" title="Fictional profile examples for note preparation only">
            The cards below are mock examples, not a lawyer directory. The names, bar-council entries, and organizations are fictional.
            NIRBHAYA has not verified, employed, or partnered with any advocate. Do not send money or personal documents
            based on these cards. Use the regulator links above to find and independently verify a real practitioner.
          </Alert>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
            {lawyers.map(lawyer => (
              <Card key={lawyer.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                      {lawyer.name}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                      {lawyer.city}, {lawyer.state}
                    </p>
                  </div>
                  <Badge variant="neutral">Sample layout</Badge>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: '0.5rem 0' }}>
                  {lawyer.bio}
                </p>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  <div><strong>Registration:</strong> {lawyer.barCouncilNumber}</div>
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
                  variant="outline"
                  size="sm"
                  style={{ width: '100%' }}
                  onClick={() => openPrepNote(lawyer)}
                >
                  Prepare a local consultation note
                </Button>
              </Card>
            ))}
          </div>

          <Card>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Saved consultation notes ({savedRequests.length})
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              These notes are stored only in this browser. They are not sent to any advocate or legal-aid office.
            </p>
            {savedRequests.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No consultation notes saved yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {savedRequests.map(req => (
                  <div key={req.id} style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color-default)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', alignItems: 'flex-start' }}>
                      <div>
                        <strong style={{ fontSize: '0.9rem' }}>{req.lawyerName}</strong>
                        <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {req.preferredMode} • {new Date(req.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label={`Delete consultation note for ${req.lawyerName}`}
                        onClick={() => handleDeleteRequest(req.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    {req.notes && (
                      <p style={{ margin: '0.4rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        &ldquo;{req.notes}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 2: LEGAL GUIDES */}
      {activeTab === 'guides' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
          <Card>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--color-brand-primary)', marginBottom: '0.5rem' }}>
              Zero FIR — general information
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              A Zero FIR is a police practice that allows a First Information Report to be registered at a police station
              even when the alleged offence happened outside that station&apos;s jurisdiction. The report is then
              transferred to the appropriate station.
            </p>
            <ul style={{ margin: '0.5rem 0 0 1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <li>Ask for a copy of the FIR and note the station and officer details.</li>
              <li>If a station refuses, you can escalate in writing to the Superintendent of Police and seek help from legal aid.</li>
              <li>Procedural rules come from the Bharatiya Nagarik Suraksha Sanhita, 2023 and state directions. Confirm current practice with a licensed advocate or legal-aid office.</li>
            </ul>
          </Card>

          <Card>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--color-brand-primary)', marginBottom: '0.5rem' }}>
              Free legal aid under NALSA
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Section 12 of the Legal Services Authorities Act, 1987 lists categories of people entitled to free legal
              services, including women. The relevant State or District Legal Services Authority decides eligibility and
              assigns an advocate.
            </p>
            <ul style={{ margin: '0.5rem 0 0 1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <li>Free legal aid can cover representation and related court fees, subject to the authority&apos;s rules.</li>
              <li>Call <strong>15100</strong> or use <a href="https://nalsa.gov.in" target="_blank" rel="noopener noreferrer">nalsa.gov.in</a> to find your State Legal Services Authority.</li>
              <li>NIRBHAYA does not decide eligibility and cannot fast-track an application.</li>
            </ul>
          </Card>

          <Card>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--color-brand-primary)', marginBottom: '0.5rem' }}>
              Protection of Women from Domestic Violence Act, 2005
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              The PWDVA provides civil remedies that can be sought separately from criminal proceedings:
            </p>
            <ul style={{ margin: '0.5rem 0 0 1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <li><strong>Protection orders:</strong> restrain specified conduct, communication, or entry.</li>
              <li><strong>Residence orders:</strong> address a woman&apos;s right to reside in a shared household.</li>
              <li><strong>Monetary relief:</strong> address maintenance, medical expenses, and related losses.</li>
              <li>A Protection Officer or service provider can help with the application process. Confirm details with a licensed advocate or legal-aid office.</li>
            </ul>
          </Card>
        </div>
      )}

      {/* TAB 3: CONSULTATION PREP */}
      {activeTab === 'prep' && (
        <Card>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Consultation preparation questions
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.45 }}>
            Write down what you can before speaking with a licensed advocate or legal-aid officer. Keep originals and
            unedited copies of evidence where possible.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              'What is the chronological timeline of events? Include dates, places, and how contact was made.',
              'What evidence do you already have? Keep uncropped screenshots, original files, and message headers where possible.',
              'Have you contacted police, a helpline, or a Protection Officer before? Note dates and reference numbers.',
              'What immediate outcome do you want: no contact, a protection order, residence safety, or a cyber takedown?',
              'Are there shared children, finances, tenancy, or immigration issues a lawyer should know about?'
            ].map((q, idx) => (
              <div key={idx} style={{ padding: '0.75rem', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color-default)' }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{idx + 1}. {q}</strong>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>
              You can save your answers as a local consultation note from any sample card in the directory tab. Notes are
              never transmitted.
            </span>
          </div>
        </Card>
      )}

      {/* Consultation preparation modal */}
      {selectedLawyer && (
        <Modal
          isOpen={!!selectedLawyer}
          onClose={() => setSelectedLawyer(null)}
          title="Local consultation preparation note"
        >
          {savedNotice ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Alert type="success" title="Saved on this device">
                This note was stored in your browser. It was not sent to {selectedLawyer.name} or any legal-aid office.
              </Alert>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                To contact a real legal-aid office, call NALSA at <a href="tel:15100">15100</a> or use your State Legal
                Services Authority. For immediate danger, call 112.
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="primary" onClick={() => setSelectedLawyer(null)}>Close</Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Alert type="warning" title="Sample card — no real advocate">
                {selectedLawyer.name} is a layout sample. Use this form only to prepare your own notes. Nothing is
                delivered.
              </Alert>

              <Input
                label="Your name or alias (optional)"
                value={contactName}
                onChange={e => setContactName(e.target.value)}
              />
              <Input
                label="Contact detail you want to remember (optional)"
                value={contactDetails}
                onChange={e => setContactDetails(e.target.value)}
              />
              <Input
                label="Preferred consultation mode"
                value={preferredMode}
                onChange={e => setPreferredMode(e.target.value)}
              />

              <div>
                <label htmlFor="legal-notes" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Your questions or timeline
                </label>
                <textarea
                  id="legal-notes"
                  rows={4}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="What do you want to ask? What dates and evidence matter?"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color-default)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', flexWrap: 'wrap' }}>
                <Button variant="outline" type="button" onClick={() => setSelectedLawyer(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" leftIcon={<Save size={16} />}>
                  Save note on this device
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};
