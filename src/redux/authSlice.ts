import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { authAPI } from '../services/api';

interface User {
  id: number;
  name: string;
  email: string;
  dob?: string;
  is_google_user: boolean;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  token: string | null;
  otpSent: boolean;
  otpLoading: boolean;
  isAuthenticated: boolean;
}

interface SignUpData {
  name: string;
  dob: string;
  email: string;
  otp: string;
}

interface LoginData {
  email: string;
  otp: string;
  rememberMe?: boolean;
}

interface SendOTPData {
  email: string;
  name?: string;
}

interface GoogleAuthData {
  idToken: string;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  token: localStorage.getItem('token'),
  otpSent: false,
  otpLoading: false,
  isAuthenticated: !!localStorage.getItem('token'),
};

// Send OTP for signup
export const sendSignupOTP = createAsyncThunk(
  'auth/sendSignupOTP',
  async (data: SendOTPData, { rejectWithValue }) => {
    try {
      const response = await authAPI.sendSignupOTP(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to send OTP'
      );
    }
  }
);

// Send OTP for login
export const sendLoginOTP = createAsyncThunk(
  'auth/sendLoginOTP',
  async (data: SendOTPData, { rejectWithValue }) => {
    try {
      const response = await authAPI.sendLoginOTP(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to send OTP'
      );
    }
  }
);

// Signup with OTP verification
export const signUp = createAsyncThunk(
  'auth/signUp',
  async (userData: SignUpData, { rejectWithValue }) => {
    try {
      const response = await authAPI.signup(userData);
      // Store token in localStorage
      if (response.data.data?.token) {
        localStorage.setItem('token', response.data.data.token);
      }
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Sign up failed'
      );
    }
  }
);

// Login with OTP
export const login = createAsyncThunk(
  'auth/login',
  async (userData: LoginData, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(userData);
      // Store token in localStorage
      if (response.data.data?.token) {
        localStorage.setItem('token', response.data.data.token);
      }
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Login failed'
      );
    }
  }
);

// Google authentication
export const googleAuth = createAsyncThunk(
  'auth/googleAuth',
  async (data: GoogleAuthData, { rejectWithValue }) => {
    try {
      const response = await authAPI.googleAuth(data);
      // Store token in localStorage
      if (response.data.data?.token) {
        localStorage.setItem('token', response.data.data.token);
      }
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Google authentication failed'
      );
    }
  }
);

// Get current user
export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getCurrentUser();
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get user'
      );
    }
  }
);

// Logout
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout();
      // Remove token from localStorage
      localStorage.removeItem('token');
      return null;
    } catch (error: any) {
      // Even if API call fails, remove token locally
      localStorage.removeItem('token');
      return rejectWithValue(
        error.response?.data?.message || 'Logout failed'
      );
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearOTPState: (state) => {
      state.otpSent = false;
      state.otpLoading = false;
    },
    setOTPSent: (state, action: PayloadAction<boolean>) => {
      state.otpSent = action.payload;
    },
    // Initialize auth state from localStorage
    initializeAuth: (state) => {
      const token = localStorage.getItem('token');
      if (token) {
        state.token = token;
        state.isAuthenticated = true;
      }
    },
    // Clear auth state
    clearAuthState: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.otpSent = false;
      state.error = null;
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    builder
      // Send signup OTP
      .addCase(sendSignupOTP.pending, (state) => {
        state.otpLoading = true;
        state.error = null;
      })
      .addCase(sendSignupOTP.fulfilled, (state) => {
        state.otpLoading = false;
        state.otpSent = true;
        state.error = null;
      })
      .addCase(sendSignupOTP.rejected, (state, action: PayloadAction<any>) => {
        state.otpLoading = false;
        state.error = action.payload;
      })

      // Send login OTP
      .addCase(sendLoginOTP.pending, (state) => {
        state.otpLoading = true;
        state.error = null;
      })
      .addCase(sendLoginOTP.fulfilled, (state) => {
        state.otpLoading = false;
        state.otpSent = true;
        state.error = null;
      })
      .addCase(sendLoginOTP.rejected, (state, action: PayloadAction<any>) => {
        state.otpLoading = false;
        state.error = action.payload;
      })

      // Signup
      .addCase(signUp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.otpSent = false;
        state.error = null;
      })
      .addCase(signUp.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.otpSent = false;
        state.error = null;
      })
      .addCase(login.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Google Auth
      .addCase(googleAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleAuth.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(googleAuth.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem('token');
      })

      // Logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.otpSent = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
        // Still clear the state even if API call fails
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.otpSent = false;
      });
  },
});

export const { 
  clearError, 
  clearOTPState, 
  setOTPSent, 
  initializeAuth, 
  clearAuthState 
} = authSlice.actions;

export default authSlice.reducer;