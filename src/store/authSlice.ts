import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User, LoginCredentials, RegisterCredentials } from '../types/auth';
import { authService } from '../services/auth'; // Using real Supabase service

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      console.log('🔄 Redux.loginUser - Starting login thunk', {
        email: credentials.email,
        role: credentials.role
      });
      
      const response = await authService.login(credentials);
      
      if (!response.user) {
        throw new Error('Login failed - no user data received');
      }
      
      console.log('✅ Redux.loginUser - Login thunk successful', {
        userId: response.user.id,
        role: response.user.role
      });
      
      return response;
    } catch (error: any) {
      console.error('❌ Redux.loginUser - Login thunk failed:', error.message);
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (credentials: RegisterCredentials, { rejectWithValue }) => {
    try {
      console.log('🔄 Redux.registerUser - Starting registration thunk', {
        email: credentials.email,
        role: credentials.role,
        fullName: credentials.full_name
      });
      
      const response = await authService.register(credentials);
      
      if (response.requiresEmailConfirmation) {
        console.log('📧 Redux.registerUser - Email confirmation required');
        return response;
      }
      
      console.log('✅ Redux.registerUser - Registration thunk successful', {
        userId: response.user?.id,
        role: response.user?.role
      });
      
      return response;
    } catch (error: any) {
      console.error('❌ Redux.registerUser - Registration thunk failed:', error.message);
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔄 Redux.logoutUser - Starting logout thunk');
      
      await authService.logout();
      
      console.log('✅ Redux.logoutUser - Logout thunk successful');
    } catch (error: any) {
      console.error('❌ Redux.logoutUser - Logout thunk failed:', error.message);
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

export const checkAuthStatus = createAsyncThunk(
  'auth/checkAuthStatus',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔄 Redux.checkAuthStatus - Starting auth status check');
      
      const isAuthenticated = await authService.isAuthenticated();
      
      console.log('🔄 Redux.checkAuthStatus - Authentication status:', isAuthenticated);
      
      if (isAuthenticated) {
        const user = await authService.getCurrentUser();
        const role = await authService.getUserRole();
        
        console.log('✅ Redux.checkAuthStatus - User found:', {
          hasUser: !!user,
          userId: user?.id,
          role
        });
        
        if (user) {
          return { user, isAuthenticated: true };
        }
      }
      
      console.log('ℹ️ Redux.checkAuthStatus - No authenticated user found');
      return { user: null, isAuthenticated: false };
    } catch (error: any) {
      console.error('❌ Redux.checkAuthStatus - Auth check failed:', error.message);
      return rejectWithValue(error.message || 'Auth check failed');
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        
        if (action.payload.requiresEmailConfirmation) {
          // Registration successful but email confirmation required
          state.error = action.payload.message || 'Please check your email and click the confirmation link.';
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
        } else {
          // Registration successful and user is logged in
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
          state.error = null;
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      // Logout cases
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Check auth status cases
      .addCase(checkAuthStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = action.payload.isAuthenticated;
        if (action.payload.isAuthenticated && action.payload.user) {
          // Token is already stored, we just need to mark as authenticated
          state.token = 'stored'; // Placeholder since token is in AsyncStorage
        }
      })
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, setLoading } = authSlice.actions;
export default authSlice.reducer;
