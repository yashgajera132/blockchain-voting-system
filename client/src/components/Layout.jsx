import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import { useWeb3 } from '../context/Web3Context';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { active, loading: web3Loading } = useWeb3();
  const { loading: authLoading } = useAuth();
  
  // Combined loading state
  const isLoading = web3Loading || authLoading;

  const currentYear = new Date().getFullYear();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Network Warning Banner */}
      {active && window.ethereum && window.ethereum.chainId !== '0x1' && (
        <div className="bg-amber-500 text-white px-4 py-2 text-center text-sm font-medium">
          ⚠️ You are not connected to the Ethereum Mainnet. Some features may not work as expected.
        </div>
      )}
      
      {/* Loading Indicator */}
      {isLoading && (
        <div className="bg-blue-600 text-white px-4 py-2 text-center text-sm font-medium">
          <div className="flex justify-center items-center space-x-2">
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{authLoading ? "Loading user data..." : "Loading blockchain data..."}</span>
          </div>
        </div>
      )}
      
      <main className="flex-grow mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">BlockVote</h3>
              <p className="text-gray-600 mb-4">
                Secure and transparent blockchain-based voting system for the modern age.
              </p>
              <div className="flex space-x-4">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600">
                  <span className="sr-only">GitHub</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-600 hover:text-blue-600 transition">Home</Link>
                </li>
                <li>
                  <Link to="/elections" className="text-gray-600 hover:text-blue-600 transition">Elections</Link>
                </li>
                <li>
                  <Link to="/register" className="text-gray-600 hover:text-blue-600 transition">Register</Link>
                </li>
                <li>
                  <Link to="/login" className="text-gray-600 hover:text-blue-600 transition">Login</Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a href="https://ethereum.org" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 transition">
                    Ethereum
                  </a>
                </li>
                <li>
                  <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 transition">
                    MetaMask
                  </a>
                </li>
                <li>
                  <a href="https://etherscan.io" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 transition">
                    Etherscan
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              &copy; {currentYear} BlockVote. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-gray-500 hover:text-gray-600 text-sm">Privacy Policy</Link>
              <Link to="/terms" className="text-gray-500 hover:text-gray-600 text-sm">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 