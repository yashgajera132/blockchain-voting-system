import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateProfile, logout, getVerificationStatus, isServerAvailable } = useAuth();
  const { active, account } = useWeb3();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [userVotes, setUserVotes] = useState([]);

  useEffect(() => {
    // Check for user authentication
    if (!isServerAvailable && !user) {
      navigate('/login');
    }
    
    // Load user votes when user data is available
    if (user && isServerAvailable) {
      fetchUserVotes();
    }
  }, [user, isServerAvailable, navigate]);

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
    } catch (err) {
      console.error('Error fetching verification status:', err);
    }
  };

  const fetchUserVotes = async () => {
    try {
      // For now, we'll just set an empty array since the API endpoint
      // for fetching user votes is not yet implemented
      setUserVotes([]);
      console.log('User votes fetch would happen here');
      // When the API is ready, uncomment and modify this code:
      // const response = await fetch('/api/voter/user-votes', {
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   }
      // });
      // const data = await response.json();
      // if (response.ok) {
      //   setUserVotes(data.votes);
      // }
    } catch (err) {
      console.error('Error fetching user votes:', err);
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
                {active ? 'Connected' : 'Disconnected'}
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
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {active ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">
                  {active ? 'Connected' : 'Not Connected'}
                </p>
                {active && account && (
                  <p className="text-xs text-gray-600 mt-1 font-mono bg-gray-100 p-2 rounded overflow-hidden text-ellipsis">
                    {account}
                  </p>
                )}
                {!active && (
                  <p className="text-sm text-gray-600 mt-1">
                    Connect your wallet to participate in blockchain voting.
                  </p>
                )}
              </div>
            </div>
            {!active && (
              <div className="mt-4">
                <Button className="w-full" onClick={() => window.location.reload()}>
                  Connect Wallet
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
      </div>
    </div>
  );
} 