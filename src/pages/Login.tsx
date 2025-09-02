import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { AppDispatch, RootState } from '../redux/store';
import { sendLoginOTP, login, clearError, clearOTPState } from '../redux/authSlice';
import Input from '../components/Input';
import Button from '../components/Button';
import HDIcon from '../assets/HD.svg';
import RightImage from '../assets/Signup.svg';
import { Link } from 'react-router-dom';

const Login: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, otpLoading, otpSent, error, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    rememberMe: false
  });

  const [formErrors, setFormErrors] = useState({
    email: '',
    otp: ''
  });

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearOTPState());
    };
  }, [dispatch]);

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      return 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      return 'Please enter a valid email';
    }
    return '';
  };

  const validateOTP = () => {
    if (!formData.otp.trim()) {
      return 'OTP is required';
    } else if (formData.otp.trim().length !== 6) {
      return 'OTP must be 6 digits';
    }
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear specific field error when user starts typing
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Clear general error
    if (error) {
      dispatch(clearError());
    }
  };

  const handleGetOTP = async () => {
    const emailError = validateEmail();
    setFormErrors(prev => ({ ...prev, email: emailError }));

    if (emailError) {
      return;
    }

    try {
      await dispatch(sendLoginOTP({ email: formData.email })).unwrap();
    } catch (error) {
      // Error is handled by Redux state
      console.error('Failed to send OTP:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailError = validateEmail();
    const otpError = validateOTP();
    
    setFormErrors({
      email: emailError,
      otp: otpError
    });

    if (emailError || otpError) {
      return;
    }

    try {
      await dispatch(login(formData)).unwrap();
      // Success - user will be redirected by useEffect
    } catch (error) {
      // Error is handled by Redux state
      console.error('Login failed:', error);
    }
  };

  const handleResendOTP = () => {
    if (formData.email) {
      dispatch(sendLoginOTP({ email: formData.email }));
    }
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-white">
      <div className="relative flex h-full">
        {/* Top brand: center on mobile, left on desktop */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 flex items-center gap-2 lg:left-6 lg:translate-x-0 z-10">
          <img src={HDIcon} alt="HD" className="h-8 w-8" />
          <span className="text-base font-semibold tracking-wide text-gray-900">HD</span>
        </div>

        {/* Left: form */}
        <div className="w-full lg:w-1/2 h-full flex items-center">
          <div className="w-full max-w-md mx-auto px-8 sm:px-16">
            {/* Title + subtitle: centered on mobile, left on desktop */}
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold text-gray-900">Sign In</h2>
              <p className="mt-1 text-sm text-gray-500">
                Please login to continue to your account.
              </p>
            </div>

            {/* Display error message */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={formErrors.email}
                placeholder="Enter your email address"
                disabled={otpSent}
                required
              />

              {otpSent && (
                <Input
                  label="OTP"
                  name="otp"
                  type="text"
                  value={formData.otp}
                  onChange={handleChange}
                  error={formErrors.otp}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  required
                />
              )}

              {otpSent && (
                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={otpLoading}
                    className="text-blue-600 hover:text-blue-500 disabled:text-gray-400"
                  >
                    {otpLoading ? 'Sending...' : 'Resend OTP'}
                  </button>
                </div>
              )}

              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                  Keep me logged in
                </label>
              </div>

              <Button
                type={otpSent ? 'submit' : 'button'}
                onClick={otpSent ? undefined : handleGetOTP}
                className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={
                  otpSent 
                    ? loading || !formData.otp.trim()
                    : otpLoading || !formData.email.trim()
                }
              >
                {otpSent 
                  ? (loading ? 'Signing In...' : 'Sign in')
                  : (otpLoading ? 'Sending OTP...' : 'Get OTP')
                }
              </Button>

              {otpSent && (
                <button
                  type="button"
                  onClick={() => {
                    dispatch(clearOTPState());
                    setFormData(prev => ({ ...prev, otp: '' }));
                    setFormErrors(prev => ({ ...prev, otp: '' }));
                  }}
                  className="w-full text-sm text-blue-600 hover:text-blue-500 underline"
                >
                  Change email
                </button>
              )}

              <p className="text-center text-sm text-gray-600">
                Need an account?{' '}
                <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                  Create one
                </Link>
              </p>
            </form>
          </div>
        </div>

        {/* Right: fixed full-height image */}
        <div className="hidden lg:block w-1/2 h-full">
          <img
            src={RightImage}
            alt="Right visual"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;