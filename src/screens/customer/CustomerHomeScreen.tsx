import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';

import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { APP_CONSTANTS } from '../../utils/constants';
import { CustomerStackParamList } from '../../types/navigation';
import { CustomModal } from '../../components/modals';
import { useModal } from '../../hooks/useModal';

type NavigationProp = StackNavigationProp<CustomerStackParamList>;

interface FeaturedProduct {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  category: string;
  available_quantity: number;
}

export const CustomerHomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { showModal, isModalVisible, modalProps, hideModal } = useModal();

  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    console.log('🏠 CustomerHomeScreen - Component mounted for user:', user?.full_name);
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      console.log('🏠 CustomerHomeScreen - Loading featured products...');
      
      // Mock data for now - will be replaced with actual API call
      const mockProducts: FeaturedProduct[] = [
        {
          id: '1',
          name: 'Fresh Salmon',
          price: 25.99,
          category: 'Fish',
          available_quantity: 50,
          image_url: 'https://via.placeholder.com/150x150/4A90E2/FFFFFF?text=Salmon'
        },
        {
          id: '2', 
          name: 'King Prawns',
          price: 35.50,
          category: 'Seafood',
          available_quantity: 30,
          image_url: 'https://via.placeholder.com/150x150/7ED321/FFFFFF?text=Prawns'
        },
        {
          id: '3',
          name: 'Fresh Tuna',
          price: 28.75,
          category: 'Fish',
          available_quantity: 25,
          image_url: 'https://via.placeholder.com/150x150/F5A623/FFFFFF?text=Tuna'
        },
      ];

      setFeaturedProducts(mockProducts);
      console.log('✅ CustomerHomeScreen - Featured products loaded:', mockProducts.length);
    } catch (error) {
      console.error('❌ CustomerHomeScreen - Error loading products:', error);
      showModal('Error', 'Failed to load products. Please try again.', 'error');
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadFeaturedProducts().finally(() => setRefreshing(false));
  }, []);

  const handleProductPress = (productId: string) => {
    console.log('🏠 CustomerHomeScreen - Product pressed:', productId);
    navigation.navigate('ProductDetail', { productId });
  };

  const handleViewCatalog = () => {
    console.log('🏠 CustomerHomeScreen - View catalog pressed');
    navigation.navigate('CustomerTabs');
  };

  const renderProductCard = (product: FeaturedProduct) => (
    <TouchableOpacity
      key={product.id}
      style={styles.productCard}
      onPress={() => handleProductPress(product.id)}
    >
      <Image
        source={{ uri: product.image_url || 'https://via.placeholder.com/150x150/CCCCCC/FFFFFF?text=No+Image' }}
        style={styles.productImage}
        defaultSource={{ uri: 'https://via.placeholder.com/150x150/CCCCCC/FFFFFF?text=No+Image' }}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productCategory}>{product.category}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>${product.price}</Text>
          <Text style={styles.stockText}>
            {product.available_quantity} in stock
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.full_name || 'Customer'}!</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Icon name="notifications-outline" size={24} color={APP_CONSTANTS.COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleViewCatalog}>
          <Icon name="fish-outline" size={30} color={APP_CONSTANTS.COLORS.PRIMARY} />
          <Text style={styles.actionText}>Browse Fish</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="cart-outline" size={30} color={APP_CONSTANTS.COLORS.PRIMARY} />
          <Text style={styles.actionText}>My Cart</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="receipt-outline" size={30} color={APP_CONSTANTS.COLORS.PRIMARY} />
          <Text style={styles.actionText}>Orders</Text>
        </TouchableOpacity>
      </View>

      {/* Featured Products */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Products</Text>
          <TouchableOpacity onPress={handleViewCatalog}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productsList}>
          {featuredProducts.map(renderProductCard)}
        </ScrollView>
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shop by Category</Text>
        <View style={styles.categoriesGrid}>
          <TouchableOpacity style={styles.categoryCard}>
            <Icon name="fish" size={40} color={APP_CONSTANTS.COLORS.PRIMARY} />
            <Text style={styles.categoryName}>Fresh Fish</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.categoryCard}>
            <Icon name="water" size={40} color={APP_CONSTANTS.COLORS.PRIMARY} />
            <Text style={styles.categoryName}>Seafood</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.categoryCard}>
            <Icon name="snow" size={40} color={APP_CONSTANTS.COLORS.PRIMARY} />
            <Text style={styles.categoryName}>Frozen</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.categoryCard}>
            <Icon name="restaurant" size={40} color={APP_CONSTANTS.COLORS.PRIMARY} />
            <Text style={styles.categoryName}>Ready to Cook</Text>
          </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: APP_CONSTANTS.SIZES.PADDING,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
  },
  notificationButton: {
    padding: 8,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: APP_CONSTANTS.SIZES.PADDING,
    backgroundColor: '#FFFFFF',
    marginTop: 1,
  },
  actionButton: {
    alignItems: 'center',
    padding: 16,
  },
  actionText: {
    marginTop: 8,
    fontSize: 12,
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    padding: APP_CONSTANTS.SIZES.PADDING,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
  },
  viewAllText: {
    fontSize: 14,
    color: APP_CONSTANTS.COLORS.PRIMARY,
    fontWeight: '500',
  },
  productsList: {
    marginHorizontal: -APP_CONSTANTS.SIZES.PADDING,
    paddingHorizontal: APP_CONSTANTS.SIZES.PADDING,
  },
  productCard: {
    width: 150,
    marginRight: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  productImage: {
    width: '100%',
    height: 100,
    borderRadius: 6,
    backgroundColor: '#E0E0E0',
  },
  productInfo: {
    marginTop: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: APP_CONSTANTS.COLORS.PRIMARY,
  },
  stockText: {
    fontSize: 10,
    color: APP_CONSTANTS.COLORS.SUCCESS,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    aspectRatio: 1.2,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryName: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
    textAlign: 'center',
  },
});
