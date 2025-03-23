import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
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
import { toast } from 'react-hot-toast';

// Protected Route component that checks authentication
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  // Debug log for protected routes
  console.log(`ProtectedRoute check for ${location.pathname}:`, { 
    user, 
    adminOnly, 
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
    // Store the intended location for potential redirect after proper login
    localStorage.setItem('adminRedirect', location.pathname);
    toast.error("Admin access required");
    return <Navigate to="/" replace />;
  }
  
  // Authentication passed, render the children
  return children;
};

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
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
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/elections" element={
          <ProtectedRoute adminOnly={true}>
            <ElectionManagement />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/candidates" element={
          <ProtectedRoute adminOnly={true}>
            <CandidateManagement />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/verification" element={
          <ProtectedRoute adminOnly={true}>
            <VerificationManagement />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/users" element={
          <ProtectedRoute adminOnly={true}>
            <UserManagement />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/create-election" element={
          <ProtectedRoute adminOnly={true}>
            <CreateElection />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}
