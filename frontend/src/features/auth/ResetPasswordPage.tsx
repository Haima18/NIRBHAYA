import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { AuthShell } from '@/components/layout/AuthShell';
import { authService } from '@/services/auth/authService';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError('The two passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword(token.trim(), password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1800);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to reset the password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Account recovery"
      title={<>Choose something <em>only you know.</em></>}
      description="Reset tokens are single-use and expire after 30 minutes. A password must contain at least 8 characters."
      points={[
        'Your new password is hashed by the backend',
        'Existing sessions may need to sign in again',
        'Use a unique passphrase you have not used elsewhere'
      ]}
    >
      <div className="auth-card__icon"><Lock size={20} /></div>
      <p className="auth-card__eyebrow">New password</p>
      <h2>Choose a new password</h2>
      <p className="auth-card__intro">
        Paste the token from your reset email, then set a password of at least 8 characters.
      </p>

      {success && (
        <div style={{ marginBottom: '1rem' }}>
          <Alert type="success" title="Password updated">Taking you to the sign-in page…</Alert>
        </div>
      )}
      {error && (
        <div style={{ marginBottom: '1rem' }}>
          <Alert type="danger" title="Reset failed">{error}</Alert>
        </div>
      )}

      {!success && (
        <form className="auth-form" onSubmit={handleSubmit}>
          <Input
            label="Reset token"
            value={token}
            onChange={event => setToken(event.target.value)}
            required
            placeholder="Paste the single-use token"
          />
          <Input
            label="New password"
            type="password"
            value={password}
            onChange={event => setPassword(event.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            helperText="At least 8 characters."
          />
          <Input
            label="Confirm new password"
            type="password"
            value={confirm}
            onChange={event => setConfirm(event.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
          <Button variant="primary" type="submit" isLoading={loading} leftIcon={<Lock size={17} />}>
            Set new password
          </Button>
        </form>
      )}

      <div className="auth-links">
        <p>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <ArrowLeft size={14} aria-hidden="true" /> Back to sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
};

export default ResetPasswordPage;
