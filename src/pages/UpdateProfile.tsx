import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

interface UpdateUserDto {
  userName?: string;
  first_name?: string;
  last_name?: string;
  mobile_no?: string;
  birth_date?: string;
}

const UpdateProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<UpdateUserDto>({
    first_name: '',
    last_name: '',
    userName: '',
    mobile_no: '',
    birth_date: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [nextUpdateDate, setNextUpdateDate] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('/users/profile');
        const userData = response.data;
        setFormData({
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          userName: userData.userName || '',
          mobile_no: userData.mobile_no || '',
          birth_date: userData.birth_date ? new Date(userData.birth_date).toISOString().split('T')[0] : ''
        });
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch user data');
        console.error('Error fetching user data:', err);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Get email from localStorage or context
      const email = localStorage.getItem('userEmail');
      if (!email) {
        setError('User email not found');
        return;
      }

      const response = await api.patch(`/users/update?email=${email}`, {
        userName: formData.userName,
        first_name: formData.first_name,
        last_name: formData.last_name,
        mobile_no: formData.mobile_no,
        birth_date: formData.birth_date
      });

      if (response.data) {
        setSuccess(response.data.message);
        setNextUpdateDate(response.data.nextUpdateAvailable);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
      console.error('Error updating profile:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Update Profile</h2>
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
            {nextUpdateDate && (
              <p className="mt-2 text-sm">Next update available on: {nextUpdateDate}</p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="userName" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="userName"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="mobile_no" className="block text-sm font-medium text-gray-700">
              Mobile Number
            </label>
            <input
              type="tel"
              id="mobile_no"
              name="mobile_no"
              value={formData.mobile_no}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700">
              Birth Date
            </label>
            <input
              type="date"
              id="birth_date"
              name="birth_date"
              value={formData.birth_date}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Update Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProfile; 