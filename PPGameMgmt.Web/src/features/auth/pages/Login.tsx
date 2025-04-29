import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon
} from '@mui/icons-material';
import { useStore } from '../../../core/store';

interface LocationState {
  from?: {
    pathname: string;
  };
}

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { auth } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const locationState = location.state as LocationState;
  const from = locationState?.from?.pathname || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) return;
    
    await auth.login({ username, password });
    
    if (!auth.error) {
      navigate(from, { replace: true });
    }
  };

  return (
    <Box 
      component="form" 
      onSubmit={handleLogin}
      sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}
    >
      <Typography variant="h5" component="h1" gutterBottom align="center">
        Log In
      </Typography>
      
      {auth.error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {auth.error}
        </Alert>
      )}

      <TextField
        margin="normal"
        required
        fullWidth
        id="username"
        label="Username"
        name="username"
        autoComplete="username"
        autoFocus
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        disabled={auth.isLoading}
      />
      
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Password"
        type={showPassword ? 'text' : 'password'}
        id="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={auth.isLoading}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={auth.isLoading || !username || !password}
        startIcon={auth.isLoading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
      >
        {auth.isLoading ? 'Logging in...' : 'Log In'}
      </Button>
    </Box>
  );
};

export default Login;