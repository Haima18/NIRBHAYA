import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Lock, Mail, Phone, User } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { AuthShell } from '@/components/layout/AuthShell';
import { useAuth } from '@/hooks/useAuth';

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Please enter your name or preferred alias.');
      return;
    }
    if (!email || !email.includes('@')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('Please enter your phone number.');
      return;
    }
    const phoneDigits = phone.replace(/\D/g, '');
    if (!/^\+?[0-9\s().-]+$/.test(phone.trim()) || phoneDigits.length < 7 || phoneDigits.length > 15) {
      setErrorMessage('Please enter a valid phone number.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Password must contain at least 8 characters.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signup(name, email, phone, password);
      if (result.success) {
        navigate('/');
      } else {
        setErrorMessage(result.error || 'Registration could not be completed.');
      }
    } catch {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="A place of your own"
      title={<>Create your <em>safe space.</em></>}
      description="An account keeps your session secure and opens the full sanctuary: private records, consent-based sharing, journey check-ins, and support routes."
      points={[
        'Passwords are hashed by the backend and never stored in the browser',
        'Sample directories and unconfigured services stay clearly labelled',
        'You can export or delete your account from Settings'
      ]}
    >
      <p className="auth-card__eyebrow">Join NIRBHAYA</p>
      <h2>Register to continue</h2>
      <p className="auth-card__intro">
        Add your details to secure your private safety dashboard. You can use an alias instead of your legal name.
      </p>

      {errorMessage && (
        <div style={{ marginBottom: '1rem' }}>
          <Alert type="danger" title="Registration notice">
            {errorMessage}
          </Alert>
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="ui-field">
          <label className="ui-label" htmlFor="signupName">Name or alias</label>
          <div className="auth-input">
            <User size={17} aria-hidden="true" />
            <input
              id="signupName"
              className="ui-input"
              type="text"
              required
              autoComplete="nickname"
              placeholder="e.g. Ananya"
              value={name}
              onChange={event => setName(event.target.value)}
            />
          </div>
        </div>

        <div className="ui-field">
          <label className="ui-label" htmlFor="signupEmail">Email address</label>
          <div className="auth-input">
            <Mail size={17} aria-hidden="true" />
            <input
              id="signupEmail"
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
          <label className="ui-label" htmlFor="signupPhone">Phone number</label>
          <div className="auth-input">
            <Phone size={17} aria-hidden="true" />
            <input
              id="signupPhone"
              className="ui-input"
              type="tel"
              required
              autoComplete="tel"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={event => setPhone(event.target.value)}
            />
          </div>
        </div>

        <div className="ui-field">
          <label className="ui-label" htmlFor="signupPassword">Password</label>
          <div className="auth-input auth-input--password">
            <Lock size={17} aria-hidden="true" />
            <input
              id="signupPassword"
              className="ui-input"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="At least 8 characters"
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
          <span className="ui-help">Use at least 8 characters. A longer phrase is easier to remember.</span>
        </div>

        <Button
          className="auth-submit"
          variant="primary"
          size="lg"
          type="submit"
          isLoading={isLoading}
          rightIcon={<ArrowRight size={17} />}
        >
          Create my account
        </Button>
      </form>

      <div className="auth-links">
        <p>
          Already registered? <Link to="/login">Sign in</Link>
        </p>
        <p>
          <Link to="/welcome">Return to the sanctuary</Link>
        </p>
      </div>
    </AuthShell>
  );
};

export default SignUpPage;
