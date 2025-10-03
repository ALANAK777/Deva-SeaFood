import { supabase } from './supabase';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Fresh Fish' | 'Prawns & Shrimp' | 'Crabs' | 'Dried Fish' | 'Fish Curry Cut';
  image_url?: string;
  stock_quantity: number;
  unit: 'kg' | 'piece' | 'gram';
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  category: 'Fresh Fish' | 'Prawns & Shrimp' | 'Crabs' | 'Dried Fish' | 'Fish Curry Cut';
  image_url?: string;
  stock_quantity: number;
  unit: 'kg' | 'piece' | 'gram';
  is_available?: boolean;
}

class ProductService {
  // Get all products
  async getProducts(): Promise<Product[]> {
    try {
      console.log('🐟 ProductService.getProducts - Fetching all products...');
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ ProductService.getProducts - Error:', error);
        throw new Error(error.message);
      }

      console.log('✅ ProductService.getProducts - Products fetched:', data?.length || 0);
      return data || [];
    } catch (error: any) {
      console.error('❌ ProductService.getProducts - Service error:', error);
      throw new Error(error.message || 'Failed to fetch products');
    }
  }

  // Get products by category
  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      console.log('🐟 ProductService.getProductsByCategory - Fetching products for category:', category);
      
      if (category === 'all') {
        return await this.getProducts();
      }

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ ProductService.getProductsByCategory - Error:', error);
        throw new Error(error.message);
      }

      console.log('✅ ProductService.getProductsByCategory - Products fetched:', data?.length || 0);
      return data || [];
    } catch (error: any) {
      console.error('❌ ProductService.getProductsByCategory - Service error:', error);
      throw new Error(error.message || 'Failed to fetch products by category');
    }
  }

  // Get single product
  async getProduct(id: string): Promise<Product | null> {
    try {
      console.log('🐟 ProductService.getProduct - Fetching product:', id);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('🐟 ProductService.getProduct - Product not found:', id);
          return null;
        }
        console.error('❌ ProductService.getProduct - Error:', error);
        throw new Error(error.message);
      }

      console.log('✅ ProductService.getProduct - Product fetched:', data?.name);
      return data;
    } catch (error: any) {
      console.error('❌ ProductService.getProduct - Service error:', error);
      throw new Error(error.message || 'Failed to fetch product');
    }
  }

  // Search products
  async searchProducts(query: string): Promise<Product[]> {
    try {
      console.log('🔍 ProductService.searchProducts - Searching for:', query);
      
      if (!query.trim()) {
        return await this.getProducts();
      }

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ ProductService.searchProducts - Error:', error);
        throw new Error(error.message);
      }

      console.log('✅ ProductService.searchProducts - Results found:', data?.length || 0);
      return data || [];
    } catch (error: any) {
      console.error('❌ ProductService.searchProducts - Service error:', error);
      throw new Error(error.message || 'Failed to search products');
    }
  }

  // Create product (Admin only)
  async createProduct(productData: CreateProductData): Promise<Product> {
    try {
      console.log('🐟 ProductService.createProduct - Creating product:', productData.name);
      
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (error) {
        console.error('❌ ProductService.createProduct - Error:', error);
        throw new Error(error.message);
      }

      console.log('✅ ProductService.createProduct - Product created:', data.id);
      return data;
    } catch (error: any) {
      console.error('❌ ProductService.createProduct - Service error:', error);
      throw new Error(error.message || 'Failed to create product');
    }
  }

  // Update product (Admin only)
  async updateProduct(id: string, updates: Partial<CreateProductData>): Promise<Product> {
    try {
      console.log('🐟 ProductService.updateProduct - Updating product:', id);
      
      const { data, error } = await supabase
        .from('products')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ ProductService.updateProduct - Error:', error);
        throw new Error(error.message);
      }

      console.log('✅ ProductService.updateProduct - Product updated:', data.id);
      return data;
    } catch (error: any) {
      console.error('❌ ProductService.updateProduct - Service error:', error);
      throw new Error(error.message || 'Failed to update product');
    }
  }

  // Delete product (Admin only)
  async deleteProduct(id: string): Promise<void> {
    try {
      console.log('🐟 ProductService.deleteProduct - Deleting product:', id);
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ ProductService.deleteProduct - Error:', error);
        throw new Error(error.message);
      }

      console.log('✅ ProductService.deleteProduct - Product deleted:', id);
    } catch (error: any) {
      console.error('❌ ProductService.deleteProduct - Service error:', error);
      throw new Error(error.message || 'Failed to delete product');
    }
  }
}

export const productService = new ProductService();
