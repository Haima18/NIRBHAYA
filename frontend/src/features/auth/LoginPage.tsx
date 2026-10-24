import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { AuthShell } from '@/components/layout/AuthShell';
import { useAuth } from '@/hooks/useAuth';

/** Only internal, single-slash paths may be used as a post-login destination. */
function safeInternalPath(value: unknown): string {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : '/';
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const intendedPath = safeInternalPath((location.state as { from?: unknown } | null)?.from);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const result = await login(email, password, rememberMe);
      if (result.success) {
        navigate(intendedPath, { replace: true });
      } else {
        setErrorMessage(result.error || 'Invalid email or password.');
      }
    } catch {
      setErrorMessage('An unexpected error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Welcome back"
      title={<>Return to your <em>sanctuary.</em></>}
      description="Your tools, records, and choices are waiting exactly where you left them. Sign in only on a device you trust."
      points={[
        'Incident notes and trusted contacts stay in this browser',
        'Location sharing is consent-gated and revocable',
        'Emergency shortcuts never require an account'
      ]}
    >
      <p className="auth-card__eyebrow">Secure access</p>
      <h2>Sign in to NIRBHAYA</h2>
      <p className="auth-card__intro">
        Use the email and password you registered with. Sessions are held by the NIRBHAYA backend, not a social login
        provider.
      </p>

      {errorMessage && (
        <div style={{ marginBottom: '1rem' }}>
          <Alert type="danger" title="Sign-in failed">
            {errorMessage}
          </Alert>
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="ui-field">
          <label className="ui-label" htmlFor="loginEmail">Email address</label>
          <div className="auth-input">
            <Mail size={17} aria-hidden="true" />
            <input
              id="loginEmail"
              className="ui-input"
              type="email"
              required
              autoComplete="email"
              placeholder="you@domain.com"
              value={email}
              onChange={event => setEmail(event.target.value)}
            />
          </div>
        </div>

        <div className="ui-field">
          <label className="ui-label" htmlFor="loginPassword">Password</label>
          <div className="auth-input auth-input--password">
            <Lock size={17} aria-hidden="true" />
            <input
              id="loginPassword"
              className="ui-input"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              placeholder="Your password"
              value={password}
              onChange={event => setPassword(event.target.value)}
            />
            <button
              type="button"
              className="auth-input__toggle"
              onClick={() => setShowPassword(previous => !previous)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        <div className="auth-row">
          <label className="auth-check">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={event => setRememberMe(event.target.checked)}
            />
            Keep me signed in here
          </label>
          <Link to="/forgot-password">Forgot password?</Link>
        </div>

        <Button
          className="auth-submit"
          variant="primary"
          size="lg"
          type="submit"
          isLoading={isLoading}
          rightIcon={<ArrowRight size={17} />}
        >
          Enter your safe space
        </Button>
      </form>

      <div className="auth-links">
        <p>
          New to NIRBHAYA? <Link to="/signup">Create your account</Link>
        </p>
        <p>
          <Link to="/welcome">Return to the sanctuary</Link>
        </p>
      </div>
    </AuthShell>
  );
};

export default LoginPage;
