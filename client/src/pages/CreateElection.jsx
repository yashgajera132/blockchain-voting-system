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
import axios from 'axios';
import { toastService } from '../utils/toast';

export default function CreateElection() {
  console.log("CreateElection component is mounting");
  
  const navigate = useNavigate();
  const { contract, connect } = useWeb3();
  const { user, loading: authLoading } = useAuth();
  
  const [contractMissing, setContractMissing] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
  });
  
  const [candidates, setCandidates] = useState([
    { name: '', description: '', imageUrl: '' }
  ]);
  
  const [step, setStep] = useState(1); // 1: Election details, 2: Candidates
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  // Log user data and check admin status
  useEffect(() => {
    console.log("CreateElection - User data:", user);
    console.log("CreateElection - Auth loading:", authLoading);
    console.log("CreateElection - Contract available:", !!contract);
    
    const isAdmin = user?.isAdmin || user?.role === 'admin';
    console.log("Is user admin?", isAdmin);
    
    // If user data loaded and user is not admin, redirect
    if (!authLoading && user && !isAdmin) {
      toast.error("Admin access required");
      navigate('/');
    }
  }, [user, authLoading, navigate, contract]);

  // Check contract availability
  useEffect(() => {
    if (!contract && !authLoading) {
      console.log("Contract not available in CreateElection");
      setContractMissing(true);
    } else {
      setContractMissing(false);
    }
  }, [contract, authLoading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleCandidateChange = (index, field, value) => {
    const newCandidates = [...candidates];
    newCandidates[index][field] = value;
    setCandidates(newCandidates);
  };
  
  const addCandidate = () => {
    setCandidates([...candidates, { name: '', description: '', imageUrl: '' }]);
  };
  
  const removeCandidate = (index) => {
    if (candidates.length > 1) {
      const newCandidates = [...candidates];
      newCandidates.splice(index, 1);
      setCandidates(newCandidates);
    } else {
      toast.error('At least one candidate is required');
    }
  };

  const validateStep1 = () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }
    if (!formData.startTime) {
      setError('Start time is required');
      return false;
    }
    if (!formData.endTime) {
      setError('End time is required');
      return false;
    }

    const startTime = new Date(formData.startTime).getTime() / 1000;
    const endTime = new Date(formData.endTime).getTime() / 1000;

    if (startTime >= endTime) {
      setError('End time must be after start time');
      return false;
    }

    if (startTime < Math.floor(Date.now() / 1000)) {
      setError('Start time cannot be in the past');
      return false;
    }
    
    return true;
  };
  
  const validateCandidates = () => {
    for (let i = 0; i < candidates.length; i++) {
      if (!candidates[i].name.trim()) {
        setError(`Candidate ${i + 1} name is required`);
        return false;
      }
      if (!candidates[i].description.trim()) {
        setError(`Candidate ${i + 1} description is required`);
        return false;
      }
    }
    return true;
  };
  
  const handleNext = (e) => {
    e.preventDefault(); // Prevent form submission which might cause navigation
    
    setError('');
    
    if (validateStep1()) {
      console.log("Moving to step 2 (candidates)");
      setStep(2);
    }
  };
  
  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateCandidates()) {
      return;
    }
    
    // Check contract availability
    if (!contract) {
      toastService.error("Blockchain contract is not connected. Please connect your wallet.");
      setContractMissing(true);
      return;
    }
    
    setIsSubmitting(true);
    console.log("=== ELECTION CREATION PROCESS STARTED ===");
    console.log("API URL being used:", API_URL);
    console.log("User:", user);

    try {
      console.log("Starting election creation");
      const startTime = new Date(formData.startTime).getTime() / 1000;
      const endTime = new Date(formData.endTime).getTime() / 1000;
      console.log("Election time range:", new Date(startTime * 1000), "to", new Date(endTime * 1000));
      
      let electionId;
      let blockchainTxHash = null;

      // Create election on blockchain
      toastService.loading('Creating election on blockchain...');
      
      const tx = await contract.createElection(
        formData.title,
        formData.description,
        startTime,
        endTime
      );
      console.log("Transaction created:", tx);
      const receipt = await tx.wait();
      console.log("Transaction confirmed with hash:", receipt.hash);
      blockchainTxHash = receipt.hash;
      
      // Get the newly created election ID
      const electionCount = await contract.getElectionCount();
      electionId = electionCount.toNumber();
      console.log("New election ID:", electionId);
      
      // Add candidates to blockchain
      toastService.loading('Adding candidates to blockchain...');
      for (const candidate of candidates) {
        console.log("Adding candidate to blockchain:", candidate);
        const candidateTx = await contract.addCandidate(
          electionId,
          candidate.name,
          candidate.description,
          candidate.imageUrl || 'https://randomuser.me/api/portraits/lego/1.jpg' // Default image if none provided
        );
        await candidateTx.wait();
      }

      // Now save to the database
      toastService.loading('Saving to database...');
      
      try {
        // Get token for API authorization
        const token = localStorage.getItem('token');
        console.log("Auth token available:", !!token);
        
        // Prepare election data for API
        const electionData = {
          blockchainId: electionId,
          title: formData.title,
          description: formData.description,
          startTime: new Date(formData.startTime).toISOString(),
          endTime: new Date(formData.endTime).toISOString(),
          isActive: true,
          blockchainTxHash: blockchainTxHash,
          candidates: candidates.map(candidate => ({
            name: candidate.name,
            description: candidate.description,
            imageUrl: candidate.imageUrl || 'https://randomuser.me/api/portraits/lego/1.jpg'
          }))
        };
        
        console.log("Sending election data to database:", electionData);
        
        // Send to API
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.post(`${API_URL}/elections`, electionData, { headers });
        
        console.log("Database save response:", response.data);
        
        if (!response.data.success) {
          // If database save fails but blockchain succeeded, show warning
          console.log("Database save indicated failure:", response.data);
          toast('Election created on blockchain but database sync failed. Some features may be limited.', {
            icon: '⚠️',
            style: {
              borderRadius: '10px',
              background: '#FEF3C7',
              color: '#92400E',
            },
          });
        }
      } catch (dbError) {
        console.error("Database save error:", dbError);
        console.log("Database error details:", dbError.response?.data || dbError.message);
        // Don't fail the whole operation if just the DB part fails
        toast('Election was created but database synchronization failed. Some features may be limited.', {
          icon: '⚠️',
          style: {
            borderRadius: '10px',
            background: '#FEF3C7',
            color: '#92400E',
          },
        });
      }

      console.log("=== ELECTION CREATION COMPLETED ===");
      toastService.dismiss();
      toastService.success('Election created successfully!');
      navigate('/admin/elections');
    } catch (err) {
      console.error('Error creating election:', err);
      console.log("Error details:", err.response?.data || err.message);
      toastService.dismiss();
      toastService.error(err.message || 'Failed to create election');
      setError(err.message || 'Failed to create election');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Modified admin check - accept either isAdmin property or role field
  const isAdmin = user?.isAdmin || user?.role === 'admin';

  // Show loading while waiting for auth
  if (authLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Wait for user data to load
  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent mx-auto"></div>
          <p className="mt-4">Loading user data...</p>
        </div>
      </div>
    );
  }
  
  // If user is not admin, don't render the component
  if (!isAdmin) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
          <p className="mt-2">You need admin privileges to access this page.</p>
          <Button 
            className="mt-4" 
            onClick={() => navigate('/')}
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  // Show contract error message if needed
  if (contractMissing) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <svg className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Blockchain Connection Error</h2>
          <p className="text-gray-700 mb-4">
            The blockchain contract is not connected. This could be because:
          </p>
          <ul className="text-left text-gray-700 mb-6 list-disc pl-8">
            <li>Your wallet is not connected</li>
            <li>Your wallet is connected to the wrong network</li>
            <li>The blockchain contract is not deployed on this network</li>
          </ul>
          <div className="space-y-4">
            <Button 
              onClick={() => connect()}
              className="w-full"
            >
              Connect Wallet
            </Button>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              className="w-full"
            >
              Refresh Page
            </Button>
            <Button 
              onClick={() => navigate('/admin/elections')}
              variant="ghost"
              className="w-full"
            >
              Back to Elections
            </Button>
          </div>
        </div>
      </div>
    );
  }

  console.log("Rendering CreateElection component with step:", step);

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header with navigation */}
      <div className="mb-6 flex items-center">
        <button 
          onClick={() => navigate('/admin/elections')}
          className="mr-4 text-blue-600 hover:text-blue-800 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Elections
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Create New Election</h1>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Create New Election</CardTitle>
          <CardDescription>
            {step === 1 
              ? 'Fill in the election details below.'
              : 'Add candidates for this election.'}
          </CardDescription>
        </CardHeader>
        
        {/* Step indicators */}
        <div className="px-6 mb-4">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'} mr-2`}>
              1
            </div>
            <div className={`h-1 w-16 ${step === 2 ? 'bg-blue-600' : 'bg-gray-200'} mx-1`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'} ml-2`}>
              2
            </div>
            <div className="ml-4 text-sm">
              {step === 1 ? 'Election Details' : 'Add Candidates'}
            </div>
          </div>
        </div>
        
        <form onSubmit={(e) => step === 1 ? handleNext(e) : handleSubmit(e)}>
          {step === 1 ? (
            <CardContent className="space-y-6">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  placeholder="Enter election title"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  placeholder="Enter election description"
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="startTime"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    id="startTime"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="endTime"
                    className="block text-sm font-medium text-gray-700"
                  >
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    id="endTime"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    required
                  />
                </div>
              </div>
            </CardContent>
          ) : (
            <CardContent>
              <div className="space-y-6">
                {candidates.map((candidate, index) => (
                  <div key={index} className="p-4 border rounded-md relative">
                    <h3 className="font-medium mb-3">Candidate {index + 1}</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor={`candidate-name-${index}`}
                          className="block text-sm font-medium text-gray-700"
                        >
                          Name
                        </label>
                        <input
                          type="text"
                          id={`candidate-name-${index}`}
                          value={candidate.name}
                          onChange={(e) => handleCandidateChange(index, 'name', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                          placeholder="Enter candidate name"
                          required
                        />
                      </div>
                      
                      <div>
                        <label
                          htmlFor={`candidate-description-${index}`}
                          className="block text-sm font-medium text-gray-700"
                        >
                          Description
                        </label>
                        <textarea
                          id={`candidate-description-${index}`}
                          rows="2"
                          value={candidate.description}
                          onChange={(e) => handleCandidateChange(index, 'description', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                          placeholder="Enter candidate description"
                          required
                        ></textarea>
                      </div>
                      
                      <div>
                        <label
                          htmlFor={`candidate-image-${index}`}
                          className="block text-sm font-medium text-gray-700"
                        >
                          Image URL (optional)
                        </label>
                        <input
                          type="text"
                          id={`candidate-image-${index}`}
                          value={candidate.imageUrl}
                          onChange={(e) => handleCandidateChange(index, 'imageUrl', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                          placeholder="Enter image URL"
                        />
                      </div>
                    </div>
                    
                    {candidates.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCandidate(index)}
                        className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={addCandidate}
                  className="w-full"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Another Candidate
                </Button>
              </div>
            </CardContent>
          )}
          
          {error && (
            <div className="px-6 mb-4">
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}
          
          <CardFooter className="flex justify-between">
            {step === 1 ? (
              <div className="w-full">
                <Button
                  type="submit"
                  className="w-full"
                >
                  Next: Add Candidates
                </Button>
              </div>
            ) : (
              <div className="w-full flex justify-between space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    'Create Election'
                  )}
                </Button>
              </div>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 