import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';

import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { fetchProfile, updateProfile } from '../../store/profileSlice';
import { APP_CONSTANTS } from '../../utils/constants';
import { CustomerStackParamList } from '../../types/navigation';

type NavigationProp = StackNavigationProp<CustomerStackParamList>;

export const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { profile, isLoading, isUpdating } = useAppSelector((state) => state.profile);

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
    landmark: '',
    address_type: 'home' as 'home' | 'work' | 'other',
  });

  // Load profile data when component mounts
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchProfile(user.id));
    }
  }, [user?.id, dispatch]);

  // Populate form when profile is loaded
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        address_line1: profile.address_line1 || '',
        address_line2: profile.address_line2 || '',
        city: profile.city || '',
        state: profile.state || '',
        postal_code: profile.postal_code || '',
        country: profile.country || 'India',
        landmark: profile.landmark || '',
        address_type: profile.address_type || 'home',
      });
    }
  }, [profile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.full_name.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return false;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return false;
    }
    if (formData.phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    if (!user?.id) return;

    try {
      console.log('💾 EditProfileScreen - Saving profile updates');
      await dispatch(updateProfile({
        userId: user.id,
        updates: formData
      })).unwrap();
      
      console.log('✅ EditProfileScreen - Profile updated successfully');
      Alert.alert(
        'Success',
        'Your profile has been updated successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      console.error('❌ EditProfileScreen - Update failed:', error);
      Alert.alert('Error', error.message || 'Failed to update profile. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Personal Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <Text style={styles.inputLabel}>Full Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your full name"
          value={formData.full_name}
          onChangeText={(value) => handleInputChange('full_name', value)}
          placeholderTextColor={APP_CONSTANTS.COLORS.TEXT_SECONDARY}
        />
        
        <Text style={styles.inputLabel}>Phone Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your phone number"
          value={formData.phone}
          onChangeText={(value) => handleInputChange('phone', value)}
          keyboardType="phone-pad"
          placeholderTextColor={APP_CONSTANTS.COLORS.TEXT_SECONDARY}
        />
      </View>

      {/* Address Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Address Information</Text>
        
        <Text style={styles.inputLabel}>Street Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter street address"
          value={formData.address_line1}
          onChangeText={(value) => handleInputChange('address_line1', value)}
          placeholderTextColor={APP_CONSTANTS.COLORS.TEXT_SECONDARY}
        />
        
        <Text style={styles.inputLabel}>Area/Locality</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter area or locality"
          value={formData.address_line2}
          onChangeText={(value) => handleInputChange('address_line2', value)}
          placeholderTextColor={APP_CONSTANTS.COLORS.TEXT_SECONDARY}
        />
        
        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>City</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter city"
              value={formData.city}
              onChangeText={(value) => handleInputChange('city', value)}
              placeholderTextColor={APP_CONSTANTS.COLORS.TEXT_SECONDARY}
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>State</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter state"
              value={formData.state}
              onChangeText={(value) => handleInputChange('state', value)}
              placeholderTextColor={APP_CONSTANTS.COLORS.TEXT_SECONDARY}
            />
          </View>
        </View>
        
        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>Postal Code</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter postal code"
              value={formData.postal_code}
              onChangeText={(value) => handleInputChange('postal_code', value)}
              keyboardType="numeric"
              placeholderTextColor={APP_CONSTANTS.COLORS.TEXT_SECONDARY}
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>Country</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter country"
              value={formData.country}
              onChangeText={(value) => handleInputChange('country', value)}
              placeholderTextColor={APP_CONSTANTS.COLORS.TEXT_SECONDARY}
            />
          </View>
        </View>
        
        <Text style={styles.inputLabel}>Landmark</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter landmark (optional)"
          value={formData.landmark}
          onChangeText={(value) => handleInputChange('landmark', value)}
          placeholderTextColor={APP_CONSTANTS.COLORS.TEXT_SECONDARY}
        />
      </View>

      {/* Save Button */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={[styles.saveButton, isUpdating && styles.disabledButton]}
          onPress={handleSave}
          disabled={isUpdating}
        >
          <Text style={styles.saveButtonText}>
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: APP_CONSTANTS.COLORS.BACKGROUND,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
  },
  header: {
    backgroundColor: APP_CONSTANTS.COLORS.PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: APP_CONSTANTS.SIZES.PADDING,
    paddingTop: 50, // Account for status bar
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerRight: {
    width: 40,
  },
  section: {
    backgroundColor: '#FFFFFF',
    margin: APP_CONSTANTS.SIZES.PADDING,
    padding: APP_CONSTANTS.SIZES.PADDING,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: APP_CONSTANTS.COLORS.BORDER,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 0.48,
  },
  bottomSection: {
    padding: APP_CONSTANTS.SIZES.PADDING,
    paddingBottom: 30,
  },
  saveButton: {
    backgroundColor: APP_CONSTANTS.COLORS.PRIMARY,
    paddingVertical: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: APP_CONSTANTS.COLORS.GRAY,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
