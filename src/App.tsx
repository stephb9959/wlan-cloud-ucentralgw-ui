import React, { Suspense } from 'react';
import { Spinner } from '@chakra-ui/react';
import { QueryClientProvider, QueryClient } from 'react-query';
import { HashRouter } from 'react-router-dom';
import { AuthProvider } from 'contexts/AuthProvider';
import { ControllerSocketProvider } from 'contexts/ControllerSocketProvider';
import { ProvisioningSocketProvider } from 'contexts/ProvisioningSocketProvider';
import Router from 'router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  const storageToken = localStorage.getItem('access_token') ?? sessionStorage.getItem('access_token');

  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <Suspense fallback={<Spinner />}>
          <AuthProvider token={storageToken !== null ? storageToken : undefined}>
            <ProvisioningSocketProvider>
              <ControllerSocketProvider>
                <Router />
              </ControllerSocketProvider>
            </ProvisioningSocketProvider>
          </AuthProvider>
        </Suspense>
      </HashRouter>
    </QueryClientProvider>
  );
};

export default App;