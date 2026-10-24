import React, { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { authService } from '@/services/auth/authService';

export const App: React.FC = () => {
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const restoreSession = () => {
    setAuthReady(false);
    setAuthError(null);
    authService.restoreSession()
      .then(() => setAuthReady(true))
      .catch(error => {
        setAuthError(error instanceof Error ? error.message : 'Unable to connect to the account service.');
      });
  };

  useEffect(() => {
    restoreSession();
  }, []);

  if (authError) {
    return (
      <main style={{ minHeight: '100vh', display: 'grid', placeContent: 'center', padding: '2rem', textAlign: 'center' }}>
        <h1>Account service unavailable</h1>
        <p>{authError}. Start the backend, then retry.</p>
        <button type="button" onClick={restoreSession}>Retry connection</button>
      </main>
    );
  }

  if (!authReady) {
    return <main style={{ minHeight: '100vh', display: 'grid', placeContent: 'center' }}>Connecting securely…</main>;
  }

  return <RouterProvider router={router} />;
};
export default App;
