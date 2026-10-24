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
}

const POLAROID_PHOTO =
  'https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/4612f265-40f3-4fc9-af4c-b03c289c2b75.jpg';

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
  children
}) => (
  <div className="auth-page">
    <QuickExitBar />

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

        <figure className="auth-story__polaroid" aria-hidden="true">
          <img src={POLAROID_PHOTO} alt="" draggable={false} loading="lazy" />
          <figcaption>Yours to control</figcaption>
        </figure>

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
