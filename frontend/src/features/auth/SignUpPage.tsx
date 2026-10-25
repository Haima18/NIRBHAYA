import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Lock, Mail, Phone, User, CheckCircle2, AlertCircle } from 'lucide-react';
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
  // DEMO: phone/email ownership verification simulation (not a real OTP gateway)
  const [demoOtpStep, setDemoOtpStep] = useState<'none' | 'sent' | 'verified'>('none');
  const [demoOtpCode, setDemoOtpCode] = useState('');
  const [demoOtpNotice, setDemoOtpNotice] = useState<string | null>(null);

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

  // DEMO: simulated phone OTP verification — no real SMS gateway is connected.
  const handleSendDemoOtp = async () => {
    if (!phone.trim()) {
      setDemoOtpNotice('Please enter a phone number first.');
      return;
    }
    const phoneDigits = phone.replace(/\D/g, '');
    if (!/^\+?[0-9\s().-]+$/.test(phone.trim()) || phoneDigits.length < 7 || phoneDigits.length > 15) {
      setDemoOtpNotice('Please enter a valid phone number.');
      return;
    }
    setDemoOtpNotice(null);
    setDemoOtpStep('sent');
    setDemoOtpCode('');
  };

  const handleVerifyDemoOtp = () => {
    // Demo accepts any 6-digit code as a simulation only.
    if (/^\d{6}$/.test(demoOtpCode)) {
      setDemoOtpStep('verified');
      setDemoOtpNotice(null);
    } else {
      setDemoOtpNotice('Enter a 6-digit code for the demo simulation.');
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

      {/* DEMO: simulated phone/email ownership verification — clearly labeled */}
      <div style={{ marginTop: '1.5rem', padding: '1rem', border: '1px dashed var(--color-brand-primary)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-brand-primary-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <AlertCircle size={16} color="var(--color-brand-primary)" />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-brand-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Demo verification simulation
          </span>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
          NIRBHAYA does not send real OTPs or verify email/phone ownership. This simulation shows what an ownership-verification
          step would look like once an SMS/email gateway is connected. Accepts any 6-digit code as a demo only.
        </p>
        {demoOtpStep === 'none' && (
          <Button
            variant="outline"
            size="md"
            onClick={handleSendDemoOtp}
            leftIcon={<Phone size={16} />}
            disabled={!phone.trim()}
          >
            Send demo OTP to {phone.trim() || 'your phone'}
          </Button>
        )}
        {demoOtpStep === 'sent' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              A demo code has been "sent" to {phone}. Enter any 6 digits to simulate verification.
            </p>
            <input
              type="text"
              maxLength={6}
              value={demoOtpCode}
              onChange={e => setDemoOtpCode(e.target.value.replace(/\D/g, ''))}
              style={{
                width: '120px',
                padding: '0.6rem',
                fontSize: '1.1rem',
                letterSpacing: '0.25em',
                textAlign: 'center',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color-default)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)'
              }}
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button variant="primary" size="sm" onClick={handleVerifyDemoOtp} leftIcon={<CheckCircle2 size={16} />}>
                Verify demo code
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setDemoOtpStep('none')}>Cancel</Button>
            </div>
            {demoOtpNotice && <p style={{ fontSize: '0.75rem', color: 'var(--color-danger)' }}>{demoOtpNotice}</p>}
          </div>
        )}
        {demoOtpStep === 'verified' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={18} color="var(--color-success)" />
            <span style={{ fontSize: '0.85rem', color: 'var(--color-success)', fontWeight: 600 }}>
              Demo phone verification complete (simulation only)
            </span>
          </div>
        )}
      </div>

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
