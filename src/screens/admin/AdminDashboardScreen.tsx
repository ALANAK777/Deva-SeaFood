import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { APP_CONSTANTS } from '../../utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { adminService, AdminStats, RecentActivity } from '../../services/adminService';
import { CustomModal } from '../../components/modals';
import { useModal } from '../../hooks/useModal';

interface DashboardCard {
  title: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress?: () => void;
}

interface AdminDashboardScreenProps {
  navigation: any;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ navigation }) => {
  const { showModal, isModalVisible, modalProps, hideModal } = useModal();
  const [stats, setStats] = useState<AdminStats>({
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockItems: 0,
    revenueToday: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // First check admin status for debugging
      const adminStatus = await adminService.checkAdminStatus();
      console.log('🔍 Dashboard - Admin status check:', adminStatus);
      
      if (!adminStatus.isAdmin) {
        console.warn('⚠️ Dashboard - User is not admin, this might cause RLS issues');
      }

      const [statsData, activityData] = await Promise.all([
        adminService.getAdminStats(),
        adminService.getRecentActivity(),
      ]);
      
      console.log('📊 Dashboard - Stats received:', statsData);
      console.log('🔄 Dashboard - Activity received:', activityData?.length || 0, 'items');
      
      setStats(statsData);
      setRecentActivity(activityData);
    } catch (error: any) {
      console.error('❌ Dashboard - Error fetching data:', error);
      showModal('Error', error.message || 'Failed to fetch dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const dashboardCards: DashboardCard[] = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: 'receipt-outline',
      color: '#4CAF50',
      onPress: () => navigation.getParent()?.navigate('Orders', { screen: 'OrderManagement' }),
    },
    {
      title: 'Products',
      value: stats.totalProducts,
      icon: 'fish-outline',
      color: '#2196F3',
      onPress: () => navigation.getParent()?.navigate('Products', { screen: 'ProductManagement' }),
    },
    {
      title: 'Customers',
      value: stats.totalCustomers,
      icon: 'people-outline',
      color: '#FF9800',
      onPress: () => navigation.getParent()?.navigate('Customers', { screen: 'CustomerManagementMain' }),
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: 'trending-up-outline',
      color: '#8BC34A',
    },
    {
      title: 'Revenue Today',
      value: `₹${stats.revenueToday.toLocaleString()}`,
      icon: 'cash-outline',
      color: '#9C27B0',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: 'time-outline',
      color: '#F44336',
      onPress: () => navigation.getParent()?.navigate('Orders', { 
        screen: 'OrderManagement', 
        params: { filter: 'pending' } 
      }),
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockItems,
      icon: 'warning-outline',
      color: '#FF5722',
      onPress: () => navigation.getParent()?.navigate('Products', { 
        screen: 'ProductManagement', 
        params: { filter: 'low_stock' } 
      }),
    },
  ];

  const quickActions = [
    {
      title: 'View Reports',
      icon: 'analytics-outline' as keyof typeof Ionicons.glyphMap,
      color: '#9C27B0',
      onPress: () => navigation.navigate('Reports'),
    },
  ];

  const renderDashboardCard = (card: DashboardCard, index: number) => (
    <TouchableOpacity
      key={index}
      style={[styles.card, { borderLeftColor: card.color }]}
      onPress={card.onPress}
      disabled={!card.onPress}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardIcon}>
          <Ionicons name={card.icon} size={28} color={card.color} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardValue}>{card.value}</Text>
          <Text style={styles.cardTitle}>{card.title}</Text>
        </View>
      </View>
      {card.onPress && (
        <Ionicons name="chevron-forward" size={20} color={APP_CONSTANTS.COLORS.TEXT_SECONDARY} />
      )}
    </TouchableOpacity>
  );

  const renderQuickAction = (action: typeof quickActions[0], index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.quickActionCard}
      onPress={action.onPress}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
        <Ionicons name={action.icon} size={24} color="#FFFFFF" />
      </View>
      <Text style={styles.quickActionTitle}>{action.title}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back!</Text>
        <Text style={styles.subHeaderText}>Fish Market Admin Dashboard</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.cardsContainer}>
          {dashboardCards.map(renderDashboardCard)}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsContainer}>
          {quickActions.map(renderQuickAction)}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityCard}>
          {recentActivity.length > 0 ? (
            recentActivity.slice(0, 5).map((activity, index) => (
              <View key={activity.id} style={styles.activityItem}>
                <Ionicons name={activity.icon as any} size={20} color={activity.color} />
                <Text style={styles.activityText}>{activity.title}</Text>
                <Text style={styles.activityTime}>
                  {new Date(activity.timestamp).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.activityItem}>
              <Ionicons name="time-outline" size={20} color={APP_CONSTANTS.COLORS.TEXT_SECONDARY} />
              <Text style={styles.activityText}>No recent activity</Text>
              <Text style={styles.activityTime}>--</Text>
            </View>
          )}
        </View>
      </View>
      
      <CustomModal
        visible={isModalVisible}
        onClose={hideModal}
        title={modalProps.title}
        message={modalProps.message}
        type={modalProps.type}
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
    padding: APP_CONSTANTS.SIZES.PADDING,
    backgroundColor: APP_CONSTANTS.COLORS.PRIMARY,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subHeaderText: {
    fontSize: 16,
    color: '#E3F2FD',
  },
  section: {
    padding: APP_CONSTANTS.SIZES.PADDING,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
    marginBottom: 16,
  },
  cardsContainer: {
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIcon: {
    marginRight: 16,
  },
  cardInfo: {
    flex: 1,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
  },
  cardTitle: {
    fontSize: 14,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
    textAlign: 'center',
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  activityText: {
    flex: 1,
    fontSize: 14,
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
    marginLeft: 12,
  },
  activityTime: {
    fontSize: 12,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
  },
});
