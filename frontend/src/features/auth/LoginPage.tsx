import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { ButterflyMotif } from '@/components/ui/ButterflyMotif';
import { QuickExitBar } from '@/components/layout/QuickExitBar';
import { useAuth } from '@/hooks/useAuth';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await login(email, password, rememberMe);
      if (res.success) {
        navigate('/');
      } else {
        setErrorMessage(res.error || 'Invalid email or password.');
      }
    } catch {
      setErrorMessage('An unexpected error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0e0a1a' }}>
      {/* 1. Discreet Safety Quick Exit Bar */}
      <QuickExitBar />

      {/* 2. Refined Two-Part Composition */}
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
        {/* LEFT / DESKTOP SIDE: Atmospheric Lavender Landscape & Glowing Butterfly */}
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
          {/* Subtle Ambient Radial Lighting Blobs */}
          <div
            style={{
              position: 'absolute',
              top: '-15%',
              left: '-10%',
              width: '420px',
              height: '420px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(168, 118, 248, 0.28) 0%, rgba(139, 79, 240, 0) 70%)',
              filter: 'blur(40px)',
              pointerEvents: 'none'
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '5%',
              right: '-5%',
              width: '380px',
              height: '380px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(222, 203, 254, 0.22) 0%, rgba(116, 52, 216, 0) 70%)',
              filter: 'blur(50px)',
              pointerEvents: 'none'
            }}
          />

          {/* Brand Mark with Glowing Butterfly Motif */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
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

          {/* Central Artwork & Poetic Affirmation */}
          <div style={{ margin: 'auto 0', position: 'relative', zIndex: 2, padding: 'var(--space-6) 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <ButterflyMotif size={80} glowColor="rgba(197, 163, 252, 0.85)" />
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
                Sanctuary of Protection & Dignity
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
              Step into a haven designed for your peace of mind.
            </h2>

            <p style={{ fontSize: '1rem', color: '#decbfe', lineHeight: 1.6, maxWidth: '480px' }}>
              From a local emergency siren and manual journey check-ins to transparent text screening and official legal-aid
              routes, NIRBHAYA keeps its limits visible. It cannot dispatch help or guarantee delivery.
            </p>

            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#ede4ff' }}>
                <ShieldCheck size={18} color="#c5a3fc" /> Offline siren & local heuristics
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#ede4ff' }}>
                <Heart size={18} color="#f472b6" /> Trauma-Informed & Non-Judgmental
              </div>
            </div>
          </div>

          {/* Bottom Atmosphere Footer */}
          <div style={{ fontSize: '0.75rem', color: '#9d8ac7', position: 'relative', zIndex: 2 }}>
            © NIRBHAYA Platform • Your safety. Your voice. Your choice.
          </div>
        </div>

        {/* RIGHT SIDE: Translucent Glassmorphism Form Surface */}
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
              maxWidth: '460px',
              borderRadius: '24px',
              padding: 'var(--space-8)',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(222, 203, 254, 0.18)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 40px rgba(139, 79, 240, 0.1)',
              color: '#ffffff'
            }}
          >
            {/* Header Content */}
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#c5a3fc'
                  }}
                >
                  Secure Access
                </span>
              </div>
              <h1
                className="font-serif"
                style={{
                  fontSize: '1.85rem',
                  fontWeight: 600,
                  color: '#ffffff',
                  marginBottom: '0.4rem',
                  letterSpacing: '-0.01em'
                }}
              >
                Welcome back to your safe space.
              </h1>
              <p style={{ fontSize: '0.9rem', color: '#c5a3fc', lineHeight: 1.45 }}>
                Your space, your choices, your journey. Continue where you left off.
              </p>
            </div>

            {errorMessage && (
              <div style={{ marginBottom: '1.25rem' }}>
                <Alert type="danger" title="Login Notice">
                  {errorMessage}
                </Alert>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label
                  htmlFor="loginEmail"
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    color: '#ede4ff',
                    marginBottom: '0.4rem'
                  }}
                >
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={18}
                    color="#9d8ac7"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    id="loginEmail"
                    type="email"
                    required
                    placeholder="you@domain.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.85rem 0.75rem 2.5rem',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(197, 163, 252, 0.25)',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      outline: 'none',
                      transition: 'border-color var(--transition-fast)'
                    }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label
                    htmlFor="loginPassword"
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      color: '#ede4ff'
                    }}
                  >
                    Password
                  </label>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={18}
                    color="#9d8ac7"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    id="loginPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 2.6rem 0.75rem 2.5rem',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(197, 163, 252, 0.25)',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#9d8ac7',
                      cursor: 'pointer'
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: '#decbfe' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    style={{ accentColor: '#8b4ff0', width: '16px', height: '16px' }}
                  />
                  Remember me on this browser
                </label>
              </div>

              {/* Submit Button */}
              <Button
                variant="primary"
                size="lg"
                type="submit"
                isLoading={isLoading}
                style={{
                  width: '100%',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #a876f8 0%, #7434d8 100%)',
                  boxShadow: '0 4px 16px rgba(139, 79, 240, 0.4)',
                  fontSize: '0.95rem',
                  fontWeight: 600
                }}
                rightIcon={<ArrowRight size={18} />}
              >
                Sign In to NIRBHAYA
              </Button>
            </form>

            {/* Sign Up Redirect Link */}
            <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#c5a3fc' }}>
              Don’t have an account yet?{' '}
              <Link to="/signup" style={{ color: '#ffffff', fontWeight: 600, textDecoration: 'underline' }}>
                Create your sanctuary
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
