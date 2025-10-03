import { supabase } from './supabase';
import { Product } from './productService';

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  product?: Product; // Joined product data
}

export interface AddToCartData {
  product_id: string;
  quantity: number;
}

export interface UpdateCartItemData {
  quantity: number;
}

class CartService {
  // Get user's cart items
  async getCartItems(userId: string): Promise<CartItem[]> {
    try {
      console.log('🛒 CartService.getCartItems - Fetching cart for user:', userId);
      
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ CartService.getCartItems - Error:', error);
        throw new Error(error.message);
      }

      console.log('✅ CartService.getCartItems - Cart items fetched:', data?.length || 0);
      return data || [];
    } catch (error: any) {
      console.error('❌ CartService.getCartItems - Service error:', error);
      throw new Error(error.message || 'Failed to fetch cart items');
    }
  }

  // Add item to cart
  async addToCart(userId: string, cartData: AddToCartData): Promise<CartItem> {
    try {
      console.log('🛒 CartService.addToCart - Adding item to cart:', cartData.product_id);
      
      // Check if item already exists in cart
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', cartData.product_id)
        .single();

      if (existingItem) {
        // Update existing item quantity
        console.log('🛒 CartService.addToCart - Updating existing cart item');
        return await this.updateCartItem(
          existingItem.id, 
          { quantity: existingItem.quantity + cartData.quantity }
        );
      }

      // Add new item to cart
      const { data, error } = await supabase
        .from('cart_items')
        .insert({
          user_id: userId,
          product_id: cartData.product_id,
          quantity: cartData.quantity,
        })
        .select(`
          *,
          product:products(*)
        `)
        .single();

      if (error) {
        console.error('❌ CartService.addToCart - Error:', error);
        throw new Error(error.message);
      }

      console.log('✅ CartService.addToCart - Item added to cart:', data.id);
      return data;
    } catch (error: any) {
      console.error('❌ CartService.addToCart - Service error:', error);
      throw new Error(error.message || 'Failed to add item to cart');
    }
  }

  // Update cart item quantity
  async updateCartItem(cartItemId: string, updates: UpdateCartItemData): Promise<CartItem> {
    try {
      console.log('🛒 CartService.updateCartItem - Updating cart item:', cartItemId);
      
      const { data, error } = await supabase
        .from('cart_items')
        .update({ 
          ...updates, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', cartItemId)
        .select(`
          *,
          product:products(*)
        `)
        .single();

      if (error) {
        console.error('❌ CartService.updateCartItem - Error:', error);
        throw new Error(error.message);
      }

      console.log('✅ CartService.updateCartItem - Cart item updated:', data.id);
      return data;
    } catch (error: any) {
      console.error('❌ CartService.updateCartItem - Service error:', error);
      throw new Error(error.message || 'Failed to update cart item');
    }
  }

  // Remove item from cart
  async removeFromCart(cartItemId: string): Promise<void> {
    try {
      console.log('🛒 CartService.removeFromCart - Removing cart item:', cartItemId);
      
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);

      if (error) {
        console.error('❌ CartService.removeFromCart - Error:', error);
        throw new Error(error.message);
      }

      console.log('✅ CartService.removeFromCart - Cart item removed:', cartItemId);
    } catch (error: any) {
      console.error('❌ CartService.removeFromCart - Service error:', error);
      throw new Error(error.message || 'Failed to remove item from cart');
    }
  }

  // Clear entire cart
  async clearCart(userId: string): Promise<void> {
    try {
      console.log('🛒 CartService.clearCart - Clearing cart for user:', userId);
      
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('❌ CartService.clearCart - Error:', error);
        throw new Error(error.message);
      }

      console.log('✅ CartService.clearCart - Cart cleared for user:', userId);
    } catch (error: any) {
      console.error('❌ CartService.clearCart - Service error:', error);
      throw new Error(error.message || 'Failed to clear cart');
    }
  }

  // Get cart summary (total items and price)
  async getCartSummary(userId: string): Promise<{ totalItems: number; totalPrice: number }> {
    try {
      console.log('🛒 CartService.getCartSummary - Getting cart summary for user:', userId);
      
      const cartItems = await this.getCartItems(userId);
      
      const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = cartItems.reduce((sum, item) => {
        const price = item.product?.price || 0;
        return sum + (price * item.quantity);
      }, 0);

      console.log('✅ CartService.getCartSummary - Summary calculated:', { totalItems, totalPrice });
      return { totalItems, totalPrice };
    } catch (error: any) {
      console.error('❌ CartService.getCartSummary - Service error:', error);
      throw new Error(error.message || 'Failed to get cart summary');
    }
  }
}

export const cartService = new CartService();
