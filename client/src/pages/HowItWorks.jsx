import React from 'react';
import { Link } from 'react-router-dom';
import WalletConnectButton from '../components/WalletConnectButton';

export default function HowItWorks() {
  const steps = [
    {
      title: "Create an Account",
      description: "Register with your email and password to create an account on BlockVote.",
      details: [
        "Click on the 'Register' button in the navigation menu",
        "Fill out the registration form with your personal details",
        "Verify your email address by clicking the link sent to your inbox",
        "Complete your profile setup"
      ],
      image: "account.svg"
    },
    {
      title: "Connect Your Wallet",
      description: "Connect your Ethereum wallet to interact with the blockchain.",
      details: [
        "Install MetaMask or another Ethereum wallet (if you don't have one)",
        "Create a wallet and secure your seed phrase",
        "Add some ETH to your wallet for transaction fees",
        "Click the 'Connect Wallet' button in BlockVote"
      ],
      image: "wallet.svg"
    },
    {
      title: "Complete Verification",
      description: "Verify your identity to ensure eligibility for voting.",
      details: [
        "Navigate to the verification page",
        "Submit the required identification documents",
        "Wait for verification approval from administrators",
        "Once approved, you'll be eligible to vote in elections"
      ],
      image: "verify.svg"
    },
    {
      title: "Participate in Elections",
      description: "Browse active elections and cast your vote securely.",
      details: [
        "View the list of active elections on the 'Elections' page",
        "Research candidates and their positions",
        "Select your preferred candidate",
        "Confirm your vote through your connected wallet"
      ],
      image: "vote.svg"
    }
  ];

  const faqs = [
    {
      question: "What is blockchain voting?",
      answer: "Blockchain voting uses distributed ledger technology to create a secure, transparent, and tamper-proof voting system. Each vote is recorded as a transaction on the blockchain, ensuring that votes cannot be altered or deleted once cast."
    },
    {
      question: "Do I need technical knowledge to use BlockVote?",
      answer: "No, BlockVote is designed to be user-friendly even if you're new to blockchain technology. You'll need a basic understanding of how to use a cryptocurrency wallet like MetaMask, but our interface guides you through each step."
    },
    {
      question: "Is my vote anonymous?",
      answer: "Yes, while all votes are recorded on the blockchain for transparency, your personal identity is not linked to your vote in a way that would be visible to other users. Only your wallet address is associated with your vote."
    },
    {
      question: "How much does it cost to vote?",
      answer: "The only cost associated with voting is the Ethereum gas fee for processing your transaction on the blockchain. These fees vary depending on network congestion but are typically a small amount of ETH."
    },
    {
      question: "What if I make a mistake when voting?",
      answer: "Due to the immutable nature of blockchain, votes cannot be changed once confirmed. Please review your selection carefully before submitting your vote."
    },
    {
      question: "How do I know my vote was counted?",
      answer: "After casting your vote, you'll receive a transaction confirmation and can view your vote on the blockchain via the transaction hash. BlockVote also provides a personal voting history in your profile."
    }
  ];

  return (
    <div className="pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center py-12 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">How BlockVote Works</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your complete guide to blockchain-based voting with BlockVote. Follow these simple steps to participate in secure and transparent elections.
          </p>
        </div>

        {/* Step-by-Step Guide */}
        <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {steps.map((step, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg mr-3">
                      {index + 1}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">{step.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-4">{step.description}</p>
                  <ul className="space-y-2 mb-4">
                    {step.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start">
                        <svg className="h-5 w-5 text-green-500 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  {index === 1 && (
                    <div className="flex justify-center">
                      <WalletConnectButton 
                        variant="secondary"
                        size="small"
                        className="w-full"
                      />
                    </div>
                  )}
                  {index === 0 && (
                    <Link 
                      to="/register" 
                      className="block text-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition"
                    >
                      Register Now
                    </Link>
                  )}
                  {index === 2 && (
                    <Link 
                      to="/verify" 
                      className="block text-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition"
                    >
                      Start Verification
                    </Link>
                  )}
                  {index === 3 && (
                    <Link 
                      to="/elections" 
                      className="block text-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition"
                    >
                      View Elections
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Blockchain Voting Benefits */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Benefits of Blockchain Voting</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-blue-600 mb-3">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Enhanced Security</h3>
              <p className="text-gray-600">
                Decentralized architecture protects against hacking attempts and single points of failure, ensuring vote integrity.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-blue-600 mb-3">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Complete Transparency</h3>
              <p className="text-gray-600">
                Anyone can verify the results without compromising voter privacy, ensuring trust in the electoral process.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-blue-600 mb-3">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Immutable Records</h3>
              <p className="text-gray-600">
                Once recorded, votes cannot be altered or deleted, providing a permanent and tamper-proof record of each election.
              </p>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-blue-600 text-white rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Experience Secure Blockchain Voting?</h2>
          <p className="text-lg text-blue-100 mb-6 max-w-2xl mx-auto">
            Join BlockVote today and participate in the future of secure, transparent, and accessible voting systems.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold shadow-md transition"
            >
              Create Account
            </Link>
            <Link 
              to="/elections" 
              className="bg-blue-700 hover:bg-blue-800 border border-blue-500 px-6 py-3 rounded-lg font-semibold shadow-md transition"
            >
              Explore Elections
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 