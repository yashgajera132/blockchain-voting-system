import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../components/ui/Card';
import {
  FormField,
  FormLabel,
  FormMessage,
} from '../components/ui/Form';
import { toast } from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading: authLoading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdminLogin, setIsAdminLogin] = useState(false);

  // Get the redirect path from various sources
  const fromState = location.state?.from;
  const fromQuery = location.search?.replace('?returnTo=', '');
  const adminRedirect = localStorage.getItem('adminRedirect');
  
  // Prioritize admin redirect if it exists and user is trying to login as admin
  const effectiveRedirect = (isAdminLogin && adminRedirect) || fromState || fromQuery || '/';
  
  console.log("Login page - redirect paths:", { 
    fromState, 
    fromQuery, 
    adminRedirect, 
    effectiveRedirect,
    isAdminLogin
  });

  // If user is already logged in, redirect them
  useEffect(() => {
    if (user) {
      console.log("User already logged in:", user);
      const isAdmin = user.role === 'admin' || user.isAdmin === true;
      
      if (isAdmin) {
        // If there's a stored admin redirect, use it
        const storedAdminRedirect = localStorage.getItem('adminRedirect');
        if (storedAdminRedirect) {
          console.log("Redirecting to stored admin path:", storedAdminRedirect);
          localStorage.removeItem('adminRedirect'); // Clear it after use
          navigate(storedAdminRedirect);
        } else {
          navigate('/admin');
        }
      } else {
        // For regular users, redirect to the intended destination
        console.log("Redirecting regular user to:", effectiveRedirect);
        navigate(effectiveRedirect);
      }
    }
  }, [user, navigate, effectiveRedirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      console.log("Attempting login with:", { email, isAdmin: isAdminLogin });
      
      await login({
        email: email,
        password: password,
        isAdmin: isAdminLogin
      });
      
      // Get updated user from localStorage
      const userData = JSON.parse(localStorage.getItem('user'));
      
      // Explicitly ensure admin role is set if admin login was selected
      if (isAdminLogin && userData) {
        console.log("Setting admin role in localStorage");
        userData.role = 'admin';
        userData.isAdmin = true;
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      // Login was successful, toast will be shown by the login function
      // Redirect will be handled by the useEffect when user state updates
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Failed to log in');
      toast.error(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Skip rendering this component if authentication is still being checked
  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse inline-block h-8 w-8 rounded-full bg-blue-600 opacity-75"></div>
          <p className="mt-2">Checking authentication status...</p>
        </div>
      </div>
    );
  }

  // If user is already logged in, don't render the login form
  if (user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">You're already logged in</h2>
          <p className="text-gray-600 mb-4">Redirecting you to {isAdminLogin ? 'admin dashboard' : 'your destination'}...</p>
          <Button 
            onClick={() => navigate(isAdminLogin ? '/admin' : effectiveRedirect)} 
            className="mx-auto"
          >
            Continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>
            Log in to your account to continue voting
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && <FormMessage>{error}</FormMessage>}
            <FormField>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </FormField>
            <FormField>
              <FormLabel>Password</FormLabel>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </FormField>
            <div className="flex items-center space-x-2 mt-4">
              <input
                type="checkbox"
                id="adminLogin"
                checked={isAdminLogin}
                onChange={() => setIsAdminLogin(!isAdminLogin)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="adminLogin" className="text-sm text-gray-700">
                Login as Administrator
              </label>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logging in...' : 'Log In'}
            </Button>
            <p className="text-sm text-center text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-semibold text-primary hover:underline"
              >
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 