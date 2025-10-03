import { createClient } from '@supabase/supabase-js';
import { API_ENDPOINTS } from '../utils/constants';

// Create Supabase client
export const supabase = createClient(
  API_ENDPOINTS.SUPABASE_URL,
  API_ENDPOINTS.SUPABASE_ANON_KEY
);

// Database type definitions
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string | null;
          role: 'customer' | 'admin';
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          phone?: string | null;
          role?: 'customer' | 'admin';
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          phone?: string | null;
          role?: 'customer' | 'admin';
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price_per_kg: number;
          stock_kg: number;
          image_url: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price_per_kg: number;
          stock_kg?: number;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          price_per_kg?: number;
          stock_kg?: number;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          quantity_kg: number;
          added_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          quantity_kg: number;
          added_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          quantity_kg?: number;
          added_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          total_amount: number;
          payment_method: 'cod' | 'online';
          payment_status: string;
          delivery_address: string;
          verification_code: string;
          status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          total_amount: number;
          payment_method: 'cod' | 'online';
          payment_status?: string;
          delivery_address: string;
          verification_code: string;
          status?: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          total_amount?: number;
          payment_method?: 'cod' | 'online';
          payment_status?: string;
          delivery_address?: string;
          verification_code?: string;
          status?: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
          created_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          product_name: string;
          quantity_kg: number;
          price_per_kg: number;
          subtotal: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          product_name: string;
          quantity_kg: number;
          price_per_kg: number;
          subtotal: number;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          product_name?: string;
          quantity_kg?: number;
          price_per_kg?: number;
          subtotal?: number;
        };
      };
      daily_stats: {
        Row: {
          id: string;
          date: string;
          total_orders: number;
          total_revenue: number;
          pending_orders: number;
          delivered_orders: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          total_orders?: number;
          total_revenue?: number;
          pending_orders?: number;
          delivered_orders?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          total_orders?: number;
          total_revenue?: number;
          pending_orders?: number;
          delivered_orders?: number;
          created_at?: string;
        };
      };
    };
  };
}
