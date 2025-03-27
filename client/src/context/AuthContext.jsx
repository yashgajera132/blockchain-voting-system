import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isServerAvailable, setIsServerAvailable] = useState(true);

  // Check if server is available
  useEffect(() => {
    const checkServer = async () => {
      try {
        // Try to connect to server
        const response = await axios.get(`${API_URL}/auth/health`, { timeout: 3000 });
        console.log('Server connection status:', response.status);
        setIsServerAvailable(true);
        setLoading(false);
      } catch (error) {
        console.warn('Server not available, switching to mock mode. Error:', error.message);
        setIsServerAvailable(false);
        setLoading(false);
      }
    };
    
    checkServer();
  }, []);

  // Check if user is logged in on mount
  useEffect(() => {
    // Set a much shorter maximum duration for the loading state
    const maxLoadingTimeout = setTimeout(() => {
      if (loading) {
        console.warn('Auth loading took too long, forcing completion');
        setLoading(false);
      }
    }, 800); // Max 800ms of loading (reduced from 2000ms)

    // Immediate check for token and preload user
    const token = localStorage.getItem('token');
    if (token) {
      // Pre-populate user from local storage immediately
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser) {
        console.log('Pre-loading user data from localStorage');
        setUser(storedUser); // Set user immediately to prevent UI flash
        
        // Skip loading altogether when we have stored user data
        setLoading(false);
      }
      
      // Still perform the auth check in the background for session validation
      checkAuth(false); // Pass false to indicate this is a background check
    } else {
      setLoading(false);
    }
    
    return () => clearTimeout(maxLoadingTimeout);
  }, []);

  // Check authentication status
  async function checkAuth(showLoading = true) {
    // Only set loading true if this is not a background check
    if (showLoading) {
      setLoading(true);
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Get stored user data regardless of server availability
      const storedUser = JSON.parse(localStorage.getItem('user'));
      
      if (!isServerAvailable) {
        // Mock user from local storage if server is unavailable
        if (storedUser) {
          console.log('Restored user session from localStorage (Mock Mode)');
          setUser(storedUser);
        } else {
          console.warn('Token exists but no user data found in localStorage');
          localStorage.removeItem('token'); // Clean up orphaned token
        }
        setLoading(false);
        return;
      }

      try {
        // Attempt to validate with server
        const response = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Preserve the stored role if it's admin and the response role is voter
        // This ensures admin role persists after refresh even if server returns voter
        const responseData = response.data;
        console.log('Response data:', responseData);
        if (storedUser && storedUser.role === 'admin' && responseData.role === 'voter') {
          console.log('Preserving admin role from local storage');
          responseData.role = 'admin';
        }

        // Update stored user data to keep it fresh
        localStorage.setItem('user', JSON.stringify(responseData));
        setUser(responseData);
        console.log('User session restored successfully with role:', responseData.role);
      } catch (apiError) {
        console.error('Error validating token:', apiError);
        
        // If server is down but we have user data, use it as fallback
        if (apiError.code === 'ECONNREFUSED' || apiError.code === 'ERR_NETWORK') {
          if (storedUser) {
            setUser(storedUser);
            setIsServerAvailable(false);
            console.log('Using stored user data as fallback (server unavailable)');
          } else {
            // No fallback data, must logout
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
        } else if (apiError.response?.status === 401) {
          // Token is invalid or expired
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          toast.error('Your session has expired. Please log in again.');
        } else {
          // Other API errors - keep the token but set user to null
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      
      // Always set loading to false at the end
      setLoading(false);
    } catch (error) {
      console.error('Fatal error checking auth:', error);
      // On critical errors, clear everything and reset
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setLoading(false);
    }
  }

  // Register new user
  async function register({ name, email, password, role = 'voter' }) {
    setLoading(true);
    console.log('Attempting registration with:', { name, email, role });
    
    try {
      // Always try the real server first
      try {
        console.log('Attempting server registration at:', `${API_URL}/auth/register`);
        const response = await axios.post(`${API_URL}/auth/register`, {
          name,
          email,
          password,
          role,
        });
        
        console.log('Registration successful, server response:', response.status);
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        setIsServerAvailable(true);
        toast.success('Registration successful');
        setLoading(false);
        return response.data;
      } catch (serverError) {
        console.error('Server error during registration:', serverError);
        console.error('Error details:', serverError.message);
        
        if (serverError.response) {
          console.error('Server response data:', serverError.response.data);
          console.error('Server response status:', serverError.response.status);
        }
        
        // If server is unavailable, fall back to mock mode
        if (!isServerAvailable || serverError.code === 'ECONNREFUSED' || serverError.code === 'ERR_NETWORK') {
          console.log('Using mock registration due to server unavailability');
          const mockToken = 'mock_token_' + Math.random().toString(36).substring(2);
          const mockUser = {
            id: 'mock_' + Math.random().toString(36).substring(2),
            name: name || 'Mock User',
            email: email,
            role: role, // Use the role from the form
            verified: false,
            createdAt: new Date().toISOString()
          };
          
          localStorage.setItem('token', mockToken);
          localStorage.setItem('user', JSON.stringify(mockUser));
          localStorage.setItem('mockUsers', JSON.stringify([
            ...(JSON.parse(localStorage.getItem('mockUsers') || '[]')),
            mockUser
          ]));
          
          setUser(mockUser);
          toast.success('Registration successful (Mock Mode)');
          setLoading(false);
          return { token: mockToken, user: mockUser };
        } else {
          // If it's another type of error, rethrow it
          throw serverError;
        }
      }
    } catch (error) {
      console.error('Error registering:', error);
      
      if (error.response?.status === 409) {
        toast.error('Email already in use');
      } else {
        toast.error(error.response?.data?.message || 'Registration failed: ' + (error.message || 'Unknown error'));
      }
      
      setLoading(false);
      throw error;
    }
  }

  // Login user
  async function login({ email, password, isAdmin }) {
    setLoading(true);
    console.log('Attempting login with:', { email, isAdmin });
    
    try {
      if (!isServerAvailable) {
        console.log('Server unavailable, using mock login');
        // For mock mode, first check if the user exists in localStorage
        const existingUsers = localStorage.getItem('mockUsers') ? 
          JSON.parse(localStorage.getItem('mockUsers')) : [];
        
        console.log('Existing mock users:', existingUsers.length);
        
        // Find the user by email
        const mockUserFound = existingUsers.find(u => u.email === email);
        
        if (mockUserFound) {
          console.log('Mock user found:', mockUserFound.email);
          // Check for role mismatch
          const userIsAdmin = mockUserFound.role === 'admin';
          
          // Role mismatch check
          if ((userIsAdmin && !isAdmin) || (!userIsAdmin && isAdmin)) {
            setLoading(false);
            throw new Error('Login failed. Role mismatch.');
          }
          
          const mockUser = {
            ...mockUserFound,
            // Ensure the role is correct based on the login attempt
            role: isAdmin ? 'admin' : 'voter'
          };
          
          const mockToken = 'mock_token_' + Math.random().toString(36).substring(2);
          
          localStorage.setItem('token', mockToken);
          localStorage.setItem('user', JSON.stringify(mockUser));
          
          setUser(mockUser);
          toast.success(`Welcome back, ${mockUser.name}! (Mock Mode)`);
          
          setLoading(false);
          return { token: mockToken, user: mockUser };
        } else {
          console.log('No mock user found, creating new mock user');
          // Create a new mock user for demo purposes if not found
          const mockUser = {
            id: 'mock_' + Math.random().toString(36).substring(2),
            name: 'Mock User',
            email: email,
            role: isAdmin ? 'admin' : 'voter',
            verified: true,
            createdAt: new Date().toISOString()
          };
          
          // Save the user to mock storage
          const updatedMockUsers = [...existingUsers, mockUser];
          localStorage.setItem('mockUsers', JSON.stringify(updatedMockUsers));
          console.log('Updated mock users with new user');
          
          const mockToken = 'mock_token_' + Math.random().toString(36).substring(2);
          
          localStorage.setItem('token', mockToken);
          localStorage.setItem('user', JSON.stringify(mockUser));
          
          setUser(mockUser);
          toast.success(`Welcome back, ${mockUser.name}! (Mock Mode)`);
          
          setLoading(false);
          return { token: mockToken, user: mockUser };
        }
      }

      try {
        // Real server login - first attempt to check if user exists
        console.log('Checking if user exists in database');
        let userExists = false;
        let userRole = null;
        
        try {
          const checkResponse = await axios.post(`${API_URL}/auth/check-user`, {
            email
          });
          
          if (checkResponse.data && checkResponse.data.exists) {
            userExists = true;
            userRole = checkResponse.data.role;
            console.log('User exists in database with role:', userRole);
          }
        } catch (checkError) {
          console.log('Error checking user existence:', checkError.message);
          // Continue with login attempt even if check fails
        }
        
        // If the user exists, check for role mismatch
        if (userExists) {
          const userIsAdmin = userRole === 'admin';
          
          // Role mismatch check
          if ((userIsAdmin && !isAdmin) || (!userIsAdmin && isAdmin)) {
            setLoading(false);
            throw new Error('Login failed. Role mismatch.');
          }
        }
        
        console.log('Attempting login with server');
        const response = await axios.post(`${API_URL}/auth/login`, {
          email,
          password,
          isAdmin
        });

        console.log('Login successful, server response:', response.status);
        const { token, user } = response.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        
        toast.success(`Welcome back, ${user.name}!`);
        setIsServerAvailable(true);
        
        setLoading(false);
        return response.data;
      } catch (serverError) {
        console.error('Server error during login:', serverError);
        console.error('Error details:', serverError.message);
        
        if (serverError.response) {
          console.error('Server response data:', serverError.response.data);
          console.error('Server response status:', serverError.response.status);
        }
        
        // If server is unavailable, try mock mode
        if (serverError.code === 'ECONNREFUSED' || serverError.code === 'ERR_NETWORK') {
          console.log('Server unavailable, switching to mock mode');
          setIsServerAvailable(false);
          return login({ email, password, isAdmin }); // Retry with mock mode
        }
        
        // Otherwise, rethrow the error
        throw serverError;
      }
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.message === 'Login failed. Role mismatch.') {
        toast.error('Login failed. Role mismatch. Please use the correct login option for your account type.');
      } else if (error.response?.status === 401) {
        toast.error('Invalid email or password');
      } else {
        toast.error(error.response?.data?.message || error.message || 'Login failed');
      }
      
      setLoading(false);
      throw error;
    }
  }

  // Logout user
  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    // Disconnect wallet if connected
    if (window.ethereum) {
      disconnect();
    }
    toast.success('Logged out successfully');
  }

  // Update user profile
  async function updateProfile(formData) {
    setLoading(true);
    try {
      if (!isServerAvailable) {
        // Mock profile update if server is unavailable
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const updatedUser = { ...storedUser, ...formData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        toast.success('Profile updated successfully (Mock Mode)');
        setLoading(false);
        return updatedUser;
      }

      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/auth/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      toast.success('Profile updated successfully');
      setLoading(false);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
      setLoading(false);
      throw error;
    }
  }

  // Upload verification documents
  async function uploadVerificationDocuments(formData) {
    setLoading(true);
    try {
      // Always try to connect to the real server first
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_URL}/verification/upload`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        
        // Update user verification status
        const updatedUser = { ...user, verificationStatus: 'pending' };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        setIsServerAvailable(true);
        toast.success('Documents uploaded successfully');
        setLoading(false);
        return response.data;
      } catch (serverError) {
        console.error('Server error during document upload:', serverError);
        
        // If server is unavailable, fall back to mock mode
        if (!isServerAvailable || serverError.code === 'ECONNREFUSED' || serverError.code === 'ERR_NETWORK') {
          const storedUser = JSON.parse(localStorage.getItem('user'));
          const updatedUser = { ...storedUser, verificationStatus: 'pending' };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setUser(updatedUser);
          toast.success('Documents uploaded successfully (Mock Mode)');
          setLoading(false);
          return { message: 'Documents uploaded successfully' };
        } else {
          // If it's another type of error, rethrow it
          throw serverError;
        }
      }
    } catch (error) {
      console.error('Error uploading documents:', error);
      toast.error(error.response?.data?.message || 'Failed to upload documents');
      setLoading(false);
      throw error;
    }
  }

  // Get verification status
  const getVerificationStatus = async () => {
    try {
      if (!user) {
        return null;
      }
      
      const response = await fetch('/api/voters/verification/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.data || { status: 'not_submitted' };
      } else if (response.status === 404) {
        // Verification not submitted yet
        return { status: 'not_submitted' };
      } else {
        throw new Error('Failed to fetch verification status');
      }
    } catch (error) {
      console.error('Verification status error:', error);
      return { status: 'not_submitted' };
    }
  };

  // Add a function to change user roles
  async function changeUserRole(userId, newRole) {
    setLoading(true);
    try {
      if (!isServerAvailable) {
        // Mock role change if server is unavailable
        if (userId === user.id) {
          const updatedUser = { ...user, role: newRole };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setUser(updatedUser);
          toast.success(`Role changed to ${newRole} (Mock Mode)`);
          setLoading(false);
          return updatedUser;
        } else {
          toast.success(`Changed user role to ${newRole} (Mock Mode)`);
          setLoading(false);
          return { id: userId, role: newRole };
        }
      }

      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/auth/users/${userId}/role`,
        { role: newRole },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // If changing the current user's role, update local state
      if (userId === user.id) {
        const updatedUser = { ...user, role: newRole };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
      
      toast.success(`Role changed to ${newRole}`);
      setLoading(false);
      return response.data;
    } catch (error) {
      console.error('Error changing user role:', error);
      toast.error(error.response?.data?.message || 'Failed to change user role');
      setLoading(false);
      throw error;
    }
  }

  // Add getUsersList function to fetch all users (admin only)
  async function getUsersList() {
    try {
      if (!isServerAvailable) {
        // Mock users list if server is unavailable
        const mockUsers = [
          { id: 'mock_1', name: 'Admin User', email: 'admin@example.com', role: 'admin', verified: true },
          { id: 'mock_2', name: 'Voter One', email: 'voter1@example.com', role: 'voter', verified: true },
          { id: 'mock_3', name: 'Voter Two', email: 'voter2@example.com', role: 'voter', verified: false }
        ];
        
        // Add current user to mock list if they don't exist
        if (user && !mockUsers.find(u => u.id === user.id)) {
          mockUsers.push({...user});
        }
        
        return mockUsers;
      }

      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.users;
    } catch (error) {
      console.error('Error fetching users list:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch users');
      throw error;
    }
  }

  const value = {
    user,
    loading,
    error,
    isServerAvailable,
    register,
    login,
    logout,
    updateProfile,
    uploadVerificationDocuments,
    getVerificationStatus,
    changeUserRole,
    getUsersList,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 