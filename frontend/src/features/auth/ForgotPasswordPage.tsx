import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, KeyRound, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { AuthShell } from '@/components/layout/AuthShell';
import { authService } from '@/services/auth/authService';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [devToken, setDevToken] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    setDevToken(null);
    try {
      const response = await authService.forgotPassword(email);
      setMessage(response.message || 'If an account exists for that email, a reset link has been created.');
      if (response.devResetToken) setDevToken(response.devResetToken);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to request a reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Account recovery"
      title={<>A way back <em>in.</em></>}
      description="Recovery uses a single-use token that expires after 30 minutes. Email delivery is only available when the deployment operator has configured it."
      points={[
        'Reset tokens are single-use and time-limited',
        'No password is ever sent to you by email',
        'If email is not configured, the server may show a development-only token'
      ]}
    >
      <div className="auth-card__icon"><KeyRound size={20} /></div>
      <p className="auth-card__eyebrow">Password reset</p>
      <h2>Reset your password</h2>
      <p className="auth-card__intro">
        Enter the email on your account. If an account exists, the server creates a single-use reset token valid for
        30 minutes.
      </p>

      {message && (
        <div style={{ marginBottom: '1rem' }}>
          <Alert type="success" title="Request received">{message}</Alert>
        </div>
      )}
      {error && (
        <div style={{ marginBottom: '1rem' }}>
          <Alert type="danger" title="Request failed">{error}</Alert>
        </div>
      )}
      {devToken && (
        <div style={{ marginBottom: '1rem' }}>
          <Alert type="warning" title="Development-only reset token">
            Email delivery is not configured. This token is shown only because the server has development token
            exposure enabled. Never enable this on a public deployment.
            <div className="auth-token">{devToken}</div>
            <Link
              to={`/reset-password?token=${encodeURIComponent(devToken)}`}
              style={{ display: 'inline-block', marginTop: '0.6rem', fontWeight: 700 }}
            >
              Continue to reset form →
            </Link>
          </Alert>
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        <Input
          label="Email address"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={event => setEmail(event.target.value)}
          placeholder="you@domain.com"
        />
        <Button variant="primary" type="submit" isLoading={loading} leftIcon={<Mail size={17} />}>
          Create reset token
        </Button>
      </form>

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

export default ForgotPasswordPage;
