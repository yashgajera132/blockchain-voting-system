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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formState.password !== formState.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formState.name,
        email: formState.email,
        password: formState.password,
        role: formState.role,
      });
      navigate('/verify');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

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
                minLength={8}
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
                minLength={8}
              />
            </FormField>
            <div className="space-y-2">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Account Type
              </label>
              <select
                id="role"
                name="role"
                value={formState.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="voter">Voter</option>
                <option value="admin" disabled>Admin (Requires Approval)</option>
              </select>
              <p className="text-xs text-gray-500">
                Admin access requires approval from existing administrators.
              </p>
            </div>
            {error && <FormMessage>{error}</FormMessage>}
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