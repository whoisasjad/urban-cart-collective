
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Users, Package, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function AdminDashboard() {
  // Query for products count
  const { data: productsCount } = useQuery({
    queryKey: ['products-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    }
  });

  // Query for orders count
  const { data: ordersCount } = useQuery({
    queryKey: ['orders-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    }
  });

  // Query for customer count
  const { data: customerCount } = useQuery({
    queryKey: ['customers-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .neq('role', 'admin');
      
      if (error) throw error;
      return count || 0;
    }
  });

  // Query for total revenue
  const { data: totalRevenue } = useQuery({
    queryKey: ['total-revenue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('total');
      
      if (error) throw error;
      
      // Calculate sum of all order totals
      return data?.reduce((sum, order) => sum + order.total, 0) || 0;
    }
  });

  // Query for recent orders
  const { data: recentOrders } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          total,
          status,
          created_at,
          profiles:user_id (
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Query for popular products
  const { data: popularProducts } = useQuery({
    queryKey: ['popular-products'],
    queryFn: async () => {
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
    }
  });

  // Calculate revenue change percentage (mock for now as we don't have historical data)
  const revenueChangePercent = 12; // This would ideally be calculated from historical data

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="bg-secondary/20 border-urban-purple/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-urban-purple mr-3" />
              <div>
                <div className="text-2xl font-bold">
                  {totalRevenue !== undefined ? formatCurrency(totalRevenue) : '...'}
                </div>
                <p className="text-xs text-muted-foreground">
                  +{revenueChangePercent}% from last month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary/20 border-urban-purple/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-muted-foreground">Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-urban-purple mr-3" />
              <div>
                <div className="text-2xl font-bold">{ordersCount || '...'}</div>
                <p className="text-xs text-muted-foreground">+5% from last month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary/20 border-urban-purple/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-muted-foreground">Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Package className="h-8 w-8 text-urban-purple mr-3" />
              <div>
                <div className="text-2xl font-bold">{productsCount || '...'}</div>
                <p className="text-xs text-muted-foreground">{productsCount ? `${Math.floor(productsCount * 0.7)} in stock` : '...'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary/20 border-urban-purple/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-muted-foreground">Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-8 w-8 text-urban-purple mr-3" />
              <div>
                <div className="text-2xl font-bold">{customerCount || '...'}</div>
                <p className="text-xs text-muted-foreground">+18% from last month</p>
              </div>
            </div>
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
              {recentOrders ? (
                recentOrders.length > 0 ? (
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
                          'bg-amber-500/20 text-amber-500'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No orders yet</p>
                )
              ) : (
                <div className="flex justify-center py-4">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-urban-purple border-t-transparent"></div>
                </div>
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
              {popularProducts ? (
                popularProducts.length > 0 ? (
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
                )
              ) : (
                <div className="flex justify-center py-4">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-urban-purple border-t-transparent"></div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
