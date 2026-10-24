import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';
import { QuickExitBar } from '@/components/layout/QuickExitBar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0e0a1a', color: '#fff' }}>
      <QuickExitBar />
      <main style={{ flexGrow: 1, display: 'grid', placeItems: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '480px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(222,203,254,.2)', borderRadius: '20px', padding: '2rem' }}>
          <Lock size={30} color="#c5a3fc" />
          <h1 className="font-serif" style={{ fontSize: '1.8rem', margin: '0.75rem 0 0.4rem' }}>Choose a new password</h1>
          <p style={{ color: '#c5a3fc', fontSize: '0.88rem', lineHeight: 1.5 }}>
            Reset tokens are single-use and expire after 30 minutes. A password must contain at least 8 characters.
          </p>

          {success && <div style={{ marginTop: '1rem' }}><Alert type="success" title="Password updated">Taking you to the sign-in page…</Alert></div>}
          {error && <div style={{ marginTop: '1rem' }}><Alert type="danger" title="Reset failed">{error}</Alert></div>}

          {!success && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <Input label="Reset token" value={token} onChange={e => setToken(e.target.value)} required placeholder="Paste the single-use token" />
              <Input label="New password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
              <Input label="Confirm new password" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required minLength={8} autoComplete="new-password" />
              <Button variant="primary" type="submit" isLoading={loading} leftIcon={<Lock size={18} />}>
                Set new password
              </Button>
            </form>
          )}

          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '1.25rem', color: '#decbfe', fontSize: '0.85rem' }}>
            <ArrowLeft size={15} /> Back to sign in
          </Link>
        </div>
      </main>
    </div>
  );
};
