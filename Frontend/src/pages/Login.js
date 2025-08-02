import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom'; // ✅ Added for redirection

const Login = () => {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [anonymousName, setAnonymousName] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, user } = useAuth(); // ✅ Destructure `user` to check login status
  const navigate = useNavigate(); // ✅ Initialize navigator

  // ✅ Auto-redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email.endsWith('@pec.edu.in')) {
      toast.error('Only @pec.edu.in emails are allowed');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/auth/send-otp', { email });
      setStep('otp');
      toast.success('OTP sent to your email');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('/auth/verify-otp', {
        email,
        otp,
        anonymousName: anonymousName || undefined
      });

      login(response.data.user, response.data.token);
      toast.success('Welcome to Anonymous Social!');
      navigate('/'); // ✅ Redirect after login
    } catch (error) {
      if (error.response?.data?.message === 'Anonymous name is required') {
        setStep('register');
      } else {
        toast.error(error.response?.data?.message || 'Invalid OTP');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSendOTP = async () => {
    setLoading(true);
    try {
      await axios.post('/auth/login', { email });
      setStep('otp');
      toast.success('Login OTP sent to your email');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to initiate login. Please try sending OTP to register if you are a new user.');
      setStep('email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Anonymous Social</h1>
          <p className="text-gray-600 mt-2">Connect anonymously with PEC students</p>
        </div>

        {step === 'email' && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your-email@pec.edu.in"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Sending OTP...' : 'Send OTP (Register/Login)'}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                Enter OTP sent to {email}
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                maxLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button
              type="button"
              onClick={() => setStep('email')}
              className="w-full text-gray-600 text-sm hover:underline mt-2"
            >
              Back to email entry
            </button>
          </form>
        )}

        {step === 'register' && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <label htmlFor="anonymousName" className="block text-sm font-medium text-gray-700 mb-1">
                Choose Anonymous Name
              </label>
              <input
                type="text"
                id="anonymousName"
                value={anonymousName}
                onChange={(e) => setAnonymousName(e.target.value)}
                placeholder="CoolTiger123"
                maxLength={20}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Max 20 characters</p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
            <button
              type="button"
              onClick={() => setStep('otp')}
              className="w-full text-gray-600 text-sm hover:underline mt-2"
            >
              Back to OTP
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
