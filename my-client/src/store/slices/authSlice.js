import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Async thunks
export const sendLogoutOTP = createAsyncThunk(
  'auth/sendLogoutOTP',
  async (email, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/auth/logout-otp`, { email });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể gửi mã xác nhận');
    }
  }
);

export const verifyLogoutOTP = createAsyncThunk(
  'auth/verifyLogoutOTP',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/auth/verify-logout-otp`, { email, otp });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Xác minh thất bại');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, { email, password });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Đăng nhập thất bại');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async ({ name, email, password, phone, address }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/auth/register`, { 
        name, email, password, phone, address 
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Đăng ký thất bại');
    }
  }
);

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/auth/verify-otp`, { email, otp });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Xác minh OTP thất bại');
    }
  }
);

export const resendOTP = createAsyncThunk(
  'auth/resendOTP',
  async (email, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/auth/resend-otp`, { email });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể gửi lại OTP');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async ({ name, email, phone, address }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.put(`${BASE_URL}/auth/profile`, 
        { name, email, phone, address },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Cập nhật thất bại');
    }
  }
);

const initialState = {
  user: (() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  })(),
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!(localStorage.getItem('token') && localStorage.getItem('user')),
  loading: false,
  error: null,
  logoutOTP: {
    loading: false,
    error: null,
    success: false,
    pendingEmail: '',
  },
  registerOTP: {
    loading: false,
    error: null,
    success: false,
    pendingEmail: '',
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.logoutOTP.error = null;
      state.registerOTP.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.logoutOTP = {
        loading: false,
        error: null,
        success: false,
        pendingEmail: '',
      };
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    restoreAuth: (state) => {
      try {
        const savedUser = localStorage.getItem('user');
        const savedToken = localStorage.getItem('token');
        if (savedUser && savedToken) {
          state.user = JSON.parse(savedUser);
          state.token = savedToken;
          state.isAuthenticated = true;
        }
      } catch {
        // Nếu có lỗi parse, clear localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      }
    },
    clearLogoutOTP: (state) => {
      state.logoutOTP = {
        loading: false,
        error: null,
        success: false,
        pendingEmail: '',
      };
    },
    clearRegisterOTP: (state) => {
      state.registerOTP = {
        loading: false,
        error: null,
        success: false,
        pendingEmail: '',
      };
    }
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Register
    builder
      .addCase(register.pending, (state) => {
        state.registerOTP.loading = true;
        state.registerOTP.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.registerOTP.loading = false;
        state.registerOTP.success = true;
        state.registerOTP.pendingEmail = action.payload.email;
      })
      .addCase(register.rejected, (state, action) => {
        state.registerOTP.loading = false;
        state.registerOTP.error = action.payload;
      });

    // Verify OTP
    builder
      .addCase(verifyOTP.pending, (state) => {
        state.registerOTP.loading = true;
        state.registerOTP.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.registerOTP.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.registerOTP.success = false;
        state.registerOTP.pendingEmail = '';
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.registerOTP.loading = false;
        state.registerOTP.error = action.payload;
      });

    // Resend OTP
    builder
      .addCase(resendOTP.pending, (state) => {
        state.registerOTP.loading = true;
        state.registerOTP.error = null;
      })
      .addCase(resendOTP.fulfilled, (state, action) => {
        state.registerOTP.loading = false;
        state.registerOTP.success = true;
        state.registerOTP.pendingEmail = action.payload.email;
      })
      .addCase(resendOTP.rejected, (state, action) => {
        state.registerOTP.loading = false;
        state.registerOTP.error = action.payload;
      });

    // Send Logout OTP
    builder
      .addCase(sendLogoutOTP.pending, (state) => {
        state.logoutOTP.loading = true;
        state.logoutOTP.error = null;
      })
      .addCase(sendLogoutOTP.fulfilled, (state, action) => {
        state.logoutOTP.loading = false;
        state.logoutOTP.success = true;
        state.logoutOTP.pendingEmail = action.payload.email;
      })
      .addCase(sendLogoutOTP.rejected, (state, action) => {
        state.logoutOTP.loading = false;
        state.logoutOTP.error = action.payload;
      });

    // Verify Logout OTP
    builder
      .addCase(verifyLogoutOTP.pending, (state) => {
        state.logoutOTP.loading = true;
        state.logoutOTP.error = null;
      })
      .addCase(verifyLogoutOTP.fulfilled, (state, action) => {
        state.logoutOTP.loading = false;
        state.logoutOTP.success = true;
        // Logout will be handled by the component
      })
      .addCase(verifyLogoutOTP.rejected, (state, action) => {
        state.logoutOTP.loading = false;
        state.logoutOTP.error = action.payload;
      });

    // Update Profile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  logout, 
  setUser, 
  clearLogoutOTP, 
  clearRegisterOTP 
} = authSlice.actions;

export default authSlice.reducer;
