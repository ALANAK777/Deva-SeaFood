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
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { loginUser, clearError } from '../store/authSlice';
import { LoginCredentials } from '../types/auth';
import { AuthStackParamList } from '../types/navigation';
import { APP_CONSTANTS } from '../utils/constants';
import LoadingSpinner from '../components/LoadingSpinner';
import { CustomModal } from '../components/modals';
import { useModal } from '../hooks/useModal';

type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);
  const { showModal, isModalVisible, modalProps, hideModal } = useModal();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'customer' as 'customer' | 'admin',
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    console.log('📱 LoginScreen - Component mounted');
    return () => {
      console.log('📱 LoginScreen - Component unmounted');
    };
  }, []);

  useEffect(() => {
    if (error) {
      console.error('📱 LoginScreen - Error received:', error);
      showModal('Login Failed', error, 'error');
      dispatch(clearError());
    }
  }, [error]);

  useEffect(() => {
    console.log('📱 LoginScreen - Auth state changed:', {
      isLoading,
      isAuthenticated,
      hasError: !!error
    });
  }, [isLoading, isAuthenticated, error]);

  const handleLogin = async () => {
    console.log('📱 LoginScreen - Login button pressed', {
      email: formData.email,
      role: formData.role,
      hasPassword: !!formData.password
    });

    if (!formData.email || !formData.password) {
      console.warn('📱 LoginScreen - Validation failed: Missing fields');
      showModal('Error', 'Please fill in all fields', 'error');
      return;
    }

    const credentials: LoginCredentials = {
      email: formData.email.toLowerCase().trim(),
      password: formData.password,
      role: formData.role,
    };

    console.log('📱 LoginScreen - Dispatching login action');
    dispatch(loginUser(credentials));
  };

  const navigateToRegister = () => {
    console.log('📱 LoginScreen - Navigating to Register screen');
    navigation.navigate('Register');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
        <Text style={styles.loadingText}>Signing you in...</Text>
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
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your Deva Sea Food account</Text>
        </View>

        <View style={styles.form}>
          {/* Role Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Login as</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.role}
                onValueChange={(itemValue) => setFormData({ ...formData, role: itemValue })}
                style={styles.picker}
              >
                <Picker.Item label="Customer" value="customer" />
                <Picker.Item label="Admin" value="admin" />
              </Picker>
            </View>
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

          {/* Login Button */}
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={isLoading}>
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>

          {/* Register Link */}
          <View style={styles.registerSection}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={navigateToRegister}>
              <Text style={styles.registerLink}>Sign Up</Text>
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
    marginBottom: 40,
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
  loginButton: {
    height: APP_CONSTANTS.SIZES.BUTTON_HEIGHT,
    backgroundColor: APP_CONSTANTS.COLORS.PRIMARY,
    borderRadius: APP_CONSTANTS.SIZES.BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginButtonText: {
    color: APP_CONSTANTS.COLORS.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
  registerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  registerText: {
    fontSize: 14,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
  },
  registerLink: {
    fontSize: 14,
    color: APP_CONSTANTS.COLORS.PRIMARY,
    fontWeight: '600',
  },
});

export default LoginScreen;
