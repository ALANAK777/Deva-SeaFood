import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { LoginCredentials, RegisterCredentials, User, AuthResponse } from '../types/auth';
import { STORAGE_KEYS } from '../utils/constants';

/**
 * DEVELOPMENT MODE CONFIGURATION
 * =============================
 * 
 * The following settings are enabled for development:
 * 
 * 1. isAuthenticated() always returns false - forces login screen on every app reload
 * 2. AsyncStorage persistence is disabled - no automatic session restoration
 * 3. Users must login/register every time the app restarts
 * 
 * To enable production mode:
 * - Restore original isAuthenticated() logic
 * - Re-enable AsyncStorage.setItem() calls in login() and register()
 * - Remove development mode comments
 */

class AuthService {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('🔐 AuthService.login - Starting login process', {
        email: credentials.email,
        role: credentials.role,
        timestamp: new Date().toISOString()
      });

      // Authenticate with Supabase
      console.log('🔐 AuthService.login - Authenticating with Supabase...');
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (authError) {
        console.error('❌ AuthService.login - Supabase auth error:', authError);
        if (authError.message === 'Email not confirmed') {
          throw new Error('Please check your email and click the confirmation link, or contact support if you didn\'t receive the email.');
        }
        throw new Error(authError.message);
      }

      console.log('✅ AuthService.login - Supabase auth successful, user ID:', authData.user?.id);

      if (!authData.user) {
        console.error('❌ AuthService.login - No user data returned from Supabase');
        throw new Error('No user data returned');
      }

      // Get user profile
      console.log('🔐 AuthService.login - Fetching user profile...');
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError && profileError.code === 'PGRST116') {
        // Profile not found, create new profile
        console.log('🔐 AuthService.login - Profile not found, creating new profile...');
        
        const userMetadata = authData.user.user_metadata || {};
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: authData.user.email || credentials.email,
            full_name: userMetadata.full_name || '',
            phone: userMetadata.phone || '',
            role: credentials.role,
          })
          .select()
          .single();

        if (createError) {
          console.error('❌ AuthService.login - Profile creation error:', createError);
          if (createError.code === '23505') {
            throw new Error('Profile already exists but could not be retrieved. Please try again.');
          } else if (createError.code === '42501') {
            throw new Error('Permission error during profile setup. Please contact support.');
          } else {
            throw new Error(`Profile setup failed: ${createError.message}. Please try again or contact support.`);
          }
        }
        
        profile = newProfile;
        profileError = null;
      } else if (profile && profile.role !== credentials.role) {
        // Profile exists but role doesn't match
        console.error('❌ AuthService.login - Role mismatch:', {
          expected: credentials.role,
          actual: profile.role
        });
        throw new Error(`Role mismatch. This account is registered as ${profile.role}. Please use the correct login portal or contact support.`);
      }

      if (profileError) {
        console.error('❌ AuthService.login - Profile fetch error:', profileError);
        throw new Error(`Profile access error: ${profileError.message}. Please try again or contact support.`);
      }

      console.log('✅ AuthService.login - Profile fetched successfully:', {
        id: profile.id,
        role: profile.role,
        fullName: profile.full_name
      });

      const user: User = {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        phone: profile.phone || '',
        role: profile.role,
        created_at: profile.created_at,
      };

      const token = authData.session?.access_token || '';
      const refreshToken = authData.session?.refresh_token || '';

      // Store in AsyncStorage for session persistence
      console.log('🔐 AuthService.login - Storing session data...');
      await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_REFRESH_TOKEN, refreshToken);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_ROLE, user.role);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

      console.log('✅ AuthService.login - Login completed successfully', {
        userId: user.id,
        role: user.role,
        hasToken: !!token
      });

      return { user, token };
    } catch (error: any) {
      console.error('❌ AuthService.login - Login failed:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  // Register user
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      console.log('📝 AuthService.register - Starting registration process', {
        email: credentials.email,
        role: credentials.role,
        fullName: credentials.full_name,
        timestamp: new Date().toISOString()
      });

      // Validate passwords match
      if (credentials.password !== credentials.confirmPassword) {
        console.error('❌ AuthService.register - Password mismatch');
        throw new Error('Passwords do not match');
      }

      // Create auth user with metadata
      console.log('📝 AuthService.register - Creating Supabase auth user with metadata...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            full_name: credentials.full_name,
            role: credentials.role,
            phone: credentials.phone
          }
        }
      });

      if (authError) {
        console.error('❌ AuthService.register - Supabase auth creation error:', authError);
        throw new Error(authError.message);
      }

      console.log('✅ AuthService.register - Supabase auth user created:', authData.user?.id);

      if (!authData.user) {
        console.error('❌ AuthService.register - No user data returned from Supabase');
        throw new Error('No user data returned');
      }

      // Check if email confirmation is required
      if (!authData.session) {
        console.log('📧 AuthService.register - Email confirmation required');
        // Email confirmation is required - return special response
        return {
          user: null,
          token: '',
          requiresEmailConfirmation: true,
          message: 'Please check your email and click the confirmation link to complete your registration.'
        };
      }

      // Check for auto-created profile (may exist from database trigger)
      console.log('📝 AuthService.register - Checking for auto-created profile...');
      
      // Check for auto-created profile with minimal retries
      let profile = null;
      let retries = 2; // Reduced retries since we have manual fallback
      
      while (retries > 0 && !profile) {
        console.log(`📝 AuthService.register - Checking for profile (${retries} retries left)...`);
        
        const { data: existingProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (existingProfile) {
          console.log('✅ AuthService.register - Profile found via auto-creation or previous attempt');
          profile = existingProfile;
          break;
        }

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found"
          console.error('❌ AuthService.register - Error fetching profile:', fetchError);
        }

        retries--;
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 500)); // Reduced wait time
        }
      }

      // If still no profile, manually create it
      if (!profile) {
        console.log('📝 AuthService.register - No auto-created profile found, creating manually...');
        
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: credentials.email,
            full_name: credentials.full_name,
            phone: credentials.phone,
            role: credentials.role,
          })
          .select()
          .single();

        if (createError) {
          console.error('❌ AuthService.register - Manual profile creation error:', createError);
          // Provide more specific error message based on error type
          if (createError.code === '23505') { // Unique constraint violation
            throw new Error('Profile already exists. Please try logging in instead.');
          } else if (createError.code === '42501') { // Insufficient privilege (RLS issue)
            throw new Error('Permission error during registration. Please try again or contact support.');
          } else {
            throw new Error(`Registration failed: ${createError.message || 'Unknown error'}. Please try logging in.`);
          }
        }
        
        profile = newProfile;
        console.log('✅ AuthService.register - Profile created manually:', {
          id: profile.id,
          role: profile.role,
          fullName: profile.full_name
        });
      }

      console.log('✅ AuthService.register - Profile created successfully:', {
        id: profile.id,
        role: profile.role,
        fullName: profile.full_name
      });

      const user: User = {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        phone: profile.phone || '',
        role: profile.role,
        created_at: profile.created_at,
      };

      const token = authData.session?.access_token || '';

      // Store in AsyncStorage - DISABLED FOR DEVELOPMENT
      console.log('📝 AuthService.register - Skipping storage for development mode');
      console.log('📝 AuthService.register - Would normally store user data in AsyncStorage...');
      // await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, token);
      // await AsyncStorage.setItem(STORAGE_KEYS.USER_ROLE, user.role);
      // await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

      console.log('✅ AuthService.register - Registration completed successfully', {
        userId: user.id,
        role: user.role,
        hasToken: !!token
      });

      return { user, token };
    } catch (error: any) {
      console.error('❌ AuthService.register - Registration failed:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      console.log('🚪 AuthService.logout - Starting logout process');

      // Sign out from Supabase
      console.log('🚪 AuthService.logout - Signing out from Supabase...');
      await supabase.auth.signOut();

      // Clear AsyncStorage
      console.log('🚪 AuthService.logout - Clearing AsyncStorage...');
      await this.clearStoredAuth();

      console.log('✅ AuthService.logout - Logout completed successfully');
    } catch (error: any) {
      console.error('❌ AuthService.logout - Logout error:', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  // Clear stored authentication data
  private async clearStoredAuth(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_TOKEN,
        STORAGE_KEYS.USER_REFRESH_TOKEN,
        STORAGE_KEYS.USER_ROLE,
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.CART_ITEMS,
      ]);
      console.log('🧹 AuthService.clearStoredAuth - Cleared all stored authentication data');
    } catch (error: any) {
      console.error('❌ AuthService.clearStoredAuth - Error clearing storage:', error);
    }
  }

  // Get current user from storage
  async getCurrentUser(): Promise<User | null> {
    try {
      console.log('👤 AuthService.getCurrentUser - Fetching current user from storage');
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      const user = userData ? JSON.parse(userData) : null;
      
      console.log('👤 AuthService.getCurrentUser - Result:', {
        hasUser: !!user,
        userId: user?.id,
        role: user?.role
      });
      
      return user;
    } catch (error: any) {
      console.error('❌ AuthService.getCurrentUser - Error:', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
      return null;
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      console.log('🔍 AuthService.isAuthenticated - Checking authentication status...');
      
      // First check AsyncStorage for stored user data and token
      const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
      const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.USER_REFRESH_TOKEN);
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      
      if (token && refreshToken && userData) {
        console.log('✅ AuthService.isAuthenticated - Found stored credentials in AsyncStorage');
        
        try {
          const user = JSON.parse(userData);
          console.log('🔄 AuthService.isAuthenticated - Attempting to restore Supabase session...');
          
          // Check current session first
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (!session || sessionError) {
            console.log('🔄 AuthService.isAuthenticated - No active session, restoring with stored tokens...');
            
            // Restore the session using stored tokens
            const { data: sessionData, error: restoreError } = await supabase.auth.setSession({
              access_token: token,
              refresh_token: refreshToken,
            });
            
            if (restoreError) {
              console.log('⚠️ AuthService.isAuthenticated - Session restore failed:', restoreError.message);
              // If session restore fails, the tokens might be expired
              // Clear the stored data and require fresh login
              await this.clearStoredAuth();
              return false;
            } else {
              console.log('✅ AuthService.isAuthenticated - Supabase session restored successfully');
            }
          } else {
            console.log('✅ AuthService.isAuthenticated - Active Supabase session found');
          }
          
          console.log('✅ AuthService.isAuthenticated - User authenticated from storage:', {
            userId: user.id,
            role: user.role,
            email: user.email
          });
          return true;
        } catch (parseError) {
          console.error('❌ AuthService.isAuthenticated - Error parsing stored user data:', parseError);
          // Clear corrupted data
          await this.clearStoredAuth();
        }
      }
      
      // Fallback: Check if we have a valid Supabase session
      console.log('🔍 AuthService.isAuthenticated - No stored credentials, checking Supabase session...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ AuthService.isAuthenticated - Session error:', error);
        return false;
      }
      
      if (!session || !session.user) {
        console.log('🔍 AuthService.isAuthenticated - No valid session found');
        return false;
      }
      
      // Verify the session is not expired
      const now = Math.floor(Date.now() / 1000);
      if (session.expires_at && session.expires_at < now) {
        console.log('🔍 AuthService.isAuthenticated - Session expired');
        return false;
      }
      
      // Check if user profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (profileError || !profile) {
        console.log('🔍 AuthService.isAuthenticated - No profile found for user');
        return false;
      }
      
      console.log('✅ AuthService.isAuthenticated - User authenticated via Supabase session:', {
        userId: session.user.id,
        role: profile.role,
        email: session.user.email
      });
      
      return true;
    } catch (error: any) {
      console.error('❌ AuthService.isAuthenticated - Error:', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
      return false;
    }
  }

  // Get user role
  async getUserRole(): Promise<string | null> {
    try {
      console.log('🔍 AuthService.getUserRole - Fetching user role from storage');
      const role = await AsyncStorage.getItem(STORAGE_KEYS.USER_ROLE);
      
      console.log('🔍 AuthService.getUserRole - Result:', { role });
      
      return role;
    } catch (error: any) {
      console.error('❌ AuthService.getUserRole - Error:', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
      return null;
    }
  }
}

export const authService = new AuthService();
