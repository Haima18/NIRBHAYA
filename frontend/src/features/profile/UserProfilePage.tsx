import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Shield,
  ShieldCheck,
  Lock,
  Phone,
  Mail,
  Key,
  Globe,
  Download,
  LogOut,
  Sparkles,
  CheckCircle,
  EyeOff,
  FolderLock,
  Users,
  Compass
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { ButterflyMotif } from '@/components/ui/ButterflyMotif';
import { useAuth } from '@/hooks/useAuth';
import { storageService } from '@/services/storage/storageService';
import { INDIAN_LANGUAGES } from '@/constants/languages';
import { useTranslation } from '@/localization/useTranslation';

export const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useAuth();
  const { isFullyTranslated, language: selectedLanguage, t } = useTranslation();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [codeWord, setCodeWord] = useState(user?.emergencyCodeWord || '');
  const [pin, setPin] = useState(user?.emergencyPin || '');
  const [quickExitUrl, setQuickExitUrl] = useState(user?.quickExitUrl || 'https://www.accuweather.com');
  const [language, setLanguage] = useState(user?.preferredLanguage || 'English');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Stats from application state
  const incidents = storageService.getIncidents();
  const contacts = storageService.getTrustedContacts();
  const plans = storageService.getPathwayPlans();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    try {
      await updateProfile({
        name,
        email,
        phone,
        bio,
        emergencyCodeWord: codeWord,
        emergencyPin: pin,
        quickExitUrl,
        preferredLanguage: language
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'Unable to save your profile.');
    }
  };

  const handleLogout = async () => {
    setProfileError(null);
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'Unable to sign out.');
    }
  };

  const handleExportData = () => {
    const data = storageService.exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nirbhaya_profile_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* 1. Serene Lavender Profile Banner with Glowing Butterfly */}
      <div
        style={{
          borderRadius: '24px',
          background: 'linear-gradient(135deg, #1f143d 0%, #2e1856 50%, #421d74 100%)',
          padding: 'var(--space-8)',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(222, 203, 254, 0.25)',
          boxShadow: '0 12px 30px rgba(79, 35, 145, 0.15)'
        }}
      >
        {/* Ambient Twilight Glow */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '350px',
            height: '350px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(168, 118, 248, 0.35) 0%, rgba(139, 79, 240, 0) 70%)',
            filter: 'blur(40px)',
            pointerEvents: 'none'
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {/* Monogram Avatar with Glowing Ring */}
            <div
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #a876f8 0%, #7434d8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 24px rgba(197, 163, 252, 0.6)',
                border: '3px solid #ede4ff',
                fontSize: '2.2rem',
                fontWeight: 700,
                color: '#ffffff'
              }}
            >
              {name.charAt(0).toUpperCase()}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                <h1
                  className="font-serif"
                  style={{ fontSize: '2rem', fontWeight: 600, color: '#ffffff', margin: 0 }}
                >
                  {name}
                </h1>
                <Badge variant="success">Sanctuary Protected</Badge>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#decbfe', margin: 0 }}>
                {email} • Member since {user?.joinedDate || 'October 2026'}
              </p>
              <p style={{ fontSize: '0.8rem', color: '#c5a3fc', fontStyle: 'italic', marginTop: '4px' }}>
                &ldquo;{bio}&rdquo;
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <ButterflyMotif size={68} glowColor="rgba(222, 203, 254, 0.8)" />
            <Button
              variant="outline"
              size="md"
              onClick={handleLogout}
              leftIcon={<LogOut size={16} />}
              style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)', backgroundColor: 'rgba(255,255,255,0.08)' }}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {saveSuccess && (
        <Alert type="success" title="Profile Saved">
          Your profile and discretion settings have been successfully updated.
        </Alert>
      )}
      {profileError && <Alert type="danger" title="Profile update failed">{profileError}</Alert>}

      {/* 2. Security Health & Protection Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
        <Card variant="highlight">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: 'var(--color-brand-primary-light)', color: 'var(--color-brand-primary)' }}>
              <Users size={22} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Trusted Circle
              </span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                {contacts.length} Contacts
              </h3>
            </div>
          </div>
        </Card>

        <Card variant="highlight">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: 'var(--color-brand-secondary-light)', color: 'var(--color-brand-secondary)' }}>
              <FolderLock size={22} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Evidence Vault
              </span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                {incidents.length} Records
              </h3>
            </div>
          </div>
        </Card>

        <Card variant="highlight">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: 'var(--color-info-light)', color: 'var(--color-info)' }}>
              <Compass size={22} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Active Pathways
              </span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                {plans.length} Action Plans
              </h3>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. Profile Information & Safety Settings Form */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--space-6)' }}>
        {/* Personal Details */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <User size={20} color="var(--color-brand-primary)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, margin: 0 }}>
              Personal Details & Identity
            </h3>
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Input
              label="Display Name or Confidential Alias"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />

            <Input
              label="Account Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />

            <Input
              label="Primary Phone Number"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Personal Bio / Affirmation:
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={e => setBio(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color-default)',
                  backgroundColor: 'var(--bg-surface)',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Preferred Interface Language:
              </label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color-default)',
                  backgroundColor: 'var(--bg-surface)'
                }}
              >
                {INDIAN_LANGUAGES.map(item => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
              {!isFullyTranslated && (
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {selectedLanguage} is saved as your preference. {t('languagePhaseNotice')}
                </p>
              )}
            </div>

            <Button variant="primary" type="submit" style={{ marginTop: '0.5rem' }}>
              Save Profile Information
            </Button>
          </form>
        </Card>

        {/* Safety & Discretion Controls */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Key size={20} color="var(--color-brand-primary)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, margin: 0 }}>
              Discretion & Distress Safeguards
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Input
              label="Secret Distress Code Word"
              helperText="Harmless phrase to text trusted contacts that secretly signals 'Call 112 for me'."
              value={codeWord}
              onChange={e => setCodeWord(e.target.value)}
            />

            <Input
              label="Emergency Duress PIN"
              helperText="Private 4-digit PIN used to authenticate sensitive evidence deletion."
              value={pin}
              onChange={e => setPin(e.target.value)}
            />

            <Input
              label="Quick Exit URL Target"
              helperText="The neutral website NIRBHAYA immediately redirects to on ESC or quick exit."
              value={quickExitUrl}
              onChange={e => setQuickExitUrl(e.target.value)}
            />

            <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color-default)' }}>
              <Button
                variant="outline"
                size="md"
                onClick={handleExportData}
                leftIcon={<Download size={18} />}
                style={{ width: '100%' }}
              >
                Download Complete Account Backup (JSON)
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
