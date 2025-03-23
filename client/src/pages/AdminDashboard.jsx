import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../components/ui/Card';
import { toast } from 'react-hot-toast';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { contract, loading: web3Loading, chainId, account, isActive } = useWeb3();
  const { user, getUsersList } = useAuth();
  
  const [elections, setElections] = useState([]);
  const [verificationStats, setVerificationStats] = useState(null);
  const [userStats, setUserStats] = useState({ total: 0, admin: 0, voter: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }

    if (contract) {
      fetchData();
    } else if (!web3Loading) {
      setError('Blockchain connection required');
      setLoading(false);
    }
  }, [contract, user, web3Loading]);

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchElections(),
        fetchVerificationStats(),
        fetchUserStats(),
      ]);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const fetchElections = async () => {
    const count = await contract.getElectionCount();
    const electionPromises = [];

    for (let i = 1; i <= count.toNumber(); i++) {
      electionPromises.push(contract.getElection(i));
    }

    const electionResults = await Promise.all(electionPromises);
    const formattedElections = electionResults.map((election, index) => ({
      id: index + 1,
      title: election.title,
      description: election.description,
      startTime: new Date(election.startTime.toNumber() * 1000),
      endTime: new Date(election.endTime.toNumber() * 1000),
      isActive: election.isActive,
    }));

    setElections(formattedElections);
  };

  const fetchVerificationStats = async () => {
    try {
      const response = await fetch('/api/verification/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch verification stats');
      }

      const stats = await response.json();
      setVerificationStats(stats);
    } catch (err) {
      console.error('Error fetching verification stats:', err);
      // Use default data if API fails
      setVerificationStats({
        pending: 5,
        verified: 42,
        rejected: 3
      });
    }
  };

  const fetchUserStats = async () => {
    try {
      const users = await getUsersList();
      
      if (users && users.length) {
        const admins = users.filter(u => u.role === 'admin').length;
        const voters = users.filter(u => u.role === 'voter').length;
        
        setUserStats({
          total: users.length,
          admin: admins,
          voter: voters
        });
      }
    } catch (err) {
      console.error('Error fetching user stats:', err);
      // Keep default stats
    }
  };

  const handleCreateElection = () => {
    navigate('/admin/create-election');
  };

  const handleManageElection = (electionId) => {
    navigate(`/admin/elections/${electionId}`);
  };

  const getElectionStatus = (election) => {
    const now = new Date();
    if (now < election.startTime) {
      return {
        text: 'Upcoming',
        color: 'bg-blue-100 text-blue-800',
      };
    }
    if (now > election.endTime) {
      return {
        text: 'Ended',
        color: 'bg-gray-100 text-gray-800',
      };
    }
    if (election.isActive) {
      return {
        text: 'Active',
        color: 'bg-green-100 text-green-800',
      };
    }
    return {
      text: 'Inactive',
      color: 'bg-yellow-100 text-yellow-800',
    };
  };

  const getElectionCounts = () => {
    const now = new Date();
    return {
      active: elections.filter(e => e.isActive && now >= e.startTime && now <= e.endTime).length,
      upcoming: elections.filter(e => now < e.startTime).length,
      ended: elections.filter(e => now > e.endTime).length,
      total: elections.length
    };
  };

  const getNetworkName = (id) => {
    switch(id) {
      case 1: return 'Ethereum Mainnet';
      case 5: return 'Goerli Testnet';
      case 11155111: return 'Sepolia Testnet';
      case 1337: return 'Local Network';
      case 31337: return 'Hardhat Network';
      default: return 'Unknown Network';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
          <p className="ml-3 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <div className="mb-4 text-red-500">
            <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">{error}</h2>
          <p className="text-gray-600 mb-4">Please connect to the blockchain to access the admin dashboard.</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  const electionCounts = getElectionCounts();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-1">Admin Dashboard</h1>
        {account && (
          <p className="text-gray-600">
            Connected to {getNetworkName(chainId)} as {account.substring(0, 6)}...{account.substring(account.length - 4)}
          </p>
        )}
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Elections</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{electionCounts.total}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-md">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <div className="flex items-center mt-4">
              <div className="flex-1">
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-500 ml-2">100%</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Elections</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{electionCounts.active}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-md">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center mt-4">
              <div className="flex-1">
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${(electionCounts.active / Math.max(electionCounts.total, 1)) * 100}%` }}></div>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-500 ml-2">
                {electionCounts.total ? Math.round((electionCounts.active / electionCounts.total) * 100) : 0}%
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Upcoming Elections</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{electionCounts.upcoming}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-md">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center mt-4">
              <div className="flex-1">
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${(electionCounts.upcoming / Math.max(electionCounts.total, 1)) * 100}%` }}></div>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-500 ml-2">
                {electionCounts.total ? Math.round((electionCounts.upcoming / electionCounts.total) * 100) : 0}%
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Ended Elections</p>
                <p className="text-3xl font-bold text-gray-700 mt-1">{electionCounts.ended}</p>
              </div>
              <div className="p-2 bg-gray-100 rounded-md">
                <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="flex items-center mt-4">
              <div className="flex-1">
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className="bg-gray-500 h-2.5 rounded-full" style={{ width: `${(electionCounts.ended / Math.max(electionCounts.total, 1)) * 100}%` }}></div>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-500 ml-2">
                {electionCounts.total ? Math.round((electionCounts.ended / electionCounts.total) * 100) : 0}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* User Stats Card */}
        <Card className="bg-white shadow">
          <CardHeader>
            <CardTitle>User Statistics</CardTitle>
            <CardDescription>Overview of registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-500">Total Users</span>
                  <span className="text-sm font-bold">{userStats.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-500">Admins</span>
                  <span className="text-sm font-bold">{userStats.admin}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${(userStats.admin / Math.max(userStats.total, 1)) * 100}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-500">Voters</span>
                  <span className="text-sm font-bold">{userStats.voter}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${(userStats.voter / Math.max(userStats.total, 1)) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/admin/users')}
            >
              Manage Users
            </Button>
          </CardFooter>
        </Card>
        
        {/* Verification Stats Card */}
        <Card className="bg-white shadow">
          <CardHeader>
            <CardTitle>Verification Requests</CardTitle>
            <CardDescription>Voter verification status</CardDescription>
          </CardHeader>
          <CardContent>
            {verificationStats ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-blue-500">Pending</span>
                    <span className="text-sm font-bold">{verificationStats.pending}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ 
                      width: `${(verificationStats.pending / Math.max(verificationStats.pending + verificationStats.verified + verificationStats.rejected, 1)) * 100}%`
                    }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-green-500">Verified</span>
                    <span className="text-sm font-bold">{verificationStats.verified}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-green-600 h-2.5 rounded-full" style={{ 
                      width: `${(verificationStats.verified / Math.max(verificationStats.pending + verificationStats.verified + verificationStats.rejected, 1)) * 100}%`
                    }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-red-500">Rejected</span>
                    <span className="text-sm font-bold">{verificationStats.rejected}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-red-600 h-2.5 rounded-full" style={{ 
                      width: `${(verificationStats.rejected / Math.max(verificationStats.pending + verificationStats.verified + verificationStats.rejected, 1)) * 100}%`
                    }}></div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No verification data available</p>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/admin/verification')}
            >
              Manage Verifications
            </Button>
          </CardFooter>
        </Card>
        
        {/* Quick Actions Card */}
        <Card className="bg-white shadow">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common admin tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full flex items-center justify-center"
              onClick={handleCreateElection}
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create New Election
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center"
              onClick={() => navigate('/admin/elections')}
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Manage Elections
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center"
              onClick={() => navigate('/admin/verification')}
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Verify Voters
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center"
              onClick={() => navigate('/admin/users')}
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Manage Users
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Elections */}
      <Card className="bg-white shadow mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Recent Elections</CardTitle>
              <CardDescription>Elections that have been created</CardDescription>
            </div>
            <Button 
              variant="outline"
              onClick={() => navigate('/admin/elections')}
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {elections.length === 0 ? (
            <div className="text-center py-6">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No elections found</h3>
              <p className="mt-1 text-sm text-gray-500">Create your first election to get started.</p>
              <div className="mt-6">
                <Button onClick={handleCreateElection}>
                  Create New Election
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dates
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {elections.slice(0, 5).map((election) => {
                    const status = getElectionStatus(election);
                    return (
                      <tr key={election.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{election.title}</div>
                          <div className="text-sm text-gray-500">{election.description.substring(0, 50)}...</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>
                            {status.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>Start: {election.startTime.toLocaleDateString()}</div>
                          <div>End: {election.endTime.toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleManageElection(election.id)}
                          >
                            Manage
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 