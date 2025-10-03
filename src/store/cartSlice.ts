import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CartItem, AddToCartData, UpdateCartItemData, cartService } from '../services/cartService';

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchCartItems = createAsyncThunk(
  'cart/fetchCartItems',
  async (userId: string, { rejectWithValue }) => {
    try {
      console.log('🔄 Redux.fetchCartItems - Starting cart fetch for user:', userId);
      const cartItems = await cartService.getCartItems(userId);
      console.log('✅ Redux.fetchCartItems - Cart items fetched successfully:', cartItems.length);
      return cartItems;
    } catch (error: any) {
      console.error('❌ Redux.fetchCartItems - Fetch failed:', error.message);
      return rejectWithValue(error.message || 'Failed to fetch cart items');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ userId, cartData }: { userId: string; cartData: AddToCartData }, { rejectWithValue }) => {
    try {
      console.log('🔄 Redux.addToCart - Adding item to cart:', cartData.product_id);
      const cartItem = await cartService.addToCart(userId, cartData);
      console.log('✅ Redux.addToCart - Item added successfully:', cartItem.id);
      return cartItem;
    } catch (error: any) {
      console.error('❌ Redux.addToCart - Add failed:', error.message);
      return rejectWithValue(error.message || 'Failed to add item to cart');
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ cartItemId, updates }: { cartItemId: string; updates: UpdateCartItemData }, { rejectWithValue }) => {
    try {
      console.log('🔄 Redux.updateCartItem - Updating cart item:', cartItemId);
      const cartItem = await cartService.updateCartItem(cartItemId, updates);
      console.log('✅ Redux.updateCartItem - Item updated successfully:', cartItem.id);
      return cartItem;
    } catch (error: any) {
      console.error('❌ Redux.updateCartItem - Update failed:', error.message);
      return rejectWithValue(error.message || 'Failed to update cart item');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (cartItemId: string, { rejectWithValue }) => {
    try {
      console.log('🔄 Redux.removeFromCart - Removing cart item:', cartItemId);
      await cartService.removeFromCart(cartItemId);
      console.log('✅ Redux.removeFromCart - Item removed successfully:', cartItemId);
      return cartItemId;
    } catch (error: any) {
      console.error('❌ Redux.removeFromCart - Remove failed:', error.message);
      return rejectWithValue(error.message || 'Failed to remove item from cart');
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (userId: string, { rejectWithValue }) => {
    try {
      console.log('🔄 Redux.clearCart - Clearing cart for user:', userId);
      await cartService.clearCart(userId);
      console.log('✅ Redux.clearCart - Cart cleared successfully');
      return userId;
    } catch (error: any) {
      console.error('❌ Redux.clearCart - Clear failed:', error.message);
      return rejectWithValue(error.message || 'Failed to clear cart');
    }
  }
);

export const getCartSummary = createAsyncThunk(
  'cart/getCartSummary',
  async (userId: string, { rejectWithValue }) => {
    try {
      console.log('🔄 Redux.getCartSummary - Getting cart summary for user:', userId);
      const summary = await cartService.getCartSummary(userId);
      console.log('✅ Redux.getCartSummary - Summary calculated:', summary);
      return summary;
    } catch (error: any) {
      console.error('❌ Redux.getCartSummary - Summary failed:', error.message);
      return rejectWithValue(error.message || 'Failed to get cart summary');
    }
  }
);

// Helper function to calculate cart totals
const calculateCartTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + (price * item.quantity);
  }, 0);
  return { totalItems, totalPrice };
};

// Cart slice
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateCartTotals: (state) => {
      const totals = calculateCartTotals(state.items);
      state.totalItems = totals.totalItems;
      state.totalPrice = totals.totalPrice;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart items cases
      .addCase(fetchCartItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        const totals = calculateCartTotals(action.payload);
        state.totalItems = totals.totalItems;
        state.totalPrice = totals.totalPrice;
        state.error = null;
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.items = [];
        state.totalItems = 0;
        state.totalPrice = 0;
      })
      // Add to cart cases
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        // Check if item already exists, update it; otherwise add new item
        const existingIndex = state.items.findIndex(item => item.id === action.payload.id);
        if (existingIndex !== -1) {
          state.items[existingIndex] = action.payload;
        } else {
          state.items.push(action.payload);
        }
        const totals = calculateCartTotals(state.items);
        state.totalItems = totals.totalItems;
        state.totalPrice = totals.totalPrice;
        state.error = null;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update cart item cases
      .addCase(updateCartItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        const totals = calculateCartTotals(state.items);
        state.totalItems = totals.totalItems;
        state.totalPrice = totals.totalPrice;
        state.error = null;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Remove from cart cases
      .addCase(removeFromCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = state.items.filter(item => item.id !== action.payload);
        const totals = calculateCartTotals(state.items);
        state.totalItems = totals.totalItems;
        state.totalPrice = totals.totalPrice;
        state.error = null;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Clear cart cases
      .addCase(clearCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.isLoading = false;
        state.items = [];
        state.totalItems = 0;
        state.totalPrice = 0;
        state.error = null;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Get cart summary cases
      .addCase(getCartSummary.fulfilled, (state, action) => {
        state.totalItems = action.payload.totalItems;
        state.totalPrice = action.payload.totalPrice;
      });
  },
});

export const { clearError, updateCartTotals } = cartSlice.actions;

export default cartSlice.reducer;
