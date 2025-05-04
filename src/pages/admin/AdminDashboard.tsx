
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Users, Package, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
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
                <div className="text-2xl font-bold">$12,345</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
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
                <div className="text-2xl font-bold">154</div>
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
                        <p className="font-medium">${(order.total / 100).toFixed(2)}</p>
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
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded bg-urban-purple/20 mr-3"></div>
                  <p className="font-medium">Urban Graffiti Hoodie</p>
                </div>
                <p className="font-medium">32 sold</p>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded bg-urban-purple/20 mr-3"></div>
                  <p className="font-medium">Street Art Tee</p>
                </div>
                <p className="font-medium">28 sold</p>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded bg-urban-purple/20 mr-3"></div>
                  <p className="font-medium">Graffiti Snapback</p>
                </div>
                <p className="font-medium">24 sold</p>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded bg-urban-purple/20 mr-3"></div>
                  <p className="font-medium">Street Style Sneakers</p>
                </div>
                <p className="font-medium">19 sold</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
