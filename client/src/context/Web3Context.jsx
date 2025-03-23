import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-hot-toast';
import { formatBlockchainError } from '../utils/blockchainErrorHandler';

// Contract ABI and address
import VotingABI from '../contracts/Voting.json';
const VOTING_CONTRACT_ADDRESS = import.meta.env.VITE_VOTING_CONTRACT_ADDRESS;
const ELECTION_VOTERS_ADDRESS = import.meta.env.VITE_ELECTION_VOTERS_ADDRESS;

const Web3Context = createContext();

export function Web3Provider({ children }) {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [elections, setElections] = useState([]);
  const [connecting, setConnecting] = useState(false);
  const [votersContract, setVotersContract] = useState(null);

  // Initialize ethers
  useEffect(() => {
    const init = async () => {
      try {
        // Check if window.ethereum is available (MetaMask or other wallet)
        if (window.ethereum) {
          // Create ethers provider - using the correct import for ethers version
          const ethersProvider = new ethers.BrowserProvider(window.ethereum);
          setProvider(ethersProvider);

          // Set up event listeners for account and chain changes
          window.ethereum.on('accountsChanged', handleAccountsChanged);
          window.ethereum.on('chainChanged', handleChainChanged);
          
          // Check if already connected
          const accounts = await ethersProvider.listAccounts();
          if (accounts.length > 0) {
            const ethersSigner = await ethersProvider.getSigner();
            const signerAddress = await ethersSigner.getAddress();
            const network = await ethersProvider.getNetwork();
            
            setAccount(signerAddress);
            setChainId(Number(network.chainId));
            setSigner(ethersSigner);
            setIsActive(true);
            
            try {
              // Initialize contract
              const votingContract = new ethers.Contract(
                VOTING_CONTRACT_ADDRESS,
                VotingABI.abi,
                ethersSigner
              );
              
              // Test if contract is accessible
              await votingContract.getElectionCount();
              setContract(votingContract);
            } catch (contractError) {
              console.error("Contract not accessible:", contractError);
              toast.error("Could not connect to voting contract. Please check your network connection and contract address.");
            }
          }
        } else {
          console.error("No Ethereum wallet detected");
          toast.error("No Ethereum wallet detected. Please install MetaMask or another wallet extension.");
        }
        setLoading(false);
      } catch (err) {
        console.error('Error initializing ethers:', err);
        setError(err);
        toast.error("Failed to initialize blockchain connection: " + err.message);
        setLoading(false);
      }
    };

    init();

    // Cleanup event listeners
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  // Handle account changes
  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      setAccount(null);
      setSigner(null);
      setContract(null);
      setIsActive(false);
      toast.info('Wallet disconnected');
    } else {
      // User switched accounts
      const newAccount = accounts[0];
      setAccount(newAccount);
      
      if (provider) {
        const newSigner = await provider.getSigner();
        setSigner(newSigner);
        
        try {
          // Update contract with new signer
          const votingContract = new ethers.Contract(
            VOTING_CONTRACT_ADDRESS,
            VotingABI.abi,
            newSigner
          );
          // Test if contract is accessible
          await votingContract.getElectionCount();
          setContract(votingContract);
        } catch (contractError) {
          console.error("Contract not accessible:", contractError);
          setContract(null);
          toast.error("Could not connect to voting contract. Please check your network connection and contract address.");
        }
        setIsActive(true);
        toast.success(`Connected to account: ${newAccount.substring(0, 6)}...${newAccount.substring(38)}`);
      }
    }
  };

  // Handle chain changes
  const handleChainChanged = (chainIdHex) => {
    window.location.reload();
  };

  // Connect wallet
  async function connect(silent = false) {
    if (connecting) return;
    
    setConnecting(true);
    try {
      if (!window.ethereum) {
        if (!silent) {
          toast.error('No Ethereum wallet detected. Please install MetaMask or another wallet extension.');
        }
        console.error('No Ethereum wallet detected');
        setConnecting(false);
        return false;
      }
      
      // Request account access
      if (!silent) toast.loading('Connecting to wallet...');
      const ethersProvider = new ethers.BrowserProvider(window.ethereum);
      
      await ethersProvider.send('eth_requestAccounts', []);
      const accounts = await ethersProvider.listAccounts();
      
      if (accounts.length === 0) {
        if (!silent) {
          toast.dismiss();
          toast.error('No accounts found. Please create an account in your wallet.');
        }
        setConnecting(false);
        return false;
      }
      
      const ethersSigner = await ethersProvider.getSigner();
      const signerAddress = await ethersSigner.getAddress();
      const network = await ethersProvider.getNetwork();
      
      setProvider(ethersProvider);
      setSigner(ethersSigner);
      setAccount(signerAddress);
      setChainId(Number(network.chainId));
      setIsActive(true);
      
      try {
        // Initialize contract
        const votingContract = new ethers.Contract(
          VOTING_CONTRACT_ADDRESS,
          VotingABI.abi,
          ethersSigner
        );
        
        // Test if contract is accessible
        await votingContract.getElectionCount();
        setContract(votingContract);
        
        if (!silent) {
          toast.dismiss();
          toast.success('Connected to wallet successfully!');
        }
        setConnecting(false);
        return true;
      } catch (contractError) {
        console.error("Contract not accessible:", contractError);
        if (!silent) {
          toast.dismiss();
          toast.error('Failed to connect to voting contract. Please check your network and contract address.');
        }
        setConnecting(false);
        return false;
      }
    } catch (err) {
      console.error('Error connecting to wallet:', err);
      if (!silent) {
        toast.dismiss();
        toast.error(`Failed to connect: ${err.message}`);
      }
      setConnecting(false);
      return false;
    }
  }

  // Disconnect wallet
  async function disconnect() {
    try {
      setAccount(null);
      setSigner(null);
      setContract(null);
      setIsActive(false);
      
      toast.success('Disconnected from wallet');
      return true;
    } catch (err) {
      console.error('Error disconnecting:', err);
      toast.error(`Failed to disconnect: ${err.message}`);
      return false;
    }
  }

  // Create a new election
  async function createElection(title, description, startTime, endTime) {
    try {
      if (!contract) {
        throw new Error('Contract not connected');
      }
      
      const startTimestamp = Math.floor(new Date(startTime).getTime() / 1000);
      const endTimestamp = Math.floor(new Date(endTime).getTime() / 1000);
      
      const tx = await contract.createElection(
        title,
        description,
        startTimestamp,
        endTimestamp
      );
      
      const receipt = await tx.wait();
      const electionId = receipt.logs[0].args[0].toNumber();
      
      return {
        success: true,
        electionId,
        transactionHash: receipt.hash
      };
    } catch (err) {
      console.error('Error creating election:', err);
      throw formatBlockchainError(err);
    }
  }

  // Add a candidate to an election
  async function addCandidate(electionId, name, party) {
    try {
      if (!contract) {
        throw new Error('Contract not connected');
      }
      
      const tx = await contract.addCandidate(
        electionId,
        name,
        party || 'Independent' // Use party if provided, otherwise default to 'Independent'
      );
      
      const receipt = await tx.wait();
      const candidateId = receipt.logs[0].args[1].toNumber();
      
      return {
        success: true,
        candidateId,
        transactionHash: receipt.hash
      };
    } catch (err) {
      console.error('Error adding candidate:', err);
      throw formatBlockchainError(err);
    }
  }

  // Cast a vote
  async function castVote(electionId, candidateId) {
    try {
      if (!contract) {
        throw new Error('Contract not connected');
      }
      
      const tx = await contract.vote(electionId, candidateId);
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: receipt.hash
      };
    } catch (err) {
      console.error('Error casting vote:', err);
      throw formatBlockchainError(err);
    }
  }

  // Get a specific election's details
  async function getElection(electionId) {
    try {
      if (!contract) throw new Error('Contract not connected');
      
      const election = await contract.getElection(electionId);
      return formatElection(election, electionId);
    } catch (err) {
      console.error('Error getting election:', err);
      throw formatBlockchainError(err);
    }
  }

  // Get a specific candidate's details
  async function getCandidate(electionId, candidateId) {
    try {
      if (!contract) throw new Error('Contract not connected');
      
      const candidate = await contract.getCandidate(electionId, candidateId);
      return formatCandidate(candidate, candidateId);
    } catch (err) {
      console.error('Error getting candidate:', err);
      throw formatBlockchainError(err);
    }
  }

  // Verify a voter
  async function verifyVoter(voterAddress) {
    try {
      if (!votersContract) {
        if (!signer) {
          throw new Error('Wallet not connected');
        }
        
        const votersContractInstance = new ethers.Contract(
          ELECTION_VOTERS_ADDRESS,
          VotersABI.abi,
          signer
        );
        
        setVotersContract(votersContractInstance);
      }
      
      // Either use the already set contract or the new one
      const contract = votersContract || votersContractInstance;
      
      // Call the contract to verify the voter
      const isVerified = await contract.isVerifiedVoter(voterAddress);
      return isVerified;
    } catch (err) {
      console.error('Error verifying voter:', err);
      // Return false instead of throwing, as this is a check function
      return false;
    }
  }

  useEffect(() => {
    if (contract) {
      // Add event listeners for blockchain events
      contract.on('VoteCast', handleVoteCast);
      contract.on('ElectionCreated', handleElectionCreated);
      contract.on('CandidateAdded', handleCandidateAdded);
      
      return () => {
        // Remove event listeners when component unmounts
        contract.off('VoteCast', handleVoteCast);
        contract.off('ElectionCreated', handleElectionCreated);
        contract.off('CandidateAdded', handleCandidateAdded);
      };
    }
  }, [contract]);

  // Event handlers
  const handleVoteCast = (electionId, candidateId, voter, event) => {
    toast.success(`Vote cast for candidate ${candidateId} in election ${electionId}`);
  };

  const handleElectionCreated = (electionId, title, event) => {
    toast.success(`New election created: ${title}`);
  };

  const handleCandidateAdded = (electionId, candidateId, name, event) => {
    toast.success(`New candidate added: ${name}`);
  };

  // Utility functions for formatting data
  function formatElection(election, id) {
    return {
      id: id,
      title: election.title,
      description: election.description,
      startTime: new Date(election.startTime.toNumber() * 1000),
      endTime: new Date(election.endTime.toNumber() * 1000),
      isActive: election.isActive,
      owner: election.owner
    };
  }

  function formatCandidate(candidate, id) {
    return {
      id: id,
      name: candidate.name,
      description: candidate.description,
      voteCount: candidate.voteCount.toNumber()
    };
  }

  // Get all elections
  async function getAllElections() {
    try {
      if (!contract) throw new Error('Contract not connected');
      
      const count = await contract.getElectionCount();
      const electionPromises = [];
      
      for (let i = 1; i <= count.toNumber(); i++) {
        electionPromises.push(contract.getElection(i));
      }
      
      const electionResults = await Promise.all(electionPromises);
      return electionResults.map((election, index) => formatElection(election, index + 1));
    } catch (err) {
      console.error('Error getting all elections:', err);
      throw formatBlockchainError(err);
    }
  }

  useEffect(() => {
    const loadElections = async () => {
      if (contract) {
        try {
          const allElections = await getAllElections();
          setElections(allElections);
        } catch (err) {
          console.error('Error loading elections:', err);
        }
      }
    };
    
    if (contract) {
      loadElections();
    }
  }, [contract]);
  
  return (
    <Web3Context.Provider value={{
      provider,
      signer,
      contract,
      account,
      chainId,
      isActive,
      loading,
      error,
      connect,
      disconnect,
      createElection,
      addCandidate,
      castVote,
      getElection,
      getCandidate,
      getAllElections,
      verifyVoter,
      elections
    }}>
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  return useContext(Web3Context);
} 