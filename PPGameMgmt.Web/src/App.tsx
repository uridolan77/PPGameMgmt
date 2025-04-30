import React from 'react';
import { Router } from './core/routing';
import { ErrorBoundary } from './core/error';
import { Toaster } from "./components/ui/sonner";
import { ApiProvider } from './core/api/reactQueryIntegration';
import { ThemeProvider } from './core/theme';

import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <ApiProvider>
        <ThemeProvider>
          <Router />
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </ApiProvider>
    </ErrorBoundary>
  );
}

export default App;