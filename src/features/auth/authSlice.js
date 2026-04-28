import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authAPI from './authAPI';

const persistedUser = (() => {
  try {
    return JSON.parse(localStorage.getItem('auth_user') || 'null');
  } catch (e) {
    return null;
  }
})();

export const sendLoginOtp = createAsyncThunk(
  'auth/sendLoginOtp',
  async (email, { rejectWithValue }) => {
    try {
      const response = await authAPI.requestLoginOtp(email);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send OTP');
    }
  }
);

export const sendRegisterOtp = createAsyncThunk(
  'auth/sendRegisterOtp',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authAPI.requestRegisterOtp(userData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send registration OTP');
    }
  }
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await authAPI.verifyOtp(email, otp);
      // Backend returns data in result property
      const { token, candidate } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('auth_user', JSON.stringify(candidate));
      return { token, user: candidate };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Invalid OTP');
    }
  }
);

export const adminLogin = createAsyncThunk(
  'auth/adminLogin',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.adminLogin(credentials);
      const { token, admin } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('role', 'admin');
      localStorage.setItem('auth_user', JSON.stringify(admin));
      return { token, user: admin, role: 'admin' };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Invalid email or password');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: persistedUser,
    token: localStorage.getItem('token') || null,
    role: localStorage.getItem('role') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null,
    otpSent: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetOtpStatus: (state) => {
      state.otpSent = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('auth_user');
    },
    updateSessionUser: (state, action) => {
      if (!state.user || !action.payload) return;
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('auth_user', JSON.stringify(state.user));
    },
  },
  extraReducers: (builder) => {
    builder
      // Send Login OTP
      .addCase(sendLoginOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendLoginOtp.fulfilled, (state) => {
        state.loading = false;
        state.otpSent = true;
      })
      .addCase(sendLoginOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Send Register OTP
      .addCase(sendRegisterOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendRegisterOtp.fulfilled, (state) => {
        state.loading = false;
        state.otpSent = true;
      })
      .addCase(sendRegisterOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Verify OTP
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem('auth_user', JSON.stringify(action.payload.user));
        state.isAuthenticated = true;
        state.otpSent = false;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Admin Login
      .addCase(adminLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem('auth_user', JSON.stringify(action.payload.user));
        state.role = action.payload.role;
        state.isAuthenticated = true;
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, resetOtpStatus, logout, updateSessionUser } = authSlice.actions;
export default authSlice.reducer;
