import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { APP_CONSTANTS } from '../../utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { adminService, Customer } from '../../services/adminService';

interface CustomerManagementScreenProps {
  navigation: any;
}

export const CustomerManagementScreen: React.FC<CustomerManagementScreenProps> = ({ 
  navigation 
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchQuery]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      
      // Check admin status for debugging
      const adminStatus = await adminService.checkAdminStatus();
      console.log('🔍 CustomerManagement - Admin status check:', adminStatus);
      
      if (!adminStatus.isAdmin) {
        console.warn('⚠️ CustomerManagement - User is not admin, this might cause RLS issues');
        Alert.alert('Warning', 'You may not have admin permissions to view customer data');
      }

      console.log('👥 CustomerManagement - Fetching customers...');
      const data = await adminService.getCustomers();
      console.log('✅ CustomerManagement - Customers received:', data?.length || 0);
      
      setCustomers(data);
    } catch (error: any) {
      console.error('❌ CustomerManagement - Error:', error);
      Alert.alert('Error', error.message || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCustomers();
    setRefreshing(false);
  };

  const filterCustomers = () => {
    let filtered = customers;

    if (searchQuery.trim()) {
      filtered = filtered.filter(customer =>
        customer.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone?.includes(searchQuery)
      );
    }

    setFilteredCustomers(filtered);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getCustomerStatusColor = (totalOrders: number) => {
    if (totalOrders >= 10) return '#4CAF50'; // Gold/VIP
    if (totalOrders >= 5) return '#2196F3'; // Silver
    return '#FF9800'; // Bronze/New
  };

  const getCustomerStatusText = (totalOrders: number) => {
    if (totalOrders >= 10) return 'VIP Customer';
    if (totalOrders >= 5) return 'Regular Customer';
    return 'New Customer';
  };

  const handleCustomerPress = (customer: Customer) => {
    Alert.alert(
      customer.full_name,
      `Email: ${customer.email}\nPhone: ${customer.phone || 'Not provided'}\nTotal Orders: ${customer.total_orders || 0}\nTotal Spent: ₹${customer.total_spent || 0}\nJoined: ${formatDate(customer.created_at)}\nLast Order: ${customer.last_order_date ? formatDate(customer.last_order_date) : 'None'}`,
      [
        { text: 'OK', style: 'default' },
      ]
    );
  };

  const renderCustomer = ({ item }: { item: Customer }) => (
    <TouchableOpacity 
      style={styles.customerCard}
      onPress={() => handleCustomerPress(item)}
    >
      <View style={styles.customerHeader}>
        <View style={styles.customerAvatar}>
          <Text style={styles.customerInitials}>
            {item.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </Text>
        </View>
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{item.full_name}</Text>
          <Text style={styles.customerEmail}>{item.email}</Text>
          {item.phone && (
            <Text style={styles.customerPhone}>{item.phone}</Text>
          )}
        </View>
        <View style={[
          styles.customerStatusBadge,
          { backgroundColor: getCustomerStatusColor(item.total_orders || 0) }
        ]}>
          <Text style={styles.customerStatusText}>
            {getCustomerStatusText(item.total_orders || 0)}
          </Text>
        </View>
      </View>

      <View style={styles.customerStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.total_orders || 0}</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>₹{(item.total_spent || 0).toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total Spent</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {item.last_order_date ? formatDate(item.last_order_date) : 'Never'}
          </Text>
          <Text style={styles.statLabel}>Last Order</Text>
        </View>
      </View>

      <View style={styles.customerActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="call-outline" size={16} color={APP_CONSTANTS.COLORS.PRIMARY} />
          <Text style={styles.actionButtonText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="mail-outline" size={16} color={APP_CONSTANTS.COLORS.PRIMARY} />
          <Text style={styles.actionButtonText}>Email</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="receipt-outline" size={16} color={APP_CONSTANTS.COLORS.PRIMARY} />
          <Text style={styles.actionButtonText}>Orders</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={64} color={APP_CONSTANTS.COLORS.TEXT_SECONDARY} />
      <Text style={styles.emptyStateTitle}>No Customers Found</Text>
      <Text style={styles.emptyStateText}>
        {searchQuery
          ? 'Try adjusting your search query'
          : 'No customers have registered yet'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={APP_CONSTANTS.COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Loading customers...</Text>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <View style={styles.searchContainer}>
              <Ionicons
                name="search"
                size={20}
                color={APP_CONSTANTS.COLORS.TEXT_SECONDARY}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search customers..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={APP_CONSTANTS.COLORS.TEXT_SECONDARY}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={APP_CONSTANTS.COLORS.TEXT_SECONDARY}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.statsOverview}>
            <View style={styles.overviewStat}>
              <Text style={styles.overviewStatValue}>{customers.length}</Text>
              <Text style={styles.overviewStatLabel}>Total Customers</Text>
            </View>
            <View style={styles.overviewStat}>
              <Text style={styles.overviewStatValue}>
                {customers.filter(c => (c.total_orders || 0) >= 10).length}
              </Text>
              <Text style={styles.overviewStatLabel}>VIP Customers</Text>
            </View>
            <View style={styles.overviewStat}>
              <Text style={styles.overviewStatValue}>
                ₹{customers.reduce((sum, c) => sum + (c.total_spent || 0), 0).toLocaleString()}
              </Text>
              <Text style={styles.overviewStatLabel}>Total Revenue</Text>
            </View>
          </View>

          <FlatList
            data={filteredCustomers}
            keyExtractor={(item) => item.id}
            renderItem={renderCustomer}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            contentContainerStyle={filteredCustomers.length === 0 ? styles.emptyContainer : styles.listContainer}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_CONSTANTS.COLORS.BACKGROUND,
  },
  header: {
    padding: APP_CONSTANTS.SIZES.PADDING,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: APP_CONSTANTS.COLORS.BORDER,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: APP_CONSTANTS.COLORS.BACKGROUND,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
  },
  statsOverview: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: APP_CONSTANTS.COLORS.BORDER,
  },
  overviewStat: {
    flex: 1,
    alignItems: 'center',
  },
  overviewStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: APP_CONSTANTS.COLORS.PRIMARY,
  },
  overviewStatLabel: {
    fontSize: 12,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
    marginTop: 4,
  },
  listContainer: {
    padding: APP_CONSTANTS.SIZES.PADDING,
  },
  emptyContainer: {
    flex: 1,
  },
  customerCard: {
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  customerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: APP_CONSTANTS.COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  customerInitials: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
    marginBottom: 2,
  },
  customerEmail: {
    fontSize: 14,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
    marginBottom: 2,
  },
  customerPhone: {
    fontSize: 14,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
  },
  customerStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  customerStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  customerStats: {
    flexDirection: 'row',
    paddingVertical: 12,
    marginBottom: 16,
    backgroundColor: APP_CONSTANTS.COLORS.BACKGROUND,
    borderRadius: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
  },
  statLabel: {
    fontSize: 12,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: APP_CONSTANTS.COLORS.BORDER,
    marginVertical: 4,
  },
  customerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: APP_CONSTANTS.COLORS.PRIMARY,
    borderRadius: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: APP_CONSTANTS.COLORS.PRIMARY,
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: APP_CONSTANTS.SIZES.PADDING,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: APP_CONSTANTS.SIZES.PADDING,
  },
  loadingText: {
    fontSize: 16,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
    marginTop: 16,
  },
});
