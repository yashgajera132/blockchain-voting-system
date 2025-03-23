import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
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

export default function CandidateManagement() {
  const { electionId, candidateId } = useParams();
  const navigate = useNavigate();
  const { contract } = useWeb3();
  const { user } = useAuth();
  
  const [election, setElection] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/');
      return;
    }

    if (contract && electionId) {
      fetchElection();
      if (candidateId) {
        fetchCandidate();
      }
    }
  }, [contract, electionId, candidateId, user]);

  const fetchElection = async () => {
    try {
      const electionData = await contract.getElection(electionId);
      const formattedElection = {
        id: parseInt(electionId),
        title: electionData.title,
        description: electionData.description,
        startTime: new Date(electionData.startTime.toNumber() * 1000),
        endTime: new Date(electionData.endTime.toNumber() * 1000),
        isActive: electionData.isActive,
      };
      setElection(formattedElection);
    } catch (err) {
      console.error('Error fetching election:', err);
      setError('Failed to load election details');
    }
  };

  const fetchCandidate = async () => {
    try {
      const candidateData = await contract.getCandidate(electionId, candidateId);
      setFormData({
        name: candidateData.name,
        description: candidateData.description,
        imageUrl: candidateData.imageUrl,
      });
    } catch (err) {
      console.error('Error fetching candidate:', err);
      setError('Failed to load candidate details');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate form data
      if (!formData.name.trim()) {
        throw new Error('Name is required');
      }
      if (!formData.description.trim()) {
        throw new Error('Description is required');
      }

      if (candidateId) {
        // Update existing candidate
        const tx = await contract.updateCandidate(
          electionId,
          candidateId,
          formData.name,
          formData.description,
          formData.imageUrl
        );
        await tx.wait();
        toast.success('Candidate updated successfully!');
      } else {
        // Create new candidate
        const tx = await contract.addCandidate(
          electionId,
          formData.name,
          formData.description,
          formData.imageUrl
        );
        await tx.wait();
        toast.success('Candidate added successfully!');
      }

      navigate(`/admin/elections/${electionId}`);
    } catch (err) {
      console.error('Error saving candidate:', err);
      setError(err.message || 'Failed to save candidate');
    } finally {
      setLoading(false);
    }
  };

  if (!election) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading election details...</div>
      </div>
    );
  }

  const isEditing = !!candidateId;
  const pageTitle = isEditing ? 'Edit Candidate' : 'Add New Candidate';

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>{pageTitle}</CardTitle>
          <CardDescription>
            {isEditing
              ? 'Update the candidate details below.'
              : 'Fill in the details below to add a new candidate.'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Enter candidate name"
                required
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Enter candidate description"
                required
              />
            </div>

            <div>
              <label
                htmlFor="imageUrl"
                className="block text-sm font-medium text-gray-700"
              >
                Image URL
              </label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Enter image URL (optional)"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/admin/elections/${electionId}`)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? isEditing
                  ? 'Updating...'
                  : 'Adding...'
                : isEditing
                ? 'Update Candidate'
                : 'Add Candidate'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 