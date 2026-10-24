import React from 'react';
import { Link } from 'react-router-dom';
import { PhoneCall } from 'lucide-react';
import { QuickExitBar } from '@/components/layout/QuickExitBar';
import { ButterflyMotif } from '@/components/ui/ButterflyMotif';

interface AuthShellProps {
  eyebrow: string;
  title: React.ReactNode;
  description: React.ReactNode;
  points?: string[];
  children: React.ReactNode;
}

/**
 * Shared frame for sign-in, registration, and password recovery.
 * It reuses the sanctuary identity without touching any authentication logic.
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
          <span className="auth-story__mark">
            <ButterflyMotif size={30} glowColor="rgba(226, 198, 255, .65)" />
          </span>
          <span>
            <strong>NIRBHAYA</strong>
            <small>Your safety. Your voice. Your choice.</small>
          </span>
        </Link>

        <div className="auth-story__body">
          <div className="auth-story__butterfly" aria-hidden="true">
            <span className="auth-story__ring" />
            <span className="auth-story__ring auth-story__ring--inner" />
            <img src="/assets/butterfly-glow.jpg" alt="" draggable={false} />
          </div>
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
        <div className="auth-card">{children}</div>
        <a className="auth-panel__sos" href="tel:112">
          <PhoneCall size={14} aria-hidden="true" /> Immediate danger? Call 112
        </a>
        <p className="auth-panel__note">
          NIRBHAYA cannot place calls, dispatch help, or confirm that anyone answers.
        </p>
      </main>
    </div>
  </div>
);

export default AuthShell;
