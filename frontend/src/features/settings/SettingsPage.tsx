import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Download,
  Trash2,
  Lock,
  Globe,
  CheckCircle,
  AlertTriangle,
  EyeOff
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { storageService } from '@/services/storage/storageService';
import { UserProfile } from '@/types';
import { INDIAN_LANGUAGES } from '@/constants/languages';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/localization/useTranslation';

export const SettingsPage: React.FC = () => {
  const { updateProfile, logout } = useAuth();
  const { isFullyTranslated, language, t } = useTranslation();
  const [profile, setProfile] = useState<UserProfile>(() => storageService.getProfile());
  const [saveNotice, setSaveNotice] = useState(false);
  const [wipeNotice, setWipeNotice] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const saved = await updateProfile(profile);
      setProfile(saved);
      setSaveNotice(true);
      setTimeout(() => setSaveNotice(false), 3000);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Unable to save account settings.');
    }
  };

  const handleExportData = () => {
    const jsonStr = storageService.exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nirbhaya_data_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleWipeAll = async () => {
    if (window.confirm('CRITICAL WARNING: This will permanently delete all stored incidents, journal logs, pathway plans, and profile settings from this browser. Proceed?')) {
      setErrorNotice(null);
      try {
        storageService.wipeAllData();
        await logout();
        setWipeNotice(true);
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (error) {
        setErrorNotice(error instanceof Error ? error.message : 'Unable to sign out before wiping local data.');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--text-primary)' }}>
          Account, Privacy & Discretion Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
          Manage your local profile, emergency quick-exit destination, AI cloud consent, and complete data export/wipe.
        </p>
      </div>

      {saveNotice && (
        <Alert type="success" title="Settings Saved">
          Your profile and security preferences have been updated.
        </Alert>
      )}

      {wipeNotice && (
        <Alert type="danger" title="Data Wiped">
          All local records and vault items have been permanently erased. Reloading clean state...
        </Alert>
      )}
      {errorNotice && <Alert type="danger" title="Settings action failed">{errorNotice}</Alert>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--space-6)' }}>
        {/* Profile & Discretion Card */}
        <Card>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Profile & Quick-Exit Pretext
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Configure how NIRBHAYA identifies you and where Quick-Exit redirects.
          </p>

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Input
              label="Display Name / Alias"
              value={profile.name}
              onChange={e => setProfile({ ...profile, name: e.target.value })}
              required
            />

            <Input
              label="Contact Email"
              type="email"
              value={profile.email}
              onChange={e => setProfile({ ...profile, email: e.target.value })}
              required
            />

            <Input
              label="Phone Number"
              type="tel"
              value={profile.phone || ''}
              onChange={e => setProfile({ ...profile, phone: e.target.value })}
            />

            <Input
              label="Quick Exit URL Target (Default: AccuWeather)"
              helperText="Clicking the top-bar Quick Exit button instantly redirects here."
              value={profile.quickExitUrl}
              onChange={e => setProfile({ ...profile, quickExitUrl: e.target.value })}
            />

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Preferred Language:
              </label>
              <select
                value={profile.preferredLanguage}
                onChange={e => setProfile({ ...profile, preferredLanguage: e.target.value })}
                style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color-default)' }}
              >
                {INDIAN_LANGUAGES.map(language => (
                  <option key={language.value} value={language.value}>{language.label}</option>
                ))}
              </select>
              {!isFullyTranslated && (
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {language} is saved as your preference. {t('languagePhaseNotice')}
                </p>
              )}
            </div>

            <Button variant="primary" type="submit" style={{ marginTop: '0.5rem' }}>
              Save Profile Changes
            </Button>
          </form>
        </Card>

        {/* Privacy & Cloud AI Consent */}
        <Card>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Privacy Safeguards & External AI Consent
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            NIRBHAYA enforces data minimization. Sensitive data stays on your device unless you explicitly opt in.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-app)',
                border: '1px solid var(--border-color-default)'
              }}
            >
              <input
                type="checkbox"
                id="externalAiToggle"
                checked={profile.aiProcessingConsent}
                onChange={e => {
                  const updated = { ...profile, aiProcessingConsent: e.target.checked };
                  setProfile(updated);
                  void updateProfile(updated).catch(error => {
                    window.alert(error instanceof Error ? error.message : 'Unable to update AI consent.');
                  });
                }}
                style={{ marginTop: '4px', width: '18px', height: '18px' }}
              />
              <label htmlFor="externalAiToggle" style={{ fontSize: '0.85rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                <strong>Allow External Cloud AI Processing (OpenAI / Gemini / Anthropic)</strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  When disabled, NIRBHAYA operates purely in offline rule-based heuristic mode with zero network calls.
                </p>
              </label>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-app)',
                border: '1px solid var(--border-color-default)'
              }}
            >
              <input
                type="checkbox"
                id="locationConsentToggle"
                checked={profile.locationConsent}
                onChange={e => {
                  const updated = { ...profile, locationConsent: e.target.checked };
                  setProfile(updated);
                  void updateProfile(updated).catch(error => {
                    window.alert(error instanceof Error ? error.message : 'Unable to update location consent.');
                  });
                }}
                style={{ marginTop: '4px', width: '18px', height: '18px' }}
              />
              <label htmlFor="locationConsentToggle" style={{ fontSize: '0.85rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                <strong>Allow Geolocation Coordinates for SOS & Journey Guardian</strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  Enables distance calculation to nearby Sakhi centres and emergency maps links in SMS alerts.
                </p>
              </label>
            </div>
          </div>
        </Card>

        {/* Data Portability & Complete Erasure */}
        <Card variant="danger" style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--color-danger-hover)', marginBottom: '0.5rem' }}>
            Data Portability & Complete Erasure
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.45 }}>
            Export all your personal documentation, incidents, and safety plans as a JSON archive, or execute an emergency local data wipe if you share a device with a controlling partner.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Button
              variant="outline"
              size="md"
              onClick={handleExportData}
              leftIcon={<Download size={18} />}
            >
              Export Complete Data Archive (JSON)
            </Button>

            <Button
              variant="danger"
              size="md"
              onClick={handleWipeAll}
              leftIcon={<Trash2 size={18} />}
            >
              Emergency Wipe All Records
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
