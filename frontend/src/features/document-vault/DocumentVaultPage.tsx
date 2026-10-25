import React, { useState, useEffect } from 'react';
import {
  FolderLock,
  Plus,
  Trash2,
  Edit,
  Eye,
  FileText,
  CreditCard,
  User,
  Banknote,
  Shield,
  Lock,
  Unlock,
  ExternalLink,
  X,
  Check
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { storageService } from '@/services/storage/storageService';
import { DocumentRecord, DocumentType } from '@/types';

const DOCUMENT_STORAGE_KEY = 'nirbhaya_secure_documents';
const VAULT_PASSWORD_KEY = 'nirbhaya_vault_password';

const DOCUMENT_TYPE_LABELS: Record<DocumentType, { label: string; icon: React.ElementType; color: string }> = {
  aadhaar: { label: 'Aadhaar Card', icon: User, color: 'var(--color-brand-primary)' },
  pan: { label: 'PAN Card', icon: FileText, color: 'var(--color-brand-secondary)' },
  bank: { label: 'Bank Account', icon: Banknote, color: '#059669' },
  passport: { label: 'Passport', icon: FileText, color: '#7c3aed' },
  voter_id: { label: 'Voter ID', icon: User, color: '#d97706' },
  driving_license: { label: 'Driving License', icon: CreditCard, color: '#dc2626' },
  other: { label: 'Other Document', icon: FileText, color: '#6b7280' }
};

export const DocumentVaultPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [isSettingPassword, setIsSettingPassword] = useState(false);
  const [newVaultPassword, setNewVaultPassword] = useState('');
  const [confirmVaultPassword, setConfirmVaultPassword] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNumbers, setShowNumbers] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('other');
  const [documentNumber, setDocumentNumber] = useState('');
  const [issuingAuthority, setIssuingAuthority] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(DOCUMENT_STORAGE_KEY);
    if (saved) {
      try { setDocuments(JSON.parse(saved)); } catch { setDocuments([]); }
    }
  }, []);

  const saveDocuments = (docs: DocumentRecord[]) => {
    setDocuments(docs);
    localStorage.setItem(DOCUMENT_STORAGE_KEY, JSON.stringify(docs));
  };

  const vaultPasswordExists = () => !!localStorage.getItem(VAULT_PASSWORD_KEY);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const stored = localStorage.getItem(VAULT_PASSWORD_KEY);
    if (stored && passwordInput === stored) {
      setIsUnlocked(true);
      setPasswordInput('');
    } else {
      alert('Incorrect password. Please try again.');
    }
  };

  const handleSetVaultPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVaultPassword || newVaultPassword.length < 4) {
      alert('Please choose a password of at least 4 characters.');
      return;
    }
    if (newVaultPassword !== confirmVaultPassword) {
      alert('Passwords do not match.');
      return;
    }
    localStorage.setItem(VAULT_PASSWORD_KEY, newVaultPassword);
    setIsSettingPassword(false);
    setNewVaultPassword('');
    setConfirmVaultPassword('');
    setIsUnlocked(true);
  };

  const handleAddDocument = () => {
    const newDoc: DocumentRecord = {
      id: Date.now().toString(),
      title,
      documentType,
      documentNumber: documentNumber || undefined,
      issuingAuthority: issuingAuthority || undefined,
      issueDate: issueDate || undefined,
      expiryDate: expiryDate || undefined,
      notes: notes || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    saveDocuments([...documents, newDoc]);
    resetForm();
    setIsFormOpen(false);
  };

  const handleUpdateDocument = () => {
    const updated = documents.map(doc =>
      doc.id === editingId
        ? { ...doc, title, documentType, documentNumber: documentNumber || undefined, issuingAuthority: issuingAuthority || undefined, issueDate: issueDate || undefined, expiryDate: expiryDate || undefined, notes: notes || undefined, updatedAt: new Date().toISOString() }
        : doc
    );
    saveDocuments(updated);
    resetForm();
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleDeleteDocument = (id: string) => {
    if (!confirm('Delete this document record? This cannot be undone.')) return;
    saveDocuments(documents.filter(doc => doc.id !== id));
  };

  const handleEditDocument = (doc: DocumentRecord) => {
    setEditingId(doc.id);
    setTitle(doc.title);
    setDocumentType(doc.documentType);
    setDocumentNumber(doc.documentNumber || '');
    setIssuingAuthority(doc.issuingAuthority || '');
    setIssueDate(doc.issueDate || '');
    setExpiryDate(doc.expiryDate || '');
    setNotes(doc.notes || '');
    setIsFormOpen(true);
  };

  const resetForm = () => {
    setTitle('');
    setDocumentType('other');
    setDocumentNumber('');
    setIssuingAuthority('');
    setIssueDate('');
    setExpiryDate('');
    setNotes('');
  };

  const formatMasked = (value: string | undefined, type: DocumentType) => {
    if (!value || !showNumbers) return value;
    if (type === 'aadhaar') return value.replace(/\d(?=\d{4})/g, '*');
    if (type === 'pan') return value.replace(/.(?=.{4})/g, '*');
    return value;
  };

  if (!isUnlocked) {
    const hasVaultPassword = vaultPasswordExists();

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
        <div style={{ width: '100%', maxWidth: '420px', padding: '2rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color-default)', boxShadow: 'var(--shadow-xl)' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <Lock size={48} style={{ color: 'var(--color-brand-primary)', marginBottom: '0.75rem' }} />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>{hasVaultPassword ? 'Secure Document Vault' : 'Set Up Document Vault'}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
              {hasVaultPassword ? 'Enter your vault password to access your stored documents.' : 'Create a password for your document vault. This protects your stored document references.'}
            </p>
          </div>

          {hasVaultPassword ? (
            <form onSubmit={handleUnlock} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Input
                type="password"
                placeholder="Vault password"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                autoComplete="current-password"
              />
              <Button type="submit" variant="primary" size="lg" style={{ width: '100%' }}>
                Unlock Vault
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSetVaultPassword} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Input
                type="password"
                placeholder="Create vault password (min 4 chars)"
                value={newVaultPassword}
                onChange={e => setNewVaultPassword(e.target.value)}
                autoComplete="new-password"
              />
              <Input
                type="password"
                placeholder="Confirm vault password"
                value={confirmVaultPassword}
                onChange={e => setConfirmVaultPassword(e.target.value)}
                autoComplete="new-password"
              />
              <Button type="submit" variant="primary" size="lg" style={{ width: '100%' }}>
                Set Password & Unlock
              </Button>
            </form>
          )}

          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.75rem' }}>
            Documents are stored locally on your device only. NIRBHAYA does not upload them anywhere.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--text-primary)' }}>
          Secure Document Vault
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
          Store references to your Aadhaar, PAN, bank, and other identity documents. Documents are stored locally on your device only.
        </p>
      </div>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={18} style={{ color: 'var(--color-brand-primary)' }} />
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Vault unlocked</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {showNumbers ? <Unlock size={14} /> : <Lock size={14} />}
            <button
              type="button"
              onClick={() => setShowNumbers(!showNumbers)}
              style={{ background: 'none', border: 'none', color: 'var(--color-brand-primary)', cursor: 'pointer', fontSize: '0.8rem', padding: 0 }}
            >
              {showNumbers ? 'Hide numbers' : 'Show numbers'}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '0.6rem' }}>
          {documents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              <FolderLock size={40} style={{ opacity: 0.4, marginBottom: '0.75rem' }} />
              <p>No documents stored yet.</p>
            </div>
          ) : (
            documents.map(doc => {
              const typeInfo = DOCUMENT_TYPE_LABELS[doc.documentType];
              const maskedNumber = formatMasked(doc.documentNumber, doc.documentType);
              return (
                <Card key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', padding: '0.9rem' }}>
                  <div style={{ flexGrow: 1, minWidth: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                      <typeInfo.icon size={14} style={{ color: typeInfo.color }} />
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginLeft: '0.3rem' }}>
                        <Badge variant="info">{typeInfo.label}</Badge>
                      </span>
                    </div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.35rem' }}>{titleFallback(doc.title, doc.documentType)}</h3>
                    {doc.documentNumber && (
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                        <span style={{ fontWeight: 600 }}>{doc.documentType === 'bank' ? 'Account' : 'Number'}:</span> {maskedNumber}
                      </p>
                    )}
                    {doc.issuingAuthority && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
                        Issued by: {doc.issuingAuthority}
                      </p>
                    )}
                    {doc.expiryDate && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
                        Expires: {new Date(doc.expiryDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => handleEditDocument(doc)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color-default)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                      <Edit size={14} /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteDocument(doc.id)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color-default)', background: 'var(--bg-surface)', color: 'var(--text-danger)', fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </Card>

      <Card style={{ border: '1px dashed var(--border-color-default)', background: 'var(--color-brand-primary-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <FileText size={24} style={{ color: 'var(--color-brand-primary)', flexShrink: 0, marginTop: '2px' }} />
          <div style={{ flexGrow: 1 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.3rem' }}>Add a document reference</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 0.8rem' }}>
              Store identifying details only. Do not upload scanned copies — NIRBHAYA keeps text references locally on your device.
            </p>
            <form onSubmit={e => { e.preventDefault(); (editingId ? handleUpdateDocument : handleAddDocument)(); }} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                <Input
                  placeholder="Title (e.g. My Aadhaar Card)"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
                <select
                  value={documentType}
                  onChange={e => setDocumentType(e.target.value as DocumentType)}
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color-default)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}
                >
                  {Object.entries(DOCUMENT_TYPE_LABELS).map(([key, info]) => (
                    <option key={key} value={key}>{info.label}</option>
                  ))}
                </select>
              </div>
              <Input
                placeholder="Document number (masked on view)"
                value={documentNumber}
                onChange={e => setDocumentNumber(e.target.value)}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                <Input
                  placeholder="Issuing authority"
                  value={issuingAuthority}
                  onChange={e => setIssuingAuthority(e.target.value)}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Issue date</label>
                  <input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color-default)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }} />
                </div>
              </div>
              <Input
                placeholder="Expiry date"
                value={expiryDate}
                onChange={e => setExpiryDate(e.target.value)}
                type="date"
              />
              <Input
                placeholder="Notes (optional)"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => { resetForm(); setIsFormOpen(false); setEditingId(null); }}
                  style={{ padding: '0.625rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color-default)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <Button type="submit" variant="primary" size="md">
                  {editingId ? 'Update document' : 'Add document'}
                </Button>
              </div>
            </form>
          </div>
        </div>
        {isFormOpen ? null : (
          <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-brand-primary)', fontWeight: 600, fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <Plus size={14} /> Add document
            </button>
          </div>
        )}
      </Card>

      <Alert type="warning" title="Security notice">
        This vault is protected by your account password. Documents exist only in your browser’s local storage — they are not synced to any server. If you clear browser data or uninstall, these records will be lost. Keep physical copies of your original documents in a safe place.
      </Alert>
    </div>
  );
};

const titleFallback = (title: string, type: DocumentType) => title || DOCUMENT_TYPE_LABELS[type].label;
