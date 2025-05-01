import React from 'react';
import { Router } from './core/routing';
import { ErrorBoundary } from './core/error';
import { Toaster } from "./components/ui/sonner";
import { ApiProvider } from './core/api/reactQueryIntegration';
import { ThemeProvider as OldThemeProvider } from './core/theme';
import { ThemeProvider } from './core/theme/ThemeContext';

import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <ApiProvider>
        <ThemeProvider defaultTheme="default">
          <OldThemeProvider>
            <Router />
            <Toaster position="top-right" richColors closeButton />
          </OldThemeProvider>
        </ThemeProvider>
      </ApiProvider>
    </ErrorBoundary>
  );
}

export default App;