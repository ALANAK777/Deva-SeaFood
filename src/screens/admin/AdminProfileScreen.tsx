import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { APP_CONSTANTS } from '../../utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { logoutUser } from '../../store/authSlice';
import { supabase } from '../../services/supabase';
import { adminService, AdminStats } from '../../services/adminService';
import { useModal } from '../../hooks/useModal';
import CustomModal from '../../components/modals/CustomModal';
import ConfirmModal from '../../components/modals/ConfirmModal';
import ToastModal from '../../components/modals/ToastModal';

interface AdminProfileScreenProps {
  navigation: any;
}

export const AdminProfileScreen: React.FC<AdminProfileScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  // Modal hook for managing all modal states
  const {
    showModal,
    showConfirm,
    isModalVisible,
    modalProps,
    hideModal,
    isConfirmVisible,
    confirmProps,
    hideConfirm,
  } = useModal();

  const [systemStatus, setSystemStatus] = useState({
    database: 'checking',
    lastUpdate: new Date().toLocaleString('en-IN'),
    version: '1.0.0',
  });
  const [stats, setStats] = useState<AdminStats>({
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockItems: 0,
    revenueToday: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSystemStatus();
    loadAdminStats();
  }, []);

  const loadAdminStats = async () => {
    try {
      console.log('📊 AdminProfileScreen - Loading admin stats...');
      setLoading(true);
      const adminStats = await adminService.getAdminStats();
      setStats(adminStats);
      console.log('✅ AdminProfileScreen - Stats loaded:', adminStats);
    } catch (error) {
      console.error('❌ AdminProfileScreen - Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    await Promise.all([
      loadAdminStats(),
      checkSystemStatus()
    ]);
  };

  const checkSystemStatus = async () => {
    try {
      // Check database connection
      const { data, error } = await supabase.from('products').select('count').limit(1);
      setSystemStatus(prev => ({
        ...prev,
        database: error ? 'offline' : 'online',
      }));
    } catch (error) {
      setSystemStatus(prev => ({
        ...prev,
        database: 'offline',
      }));
    }
  };

  const adminMenuItems = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      subtitle: 'Overview and analytics',
      icon: 'analytics-outline' as keyof typeof Ionicons.glyphMap,
      onPress: () => navigation.getParent()?.navigate('Dashboard', { screen: 'AdminDashboard' }),
    },
    {
      id: 'products',
      title: 'Product Management',
      subtitle: 'Add, edit, and manage products',
      icon: 'fish-outline' as keyof typeof Ionicons.glyphMap,
      onPress: () => navigation.getParent()?.navigate('Products', { screen: 'ProductManagement' }),
    },
    {
      id: 'orders',
      title: 'Order Management',
      subtitle: 'View and update order status',
      icon: 'receipt-outline' as keyof typeof Ionicons.glyphMap,
      onPress: () => navigation.getParent()?.navigate('Orders', { screen: 'OrderManagement' }),
    },
    {
      id: 'customers',
      title: 'Customer Management',
      subtitle: 'View customer details and history',
      icon: 'people-outline' as keyof typeof Ionicons.glyphMap,
      onPress: () => navigation.getParent()?.navigate('Dashboard', { screen: 'CustomerManagement' }),
    },
    {
      id: 'reports',
      title: 'Reports & Analytics',
      subtitle: 'Sales reports and insights',
      icon: 'bar-chart-outline' as keyof typeof Ionicons.glyphMap,
      onPress: () => navigation.getParent()?.navigate('Dashboard', { screen: 'Reports' }),
    },
  ];

  const profileActions = [
    {
      id: 'edit_profile',
      title: 'Edit Profile',
      subtitle: 'Update personal information',
      icon: 'person-outline' as keyof typeof Ionicons.glyphMap,
      onPress: () => showModal('Coming Soon', 'Edit profile feature will be available in the next update.', 'info'),
    },
    {
      id: 'change_password',
      title: 'Change Password',
      subtitle: 'Update your password',
      icon: 'key-outline' as keyof typeof Ionicons.glyphMap,
      onPress: () => showModal('Coming Soon', 'Change password feature will be available in the next update.', 'info'),
    },
    {
      id: 'notifications',
      title: 'Notification Settings',
      subtitle: 'Manage notification preferences',
      icon: 'notifications-outline' as keyof typeof Ionicons.glyphMap,
      onPress: () => showModal('Coming Soon', 'Notification settings will be available in the next update.', 'info'),
    },
  ];

  const handleLogout = () => {
    showConfirm(
      'Logout',
      'Are you sure you want to logout?',
      () => {
        dispatch(logoutUser());
      },
      'warning',
      'Logout',
      'Cancel'
    );
  };

  const renderMenuItem = (item: typeof adminMenuItems[0]) => (
    <TouchableOpacity key={item.id} style={styles.menuItem} onPress={item.onPress}>
      <View style={styles.menuItemIcon}>
        <Ionicons name={item.icon} size={24} color={APP_CONSTANTS.COLORS.PRIMARY} />
      </View>
      <View style={styles.menuItemContent}>
        <Text style={styles.menuItemTitle}>{item.title}</Text>
        <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={APP_CONSTANTS.COLORS.TEXT_SECONDARY} />
    </TouchableOpacity>
  );

  const renderProfileAction = (item: typeof profileActions[0]) => (
    <TouchableOpacity key={item.id} style={styles.profileAction} onPress={item.onPress}>
      <View style={styles.profileActionIcon}>
        <Ionicons name={item.icon} size={20} color={APP_CONSTANTS.COLORS.TEXT_SECONDARY} />
      </View>
      <View style={styles.profileActionContent}>
        <Text style={styles.profileActionTitle}>{item.title}</Text>
        <Text style={styles.profileActionSubtitle}>{item.subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={APP_CONSTANTS.COLORS.TEXT_SECONDARY} />
    </TouchableOpacity>
  );

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl 
          refreshing={loading} 
          onRefresh={onRefresh}
          colors={[APP_CONSTANTS.COLORS.PRIMARY]}
        />
      }
    >
      {/* Admin Header */}
      <View style={styles.adminHeader}>
        <View style={styles.adminAvatar}>
          <Ionicons name="person" size={40} color="#FFFFFF" />
        </View>
        <View style={styles.adminInfo}>
          <Text style={styles.adminName}>{user?.full_name || 'Admin User'}</Text>
          <Text style={styles.adminEmail}>{user?.email || 'admin@fishmarket.com'}</Text>
          <View style={styles.adminBadge}>
            <Ionicons name="shield-checkmark" size={12} color="#FFFFFF" />
            <Text style={styles.adminBadgeText}>Administrator</Text>
          </View>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.quickStatsContainer}>
        <View style={styles.quickStat}>
          <Text style={styles.quickStatValue}>
            {loading ? '...' : stats.totalOrders}
          </Text>
          <Text style={styles.quickStatLabel}>Total Orders</Text>
        </View>
        <View style={styles.quickStatDivider} />
        <View style={styles.quickStat}>
          <Text style={styles.quickStatValue}>
            {loading ? '...' : stats.totalProducts}
          </Text>
          <Text style={styles.quickStatLabel}>Products</Text>
        </View>
        <View style={styles.quickStatDivider} />
        <View style={styles.quickStat}>
          <Text style={styles.quickStatValue}>
            {loading ? '...' : stats.totalCustomers}
          </Text>
          <Text style={styles.quickStatLabel}>Customers</Text>
        </View>
      </View>

      {/* Additional Stats */}
      <View style={styles.additionalStatsContainer}>
        <View style={styles.additionalStat}>
          <Text style={styles.additionalStatValue}>
            ₹{loading ? '...' : stats.totalRevenue.toLocaleString('en-IN')}
          </Text>
          <Text style={styles.additionalStatLabel}>Total Revenue</Text>
        </View>
        <View style={styles.additionalStat}>
          <Text style={styles.additionalStatValue}>
            {loading ? '...' : stats.pendingOrders}
          </Text>
          <Text style={styles.additionalStatLabel}>Pending Orders</Text>
        </View>
      </View>

      {/* Admin Functions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Admin Functions</Text>
        <View style={styles.menuContainer}>
          {adminMenuItems.map(renderMenuItem)}
        </View>
      </View>

      {/* Profile Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Settings</Text>
        <View style={styles.profileActionsContainer}>
          {profileActions.map(renderProfileAction)}
        </View>
      </View>

      {/* System Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>System Information</Text>
        <View style={styles.systemInfoContainer}>
          <View style={styles.systemInfoItem}>
            <Text style={styles.systemInfoLabel}>Low Stock Items</Text>
            <Text style={[styles.systemInfoValue, { 
              color: stats.lowStockItems > 0 ? '#F44336' : APP_CONSTANTS.COLORS.SUCCESS 
            }]}>
              {loading ? 'Loading...' : stats.lowStockItems}
            </Text>
          </View>
          <View style={styles.systemInfoItem}>
            <Text style={styles.systemInfoLabel}>App Version</Text>
            <Text style={styles.systemInfoValue}>{systemStatus.version}</Text>
          </View>
          <View style={styles.systemInfoItem}>
            <Text style={styles.systemInfoLabel}>Last Update</Text>
            <Text style={styles.systemInfoValue}>{systemStatus.lastUpdate}</Text>
          </View>
          <View style={styles.systemInfoItem}>
            <Text style={styles.systemInfoLabel}>Database Status</Text>
            <View style={styles.statusIndicator}>
              <View style={[
                styles.statusDot, 
                { backgroundColor: systemStatus.database === 'online' ? '#4CAF50' : '#F44336' }
              ]} />
              <Text style={styles.systemInfoValue}>
                {systemStatus.database === 'online' ? 'Connected' : 
                 systemStatus.database === 'offline' ? 'Disconnected' : 'Checking...'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Logout Button */}
      <View style={styles.logoutSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#F44336" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Fish Market Admin Panel © {new Date().getFullYear()}
        </Text>
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_CONSTANTS.COLORS.BACKGROUND,
  },
  adminHeader: {
    backgroundColor: APP_CONSTANTS.COLORS.PRIMARY,
    padding: APP_CONSTANTS.SIZES.PADDING,
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  adminInfo: {
    flex: 1,
  },
  adminName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  adminEmail: {
    fontSize: 16,
    color: '#E3F2FD',
    marginBottom: 8,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  adminBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  quickStatsContainer: {
    backgroundColor: '#FFFFFF',
    margin: APP_CONSTANTS.SIZES.PADDING,
    borderRadius: 12,
    flexDirection: 'row',
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickStat: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: APP_CONSTANTS.COLORS.PRIMARY,
  },
  quickStatLabel: {
    fontSize: 14,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
    marginTop: 4,
  },
  quickStatDivider: {
    width: 1,
    backgroundColor: APP_CONSTANTS.COLORS.BORDER,
    marginVertical: 8,
  },
  additionalStatsContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: APP_CONSTANTS.SIZES.PADDING,
    marginBottom: 16,
    borderRadius: 12,
    flexDirection: 'row',
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  additionalStat: {
    flex: 1,
    alignItems: 'center',
  },
  additionalStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: APP_CONSTANTS.COLORS.SUCCESS,
  },
  additionalStatLabel: {
    fontSize: 12,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginHorizontal: APP_CONSTANTS.SIZES.PADDING,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
    marginBottom: 16,
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: APP_CONSTANTS.COLORS.BORDER,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
  },
  profileActionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileAction: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: APP_CONSTANTS.COLORS.BORDER,
  },
  profileActionIcon: {
    marginRight: 12,
  },
  profileActionContent: {
    flex: 1,
  },
  profileActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
    marginBottom: 2,
  },
  profileActionSubtitle: {
    fontSize: 14,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
  },
  systemInfoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  systemInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: APP_CONSTANTS.COLORS.BORDER,
  },
  systemInfoLabel: {
    fontSize: 14,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
  },
  systemInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 8,
  },
  logoutSection: {
    marginHorizontal: APP_CONSTANTS.SIZES.PADDING,
    marginBottom: 24,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F44336',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F44336',
    marginLeft: 8,
  },
  footer: {
    padding: APP_CONSTANTS.SIZES.PADDING,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
  },
});
