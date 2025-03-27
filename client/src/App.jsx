import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useWeb3 } from './context/Web3Context';
import Layout from './components/Layout';
import Home from './pages/Home';
import Elections from './pages/Elections';
import ElectionDetails from './pages/ElectionDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import ElectionManagement from './pages/ElectionManagement';
import CandidateManagement from './pages/CandidateManagement';
import VerificationManagement from './pages/VerificationManagement';
import UserManagement from './pages/UserManagement';
import CreateElection from './pages/CreateElection';
import VerifyVoter from './pages/VerifyVoter';
import HowItWorks from './pages/HowItWorks';
import NotFound from './pages/NotFound';
import BlockchainConnectionRequired from './components/BlockchainConnectionRequired';
import { toast } from 'react-hot-toast';

// Protected Route component that checks authentication
const ProtectedRoute = ({ children, adminOnly = false, voterOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  // Debug log for protected routes
  console.log(`ProtectedRoute check for ${location.pathname}:`, { 
    user, 
    adminOnly,
    voterOnly,
    isAdmin: user?.role === 'admin' || user?.isAdmin,
    loading 
  });
  
  // First check if we're still loading auth
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse inline-block h-8 w-8 rounded-full bg-blue-600 opacity-75"></div>
        <p className="ml-3">Verifying authentication...</p>
      </div>
    );
  }
  
  // Check authentication from multiple sources
  const authUser = user || window.checkAuthState?.();
  
  // If no authenticated user, redirect to login
  if (!authUser) {
    console.log("No authenticated user, redirecting to login");
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  // Admin check - use multiple properties for better compatibility
  const isAdmin = authUser.role === 'admin' || authUser.isAdmin === true;
  
  // For admin routes, verify admin status
  if (adminOnly && !isAdmin) {
    console.log("Admin route access denied - user is not admin", { userRole: authUser.role, isAdmin: authUser.isAdmin });
    toast.error("Admin access required");
    return <Navigate to="/voter-dashboard" replace />;
  }
  
  // For voter-only routes, verify user is not admin
  if (voterOnly && isAdmin) {
    console.log("Voter route access denied - user is admin", { userRole: authUser.role, isAdmin: authUser.isAdmin });
    toast.error("This page is for voters only");
    return <Navigate to="/admin-dashboard" replace />;
  }
  
  // Authentication passed, render the children
  return children;
};

// Blockchain Protected Route for Admin
const BlockchainProtectedRoute = ({ children }) => {
  const { isActive, account } = useWeb3();
  
  // Check if wallet is connected
  if (!isActive || !account) {
    return <BlockchainConnectionRequired redirectPath="/" />;
  }
  
  // Wallet is connected, render the children
  return children;
};

export default function App() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.isAdmin === true;

  return (
    <Layout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Home Page Redirect */}
        <Route path="/" element={
          user ? (
            isAdmin ? <Navigate to="/admin-dashboard" replace /> : <Navigate to="/voter-dashboard" replace />
          ) : (
            <Home />
          )
        } />
        
        {/* Role-specific dashboards */}
        <Route path="/voter-dashboard" element={
          <ProtectedRoute voterOnly={true}>
            <Elections />
          </ProtectedRoute>
        } />
        
        <Route path="/admin-dashboard" element={
          <ProtectedRoute adminOnly={true}>
            <BlockchainProtectedRoute>
              <AdminDashboard />
            </BlockchainProtectedRoute>
          </ProtectedRoute>
        } />
        
        {/* Protected Voter Routes */}
        <Route path="/elections" element={
          <ProtectedRoute>
            <Elections />
          </ProtectedRoute>
        } />
        
        <Route path="/elections/:electionId" element={
          <ProtectedRoute>
            <ElectionDetails />
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        
        <Route path="/verify" element={
          <ProtectedRoute>
            <VerifyVoter />
          </ProtectedRoute>
        } />
        
        {/* Admin-only Routes */}
        <Route path="/admin" element={
          <ProtectedRoute adminOnly={true}>
            <BlockchainProtectedRoute>
              <AdminDashboard />
            </BlockchainProtectedRoute>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/elections" element={
          <ProtectedRoute adminOnly={true}>
            <BlockchainProtectedRoute>
              <ElectionManagement />
            </BlockchainProtectedRoute>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/candidates" element={
          <ProtectedRoute adminOnly={true}>
            <BlockchainProtectedRoute>
              <CandidateManagement />
            </BlockchainProtectedRoute>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/verification" element={
          <ProtectedRoute adminOnly={true}>
            <BlockchainProtectedRoute>
              <VerificationManagement />
            </BlockchainProtectedRoute>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/users" element={
          <ProtectedRoute adminOnly={true}>
            <BlockchainProtectedRoute>
              <UserManagement />
            </BlockchainProtectedRoute>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/create-election" element={
          <ProtectedRoute adminOnly={true}>
            <BlockchainProtectedRoute>
              <CreateElection />
            </BlockchainProtectedRoute>
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}
