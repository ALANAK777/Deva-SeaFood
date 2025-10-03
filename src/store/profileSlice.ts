import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { UserProfile, UpdateProfileData, profileService } from '../services/profileService';

interface ProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isUpdating: boolean;
}

const initialState: ProfileState = {
  profile: null,
  isLoading: false,
  error: null,
  isUpdating: false,
};

// Async thunks
export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (userId: string, { rejectWithValue }) => {
    try {
      console.log('🔄 Redux.fetchProfile - Starting profile fetch for user:', userId);
      const profile = await profileService.getProfile(userId);
      console.log('✅ Redux.fetchProfile - Profile fetched successfully');
      return profile;
    } catch (error: any) {
      console.error('❌ Redux.fetchProfile - Fetch failed:', error.message);
      return rejectWithValue(error.message || 'Failed to fetch profile');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async ({ userId, updates }: { userId: string; updates: UpdateProfileData }, { rejectWithValue }) => {
    try {
      console.log('🔄 Redux.updateProfile - Starting profile update for user:', userId);
      const profile = await profileService.updateProfile(userId, updates);
      console.log('✅ Redux.updateProfile - Profile updated successfully');
      return profile;
    } catch (error: any) {
      console.error('❌ Redux.updateProfile - Update failed:', error.message);
      return rejectWithValue(error.message || 'Failed to update profile');
    }
  }
);

export const createProfile = createAsyncThunk(
  'profile/createProfile',
  async ({ userId, profileData }: { userId: string; profileData: {
    email: string;
    full_name: string;
    phone?: string;
    role?: 'customer' | 'admin';
  }}, { rejectWithValue }) => {
    try {
      console.log('🔄 Redux.createProfile - Creating profile for user:', userId);
      const profile = await profileService.createProfile(userId, profileData);
      console.log('✅ Redux.createProfile - Profile created successfully');
      return profile;
    } catch (error: any) {
      console.error('❌ Redux.createProfile - Create failed:', error.message);
      return rejectWithValue(error.message || 'Failed to create profile');
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfile: (state) => {
      state.profile = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      })

      // Create Profile
      .addCase(createProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(createProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearProfile, clearError } = profileSlice.actions;
export default profileSlice.reducer;
