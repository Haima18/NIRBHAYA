import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  Heart,
  MapPinned,
  FolderLock,
  ArrowRight,
  PhoneCall,
  Sparkles
} from 'lucide-react';
import { ButterflyMotif } from '@/components/ui/ButterflyMotif';
import { QuickExitBar } from '@/components/layout/QuickExitBar';

const FEATURES = [
  { icon: <ShieldCheck size={20} />, title: 'Physical safety tools', text: 'Local siren, check-in timer, journey tracking, and a 112 dialer shortcut.' },
  { icon: <MapPinned size={20} />, title: 'Consent-based location sharing', text: 'Create a random, expiring link. Stop it at any time and clear the coordinates.' },
  { icon: <FolderLock size={20} />, title: 'Private evidence journal', text: 'Keep an on-device timeline for consultations. Original files stay with you.' },
  { icon: <Heart size={20} />, title: 'Support without false promises', text: 'Clear labels on sample directories, unconfigured services, and emergency limits.' }
];

export const WelcomePage: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0e0a1a', color: '#fdfaff' }}>
      <QuickExitBar />
      <main style={{ flexGrow: 1, padding: 'clamp(2rem, 6vw, 5rem)', display: 'grid', gap: '3rem', alignContent: 'center', maxWidth: '1120px', margin: '0 auto', width: '100%' }}>
        <section style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '2rem' }}>
          <div style={{ maxWidth: '660px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <ButterflyMotif size={64} glowColor="rgba(197, 163, 252, 0.85)" />
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#decbfe', border: '1px solid rgba(222,203,254,.3)', borderRadius: '999px', padding: '0.35rem 0.8rem', fontSize: '0.8rem' }}>
                <Sparkles size={14} /> Safety, sanctuary, and honest tools
              </span>
            </div>
            <h1 className="font-serif" style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', lineHeight: 1.1, margin: '0 0 1rem' }}>
              NIRBHAYA
            </h1>
            <p style={{ fontSize: '1.1rem', lineHeight: 1.65, color: '#decbfe', marginBottom: '1.5rem' }}>
              A women's safety platform that tells you what it can and cannot do. Use the tools on your own terms —
              no account is needed to read this page, and no alert is ever described as delivered unless you can verify it.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link to="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg,#a876f8,#7434d8)', color: '#fff', fontWeight: 700, padding: '0.85rem 1.2rem', borderRadius: '12px' }}>
                Create an account <ArrowRight size={18} />
              </Link>
              <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#ede4ff', border: '1px solid rgba(222,203,254,.35)', padding: '0.85rem 1.2rem', borderRadius: '12px', fontWeight: 600 }}>
                Sign in
              </Link>
              <a href="tel:112" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#fecdd3', border: '1px solid rgba(248,113,113,.45)', padding: '0.85rem 1.2rem', borderRadius: '12px', fontWeight: 700 }}>
                <PhoneCall size={18} /> Call 112
              </a>
            </div>
          </div>

          <div style={{ width: 'min(100%, 360px)', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(222,203,254,.2)', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 24px 60px rgba(0,0,0,.35)' }}>
            <ShieldAlert size={30} color="#f472b6" />
            <h2 style={{ fontSize: '1.15rem', margin: '0.75rem 0 0.5rem' }}>Before you rely on any app</h2>
            <p style={{ fontSize: '0.88rem', color: '#c5a3fc', lineHeight: 1.6, margin: 0 }}>
              If you are in immediate danger, call <strong>112</strong>. A browser app cannot dispatch police,
              guarantee an SMS, erase your browser history, or replace a trusted person or emergency service.
            </p>
          </div>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem' }}>
          {FEATURES.map(feature => (
            <div key={feature.title} style={{ border: '1px solid rgba(222,203,254,.16)', background: 'rgba(255,255,255,.03)', borderRadius: '16px', padding: '1.1rem' }}>
              <div style={{ color: '#c5a3fc', marginBottom: '0.5rem' }}>{feature.icon}</div>
              <h3 style={{ fontSize: '1rem', margin: '0 0 0.35rem' }}>{feature.title}</h3>
              <p style={{ margin: 0, fontSize: '0.83rem', color: '#b9a8df', lineHeight: 1.5 }}>{feature.text}</p>
            </div>
          ))}
        </section>
      </main>
      <footer style={{ padding: '1.25rem', textAlign: 'center', fontSize: '0.75rem', color: '#9d8ac7' }}>
        NIRBHAYA is not an emergency dispatch service. Demo and sample content is labelled throughout.
      </footer>
    </div>
  );
};
