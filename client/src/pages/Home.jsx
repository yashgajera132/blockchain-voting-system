import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';

export default function Home() {
  // State to track scroll position for animations
  const [scrollY, setScrollY] = useState(0);
  
  // States for interactive elements
  const [activeFeature, setActiveFeature] = useState(null);
  const [activeStep, setActiveStep] = useState(null);
  
  // Track scroll position for scroll-triggered animations
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Features data
  const features = [
    { id: 1, icon: '🛡️', title: 'Secure & Immutable', description: 'Once recorded, votes cannot be altered thanks to blockchain technology ensuring tamper-proof elections.' },
    { id: 2, icon: '🔓', title: 'Transparent', description: 'Everyone can verify the results without revealing individual votes, providing trust through transparency.' },
    { id: 3, icon: '📊', title: 'Real-time Results', description: 'Watch election results as they happen with instant counting and verification of every vote.' },
    { id: 4, icon: '📱', title: 'Accessible', description: 'Vote from anywhere, on any device, making participation easier and increasing voter turnout.' }
  ];

  // Add a Getting Started section for the presentation
  const renderPresentationGuide = () => {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Presentation Guide</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="bg-blue-500 text-white w-12 h-12 flex items-center justify-center rounded-full mb-4 font-bold text-xl">1</div>
              <h3 className="text-xl font-bold mb-2">Register & Login</h3>
              <p className="text-gray-700 mb-4">Create an account as a voter or administrator to access the platform.</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Register with email
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Select user role
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Login using credentials
                </li>
              </ul>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg">
              <div className="bg-green-500 text-white w-12 h-12 flex items-center justify-center rounded-full mb-4 font-bold text-xl">2</div>
              <h3 className="text-xl font-bold mb-2">Admin Setup</h3>
              <p className="text-gray-700 mb-4">Administrators can create and manage elections on the blockchain.</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Create new elections
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Add candidates
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Verify voter eligibility
                </li>
              </ul>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-lg">
              <div className="bg-purple-500 text-white w-12 h-12 flex items-center justify-center rounded-full mb-4 font-bold text-xl">3</div>
              <h3 className="text-xl font-bold mb-2">Voting Process</h3>
              <p className="text-gray-700 mb-4">Participate in secure, transparent blockchain voting.</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Connect wallet
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Cast your vote
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  View election results
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-bold mb-4">Presentation Quick Start</h3>
            <ol className="space-y-4">
              <li className="flex items-start">
                <div className="bg-blue-600 text-white w-8 h-8 flex items-center justify-center rounded-full mr-3 flex-shrink-0">1</div>
                <div>
                  <p className="font-medium">Register an admin account</p>
                  <p className="text-gray-600 mt-1">Click "Sign Up" and check the "Register as Administrator" checkbox.</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-blue-600 text-white w-8 h-8 flex items-center justify-center rounded-full mr-3 flex-shrink-0">2</div>
                <div>
                  <p className="font-medium">Create a sample election</p>
                  <p className="text-gray-600 mt-1">Go to Admin dashboard and click "Create New Election" button.</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-blue-600 text-white w-8 h-8 flex items-center justify-center rounded-full mr-3 flex-shrink-0">3</div>
                <div>
                  <p className="font-medium">Register a voter account</p>
                  <p className="text-gray-600 mt-1">Open a new browser or incognito window and register a voter account.</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-blue-600 text-white w-8 h-8 flex items-center justify-center rounded-full mr-3 flex-shrink-0">4</div>
                <div>
                  <p className="font-medium">Cast a vote in the election</p>
                  <p className="text-gray-600 mt-1">Access the Elections page, select a candidate, and submit your vote.</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-blue-600 text-white w-8 h-8 flex items-center justify-center rounded-full mr-3 flex-shrink-0">5</div>
                <div>
                  <p className="font-medium">View results</p>
                  <p className="text-gray-600 mt-1">As admin, check the election results in the admin dashboard.</p>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Modern Hero Section with faster animations */}
      <section className="relative pt-16 pb-0 overflow-hidden bg-gradient-to-r from-blue-600 to-blue-800">
        {/* Animated shapes background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute w-64 h-64 rounded-full bg-blue-400 opacity-10 -top-20 -left-20 animate-pulse" style={{animationDuration: '4s'}}></div>
          <div className="absolute w-96 h-96 rounded-full bg-blue-300 opacity-5 top-40 -right-20 animate-pulse" style={{animationDuration: '6s'}}></div>
          <div className="absolute w-48 h-48 rounded-full bg-blue-500 opacity-10 bottom-10 left-1/4 animate-pulse" style={{animationDuration: '5s'}}></div>
        </div>
        
        <div className="container relative z-10 mx-auto px-4 pb-24">
          <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-8">
            <div className="w-full md:w-1/2 text-center md:text-left" 
                style={{animation: 'fadeInUp 0.5s ease-out forwards'}}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                Secure <span className="text-blue-200">Blockchain</span><br/>Voting System
              </h1>
              <p className="text-xl text-blue-100 mb-8 max-w-lg">
                Revolutionizing democracy with transparent, tamper-proof, and accessible voting technology.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link
                  to="/elections"
                  className="bg-white text-blue-700 px-6 py-3 rounded-lg font-medium shadow-md transition-all duration-200 hover:shadow-lg transform hover:-translate-y-1 hover:bg-blue-50"
                >
                  View Active Elections
                </Link>
                <a
                  href="#how-it-works"
                  className="bg-transparent text-white border border-white/30 backdrop-blur-sm px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:bg-white/10 hover:border-white/50"
                >
                  Learn How It Works
                </a>
              </div>
            </div>
            
            <div className="w-full md:w-1/2 flex justify-center"
                style={{animation: 'fadeIn 0.5s ease-out forwards'}}>
              <div className="relative w-72 h-72">
                <div className="absolute inset-0 bg-blue-300 rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute inset-4 bg-blue-200 rounded-full opacity-30 animate-pulse" style={{animationDelay: '0.3s'}}></div>
                <div className="absolute inset-8 bg-blue-100 rounded-full opacity-40 animate-pulse" style={{animationDelay: '0.6s'}}></div>
                <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                  <span className="text-8xl">🗳️</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave separator - more natural curve shape */}
        <div className="relative w-full" style={{ marginBottom: "-1px" }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-auto block">
            <path 
              fill="#ffffff" 
              fillOpacity="1" 
              d="M0,64L80,58.7C160,53,320,43,480,48C640,53,800,75,960,74.7C1120,75,1280,53,1360,42.7L1440,32L1440,80L1360,80C1280,80,1120,80,960,80C800,80,640,80,480,80C320,80,160,80,80,80L0,80Z"
            ></path>
          </svg>
        </div>
      </section>

      {/* Features Section with faster animations */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 
            className="text-3xl font-bold text-center text-gray-900 mb-3"
            style={{
              animation: scrollY > 100 ? 'fadeIn 0.4s ease-out forwards' : 'none'
            }}
          >
            Key Features
          </h2>
          <p
            className="text-gray-600 text-center max-w-xl mx-auto mb-12"
            style={{
              animation: scrollY > 100 ? 'fadeIn 0.4s ease-out 0.1s forwards' : 'none'
            }}
          >
            Our blockchain voting platform offers unparalleled security and transparency
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={feature.id}
                className="opacity-0"
                style={{
                  animation: scrollY > 200 ? `fadeInUp 0.4s ease-out ${index * 0.1}s forwards` : 'none'
                }}
                onMouseEnter={() => setActiveFeature(feature.id)}
                onMouseLeave={() => setActiveFeature(null)}
              >
                <Card className={`transition-all duration-200 h-full ${activeFeature === feature.id ? 'shadow-lg transform -translate-y-1 border-blue-300' : 'hover:shadow-md hover:-translate-y-1 border-transparent'}`}>
                  <CardHeader>
                    <div className={`w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 transition-transform duration-200 ${activeFeature === feature.id ? 'transform scale-110' : ''}`}>
                      <span className="text-blue-600 font-bold text-xl">{feature.icon}</span>
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CSS for animations in index.css */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeInUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInRight {
          from { 
            opacity: 0;
            transform: translateX(-20px);
          }
          to { 
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes growLine {
          from { 
            opacity: 0;
            transform: scaleY(0);
            transform-origin: top;
          }
          to { 
            opacity: 1;
            transform: scaleY(1);
            transform-origin: top;
          }
        }
      `}</style>

      {/* How it Works Section with enhanced visuals */}
      <section id="how-it-works" className="py-20 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <h2 
            className="text-4xl font-bold text-center text-gray-900 mb-3 opacity-0"
            style={{
              animation: scrollY > 500 ? 'fadeIn 0.4s ease-out forwards' : 'none'
            }}
          >
            How It Works
          </h2>
          <p 
            className="text-xl text-gray-600 text-center max-w-2xl mx-auto mb-16 opacity-0"
            style={{
              animation: scrollY > 500 ? 'fadeIn 0.4s ease-out 0.1s forwards' : 'none'
            }}
          >
            Our blockchain voting system makes participation simple, secure, and transparent
          </p>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8 relative">
              {/* Animated connecting line */}
              <div className="absolute left-5 top-10 bottom-10 w-1 bg-gradient-to-b from-blue-400 to-blue-600 hidden md:block opacity-0"
                style={{
                  animation: scrollY > 550 ? 'growLine 0.8s ease-out forwards' : 'none'
                }}
              ></div>
              
              {/* Step 1 */}
              <div 
                className="flex flex-col md:flex-row md:items-center group opacity-0"
                style={{ animation: scrollY > 600 ? 'fadeInRight 0.4s ease-out forwards' : 'none' }}
                onMouseEnter={() => setActiveStep(1)}
                onMouseLeave={() => setActiveStep(null)}
              >
                <div className="flex-shrink-0 mb-4 md:mb-0">
                  <div className={`bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mr-6 font-bold text-xl shadow-md transition-all duration-200 relative z-10 ${activeStep === 1 ? 'transform scale-110 shadow-lg' : 'group-hover:scale-105'}`}>
                    1
                  </div>
                </div>
                <div className={`md:ml-8 bg-white rounded-xl p-6 shadow-md border border-blue-100 transition-all duration-200 ${activeStep === 1 ? 'shadow-lg border-blue-300' : 'group-hover:shadow-lg group-hover:border-blue-200'}`}>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">Register & Verify</h3>
                  <p className="text-gray-600 text-lg">
                    Create an account and verify your identity using our secure authentication process. 
                    Your personal information is encrypted and protected.
                  </p>
                </div>
              </div>
              
              {/* Step 2 */}
              <div 
                className="flex flex-col md:flex-row md:items-center group opacity-0"
                style={{ animation: scrollY > 650 ? 'fadeInRight 0.4s ease-out 0.1s forwards' : 'none' }}
                onMouseEnter={() => setActiveStep(2)}
                onMouseLeave={() => setActiveStep(null)}
              >
                <div className="flex-shrink-0 mb-4 md:mb-0">
                  <div className={`bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mr-6 font-bold text-xl shadow-md transition-all duration-200 relative z-10 ${activeStep === 2 ? 'transform scale-110 shadow-lg' : 'group-hover:scale-105'}`}>
                    2
                  </div>
                </div>
                <div className={`md:ml-8 bg-white rounded-xl p-6 shadow-md border border-blue-100 transition-all duration-200 ${activeStep === 2 ? 'shadow-lg border-blue-300' : 'group-hover:shadow-lg group-hover:border-blue-200'}`}>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">Connect Your Wallet</h3>
                  <p className="text-gray-600 text-lg">
                    Link your blockchain wallet to our platform to enable secure voting transactions.
                    No technical knowledge required - we'll guide you through the process.
                  </p>
                </div>
              </div>
              
              {/* Step 3 */}
              <div 
                className="flex flex-col md:flex-row md:items-center group opacity-0"
                style={{ animation: scrollY > 700 ? 'fadeInRight 0.4s ease-out 0.2s forwards' : 'none' }}
                onMouseEnter={() => setActiveStep(3)}
                onMouseLeave={() => setActiveStep(null)}
              >
                <div className="flex-shrink-0 mb-4 md:mb-0">
                  <div className={`bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mr-6 font-bold text-xl shadow-md transition-all duration-200 relative z-10 ${activeStep === 3 ? 'transform scale-110 shadow-lg' : 'group-hover:scale-105'}`}>
                    3
                  </div>
                </div>
                <div className={`md:ml-8 bg-white rounded-xl p-6 shadow-md border border-blue-100 transition-all duration-200 ${activeStep === 3 ? 'shadow-lg border-blue-300' : 'group-hover:shadow-lg group-hover:border-blue-200'}`}>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">Cast Your Vote</h3>
                  <p className="text-gray-600 text-lg">
                    Browse active elections, review candidates, and cast your vote securely on the blockchain.
                    Your vote is encrypted and cannot be traced back to you.
                  </p>
                </div>
              </div>
              
              {/* Step 4 */}
              <div 
                className="flex flex-col md:flex-row md:items-center group opacity-0"
                style={{ animation: scrollY > 750 ? 'fadeInRight 0.4s ease-out 0.3s forwards' : 'none' }}
                onMouseEnter={() => setActiveStep(4)}
                onMouseLeave={() => setActiveStep(null)}
              >
                <div className="flex-shrink-0 mb-4 md:mb-0">
                  <div className={`bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mr-6 font-bold text-xl shadow-md transition-all duration-200 relative z-10 ${activeStep === 4 ? 'transform scale-110 shadow-lg' : 'group-hover:scale-105'}`}>
                    4
                  </div>
                </div>
                <div className={`md:ml-8 bg-white rounded-xl p-6 shadow-md border border-blue-100 transition-all duration-200 ${activeStep === 4 ? 'shadow-lg border-blue-300' : 'group-hover:shadow-lg group-hover:border-blue-200'}`}>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">Verify Results</h3>
                  <p className="text-gray-600 text-lg">
                    Track the voting results in real-time and verify that your vote has been counted correctly.
                    All results are publically verifiable on the blockchain.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div 
            className="mt-12 text-center opacity-0"
            style={{ animation: scrollY > 800 ? 'fadeInUp 0.4s ease-out forwards' : 'none' }}
          >
            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-medium shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-1 transform"
            >
              Get Started Now
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section with improved styling */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 
            className="text-3xl font-bold text-center text-gray-900 mb-3 opacity-0"
            style={{ animation: scrollY > 1000 ? 'fadeIn 0.4s ease-out forwards' : 'none' }}
          >
            What People Are Saying
          </h2>
          <p
            className="text-gray-600 text-center max-w-xl mx-auto mb-12 opacity-0"
            style={{ animation: scrollY > 1000 ? 'fadeIn 0.4s ease-out 0.1s forwards' : 'none' }}
          >
            Hear from election officials, voters, and organizations using our platform
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div 
              className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-xl border border-gray-100 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 transform opacity-0"
              style={{ animation: scrollY > 1100 ? 'fadeInUp 0.4s ease-out forwards' : 'none' }}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full mr-4 flex items-center justify-center text-white font-bold transition-transform hover:scale-110 duration-200">
                  JD
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">John Doe</h4>
                  <p className="text-sm text-gray-500">Election Commissioner</p>
                </div>
              </div>
              <p className="text-gray-600">
                "This platform has transformed how we run elections. The transparency and security have significantly increased voter confidence."
              </p>
            </div>
            
            <div 
              className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-xl border border-gray-100 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 transform opacity-0"
              style={{ animation: scrollY > 1100 ? 'fadeInUp 0.4s ease-out 0.1s forwards' : 'none' }}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full mr-4 flex items-center justify-center text-white font-bold transition-transform hover:scale-110 duration-200">
                  AS
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Alice Smith</h4>
                  <p className="text-sm text-gray-500">Regular Voter</p>
                </div>
              </div>
              <p className="text-gray-600">
                "Being able to vote from my phone and verify my vote was counted correctly gives me peace of mind that my voice matters."
              </p>
            </div>
            
            <div 
              className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-xl border border-gray-100 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 transform opacity-0"
              style={{ animation: scrollY > 1100 ? 'fadeInUp 0.4s ease-out 0.2s forwards' : 'none' }}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full mr-4 flex items-center justify-center text-white font-bold transition-transform hover:scale-110 duration-200">
                  RJ
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Robert Johnson</h4>
                  <p className="text-sm text-gray-500">University President</p>
                </div>
              </div>
              <p className="text-gray-600">
                "We've implemented this for student government elections and have seen a 40% increase in participation. The results are instant and indisputable."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section with enhanced design */}
      <section className="relative py-20 bg-gradient-to-r from-blue-700 to-blue-900 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute w-64 h-64 rounded-full bg-blue-500 opacity-10 -top-20 right-20 animate-pulse" style={{animationDuration: '4s'}}></div>
          <div className="absolute w-80 h-80 rounded-full bg-blue-400 opacity-5 bottom-10 -left-40 animate-pulse" style={{animationDuration: '6s'}}></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 
            className="text-3xl font-bold text-white mb-4 opacity-0"
            style={{ animation: scrollY > 1400 ? 'fadeIn 0.4s ease-out forwards' : 'none' }}
          >
            Ready to experience the future of voting?
          </h2>
          <p 
            className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto opacity-0"
            style={{ animation: scrollY > 1400 ? 'fadeIn 0.4s ease-out 0.1s forwards' : 'none' }}
          >
            Join thousands of organizations and individuals who are making voting more secure, transparent, and accessible.
          </p>
          <div 
            className="flex flex-col sm:flex-row gap-4 justify-center opacity-0"
            style={{ animation: scrollY > 1400 ? 'fadeInUp 0.4s ease-out 0.2s forwards' : 'none' }}
          >
            <Link
              to="/register"
              className="bg-white hover:bg-gray-100 text-blue-700 px-6 py-3 rounded-lg font-medium shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-1 transform"
            >
              Create Account
            </Link>
            <Link
              to="/elections"
              className="bg-transparent border border-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:bg-white/10 hover:border-white/50"
            >
              Explore Elections
            </Link>
          </div>
        </div>
      </section>

      {/* Add Presentation Guide */}
      {renderPresentationGuide()}
    </div>
  );
} 