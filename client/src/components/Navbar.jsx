import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';

export default function Navbar() {
  const { connect, disconnect, account, isActive, chainId } = useWeb3();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  console.log('Navbar - user:', user);

  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    // Close profile menu if it's open
    if (isProfileOpen) setIsProfileOpen(false);
  };
  
  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
    // Close main menu if it's open
    if (isMenuOpen) setIsMenuOpen(false);
  };
  
  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  };
  
  // Close menus when changing routes
  useEffect(() => {
    closeMenus();
  }, [location.pathname]);
  
  // Get network name based on chainId
  const getNetworkName = (chainId) => {
    switch (chainId) {
      case 1:
        return 'Ethereum Mainnet';
      case 5:
        return 'Goerli Testnet';
      case 11155111:
        return 'Sepolia Testnet';
      case 1337:
        return 'Local Network';
      case 31337:
        return 'Hardhat Network';
      default:
        return `Network ID: ${chainId}`;
    }
  };
  
  // Handle wallet connection
  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Connection error:', error);
    }
  };

  console.log('Navbar - user:', user);
  
  // Handle wallet disconnection
  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error('Disconnection error:', error);
    }
  };
  
  // Handle user logout
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  // Format account address for display
  const formatAccount = (account) => {
    return `${account.substring(0, 6)}...${account.substring(account.length - 4)}`;
  };
  
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="/logo.png" 
                alt="Votechain" 
                className="h-8 w-auto mr-2"
              />
              <span className="text-xl font-bold text-gray-900">Votechain</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md font-medium">
              Home
            </Link>
            <Link to="/elections" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md font-medium">
              Elections
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md font-medium">
              About
            </Link>
            {user && user.role === 'admin' && (
              <Link to="/admin" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md font-medium">
                Admin
              </Link>
            )}
          </div>
          
          <div className="hidden md:flex md:items-center md:space-x-4">
            {user ? (
              // Only show wallet connection when logged in
              account ? (
                <div className="relative">
                  <button
                    onClick={toggleProfile}
                    className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md transition-colors duration-200"
                  >
                    <span className="font-medium">{formatAccount(account)}</span>
                    <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <div className="text-sm font-medium text-gray-900">{user.name || user.email}</div>
                        <div className="text-xs text-gray-500">{getNetworkName(chainId)}</div>
                      </div>
                      
                      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Profile
                      </Link>
                      
                      {user.role === 'admin' && (
                        <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Admin Dashboard
                        </Link>
                      )}
                      
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign out
                      </button>
                      
                      <button
                        onClick={handleDisconnect}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Disconnect Wallet
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Button onClick={handleConnect} variant="outline">
                  Connect Wallet
                </Button>
              )
            ) : (
              // Show login button when not logged in
              <Link to="/login">
                <Button>Sign In</Button>
              </Link>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100">
              Home
            </Link>
            <Link to="/elections" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100">
              Elections
            </Link>
            <Link to="/about" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100">
              About
            </Link>
            {user && user.role === 'admin' && (
              <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                Admin
              </Link>
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {account ? (
              <div className="px-2 space-y-1">
                <div className="px-3 py-2">
                  <div className="text-base font-medium text-gray-800">{formatAccount(account)}</div>
                  <div className="text-sm font-medium text-gray-500">{getNetworkName(chainId)}</div>
                </div>
                <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                  Profile
                </Link>
                {user && user.role === 'admin' && (
                  <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                    Admin Dashboard
                  </Link>
                )}
                {user && (
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                )}
                <button
                  onClick={handleDisconnect}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-100"
                >
                  Disconnect Wallet
                </button>
              </div>
            ) : (
              <div className="px-2 space-y-2">
                <Button onClick={handleConnect} className="w-full" variant="outline">
                  Connect Wallet
                </Button>
                {!user && (
                  <Link to="/login">
                    <Button className="w-full">Sign In</Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
} 