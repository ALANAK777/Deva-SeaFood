import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';

import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { fetchCartItems, updateCartItem, removeFromCart } from '../../store/cartSlice';
import { APP_CONSTANTS } from '../../utils/constants';
import { CustomerStackParamList } from '../../types/navigation';
import { CartItem } from '../../services/cartService';
import { CustomModal, ToastModal } from '../../components/modals';
import { useModal } from '../../hooks/useModal';

type NavigationProp = StackNavigationProp<CustomerStackParamList>;

// Weight increment options for fish products
const WEIGHT_INCREMENT_OPTIONS = [
  { label: '250g', value: 0.25, displayText: '250g' },
  { label: '500g', value: 0.5, displayText: '500g' },
  { label: '1kg', value: 1, displayText: '1kg' },
];

const MIN_WEIGHT = 0.25; // Minimum 250g
const DEFAULT_WEIGHT = 1; // Default 1kg

export const CartScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { items, totalPrice, totalItems, isLoading } = useAppSelector((state) => state.cart);

  const { 
    showModal, 
    isModalVisible, 
    modalProps, 
    hideModal,
    showToast, 
    isToastVisible, 
    toastProps, 
    hideToast 
  } = useModal();

  const [selectedItemForWeightUpdate, setSelectedItemForWeightUpdate] = useState<string | null>(null);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [selectedIncrement, setSelectedIncrement] = useState(0.25); // Default to 250g increment

  useEffect(() => {
    if (user?.id) {
      console.log('🛒 CartScreen - Loading cart for user:', user.id);
      dispatch(fetchCartItems(user.id));
    }
  }, [user?.id, dispatch]);

  // Convert quantity to weight (assuming quantity represents weight in kg)
  const formatWeight = (quantity: number): string => {
    if (quantity < 1) {
      return `${Math.round(quantity * 1000)}g`;
    }
    return `${quantity}kg`;
  };

  // Calculate price for weight
  const calculatePrice = (basePrice: number, weight: number): number => {
    return basePrice * weight;
  };

  // Enforce minimum weight
  const handleUpdateQuantity = async (cartItemId: string, newQuantity: number) => {
    // Enforce minimum weight
    if (newQuantity > 0 && newQuantity < MIN_WEIGHT) {
      showModal('Minimum Order', `Minimum order quantity is ${formatWeight(MIN_WEIGHT)}`, 'warning');
      return;
    }

    if (newQuantity === 0) {
      handleRemoveItem(cartItemId);
      return;
    }

    try {
      await dispatch(updateCartItem({
        cartItemId,
        updates: { quantity: newQuantity }
      })).unwrap();
    } catch (error: any) {
      showModal('Error', error.message || 'Failed to update quantity', 'error');
    }
  };

  const handleWeightSelection = (weight: number) => {
    if (selectedItemForWeightUpdate) {
      handleUpdateQuantity(selectedItemForWeightUpdate, weight);
    }
    setShowWeightModal(false);
    setSelectedItemForWeightUpdate(null);
  };

  const openIncrementSelector = () => {
    setShowWeightModal(true);
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      showModal('Error', 'Your cart is empty', 'warning');
      return;
    }
    if (!user?.id) {
      showModal('Error', 'Please log in to proceed with checkout', 'error');
      return;
    }
    navigation.navigate('Checkout');
  };

  const handleRemoveItem = async (cartItemId: string) => {
    try {
      await dispatch(removeFromCart(cartItemId)).unwrap();
      showToast('Item removed from cart', 'success');
    } catch (error: any) {
      showModal('Error', error.message || 'Failed to remove item', 'error');
    }
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <Image
        source={{ uri: item.product?.image_url || 'https://via.placeholder.com/80x80/CCCCCC/FFFFFF?text=No+Image' }}
        style={styles.productImage}
        defaultSource={{ uri: 'https://via.placeholder.com/80x80/CCCCCC/FFFFFF?text=No+Image' }}
      />
      
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.product?.name}</Text>
        <Text style={styles.productPrice}>₹{item.product?.price}/kg</Text>
        <Text style={styles.productTotal}>
          Total: ₹{calculatePrice(item.product?.price || 0, item.quantity).toFixed(2)}
        </Text>
      </View>

      <View style={styles.weightControls}>
        {/* Current Weight Display */}
        <View style={styles.currentWeight}>
          <Text style={styles.currentWeightLabel}>Current:</Text>
          <Text style={styles.currentWeightText}>{formatWeight(item.quantity)}</Text>
        </View>

        {/* Increment Selector */}
        <TouchableOpacity
          style={styles.incrementSelector}
          onPress={() => openIncrementSelector()}
        >
          <Text style={styles.incrementSelectorText}>+/- {formatWeight(selectedIncrement)}</Text>
          <Icon name="chevron-down" size={16} color={APP_CONSTANTS.COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>

        {/* Adjustment Controls */}
        <View style={styles.adjustmentControls}>
          <TouchableOpacity
            style={styles.adjustButton}
            onPress={() => handleUpdateQuantity(item.id, Math.max(MIN_WEIGHT, item.quantity - selectedIncrement))}
          >
            <Icon name="remove" size={16} color="#FFFFFF" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.adjustButton}
            onPress={() => handleUpdateQuantity(item.id, item.quantity + selectedIncrement)}
          >
            <Icon name="add" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveItem(item.id)}
      >
        <Icon name="trash-outline" size={20} color={APP_CONSTANTS.COLORS.ERROR} />
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.loadingText}>Loading cart...</Text>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Icon name="cart-outline" size={80} color={APP_CONSTANTS.COLORS.TEXT_SECONDARY} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>
            Add some delicious seafood to get started!
          </Text>
          <TouchableOpacity style={styles.shopButton}>
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.cartList}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.cartSummary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Items:</Text>
          <Text style={styles.summaryValue}>{totalItems}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total Amount:</Text>
          <Text style={styles.totalValue}>₹{totalPrice.toFixed(2)}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.checkoutButton}
          onPress={handleCheckout}
        >
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>

      {/* Weight Selector Modal */}
      <Modal
        visible={showWeightModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowWeightModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Increment</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowWeightModal(false)}
              >
                <Icon name="close" size={24} color={APP_CONSTANTS.COLORS.TEXT_PRIMARY} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.weightOptionsContainer}>
              {WEIGHT_INCREMENT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.weightOption,
                    selectedIncrement === option.value && styles.selectedIncrementOption
                  ]}
                  onPress={() => {
                    setSelectedIncrement(option.value);
                    setShowWeightModal(false);
                  }}
                >
                  <Text style={[
                    styles.weightOptionText,
                    selectedIncrement === option.value && styles.selectedIncrementText
                  ]}>
                    {option.displayText}
                  </Text>
                  <Text style={styles.weightOptionSubtext}>
                    Adjust by {option.displayText} steps
                  </Text>
                  {selectedIncrement === option.value && (
                    <Icon name="checkmark" size={20} color={APP_CONSTANTS.COLORS.PRIMARY} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      <CustomModal
        visible={isModalVisible}
        onClose={hideModal}
        title={modalProps.title}
        message={modalProps.message}
        type={modalProps.type}
      />
      
      <ToastModal
        visible={isToastVisible}
        message={toastProps.message}
        type={toastProps.type}
        duration={toastProps.duration}
        onHide={hideToast}
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
  },
  shopButton: {
    backgroundColor: APP_CONSTANTS.COLORS.PRIMARY,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartList: {
    padding: APP_CONSTANTS.SIZES.PADDING,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
  },
  productPrice: {
    fontSize: 14,
    color: APP_CONSTANTS.COLORS.PRIMARY,
    fontWeight: '600',
  },
  productUnit: {
    fontSize: 12,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
  },
  removeButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 30,
  },
  cartSummary: {
    backgroundColor: '#FFFFFF',
    padding: APP_CONSTANTS.SIZES.PADDING,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: APP_CONSTANTS.COLORS.PRIMARY,
  },
  checkoutButton: {
    backgroundColor: APP_CONSTANTS.COLORS.PRIMARY,
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // New weight-based styles
  productTotal: {
    fontSize: 14,
    color: APP_CONSTANTS.COLORS.PRIMARY,
    fontWeight: 'bold',
    marginTop: 4,
  },
  weightControls: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    paddingVertical: 8,
  },
  currentWeight: {
    alignItems: 'center',
    marginBottom: 8,
  },
  currentWeightLabel: {
    fontSize: 12,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
  },
  currentWeightText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
  },
  incrementSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: APP_CONSTANTS.COLORS.PRIMARY,
  },
  incrementSelectorText: {
    fontSize: 12,
    fontWeight: '600',
    color: APP_CONSTANTS.COLORS.PRIMARY,
    marginRight: 4,
  },
  adjustmentControls: {
    flexDirection: 'row',
    gap: 8,
  },
  adjustButton: {
    backgroundColor: APP_CONSTANTS.COLORS.PRIMARY,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: APP_CONSTANTS.SIZES.PADDING,
    borderBottomWidth: 1,
    borderBottomColor: APP_CONSTANTS.COLORS.BORDER,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weightOptionsContainer: {
    padding: APP_CONSTANTS.SIZES.PADDING,
  },
  weightOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: APP_CONSTANTS.SIZES.PADDING,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedIncrementOption: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    marginVertical: 2,
  },
  weightOptionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
    flex: 1,
  },
  selectedIncrementText: {
    color: APP_CONSTANTS.COLORS.PRIMARY,
  },
  weightOptionSubtext: {
    fontSize: 14,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
    flex: 2,
  },
});
