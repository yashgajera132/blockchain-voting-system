import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateProfile, logout, getVerificationStatus, isServerAvailable } = useAuth();
  const { isActive, account, connect, chainId, contract } = useWeb3();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [userVotes, setUserVotes] = useState([]);
  const [connectingWallet, setConnectingWallet] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Check for user authentication
    if (!isServerAvailable && !user) {
      navigate('/login');
    }
    
    // Load user votes when user data is available
    if (user && isServerAvailable) {
      fetchUserVotes();
    }

    // Attempt to connect to MetaMask silently
    if (!isActive) {
      connect(true); // true = silent mode (no toasts for errors)
    }
  }, [user, isServerAvailable, navigate, isActive, connect]);

  // Refresh data when wallet connection status changes
  useEffect(() => {
    if (user && isActive) {
      fetchUserVotes();
    }
  }, [isActive, user]);

  useEffect(() => {
    // Initialize data from user context
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
      });
      fetchVerificationStatus();
    }
  }, [user]);

  const fetchVerificationStatus = async () => {
    try {
      const status = await getVerificationStatus();
      setVerificationStatus(status);
      return status;
    } catch (err) {
      console.error('Error fetching verification status:', err);
      // Set a default status object to prevent UI errors
      setVerificationStatus({ status: 'not_submitted' });
      setApiError('Failed to fetch verification status');
      return null;
    }
  };

  const fetchUserVotes = async () => {
    try {
      if (!user?.id) return null;
      
      // Fix the API endpoint path
      const response = await fetch('/api/voters/votes', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserVotes(data.votes || []);
        return data.votes;
      } else {
        // Handle error response but don't crash
        const errorText = await response.text();
        console.error('Error fetching user votes:', errorText);
        setUserVotes([]);
        setApiError(`Failed to fetch votes: ${response.status}`);
        return null;
      }
    } catch (err) {
      console.error('Error fetching user votes:', err);
      setUserVotes([]);
      setApiError('Network error while fetching votes');
      return null;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile(formData);
      
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle logout to ensure clean state
  const handleLogout = () => {
    logout();
  };

  // Determine what data to display (prioritize admin role if it was persisted)
  const displayName = user?.name || 'User';
  const displayEmail = user?.email || 'No email';
  const displayRole = user?.role || 'voter';
  
  // Split name into first and last name components if possible
  const nameParts = displayName.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
  
  const displayInitial = displayName.charAt(0).toUpperCase() || '?';

  // Get a truncated version of the user ID for display purposes
  const truncatedId = user?.id ? `${user.id.substring(0, 8)}...` : '';

  // Add a controlled connect wallet function
  const handleConnectWallet = async () => {
    setConnectingWallet(true);
    try {
      await connect(false);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setConnectingWallet(false);
    }
  };

  // Get network name based on chain ID
  const getNetworkName = (id) => {
    if (!id) return 'Unknown';
    
    switch(Number(id)) {
      case 1: return 'Ethereum';
      case 5: return 'Goerli';
      case 11155111: return 'Sepolia';
      case 1337: return 'Local';
      default: return `Chain ID: ${id}`;
    }
  };

  // Function to handle manual refresh of all data
  const refreshAllData = async () => {
    setRefreshing(true);
    setApiError(null);
    
    try {
      await Promise.all([
        fetchVerificationStatus(),
        fetchUserVotes()
      ]);
      
      // Attempt to connect wallet silently if not connected
      if (!isActive) {
        connect(true);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
      setApiError('Failed to refresh data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-lg shadow-md border border-gray-100 mb-6 p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-blue-100 text-blue-600 text-2xl font-bold mb-4">
              {displayInitial}
            </div>
            <h1 className="text-2xl font-bold">
              {firstName} 
              {lastName && <span className="font-bold">{" " + lastName}</span>}
            </h1>
            <p className="text-gray-600 mt-2 font-medium">
              {displayEmail}
            </p>
            <div className="mt-2 flex justify-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {displayRole === 'admin' ? 'Administrator' : 'Voter'}
              </span>
            </div>
            {truncatedId && (
              <p className="text-xs text-gray-400 mt-1">ID: {truncatedId}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-500">Account Type</p>
              <p className="font-semibold text-blue-700">
                {displayRole === 'admin' ? 'Administrator' : 'Voter'}
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-500">Wallet Status</p>
              <p className="font-semibold text-blue-700">
                {isActive ? 'Connected' : 'Disconnected'}
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-500">Verification</p>
              <p className="font-semibold text-blue-700">
                {!verificationStatus || verificationStatus.status === 'not_submitted' 
                  ? 'Not Verified' 
                  : verificationStatus.status === 'pending' 
                    ? 'In Progress' 
                    : verificationStatus.status === 'verified' 
                      ? 'Verified' 
                      : 'Failed'}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Your email address"
                    disabled
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div className="flex justify-between pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleLogout}
                  >
                    Log Out
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
            <h2 className="text-xl font-semibold mb-4">Wallet Connection</h2>
            {isActive && account ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-green-600 font-medium">Connected</span>
                  <span className="text-gray-600">{account.substring(0, 6)}...{account.substring(account.length - 4)}</span>
                </div>
                <div className="text-sm text-gray-500">
                  Network: {getNetworkName(chainId)}
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-gray-600">Not Connected</span>
                </div>
                <p className="text-sm text-gray-500 mb-4">Connect your wallet to participate in blockchain voting.</p>
                <Button
                  onClick={handleConnectWallet}
                  disabled={connectingWallet}
                  className="w-full"
                >
                  {connectingWallet ? 'Connecting...' : 'Connect Wallet'}
                </Button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
            <h2 className="text-xl font-semibold mb-4">Identity Verification</h2>
            <div className="flex items-start space-x-3 mb-4">
              <div className="flex-shrink-0 mt-1">
                {!verificationStatus || verificationStatus.status === 'not_submitted' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                ) : verificationStatus.status === 'pending' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : verificationStatus.status === 'verified' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">
                  {!verificationStatus || verificationStatus.status === 'not_submitted' ? 'Not Verified' : 
                   verificationStatus.status === 'pending' ? 'Verification in Progress' :
                   verificationStatus.status === 'verified' ? 'Verified' : 'Verification Failed'}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {!verificationStatus || verificationStatus.status === 'not_submitted' 
                    ? 'You need to verify your identity to participate in elections.'
                    : verificationStatus.status === 'pending'
                    ? 'We are reviewing your documents. This process usually takes 1-2 business days.'
                    : verificationStatus.status === 'verified'
                    ? 'Your identity has been successfully verified. You can now participate in elections.'
                    : 'Your verification was rejected. Please upload new documents with clearer images.'}
                </p>
              </div>
            </div>
            {(!verificationStatus || verificationStatus.status === 'not_submitted' || verificationStatus.status === 'rejected') && (
              <Button className="w-full" onClick={() => navigate('/verify')}>
                {!verificationStatus || verificationStatus.status === 'not_submitted' ? 'Start Verification' : 'Retry Verification'}
              </Button>
            )}
          </div>
        </div>

        {apiError && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-700">{apiError}</p>
            </div>
            <Button 
              variant="outline"
              size="sm"
              className="mt-2 w-full"
              onClick={refreshAllData}
              disabled={refreshing}
            >
              {refreshing ? 'Refreshing...' : 'Refresh Data'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 