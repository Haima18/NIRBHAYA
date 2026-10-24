import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { QuickExitBar } from './QuickExitBar';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

export const PageLayout: React.FC = () => {
  const location = useLocation();

  return (
    <div className="app-shell">
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
