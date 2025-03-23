import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import axios from 'axios';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../components/ui/Card';
import { toast } from 'react-hot-toast';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/Alert';

export default function ElectionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { contract, loading: web3Loading, account } = useWeb3();
  const { user, loading: authLoading } = useAuth();
  
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState('');
  const [electionStatus, setElectionStatus] = useState({ text: '', color: '', isActive: false });
  const [source, setSource] = useState('database');

  // Fetch election details when component mounts
  useEffect(() => {
    fetchElectionDetails();
  }, [id, contract, user]);

  useEffect(() => {
    if (election) {
      const status = getElectionStatus(election);
      setElectionStatus(status);
    }
  }, [election]);

  const fetchElectionDetails = async () => {
    setLoading(true);
    setError('');
    
    try {
      // First try to fetch from database
      const dbElection = await fetchFromDatabase();
      
      if (dbElection) {
        setElection(dbElection);
        setCandidates(dbElection.candidates || []);
        setSource('database');
        
        // Check if user has already voted
        if (user && dbElection.voters) {
          const hasUserVoted = dbElection.voters.some(voter => voter.voter === user._id);
          setHasVoted(hasUserVoted);
        }
        
        // If election has ended, set results
        const now = new Date();
        if (now > new Date(dbElection.endTime)) {
          setResults(dbElection.candidates.map(c => ({
            candidateId: c._id,
            candidateName: c.name,
            voteCount: c.voteCount || 0
          })));
        }
      } else if (contract) {
        // If not found in database, try blockchain
        const blockchainElection = await fetchFromBlockchain();
        
        if (blockchainElection) {
          setElection(blockchainElection);
          setCandidates(blockchainElection.candidates || []);
          setSource('blockchain');
          
          // Check if user has voted in this blockchain election
          if (user && account) {
            try {
              const hasVoted = await contract.hasVoted(id, account);
              setHasVoted(hasVoted);
            } catch (err) {
              console.error("Error checking if user has voted:", err);
            }
          }
          
          // If election has ended, fetch results from blockchain
          const now = new Date();
          if (now > blockchainElection.endTime) {
            try {
              const results = await fetchResultsFromBlockchain();
              setResults(results);
            } catch (err) {
              console.error("Error fetching results from blockchain:", err);
            }
          }
        } else {
          setError('Election not found');
        }
      } else {
        setError('Unable to connect to blockchain or database');
      }
    } catch (err) {
      console.error('Error fetching election details:', err);
      setError('Failed to load election details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFromDatabase = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/elections/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (response.data.success) {
        return {
          id: response.data.data._id,
          blockchainId: response.data.data.blockchainId,
          title: response.data.data.title,
          description: response.data.data.description,
          startTime: new Date(response.data.data.startTime),
          endTime: new Date(response.data.data.endTime),
          isActive: response.data.data.isActive,
          createdBy: response.data.data.createdBy,
          candidates: response.data.data.candidates || [],
          voters: response.data.data.voters || []
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching from database:', error);
      return null;
    }
  };

  const fetchFromBlockchain = async () => {
    try {
      if (!contract) return null;
      
      const electionData = await contract.getElection(id);
      
      // Fetch candidates
      const candidateCount = await contract.getCandidateCount(id);
      const candidatePromises = [];
      
      for (let i = 1; i <= candidateCount.toNumber(); i++) {
        candidatePromises.push(contract.getCandidate(id, i));
      }
      
      const candidateResults = await Promise.all(candidatePromises);
      const formattedCandidates = candidateResults.map((candidate, index) => ({
        id: index + 1,
        name: candidate.name,
        description: candidate.description,
        voteCount: candidate.voteCount ? candidate.voteCount.toNumber() : 0
      }));
      
      return {
        id: parseInt(id),
        blockchainId: parseInt(id),
        title: electionData.title,
        description: electionData.description,
        startTime: new Date(electionData.startTime.toNumber() * 1000),
        endTime: new Date(electionData.endTime.toNumber() * 1000),
        isActive: electionData.isActive,
        candidates: formattedCandidates
      };
    } catch (error) {
      console.error('Error fetching from blockchain:', error);
      return null;
    }
  };

  const fetchResultsFromBlockchain = async () => {
    try {
      const candidateCount = await contract.getCandidateCount(id);
      const candidatePromises = [];
      
      for (let i = 1; i <= candidateCount.toNumber(); i++) {
        candidatePromises.push(contract.getCandidate(id, i));
      }
      
      const candidateResults = await Promise.all(candidatePromises);
      return candidateResults.map((candidate, index) => ({
        candidateId: index + 1,
        candidateName: candidate.name,
        voteCount: candidate.voteCount ? candidate.voteCount.toNumber() : 0
      }));
    } catch (error) {
      console.error('Error fetching results from blockchain:', error);
      return [];
    }
  };

  const handleVote = async () => {
    if (!selectedCandidate) {
      toast("Please select a candidate to vote for");
      return;
    }
    
    if (!user) {
      toast("Please log in to vote");
      navigate('/login', { state: { from: `/elections/${id}` } });
      return;
    }
    
    setVoting(true);
    try {
      if (source === 'database') {
        await voteInDatabase(selectedCandidate);
      } else if (contract && account) {
        await voteInBlockchain(selectedCandidate);
      } else {
        throw new Error("Voting unavailable. Please check your connection.");
      }
      
      setHasVoted(true);
      setSelectedCandidate(null);
      toast.success("Your vote has been recorded successfully!");
      fetchElectionDetails(); // Refresh data
    } catch (err) {
      console.error('Error during voting:', err);
      toast.error(`Failed to record vote: ${err.message}`);
    } finally {
      setVoting(false);
    }
  };

  const voteInDatabase = async (candidateId) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Authentication required");
    
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/elections/${id}/vote`,
      { candidateId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to record vote");
    }
    
    return response.data;
  };

  const voteInBlockchain = async (candidateId) => {
    if (!contract) throw new Error("Blockchain connection required");
    
    const tx = await contract.vote(id, candidateId);
    await tx.wait();
    
    return true;
  };

  const getElectionStatus = (election) => {
    if (!election) return { text: '', color: '', isActive: false };
    
    const now = new Date();
    
    if (!election.isActive) {
      return { 
        text: 'Inactive', 
        color: 'bg-gray-100 text-gray-800',
        isActive: false
      };
    } else if (now < election.startTime) {
      return { 
        text: 'Upcoming', 
        color: 'bg-blue-100 text-blue-800',
        isActive: false
      };
    } else if (now > election.endTime) {
      return { 
        text: 'Ended', 
        color: 'bg-red-100 text-red-800',
        isActive: false
      };
    } else {
      return { 
        text: 'Active', 
        color: 'bg-green-100 text-green-800',
        isActive: true
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

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-center">
          <Button onClick={fetchElectionDetails}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert>
          <AlertTitle>Election Not Found</AlertTitle>
          <AlertDescription>This election may not exist or has been removed.</AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-center">
          <Button onClick={() => navigate('/elections')}>View All Elections</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <h1 className="text-3xl font-bold">{election.title}</h1>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${electionStatus.color}`}>
            {electionStatus.text}
          </span>
        </div>
        <p className="text-gray-600 mb-4">{election.description}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center">
            <span className="font-medium mr-2">Start Date:</span>
            <span>{formatDate(election.startTime)}</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium mr-2">End Date:</span>
            <span>{formatDate(election.endTime)}</span>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 mb-4">
          Source: {source}
          {election.blockchainId && <span> | Blockchain ID: {election.blockchainId}</span>}
        </div>
      </div>
      
      {hasVoted && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <AlertTitle>Thank you for voting!</AlertTitle>
          <AlertDescription>Your vote has been recorded.</AlertDescription>
        </Alert>
      )}
      
      {!user && electionStatus.isActive && (
        <Alert className="mb-6">
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>Please log in to vote in this election.</AlertDescription>
          <div className="mt-2">
            <Button
              onClick={() => navigate('/login', { state: { from: `/elections/${id}` } })}
            >
              Log In
            </Button>
          </div>
        </Alert>
      )}

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Candidates</h2>
        {candidates.length === 0 ? (
          <p className="text-gray-600">No candidates available for this election.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidates.map((candidate) => (
              <Card 
                key={candidate.id || candidate._id} 
                className={`cursor-pointer transition-all ${
                  selectedCandidate === (candidate.id || candidate._id) 
                    ? 'border-blue-500 shadow-md' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => {
                  if (electionStatus.isActive && !hasVoted && user) {
                    setSelectedCandidate(candidate.id || candidate._id);
                  }
                }}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{candidate.name}</CardTitle>
                    {selectedCandidate === (candidate.id || candidate._id) && (
                      <div className="bg-blue-500 text-white rounded-full p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {candidate.imageUrl && (
                    <div className="h-32 w-full mb-4 bg-gray-200 rounded-md overflow-hidden">
                      <img 
                        src={candidate.imageUrl} 
                        alt={candidate.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <p className="text-gray-600 mb-4">{candidate.description}</p>
                  
                  {results && (
                    <div className="mt-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">Votes</span>
                        <span className="text-sm font-bold">
                          {results.find(r => r.candidateId === (candidate.id || candidate._id))?.voteCount || 0}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ 
                            width: `${(results.find(r => r.candidateId === (candidate.id || candidate._id))?.voteCount / 
                              Math.max(...results.map(r => r.voteCount), 1)) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {electionStatus.isActive && !hasVoted && user && (
        <div className="flex justify-center mb-8">
          <Button 
            onClick={handleVote} 
            disabled={!selectedCandidate || voting}
            className="px-8 py-3 text-lg"
          >
            {voting ? 'Submitting Vote...' : 'Submit Vote'}
          </Button>
        </div>
      )}
      
      {results && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Results</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="space-y-4">
              {results.sort((a, b) => b.voteCount - a.voteCount).map((result, index) => {
                const candidate = candidates.find(c => (c.id || c._id) === result.candidateId);
                const totalVotes = results.reduce((sum, r) => sum + r.voteCount, 0);
                const percentage = totalVotes > 0 ? (result.voteCount / totalVotes) * 100 : 0;
                
                return (
                  <div key={result.candidateId} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        {index === 0 && (
                          <span className="text-yellow-500 mr-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zm7-10a1 1 0 01.707.293l.707.707.707-.707A1 1 0 0116 3v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0V6h-1a1 1 0 110-2h1V3a1 1 0 011-1zm0 10a1 1 0 01.707.293l.707.707.707-.707A1 1 0 0116 13v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                          </span>
                        )}
                        <span className="font-medium">{candidate ? candidate.name : `Candidate ${result.candidateId}`}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold">{result.voteCount}</span>
                        <span className="text-gray-500 ml-1">({percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`${index === 0 ? 'bg-green-600' : 'bg-blue-600'} h-2.5 rounded-full`} 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              
              <div className="pt-4 border-t border-gray-200 mt-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Votes</span>
                  <span className="font-bold">{results.reduce((sum, r) => sum + r.voteCount, 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => navigate('/elections')}
        >
          Back to Elections
        </Button>
        
        {user && user.role === 'admin' && (
          <Button 
            variant="outline"
            onClick={() => navigate(`/election-management/${id}`)}
          >
            Manage Election
          </Button>
        )}
      </div>
    </div>
  );
} 