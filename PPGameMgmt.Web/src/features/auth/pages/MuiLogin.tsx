import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LoginCredentials } from '../types';
import useAuth from '../hooks/useAuth';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Container,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  TextField,
  Typography,
  Alert,
  Paper,
  Avatar
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon, SportsEsports as GamepadIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

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

    // Debug: Log auth object to see what's available
    console.log('Auth object:', auth);
    console.log('Auth login function:', auth.login);

    try {
      // Create credentials object
      const credentials: LoginCredentials = { username, password };

      // Call the login function from the auth slice
      if (typeof auth.login === 'function') {
        await auth.login(credentials);

        if (!auth.error) {
          navigate(from, { replace: true });
        }
      } else {
        console.error('auth.login is not a function!');
        // Fallback: Try to use a mock login for testing
        console.log('Using mock login for testing');
        // Wait for 2 seconds to simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        // Navigate to home page
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
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
  );
};

export default MuiLogin;
