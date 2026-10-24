import React from 'react';
import { Outlet } from 'react-router-dom';
import { QuickExitBar } from './QuickExitBar';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

export const PageLayout: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-app)' }}>
      {/* 1. Quick Exit Emergency Bar */}
      <QuickExitBar />

      {/* 2. Top Navigation & Action Header */}
      <Header />

      {/* 3. Main Split: Sidebar + Replaceable Content */}
      <div style={{ display: 'flex', flexGrow: 1, minHeight: 0 }}>
        <Sidebar />
        <main
          style={{
            flexGrow: 1,
            padding: 'var(--space-8)',
            maxWidth: 'var(--layout-max-width)',
            width: '100%',
            overflowX: 'hidden'
          }}
        >
          <Outlet />
        </main>
      </div>

      {/* 4. Footer */}
      <Footer />
    </div>
  );
};
