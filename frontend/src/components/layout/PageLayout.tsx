import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { QuickExitBar } from './QuickExitBar';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

const AMBIENT_VIDEOS = [
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260629_030107_874273ea-684a-4e90-bb96-8fdfde48d53d.mp4',
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260629_032424_3c9c2a9d-807b-4482-80e6-dd6d9dfd4545.mp4',
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260627_094019_4214ea73-b963-46a4-8327-61489192de99.mp4'
];

const AmbientVideo: React.FC = () => {
  const [sources, setSources] = useState(AMBIENT_VIDEOS);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const objectUrls: string[] = [];

    Promise.all(AMBIENT_VIDEOS.map(async (url, index) => {
      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`Video preload failed with status ${response.status}`);
        const objectUrl = URL.createObjectURL(await response.blob());
        objectUrls.push(objectUrl);
        return [index, objectUrl] as const;
      } catch (error) {
        if (!controller.signal.aborted) {
          console.info(`Using streamed background video ${index + 1}.`, error);
        }
        return null;
      }
    })).then(results => {
      if (controller.signal.aborted) return;
      setSources(current => {
        const next = [...current];
        results.forEach(result => {
          if (result) next[result[0]] = result[1];
        });
        return next;
      });
    });

    return () => {
      controller.abort();
      objectUrls.forEach(URL.revokeObjectURL);
    };
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const intervalId = window.setInterval(() => {
      setActiveIndex(index => (index + 1) % AMBIENT_VIDEOS.length);
    }, 14000);
    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div className="app-ambient" aria-hidden="true">
      {sources.map((source, index) => (
        <video
          key={AMBIENT_VIDEOS[index]}
          className={`app-ambient__video${index === activeIndex ? ' is-active' : ''}`}
          src={source}
          autoPlay
          muted
          loop
          playsInline
          preload={index === activeIndex ? 'auto' : 'metadata'}
          tabIndex={-1}
        />
      ))}
      <div className="app-ambient__veil" />
    </div>
  );
};

export const PageLayout: React.FC = () => {
  const location = useLocation();

  return (
    <div className="app-shell app-shell--creative">
      <AmbientVideo />
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <QuickExitBar />
      <Header />
      <div className="app-body">
        <Sidebar />
        <main id="main-content" className="app-main">
          <div key={location.pathname} className="route-page">
            <Outlet />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};
