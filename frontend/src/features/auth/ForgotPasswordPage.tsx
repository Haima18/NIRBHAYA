import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, KeyRound, AlertTriangle } from 'lucide-react';
import { QuickExitBar } from '@/components/layout/QuickExitBar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0e0a1a', color: '#fff' }}>
      <QuickExitBar />
      <main style={{ flexGrow: 1, display: 'grid', placeItems: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '480px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(222,203,254,.2)', borderRadius: '20px', padding: '2rem' }}>
          <KeyRound size={30} color="#c5a3fc" />
          <h1 className="font-serif" style={{ fontSize: '1.8rem', margin: '0.75rem 0 0.4rem' }}>Reset your password</h1>
          <p style={{ color: '#c5a3fc', fontSize: '0.88rem', lineHeight: 1.5 }}>
            Enter the email on your account. We will create a single-use reset token that expires in 30 minutes.
          </p>

          {message && <div style={{ margin: '1rem 0' }}><Alert type="success" title="Request received">{message}</Alert></div>}
          {error && <div style={{ margin: '1rem 0' }}><Alert type="danger" title="Request failed">{error}</Alert></div>}
          {devToken && (
            <div style={{ margin: '1rem 0' }}>
              <Alert type="warning" title="Development-only reset token">
                Email delivery is not configured. This token is shown only because the server has development token exposure enabled. Never enable this on a public deployment.
                <div style={{ marginTop: '0.5rem', wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.78rem' }}>{devToken}</div>
                <Link to={`/reset-password?token=${encodeURIComponent(devToken)}`} style={{ display: 'inline-block', marginTop: '0.6rem', color: '#fff', fontWeight: 700 }}>
                  Continue to reset form →
                </Link>
              </Alert>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <Input label="Email address" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@domain.com" />
            <Button variant="primary" type="submit" isLoading={loading} leftIcon={<Mail size={18} />}>
              Create reset token
            </Button>
          </form>

          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '1.25rem', color: '#decbfe', fontSize: '0.85rem' }}>
            <ArrowLeft size={15} /> Back to sign in
          </Link>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.4rem', color: '#9d8ac7', fontSize: '0.75rem' }}>
            <AlertTriangle size={14} /> If email is not configured, use the development token shown above or contact the deployment operator.
          </div>
        </div>
      </main>
    </div>
  );
};
