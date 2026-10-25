import React from 'react';
import { Link } from 'react-router-dom';
import { PhoneCall } from 'lucide-react';
import { QuickExitBar } from '@/components/layout/QuickExitBar';

interface AuthShellProps {
  eyebrow: string;
  title: React.ReactNode;
  description: React.ReactNode;
  points?: string[];
  children: React.ReactNode;
  variant?: 'default' | 'aurevon';
}

/**
 * Shared frame for sign-in, registration, and password recovery.
 * It carries the editorial portrait story panel without touching any
 * authentication logic.
 */
export const AuthShell: React.FC<AuthShellProps> = ({
  eyebrow,
  title,
  description,
  points = [],
  children,
  variant = 'default'
}) => (
  <div className={`auth-page${variant === 'aurevon' ? ' auth-page--aurevon' : ''}`}>
    <QuickExitBar />
    {variant === 'aurevon' && (
      <video
        className="auth-aurevon-video"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260819_212700_3bb9329b-5c50-4257-a09b-ca85cf3654a3.mp4"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      />
    )}

    <div className="auth-page__grid">
      <aside className="auth-story" aria-label="About NIRBHAYA">
        <span className="auth-story__glow" aria-hidden="true" />
        <Link to="/welcome" className="auth-story__brand">
          <span className="auth-story__mark" aria-hidden="true">N</span>
          <span>
            <strong>NIRBHAYA</strong>
            <small>Your safety. Your voice. Your choice.</small>
          </span>
        </Link>

        <div className="auth-story__body">
          <p className="auth-story__eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="auth-story__text">{description}</p>
          {points.length > 0 && (
            <ul className="auth-story__points">
              {points.map(point => (
                <li key={point}>
                  <span aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="auth-story__foot">
          Private by default · Honest about limits · Yours to control
        </p>
      </aside>

      <main id="auth-main" className="auth-panel">
        <a className="auth-panel__sos" href="tel:112">
          <PhoneCall size={14} aria-hidden="true" /> Immediate danger? Call 112
        </a>
        <div className="auth-card">{children}</div>
        <p className="auth-panel__note">
          NIRBHAYA cannot place calls, dispatch help, or confirm that anyone answers.
        </p>
      </main>
    </div>
  </div>
);

export default AuthShell;
