import React, { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { authService } from '@/services/auth/authService';
import { SanctuaryLoader } from '@/components/sanctuary/SanctuaryLoader';

export const App: React.FC = () => {
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const restoreSession = () => {
    setAuthReady(false);
    setAuthError(null);
    authService.restoreSession()
      .then(() => setAuthReady(true))
      .catch(error => {
        setAuthError(
          error instanceof Error
            ? error.message
            : 'Unable to reach the account service. Check that the backend is running.'
        );
      });
  };

  useEffect(() => {
    restoreSession();
  }, []);

  if (!authReady) {
    return <SanctuaryLoader error={authError} onRetry={authError ? restoreSession : undefined} />;
  }

  return <RouterProvider router={router} />;
};
export default App;
