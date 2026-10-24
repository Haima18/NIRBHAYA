import React, { useState } from 'react';
import {
  Users,
  HeartHandshake,
  ShieldAlert,
  FileText,
  MapPin,
  CheckCircle,
  Plus,
  Send,
  MessageSquare
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
import { HerCircleRequest, SupporterProfile } from '@/types';

export const HerCirclePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('requests');
  const [requests, setRequests] = useState<HerCircleRequest[]>(() => storageService.getHerCircleRequests());
  const supporters = resourcesService.getSupporters();

  // New Request Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alias, setAlias] = useState('Anonymous Survivor');
  const [category, setCategory] = useState('Domestic Abuse Support');
  const [language, setLanguage] = useState('Hindi & English');
  const [channel, setChannel] = useState<'chat' | 'call' | 'in_person'>('chat');
  const [notes, setNotes] = useState('');

  // Safe Place Planner State
  const [safeContact, setSafeContact] = useState('');
  const [safeAddress, setSafeAddress] = useState('');
  const [safeCodeWord, setSafeCodeWord] = useState('');
  const [safePlanSaved, setSafePlanSaved] = useState(false);

  // Document Checklist State
  const [docItems, setDocItems] = useState([
    { id: 'd1', label: 'Aadhaar Card / Voter ID / Passport copies', checked: false },
    { id: 'd2', label: 'Bank Passbooks / ATM Cards / Cheque Books', checked: false },
    { id: 'd3', label: 'Property Deeds / Rent Agreement / Vehicle RC', checked: false },
    { id: 'd4', label: 'Children Birth Certificates & School Records', checked: false },
    { id: 'd5', label: 'Emergency Cash / Gold Jewelry in a secure location', checked: false },
    { id: 'd6', label: 'Medical Prescriptions & Essential Medications', checked: false },
    { id: 'd7', label: 'Duplicate Keys (House & Vehicle)', checked: false }
  ]);

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq: HerCircleRequest = {
      id: `her_${Date.now()}`,
      alias,
      category,
      preferredLanguage: language,
      preferredChannel: channel,
      notes,
      status: 'submitted',
      createdAt: new Date().toISOString()
    };
    storageService.saveHerCircleRequest(newReq);
    setRequests([newReq, ...requests]);
    setIsModalOpen(false);
    setNotes('');
  };

  const handleToggleDoc = (id: string) => {
    setDocItems(docItems.map(d => d.id === id ? { ...d, checked: !d.checked } : d));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--text-primary)' }}>
          HerCircle — Women Supporting Women
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
          Confidential peer listening, verified trauma mentors, escape safety planning, and document readiness.
        </p>
      </div>

      <Tabs
        tabs={[
          { id: 'requests', label: 'Support Inquiries', icon: <MessageSquare size={16} /> },
          { id: 'supporters', label: 'Verified Listener Directory', icon: <Users size={16} /> },
          { id: 'safe_place', label: 'Safe-Place Planning', icon: <MapPin size={16} /> },
          { id: 'docs', label: 'Emergency Document Checklist', icon: <FileText size={16} /> }
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* TAB 1: SUPPORT INQUIRIES */}
      {activeTab === 'requests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <Card style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, margin: 0 }}>
                Request Confidential Support
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                Reach out without disclosing your public legal name. Your privacy is paramount.
              </p>
            </div>
            <Button variant="primary" onClick={() => setIsModalOpen(true)} leftIcon={<Plus size={18} />}>
              Create Support Inquiry
            </Button>
          </Card>

          <Alert type="info">
            <strong>Sample Demo Notice:</strong> HerCircle prototype demonstrates the complete confidential intake and appointment lifecycle. In live deployments, inquiries connect with empanelled Sakhi One Stop Centre counselors.
          </Alert>

          {/* Existing Inquiries */}
          <Card>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
              Your Support Requests ({requests.length})
            </h3>

            {requests.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                You have not submitted any support inquiries yet.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {requests.map(r => (
                  <div
                    key={r.id}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-app)',
                      border: '1px solid var(--border-color-default)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div>
                        <strong style={{ fontSize: '0.95rem' }}>{r.category}</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                          (Alias: {r.alias})
                        </span>
                      </div>
                      <Badge variant={r.status === 'matched' ? 'success' : 'medium'}>
                        {r.status}
                      </Badge>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0' }}>
                      Preferred Channel: <strong>{r.preferredChannel}</strong> • Language: <strong>{r.preferredLanguage}</strong>
                    </p>
                    {r.notes && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: '4px 0 0' }}>
                        &ldquo;{r.notes}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 2: VERIFIED LISTENERS */}
      {activeTab === 'supporters' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
          {supporters.map(sup => (
            <Card key={sup.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                    {sup.name}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-brand-primary)', fontWeight: 500, margin: '2px 0 0' }}>
                    {sup.title}
                  </p>
                </div>
                <Badge variant="info">Verified Sample</Badge>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '0.75rem' }}>
                {sup.bio}
              </p>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div><strong>Organization:</strong> {sup.verifiedOrganization}</div>
                <div><strong>Languages:</strong> {sup.languages.join(', ')}</div>
                <div><strong>Experience:</strong> {sup.experienceYears} Years</div>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)} leftIcon={<HeartHandshake size={16} />}>
                  Connect with Supporter
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 3: SAFE PLACE PLANNER */}
      {activeTab === 'safe_place' && (
        <Card>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Safe-Place Emergency Plan
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.4 }}>
            Prepare a predetermined safe haven in case living conditions become volatile or dangerous.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '550px' }}>
            <Input
              label="Safe Destination / Haven"
              placeholder="e.g. Aunt Rekha's Apartment / Sakhi Shelter"
              value={safeAddress}
              onChange={e => setSafeAddress(e.target.value)}
            />

            <Input
              label="Trusted Contact at Safe Haven"
              placeholder="e.g. Rekha Sharma (+91 98765 43210)"
              value={safeContact}
              onChange={e => setSafeContact(e.target.value)}
            />

            <Input
              label="Secret Distress Code Word (e.g. 'Did you water the plants?')"
              placeholder="A harmless phrase that signals trusted friends to call 112"
              value={safeCodeWord}
              onChange={e => setSafeCodeWord(e.target.value)}
            />

            <Button variant="primary" onClick={() => setSafePlanSaved(true)}>
              {safePlanSaved ? 'Safe Place Plan Saved!' : 'Save Safe Place Plan'}
            </Button>
          </div>
        </Card>
      )}

      {/* TAB 4: DOCUMENT CHECKLIST */}
      {activeTab === 'docs' && (
        <Card>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Essential Documents & Emergency Grab-Bag
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.4 }}>
            Keep digital scans in DigiLocker or physical originals gathered together in an easily accessible grab-bag.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {docItems.map(d => (
              <div
                key={d.id}
                onClick={() => handleToggleDoc(d.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: d.checked ? 'var(--color-success-subtle)' : 'var(--bg-app)',
                  border: d.checked ? '1px solid var(--color-success-border)' : '1px solid var(--border-color-default)',
                  cursor: 'pointer'
                }}
              >
                <input
                  type="checkbox"
                  checked={d.checked}
                  onChange={() => handleToggleDoc(d.id)}
                  style={{ width: '18px', height: '18px' }}
                />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', textDecoration: d.checked ? 'line-through' : 'none' }}>
                  {d.label}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* New Request Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Support Inquiry">
        <form onSubmit={handleSubmitRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Confidential Alias (Screen Name)"
            value={alias}
            onChange={e => setAlias(e.target.value)}
            required
          />

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              Support Category:
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color-default)',
                backgroundColor: 'var(--bg-surface)'
              }}
            >
              <option>Domestic Abuse Support</option>
              <option>Emotional & Verbal Abuse</option>
              <option>Financial Control & Isolation</option>
              <option>Online Harassment & Cyberstalking</option>
              <option>Digital Privacy Violation</option>
              <option>General Confidential Listening</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              Preferred Communication Mode:
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {(['chat', 'call', 'in_person'] as const).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setChannel(m)}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-md)',
                    border: channel === m ? '2px solid var(--color-brand-primary)' : '1px solid var(--border-color-default)',
                    backgroundColor: channel === m ? 'var(--color-brand-primary-subtle)' : 'var(--bg-surface)',
                    fontWeight: channel === m ? 600 : 500,
                    textTransform: 'capitalize'
                  }}
                >
                  {m.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              Brief Overview / Note (Optional):
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="What kind of support are you seeking?"
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color-default)',
                backgroundColor: 'var(--bg-surface)'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" leftIcon={<Send size={16} />}>
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
