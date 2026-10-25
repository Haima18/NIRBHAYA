import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Download,
  Trash2,
  Globe,
  AlertTriangle,
  Lock,
  LogOut,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { storageService } from '@/services/storage/storageService';
import { captureStorageService } from '@/services/storage/captureStorageService';
import { aiService, AiStatus } from '@/services/ai/aiService';
import { UserProfile } from '@/types';
import { INDIAN_LANGUAGES } from '@/constants/languages';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/localization/useTranslation';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile, updatePreferences, changePassword, deleteAccount, logout } = useAuth();
  const { isFullyTranslated, language, t } = useTranslation();

  const [profile, setProfile] = useState<UserProfile>(() => user || storageService.getProfile());
  const [saveNotice, setSaveNotice] = useState(false);
  const [localWipeNotice, setLocalWipeNotice] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [aiStatus, setAiStatus] = useState<AiStatus | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordNotice, setPasswordNotice] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    void aiService.getStatus().then(status => {
      if (mounted) setAiStatus(status);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (user) setProfile(user);
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotice(null);
    try {
      const saved = await updateProfile({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        bio: profile.bio,
        quickExitUrl: profile.quickExitUrl,
        preferredLanguage: profile.preferredLanguage
      });
      setProfile(saved);
      setSaveNotice(true);
      setTimeout(() => setSaveNotice(false), 3000);
    } catch (error) {
      setErrorNotice(error instanceof Error ? error.message : 'Unable to save account settings.');
    }
  };

  const updateConsent = async (key: 'aiProcessingConsent' | 'locationConsent' | 'discreetMode', value: boolean) => {
    const previous = profile;
    const updated = { ...profile, [key]: value };
    setProfile(updated);
    setErrorNotice(null);

    try {
      if (key === 'locationConsent' && value) {
        if (!('geolocation' in navigator)) {
          throw new Error('This browser does not support geolocation permission requests.');
        }

        await new Promise<void>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            () => resolve(),
            error => {
              let message = 'Location permission was denied.';
              if (error.code === error.POSITION_UNAVAILABLE) {
                message = 'Location information is currently unavailable in this browser.';
              } else if (error.code === error.TIMEOUT) {
                message = 'The location request timed out. Please try again.';
              }
              reject(new Error(message));
            },
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
          );
        });
      }

      const saved = await updatePreferences({ [key]: value });
      setProfile(saved);
    } catch (error) {
      setProfile(previous);
      setErrorNotice(error instanceof Error ? error.message : 'Unable to update this preference.');
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

  const handleWipeLocalData = async () => {
    const confirmed = window.confirm(
      'This clears incidents, contacts, plans, checklists, and locally captured photos/videos stored for this account in this browser. It does not delete your account or server data. Continue?'
    );
    if (!confirmed) return;
    storageService.wipeAllData();
    try {
      await captureStorageService.clear(user?.id || 'guest');
      setLocalWipeNotice(true);
    } catch (error) {
      setErrorNotice(error instanceof Error ? error.message : 'Could not clear all local records.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordNotice(null);
    if (newPassword.length < 8) {
      setPasswordError('Use at least 8 characters for the new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('The new passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordNotice('Password changed. Existing signed-in browser sessions are not revoked automatically.');
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'Unable to change the password.');
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);
    if (deleteConfirmText.trim().toUpperCase() !== 'DELETE') {
      setDeleteError('Type DELETE to confirm account deletion.');
      return;
    }
    setDeleteBusy(true);
    try {
      await deleteAccount(deletePassword);
      navigate('/login', { replace: true });
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Unable to delete the account.');
    } finally {
      setDeleteBusy(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      setErrorNotice(error instanceof Error ? error.message : 'Unable to sign out.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--text-primary)' }}>
          Account, Privacy & Discretion Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
          Manage server-backed preferences, your password, local records, and account deletion.
        </p>
      </div>

      {saveNotice && (
        <Alert type="success" title="Settings saved">
          Your profile and preferences were saved to your account.
        </Alert>
      )}
      {localWipeNotice && (
        <Alert type="warning" title="Local records cleared">
          Records and locally captured media for this account were removed from this browser. Your account and any server-backed location shares were not deleted.
        </Alert>
      )}
      {errorNotice && <Alert type="danger" title="Settings action failed">{errorNotice}</Alert>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
        {/* Profile & quick exit */}
        <Card>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Profile & Quick Exit
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Configure how NIRBHAYA identifies you and where Quick Exit redirects.
          </p>

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Input
              label="Display name / alias"
              value={profile.name}
              onChange={e => setProfile({ ...profile, name: e.target.value })}
              required
              autoComplete="name"
            />

            <Input
              label="Contact email"
              type="email"
              value={profile.email}
              onChange={e => setProfile({ ...profile, email: e.target.value })}
              required
              autoComplete="email"
            />

            <Input
              label="Phone number"
              type="tel"
              value={profile.phone || ''}
              onChange={e => setProfile({ ...profile, phone: e.target.value })}
              autoComplete="tel"
              required
            />

            <Input
              label="Quick Exit URL"
              helperText="Quick Exit opens this neutral site. It does not clear your browser history."
              value={profile.quickExitUrl}
              onChange={e => setProfile({ ...profile, quickExitUrl: e.target.value })}
              type="url"
            />

            <div>
              <label htmlFor="settings-language" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Preferred language
              </label>
              <select
                id="settings-language"
                value={profile.preferredLanguage}
                onChange={e => setProfile({ ...profile, preferredLanguage: e.target.value })}
                style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color-default)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}
              >
                {INDIAN_LANGUAGES.map(item => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
              {!isFullyTranslated && (
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {language} is saved as your preference. {t('languagePhaseNotice')}
                </p>
              )}
            </div>

            <Button variant="primary" type="submit" style={{ marginTop: '0.5rem' }}>
              Save profile changes
            </Button>
          </form>
        </Card>

        {/* Security */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Lock size={18} color="var(--color-brand-primary)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, margin: 0 }}>
              Password & account security
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            NIRBHAYA stores a salted password hash on the server. It does not offer a duress PIN, hidden code word, or
            automatic emergency dispatch.
          </p>

          {passwordNotice && <Alert type="success" title="Password changed">{passwordNotice}</Alert>}
          {passwordError && <Alert type="danger" title="Password change failed">{passwordError}</Alert>}

          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: passwordNotice || passwordError ? '1rem' : 0 }}>
            <Input
              label="Current password"
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <Input
              label="New password"
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              helperText="At least 8 characters."
              autoComplete="new-password"
              required
            />
            <Input
              label="Confirm new password"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            <Button variant="primary" type="submit" disabled={busy}>
              {busy ? 'Changing password...' : 'Change password'}
            </Button>
          </form>

          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color-default)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Forgot your password? Request a reset link. Email delivery may not be configured on this deployment, in
              which case no email can be sent.
            </p>
            <Link to="/forgot-password" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              Request a password reset
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout} leftIcon={<LogOut size={16} />} style={{ alignSelf: 'flex-start' }}>
              Sign out
            </Button>
          </div>
        </Card>

        {/* Privacy & AI consent */}
        <Card style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Globe size={18} color="var(--color-brand-primary)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, margin: 0 }}>
              Privacy safeguards & external AI consent
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Preferences are stored on your account. Incidents, contacts, and plans remain in this browser.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color-default)' }}>
              <input
                type="checkbox"
                id="externalAiToggle"
                checked={profile.aiProcessingConsent}
                onChange={e => void updateConsent('aiProcessingConsent', e.target.checked)}
                style={{ marginTop: '4px', width: '18px', height: '18px' }}
              />
              <label htmlFor="externalAiToggle" style={{ fontSize: '0.85rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                <strong>Allow external AI processing</strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  When enabled and a provider key is configured on the server, AI Assistant messages may be sent to that
                  provider. Otherwise the local guidance engine is used. Consent alone does not create a provider
                  connection.
                </p>
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color-default)' }}>
              <Cpu size={16} style={{ marginTop: '4px', color: 'var(--text-muted)' }} />
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <strong>AI provider status:</strong>{' '}
                {aiStatus
                  ? aiStatus.externalAiConfigured
                    ? `Configured (${aiStatus.providers.join(', ')})`
                    : 'Not configured — local guidance engine only'
                  : 'Status unavailable (backend not reachable)'}
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  The local engine gives static safety guidance. It is not a lawyer, therapist, or emergency dispatcher.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color-default)' }}>
              <input
                type="checkbox"
                id="locationConsentToggle"
                checked={profile.locationConsent}
                onChange={e => void updateConsent('locationConsent', e.target.checked)}
                style={{ marginTop: '4px', width: '18px', height: '18px' }}
              />
              <label htmlFor="locationConsentToggle" style={{ fontSize: '0.85rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                <strong>Allow browser location access</strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  Required for server-backed SOS location and location shares. Journey Guardian and the map lookup also
                  request your position directly from the browser. NIRBHAYA never tracks you in the background, and the
                  browser asks for permission each time.
                </p>
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color-default)' }}>
              <input
                type="checkbox"
                id="discreetModeToggle"
                checked={profile.discreetMode}
                onChange={e => void updateConsent('discreetMode', e.target.checked)}
                style={{ marginTop: '4px', width: '18px', height: '18px' }}
              />
              <label htmlFor="discreetModeToggle" style={{ fontSize: '0.85rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                <strong>Discreet mode</strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  Reduces some on-screen identifiers. It is not a disguise, does not hide the app from another person,
                  and does not clear your browser history.
                </p>
              </label>
            </div>
          </div>
        </Card>

        {/* Local data */}
        <Card variant="danger" style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <ShieldCheck size={18} color="var(--color-danger-hover)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--color-danger-hover)', margin: 0 }}>
              Local data export & erasure
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.45 }}>
            Export the records stored in this browser as JSON, or clear them. Clearing local data does not delete your
            account, server preferences, or server-backed location shares.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Button variant="outline" size="md" onClick={handleExportData} leftIcon={<Download size={18} />}>
              Export local data (JSON)
            </Button>
            <Button variant="danger" size="md" onClick={handleWipeLocalData} leftIcon={<Trash2 size={18} />}>
              Clear local records
            </Button>
          </div>
        </Card>

        {/* Account deletion */}
        <Card variant="danger" style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <AlertTriangle size={18} color="var(--color-danger-hover)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--color-danger-hover)', margin: 0 }}>
              Delete account permanently
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.45 }}>
            This removes your account, password hash, preferences, and server-backed location shares, and clears local
            records on this device. It cannot be undone. If you share a device and need to leave quickly, use Quick Exit
            and clear local records instead.
          </p>

          {deleteError && <Alert type="danger" title="Account deletion failed">{deleteError}</Alert>}

          <form onSubmit={handleDeleteAccount} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '460px', marginTop: deleteError ? '1rem' : 0 }}>
            <Input
              label="Current password"
              type="password"
              value={deletePassword}
              onChange={e => setDeletePassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <Input
              label="Type DELETE to confirm"
              value={deleteConfirmText}
              onChange={e => setDeleteConfirmText(e.target.value)}
              required
            />
            <Button variant="danger" type="submit" disabled={deleteBusy}>
              {deleteBusy ? 'Deleting account...' : 'Delete my account permanently'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
