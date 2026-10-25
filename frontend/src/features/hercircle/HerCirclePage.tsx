import React, { useState } from 'react';
import {
  Users,
  HeartHandshake,
  MapPin,
  FileText,
  Plus,
  Send,
  MessageSquare,
  PhoneCall,
  Trash2,
  Info
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
import { HerCircleRequest, SafePlacePlan } from '@/types';

const DOCUMENT_ITEMS = [
  { id: 'd1', label: 'Aadhaar Card / Voter ID / Passport copies' },
  { id: 'd2', label: 'Bank Passbooks / ATM Cards / Cheque Books' },
  { id: 'd3', label: 'Property Deeds / Rent Agreement / Vehicle RC' },
  { id: 'd4', label: 'Children Birth Certificates & School Records' },
  { id: 'd5', label: 'Emergency Cash / Gold Jewelry in a secure location' },
  { id: 'd6', label: 'Medical Prescriptions & Essential Medications' },
  { id: 'd7', label: 'Duplicate Keys (House & Vehicle)' }
];

export const HerCirclePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('requests');
  const [requests, setRequests] = useState<HerCircleRequest[]>(() => storageService.getHerCircleRequests());
  const supporters = resourcesService.getSupporters();

  // New request form state. Requests are stored on this device only.
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alias, setAlias] = useState('Anonymous Survivor');
  const [category, setCategory] = useState('Domestic Abuse Support');
  const [language, setLanguage] = useState('Hindi & English');
  const [channel, setChannel] = useState<'chat' | 'call' | 'in_person'>('chat');
  const [notes, setNotes] = useState('');

  // Safe-place plan, persisted locally.
  const [safePlan, setSafePlan] = useState<SafePlacePlan | null>(() => storageService.getSafePlacePlan());
  const [safeAddress, setSafeAddress] = useState(safePlan?.destination || '');
  const [safeContact, setSafeContact] = useState(safePlan?.trustedContact || '');
  const [safeCodeWord, setSafeCodeWord] = useState(safePlan?.codeWord || '');
  const [safePlanNotice, setSafePlanNotice] = useState(false);

  // Document checklist, persisted locally.
  const [completedDocs, setCompletedDocs] = useState<string[]>(() => storageService.getCompletedDocumentIds());

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq: HerCircleRequest = {
      id: `her_${Date.now()}`,
      alias,
      category,
      preferredLanguage: language,
      preferredChannel: channel,
      notes,
      status: 'saved_locally',
      createdAt: new Date().toISOString()
    };
    storageService.saveHerCircleRequest(newReq);
    setRequests(prev => [newReq, ...prev]);
    setIsModalOpen(false);
    setNotes('');
  };

  const handleDeleteRequest = (id: string) => {
    if (!window.confirm('Delete this locally saved support inquiry?')) return;
    storageService.deleteHerCircleRequest(id);
    setRequests(prev => prev.filter(req => req.id !== id));
  };

  const handleSaveSafePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const plan: SafePlacePlan = {
      destination: safeAddress.trim(),
      trustedContact: safeContact.trim(),
      codeWord: safeCodeWord.trim(),
      updatedAt: new Date().toISOString()
    };
    storageService.saveSafePlacePlan(plan);
    setSafePlan(plan);
    setSafePlanNotice(true);
    setTimeout(() => setSafePlanNotice(false), 4000);
  };

  const handleToggleDoc = (id: string) => {
    const updated = completedDocs.includes(id)
      ? completedDocs.filter(item => item !== id)
      : [...completedDocs, id];
    setCompletedDocs(updated);
    storageService.saveCompletedDocumentIds(updated);
  };

  const openRequestForSupporter = (name: string) => {
    setNotes(`Interested in the sample listener layout: ${name}. (Demo record only — not sent to anyone.)`);
    setIsModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--text-primary)' }}>
          HerCircle — Women Supporting Women
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
          Local support-intake planning, safe-place preparation, and a document checklist. No live counselor or peer
          network is connected.
        </p>
      </div>

      <Tabs
        tabs={[
          { id: 'requests', label: 'Support Inquiries', icon: <MessageSquare size={16} /> },
          { id: 'supporters', label: 'Sample Listener Layouts', icon: <Users size={16} /> },
          { id: 'safe_place', label: 'Safe-Place Planning', icon: <MapPin size={16} /> },
          { id: 'docs', label: 'Document Checklist', icon: <FileText size={16} /> }
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* TAB 1: SUPPORT INQUIRIES */}
      {activeTab === 'requests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <Alert type="warning" title="These inquiries are not delivered">
            NIRBHAYA has no case-management backend or counselor network. A support inquiry is saved only in this
            browser. It is never sent to a listener, NGO, or government office. In India, call the Women Helpline
            at <a href="tel:181" style={{ color: 'inherit', fontWeight: 600 }}>181</a> or KIRAN at{' '}
            <a href="tel:18005990019" style={{ color: 'inherit', fontWeight: 600 }}>1800-599-0019</a>.
            For help outside India, use your local services or{' '}
            <a href="https://lila.help/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', fontWeight: 600 }}>Lila.help</a>.
          </Alert>

          <Card style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, margin: 0 }}>
                Prepare a confidential support note
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                Draft what you want to say and keep it on this device. Nothing leaves your browser.
              </p>
            </div>
            <Button variant="primary" onClick={() => setIsModalOpen(true)} leftIcon={<Plus size={18} />}>
              Create support note
            </Button>
          </Card>

          <Card>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
              Saved notes ({requests.length})
            </h3>

            {requests.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                No support notes saved on this device yet.
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <div>
                        <strong style={{ fontSize: '0.95rem' }}>{r.category}</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                          (Alias: {r.alias})
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Badge variant="neutral">Saved on this device</Badge>
                        <button
                          type="button"
                          aria-label={`Delete support note ${r.category}`}
                          onClick={() => handleDeleteRequest(r.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0' }}>
                      Preferred channel: <strong>{r.preferredChannel.replace('_', ' ')}</strong> • Language:{' '}
                      <strong>{r.preferredLanguage}</strong>
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.25rem 0' }}>
                      Saved {new Date(r.createdAt).toLocaleString()}
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

      {/* TAB 2: SAMPLE LISTENERS */}
      {activeTab === 'supporters' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Alert type="info" title="Layout demonstrations, not real people">
            These cards show how a future verified-listener directory could look. No person named here exists, and no
            listener has been vetted or onboarded by NIRBHAYA. For real emotional support, use the official helplines
            below.
          </Alert>

          <Card style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <PhoneCall size={18} color="var(--color-brand-primary)" />
            <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              India support lines:
            </span>
            <a href="tel:181" style={{ fontSize: '0.9rem', fontWeight: 600 }}>Women Helpline 181</a>
            <a href="tel:18005990019" style={{ fontSize: '0.9rem', fontWeight: 600 }}>KIRAN 1800-599-0019</a>
            <a href="tel:112" style={{ fontSize: '0.9rem', fontWeight: 600 }}>Emergency 112</a>
            <a href="https://lila.help/" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.9rem', fontWeight: 600 }}>Global support directory</a>
          </Card>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
            {supporters.map(sup => (
              <Card key={sup.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                      {sup.name}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-brand-primary)', fontWeight: 500, margin: '2px 0 0' }}>
                      {sup.title}
                    </p>
                  </div>
                  <Badge variant="neutral">Sample</Badge>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '0.75rem' }}>
                  {sup.bio}
                </p>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div><strong>Organization:</strong> {sup.verifiedOrganization}</div>
                  <div><strong>Languages:</strong> {sup.languages.join(', ')}</div>
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openRequestForSupporter(sup.name)}
                    leftIcon={<HeartHandshake size={16} />}
                  >
                    Use this layout in a local note
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SAFE PLACE PLANNER */}
      {activeTab === 'safe_place' && (
        <Card>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Safe-place emergency plan
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.4 }}>
            Write down a place you could go and a person you trust. This plan stays in this browser. It is not shared
            with anyone automatically.
          </p>

          {safePlanNotice && (
            <Alert type="success" title="Plan saved on this device">
              Your safe-place plan was saved locally. Tell your trusted person yourself; NIRBHAYA does not send it.
            </Alert>
          )}

          <form onSubmit={handleSaveSafePlan} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '550px', marginTop: '1rem' }}>
            <Input
              label="Safe destination or haven"
              placeholder="e.g. Aunt Rekha's apartment / a shelter you have confirmed"
              value={safeAddress}
              onChange={e => setSafeAddress(e.target.value)}
            />

            <Input
              label="Trusted contact at the safe haven"
              placeholder="Name and phone number"
              value={safeContact}
              onChange={e => setSafeContact(e.target.value)}
            />

            <Input
              label="Private phrase you will recognise"
              helperText="A phrase for your own planning. NIRBHAYA does not send it or detect it in messages."
              placeholder="e.g. 'Did you water the plants?'"
              value={safeCodeWord}
              onChange={e => setSafeCodeWord(e.target.value)}
            />

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Button variant="primary" type="submit">
                Save plan on this device
              </Button>
              {safePlan && (
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    storageService.saveSafePlacePlan(null);
                    setSafePlan(null);
                    setSafeAddress('');
                    setSafeContact('');
                    setSafeCodeWord('');
                  }}
                >
                  Clear saved plan
                </Button>
              )}
            </div>

            {safePlan?.updatedAt && (
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Last saved {new Date(safePlan.updatedAt).toLocaleString()}.
              </p>
            )}
          </form>
        </Card>
      )}

      {/* TAB 4: DOCUMENT CHECKLIST */}
      {activeTab === 'docs' && (
        <Card>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Essential documents & emergency grab-bag
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: 1.4 }}>
            Keep digital scans in DigiLocker or physical originals gathered together in an easily accessible grab-bag.
            Check items off as you prepare. Progress is stored only in this browser.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <Info size={15} />
            <span>{completedDocs.length} of {DOCUMENT_ITEMS.length} items marked ready</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {DOCUMENT_ITEMS.map(d => {
              const checked = completedDocs.includes(d.id);
              return (
                <label
                  key={d.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: checked ? 'var(--color-success-subtle)' : 'var(--bg-app)',
                    border: checked ? '1px solid var(--color-success-border)' : '1px solid var(--border-color-default)',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleToggleDoc(d.id)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', textDecoration: checked ? 'line-through' : 'none' }}>
                    {d.label}
                  </span>
                </label>
              );
            })}
          </div>
        </Card>
      )}

      {/* New request modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Local support note">
        <form onSubmit={handleSubmitRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Alert type="warning" title="Saved locally, not delivered">
            This note stays in this browser. To reach a real person, call 181 or 112.
          </Alert>

          <Input
            label="Confidential alias (screen name)"
            value={alias}
            onChange={e => setAlias(e.target.value)}
            required
          />

          <div>
            <label htmlFor="hercircle-category" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              Support category
            </label>
            <select
              id="hercircle-category"
              value={category}
              onChange={e => setCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color-default)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)'
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
            <label htmlFor="hercircle-language" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              Preferred language
            </label>
            <select
              id="hercircle-language"
              value={language}
              onChange={e => setLanguage(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color-default)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)'
              }}
            >
              <option>Hindi & English</option>
              <option>English</option>
              <option>Hindi</option>
              <option>Tamil</option>
              <option>Bengali</option>
              <option>Marathi</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              Preferred communication mode
            </span>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {(['chat', 'call', 'in_person'] as const).map(m => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={channel === m}
                  onClick={() => setChannel(m)}
                  style={{
                    flex: 1,
                    minWidth: '90px',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-md)',
                    border: channel === m ? '2px solid var(--color-brand-primary)' : '1px solid var(--border-color-default)',
                    backgroundColor: channel === m ? 'var(--color-brand-primary-subtle)' : 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    fontWeight: channel === m ? 600 : 500,
                    textTransform: 'capitalize',
                    cursor: 'pointer'
                  }}
                >
                  {m.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="hercircle-notes" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              Brief overview / note (optional)
            </label>
            <textarea
              id="hercircle-notes"
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="What kind of support are you seeking?"
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color-default)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" leftIcon={<Send size={16} />}>
              Save note on this device
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
