import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { Button } from './ui/Button';

export default function BlockchainConnectionRequired({ 
  title = "Blockchain Connection Required",
  message = "You need to connect to the blockchain to access this feature. Please connect your wallet to continue.",
  redirectPath = "/"
}) {
  const { connect } = useWeb3();
  const navigate = useNavigate();

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <svg className="h-16 w-16 text-yellow-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 className="text-2xl font-bold text-yellow-600 mb-4">{title}</h2>
        <p className="text-gray-700 mb-4">
          {message}
        </p>
        <div className="space-y-4">
          <Button 
            onClick={handleConnect}
            className="w-full"
          >
            Connect Wallet
          </Button>
          <Button 
            onClick={() => navigate(redirectPath)}
            variant="ghost"
            className="w-full"
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
} 