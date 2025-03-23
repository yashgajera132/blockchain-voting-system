import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
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
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { toastService } from '../utils/toast';

export default function ElectionManagement() {
  const navigate = useNavigate();
  const { contract, connect, loading: web3Loading } = useWeb3();
  const { user } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  
  const [elections, setElections] = useState([]);
  const [filteredElections, setFilteredElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentStatus, setCurrentStatus] = useState('all'); // all, active, upcoming, ended
  const [processing, setProcessing] = useState(false);
  const [contractMissing, setContractMissing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    upcoming: 0,
    ended: 0
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    if (contract) {
      fetchElections();
    } else if (!web3Loading) {
      // Contract is not available
      setContractMissing(true);
      setLoading(false);
    }
  }, [contract, user, navigate, web3Loading]);

  useEffect(() => {
    if (elections.length > 0) {
      filterElections();
      calculateStats();
    }
  }, [elections, searchTerm, currentStatus]);

  const fetchElections = async () => {
    try {
      setLoading(true);
      console.log("Starting election fetch process");
      
      // First try to load from database
      let electionList = [];
      let blockchainElections = [];
      
      try {
        // Get token for API authorization
        const token = localStorage.getItem('token');
        console.log("Auth token available:", !!token);
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        // Fetch from database
        console.log("Fetching elections from database");
        const response = await axios.get(`${API_URL}/elections`, { headers });
        console.log("API URL being used:", API_URL);
        
        if (response.data && Array.isArray(response.data.elections)) {
          electionList = response.data.elections.map(election => ({
            id: election.id,
            title: election.title,
            description: election.description,
            startTime: new Date(election.startTime), 
            endTime: new Date(election.endTime),
            isActive: election.isActive,
            blockchainTxHash: election.blockchainTxHash,
            source: 'database'
          }));
          console.log("Database elections found:", electionList.length);
          console.log("Database elections:", electionList);
        } else {
          console.log("Unexpected database response format:", response.data);
        }
      } catch (dbError) {
        console.error("Failed to fetch from database:", dbError);
        console.log("Database error details:", dbError.response?.data || dbError.message);
        // Continue to blockchain fetch even if database fails
      }
      
      // Real blockchain data
      try {
        console.log("Fetching elections from blockchain");
        const count = await contract.getElectionCount();
        const electionPromises = [];

        for (let i = 1; i <= count.toNumber(); i++) {
          electionPromises.push(contract.getElection(i));
        }

        const electionResults = await Promise.all(electionPromises);
        blockchainElections = electionResults.map((election, index) => ({
          id: index + 1,
          title: election.title,
          description: election.description,
          startTime: new Date(election.startTime.toNumber() * 1000),
          endTime: new Date(election.endTime.toNumber() * 1000),
          isActive: election.isActive,
          source: 'blockchain'
        }));
        console.log("Blockchain elections:", blockchainElections);
      } catch (bcError) {
        console.error("Failed to fetch from blockchain:", bcError);
        // If blockchain fetch fails but we have DB data, continue with that
        if (electionList.length === 0) {
          throw bcError; // Re-throw if we have no data at all
        }
      }
      
      // Merge elections, prioritizing database data for IDs that exist in both
      const mergedElections = [...blockchainElections];
      console.log("Blockchain elections count:", blockchainElections.length);
      
      // Add database-only elections and update blockchain elections with database data
      electionList.forEach(dbElection => {
        const existingIndex = mergedElections.findIndex(e => Number(e.id) === Number(dbElection.id));
        
        if (existingIndex >= 0) {
          // Update existing election with database data
          mergedElections[existingIndex] = {
            ...mergedElections[existingIndex],
            ...dbElection,
            source: 'both' // Mark as existing in both sources
          };
        } else {
          // Add database-only election
          mergedElections.push(dbElection);
        }
      });
      
      console.log("Total merged elections:", mergedElections.length);
      console.log("Merged elections:", mergedElections);
      setElections(mergedElections);
      setFilteredElections(mergedElections);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching elections:', err);
      setError('Failed to load elections: ' + (err.message || 'Unknown error'));
      setLoading(false);
    }
  };

  const filterElections = () => {
    let filtered = [...elections];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        election => 
          election.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          election.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (currentStatus !== 'all') {
      const now = new Date();
      
      if (currentStatus === 'active') {
        filtered = filtered.filter(
          election => 
            election.isActive && 
            now >= election.startTime && 
            now <= election.endTime
        );
      } else if (currentStatus === 'upcoming') {
        filtered = filtered.filter(
          election => now < election.startTime
        );
      } else if (currentStatus === 'ended') {
        filtered = filtered.filter(
          election => now > election.endTime
        );
      }
    }
    
    setFilteredElections(filtered);
  };

  const calculateStats = () => {
    const now = new Date();
    const stats = {
      total: elections.length,
      active: elections.filter(e => e.isActive && now >= e.startTime && now <= e.endTime).length,
      upcoming: elections.filter(e => now < e.startTime).length,
      ended: elections.filter(e => now > e.endTime).length
    };
    
    setStats(stats);
  };

  const handleToggleActive = async (electionId) => {
    try {
      setProcessing(true);
      
      // Update on blockchain
      toastService.loading('Updating on blockchain...');
      const tx = await contract.toggleElectionStatus(electionId);
      const receipt = await tx.wait();
      console.log("Toggle status transaction confirmed:", receipt.hash);
      
      // Then update in database
      try {
        toastService.loading('Updating in database...');
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        // Get current election to toggle its status
        const election = elections.find(e => e.id === electionId);
        const newStatus = election ? !election.isActive : true;
        
        await axios.put(
          `${API_URL}/elections/${electionId}/status`, 
          { isActive: newStatus },
          { headers }
        );
        
        console.log("Database update successful");
      } catch (dbError) {
        console.error("Database update error:", dbError);
        toastService.warning('Status updated on blockchain but database sync failed.');
      }
      
      toastService.dismiss();
      toastService.success(`Election status updated successfully`);
      fetchElections();
    } catch (err) {
      console.error('Error updating election status:', err);
      toastService.dismiss();
      toastService.error('Failed to update election status: ' + (err.message || 'Unknown error'));
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteElection = async (electionId) => {
    if (!window.confirm('Are you sure you want to delete this election? This action cannot be undone.')) {
      return;
    }

    try {
      setProcessing(true);
      
      // Delete from blockchain
      toastService.loading('Deleting from blockchain...');
      const tx = await contract.deleteElection(electionId);
      const receipt = await tx.wait();
      console.log("Delete transaction confirmed:", receipt.hash);
      
      // Then delete from database
      try {
        toastService.loading('Deleting from database...');
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        await axios.delete(`${API_URL}/elections/${electionId}`, { headers });
        console.log("Database deletion successful");
      } catch (dbError) {
        console.error("Database deletion error:", dbError);
        toastService.warning('Election deleted from blockchain but database sync failed.');
      }
      
      toastService.dismiss();
      toastService.success(`Election deleted successfully`);
      fetchElections();
    } catch (err) {
      console.error('Error deleting election:', err);
      toastService.dismiss();
      toastService.error('Failed to delete election: ' + (err.message || 'Unknown error'));
    } finally {
      setProcessing(false);
    }
  };

  const handleFilterClick = (status) => {
    setCurrentStatus(status);
  };

  const getElectionStatus = (election) => {
    const now = new Date();
    if (now < election.startTime) {
      return {
        text: 'Upcoming',
        color: 'bg-blue-100 text-blue-800',
        buttonColor: 'bg-blue-600 hover:bg-blue-700'
      };
    }
    if (now > election.endTime) {
      return {
        text: 'Ended',
        color: 'bg-gray-100 text-gray-800',
        buttonColor: 'bg-gray-600 hover:bg-gray-700'
      };
    }
    if (election.isActive) {
      return {
        text: 'Active',
        color: 'bg-green-100 text-green-800',
        buttonColor: 'bg-green-600 hover:bg-green-700'
      };
    }
    return {
      text: 'Inactive',
      color: 'bg-yellow-100 text-yellow-800',
      buttonColor: 'bg-yellow-600 hover:bg-yellow-700'
    };
  };

  if (contractMissing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <svg className="h-16 w-16 text-yellow-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-2xl font-bold text-yellow-600 mb-4">Blockchain Connection Required</h2>
          <p className="text-gray-700 mb-4">
            You need to connect to the blockchain to manage elections. Please connect your wallet to continue.
          </p>
          <div className="space-y-4">
            <Button 
              onClick={() => connect()}
              className="w-full"
            >
              Connect Wallet
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (web3Loading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-pulse inline-block h-12 w-12 rounded-full bg-blue-500 mb-4"></div>
        <p className="text-xl text-center">Loading elections...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <svg className="h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xl text-center text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Elections Management</h1>
        <Link to="/admin/create-election" onClick={(e) => {
          // Verify admin role before navigation
          const userData = JSON.parse(localStorage.getItem('user')) || {};
          const isAdmin = userData.role === 'admin' || userData.isAdmin === true;
          
          if (!isAdmin) {
            e.preventDefault();
            toast.error("Admin access required");
            navigate('/login');
            // Store redirect location
            localStorage.setItem('adminRedirect', '/admin/create-election');
            return false;
          }
          
          // Ensure the admin flag is set in localStorage
          if (userData && !userData.isAdmin) {
            userData.isAdmin = true;
            localStorage.setItem('user', JSON.stringify(userData));
          }
          
          console.log("Navigating to create election page");
        }}>
          <Button>
            Create New Election
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-gray-500">Total Elections</p>
            <h3 className="text-2xl font-bold">{stats.total}</h3>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-gray-500">Active Elections</p>
            <h3 className="text-2xl font-bold">{stats.active}</h3>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-gray-500">Upcoming Elections</p>
            <h3 className="text-2xl font-bold">{stats.upcoming}</h3>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-gray-500">Ended Elections</p>
            <h3 className="text-2xl font-bold">{stats.ended}</h3>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="mb-6">
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <Input 
            type="search" 
            placeholder="Search elections..." 
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex space-x-2 mb-4">
          <Button 
            className={currentStatus === 'all' ? 'bg-blue-600' : 'bg-gray-200 text-gray-700'} 
            onClick={() => handleFilterClick('all')}
          >
            All
          </Button>
          <Button 
            className={currentStatus === 'active' ? 'bg-blue-600' : 'bg-gray-200 text-gray-700'} 
            onClick={() => handleFilterClick('active')}
          >
            Active
          </Button>
          <Button 
            className={currentStatus === 'upcoming' ? 'bg-blue-600' : 'bg-gray-200 text-gray-700'} 
            onClick={() => handleFilterClick('upcoming')}
          >
            Upcoming
          </Button>
          <Button 
            className={currentStatus === 'ended' ? 'bg-blue-600' : 'bg-gray-200 text-gray-700'} 
            onClick={() => handleFilterClick('ended')}
          >
            Ended
          </Button>
        </div>
      </div>

      {/* Elections List */}
      {filteredElections.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-xl font-medium">No elections found</h3>
          <p className="mt-1 text-gray-500">
            {searchTerm || currentStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Create your first election by clicking the "Create New Election" button.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Election
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredElections.map((election) => {
                const status = getElectionStatus(election);
                const now = new Date();
                const isEnded = now > election.endTime;
                
                return (
                  <tr key={election.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{election.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{election.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        Start: {election.startTime.toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        End: {election.endTime.toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>
                        {status.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <Link to={`/elections/${election.id}`} className="text-indigo-600 hover:text-indigo-900 inline-block">
                        View
                      </Link>
                      {!isEnded && (
                        <button 
                          onClick={() => handleToggleActive(election.id)} 
                          disabled={processing}
                          className="text-blue-600 hover:text-blue-900 inline-block"
                        >
                          {election.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteElection(election.id)} 
                        disabled={processing}
                        className="text-red-600 hover:text-red-900 inline-block"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 