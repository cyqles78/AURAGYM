import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { AuthProvider } from './context/AuthContext';

// 1. Create the QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60, // Data is fresh for 1 hour (Gym Mode)
      gcTime: 1000 * 60 * 60 * 24, // Keep data in cache for 24 hours
      retry: 1,
    },
  },
});

// 2. Create the persister (localStorage)
const persister = createSyncStoragePersister({
  storage: window.localStorage,
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <PersistQueryClientProvider 
      client={queryClient} 
      persistOptions={{ persister, maxAge: 1000 * 60 * 60 * 24 }} // 24 hours persistence
    >
      <AuthProvider>
        <App />
      </AuthProvider>
    </PersistQueryClientProvider>
  </React.StrictMode>
);