import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { logoutUser } from '../../store/authSlice';
import { fetchProfile, updateProfile } from '../../store/profileSlice';
import { APP_CONSTANTS } from '../../utils/constants';
import { CustomerStackParamList } from '../../types/navigation';
import { useModal } from '../../hooks/useModal';
import CustomModal from '../../components/modals/CustomModal';
import ConfirmModal from '../../components/modals/ConfirmModal';
import ToastModal from '../../components/modals/ToastModal';

type NavigationProp = StackNavigationProp<CustomerStackParamList>;

export const CustomerProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { profile, isLoading: profileLoading } = useAppSelector((state) => state.profile);

  // Modal hook for managing all modal states
  const {
    showModal,
    showConfirm,
    showToast,
    isModalVisible,
    modalProps,
    hideModal,
    isConfirmVisible,
    confirmProps,
    hideConfirm,
    isToastVisible,
    toastProps,
    hideToast,
  } = useModal();

  // Fetch profile data when component mounts
  useEffect(() => {
    if (user?.id) {
      console.log('👤 CustomerProfileScreen - Fetching profile for user:', user.id);
      console.log('👤 CustomerProfileScreen - Current auth user data:', {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role
      });
      dispatch(fetchProfile(user.id));
    }
  }, [user?.id, dispatch]);

  // Log profile data when it changes
  useEffect(() => {
    if (profile) {
      console.log('👤 CustomerProfileScreen - Profile data received:', {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        phone: profile.phone,
        role: profile.role,
        hasAddress: !!(profile.address_line1 && profile.city)
      });
    }
  }, [profile]);

  // Determine display name and email
  const displayName = profile?.full_name || user?.full_name || 'User';
  const displayEmail = profile?.email || user?.email || 'No email';
  const displayPhone = profile?.phone || user?.phone || 'No phone number';

  console.log('👤 CustomerProfileScreen - Display values:', {
    displayName,
    displayEmail,
    displayPhone,
    profileLoading
  });

  const handleFixProfile = async () => {
    if (!user?.id || !user?.full_name) {
      showModal('Error', 'Cannot fix profile - missing user data', 'error');
      return;
    }

    try {
      console.log('🔧 CustomerProfileScreen - Attempting to fix profile with auth data');
      await dispatch(updateProfile({
        userId: user.id,
        updates: {
          full_name: user.full_name,
          phone: user.phone || '',
        }
      })).unwrap();
      
      console.log('✅ CustomerProfileScreen - Profile fixed successfully');
      showToast('Profile has been repaired with your login information!', 'success');
    } catch (error: any) {
      console.error('❌ CustomerProfileScreen - Failed to fix profile:', error);
      showModal('Error', 'Failed to fix profile: ' + error.message, 'error');
    }
  };

  const handleLogout = () => {
    showConfirm(
      'Logout',
      'Are you sure you want to logout?',
      () => {
        console.log('👤 CustomerProfileScreen - User initiated logout');
        dispatch(logoutUser());
      },
      'warning',
      'Logout',
      'Cancel'
    );
  };

  const menuItems = [
    { icon: 'person-outline', title: 'Edit Profile', onPress: () => navigation.navigate('EditProfile') },
    { icon: 'help-circle-outline', title: 'Help & Support', onPress: () => {} },
    { icon: 'information-circle-outline', title: 'About Us', onPress: () => {} },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Icon name="person" size={50} color="#FFFFFF" />
        </View>
        <Text style={styles.userName}>{displayName}</Text>
        <Text style={styles.userEmail}>{displayEmail}</Text>
        <Text style={styles.userRole}>Customer Account</Text>
        {profileLoading && (
          <Text style={styles.loadingText}>Loading profile...</Text>
        )}
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <View style={styles.menuItemLeft}>
              <Icon name={item.icon} size={24} color={APP_CONSTANTS.COLORS.TEXT_PRIMARY} />
              <Text style={styles.menuItemText}>{item.title}</Text>
            </View>
            <Icon name="chevron-forward" size={20} color={APP_CONSTANTS.COLORS.TEXT_SECONDARY} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Debug Section - Only in development */}
      {__DEV__ && (
        <View style={styles.debugSection}>
          <Text style={styles.debugTitle}>Debug Info</Text>
          <Text style={styles.debugText}>Auth User: {user?.full_name || 'None'}</Text>
          <Text style={styles.debugText}>Profile: {profile?.full_name || 'None'}</Text>
          <Text style={styles.debugText}>Profile Loading: {profileLoading ? 'Yes' : 'No'}</Text>
          <Text style={styles.debugText}>Profile Exists: {profile ? 'Yes' : 'No'}</Text>
          {user?.full_name && (!profile?.full_name || profile?.full_name !== user?.full_name) && (
            <TouchableOpacity style={styles.fixButton} onPress={handleFixProfile}>
              <Text style={styles.fixButtonText}>Fix Profile Data</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Logout Section */}
      <View style={styles.logoutSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="log-out-outline" size={24} color={APP_CONSTANTS.COLORS.ERROR} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Modal Components */}
      <CustomModal
        visible={isModalVisible}
        title={modalProps.title}
        message={modalProps.message}
        type={modalProps.type}
        onClose={hideModal}
      />
      
      <ConfirmModal
        visible={isConfirmVisible}
        title={confirmProps.title}
        message={confirmProps.message}
        type={confirmProps.type}
        confirmText={confirmProps.confirmText}
        cancelText={confirmProps.cancelText}
        onConfirm={confirmProps.onConfirm}
        onClose={hideConfirm}
      />
      
      <ToastModal
        visible={isToastVisible}
        message={toastProps.message}
        type={toastProps.type}
        onHide={hideToast}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_CONSTANTS.COLORS.BACKGROUND,
  },
  header: {
    backgroundColor: APP_CONSTANTS.COLORS.PRIMARY,
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: APP_CONSTANTS.SIZES.PADDING,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  loadingText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
    fontStyle: 'italic',
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 20,
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: APP_CONSTANTS.SIZES.PADDING,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
    marginLeft: 16,
  },
  logoutSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 20,
    marginBottom: 40,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: APP_CONSTANTS.SIZES.PADDING,
    paddingVertical: 16,
  },
  logoutText: {
    fontSize: 16,
    color: APP_CONSTANTS.COLORS.ERROR,
    marginLeft: 16,
    fontWeight: '500',
  },
  debugSection: {
    backgroundColor: '#FFF3E0',
    margin: APP_CONSTANTS.SIZES.PADDING,
    padding: APP_CONSTANTS.SIZES.PADDING,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 14,
    color: '#BF360C',
    marginBottom: 4,
  },
  fixButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 8,
    alignItems: 'center',
  },
  fixButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
