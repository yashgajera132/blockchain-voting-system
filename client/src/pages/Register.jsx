import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

export default function Register() {
  const navigate = useNavigate();
  const { register, loading: authLoading } = useAuth();
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'voter', // Default role
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Skip rendering this component if authentication is still being checked
  if (authLoading) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAdminChange = (e) => {
    const isChecked = e.target.checked;
    setIsAdmin(isChecked);
    setFormState(prev => ({
      ...prev,
      role: isChecked ? 'admin' : 'voter',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Client-side validation
    if (formState.password !== formState.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formState.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      // Display a toast when registration starts
      toast.loading('Creating your account...', { id: 'registering' });

      console.log('Submitting registration with:', {
        name: formState.name,
        email: formState.email,
        role: formState.role
      });

      const result = await register({
        name: formState.name,
        email: formState.email,
        password: formState.password,
        role: formState.role,
      });

      console.log('Registration successful:', result);
      toast.success('Account created successfully!', { id: 'registering' });
      setRegistrationSuccess(true);
      
      // Redirect to verification page or login
      setTimeout(() => {
        navigate('/verify');
      }, 1500);
    } catch (err) {
      console.error('Registration error:', err);
      toast.error(err?.response?.data?.message || 'Registration failed. Please try again.', { id: 'registering' });
      
      // Set specific error message based on the error
      if (err.response?.status === 409) {
        setError('Email is already in use. Please try another email.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // If registration was successful, show success message
  if (registrationSuccess) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-green-600">Registration Successful!</CardTitle>
            <CardDescription>
              Your account has been created successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-center">
              Redirecting you to the verification page...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Sign up to start participating in secure blockchain voting
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <FormField>
              <FormLabel>Full Name</FormLabel>
              <Input
                type="text"
                name="name"
                value={formState.name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
              />
            </FormField>
            <FormField>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                name="email"
                value={formState.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </FormField>
            <FormField>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                name="password"
                value={formState.password}
                onChange={handleChange}
                required
                placeholder="Create a password"
                minLength={6}
              />
            </FormField>
            <FormField>
              <FormLabel>Confirm Password</FormLabel>
              <Input
                type="password"
                name="confirmPassword"
                value={formState.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm your password"
                minLength={6}
              />
            </FormField>
            <div className="flex items-center space-x-2 mt-4">
              <input
                type="checkbox"
                id="isAdmin"
                checked={isAdmin}
                onChange={handleAdminChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="isAdmin" className="text-sm text-gray-700">
                Register as Administrator
              </label>
            </div>
            {error && <FormMessage className="text-red-500">{error}</FormMessage>}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
            <p className="text-sm text-center text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-primary hover:underline"
              >
                Log in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 