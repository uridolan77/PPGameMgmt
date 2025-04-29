import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { AuthProvider } from './context/AuthContext'
import theme from './utils/theme'
import App from './App'
import './index.css'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
