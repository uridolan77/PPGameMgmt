import { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query/devtools';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { ErrorBoundary } from './core/error';
import { Router } from './core/routing/Router';
import { theme } from './core/theme';
import { LoadingSpinner } from './shared/components/LoadingSpinner';

// Configure React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Suspense fallback={<LoadingSpinner fullPage />}>
              <Router />
            </Suspense>
          </BrowserRouter>
          {import.meta.env.DEV && <ReactQueryDevtools />}
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;