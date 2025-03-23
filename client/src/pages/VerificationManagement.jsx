import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

export default function VerificationManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/');
      return;
    }

    fetchVerifications();
  }, [user]);

  const fetchVerifications = async () => {
    try {
      const response = await fetch('/api/verification/pending', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch verifications');
      }

      const data = await response.json();
      setVerifications(data.verifications);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching verifications:', err);
      setError('Failed to load verifications');
      setLoading(false);
    }
  };

  const handleVerify = async (verificationId) => {
    try {
      setProcessing(true);
      const response = await fetch(`/api/verification/${verificationId}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to verify user');
      }

      await fetchVerifications();
      toast.success('User verified successfully');
    } catch (err) {
      console.error('Error verifying user:', err);
      toast.error('Failed to verify user');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (verificationId) => {
    if (!window.confirm('Are you sure you want to reject this verification?')) {
      return;
    }

    try {
      setProcessing(true);
      const response = await fetch(`/api/verification/${verificationId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to reject verification');
      }

      await fetchVerifications();
      toast.success('Verification rejected');
    } catch (err) {
      console.error('Error rejecting verification:', err);
      toast.error('Failed to reject verification');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading verifications...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Verification Management</h1>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {verifications.map((verification) => (
          <Card key={verification.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{verification.user.name}</CardTitle>
                  <CardDescription>{verification.user.email}</CardDescription>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Pending
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">ID Card</h3>
                  <div className="mt-2">
                    <img
                      src={verification.idCardUrl}
                      alt="ID Card"
                      className="max-w-full h-auto rounded-lg shadow-sm"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Selfie</h3>
                  <div className="mt-2">
                    <img
                      src={verification.selfieUrl}
                      alt="Selfie"
                      className="max-w-full h-auto rounded-lg shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-4">
              <Button
                onClick={() => handleReject(verification.id)}
                disabled={processing}
                variant="destructive"
              >
                Reject
              </Button>
              <Button
                onClick={() => handleVerify(verification.id)}
                disabled={processing}
              >
                Verify
              </Button>
            </CardFooter>
          </Card>
        ))}

        {verifications.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No pending verifications.
          </div>
        )}
      </div>
    </div>
  );
} 