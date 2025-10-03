import { supabase } from './supabase';

// Helper function to verify admin access
async function verifyAdminAccess(): Promise<void> {
  try {
    console.log('🔐 AdminService.verifyAdminAccess - Starting admin verification...');
    
    // Check if we have a session first
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ AdminService.verifyAdminAccess - Session error:', sessionError);
      throw new Error('Session verification failed');
    }
    
    if (!session) {
      console.error('❌ AdminService.verifyAdminAccess - No session found');
      throw new Error('Not authenticated - no session');
    }
    
    console.log('✅ AdminService.verifyAdminAccess - Session found, checking user...');
    const { data: user, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ AdminService.verifyAdminAccess - User fetch error:', userError);
      throw new Error('Failed to get user information');
    }
    
    if (!user.user) {
      console.error('❌ AdminService.verifyAdminAccess - No user data');
      throw new Error('Not authenticated');
    }

    console.log('✅ AdminService.verifyAdminAccess - User verified, checking admin status...', {
      userId: user.user.id,
      email: user.user.email
    });

    // Use the database function to check admin role (no parameters needed)
    const { data: isAdmin, error } = await supabase
      .rpc('is_admin_user');

    if (error) {
      console.error('❌ AdminService.verifyAdminAccess - Error checking admin status:', error);
      throw new Error('Unable to verify admin access');
    }

    if (!isAdmin) {
      console.error('❌ AdminService.verifyAdminAccess - User is not admin');
      throw new Error('Access denied. Admin privileges required.');
    }
    
    console.log('✅ AdminService.verifyAdminAccess - Admin access verified successfully');
  } catch (error) {
    console.error('❌ AdminService.verifyAdminAccess - Admin verification failed:', error);
    throw error;
  }
}

export interface AdminStats {
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStockItems: number;
  revenueToday: number;
}

export interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: 'customer';
  created_at: string;
  total_orders?: number;
  total_spent?: number;
  last_order_date?: string;
}

export interface RecentActivity {
  id: string;
  type: 'order_delivered' | 'product_added' | 'customer_registered' | 'order_placed';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  color: string;
}

class AdminService {
  // Check if current user is admin (utility function for debugging)
  async checkAdminStatus(): Promise<{ isAdmin: boolean; user: any; profile: any }> {
    try {
      console.log('🔍 AdminService.checkAdminStatus - Starting admin status check...');
      
      // Check session first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ AdminService.checkAdminStatus - Session error:', sessionError);
        return { isAdmin: false, user: null, profile: null };
      }
      
      if (!session) {
        console.log('❌ AdminService.checkAdminStatus - No session found');
        return { isAdmin: false, user: null, profile: null };
      }
      
      console.log('✅ AdminService.checkAdminStatus - Session found, getting user...');
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('❌ AdminService.checkAdminStatus - Auth error:', userError);
        return { isAdmin: false, user: null, profile: null };
      }

      if (!user) {
        console.log('❌ AdminService.checkAdminStatus - No authenticated user');
        return { isAdmin: false, user: null, profile: null };
      }

      console.log('✅ AdminService.checkAdminStatus - User found, fetching profile...', {
        userId: user.id,
        email: user.email
      });

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('❌ AdminService.checkAdminStatus - Profile error:', profileError);
        return { isAdmin: false, user, profile: null };
      }

      const isAdmin = profile?.role === 'admin';
      console.log('✅ AdminService.checkAdminStatus - Status check completed:', {
        userId: user.id,
        email: user.email,
        profileRole: profile?.role,
        isAdmin
      });

      return { isAdmin, user, profile };
    } catch (error: any) {
      console.error('❌ AdminService.checkAdminStatus - Error:', error);
      return { isAdmin: false, user: null, profile: null };
    }
  }

  // Get admin dashboard statistics
  async getAdminStats(): Promise<AdminStats> {
    try {
      console.log('📊 AdminService.getAdminStats - Fetching admin statistics...');
      
      // Verify admin access first
      await verifyAdminAccess();
      
      // Get total orders
      const { count: totalOrders, error: ordersError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      if (ordersError) {
        console.error('❌ AdminService.getAdminStats - Orders count error:', ordersError);
      }

      // Get total products
      const { count: totalProducts, error: productsError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      if (productsError) {
        console.error('❌ AdminService.getAdminStats - Products count error:', productsError);
      }

      // Get total customers
      const { count: totalCustomers, error: customersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'customer');

      if (customersError) {
        console.error('❌ AdminService.getAdminStats - Customers count error:', customersError);
      }

      // Get pending orders
      const { count: pendingOrders, error: pendingError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (pendingError) {
        console.error('❌ AdminService.getAdminStats - Pending orders error:', pendingError);
      }

      // Get low stock items
      const { count: lowStockItems, error: stockError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .lt('stock_quantity', 10);

      if (stockError) {
        console.error('❌ AdminService.getAdminStats - Low stock error:', stockError);
      }

      // Get total revenue (from delivered orders - represents actual completed transactions)
      console.log('💰 AdminService.getAdminStats - Calculating total revenue...');
      const { data: revenueData, error: revenueError } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('status', 'delivered'); // Count delivered orders regardless of payment status

      if (revenueError) {
        console.error('❌ AdminService.getAdminStats - Revenue error:', revenueError);
      } else {
        console.log('💰 AdminService.getAdminStats - Revenue data:', revenueData?.length, 'delivered orders');
      }

      const totalRevenue = revenueData?.reduce((sum, order) => {
        const amount = parseFloat(order.total_amount) || 0;
        return sum + amount;
      }, 0) || 0;
      
      console.log('💰 AdminService.getAdminStats - Total revenue calculated:', totalRevenue);

      // Get today's revenue (from today's delivered orders)
      const today = new Date().toISOString().split('T')[0];
      console.log('📅 AdminService.getAdminStats - Calculating today\'s revenue for date:', today);
      
      const { data: todayRevenueData, error: todayRevenueError } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('status', 'delivered') // Count delivered orders for today
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today}T23:59:59.999Z`);

      if (todayRevenueError) {
        console.error('❌ AdminService.getAdminStats - Today revenue error:', todayRevenueError);
      } else {
        console.log('📅 AdminService.getAdminStats - Today\'s revenue data:', todayRevenueData?.length, 'delivered orders today');
      }

      const revenueToday = todayRevenueData?.reduce((sum, order) => {
        const amount = parseFloat(order.total_amount) || 0;
        return sum + amount;
      }, 0) || 0;
      
      console.log('📅 AdminService.getAdminStats - Today\'s revenue calculated:', revenueToday);

      const stats: AdminStats = {
        totalOrders: totalOrders || 0,
        totalProducts: totalProducts || 0,
        totalCustomers: totalCustomers || 0,
        totalRevenue: Math.round(totalRevenue * 100) / 100, // Round to 2 decimal places
        pendingOrders: pendingOrders || 0,
        lowStockItems: lowStockItems || 0,
        revenueToday: Math.round(revenueToday * 100) / 100, // Round to 2 decimal places
      };

      console.log('✅ AdminService.getAdminStats - Final stats:', stats);
      console.log('📊 Revenue breakdown:', {
        'Total delivered orders': revenueData?.length || 0,
        'Today delivered orders': todayRevenueData?.length || 0,
        'Total revenue': totalRevenue,
        'Today revenue': revenueToday,
        'Sample order amounts': revenueData?.slice(0, 3)?.map(o => o.total_amount) || []
      });

      return stats;
    } catch (error: any) {
      console.error('❌ AdminService.getAdminStats - Error:', error);
      throw new Error(error.message || 'Failed to fetch admin statistics');
    }
  }

  // Get all customers with order statistics
  async getCustomers(): Promise<Customer[]> {
    try {
      console.log('👥 AdminService.getCustomers - Fetching customers...');
      
      // Get customers from profiles table
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'customer')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('❌ AdminService.getCustomers - Profiles error:', profilesError);
        console.error('❌ Error details:', {
          code: profilesError.code,
          message: profilesError.message,
          details: profilesError.details,
          hint: profilesError.hint
        });
        throw new Error(`Failed to fetch customer profiles: ${profilesError.message}`);
      }

      console.log(`📊 AdminService.getCustomers - Found ${profiles?.length || 0} customer profiles`);

      if (!profiles || profiles.length === 0) {
        console.log('✅ AdminService.getCustomers - No customers found');
        return [];
      }

      // Get all order statistics in a single query for better performance
      console.log('💰 AdminService.getCustomers - Fetching order statistics...');
      const { data: orderStats, error: orderStatsError } = await supabase
        .from('orders')
        .select('customer_id, total_amount, status, payment_status, created_at')
        .in('customer_id', profiles.map(p => p.id));

      if (orderStatsError) {
        console.error('❌ AdminService.getCustomers - Order stats error:', orderStatsError);
        console.error('❌ Order stats error details:', {
          code: orderStatsError.code,
          message: orderStatsError.message,
          details: orderStatsError.details,
          hint: orderStatsError.hint
        });
        // Continue without order stats rather than failing completely
      }

      console.log(`📊 AdminService.getCustomers - Found ${orderStats?.length || 0} order records`);

      // Process order statistics by customer
      const customerStats = new Map<string, { orderCount: number; totalSpent: number; lastOrderDate?: string }>();
      
      orderStats?.forEach(order => {
        const existing = customerStats.get(order.customer_id) || { orderCount: 0, totalSpent: 0 };
        existing.orderCount += 1;
        
        // Count delivered orders for revenue (same logic as dashboard)
        // This includes COD orders that are delivered but payment_status might still be pending
        if (order.status === 'delivered') {
          const amount = parseFloat(order.total_amount) || 0;
          existing.totalSpent += amount;
        }
        
        // Update last order date
        if (!existing.lastOrderDate || order.created_at > existing.lastOrderDate) {
          existing.lastOrderDate = order.created_at;
        }
        
        customerStats.set(order.customer_id, existing);
      });

      console.log('💰 AdminService.getCustomers - Customer stats processed:', {
        totalCustomers: profiles.length,
        customersWithOrders: customerStats.size,
        sampleStats: Array.from(customerStats.entries()).slice(0, 3)
      });

      // Build customers with stats
      const customersWithStats: Customer[] = profiles.map(profile => {
        const stats = customerStats.get(profile.id) || { orderCount: 0, totalSpent: 0 };
        
        return {
          id: profile.id,
          full_name: profile.full_name,
          email: profile.email,
          phone: profile.phone,
          role: 'customer',
          created_at: profile.created_at,
          total_orders: stats.orderCount,
          total_spent: Math.round(stats.totalSpent * 100) / 100, // Round to 2 decimal places
          last_order_date: stats.lastOrderDate,
        };
      });

      console.log('✅ AdminService.getCustomers - Customers with revenue:', {
        totalCustomers: customersWithStats.length,
        customersWithSpending: customersWithStats.filter(c => (c.total_spent || 0) > 0).length,
        totalRevenue: customersWithStats.reduce((sum, c) => sum + (c.total_spent || 0), 0),
        sampleCustomers: customersWithStats.slice(0, 3).map(c => ({
          name: c.full_name,
          orders: c.total_orders,
          spent: c.total_spent || 0
        }))
      });

      return customersWithStats;
    } catch (error: any) {
      console.error('❌ AdminService.getCustomers - Error:', error);
      throw new Error(error.message || 'Failed to fetch customers');
    }
  }

  // Get recent activity for dashboard
  async getRecentActivity(): Promise<RecentActivity[]> {
    try {
      console.log('🔄 AdminService.getRecentActivity - Fetching recent activity...');
      
      const activities: RecentActivity[] = [];

      // Get recent orders
      const { data: recentOrders } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          created_at,
          profiles:customer_id (full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      recentOrders?.forEach(order => {
        const customerName = (order.profiles as any)?.full_name || 'Unknown';
        const orderDisplay = order.order_number || `#${order.id.substring(0, 8)}`;
        if (order.status === 'delivered') {
          activities.push({
            id: `order-${order.id}`,
            type: 'order_delivered',
            title: `Order ${orderDisplay} delivered`,
            description: `Order delivered to ${customerName}`,
            timestamp: order.created_at,
            icon: 'checkmark-circle',
            color: '#4CAF50',
          });
        } else if (order.status === 'pending') {
          activities.push({
            id: `order-${order.id}`,
            type: 'order_placed',
            title: `New order placed`,
            description: `Order ${orderDisplay} by ${customerName}`,
            timestamp: order.created_at,
            icon: 'receipt',
            color: '#FF9800',
          });
        }
      });

      // Get recently added products
      const { data: recentProducts } = await supabase
        .from('products')
        .select('id, name, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      recentProducts?.forEach(product => {
        activities.push({
          id: `product-${product.id}`,
          type: 'product_added',
          title: 'New product added',
          description: `"${product.name}" added to inventory`,
          timestamp: product.created_at,
          icon: 'add-circle',
          color: '#2196F3',
        });
      });

      // Get recent customer registrations
      const { data: recentCustomers } = await supabase
        .from('profiles')
        .select('id, full_name, created_at')
        .eq('role', 'customer')
        .order('created_at', { ascending: false })
        .limit(3);

      recentCustomers?.forEach(customer => {
        activities.push({
          id: `customer-${customer.id}`,
          type: 'customer_registered',
          title: 'New customer registration',
          description: `${customer.full_name} joined`,
          timestamp: customer.created_at,
          icon: 'person-add',
          color: '#9C27B0',
        });
      });

      // Sort all activities by timestamp
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      console.log('✅ AdminService.getRecentActivity - Activities fetched:', activities.length);
      return activities.slice(0, 10); // Return top 10 activities
    } catch (error: any) {
      console.error('❌ AdminService.getRecentActivity - Error:', error);
      throw new Error(error.message || 'Failed to fetch recent activity');
    }
  }

  // Update order status
  async updateOrderStatus(orderId: string, status: string, verificationCode?: string): Promise<void> {
    try {
      console.log('📦 AdminService.updateOrderStatus - Updating order:', orderId, 'to', status);
      
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (verificationCode) {
        updateData.verification_code = verificationCode;
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) {
        console.error('❌ AdminService.updateOrderStatus - Error:', error);
        throw new Error(error.message);
      }

      console.log('✅ AdminService.updateOrderStatus - Order updated successfully');
    } catch (error: any) {
      console.error('❌ AdminService.updateOrderStatus - Error:', error);
      throw new Error(error.message || 'Failed to update order status');
    }
  }

  // Generate verification code
  generateVerificationCode(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  // Verify verification code
  verifyCode(enteredCode: string, actualCode: string): boolean {
    return enteredCode.trim() === actualCode.trim();
  }

  // Get sales reports
  async getSalesReport(period: 'daily' | 'weekly' | 'monthly'): Promise<any> {
    try {
      console.log('📈 AdminService.getSalesReport - Generating report for:', period);
      
      let dateFilter = '';
      const now = new Date();
      
      switch (period) {
        case 'daily':
          dateFilter = now.toISOString().split('T')[0];
          break;
        case 'weekly':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateFilter = weekAgo.toISOString().split('T')[0];
          break;
        case 'monthly':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          dateFilter = monthAgo.toISOString().split('T')[0];
          break;
      }

      const { data: salesData, error } = await supabase
        .from('orders')
        .select('total_amount, created_at, status')
        .gte('created_at', `${dateFilter}T00:00:00.000Z`)
        .in('status', ['confirmed', 'preparing', 'out_for_delivery', 'delivered'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ AdminService.getSalesReport - Error:', error);
        throw new Error(error.message);
      }

      const totalSales = salesData?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
      const totalOrders = salesData?.length || 0;
      const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

      const report = {
        period,
        totalSales,
        totalOrders,
        averageOrderValue,
        data: salesData,
      };

      console.log('✅ AdminService.getSalesReport - Report generated:', report);
      return report;
    } catch (error: any) {
      console.error('❌ AdminService.getSalesReport - Error:', error);
      throw new Error(error.message || 'Failed to generate sales report');
    }
  }

  // Get top selling products
  async getTopProducts(period: 'daily' | 'weekly' | 'monthly', limit: number = 10): Promise<any[]> {
    try {
      console.log('🏆 AdminService.getTopProducts - Fetching top products for:', period);
      
      let dateFilter = '';
      const now = new Date();
      
      switch (period) {
        case 'daily':
          dateFilter = now.toISOString().split('T')[0];
          break;
        case 'weekly':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateFilter = weekAgo.toISOString().split('T')[0];
          break;
        case 'monthly':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          dateFilter = monthAgo.toISOString().split('T')[0];
          break;
      }

      // Use the correct column names from schema: quantity_kg and price_per_kg
      const { data: orderItems, error } = await supabase
        .from('order_items')
        .select(`
          product_id,
          quantity_kg,
          price_per_kg,
          subtotal,
          products (
            name,
            category,
            image_url
          ),
          orders!inner (
            created_at,
            status
          )
        `)
        .gte('orders.created_at', `${dateFilter}T00:00:00.000Z`)
        .in('orders.status', ['confirmed', 'preparing', 'out_for_delivery', 'delivered'])
        .limit(limit * 5); // Get more to account for aggregation

      if (error) {
        console.error('❌ AdminService.getTopProducts - Error:', error);
        // Return empty array instead of throwing error
        console.log('📍 Returning empty products array due to schema mismatch');
        return [];
      }

      // Aggregate products by sales
      const productSales = new Map<string, any>();
      
      orderItems?.forEach(item => {
        const productId = item.product_id;
        const existing = productSales.get(productId);
        const product = Array.isArray(item.products) ? item.products[0] : item.products;
        const quantityKg = item.quantity_kg || 0;
        const pricePerKg = item.price_per_kg || 0;
        const itemRevenue = item.subtotal || (quantityKg * pricePerKg);
        
        if (existing) {
          existing.totalQuantity += quantityKg;
          existing.totalRevenue += itemRevenue;
        } else {
          productSales.set(productId, {
            productId,
            name: product?.name || 'Unknown Product',
            category: product?.category || 'Unknown',
            image_url: product?.image_url,
            totalQuantity: quantityKg,
            totalRevenue: itemRevenue,
          });
        }
      });

      // Convert to array and sort by revenue
      const topProducts = Array.from(productSales.values())
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, limit);

      console.log('✅ AdminService.getTopProducts - Top products fetched:', topProducts.length);
      return topProducts;
    } catch (error: any) {
      console.error('❌ AdminService.getTopProducts - Error:', error);
      // Return empty array instead of throwing error
      return [];
    }
  }

  // Get revenue by period for charts
  async getRevenueByPeriod(period: 'daily' | 'weekly' | 'monthly'): Promise<any[]> {
    try {
      console.log('📊 AdminService.getRevenueByPeriod - Fetching revenue data for:', period);
      
      let dateFilter = '';
      let groupBy = '';
      const now = new Date();
      
      switch (period) {
        case 'daily':
          dateFilter = now.toISOString().split('T')[0];
          groupBy = 'DATE(created_at)';
          break;
        case 'weekly':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateFilter = weekAgo.toISOString().split('T')[0];
          groupBy = 'DATE(created_at)';
          break;
        case 'monthly':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          dateFilter = monthAgo.toISOString().split('T')[0];
          groupBy = 'DATE(created_at)';
          break;
      }

      const { data: revenueData, error } = await supabase
        .from('orders')
        .select('total_amount, created_at, status')
        .gte('created_at', `${dateFilter}T00:00:00.000Z`)
        .in('status', ['confirmed', 'preparing', 'out_for_delivery', 'delivered'])
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ AdminService.getRevenueByPeriod - Error:', error);
        throw new Error(error.message);
      }

      // Group by date
      const revenueByDate = new Map<string, number>();
      
      revenueData?.forEach(order => {
        const date = order.created_at.split('T')[0];
        const existing = revenueByDate.get(date) || 0;
        revenueByDate.set(date, existing + order.total_amount);
      });

      const chartData = Array.from(revenueByDate.entries()).map(([date, revenue]) => ({
        date,
        revenue,
        label: new Date(date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
      }));

      console.log('✅ AdminService.getRevenueByPeriod - Revenue data fetched:', chartData.length);
      return chartData;
    } catch (error: any) {
      console.error('❌ AdminService.getRevenueByPeriod - Error:', error);
      throw new Error(error.message || 'Failed to fetch revenue data');
    }
  }

  // Get quick stats for reports
  async getQuickStats(period: 'daily' | 'weekly' | 'monthly'): Promise<any> {
    try {
      console.log('⚡ AdminService.getQuickStats - Fetching quick stats for:', period);
      
      let dateFilter = '';
      const now = new Date();
      
      switch (period) {
        case 'daily':
          dateFilter = now.toISOString().split('T')[0];
          break;
        case 'weekly':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateFilter = weekAgo.toISOString().split('T')[0];
          break;
        case 'monthly':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          dateFilter = monthAgo.toISOString().split('T')[0];
          break;
      }

      // Get all confirmed orders for the period (excluding pending and cancelled)
      const { data: ordersData } = await supabase
        .from('orders')
        .select('id, customer_id, status, created_at')
        .gte('created_at', `${dateFilter}T00:00:00.000Z`)
        .in('status', ['confirmed', 'preparing', 'out_for_delivery', 'delivered']);

      const totalOrders = ordersData?.length || 0;
      
      // Calculate delivery success rate
      const deliveredOrders = ordersData?.filter(order => order.status === 'delivered').length || 0;
      const deliverySuccessRate = totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0;

      // Get unique customers for the period
      const uniqueCustomers = new Set(ordersData?.map(order => order.customer_id) || []);
      const totalCustomersInPeriod = uniqueCustomers.size;

      // Get all customers who had confirmed orders before this period
      const { data: existingCustomersData } = await supabase
        .from('orders')
        .select('customer_id')
        .lt('created_at', `${dateFilter}T00:00:00.000Z`)
        .in('status', ['confirmed', 'preparing', 'out_for_delivery', 'delivered']);

      const existingCustomerIds = new Set(existingCustomersData?.map(order => order.customer_id) || []);
      
      // Calculate new customers percentage
      const newCustomers = Array.from(uniqueCustomers).filter(id => !existingCustomerIds.has(id));
      const newCustomerPercentage = totalCustomersInPeriod > 0 ? 
        Math.round((newCustomers.length / totalCustomersInPeriod) * 100) : 0;

      // Calculate repeat orders percentage
      const customerOrderCounts = new Map();
      ordersData?.forEach(order => {
        const count = customerOrderCounts.get(order.customer_id) || 0;
        customerOrderCounts.set(order.customer_id, count + 1);
      });

      const repeatCustomers = Array.from(customerOrderCounts.values()).filter(count => count > 1).length;
      const repeatOrderPercentage = totalCustomersInPeriod > 0 ? 
        Math.round((repeatCustomers / totalCustomersInPeriod) * 100) : 0;

      // For average rating, we'll use a mock value since we don't have a reviews table yet
      // In a real app, you would query from a reviews/ratings table
      const avgRating = 4.2 + (Math.random() * 0.6); // Random between 4.2-4.8

      const quickStats = {
        deliverySuccessRate,
        newCustomerPercentage,
        repeatOrderPercentage,
        avgRating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
      };

      console.log('✅ AdminService.getQuickStats - Quick stats fetched:', quickStats);
      return quickStats;
    } catch (error: any) {
      console.error('❌ AdminService.getQuickStats - Error:', error);
      // Return default values instead of throwing
      return {
        deliverySuccessRate: 0,
        newCustomerPercentage: 0,
        repeatOrderPercentage: 0,
        avgRating: 0,
      };
    }
  }
}

export const adminService = new AdminService();
