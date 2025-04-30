import React, { useState, lazy, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LoginCredentials } from '../types';
import useAuth from '../hooks/useAuth';
import { styled } from '@mui/material/styles';

// Lazy load MUI components to improve performance
const Box = lazy(() => import('@mui/material/Box'));
const Button = lazy(() => import('@mui/material/Button'));
const Card = lazy(() => import('@mui/material/Card'));
const CardContent = lazy(() => import('@mui/material/CardContent'));
const CardHeader = lazy(() => import('@mui/material/CardHeader'));
const CircularProgress = lazy(() => import('@mui/material/CircularProgress'));
const FormControl = lazy(() => import('@mui/material/FormControl'));
const IconButton = lazy(() => import('@mui/material/IconButton'));
const InputAdornment = lazy(() => import('@mui/material/InputAdornment'));
const InputLabel = lazy(() => import('@mui/material/InputLabel'));
const OutlinedInput = lazy(() => import('@mui/material/OutlinedInput'));
const TextField = lazy(() => import('@mui/material/TextField'));
const Typography = lazy(() => import('@mui/material/Typography'));
const Alert = lazy(() => import('@mui/material/Alert'));
const Avatar = lazy(() => import('@mui/material/Avatar'));

// Lazy load icons
const Visibility = lazy(() => import('@mui/icons-material/Visibility').then(module => ({ default: module.default })));
const VisibilityOff = lazy(() => import('@mui/icons-material/VisibilityOff').then(module => ({ default: module.default })));
const LoginIcon = lazy(() => import('@mui/icons-material/Login').then(module => ({ default: module.default })));
const GamepadIcon = lazy(() => import('@mui/icons-material/SportsEsports').then(module => ({ default: module.default })));

interface LocationState {
  from?: {
    pathname: string;
  };
}

// Styled components
const LoginContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  background: `linear-gradient(to bottom, ${theme.palette.background.default}, ${theme.palette.background.default}80)`,
  padding: theme.spacing(2)
}));

const StyledCard = styled(Card)(({ theme }) => ({
  width: '100%',
  maxWidth: '450px',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
  overflow: 'hidden',
  backdropFilter: 'blur(8px)',
  backgroundColor: `${theme.palette.background.paper}95`,
  animation: 'fadeIn 0.5s ease-out forwards',
  '@keyframes fadeIn': {
    from: {
      opacity: 0,
      transform: 'translateY(10px)'
    },
    to: {
      opacity: 1,
      transform: 'translateY(0)'
    }
  }
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(-1)
}));

const LogoAvatar = styled(Avatar)(({ theme }) => ({
  backgroundColor: `${theme.palette.primary.main}10`,
  border: `1px solid ${theme.palette.primary.main}20`,
  padding: theme.spacing(1),
  width: theme.spacing(8),
  height: theme.spacing(8)
}));

const GradientTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.main}80)`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  textFillColor: 'transparent'
}));

const FormContainer = styled(Box)(({ theme }) => ({
  '& .MuiFormControl-root': {
    marginBottom: theme.spacing(3)
  }
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  height: '48px',
  background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  boxShadow: theme.shadows[2],
  '&:hover': {
    boxShadow: theme.shadows[4],
    transform: 'translateY(-1px)'
  },
  '&:active': {
    transform: 'translateY(1px)'
  },
  transition: 'all 0.2s ease-in-out'
}));

const MuiLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const locationState = location.state as LocationState;
  const from = locationState?.from?.pathname || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) return;

    try {
      // Create credentials object
      const credentials: LoginCredentials = { username, password };

      // Call the login function
      await auth.login(credentials);

      // Check if login was successful
      if (!auth.error) {
        console.log('Login successful, navigating to:', from);

        // Add a small delay to ensure state is updated
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 100);
      }
    } catch (error) {
      console.error('Login error:', error);
      // Error is already set in the auth state
    }
  };

  // Simple loading component
  const LoadingFallback = () => (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #3498db',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <div>Loading login form...</div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  return (
    <Suspense fallback={<LoadingFallback />}>
      <LoginContainer>
        <StyledCard>
          <LogoContainer>
            <LogoAvatar>
              <GamepadIcon fontSize="large" color="primary" />
            </LogoAvatar>
          </LogoContainer>

          <CardHeader
            title={
              <GradientTypography variant="h4" align="center">
                Log In
              </GradientTypography>
            }
            subheader={
              <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 1 }}>
                Enter your credentials to access your account
              </Typography>
            }
          />

          <CardContent>
            <form onSubmit={handleLogin}>
              {auth.error && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 3,
                    animation: 'shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both',
                    '@keyframes shake': {
                      '0%, 100%': { transform: 'translateX(0)' },
                      '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
                      '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' }
                    }
                  }}
                >
                  {auth.error}
                </Alert>
              )}

              <FormContainer>
                <TextField
                  id="username"
                  label="Username"
                  variant="outlined"
                  fullWidth
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={auth.isLoading}
                  placeholder="Enter your username"
                  InputProps={{
                    sx: {
                      height: '48px',
                      backgroundColor: 'background.default',
                      '&:hover': {
                        backgroundColor: 'background.paper'
                      }
                    }
                  }}
                />

                <FormControl variant="outlined" fullWidth>
                  <InputLabel htmlFor="password">Password</InputLabel>
                  <OutlinedInput
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={auth.isLoading}
                    required
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    sx={{
                      height: '48px',
                      backgroundColor: 'background.default',
                      '&:hover': {
                        backgroundColor: 'background.paper'
                      }
                    }}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    }
                    label="Password"
                  />
                </FormControl>

                <SubmitButton
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  disabled={auth.isLoading || !username || !password}
                  startIcon={auth.isLoading ?
                    <CircularProgress size={20} color="inherit" /> :
                    <LoginIcon />
                  }
                >
                  {auth.isLoading ? 'Logging in...' : 'Log In'}
                </SubmitButton>
              </FormContainer>
            </form>
          </CardContent>
        </StyledCard>
      </LoginContainer>
    </Suspense>
  );
};

export default MuiLogin;
