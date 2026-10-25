import React, { useState } from 'react';
import {
  FolderLock,
  Plus,
  Trash2,
  Printer,
  Pencil,
  Paperclip,
  X
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { Modal } from '@/components/ui/Modal';
import { storageService } from '@/services/storage/storageService';
import { generateIncidentHtmlSummary } from '@/utils/exportSummary';
import { IncidentRecord, SeverityLevel } from '@/types';
import { EvidenceCapturePanel } from './EvidenceCapturePanel';

export const EvidenceVaultPage: React.FC = () => {
  const [incidents, setIncidents] = useState<IncidentRecord[]>(() => storageService.getIncidents());
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Online Harassment');
  const [incidentDate, setIncidentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [severity, setSeverity] = useState<SeverityLevel>('medium');
  const [description, setDescription] = useState('');
  const [perpetratorInfo, setPerpetratorInfo] = useState('');
  const [notes, setNotes] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [attachmentNames, setAttachmentNames] = useState<string[]>([]);

  const filtered = incidents.filter(i =>
    i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setCategory('Online Harassment');
    setIncidentDate(new Date().toISOString().split('T')[0]);
    setSeverity('medium');
    setDescription('');
    setPerpetratorInfo('');
    setNotes('');
    setPastedText('');
    setAttachmentNames([]);
  };

  const openCreate = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const openEdit = (incident: IncidentRecord) => {
    setEditingId(incident.id);
    setTitle(incident.title);
    setCategory(incident.category);
    setIncidentDate(incident.incidentDate);
    setSeverity(incident.severity);
    setDescription(incident.description);
    setPerpetratorInfo(incident.perpetratorInfo || '');
    setNotes(incident.notes);
    setPastedText(incident.pastedText || '');
    setAttachmentNames(incident.attachmentNames || []);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const existing = editingId ? incidents.find(inc => inc.id === editingId) : null;
    const record: IncidentRecord = {
      id: existing?.id || `inc_${Date.now()}`,
      title: title.trim(),
      category,
      incidentDate,
      severity,
      description: description.trim(),
      perpetratorInfo: perpetratorInfo.trim() || undefined,
      notes: notes.trim(),
      pastedText: pastedText.trim() || undefined,
      attachmentNames,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    storageService.saveIncident(record);
    setIncidents(storageService.getIncidents());
    setIsFormOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this incident record from this browser? This cannot be undone.')) {
      storageService.deleteIncident(id);
      setIncidents(storageService.getIncidents());
    }
  };

  const handleAddAttachmentNames = (files: FileList | null) => {
    if (!files) return;
    const names = Array.from(files).map(file => file.name);
    setAttachmentNames(prev => Array.from(new Set([...prev, ...names])));
  };

  const handleExportHtml = () => {
    if (filtered.length === 0) {
      window.alert('There are no records to export.');
      return;
    }
    const html = generateIncidentHtmlSummary(filtered);
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--text-primary)' }}>
            Evidence Vault & Incident Journal
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
            A private chronological record stored in this browser. Add, edit, and export summaries for your own use or a
            consultation.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Button variant="outline" size="md" onClick={handleExportHtml} leftIcon={<Printer size={18} />}>
            Export / print summary
          </Button>
          <Button variant="primary" size="md" onClick={openCreate} leftIcon={<Plus size={18} />}>
            Log new incident
          </Button>
        </div>
      </div>

      <Alert type="warning" title="Local records, not a certified evidence system">
        Entries are stored unencrypted in this browser&apos;s local storage. NIRBHAYA does not upload, hash, or
        cryptographically certify them. Keep the original messages, files, and screenshots separately. A summary is not
        a substitute for original evidence, and rules such as Section 63 of the Bharatiya Sakshya Adhiniyam may apply.
      </Alert>

      <EvidenceCapturePanel />

      <Card style={{ padding: 'var(--space-4)' }}>
        <Input
          placeholder="Search records by title, category, or description..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </Card>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {filtered.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
            <FolderLock size={40} color="var(--color-neutral-400)" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              No records found
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '400px', margin: '4px auto 1rem' }}>
              Your vault has no records matching your query. Create an entry to start documenting.
            </p>
            <Button variant="primary" size="sm" onClick={openCreate}>
              Create first entry
            </Button>
          </Card>
        ) : (
          filtered.map(inc => (
            <Card key={inc.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                      {inc.title}
                    </h3>
                    <Badge variant={inc.severity}>{inc.severity}</Badge>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                    Category: <strong>{inc.category}</strong> • Date: <strong>{inc.incidentDate}</strong>
                    {inc.perpetratorInfo && ` • Identifier: ${inc.perpetratorInfo}`}
                  </p>
                  {inc.updatedAt !== inc.createdAt && (
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                      Last edited {new Date(inc.updatedAt).toLocaleString()}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button
                    type="button"
                    onClick={() => openEdit(inc)}
                    aria-label={`Edit record ${inc.title}`}
                    style={{ color: 'var(--color-brand-primary)', background: 'none', border: 'none', padding: '6px', cursor: 'pointer' }}
                    title="Edit record"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(inc.id)}
                    aria-label={`Delete record ${inc.title}`}
                    style={{ color: 'var(--color-danger)', background: 'none', border: 'none', padding: '6px', cursor: 'pointer' }}
                    title="Delete record"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0.5rem 0' }}>
                {inc.description}
              </p>

              {inc.pastedText && (
                <div style={{ margin: '0.75rem 0', padding: '0.75rem', backgroundColor: 'var(--color-danger-subtle)', border: '1px solid var(--color-danger-border)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-danger-hover)', textTransform: 'uppercase' }}>
                    Preserved message / threat text
                  </span>
                  <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem', color: 'var(--text-primary)', margin: '4px 0 0', fontFamily: 'monospace' }}>
                    {inc.pastedText}
                  </pre>
                </div>
              )}

              {inc.notes && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: '0.5rem 0 0' }}>
                  Journal note: {inc.notes}
                </p>
              )}

              {inc.attachmentNames && inc.attachmentNames.length > 0 && (
                <div style={{ marginTop: '0.6rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {inc.attachmentNames.map(name => (
                    <span key={name} style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color-default)', borderRadius: 'var(--radius-full)', padding: '2px 8px' }}>
                      <Paperclip size={11} /> {name}
                    </span>
                  ))}
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); resetForm(); }}
        title={editingId ? 'Edit incident record' : 'Log new incident'}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Incident title"
            placeholder="e.g. Unsolicited blackmail message"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label htmlFor="evidence-category" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Category
              </label>
              <select
                id="evidence-category"
                value={category}
                onChange={e => setCategory(e.target.value)}
                style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color-default)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}
              >
                <option>Online Harassment</option>
                <option>Blackmail & Extortion</option>
                <option>Physical Stalking / Intimidation</option>
                <option>Domestic Abuse Incident</option>
                <option>Deepfake / Fabricated Media</option>
                <option>Doxxing / Privacy Leak</option>
              </select>
            </div>

            <div>
              <label htmlFor="evidence-severity" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Severity
              </label>
              <select
                id="evidence-severity"
                value={severity}
                onChange={e => setSeverity(e.target.value as SeverityLevel)}
                style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color-default)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <Input
            label="Date of occurrence"
            type="date"
            value={incidentDate}
            onChange={e => setIncidentDate(e.target.value)}
            required
          />

          <Input
            label="Sender / account identifier (optional)"
            placeholder="e.g. @unknown_user99 / +91 98XXX XXXXX"
            value={perpetratorInfo}
            onChange={e => setPerpetratorInfo(e.target.value)}
          />

          <div>
            <label htmlFor="evidence-description" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              Description
            </label>
            <textarea
              id="evidence-description"
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="A factual summary of what happened."
              required
              style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color-default)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label htmlFor="evidence-message" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              Exact message or threat transcript (optional)
            </label>
            <textarea
              id="evidence-message"
              rows={3}
              value={pastedText}
              onChange={e => setPastedText(e.target.value)}
              placeholder="Paste the exact words received."
              style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color-default)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label htmlFor="evidence-notes" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              Journal note (optional)
            </label>
            <textarea
              id="evidence-notes"
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="How you felt, what you did next, or who you told."
              style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color-default)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label htmlFor="evidence-attachments" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              Attachment references (optional)
            </label>
            <input
              id="evidence-attachments"
              type="file"
              multiple
              onChange={e => handleAddAttachmentNames(e.target.files)}
              style={{ fontSize: '0.8rem' }}
            />
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Only the file names are saved. Files are not uploaded, copied, or encrypted by NIRBHAYA. Keep the originals
              in a separate secure location.
            </p>
            {attachmentNames.length > 0 && (
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {attachmentNames.map(name => (
                  <span key={name} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color-default)', borderRadius: 'var(--radius-full)', padding: '2px 8px' }}>
                    <Paperclip size={11} /> {name}
                    <button
                      type="button"
                      aria-label={`Remove attachment reference ${name}`}
                      onClick={() => setAttachmentNames(prev => prev.filter(item => item !== name))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'inline-flex', padding: 0 }}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <Button variant="outline" type="button" onClick={() => { setIsFormOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingId ? 'Save changes' : 'Save incident'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
