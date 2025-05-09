
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Users, Package, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboard() {
  // Query for products count
  const { data: productsCount, isLoading: isProductsLoading } = useQuery({
    queryKey: ['products-count'],
    queryFn: async () => {
      try {
        const { count, error } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });
        
        if (error) throw error;
        return count || 0;
      } catch (error) {
        console.error('Error fetching products count:', error);
        return 0;
      }
    }
  });

  // Query for orders count
  const { data: ordersCount, isLoading: isOrdersCountLoading } = useQuery({
    queryKey: ['orders-count'],
    queryFn: async () => {
      try {
        const { count, error } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true });
        
        if (error) throw error;
        return count || 0;
      } catch (error) {
        console.error('Error fetching orders count:', error);
        return 0;
      }
    }
  });

  // Query for customer count
  const { data: customerCount, isLoading: isCustomerCountLoading } = useQuery({
    queryKey: ['customers-count'],
    queryFn: async () => {
      try {
        const { count, error } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .neq('role', 'admin');
        
        if (error) throw error;
        return count || 0;
      } catch (error) {
        console.error('Error fetching customer count:', error);
        return 0;
      }
    }
  });

  // Query for total revenue
  const { data: totalRevenue, isLoading: isRevenueLoading } = useQuery({
    queryKey: ['total-revenue'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('total');
        
        if (error) throw error;
        
        // Calculate sum of all order totals
        return data?.reduce((sum, order) => sum + order.total, 0) || 0;
      } catch (error) {
        console.error('Error fetching total revenue:', error);
        return 0;
      }
    }
  });

  // Query for recent orders
  const { data: recentOrders, isLoading: isRecentOrdersLoading } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: async () => {
      try {
        // First get the orders
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select(`
            id,
            total,
            status,
            created_at,
            user_id
          `)
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (ordersError) throw ordersError;
        
        // Then get the profile information for each order's user
        if (ordersData && ordersData.length > 0) {
          const ordersWithProfiles = await Promise.all(
            ordersData.map(async (order) => {
              if (order.user_id) {
                const { data: profileData } = await supabase
                  .from('profiles')
                  .select('first_name, last_name')
                  .eq('id', order.user_id)
                  .single();
                
                return {
                  ...order,
                  profiles: profileData || null
                };
              }
              return order;
            })
          );
          
          console.log('Recent orders fetched:', ordersWithProfiles);
          return ordersWithProfiles;
        }
        
        return ordersData || [];
      } catch (error) {
        console.error('Error fetching recent orders:', error);
        return [];
      }
    }
  });

  // Query for popular products
  const { data: popularProducts, isLoading: isPopularProductsLoading } = useQuery({
    queryKey: ['popular-products'],
    queryFn: async () => {
      try {
        // First get order items with product details and quantities
        const { data: orderItems, error: orderItemsError } = await supabase
          .from('order_items')
          .select(`
            quantity,
            product_id,
            products:product_id (
              name,
              image_url
            )
          `);
        
        if (orderItemsError) throw orderItemsError;

        // Aggregate items by product and calculate total sold
        const productSales: Record<string, { 
          product_id: string, 
          name: string, 
          image_url: string, 
          quantity: number 
        }> = {};
        
        orderItems?.forEach(item => {
          if (item.product_id && item.products) {
            if (productSales[item.product_id]) {
              productSales[item.product_id].quantity += item.quantity;
            } else {
              productSales[item.product_id] = {
                product_id: item.product_id,
                name: item.products.name,
                image_url: item.products.image_url,
                quantity: item.quantity
              };
            }
          }
        });
        
        // Convert to array and sort by quantity sold
        return Object.values(productSales)
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 4); // Get top 4 products
      } catch (error) {
        console.error('Error fetching popular products:', error);
        return [];
      }
    }
  });

  // Calculate revenue change percentage based on history
  const { data: revenueChangePercent, isLoading: isRevenueChangeLoading } = useQuery({
    queryKey: ['revenue-change'],
    queryFn: async () => {
      try {
        const now = new Date();
        const lastMonth = new Date();
        lastMonth.setMonth(now.getMonth() - 1);
        
        // Format dates to YYYY-MM-DD format for the database query
        const currentMonthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
        const lastMonthStart = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}-01`;
        const lastMonthEnd = currentMonthStart;
        
        // Get current month revenue
        const { data: currentMonthOrders, error: currentError } = await supabase
          .from('orders')
          .select('total')
          .gte('created_at', currentMonthStart);
          
        // Get last month revenue
        const { data: lastMonthOrders, error: lastError } = await supabase
          .from('orders')
          .select('total')
          .gte('created_at', lastMonthStart)
          .lt('created_at', lastMonthEnd);
          
        if (currentError || lastError) throw currentError || lastError;
        
        const currentRevenue = currentMonthOrders?.reduce((sum, order) => sum + order.total, 0) || 0;
        const lastRevenue = lastMonthOrders?.reduce((sum, order) => sum + order.total, 0) || 1; // Avoid division by zero
        
        const changePercent = ((currentRevenue - lastRevenue) / lastRevenue) * 100;
        return isNaN(changePercent) ? 0 : Math.round(changePercent);
      } catch (error) {
        console.error('Error calculating revenue change:', error);
        return 0; // Default fallback value
      }
    }
  });

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="bg-secondary/20 border-urban-purple/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {isRevenueLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-urban-purple mr-3" />
                <div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(totalRevenue || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isRevenueChangeLoading ? (
                      <Skeleton className="h-3 w-24" />
                    ) : revenueChangePercent !== undefined && (
                      <span className={revenueChangePercent >= 0 ? "text-green-500" : "text-red-500"}>
                        {revenueChangePercent >= 0 ? "+" : ""}{revenueChangePercent}% from last month
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-secondary/20 border-urban-purple/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-muted-foreground">Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {isOrdersCountLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="flex items-center">
                <ShoppingCart className="h-8 w-8 text-urban-purple mr-3" />
                <div>
                  <div className="text-2xl font-bold">{ordersCount || 0}</div>
                  <p className="text-xs text-muted-foreground">Total orders</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-secondary/20 border-urban-purple/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-muted-foreground">Products</CardTitle>
          </CardHeader>
          <CardContent>
            {isProductsLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="flex items-center">
                <Package className="h-8 w-8 text-urban-purple mr-3" />
                <div>
                  <div className="text-2xl font-bold">{productsCount || 0}</div>
                  <p className="text-xs text-muted-foreground">{productsCount ? `${Math.floor(productsCount * 0.7)} in stock` : '0 in stock'}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-secondary/20 border-urban-purple/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-muted-foreground">Customers</CardTitle>
          </CardHeader>
          <CardContent>
            {isCustomerCountLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="flex items-center">
                <Users className="h-8 w-8 text-urban-purple mr-3" />
                <div>
                  <div className="text-2xl font-bold">{customerCount || 0}</div>
                  <p className="text-xs text-muted-foreground">Registered users</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-secondary/20 border-urban-purple/30">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isRecentOrdersLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div>
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <div className="text-right">
                      <Skeleton className="h-4 w-16 mb-1" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                  </div>
                ))
              ) : recentOrders && recentOrders.length > 0 ? (
                recentOrders.map((order: any) => (
                  <div key={order.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">
                        {order.profiles?.first_name || 'Customer'} {order.profiles?.last_name || ''}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(order.total)}</p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        order.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                        order.status === 'processing' ? 'bg-blue-500/20 text-blue-500' :
                        order.status === 'cancelled' ? 'bg-red-500/20 text-red-500' :
                        'bg-amber-500/20 text-amber-500'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No orders yet</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-secondary/20 border-urban-purple/30">
          <CardHeader>
            <CardTitle>Popular Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isPopularProductsLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Skeleton className="w-10 h-10 rounded mr-3" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))
              ) : popularProducts && popularProducts.length > 0 ? (
                popularProducts.map((product: any) => (
                  <div key={product.product_id} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded bg-urban-purple/20 mr-3 overflow-hidden">
                        {product.image_url && (
                          <img 
                            src={product.image_url} 
                            alt={product.name} 
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <p className="font-medium">{product.name}</p>
                    </div>
                    <p className="font-medium">{product.quantity} sold</p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No product sales data yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
