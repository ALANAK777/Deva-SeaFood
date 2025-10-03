import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';

import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { 
  fetchProducts, 
  setSearchQuery, 
  setSelectedCategory, 
  filterProducts,
  searchProducts 
} from '../../store/productSlice';
import { addToCart } from '../../store/cartSlice';
import { APP_CONSTANTS } from '../../utils/constants';
import { CustomerStackParamList } from '../../types/navigation';
import { Product } from '../../services/productService';
import { CustomModal, ToastModal } from '../../components/modals';
import { useModal } from '../../hooks/useModal';

type NavigationProp = StackNavigationProp<CustomerStackParamList>;

const categories = [
  { id: 'all', name: 'All Products', icon: 'grid-outline' },
  { id: 'Fresh Fish', name: 'Fresh Fish', icon: 'fish-outline' },
  { id: 'Prawns & Shrimp', name: 'Prawns & Shrimp', icon: 'water-outline' },
  { id: 'Crabs', name: 'Crabs', icon: 'nutrition-outline' },
  { id: 'Dried Fish', name: 'Dried Fish', icon: 'sunny-outline' },
  { id: 'Fish Curry Cut', name: 'Curry Cut', icon: 'restaurant-outline' },
];

export const ProductCatalogScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { 
    filteredProducts, 
    searchQuery, 
    selectedCategory, 
    isLoading, 
    error 
  } = useAppSelector((state) => state.products);
  
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
  
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    console.log('📱 ProductCatalogScreen - Component mounted');
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      console.log('📱 ProductCatalogScreen - Loading products...');
      const resultAction = await dispatch(fetchProducts());
      
      if (fetchProducts.fulfilled.match(resultAction)) {
        const products = resultAction.payload;
        console.log('📱 ProductCatalogScreen - Products loaded successfully:', {
          count: products.length,
          sample: products.slice(0, 2).map(p => ({
            name: p.name,
            stock_quantity: p.stock_quantity,
            is_available: p.is_available,
            price: p.price,
            category: p.category
          }))
        });
      } else {
        console.error('❌ ProductCatalogScreen - Failed to load products:', resultAction.error);
      }
    } catch (error) {
      console.error('❌ ProductCatalogScreen - Error loading products:', error);
      showModal('Error', 'Failed to load products. Please try again.', 'error');
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    dispatch(fetchProducts()).finally(() => setRefreshing(false));
  }, [dispatch]);

  const handleProductPress = (product: Product) => {
    console.log('📱 ProductCatalogScreen - Product pressed:', product.name);
    navigation.navigate('ProductDetail', { productId: product.id });
  };

  const handleCategoryPress = (categoryId: string) => {
    console.log('📱 ProductCatalogScreen - Category selected:', categoryId);
    dispatch(setSelectedCategory(categoryId));
    dispatch(filterProducts());
  };

  const handleSearchChange = (query: string) => {
    dispatch(setSearchQuery(query));
    if (query.trim()) {
      dispatch(searchProducts(query));
    } else {
      dispatch(filterProducts());
    }
  };

  const handleAddToCart = async (product: Product) => {
    console.log('🛒 ProductCatalogScreen - Add to cart attempt:', {
      productId: product.id,
      productName: product.name,
      stockQuantity: product.stock_quantity,
      isAvailable: product.is_available,
      userId: user?.id
    });

    if (!user?.id) {
      showModal('Error', 'Please log in to add items to cart', 'error');
      return;
    }

    if (product.stock_quantity === 0 || !product.is_available) {
      showModal('Error', 'This product is currently out of stock', 'warning');
      return;
    }

    try {
      console.log('🛒 ProductCatalogScreen - Adding to cart with default 1kg:', product.name);
      const result = await dispatch(addToCart({
        userId: user.id,
        cartData: {
          product_id: product.id,
          quantity: 1 // Start with default 1kg
        }
      })).unwrap();
      
      console.log('✅ ProductCatalogScreen - Add to cart successful:', result);
      showToast(`${product.name} (1kg) added to cart!`, 'success');
    } catch (error: any) {
      console.error('❌ ProductCatalogScreen - Add to cart failed:', error);
      showModal('Error', error.message || 'Failed to add item to cart', 'error');
    }
  };

  const renderCategoryCard = ({ item }: { item: typeof categories[0] }) => (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        selectedCategory === item.id && styles.selectedCategoryCard
      ]}
      onPress={() => handleCategoryPress(item.id)}
    >
      <Icon 
        name={item.icon} 
        size={24} 
        color={selectedCategory === item.id ? '#FFFFFF' : APP_CONSTANTS.COLORS.PRIMARY} 
      />
      <Text
        style={[
          styles.categoryCardText,
          selectedCategory === item.id && styles.selectedCategoryCardText
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleProductPress(item)}
    >
      <Image
        source={{ uri: item.image_url || 'https://via.placeholder.com/200x150/CCCCCC/FFFFFF?text=No+Image' }}
        style={styles.productImage}
        defaultSource={{ uri: 'https://via.placeholder.com/200x150/CCCCCC/FFFFFF?text=No+Image' }}
      />
      
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.productFooter}>
          <Text style={styles.productPrice}>₹{item.price}/kg</Text>
          <Text style={styles.stockText}>
            {item.stock_quantity > 0 
              ? `${item.stock_quantity} kg in stock` 
              : 'Out of stock'
            }
          </Text>
        </View>
        
        <TouchableOpacity 
          style={[
            styles.addToCartButton,
            (item.stock_quantity === 0 || !item.is_available) && styles.disabledButton
          ]}
          onPress={() => handleAddToCart(item)}
          disabled={item.stock_quantity === 0 || !item.is_available}
        >
          <Icon name="cart-outline" size={20} color="#FFFFFF" />
          <Text style={styles.addToCartText}>
            {(item.stock_quantity > 0 && item.is_available) ? 'Add to Cart' : 'Out of Stock'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (isLoading && filteredProducts.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Welcome Header */}
      <View style={styles.welcomeHeader}>
        <Text style={styles.welcomeText}>Welcome, {user?.full_name || 'Customer'}!</Text>
        <Text style={styles.welcomeSubtext}>What would you like to buy today?</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color={APP_CONSTANTS.COLORS.TEXT_SECONDARY} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={handleSearchChange}
          placeholderTextColor={APP_CONSTANTS.COLORS.TEXT_SECONDARY}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => handleSearchChange('')}>
            <Icon name="close-circle" size={20} color={APP_CONSTANTS.COLORS.TEXT_SECONDARY} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Category Cards */}
      <FlatList
        horizontal
        data={categories}
        renderItem={renderCategoryCard}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesList}
        contentContainerStyle={styles.categoriesContent}
      />

      {/* Products List */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.productsContent}
        columnWrapperStyle={styles.productsRow}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="fish-outline" size={64} color={APP_CONSTANTS.COLORS.TEXT_SECONDARY} />
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery 
                ? 'Try adjusting your search terms' 
                : 'Check back later for new arrivals'
              }
            </Text>
          </View>
        }
      />
      
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
  welcomeHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: APP_CONSTANTS.SIZES.PADDING,
    paddingVertical: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: APP_CONSTANTS.SIZES.PADDING,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
  },
  categoriesList: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    marginBottom: 8,
  },
  categoriesContent: {
    paddingHorizontal: APP_CONSTANTS.SIZES.PADDING,
  },
  categoryCard: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    minWidth: 100,
  },
  selectedCategoryCard: {
    backgroundColor: APP_CONSTANTS.COLORS.PRIMARY,
    borderColor: APP_CONSTANTS.COLORS.PRIMARY,
  },
  categoryCardText: {
    fontSize: 12,
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  selectedCategoryCardText: {
    color: '#FFFFFF',
  },
  productsContent: {
    padding: APP_CONSTANTS.SIZES.PADDING,
  },
  productsRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#E0E0E0',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 12,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
    marginBottom: 8,
    lineHeight: 16,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: APP_CONSTANTS.COLORS.PRIMARY,
  },
  stockText: {
    fontSize: 10,
    color: APP_CONSTANTS.COLORS.SUCCESS,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: APP_CONSTANTS.COLORS.PRIMARY,
    paddingVertical: 8,
    borderRadius: 6,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
});
