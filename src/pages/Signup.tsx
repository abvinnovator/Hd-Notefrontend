import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { AppDispatch, RootState } from '../redux/store';
import { sendSignupOTP, signUp, googleAuth, clearError, clearOTPState } from '../redux/authSlice';
import Input from '../components/Input';
import Button from '../components/Button';
import HDIcon from '../../public/HD.svg'
import RightImage from '../../public/Signup.svg'
import { Link } from 'react-router-dom';

declare global {
  interface Window {
    google: any;
  }
}

const SignUp: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, otpLoading, otpSent, error, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    email: '',
    otp: ''
  });
  const [formErrors, setFormErrors] = useState({
    name: '',
    dob: '',
    email: '',
    otp: ''
  });

  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Load Google OAuth script - IMPROVED VERSION
  useEffect(() => {
    // Check if script is already loaded
    if (window.google?.accounts?.id) {
      setGoogleScriptLoaded(true);
      initializeGoogleSignIn();
      return;
    }

    // Check if script is already in DOM
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        setGoogleScriptLoaded(true);
        initializeGoogleSignIn();
      });
      return;
    }

    console.log('🔍 Loading Google Sign-In script...');
    console.log('Current origin:', window.location.origin);
   

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('✅ Google Script loaded successfully');
      setGoogleScriptLoaded(true);
      initializeGoogleSignIn();
    };
    
    script.onerror = (error) => {
      console.error('❌ Failed to load Google Sign-In script:', error);
    };
    
    document.head.appendChild(script);

    return () => {
      // Cleanup: remove script if component unmounts
      const scriptToRemove = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (scriptToRemove && document.head.contains(scriptToRemove)) {
        document.head.removeChild(scriptToRemove);
      }
    };
  }, []);

  // Initialize Google Sign-In - SEPARATE FUNCTION
  const initializeGoogleSignIn = () => {
    if (!window.google?.accounts?.id) {
      console.error('❌ Google Sign-In library not available');
      return;
    }

    try {
      console.log('🔧 Initializing Google Sign-In...');
      
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        use_fedcm_for_prompt: false,
        ux_mode: 'popup', // Explicitly set to popup mode
        context: 'signup', // Set context to signup
      });

      // Render the button
      if (googleButtonRef.current) {
        console.log('🎨 Rendering Google Sign-In button...');
        window.google.accounts.id.renderButton(
          googleButtonRef.current,
          {
            theme: 'outline',
            size: 'large',
            width: '100%',
            shape: 'rectangular',
            text: 'signup_with', // Changed to signup_with for signup page
            logo_alignment: 'left',
            locale: 'en',
          }
        );
      }

      console.log('✅ Google Sign-In initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing Google Sign-In:', error);
    }
  };

  // Google response handler - IMPROVED VERSION
  const handleGoogleResponse = async (response: any) => {
    console.log('🔄 Google response received:', { hasCredential: !!response.credential });
    
    try {
      if (!response.credential) {
        console.error('❌ No credential received from Google');
        return;
      }

      console.log('📤 Sending credential to backend...');
      await dispatch(googleAuth({ idToken: response.credential })).unwrap();
      console.log('✅ Google authentication successful');
      
    } catch (error) {
      console.error('❌ Google authentication failed:', error);
      // You might want to show a user-friendly error message here
    }
  };

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

  const validateForm = () => {
    const errors = {
      name: '',
      dob: '',
      email: '',
      otp: ''
    };
    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }
    // Date of birth validation
    if (!formData.dob.trim()) {
      errors.dob = 'Date of birth is required';
    }
    // OTP validation (only if OTP is sent)
    if (otpSent && !formData.otp.trim()) {
      errors.otp = 'OTP is required';
    } else if (otpSent && formData.otp.trim().length !== 6) {
      errors.otp = 'OTP must be 6 digits';
    }
    setFormErrors(errors);
    return Object.values(errors).every(error => error === '');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

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
    const errors = {
      name: '',
      dob: '',
      email: '',
      otp: ''
    };
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }
    if (!formData.dob.trim()) {
      errors.dob = 'Date of birth is required';
    }
    setFormErrors(errors);
    if (errors.name || errors.email || errors.dob) {
      return;
    }
    try {
      await dispatch(sendSignupOTP({
        email: formData.email,
        name: formData.name
      })).unwrap();
    } catch (error) {
      console.error('Failed to send OTP:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      await dispatch(signUp(formData)).unwrap();
    } catch (error) {
      console.error('Signup failed:', error);
    }
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-white">
      <div className="relative flex h-full">
        {/* Top brand */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 flex items-center gap-2 lg:left-6 lg:translate-x-0 z-10">
          <img src={HDIcon} alt="HD" className="h-8 w-8" />
          <span className="text-base font-semibold tracking-wide text-gray-900">HD</span>
        </div>
        {/* Left: form */}
        <div className="w-full lg:w-1/2 h-full flex items-center">
          <div className="w-full max-w-md mx-auto px-8 sm:px-16">
            {/* Title + subtitle */}
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold text-gray-900">Sign up</h2>
              <p className="mt-1 text-sm text-gray-500">
                Sign up to enjoy the features of HD
              </p>
            </div>
            
            {/* Display error message */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            <div className="mt-8">
              {/* Google Sign Up Button */}
              <div className="mb-6">
                {!googleScriptLoaded && (
                  <div className="flex items-center justify-center py-3 px-4 border border-gray-300 rounded-md">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-sm text-gray-600">Loading Google Sign-In...</span>
                  </div>
                )}
                <div
                  ref={googleButtonRef}
                  id="google-signin-button"
                  className={`mt-3 ${!googleScriptLoaded ? 'hidden' : ''}`}
                />
              </div>
              
              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                </div>
              </div>
              
              {/* Email Form */}
              <form className="space-y-6" onSubmit={handleSubmit}>
                <Input
                  label="Your Name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  error={formErrors.name}
                  placeholder="Enter your full name"
                  required
                />
                <Input
                  label="Date of Birth"
                  name="dob"
                  type="date"
                  value={formData.dob}
                  onChange={handleChange}
                  error={formErrors.dob}
                  required
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={formErrors.email}
                  placeholder="Enter your email address"
                  required
                />
                {/* Show OTP field only after requesting OTP */}
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
                <Button
                  type={otpSent ? 'submit' : 'button'}
                  onClick={otpSent ? undefined : handleGetOTP}
                  className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={
                    otpSent
                      ? loading || !formData.otp.trim()
                      : otpLoading || !formData.email.trim() || !formData.name.trim() || !formData.dob.trim()
                  }
                >
                  {otpSent
                    ? (loading ? 'Creating Account...' : 'Sign up')
                    : (otpLoading ? 'Sending OTP...' : 'Get OTP')
                  }
                </Button>
                {otpSent && (
                  <button
                    type="button"
                    onClick={() => {
                      dispatch(clearOTPState());
                      setFormData(prev => ({ ...prev, otp: '' }));
                    }}
                    className="w-full text-sm text-blue-600 hover:text-blue-500 underline"
                  >
                    Change email or resend OTP
                  </button>
                )}
                <p className="text-center text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link to='/login' className="font-medium text-blue-600 hover:text-blue-500">
                    Sign in
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
        {/* Right side image for desktop */}
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

export default SignUp;