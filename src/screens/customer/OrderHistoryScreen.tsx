import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';

import { useAppSelector } from '../../hooks/redux';
import { orderService, Order } from '../../services/orderService';
import { APP_CONSTANTS } from '../../utils/constants';
import { CustomerStackParamList } from '../../types/navigation';
import { useModal } from '../../hooks/useModal';
import CustomModal from '../../components/modals/CustomModal';
import ConfirmModal from '../../components/modals/ConfirmModal';
import ToastModal from '../../components/modals/ToastModal';

type NavigationProp = StackNavigationProp<CustomerStackParamList>;

export const OrderHistoryScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAppSelector((state) => state.auth);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal hook for managing all modal states
  const {
    showModal,
    isModalVisible,
    modalProps,
    hideModal,
  } = useModal();

  useEffect(() => {
    if (user?.id) {
      loadOrders();
    }
  }, [user?.id]);

  const loadOrders = async () => {
    if (!user?.id) return;

    try {
      console.log('📦 OrderHistoryScreen - Loading orders for user:', user.id);
      const userOrders = await orderService.getUserOrders(user.id);
      setOrders(userOrders);
      console.log('✅ OrderHistoryScreen - Orders loaded:', userOrders.length);
    } catch (error: any) {
      console.error('❌ OrderHistoryScreen - Error loading orders:', error);
      showModal('Error', 'Failed to load orders. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return APP_CONSTANTS.COLORS.WARNING;
      case 'confirmed':
        return APP_CONSTANTS.COLORS.PRIMARY;
      case 'preparing':
        return '#FF9800';
      case 'out_for_delivery':
        return '#2196F3';
      case 'delivered':
        return APP_CONSTANTS.COLORS.SUCCESS;
      case 'cancelled':
        return APP_CONSTANTS.COLORS.ERROR;
      default:
        return APP_CONSTANTS.COLORS.TEXT_SECONDARY;
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'preparing':
        return 'Preparing';
      case 'out_for_delivery':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <TouchableOpacity 
      style={styles.orderCard}
      onPress={() => {
        // TODO: Navigate to order details
        showModal('Order Details', `Order #${item.id}\nTotal: ₹${item.total_amount}`, 'info');
      }}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>Order #{item.id}</Text>
          <Text style={styles.orderDate}>{formatDate(item.created_at)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      {/* Show verification code prominently when order is out for delivery */}
      {item.status === 'out_for_delivery' && item.verification_code && (
        <View style={styles.verificationAlert}>
          <Icon name="shield-checkmark" size={20} color="#4CAF50" />
          <View style={styles.verificationContent}>
            <Text style={styles.verificationTitle}>Delivery Verification Code</Text>
            <Text style={styles.verificationCode}>{item.verification_code}</Text>
            <Text style={styles.verificationHint}>
              Provide this code to receive your order
            </Text>
          </View>
        </View>
      )}

      <View style={styles.orderDetails}>
        <View style={styles.addressInfo}>
          <Icon name="location-outline" size={16} color={APP_CONSTANTS.COLORS.TEXT_SECONDARY} />
          <Text style={styles.addressText} numberOfLines={2}>
            {item.delivery_address.area}, {item.delivery_address.city} - {item.delivery_address.pincode}
          </Text>
        </View>
        
        <View style={styles.paymentInfo}>
          <Icon 
            name={item.payment_method === 'cod' ? 'cash-outline' : 'card-outline'} 
            size={16} 
            color={APP_CONSTANTS.COLORS.TEXT_SECONDARY} 
          />
          <Text style={styles.paymentText}>
            {item.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
          </Text>
        </View>
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.totalAmount}>₹{item.total_amount.toFixed(2)}</Text>
        <Icon name="chevron-forward" size={20} color={APP_CONSTANTS.COLORS.TEXT_SECONDARY} />
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="receipt-outline" size={80} color={APP_CONSTANTS.COLORS.TEXT_SECONDARY} />
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptySubtitle}>
            Your order history will appear here once you place your first order
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.ordersList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Modal Components */}
      <CustomModal
        visible={isModalVisible}
        title={modalProps.title}
        message={modalProps.message}
        type={modalProps.type}
        onClose={hideModal}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_CONSTANTS.COLORS.BACKGROUND,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: APP_CONSTANTS.SIZES.PADDING,
  },
  loadingText: {
    fontSize: 16,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: APP_CONSTANTS.SIZES.PADDING,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
    marginTop: 24,
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  ordersList: {
    padding: APP_CONSTANTS.SIZES.PADDING,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  orderDetails: {
    marginBottom: 12,
  },
  addressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
    marginLeft: 8,
    flex: 1,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentText: {
    fontSize: 14,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
    marginLeft: 8,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: APP_CONSTANTS.COLORS.PRIMARY,
  },
  verificationAlert: {
    backgroundColor: '#E8F5E8',
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  verificationContent: {
    marginLeft: 12,
    flex: 1,
  },
  verificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 4,
  },
  verificationCode: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B5E20',
    letterSpacing: 3,
    marginBottom: 2,
  },
  verificationHint: {
    fontSize: 12,
    color: '#388E3C',
    fontStyle: 'italic',
  },
});
