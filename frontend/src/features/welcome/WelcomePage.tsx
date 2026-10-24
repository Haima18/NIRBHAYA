import React, { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Bot,
  Compass,
  Eye,
  FileSearch,
  FolderLock,
  Heart,
  MapPinned,
  Newspaper,
  PhoneCall,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users
} from 'lucide-react';
import { QuickExitBar } from '@/components/layout/QuickExitBar';
import { ButterflyFallback } from '@/components/sanctuary/ButterflyFallback';
import { ValleyBackdrop } from '@/components/sanctuary/ValleyBackdrop';
import { Reveal } from '@/components/sanctuary/Reveal';
import { useAuth } from '@/hooks/useAuth';

const ButterflyScene = lazy(() => import('@/components/sanctuary/ButterflyScene'));

interface FeatureLink {
  title: string;
  path: string;
  description: string;
  icon: React.ReactNode;
}

interface FeatureGroup {
  title: string;
  note: string;
  features: FeatureLink[];
}

const FEATURE_GROUPS: FeatureGroup[] = [
  {
    title: 'Protect',
    note: 'Practical tools for body, movement, and device.',
    features: [
      { title: 'Physical Safety', path: '/physical-safety', description: 'Siren, check-ins, trusted contacts, and manual alerts.', icon: <ShieldAlert size={17} /> },
      { title: 'Emergency SOS & Siren', path: '/physical-safety', description: 'A 112 dialer shortcut and a local browser siren.', icon: <PhoneCall size={17} /> },
      { title: 'Journey Guardian', path: '/physical-safety', description: 'Waypoints and an informational overdue state.', icon: <MapPinned size={17} /> },
      { title: 'Digital Guardian', path: '/digital-guardian', description: 'Transparent keyword screening for harmful messages.', icon: <ShieldCheck size={17} /> },
      { title: 'Privacy Shield', path: '/privacy-shield', description: 'A self-assessment for accounts, visibility, and doxxing.', icon: <Eye size={17} /> },
      { title: 'Deepfake Detective', path: '/deepfake-detective', description: 'File and metadata inspection, never a fabricated verdict.', icon: <FileSearch size={17} /> }
    ]
  },
  {
    title: 'Navigate',
    note: 'Guidance for the moments that feel impossible to untangle.',
    features: [
      { title: 'NIRBHAYA Pathway', path: '/pathway', description: 'What can I do next? Step-by-step, at your pace.', icon: <Compass size={17} /> },
      { title: 'HerCircle', path: '/hercircle', description: 'Private notes, safe-place planning, and official support routes.', icon: <Users size={17} /> },
      { title: 'Women’s Legal Support', path: '/legal-support', description: 'Legal information and verified free-aid signposting.', icon: <Scale size={17} /> },
      { title: 'Evidence Vault', path: '/evidence-vault', description: 'A local incident timeline you control.', icon: <FolderLock size={17} /> },
      { title: 'Incident Journal', path: '/evidence-vault', description: 'Record what happened, in your own words.', icon: <FolderLock size={17} /> }
    ]
  },
  {
    title: 'Grow',
    note: 'Space to learn, plan, and take your next breath.',
    features: [
      { title: 'AI Assistant', path: '/ai-assistant', description: 'General guidance with an honest local fallback.', icon: <Bot size={17} /> },
      { title: 'Safety News', path: '/safety-news', description: 'Evergreen awareness, not invented live reporting.', icon: <Newspaper size={17} /> },
      { title: 'Empowerment Hub', path: '/empowerment', description: 'Digital safety, independence, and self-advocacy.', icon: <Sparkles size={17} /> },
      { title: 'Emergency Directory', path: '/emergency-directory', description: 'Official helplines, with a static-reference warning.', icon: <PhoneCall size={17} /> }
    ]
  }
];

const PRINCIPLES = [
  { title: 'Private by default', text: 'Your incident notes and contacts stay in this browser. Server-backed sharing is consent-gated and revocable.' },
  { title: 'Honest by design', text: 'We never claim that help was dispatched, a message was delivered, or a professional was verified when it was not.' },
  { title: 'Yours to control', text: 'You choose what to share, when to share it, and when to stop. Nothing is sent in the background.' }
];

const MENU_LINKS = [
  { label: 'The sanctuary', href: '#sanctuary' },
  { label: 'Support', href: '#support' },
  { label: 'How it works', href: '#how-it-works' }
];

export const WelcomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const sceneRef = useRef<HTMLDivElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const [artUnavailable, setArtUnavailable] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const intendedPath =
    typeof (location.state as { from?: unknown } | null)?.from === 'string'
      ? ((location.state as { from: string }).from)
      : '/';

  const enter = () =>
    navigate(isAuthenticated ? intendedPath : '/login', {
      state: isAuthenticated ? undefined : { from: intendedPath }
    });

  const explore = () => {
    const target = document.getElementById('support');
    const reduced =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  };

  const onPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const element = sceneRef.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    element.style.setProperty('--mx', `${((event.clientX - rect.left) / rect.width - 0.5) * 2}`);
    element.style.setProperty('--my', `${((event.clientY - rect.top) / rect.height - 0.5) * 2}`);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const panel = menuPanelRef.current;
    const firstLink = panel?.querySelector<HTMLElement>('a, button');
    // The panel transitions from visibility:hidden. Focusing on the next frame
    // makes the first link reliably focusable for keyboard users.
    const focusTimer = window.setTimeout(() => firstLink?.focus(), 80);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        returnFocusRef.current?.focus();
      }
      if (event.key !== 'Tab' || !panel) return;

      const focusable = Array.from(panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const toggleMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (menuOpen) {
      setMenuOpen(false);
      event.currentTarget.focus();
    } else {
      returnFocusRef.current = event.currentTarget;
      setMenuOpen(true);
    }
  };

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    window.setTimeout(() => returnFocusRef.current?.focus(), 0);
  }, []);

  return (
    <div className="sanctuary ed-landing" ref={sceneRef} onPointerMove={onPointerMove}>
      <a className="skip-link" href="#landing-main">Skip to main content</a>
      <QuickExitBar />
      <ValleyBackdrop />
      <div className="sanctuary__veil" aria-hidden="true" />
      <div className="ed-atmosphere" aria-hidden="true">
        <span className="ed-cloud ed-cloud--one" />
        <span className="ed-cloud ed-cloud--two" />
        <span className="ed-cloud ed-cloud--three" />
      </div>
      <div className="editorial-grid" aria-hidden="true">
        <span /><span /><span /><span /><span />
      </div>

      <header className={`ed-nav${scrolled ? ' is-scrolled' : ''}${menuOpen ? ' is-menu-open' : ''}`}>
        <Link to="/welcome" className="ed-brand" aria-label="NIRBHAYA home">NIRBHAYA</Link>

        <nav className="ed-nav__links" aria-label="Landing sections">
          <a href="#sanctuary">The sanctuary</a>
          <span aria-hidden="true" />
          <a href="#support">Support</a>
          <span aria-hidden="true" />
          <a href="#how-it-works">How it works</a>
        </nav>

        <div className="ed-nav__actions">
          <button
            type="button"
            className="ed-nav__pill"
            aria-expanded={menuOpen}
            aria-controls="landing-menu"
            onClick={toggleMenu}
          >
            {menuOpen ? 'Close' : 'Navigate'}
            <span className="ed-nav__pill-dot" aria-hidden="true" />
          </button>
          <Link to="/signup" className="ed-icon" aria-label="Create an account">
            <Heart size={16} aria-hidden="true" />
          </Link>
          <a href="tel:112" className="ed-icon ed-icon--sos" aria-label="Call emergency number 112">
            <PhoneCall size={16} aria-hidden="true" />
          </a>
          <Link to="/login" state={{ from: intendedPath }} className="ed-nav__signin">Sign in</Link>
        </div>

        <button
          type="button"
          className={`ed-burger${menuOpen ? ' is-open' : ''}`}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="landing-menu"
          onClick={toggleMenu}
        >
          <span /><span />
        </button>
      </header>

      <div
        id="landing-menu"
        ref={menuPanelRef}
        className={`ed-menu${menuOpen ? ' is-open' : ''}`}
        role="dialog"
        aria-label="Landing menu"
        aria-hidden={!menuOpen}
        aria-modal={menuOpen}
      >
        <nav aria-label="Menu">
          {MENU_LINKS.map((item, index) => (
            <a key={item.href} href={item.href} onClick={closeMenu} style={{ '--i': index } as React.CSSProperties}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              {item.label}
            </a>
          ))}
          <Link to="/login" state={{ from: intendedPath }} onClick={closeMenu} style={{ '--i': 3 } as React.CSSProperties}>
            <span>04</span>
            Sign in
          </Link>
          <Link to="/signup" onClick={closeMenu} style={{ '--i': 4 } as React.CSSProperties}>
            <span>05</span>
            Create account
          </Link>
        </nav>

        <div className="ed-menu__foot">
          <a href="tel:112">
            Immediate danger? Call 112 <ArrowUpRight size={16} aria-hidden="true" />
          </a>
          <p>NIRBHAYA cannot place calls or dispatch help. If you cannot call, try to reach another person.</p>
        </div>
      </div>

      <main id="landing-main" className="landing-main">
        <section className="ed-hero" aria-labelledby="hero-title">
          <div className="ed-hero__grid">
            <div className="ed-hero__copy">
              <p className="ed-eyebrow"><span aria-hidden="true" /> A sanctuary for women</p>
              <h1 id="hero-title" className="ed-title">
                <span className="ed-title__sans">Find your light.</span>
                <span className="ed-title__serif"><em>Discover your strength.</em></span>
              </h1>
              <p className="ed-tagline">Your safety. Your voice. Your choice.</p>
              <p className="ed-intro">
                A safe space for practical safety tools, digital protection, trusted support, and women&apos;s
                empowerment. Come as you are. Stay for as long as you need.
              </p>

              <div className="ed-actions">
                <button type="button" className="ed-cta" onClick={enter}>
                  Enter your safe space
                  <ArrowRight size={17} aria-hidden="true" />
                </button>
                <button type="button" className="ed-round" onClick={explore} aria-label="Explore support">
                  <ArrowDown size={18} aria-hidden="true" />
                </button>
              </div>

              <p className="ed-reassurance">
                No account is needed to look around. Emergency shortcuts remain available.
              </p>

              <ul className="ed-trust" aria-label="What to expect">
                <li><Heart size={13} aria-hidden="true" /> No judgment</li>
                <li><ShieldCheck size={13} aria-hidden="true" /> Honest limits</li>
                <li><Sparkles size={13} aria-hidden="true" /> Yours to control</li>
              </ul>
            </div>

            <div className="ed-hero__rail">
              <div className="ed-star">
                <span aria-hidden="true">✦</span> Always open
              </div>

              <div className="ed-art">
                <div className="butterfly-stage">
                  <span className="butterfly-stage__ring" aria-hidden="true" />
                  <span className="butterfly-stage__ring butterfly-stage__ring--inner" aria-hidden="true" />
                  <Suspense fallback={<ButterflyFallback />}>
                    <ButterflyScene onUnavailable={() => setArtUnavailable(true)} />
                  </Suspense>
                </div>
                <p className="ed-art__hint">
                  {artUnavailable
                    ? 'Still artwork shown — safety tools never depend on it.'
                    : 'Move closer. The light responds.'}
                </p>
              </div>

              <div className="ed-rail-copy">
                <p>
                  Practical tools for body, device, and movement. Clear limits, official support routes, and no
                  pretend promises.
                </p>
                <button type="button" className="ed-rail-link" onClick={explore}>
                  Explore the support routes
                  <span className="ed-round ed-round--small" aria-hidden="true">
                    <ArrowDown size={15} />
                  </span>
                </button>
              </div>
            </div>
          </div>

          <figure className="ed-polaroid" aria-hidden="true">
            <div className="ed-polaroid__photo">
              <img src="/assets/butterfly-glow.jpg" alt="" loading="lazy" />
            </div>
            <figcaption>A quiet symbol</figcaption>
          </figure>

          <div className="ed-sidewords" aria-hidden="true">
            <span>Private</span>
            <span>By design</span>
            <span>Yours</span>
          </div>

          <div className="ed-scroll-cue" aria-hidden="true">
            <span /> Scroll to exhale
          </div>

          <div className="ed-watermark" aria-hidden="true">NIRBHAYA</div>
        </section>

        <section id="sanctuary" className="sanctuary-section sanctuary-section--editorial ed-section" aria-labelledby="sanctuary-heading">
          <Reveal className="sanctuary-section__intro">
            <p className="ed-kicker"><span>01</span> The living sanctuary</p>
            <h2 id="sanctuary-heading" className="sanctuary-h2">
              A place to exhale before you decide <em>what comes next.</em>
            </h2>
          </Reveal>
          <div className="sanctuary-principles">
            {PRINCIPLES.map((principle, index) => (
              <Reveal key={principle.title} delay={index * 90}>
                <article className="sanctuary-principle">
                  <span className="sanctuary-principle__line" aria-hidden="true" />
                  <h3>{principle.title}</h3>
                  <p>{principle.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="support" className="sanctuary-section ed-section" aria-labelledby="support-heading">
          <Reveal className="sanctuary-section__heading">
            <div>
              <p className="ed-kicker"><span>02</span> Real features, clearly labelled</p>
              <h2 id="support-heading" className="sanctuary-h2">
                Where would you like to <em>begin?</em>
              </h2>
            </div>
            <p className="sanctuary-section__note">
              Every entry point below opens a working part of NIRBHAYA. Sign in when you are ready; your place is kept.
            </p>
          </Reveal>

          <div className="sanctuary-groups">
            {FEATURE_GROUPS.map((group, groupIndex) => (
              <Reveal key={group.title} delay={groupIndex * 100}>
                <article className="sanctuary-group">
                  <div className="sanctuary-group__head">
                    <h3>{group.title}</h3>
                    <p>{group.note}</p>
                  </div>
                  <ul>
                    {group.features.map(feature => (
                      <li key={`${group.title}-${feature.title}`}>
                        <Link
                          to={isAuthenticated ? feature.path : '/login'}
                          state={isAuthenticated ? undefined : { from: feature.path }}
                          className="sanctuary-feature"
                        >
                          <span className="sanctuary-feature__icon" aria-hidden="true">{feature.icon}</span>
                          <span>
                            <strong>{feature.title}</strong>
                            <small>{feature.description}</small>
                          </span>
                          <ArrowRight size={14} className="sanctuary-feature__arrow" aria-hidden="true" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="sanctuary-section sanctuary-section--steps ed-section" aria-labelledby="how-heading">
          <Reveal className="sanctuary-section__intro">
            <p className="ed-kicker"><span>03</span> At your pace</p>
            <h2 id="how-heading" className="sanctuary-h2">Three quiet <em>steps.</em></h2>
          </Reveal>
          <ol className="sanctuary-steps">
            {[
              {
                title: 'Arrive',
                text: 'Look around without creating an account. Read the honest limits and the official support routes.'
              },
              {
                title: 'Choose',
                text: 'Open only what feels useful. Your notes stay local until you deliberately share a location link.'
              },
              {
                title: 'Move forward',
                text: 'Prepare a plan, preserve a record, or reach a real helpline. You decide what happens next.'
              }
            ].map((step, index) => (
              <li key={step.title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <Reveal className="sanctuary-closing ed-closing">
          <p className="ed-kicker ed-kicker--center"><span>04</span> You are not alone</p>
          <h2 id="closing-heading" className="sanctuary-h2">The sanctuary <em>is open.</em></h2>
          <p>Come in, take a breath, and choose the support that fits your life.</p>
          <div className="sanctuary-actions sanctuary-actions--center">
            <button type="button" className="ed-cta" onClick={enter}>
              Enter your safe space <ArrowRight size={17} aria-hidden="true" />
            </button>
            <Link to="/signup" className="ed-ghost">Create an account</Link>
          </div>
        </Reveal>
      </main>

      <footer className="sanctuary-footer ed-footer">
        <div>
          <strong>NIRBHAYA</strong>
          <p>Your safety. Your voice. Your choice.</p>
        </div>
        <p className="sanctuary-footer__note">
          NIRBHAYA is not an emergency dispatch service, a verified professional network, or a substitute for
          calling <a href="tel:112">112</a>. Sample content and unconfigured integrations are labelled throughout.
        </p>
        <div className="sanctuary-footer__links">
          <Link to="/welcome">Home</Link>
          <Link to="/login">Sign in</Link>
          <a href="https://112.gov.in/" target="_blank" rel="noopener noreferrer">112.gov.in</a>
          <a href="https://cybercrime.gov.in/" target="_blank" rel="noopener noreferrer">cybercrime.gov.in</a>
        </div>
      </footer>

      <a className="sanctuary-sos sanctuary-sos--floating ed-sos" href="tel:112">
        <ShieldAlert size={19} aria-hidden="true" />
        <span>SOS <small>Call 112</small></span>
      </a>
    </div>
  );
};

export default WelcomePage;
