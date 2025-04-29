import { Router } from './core/routing';
import { ErrorBoundary } from './core/error';
import { Toaster } from "./components/ui/sonner";

import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <Router />
      <Toaster position="top-right" richColors closeButton />
    </ErrorBoundary>
  );
}

export default App;