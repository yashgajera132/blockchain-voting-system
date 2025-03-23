import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import LoadingSpinner from './LoadingSpinner';

export default function WalletConnectButton({ 
  buttonText = 'Connect Wallet', 
  className = '', 
  variant = 'primary',
  size = 'medium' 
}) {
  const { connect, disconnect, active, account, chainId } = useWeb3();
  const [isConnecting, setIsConnecting] = useState(false);

  // Format account address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Get network name based on chain ID
  const getNetworkName = (id) => {
    switch(id) {
      case 1: return 'Ethereum';
      case 5: return 'Goerli';
      case 11155111: return 'Sepolia';
      case 1337: return 'Local';
      default: return 'Unknown';
    }
  };

  // Define variant classes
  const variantClasses = {
    primary: active 
      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
      : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white',
    secondary: active 
      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300' 
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300',
    outline: active 
      ? 'bg-transparent border border-blue-600 text-blue-600 hover:bg-blue-50' 
      : 'bg-transparent border border-gray-600 text-gray-600 hover:bg-gray-50',
  };

  // Define size classes
  const sizeClasses = {
    small: 'px-3 py-1 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-5 py-2.5 text-lg',
  };

  const baseClasses = 'font-medium rounded-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50';

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connect();
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div>
      {active ? (
        <div className="flex items-center">
          <button
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className} flex items-center`}
            onClick={disconnect}
          >
            <span className="inline-block h-2 w-2 rounded-full bg-green-400 mr-2"></span>
            <span>{formatAddress(account)}</span>
            <span className="ml-2 text-xs opacity-80">({getNetworkName(chainId)})</span>
          </button>
        </div>
      ) : (
        <button
          className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className} flex items-center justify-center`}
          onClick={handleConnect}
          disabled={isConnecting}
        >
          {isConnecting ? (
            <LoadingSpinner size="small" message={null} />
          ) : (
            <>
              <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 7H7v6h6V7z" />
                <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
              </svg>
              {buttonText}
            </>
          )}
        </button>
      )}
    </div>
  );
} 