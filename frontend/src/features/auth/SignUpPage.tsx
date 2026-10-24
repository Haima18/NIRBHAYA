import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  ShieldAlert,
  Sparkles,
  User,
} from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { ButterflyMotif } from '@/components/ui/ButterflyMotif';
import { QuickExitBar } from '@/components/layout/QuickExitBar';
import { useAuth } from '@/hooks/useAuth';

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      const res = await signup(name, email, phone, password);
      if (res.success) {
        navigate('/');
      } else {
        setErrorMessage(res.error || 'Registration could not be completed.');
      }
    } catch {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0e0a1a' }}>
      <QuickExitBar />

      <div
        style={{
          flexGrow: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          minHeight: 'calc(100vh - var(--layout-quick-exit-height))',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #130c26 0%, #1f143d 40%, #31185a 85%, #421d74 100%)',
            padding: 'var(--space-12) var(--space-8)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            color: '#fdfaff',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '5%',
              right: '-10%',
              width: '450px',
              height: '450px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(168, 118, 248, 0.25) 0%, rgba(139, 79, 240, 0) 70%)',
              filter: 'blur(50px)',
              pointerEvents: 'none'
            }}
          />

          <div style={{ position: 'relative', zIndex: 2 }}>
            <Link to="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #a876f8 0%, #7434d8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 20px rgba(168, 118, 248, 0.5)'
                }}
              >
                <ShieldAlert size={22} color="#ffffff" />
              </div>
              <div>
                <span
                  style={{
                    fontSize: '1.4rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    color: '#ffffff',
                    display: 'block'
                  }}
                >
                  NIRBHAYA
                </span>
                <span style={{ fontSize: '0.7rem', color: '#c5a3fc', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Safety • Sanctuary • Voice
                </span>
              </div>
            </Link>
          </div>

          <div style={{ margin: 'auto 0', position: 'relative', zIndex: 2, padding: 'var(--space-6) 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <ButterflyMotif size={80} glowColor="rgba(222, 203, 254, 0.85)" />
              <div
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(197, 163, 252, 0.15)',
                  border: '1px solid rgba(222, 203, 254, 0.3)',
                  color: '#decbfe',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Sparkles size={14} color="#decbfe" />
                Empowerment & Digital Sovereignty
              </div>
            </div>

            <h2
              className="font-serif"
              style={{
                fontSize: '2.5rem',
                fontWeight: 600,
                lineHeight: 1.25,
                color: '#ffffff',
                marginBottom: '1rem',
                letterSpacing: '-0.02em',
                textShadow: '0 2px 10px rgba(0,0,0,0.3)'
              }}
            >
              Create your safe sanctuary.
            </h2>

            <p style={{ fontSize: '1rem', color: '#decbfe', lineHeight: 1.6, maxWidth: '480px' }}>
              Your profile gives you private access to secure incident journals, customized safety maps, emergency checks, and trusted support tools.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#ede4ff' }}>
                <CheckCircle2 size={16} color="#4ade80" /> Zero data tracking or unconsented cloud uploads
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#ede4ff' }}>
                <CheckCircle2 size={16} color="#4ade80" /> Local data wipe for shared devices
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#ede4ff' }}>
                <CheckCircle2 size={16} color="#4ade80" /> Map lookup and trusted circle access
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#9d8ac7', position: 'relative', zIndex: 2 }}>
            © NIRBHAYA Platform · Your safety. Your voice. Your choice.
          </div>
        </div>

        <div
          style={{
            background: 'linear-gradient(135deg, rgba(25, 17, 48, 0.95) 0%, rgba(14, 10, 26, 0.98) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-8) var(--space-6)',
            position: 'relative'
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '480px',
              borderRadius: '24px',
              padding: 'var(--space-8)',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(222, 203, 254, 0.18)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 40px rgba(139, 79, 240, 0.1)',
              color: '#ffffff'
            }}
          >
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#c5a3fc'
                }}
              >
                Join NIRBHAYA
              </span>
              <h1
                className="font-serif"
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 600,
                  color: '#ffffff',
                  marginBottom: '0.35rem',
                  letterSpacing: '-0.01em'
                }}
              >
                Register to continue
              </h1>
              <p style={{ fontSize: '0.85rem', color: '#c5a3fc', lineHeight: 1.45 }}>
                Add your details and secure your private safety dashboard.
              </p>
            </div>

            {errorMessage && (
              <div style={{ marginBottom: '1.25rem' }}>
                <Alert type="danger" title="Registration Notice">
                  {errorMessage}
                </Alert>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label htmlFor="signupName" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#ede4ff', marginBottom: '0.35rem' }}>
                  Full Name or Alias
                </label>
                <div style={{ position: 'relative' }}>
                  <User
                    size={18}
                    color="#9d8ac7"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    id="signupName"
                    type="text"
                    required
                    placeholder="e.g. Ananya / Priya"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.85rem 0.7rem 2.5rem',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(197, 163, 252, 0.25)',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="signupEmail" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#ede4ff', marginBottom: '0.35rem' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={18}
                    color="#9d8ac7"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    id="signupEmail"
                    type="email"
                    required
                    placeholder="you@domain.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.85rem 0.7rem 2.5rem',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(197, 163, 252, 0.25)',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="signupPhone" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#ede4ff', marginBottom: '0.35rem' }}>
                  Phone Number
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone
                    size={18}
                    color="#9d8ac7"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    id="signupPhone"
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.85rem 0.7rem 2.5rem',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(197, 163, 252, 0.25)',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="signupPassword" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#ede4ff', marginBottom: '0.35rem' }}>
                  Password (at least 8 characters)
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={18}
                    color="#9d8ac7"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    id="signupPassword"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.85rem 0.7rem 2.5rem',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(197, 163, 252, 0.25)',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '0.9rem 1rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #a876f8 0%, #7434d8 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.8 : 1
                }}
              >
                {isLoading ? 'Creating your profile...' : 'Register'}
              </button>

              <div style={{ textAlign: 'center', fontSize: '0.82rem', color: '#c5a3fc' }}>
                Already registered?{' '}
                <Link to="/login" style={{ color: '#ffffff', fontWeight: 700, textDecoration: 'none' }}>
                  Sign in
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
