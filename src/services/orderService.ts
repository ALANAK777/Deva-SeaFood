import { supabase } from './supabase';

export interface Order {
  id: string;
  customer_id: string;
  order_number?: string; // Added for short display format (ORD-YYYYMMDD-XXX)
  total_amount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  payment_method: 'cod' | 'online';
  payment_status: 'pending' | 'paid' | 'failed';
  delivery_address: {
    street: string;
    area: string;
    city: string;
    pincode: string;
    landmark?: string;
  };
  delivery_phone: string;
  delivery_notes?: string;
  verification_code?: string;
  delivery_date?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity_kg: number; // Updated to match database schema
  price_per_kg: number; // Updated to match database schema  
  subtotal: number; // Updated to match database schema
  created_at: string;
  product?: {
    name: string;
    image_url?: string;
    unit: string;
  };
}

export interface CreateOrderData {
  customer_id: string;
  total_amount: number;
  payment_method: 'cod' | 'online';
  delivery_address: {
    street: string;
    area: string;
    city: string;
    pincode: string;
    landmark?: string;
  };
  delivery_phone: string;
  delivery_notes?: string;
  items: {
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }[];
}

class OrderService {
  // Create new order
  async createOrder(orderData: CreateOrderData): Promise<Order> {
    try {
      console.log('📦 OrderService.createOrder - Creating new order...');
      
      // Generate verification code
      const verification_code = Math.floor(1000 + Math.random() * 9000).toString();
      
      // Start transaction by creating the order first
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_id: orderData.customer_id,
          total_amount: orderData.total_amount,
          payment_method: orderData.payment_method,
          delivery_address: orderData.delivery_address,
          delivery_phone: orderData.delivery_phone,
          delivery_notes: orderData.delivery_notes,
          verification_code,
          status: 'pending',
          payment_status: 'pending'
        }])
        .select()
        .single();

      if (orderError) {
        console.error('❌ OrderService.createOrder - Order creation failed:', orderError);
        throw new Error(orderError.message);
      }

      console.log('✅ OrderService.createOrder - Order created:', order.id);

      // Create order items
      const orderItemsData = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity_kg: item.quantity,
        price_per_kg: item.unit_price,
        subtotal: item.total_price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsData);

      if (itemsError) {
        console.error('❌ OrderService.createOrder - Order items creation failed:', itemsError);
        // Rollback: delete the order if items creation failed
        await supabase.from('orders').delete().eq('id', order.id);
        throw new Error('Failed to create order items');
      }

      console.log('✅ OrderService.createOrder - Order items created successfully');
      return order;
      
    } catch (error: any) {
      console.error('❌ OrderService.createOrder - Service error:', error);
      throw new Error(error.message || 'Failed to create order');
    }
  }

  // Get user's orders
  async getUserOrders(userId: string): Promise<Order[]> {
    try {
      console.log('📦 OrderService.getUserOrders - Fetching orders for user:', userId);
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ OrderService.getUserOrders - Error:', error);
        throw new Error(error.message);
      }

      console.log('✅ OrderService.getUserOrders - Orders fetched:', data?.length || 0);
      return data || [];
    } catch (error: any) {
      console.error('❌ OrderService.getUserOrders - Service error:', error);
      throw new Error(error.message || 'Failed to fetch orders');
    }
  }

  // Get order details with items
  async getOrderDetails(orderId: string): Promise<Order & { items: OrderItem[] }> {
    try {
      console.log('📦 OrderService.getOrderDetails - Fetching order details:', orderId);
      
      // Get order details
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError) {
        console.error('❌ OrderService.getOrderDetails - Order fetch error:', orderError);
        throw new Error(orderError.message);
      }

      // Get order items with product details
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          product:products(name, image_url, unit)
        `)
        .eq('order_id', orderId);

      if (itemsError) {
        console.error('❌ OrderService.getOrderDetails - Items fetch error:', itemsError);
        throw new Error(itemsError.message);
      }

      console.log('✅ OrderService.getOrderDetails - Order details fetched');
      return { ...order, items: items || [] };
      
    } catch (error: any) {
      console.error('❌ OrderService.getOrderDetails - Service error:', error);
      throw new Error(error.message || 'Failed to fetch order details');
    }
  }

  // Update order status (with optional verification code for admin)
  async updateOrderStatus(orderId: string, status: Order['status'], verificationCode?: string): Promise<Order> {
    try {
      console.log('📦 OrderService.updateOrderStatus - Updating order status:', orderId, status);
      
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (verificationCode) {
        updateData.verification_code = verificationCode;
      }
      
      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        console.error('❌ OrderService.updateOrderStatus - Error:', error);
        throw new Error(error.message);
      }

      console.log('✅ OrderService.updateOrderStatus - Status updated successfully');
      return data;
      
    } catch (error: any) {
      console.error('❌ OrderService.updateOrderStatus - Service error:', error);
      throw new Error(error.message || 'Failed to update order status');
    }
  }

  // Cancel order
  async cancelOrder(orderId: string): Promise<Order> {
    try {
      console.log('📦 OrderService.cancelOrder - Cancelling order:', orderId);
      
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('status', 'pending') // Only allow cancelling pending orders
        .select()
        .single();

      if (error) {
        console.error('❌ OrderService.cancelOrder - Error:', error);
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('Order cannot be cancelled or not found');
      }

      console.log('✅ OrderService.cancelOrder - Order cancelled successfully');
      return data;
      
    } catch (error: any) {
      console.error('❌ OrderService.cancelOrder - Service error:', error);
      throw new Error(error.message || 'Failed to cancel order');
    }
  }

  // Admin methods
  
  // Get all orders for admin
  async getAllOrders(): Promise<Order[]> {
    try {
      console.log('👨‍💼 OrderService.getAllOrders - Fetching all orders for admin...');
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles:customer_id (
            full_name,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ OrderService.getAllOrders - Error:', error);
        throw new Error(error.message);
      }

      console.log('✅ OrderService.getAllOrders - Orders fetched:', data?.length || 0);
      return data || [];
    } catch (error: any) {
      console.error('❌ OrderService.getAllOrders - Service error:', error);
      throw new Error(error.message || 'Failed to fetch orders');
    }
  }

  // Get orders by status (Admin only)
  async getOrdersByStatus(status: string): Promise<Order[]> {
    try {
      console.log('👨‍💼 OrderService.getOrdersByStatus - Fetching orders with status:', status);
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles:customer_id (
            full_name,
            email,
            phone
          )
        `)
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ OrderService.getOrdersByStatus - Error:', error);
        throw new Error(error.message);
      }

      console.log('✅ OrderService.getOrdersByStatus - Orders fetched:', data?.length || 0);
      return data || [];
    } catch (error: any) {
      console.error('❌ OrderService.getOrdersByStatus - Service error:', error);
      throw new Error(error.message || 'Failed to fetch orders by status');
    }
  }
}

export const orderService = new OrderService();
export default orderService;
