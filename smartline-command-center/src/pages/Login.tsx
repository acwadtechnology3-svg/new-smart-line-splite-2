import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      await login(email, password);
      toast.success('Login successful!');
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="login-hero bg-gradient-to-br from-background to-muted">
      <div className="login-gradient" />

      {/* Dot grid background */}
      <div className="login-dots" aria-hidden="true" />

      <div className="login-split">
        {/* Left side - Video */}
        <div className="login-panel login-left">
          <div className="login-video-wrapper field-stagger">
            <video
              className="login-video"
              src="/Video_Generation_Complete.mp4"
              autoPlay
              loop
              muted
              playsInline
              controls
            />
          </div>
          <div className="login-tagline field-stagger">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Smart Fleet Management
            </h2>
            <p className="text-muted-foreground text-lg mt-2">
              Monitor, manage, and optimize your entire fleet in real-time.
            </p>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="login-panel login-right">
          {/* Logo */}
          <div className="flex justify-start mb-6">
            <div className="flex items-center gap-3 field-stagger">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center logo-pulse">
                <Shield className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">SmartLine</h1>
                <p className="text-sm text-muted-foreground">Command Center</p>
              </div>
            </div>
          </div>

          <Card className="border-0 shadow-2xl card-animated card-glow card-tilt">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
              <CardDescription className="text-center">
                Sign in to access the dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2 field-stagger">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@smartline.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2 field-stagger">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 btn-animated field-stagger"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                <p>Protected area. Authorized personnel only.</p>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} SmartLine. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
