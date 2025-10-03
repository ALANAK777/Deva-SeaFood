import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product, productService } from '../services/productService';

interface ProductState {
  products: Product[];
  filteredProducts: Product[];
  selectedProduct: Product | null;
  searchQuery: string;
  selectedCategory: string;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  filteredProducts: [],
  selectedProduct: null,  
  searchQuery: '',
  selectedCategory: 'all',
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔄 Redux.fetchProducts - Starting products fetch');
      const products = await productService.getProducts();
      console.log('✅ Redux.fetchProducts - Products fetched successfully:', products.length);
      return products;
    } catch (error: any) {
      console.error('❌ Redux.fetchProducts - Fetch failed:', error.message);
      return rejectWithValue(error.message || 'Failed to fetch products');
    }
  }
);

export const fetchProductsByCategory = createAsyncThunk(
  'products/fetchProductsByCategory',
  async (category: string, { rejectWithValue }) => {
    try {
      console.log('🔄 Redux.fetchProductsByCategory - Starting fetch for category:', category);
      const products = await productService.getProductsByCategory(category);
      console.log('✅ Redux.fetchProductsByCategory - Products fetched successfully:', products.length);
      return { products, category };
    } catch (error: any) {
      console.error('❌ Redux.fetchProductsByCategory - Fetch failed:', error.message);
      return rejectWithValue(error.message || 'Failed to fetch products by category');
    }
  }
);

export const fetchProduct = createAsyncThunk(
  'products/fetchProduct',
  async (id: string, { rejectWithValue }) => {
    try {
      console.log('🔄 Redux.fetchProduct - Starting product fetch for ID:', id);
      const product = await productService.getProduct(id);
      if (!product) {
        throw new Error('Product not found');
      }
      console.log('✅ Redux.fetchProduct - Product fetched successfully:', product.name);
      return product;
    } catch (error: any) {
      console.error('❌ Redux.fetchProduct - Fetch failed:', error.message);
      return rejectWithValue(error.message || 'Failed to fetch product');
    }
  }
);

export const searchProducts = createAsyncThunk(
  'products/searchProducts',
  async (query: string, { rejectWithValue }) => {
    try {
      console.log('🔄 Redux.searchProducts - Starting search for query:', query);
      const products = await productService.searchProducts(query);
      console.log('✅ Redux.searchProducts - Search completed:', products.length, 'results');
      return { products, query };
    } catch (error: any) {
      console.error('❌ Redux.searchProducts - Search failed:', error.message);
      return rejectWithValue(error.message || 'Failed to search products');
    }
  }
);

// Product slice
const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
    },
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },
    filterProducts: (state) => {
      let filtered = state.products;

      // Filter by category
      if (state.selectedCategory !== 'all') {
        filtered = filtered.filter(product => product.category === state.selectedCategory);
      }

      // Filter by search query
      if (state.searchQuery.trim()) {
        const query = state.searchQuery.toLowerCase();
        filtered = filtered.filter(product =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
        );
      }

      state.filteredProducts = filtered;
      console.log('🔍 Redux.filterProducts - Filtered products:', filtered.length, 'of', state.products.length);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products cases
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload;
        state.filteredProducts = action.payload;
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.products = [];
        state.filteredProducts = [];
      })
      // Fetch products by category cases
      .addCase(fetchProductsByCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.products;
        state.filteredProducts = action.payload.products;
        state.selectedCategory = action.payload.category;
        state.error = null;
      })
      .addCase(fetchProductsByCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch single product cases
      .addCase(fetchProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedProduct = action.payload;
        state.error = null;
      })
      .addCase(fetchProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.selectedProduct = null;
      })
      // Search products cases
      .addCase(searchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.filteredProducts = action.payload.products;
        state.searchQuery = action.payload.query;
        state.error = null;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  setSearchQuery,
  setSelectedCategory,
  clearSelectedProduct,
  filterProducts,
} = productSlice.actions;

export default productSlice.reducer;
