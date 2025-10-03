import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  TextInput,
} from 'react-native';
import { APP_CONSTANTS } from '../../utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../../services/productService';
import { productService } from '../../services/productService';

interface ProductManagementScreenProps {
  navigation: any;
  route?: {
    params?: {
      filter?: string;
    };
  };
}

export const ProductManagementScreen: React.FC<ProductManagementScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    'all',
    'Fresh Fish',
    'Prawns & Shrimp',
    'Crabs',
    'Dried Fish',
    'Fish Curry Cut',
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    // Handle initial filter from route params
    if (route?.params?.filter === 'low_stock') {
      // You could set a visual indicator here if needed
      // For now, the filterProducts function will handle it
    }
  }, [route?.params?.filter]);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, selectedCategory, route?.params?.filter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts();
      setProducts(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  const filterProducts = () => {
    let filtered = products;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Apply route filter (like low stock)
    if (route?.params?.filter === 'low_stock') {
      filtered = filtered.filter(product => product.stock_quantity < 10);
    }

    setFilteredProducts(filtered);
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${productName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await productService.deleteProduct(productId);
              Alert.alert('Success', 'Product deleted successfully');
              fetchProducts();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete product');
            }
          },
        },
      ]
    );
  };

  const toggleProductAvailability = async (product: Product) => {
    try {
      await productService.updateProduct(product.id, {
        is_available: !product.is_available
      });
      fetchProducts();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update product');
    }
  };

  const getStockStatusColor = (quantity: number) => {
    if (quantity === 0) return '#F44336';
    if (quantity < 10) return '#FF9800';
    return '#4CAF50';
  };

  const getStockStatusText = (quantity: number) => {
    if (quantity === 0) return 'Out of Stock';
    if (quantity < 10) return 'Low Stock';
    return 'In Stock';
  };

  const renderCategoryFilter = () => (
    <View style={styles.categoryContainer}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === item && styles.selectedCategoryButton,
            ]}
            onPress={() => setSelectedCategory(item)}
          >
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === item && styles.selectedCategoryButtonText,
              ]}
            >
              {item === 'all' ? 'All Categories' : item}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <View style={styles.productHeader}>
        <Image
          source={{
            uri: item.image_url || 'https://via.placeholder.com/100x100?text=Fish',
          }}
          style={styles.productImage}
        />
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productCategory}>{item.category}</Text>
          <Text style={styles.productPrice}>₹{item.price}/{item.unit}</Text>
          <View style={styles.stockInfo}>
            <View
              style={[
                styles.stockBadge,
                { backgroundColor: getStockStatusColor(item.stock_quantity) },
              ]}
            >
              <Text style={styles.stockBadgeText}>
                {getStockStatusText(item.stock_quantity)}
              </Text>
            </View>
            <Text style={styles.stockQuantity}>
              {item.stock_quantity} {item.unit}s available
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.productActions}>
        <TouchableOpacity
          style={[
            styles.availabilityToggle,
            { backgroundColor: item.is_available ? '#4CAF50' : '#F44336' },
          ]}
          onPress={() => toggleProductAvailability(item)}
        >
          <Ionicons
            name={item.is_available ? 'checkmark' : 'close'}
            size={16}
            color="#FFFFFF"
          />
          <Text style={styles.availabilityText}>
            {item.is_available ? 'Available' : 'Unavailable'}
          </Text>
        </TouchableOpacity>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => navigation.navigate('EditProduct', { product: item })}
          >
            <Ionicons name="pencil" size={16} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteProduct(item.id, item.name)}
          >
            <Ionicons name="trash" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="fish-outline" size={64} color={APP_CONSTANTS.COLORS.TEXT_SECONDARY} />
      <Text style={styles.emptyStateTitle}>No Products Found</Text>
      <Text style={styles.emptyStateText}>
        {searchQuery || selectedCategory !== 'all'
          ? 'Try adjusting your filters'
          : 'Start by adding your first product'}
      </Text>
      {!searchQuery && selectedCategory === 'all' && (
        <TouchableOpacity
          style={styles.addFirstProductButton}
          onPress={() => navigation.navigate('AddProduct')}
        >
          <Text style={styles.addFirstProductButtonText}>Add Product</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
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
            placeholder="Search products..."
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
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddProduct')}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {renderCategoryFilter()}

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={filteredProducts.length === 0 ? styles.emptyContainer : styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_CONSTANTS.COLORS.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: APP_CONSTANTS.SIZES.PADDING,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: APP_CONSTANTS.COLORS.BORDER,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: APP_CONSTANTS.COLORS.BACKGROUND,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 12,
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
  addButton: {
    backgroundColor: APP_CONSTANTS.COLORS.PRIMARY,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: APP_CONSTANTS.COLORS.BORDER,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: APP_CONSTANTS.COLORS.BACKGROUND,
  },
  selectedCategoryButton: {
    backgroundColor: APP_CONSTANTS.COLORS.PRIMARY,
  },
  categoryButtonText: {
    fontSize: 14,
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
  },
  selectedCategoryButtonText: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: APP_CONSTANTS.SIZES.PADDING,
  },
  emptyContainer: {
    flex: 1,
  },
  productCard: {
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
  productHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 14,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: APP_CONSTANTS.COLORS.PRIMARY,
    marginBottom: 8,
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  stockBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  stockQuantity: {
    fontSize: 12,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
  },
  productActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  availabilityToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  availabilityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#F44336',
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
    marginBottom: 24,
  },
  addFirstProductButton: {
    backgroundColor: APP_CONSTANTS.COLORS.PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstProductButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
