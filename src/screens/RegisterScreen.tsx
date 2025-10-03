import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { registerUser, clearError } from '../store/authSlice';
import { RegisterCredentials } from '../types/auth';
import { AuthStackParamList } from '../types/navigation';
import { APP_CONSTANTS } from '../utils/constants';
import LoadingSpinner from '../components/LoadingSpinner';
import { CustomModal } from '../components/modals';
import { useModal } from '../hooks/useModal';

type RegisterScreenProps = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);
  const { showModal, isModalVisible, modalProps, hideModal } = useModal();
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'customer' as 'customer' | 'admin',
    acceptTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    console.log('📱 RegisterScreen - Component mounted');
    return () => {
      console.log('📱 RegisterScreen - Component unmounted');
    };
  }, []);

  useEffect(() => {
    if (error) {
      console.error('📱 RegisterScreen - Error received:', error);
      showModal('Registration Failed', error, 'error');
      dispatch(clearError());
    }
  }, [error]);

  useEffect(() => {
    console.log('📱 RegisterScreen - Auth state changed:', {
      isLoading,
      isAuthenticated,
      hasError: !!error
    });
  }, [isLoading, isAuthenticated, error]);

  const handleRegister = async () => {
    console.log('📱 RegisterScreen - Register button pressed', {
      email: formData.email,
      role: formData.role,
      fullName: formData.full_name,
      hasPassword: !!formData.password,
      acceptTerms: formData.acceptTerms
    });
    // Validation
    if (!formData.full_name || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      console.warn('📱 RegisterScreen - Validation failed: Missing fields');
      showModal('Error', 'Please fill in all fields', 'error');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      console.warn('📱 RegisterScreen - Validation failed: Password mismatch');
      showModal('Error', 'Passwords do not match', 'error');
      return;
    }

    if (formData.password.length < 6) {
      console.warn('📱 RegisterScreen - Validation failed: Password too short');
      showModal('Error', 'Password must be at least 6 characters long', 'error');
      return;
    }

    if (!formData.acceptTerms) {
      console.warn('📱 RegisterScreen - Validation failed: Terms not accepted');
      showModal('Error', 'Please accept the terms and conditions', 'error');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      console.warn('📱 RegisterScreen - Validation failed: Invalid email format');
      showModal('Error', 'Please enter a valid email address', 'error');
      return;
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      console.warn('📱 RegisterScreen - Validation failed: Invalid phone format');
      showModal('Error', 'Please enter a valid 10-digit phone number', 'error');
      return;
    }

    const credentials: RegisterCredentials = {
      full_name: formData.full_name.trim(),
      email: formData.email.toLowerCase().trim(),
      phone: formData.phone.trim(),
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      role: formData.role,
      acceptTerms: formData.acceptTerms,
    };

    console.log('📱 RegisterScreen - Dispatching register action');
    dispatch(registerUser(credentials));
  };

  const navigateToLogin = () => {
    console.log('📱 RegisterScreen - Navigating to Login screen');
    navigation.navigate('Login');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
        <Text style={styles.loadingText}>Creating your account...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Deva Sea Food today</Text>
        </View>

        <View style={styles.form}>
          {/* Role Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Register as</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.role}
                onValueChange={(itemValue: 'customer' | 'admin') => 
                  setFormData({ ...formData, role: itemValue })
                }
                style={styles.picker}
              >
                <Picker.Item label="Customer" value="customer" />
                <Picker.Item label="Admin" value="admin" />
              </Picker>
            </View>
          </View>

          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              value={formData.full_name}
              onChangeText={(text) => setFormData({ ...formData, full_name: text })}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Phone */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={10}
            />
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter your password"
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.passwordToggleText}>
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Text style={styles.passwordToggleText}>
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Terms and Conditions */}
          <View style={styles.termsContainer}>
            <Switch
              value={formData.acceptTerms}
              onValueChange={(value) => setFormData({ ...formData, acceptTerms: value })}
              trackColor={{ false: APP_CONSTANTS.COLORS.LIGHT_GRAY, true: APP_CONSTANTS.COLORS.PRIMARY }}
              thumbColor={formData.acceptTerms ? APP_CONSTANTS.COLORS.WHITE : APP_CONSTANTS.COLORS.GRAY}
            />
            <Text style={styles.termsText}>
              I agree to the{' '}
              <Text style={styles.termsLink}>Terms and Conditions</Text>
              {' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>

          {/* Register Button */}
          <TouchableOpacity 
            style={[
              styles.registerButton,
              !formData.acceptTerms && styles.disabledButton
            ]} 
            onPress={handleRegister} 
            disabled={isLoading || !formData.acceptTerms}
          >
            <Text style={styles.registerButtonText}>Create Account</Text>
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginSection}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <CustomModal
        visible={isModalVisible}
        onClose={hideModal}
        title={modalProps.title}
        message={modalProps.message}
        type={modalProps.type}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_CONSTANTS.COLORS.BACKGROUND,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: APP_CONSTANTS.COLORS.BACKGROUND,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: APP_CONSTANTS.SIZES.PADDING,
  },
  header: {
    marginTop: 60,
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  form: {
    flex: 1,
    paddingBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: APP_CONSTANTS.COLORS.BORDER,
    borderRadius: APP_CONSTANTS.SIZES.BORDER_RADIUS,
    backgroundColor: APP_CONSTANTS.COLORS.WHITE,
    minHeight: APP_CONSTANTS.SIZES.INPUT_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: Platform.OS === 'android' ? 12 : 0,
  },
  picker: {
    height: Platform.OS === 'ios' ? APP_CONSTANTS.SIZES.INPUT_HEIGHT : 56,
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
    backgroundColor: 'transparent',
    fontSize: 16,
  },
  input: {
    height: APP_CONSTANTS.SIZES.INPUT_HEIGHT,
    borderWidth: 1,
    borderColor: APP_CONSTANTS.COLORS.BORDER,
    borderRadius: APP_CONSTANTS.SIZES.BORDER_RADIUS,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: APP_CONSTANTS.COLORS.WHITE,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: APP_CONSTANTS.COLORS.BORDER,
    borderRadius: APP_CONSTANTS.SIZES.BORDER_RADIUS,
    backgroundColor: APP_CONSTANTS.COLORS.WHITE,
  },
  passwordInput: {
    flex: 1,
    height: APP_CONSTANTS.SIZES.INPUT_HEIGHT,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  passwordToggle: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  passwordToggleText: {
    color: APP_CONSTANTS.COLORS.PRIMARY,
    fontSize: 14,
    fontWeight: '600',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
    lineHeight: 20,
    marginLeft: 12,
  },
  termsLink: {
    color: APP_CONSTANTS.COLORS.PRIMARY,
    textDecorationLine: 'underline',
  },
  registerButton: {
    height: APP_CONSTANTS.SIZES.BUTTON_HEIGHT,
    backgroundColor: APP_CONSTANTS.COLORS.PRIMARY,
    borderRadius: APP_CONSTANTS.SIZES.BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: APP_CONSTANTS.COLORS.GRAY,
  },
  registerButtonText: {
    color: APP_CONSTANTS.COLORS.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  loginText: {
    fontSize: 14,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
  },
  loginLink: {
    fontSize: 14,
    color: APP_CONSTANTS.COLORS.PRIMARY,
    fontWeight: '600',
  },
});

export default RegisterScreen;
