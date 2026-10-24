import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Heart, ShieldAlert, UserRound } from 'lucide-react';
import { QuickExitBar } from '@/components/layout/QuickExitBar';
import { useAuth } from '@/hooks/useAuth';

/**
 * Supplied editorial media. The photo is the still scene; the two video
 * elements crossfade the last second of the loop into the first so the
 * movement never jumps or plays backwards.
 */
const HERO_PHOTO =
  'https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/8c8bd1ea-b9f8-4755-b2db-ca972fa9a381.jpg';
const HERO_VIDEO =
  'https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/0b9dbcc0-b9fc-4c2c-9418-458e4e829c59.mp4';
const POLAROID_PHOTO =
  'https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/4612f265-40f3-4fc9-af4c-b03c289c2b75.jpg';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = useState(prefersReducedMotion);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);

  return reduced;
};

const HeroMedia: React.FC = () => {
  const reduced = usePrefersReducedMotion();
  const firstVideoRef = useRef<HTMLVideoElement>(null);
  const secondVideoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    if (reduced) return;

    const first = firstVideoRef.current;
    const second = secondVideoRef.current;
    if (!first || !second) return;

    let cancelled = false;
    let active = first;
    let standby = second;
    let switching = false;
    let frame = 0;

    const prepare = (video: HTMLVideoElement) => {
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
    };

    const seekToStart = (video: HTMLVideoElement) => {
      try {
        video.currentTime = 0;
      } catch {
        /* metadata may not be ready yet; the play call will start at 0 */
      }
    };

    const start = () => {
      if (cancelled) return;
      setVideoReady(true);
      seekToStart(first);
      first.play().catch(() => {
        /* Autoplay may be blocked; the first frame still acts as a still. */
      });
      seekToStart(second);
    };

    const fail = () => {
      if (!cancelled) setVideoFailed(true);
    };

    prepare(first);
    prepare(second);

    first.addEventListener('loadeddata', start, { once: true });
    first.addEventListener('error', fail, { once: true });
    second.addEventListener('error', fail, { once: true });

    if (first.readyState >= 2) start();

    const tick = () => {
      if (cancelled) return;
      const duration = active.duration;
      if (Number.isFinite(duration) && duration > 1.5) {
        const remaining = duration - active.currentTime;
        if (!switching && remaining <= 1 && standby.readyState >= 2) {
          switching = true;
          seekToStart(standby);
          standby.play().catch(() => {
            /* If playback is blocked, keep the last visible frame. */
          });
          standby.classList.add('is-front');
          active.classList.remove('is-front');

          const previous = active;
          active = standby;
          standby = previous;

          window.setTimeout(() => {
            if (cancelled) return;
            previous.pause();
            seekToStart(previous);
            switching = false;
          }, 1000);
        }
      }
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      first.pause();
      second.pause();
    };
  }, [reduced]);

  if (reduced) {
    return (
      <div className="mh-media" aria-hidden="true">
        <img className="mh-photo" src={HERO_PHOTO} alt="" />
      </div>
    );
  }

  return (
    <div className="mh-media" aria-hidden="true">
      <img className="mh-photo" src={HERO_PHOTO} alt="" />
      <div className={`mh-video-wrap${videoReady && !videoFailed ? ' is-ready' : ''}`}>
        <video
          ref={firstVideoRef}
          className="mh-video is-front"
          src={HERO_VIDEO}
          muted
          playsInline
          preload="auto"
          tabIndex={-1}
          aria-hidden="true"
        />
        <video
          ref={secondVideoRef}
          className="mh-video"
          src={HERO_VIDEO}
          muted
          playsInline
          preload="auto"
          tabIndex={-1}
          aria-hidden="true"
        />
      </div>
    </div>
  );
};

export const WelcomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const intendedPath =
    typeof (location.state as { from?: unknown } | null)?.from === 'string'
      ? ((location.state as { from: string }).from)
      : '/';

  const enter = () =>
    navigate(isAuthenticated ? intendedPath : '/login', {
      state: isAuthenticated ? undefined : { from: intendedPath }
    });

  const featureLink = (path: string) => (isAuthenticated ? path : '/login');
  const featureState = (path: string) => (isAuthenticated ? undefined : { from: path });

  return (
    <div className="mh-landing">
      <a className="skip-link" href="#landing-main">Skip to main content</a>
      <QuickExitBar />

      <main id="landing-main" className="mh-frame" aria-labelledby="hero-title" tabIndex={-1}>
        <HeroMedia />
        <div className="mh-veil" aria-hidden="true" />
        <div className="mh-grid" aria-hidden="true">
          <span className="mh-grid__h" />
          <span className="mh-grid__nav" />
        </div>

        <header className="mh-nav">
          <Link to="/welcome" className="mh-brand" aria-label="NIRBHAYA home">NIRBHAYA</Link>

          <div className="mh-nav__right">
            <nav className="mh-nav__links" aria-label="Primary">
              <Link to={featureLink('/physical-safety')} state={featureState('/physical-safety')}>Safety</Link>
              <span aria-hidden="true" />
              <Link to={featureLink('/privacy-shield')} state={featureState('/privacy-shield')}>Privacy</Link>
              <span aria-hidden="true" />
              <Link to={featureLink('/legal-support')} state={featureState('/legal-support')}>Support</Link>
            </nav>

            <div className="mh-nav__actions">
              <Link to="/signup" className="mh-icon" aria-label="Create an account">
                <Heart aria-hidden="true" />
              </Link>
              <Link to="/login" state={{ from: intendedPath }} className="mh-icon" aria-label="Sign in">
                <UserRound aria-hidden="true" />
              </Link>
            </div>
          </div>
        </header>

        <div className="mh-copy">
          <h1 id="hero-title" className="mh-title">
            <span className="mh-title__line mh-title__sans">Your safety.</span>
            <span className="mh-title__line mh-title__sans">Your voice.</span>
            <span className="mh-title__line mh-title__serif"><em>Your choice.</em></span>
          </h1>
        </div>

        <aside className="mh-aside" aria-label="About NIRBHAYA">
          <p className="mh-season">
            <span aria-hidden="true">✦</span> Always open
          </p>

          <div className="mh-aside__body">
            <p className="mh-lede">
              A living sanctuary for women&apos;s safety: local siren and 112 shortcuts, consent-based
              location sharing, private incident records, and clear digital-safety guidance.
            </p>
            <p className="mh-limit">
              A support tool, not an emergency service. If you are in immediate danger, call{' '}
              <a href="tel:112">112</a> or visit{' '}
              <a href="https://112.gov.in/" target="_blank" rel="noopener noreferrer">112.gov.in</a>.
            </p>
            <div className="mh-actions">
              <button
                type="button"
                className="mh-cta"
                onClick={enter}
                aria-label="Step inside the sanctuary"
              >
                Step inside
                <ArrowRight aria-hidden="true" />
              </button>
              <Link to="/signup" className="mh-arrow" aria-label="Create an account">
                <ArrowUpRight aria-hidden="true" />
              </Link>
            </div>
          </div>
        </aside>

        <div className="mh-corner" aria-hidden="true">
          <span>Private</span>
          <span>By design</span>
          <span>Always yours</span>
        </div>

        <div className="mh-polaroid-wrap" aria-hidden="true">
          <figure className="mh-polaroid">
            <div className="mh-polaroid__photo">
              <img src={POLAROID_PHOTO} alt="" loading="lazy" />
            </div>
            <figcaption>Your everyday courage</figcaption>
          </figure>
        </div>

        <div className="mh-watermark" aria-hidden="true">NIRBHAYA</div>
      </main>

      <a
        className="sanctuary-sos sanctuary-sos--floating mh-sos"
        href="tel:112"
        aria-label="SOS call 112"
      >
        <ShieldAlert size={19} aria-hidden="true" />
        <span>SOS <small>Call 112</small></span>
      </a>
    </div>
  );
};

export default WelcomePage;
