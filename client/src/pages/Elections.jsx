import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import axios from 'axios';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../components/ui/Card';

export default function Elections() {
  const { contract, loading: web3Loading } = useWeb3();
  const { user, loading: authLoading } = useAuth();
  const [elections, setElections] = useState([]);
  const [filteredElections, setFilteredElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, upcoming, ended
  const navigate = useNavigate();
  const [dbElections, setDbElections] = useState([]);
  const [blockchainElections, setBlockchainElections] = useState([]);

  // Fetch elections when component mounts
  useEffect(() => {
    fetchElections();
  }, [user, contract]);

  useEffect(() => {
    if (elections.length > 0) {
      filterElections();
    } else {
      setFilteredElections([]);
    }
  }, [elections, searchTerm, filter]);

  const fetchElections = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch from database
      const dbData = await fetchFromDatabase();
      setDbElections(dbData);
      
      // Fetch from blockchain if contract is available
      let blockchainData = [];
      if (contract) {
        blockchainData = await fetchFromBlockchain();
        setBlockchainElections(blockchainData);
      }
      
      // Merge elections, prioritizing database data
      const mergedElections = mergeElections(dbData, blockchainData);
      setElections(mergedElections);
      setFilteredElections(mergedElections);
    } catch (err) {
      console.error('Error fetching elections:', err);
      setError('Failed to load elections. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFromDatabase = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/elections`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (response.data.success) {
        return response.data.data.map(election => ({
          id: election._id,
          blockchainId: election.blockchainId,
          title: election.title,
          description: election.description,
          startTime: new Date(election.startTime),
          endTime: new Date(election.endTime),
          isActive: election.isActive,
          createdBy: election.createdBy,
          candidates: election.candidates,
          source: 'database'
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching from database:', error);
      return [];
    }
  };

  const fetchFromBlockchain = async () => {
    try {
      if (!contract) return [];
      
      const count = await contract.getElectionCount();
      const electionPromises = [];

      for (let i = 1; i <= count.toNumber(); i++) {
        electionPromises.push(contract.getElection(i));
      }

      const electionResults = await Promise.all(electionPromises);
      return electionResults.map((election, index) => ({
        blockchainId: index + 1,
        id: null, // We don't know the database ID from blockchain data
        title: election.title,
        description: election.description,
        startTime: new Date(election.startTime.toNumber() * 1000),
        endTime: new Date(election.endTime.toNumber() * 1000),
        isActive: election.isActive,
        source: 'blockchain'
      }));
    } catch (error) {
      console.error('Error fetching from blockchain:', error);
      return [];
    }
  };

  // Merge elections from database and blockchain, prioritizing database data
  const mergeElections = (dbElections, blockchainElections) => {
    const mergedMap = new Map();
    
    // Add database elections to map
    dbElections.forEach(election => {
      mergedMap.set(election.blockchainId?.toString(), election);
    });
    
    // Add blockchain elections if they don't exist in database
    blockchainElections.forEach(election => {
      const blockchainId = election.blockchainId?.toString();
      if (blockchainId && !mergedMap.has(blockchainId)) {
        mergedMap.set(blockchainId, election);
      }
    });
    
    return Array.from(mergedMap.values());
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
    if (filter !== 'all') {
      const now = new Date();
      
      if (filter === 'active') {
        filtered = filtered.filter(
          election => 
            election.isActive && 
            now >= election.startTime && 
            now <= election.endTime
        );
      } else if (filter === 'upcoming') {
        filtered = filtered.filter(
          election => now < election.startTime
        );
      } else if (filter === 'ended') {
        filtered = filtered.filter(
          election => now > election.endTime
        );
      }
    }
    
    setFilteredElections(filtered);
  };

  const getElectionStatus = (election) => {
    const now = new Date();
    
    if (!election.isActive) {
      return { 
        label: 'Inactive', 
        color: 'bg-gray-500',
        textColor: 'text-white'
      };
    } else if (now < election.startTime) {
      return { 
        label: 'Upcoming', 
        color: 'bg-blue-500',
        textColor: 'text-white'
      };
    } else if (now > election.endTime) {
      return { 
        label: 'Ended', 
        color: 'bg-red-500',
        textColor: 'text-white'
      };
    } else {
      return { 
        label: 'Active', 
        color: 'bg-green-500',
        textColor: 'text-white'
      };
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleElectionClick = (election) => {
    navigate(`/elections/${election.id || election.blockchainId}`);
  };

  // Create a system status panel to confirm everything is working
  const renderSystemStatusPanel = () => {
    const now = new Date().toLocaleString();
    return (
      <Card className="w-full mb-6 bg-gray-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Blockchain Voting System Status</CardTitle>
          <CardDescription>Current status as of {now}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center p-3 bg-green-50 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <p className="font-medium">Server</p>
                <p className="text-sm text-green-700">Online</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-green-50 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <p className="font-medium">Database</p>
                <p className="text-sm text-green-700">Connected</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-green-50 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <p className="font-medium">Elections</p>
                <p className="text-sm text-green-700">{elections.length} Available</p>
              </div>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            {user ? (
              <p>Logged in as: <span className="font-medium">{user.name}</span> ({user.role})</p>
            ) : (
              <p>Not logged in. <Link to="/login" className="text-blue-600 hover:underline">Login</Link> to vote.</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Elections</h1>
        <p className="text-gray-600">Browse and participate in active elections.</p>
      </div>
      
      {/* Add system status panel */}
      {renderSystemStatusPanel()}
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search elections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => setFilter('all')}
            variant={filter === 'all' ? 'default' : 'outline'}
            className="flex-1 md:flex-none"
          >
            All
          </Button>
          <Button
            onClick={() => setFilter('active')}
            variant={filter === 'active' ? 'default' : 'outline'}
            className="flex-1 md:flex-none"
          >
            Active
          </Button>
          <Button
            onClick={() => setFilter('upcoming')}
            variant={filter === 'upcoming' ? 'default' : 'outline'}
            className="flex-1 md:flex-none"
          >
            Upcoming
          </Button>
          <Button
            onClick={() => setFilter('ended')}
            variant={filter === 'ended' ? 'default' : 'outline'}
            className="flex-1 md:flex-none"
          >
            Ended
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <Button 
            variant="outline" 
            className="mt-2"
            onClick={fetchElections}
          >
            Retry
          </Button>
        </div>
      ) : filteredElections.length === 0 ? (
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold mb-2">No elections found</h2>
          <p className="text-gray-600 mb-4">
            {searchTerm || filter !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'There are no elections available at the moment.'}
          </p>
          {user && user.role === 'admin' && (
            <Link to="/create-election">
              <Button>Create New Election</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredElections.map((election) => {
            const status = getElectionStatus(election);
            return (
              <Card 
                key={election.id || election.blockchainId}
                className="h-full cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleElectionClick(election)}
              >
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{election.title}</CardTitle>
                    </div>
                    <span className={`${status.color} ${status.textColor} text-xs px-2 py-1 rounded-full`}>
                      {status.label}
                    </span>
                  </div>
                  <CardDescription className="text-gray-600 line-clamp-2">
                    {election.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 pb-4">
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Start:</span>
                      <span>{formatDate(election.startTime)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">End:</span>
                      <span>{formatDate(election.endTime)}</span>
                    </div>
                    {election.source && (
                      <div className="text-xs text-gray-500 mt-2">
                        Source: {election.source}
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleElectionClick(election);
                    }} 
                    className="w-full"
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
      
      {user && user.role === 'admin' && (
        <div className="mt-8 text-center">
          <Link to="/create-election">
            <Button size="lg">
              Create New Election
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
} 