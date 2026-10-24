import React, { useState } from 'react';
import {
  FolderLock,
  Plus,
  Trash2,
  Printer,
  Search,
  Calendar,
  AlertCircle,
  FileText,
  Clock,
  Download
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

export const EvidenceVaultPage: React.FC = () => {
  const [incidents, setIncidents] = useState<IncidentRecord[]>(() => storageService.getIncidents());
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Online Harassment');
  const [incidentDate, setIncidentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [severity, setSeverity] = useState<SeverityLevel>('medium');
  const [description, setDescription] = useState('');
  const [perpetratorInfo, setPerpetratorInfo] = useState('');
  const [notes, setNotes] = useState('');
  const [pastedText, setPastedText] = useState('');

  const filtered = incidents.filter(i =>
    i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const newRecord: IncidentRecord = {
      id: `inc_${Date.now()}`,
      title,
      category,
      incidentDate,
      severity,
      description,
      perpetratorInfo: perpetratorInfo.trim() || undefined,
      notes,
      pastedText: pastedText.trim() || undefined,
      attachmentNames: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    storageService.saveIncident(newRecord);
    setIncidents(storageService.getIncidents());
    setIsCreateOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this incident record from your vault?')) {
      storageService.deleteIncident(id);
      setIncidents(storageService.getIncidents());
    }
  };

  const handleExportHtml = () => {
    const html = generateIncidentHtmlSummary(filtered);
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPerpetratorInfo('');
    setNotes('');
    setPastedText('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--text-primary)' }}>
            Evidence Vault & Incident Journal
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
            Private, secure chronological record of threats, harassment, and digital evidence with printable legal consultation exports.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Button
            variant="outline"
            size="md"
            onClick={handleExportHtml}
            leftIcon={<Printer size={18} />}
          >
            Export / Print Summary
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsCreateOpen(true)}
            leftIcon={<Plus size={18} />}
          >
            Log New Incident
          </Button>
        </div>
      </div>

      <Alert type="info">
        <strong>Evidence Integrity Notice:</strong> Exported logs serve as chronological summaries for consultation with lawyers or police. Under Indian Law (Section 65B Indian Evidence Act / Section 63 BSA), always retain original digital message threads, screenshots with dates, and phone numbers unedited.
      </Alert>

      {/* Search Bar */}
      <Card style={{ padding: 'var(--space-4)' }}>
        <Input
          placeholder="Search incident records by title, category, or description..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </Card>

      {/* Incident List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {filtered.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
            <FolderLock size={40} color="var(--color-neutral-400)" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              No Incidents Found
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '400px', margin: '4px auto 1rem' }}>
              Your vault has no records matching your query. Tap &ldquo;Log New Incident&rdquo; to start documenting.
            </p>
            <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)}>
              Create First Entry
            </Button>
          </Card>
        ) : (
          filtered.map(inc => (
            <Card key={inc.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                      {inc.title}
                    </h3>
                    <Badge variant={inc.severity}>{inc.severity}</Badge>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                    Category: <strong>{inc.category}</strong> • Date: <strong>{inc.incidentDate}</strong>
                    {inc.perpetratorInfo && ` • Reported Person: ${inc.perpetratorInfo}`}
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(inc.id)}
                  style={{ color: 'var(--color-danger)', padding: '6px', cursor: 'pointer' }}
                  title="Delete record"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0.5rem 0' }}>
                {inc.description}
              </p>

              {inc.pastedText && (
                <div style={{ margin: '0.75rem 0', padding: '0.75rem', backgroundColor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase' }}>
                    Preserved Message / Threat Text:
                  </span>
                  <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem', color: '#881337', margin: '4px 0 0', fontFamily: 'monospace' }}>
                    {inc.pastedText}
                  </pre>
                </div>
              )}

              {inc.notes && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: '0.5rem 0 0' }}>
                  Journal Note: {inc.notes}
                </p>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Log New Incident in Vault">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Incident Title"
            placeholder="e.g. Unsolicited WhatsApp blackmail message"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Category:
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color-default)' }}
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
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Severity Level:
              </label>
              <select
                value={severity}
                onChange={e => setSeverity(e.target.value as SeverityLevel)}
                style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color-default)' }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <Input
            label="Date of Occurrence"
            type="date"
            value={incidentDate}
            onChange={e => setIncidentDate(e.target.value)}
            required
          />

          <Input
            label="Sender / Perpetrator Handle or Identifier (Optional)"
            placeholder="e.g. @unknown_user99 / +91 98XXX XXXXX"
            value={perpetratorInfo}
            onChange={e => setPerpetratorInfo(e.target.value)}
          />

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              Detailed Description:
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Provide a factual summary of what occurred..."
              required
              style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color-default)' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              Exact Message Text / Threat Transcript (Optional):
            </label>
            <textarea
              rows={3}
              value={pastedText}
              onChange={e => setPastedText(e.target.value)}
              placeholder="Paste exact words or chat messages received..."
              style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color-default)' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Incident
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
