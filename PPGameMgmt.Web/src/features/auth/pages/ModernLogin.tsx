import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../../../core/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EyeIcon, EyeOffIcon, LogInIcon, GamepadIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LocationState {
  from?: {
    pathname: string;
  };
}

const ModernLogin: React.FC = () => {
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
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <div className="w-full max-w-md px-4 py-8 animate-fadeIn">
        <Card className={cn(
          "w-full overflow-hidden border-none",
          "shadow-[0_8px_30px_rgb(0,0,0,0.08)]",
          "backdrop-blur-sm bg-card/95",
          "rounded-xl"
        )}>
          <div className="flex justify-center -mb-2 mt-6">
            <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
              <GamepadIcon className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardHeader className="space-y-2 pb-4">
            <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Log In
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground/90 text-sm">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-5 px-6">
              {auth.error && (
                <Alert variant="destructive" className="animate-shake">
                  <AlertDescription>{auth.error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={auth.isLoading}
                  className={cn(
                    "h-11 px-4 py-2 bg-background/50",
                    "border-input/50 focus-visible:border-primary",
                    "hover:border-primary/50 hover:bg-background/80",
                    "transition-all duration-200",
                    "rounded-md"
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    placeholder="Enter your password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={auth.isLoading}
                    className={cn(
                      "h-11 px-4 py-2 bg-background/50",
                      "border-input/50 focus-visible:border-primary",
                      "hover:border-primary/50 hover:bg-background/80",
                      "transition-all duration-200",
                      "rounded-md"
                    )}
                  />
                  <button
                    type="button"
                    className={cn(
                      "absolute right-3 top-1/2 transform -translate-y-1/2",
                      "text-muted-foreground hover:text-foreground",
                      "transition-colors duration-200"
                    )}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="px-6 pb-6">
              <Button
                type="submit"
                className={cn(
                  "w-full h-11 text-base font-medium",
                  "bg-gradient-to-r from-primary to-primary/80",
                  "hover:opacity-90 hover:translate-y-[-1px]",
                  "active:translate-y-[1px]",
                  "transition-all duration-200",
                  "shadow-md hover:shadow-lg",
                  "rounded-md"
                )}
                disabled={auth.isLoading || !username || !password}
              >
                {auth.isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </>
                ) : (
                  <>
                    <LogInIcon className="mr-2 h-5 w-5" /> Log In
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ModernLogin;
