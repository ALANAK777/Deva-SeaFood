import { supabase } from './supabase';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'customer' | 'admin';
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  landmark?: string;
  address_type?: 'home' | 'work' | 'other';
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  full_name?: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  landmark?: string;
  address_type?: 'home' | 'work' | 'other';
}

class ProfileService {
  // Get user profile
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      console.log('👤 ProfileService.getProfile - Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ ProfileService.getProfile - Error:', error);
        throw new Error(error.message);
      }

      console.log('✅ ProfileService.getProfile - Profile fetched successfully');
      return data;
    } catch (error: any) {
      console.error('❌ ProfileService.getProfile - Service error:', error);
      if (error.message.includes('No rows')) {
        return null;
      }
      throw new Error(error.message || 'Failed to fetch profile');
    }
  }

  // Update user profile
  async updateProfile(userId: string, updates: UpdateProfileData): Promise<UserProfile> {
    try {
      console.log('👤 ProfileService.updateProfile - Updating profile for user:', userId);
      console.log('👤 ProfileService.updateProfile - Updates:', updates);
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('❌ ProfileService.updateProfile - Error:', error);
        throw new Error(error.message);
      }

      console.log('✅ ProfileService.updateProfile - Profile updated successfully');
      return data;
    } catch (error: any) {
      console.error('❌ ProfileService.updateProfile - Service error:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  }

  // Create user profile (for new users)
  async createProfile(userId: string, profileData: {
    email: string;
    full_name: string;
    phone?: string;
    role?: 'customer' | 'admin';
  }): Promise<UserProfile> {
    try {
      console.log('👤 ProfileService.createProfile - Creating profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: profileData.email,
          full_name: profileData.full_name,
          phone: profileData.phone,
          role: profileData.role || 'customer'
        })
        .select()
        .single();

      if (error) {
        console.error('❌ ProfileService.createProfile - Error:', error);
        throw new Error(error.message);
      }

      console.log('✅ ProfileService.createProfile - Profile created successfully');
      return data;
    } catch (error: any) {
      console.error('❌ ProfileService.createProfile - Service error:', error);
      throw new Error(error.message || 'Failed to create profile');
    }
  }

  // Check if user has a complete address
  hasCompleteAddress(profile: UserProfile): boolean {
    return !!(
      profile.address_line1 &&
      profile.city &&
      profile.state &&
      profile.postal_code &&
      profile.phone
    );
  }

  // Format address for display
  formatAddress(profile: UserProfile): string {
    const parts = [];
    
    if (profile.address_line1) parts.push(profile.address_line1);
    if (profile.address_line2) parts.push(profile.address_line2);
    if (profile.landmark) parts.push(`Near ${profile.landmark}`);
    if (profile.city) parts.push(profile.city);
    if (profile.state) parts.push(profile.state);
    if (profile.postal_code) parts.push(profile.postal_code);
    if (profile.country && profile.country !== 'India') parts.push(profile.country);
    
    return parts.join(', ');
  }
}

export const profileService = new ProfileService();
