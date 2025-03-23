import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../components/ui/Card';
import { FormMessage } from '../components/ui/Form';

export default function VerifyVoter() {
  const navigate = useNavigate();
  const { uploadVerificationDocuments, getVerificationStatus } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [files, setFiles] = useState({
    idCard: null,
    selfie: null,
  });
  const idCardRef = useRef();
  const selfieRef = useRef();

  useEffect(() => {
    checkVerificationStatus();
  }, []);

  const checkVerificationStatus = async () => {
    try {
      const status = await getVerificationStatus();
      setVerificationStatus(status);
      if (status?.status === 'verified') {
        navigate('/elections');
      }
    } catch (err) {
      console.error('Error checking verification status:', err);
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setFiles((prev) => ({
        ...prev,
        [type]: file,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!files.idCard || !files.selfie) {
      setError('Please upload both ID card and selfie');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('idCard', files.idCard);
    formData.append('selfie', files.selfie);

    try {
      await uploadVerificationDocuments(formData);
      await checkVerificationStatus();
      
      // Display success message
      toast.success('Verification documents submitted successfully!');
      
      // Redirect to profile page
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload documents');
      toast.error('Failed to upload verification documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderVerificationStatus = () => {
    if (!verificationStatus) return null;

    const statusMessages = {
      pending: {
        title: 'Verification in Progress',
        description:
          'We are reviewing your documents. This process usually takes 1-2 business days.',
        color: 'bg-yellow-50 border-yellow-200',
      },
      rejected: {
        title: 'Verification Failed',
        description:
          'Your verification was rejected. Please upload new documents.',
        color: 'bg-red-50 border-red-200',
      },
    };

    const status = statusMessages[verificationStatus.status];
    if (!status) return null;

    return (
      <div
        className={`rounded-lg border p-4 ${status.color} mb-6`}
      >
        <h3 className="text-lg font-medium mb-2">{status.title}</h3>
        <p className="text-sm">{status.description}</p>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        {renderVerificationStatus()}
        <Card>
          <CardHeader>
            <CardTitle>Verify Your Identity</CardTitle>
            <CardDescription>
              Please upload the required documents to verify your identity and
              become eligible to vote
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">
                  Required Documents
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Government-issued ID Card
                    </label>
                    <div className="flex items-center space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => idCardRef.current?.click()}
                      >
                        {files.idCard ? 'Change ID Card' : 'Upload ID Card'}
                      </Button>
                      {files.idCard && (
                        <span className="text-sm text-gray-500">
                          {files.idCard.name}
                        </span>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={idCardRef}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'idCard')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Selfie with ID Card
                    </label>
                    <div className="flex items-center space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => selfieRef.current?.click()}
                      >
                        {files.selfie ? 'Change Selfie' : 'Upload Selfie'}
                      </Button>
                      {files.selfie && (
                        <span className="text-sm text-gray-500">
                          {files.selfie.name}
                        </span>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={selfieRef}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'selfie')}
                    />
                  </div>
                </div>
              </div>
              {error && <FormMessage>{error}</FormMessage>}
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                disabled={loading || !files.idCard || !files.selfie}
                className="w-full"
              >
                {loading ? 'Uploading...' : 'Submit for Verification'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
} 