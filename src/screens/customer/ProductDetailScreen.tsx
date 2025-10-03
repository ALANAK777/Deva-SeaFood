import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

import { APP_CONSTANTS } from '../../utils/constants';
import { CustomerStackParamList } from '../../types/navigation';
import { Product as ProductType, productService } from '../../services/productService';
import { cartService } from '../../services/cartService';
import { useAppSelector } from '../../hooks/redux';
import { CustomModal, ToastModal, ConfirmModal } from '../../components/modals';
import { useModal } from '../../hooks/useModal';

type ProductDetailRouteProp = RouteProp<CustomerStackParamList, 'ProductDetail'>;

export const ProductDetailScreen: React.FC = () => {
  const route = useRoute<ProductDetailRouteProp>();
  const navigation = useNavigation();
  const { productId } = route.params;
  const { user } = useAppSelector((state) => state.auth);
  
  const { 
    showModal, 
    isModalVisible, 
    modalProps, 
    hideModal,
    showToast, 
    isToastVisible, 
    toastProps, 
    hideToast,
    showConfirm,
    isConfirmVisible,
    confirmProps,
    hideConfirm
  } = useModal();

  const [product, setProduct] = useState<ProductType | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    console.log('📱 ProductDetailScreen - Loading product:', productId);
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const fetchedProduct = await productService.getProduct(productId);
      
      if (fetchedProduct) {
        setProduct(fetchedProduct);
        console.log('✅ ProductDetailScreen - Product loaded:', fetchedProduct.name);
      } else {
        console.error('❌ ProductDetailScreen - Product not found:', productId);
        showModal('Error', 'Product not found', 'error');
        navigation.goBack();
      }
    } catch (error) {
      console.error('❌ ProductDetailScreen - Error loading product:', error);
      showModal('Error', 'Failed to load product details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.stock_quantity || 0)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!product || !user?.id) {
      showModal('Error', 'Please log in to add items to cart', 'error');
      return;
    }

    if (addingToCart) return; // Prevent multiple clicks

    try {
      setAddingToCart(true);
      console.log('🛒 ProductDetailScreen - Adding to cart:', {
        productId: product.id,
        quantity,
        price: product.price
      });

      await cartService.addToCart(user.id, {
        product_id: product.id,
        quantity: quantity
      });

      showConfirm(
        'Added to Cart',
        `${quantity}x ${product.name} has been added to your cart.`,
        () => {
          // Navigate to Cart if it exists in navigation
          // For now, just go back - can be updated when Cart screen is added
          navigation.goBack();
        },
        'info',
        'View Cart',
        'Continue Shopping'
      );
    } catch (error: any) {
      console.error('❌ ProductDetailScreen - Error adding to cart:', error);
      showModal('Error', 'Failed to add item to cart. Please try again.', 'error');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading product details...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Product not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Product Image */}
        <Image
          source={{ uri: product.image_url || 'https://via.placeholder.com/400x300/CCCCCC/FFFFFF?text=No+Image' }}
          style={styles.productImage}
          defaultSource={{ uri: 'https://via.placeholder.com/400x300/CCCCCC/FFFFFF?text=No+Image' }}
        />

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>${product.price}</Text>
          <Text style={styles.productDescription}>{product.description}</Text>
          
          <View style={styles.stockInfo}>
            <Icon 
              name={product.stock_quantity > 0 ? "checkmark-circle" : "close-circle"} 
              size={20} 
              color={product.stock_quantity > 0 ? APP_CONSTANTS.COLORS.SUCCESS : APP_CONSTANTS.COLORS.ERROR}
            />
            <Text style={[
              styles.stockText, 
              { color: product.stock_quantity > 0 ? APP_CONSTANTS.COLORS.SUCCESS : APP_CONSTANTS.COLORS.ERROR }
            ]}>
              {product.stock_quantity > 0 
                ? `${product.stock_quantity} ${product.unit} in stock` 
                : 'Out of stock'
              }
            </Text>
          </View>

          {/* Product Details */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Product Details</Text>
            <Text style={styles.detailedDescription}>{product.description}</Text>
            
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Category:</Text>
              <Text style={styles.specValue}>{product.category}</Text>
            </View>
            
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Unit:</Text>
              <Text style={styles.specValue}>{product.unit}</Text>
            </View>
            
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Available:</Text>
              <Text style={styles.specValue}>{product.is_available ? 'Yes' : 'No'}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      {product.stock_quantity > 0 && (
        <View style={styles.actionBar}>
          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>Quantity:</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                <Icon name="remove" size={20} color={quantity <= 1 ? '#CCC' : APP_CONSTANTS.COLORS.PRIMARY} />
              </TouchableOpacity>
              
              <Text style={styles.quantityText}>{quantity}</Text>
              
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(1)}
                disabled={quantity >= product.stock_quantity}
              >
                <Icon name="add" size={20} color={quantity >= product.stock_quantity ? '#CCC' : APP_CONSTANTS.COLORS.PRIMARY} />
              </TouchableOpacity>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.addToCartButton, { opacity: addingToCart ? 0.7 : 1 }]} 
            onPress={handleAddToCart}
            disabled={addingToCart}
          >
            <Icon name="cart" size={20} color="#FFFFFF" />
            <Text style={styles.addToCartText}>
              {addingToCart ? 'Adding...' : `Add to Cart - ₹${(product.price * quantity).toFixed(2)}`}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      <CustomModal
        visible={isModalVisible}
        onClose={hideModal}
        title={modalProps.title}
        message={modalProps.message}
        type={modalProps.type}
      />
      
      <ConfirmModal
        visible={isConfirmVisible}
        onClose={hideConfirm}
        onConfirm={confirmProps.onConfirm}
        title={confirmProps.title}
        message={confirmProps.message}
        type={confirmProps.type}
        confirmText={confirmProps.confirmText}
        cancelText={confirmProps.cancelText}
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  productImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#E0E0E0',
  },
  productInfo: {
    padding: APP_CONSTANTS.SIZES.PADDING,
    backgroundColor: '#FFFFFF',
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: APP_CONSTANTS.COLORS.PRIMARY,
    marginBottom: 12,
  },
  productDescription: {
    fontSize: 16,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
    lineHeight: 24,
    marginBottom: 16,
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  stockText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  detailsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
    marginBottom: 16,
  },
  detailedDescription: {
    fontSize: 14,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
    lineHeight: 22,
    marginBottom: 20,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  specLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
  },
  specValue: {
    fontSize: 14,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  actionBar: {
    backgroundColor: '#FFFFFF',
    padding: APP_CONSTANTS.SIZES.PADDING,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: APP_CONSTANTS.COLORS.PRIMARY,
    paddingVertical: 16,
    borderRadius: 8,
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  loadingText: {
    fontSize: 16,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
  },
  errorText: {
    fontSize: 16,
    color: APP_CONSTANTS.COLORS.ERROR,
  },
});
