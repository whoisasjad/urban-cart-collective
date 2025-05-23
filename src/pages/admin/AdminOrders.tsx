
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, Search } from 'lucide-react';
import { formatCurrency } from "@/lib/utils";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminOrders() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['admin-orders', filterStatus],
    queryFn: async () => {
      try {
        // First, get the orders
        let query = supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (filterStatus) {
          query = query.eq('status', filterStatus);
        }
        
        const { data: ordersData, error: ordersError } = await query;
        
        if (ordersError) throw ordersError;
        
        // Then, for each order, get the user profile information
        if (ordersData && ordersData.length > 0) {
          const ordersWithProfiles = await Promise.all(
            ordersData.map(async (order) => {
              if (order.user_id) {
                const { data: profileData } = await supabase
                  .from('profiles')
                  .select('first_name, last_name, email')
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
          
          console.log('Orders with profiles fetched:', ordersWithProfiles);
          return ordersWithProfiles;
        }
        
        return ordersData || [];
      } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }
    }
  });

  const { data: orderItems, isLoading: isOrderItemsLoading } = useQuery({
    queryKey: ['order-items', selectedOrder?.id],
    queryFn: async () => {
      if (!selectedOrder?.id) return [];
      
      try {
        const { data, error } = await supabase
          .from('order_items')
          .select(`
            *,
            products:product_id (
              name,
              image_url
            )
          `)
          .eq('order_id', selectedOrder.id);
        
        if (error) throw error;
        console.log('Order items fetched:', data);
        return data || [];
      } catch (error) {
        console.error('Error fetching order items:', error);
        return [];
      }
    },
    enabled: !!selectedOrder?.id
  });

  // Add mutation for updating order status
  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string, status: string }) => {
      try {
        const { error } = await supabase
          .from('orders')
          .update({ status })
          .eq('id', orderId);
        
        if (error) throw error;
        return { orderId, status };
      } catch (error) {
        console.error('Error updating order status:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast({
        title: "Order Updated",
        description: `Order status changed to ${data.status}`,
      });
      
      // Update the local state as well
      if (selectedOrder && selectedOrder.id === data.orderId) {
        setSelectedOrder({
          ...selectedOrder,
          status: data.status
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  });

  const handleStatusChange = (status: string) => {
    if (!selectedOrder) return;
    
    updateOrderMutation.mutate({
      orderId: selectedOrder.id,
      status
    });
  };

  const viewOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  const filteredOrders = orders?.filter((order: any) => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    const orderId = order.id.toLowerCase();
    const firstName = order.profiles?.first_name?.toLowerCase() || '';
    const lastName = order.profiles?.last_name?.toLowerCase() || '';
    
    return orderId.includes(searchLower) || 
           firstName.includes(searchLower) || 
           lastName.includes(searchLower);
  });

  if (error) {
    console.error('Error loading orders:', error);
    return (
      <AdminLayout>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Orders</h1>
        </div>
        <div className="text-center py-8 border border-red-500/30 rounded-md bg-red-500/10">
          <p className="text-red-500">Error loading orders: {(error as any).message || 'Unknown error'}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Orders</h1>
        <div className="flex space-x-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              className="pl-8 w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={filterStatus || "all"} onValueChange={(value) => setFilterStatus(value === "all" ? null : value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-md border border-urban-purple/30 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-urban-dark/50 border-b border-urban-purple/30">
                <TableHead className="text-white">Order ID</TableHead>
                <TableHead className="text-white">Customer</TableHead>
                <TableHead className="text-white">Date</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-white">Total</TableHead>
                <TableHead className="text-white text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3].map((i) => (
                <TableRow key={i} className="border-b border-urban-purple/20">
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-full ml-auto" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : filteredOrders && filteredOrders.length > 0 ? (
        <div className="rounded-md border border-urban-purple/30 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-urban-dark/50 border-b border-urban-purple/30">
                <TableHead className="text-white">Order ID</TableHead>
                <TableHead className="text-white">Customer</TableHead>
                <TableHead className="text-white">Date</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-white">Total</TableHead>
                <TableHead className="text-white text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order: any) => (
                <TableRow key={order.id} className="border-b border-urban-purple/20">
                  <TableCell className="font-medium">{order.id.substring(0, 8)}...</TableCell>
                  <TableCell>
                    {order.profiles?.first_name || 'Unknown'} {order.profiles?.last_name || ''}
                  </TableCell>
                  <TableCell>
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </TableCell>
                  <TableCell>
                    <span 
                      className={`inline-block px-2 py-1 text-xs rounded-full ${
                        order.status === 'pending'
                          ? 'bg-amber-500/20 text-amber-500'
                          : order.status === 'processing'
                          ? 'bg-blue-500/20 text-blue-500'
                          : order.status === 'completed'
                          ? 'bg-green-500/20 text-green-500'
                          : 'bg-red-500/20 text-red-500'
                      }`}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>{formatCurrency(order.total)}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-muted-foreground hover:text-white"
                      onClick={() => viewOrderDetails(order)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No orders found</p>
        </div>
      )}

      {/* Order Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-urban-dark border-urban-purple/30 text-white sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-medium">{selectedOrder.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {new Date(selectedOrder.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Customer</p>
                  <p className="font-medium">
                    {selectedOrder.profiles?.first_name || 'Unknown'} {selectedOrder.profiles?.last_name || ''}
                  </p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.profiles?.email || 'No email available'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <Select value={selectedOrder.status} onValueChange={handleStatusChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Shipping Address</p>
                  <div className="p-3 border border-urban-purple/30 rounded-md">
                    {selectedOrder.shipping_address?.name && (
                      <p className="font-medium">{selectedOrder.shipping_address.name}</p>
                    )}
                    <p>{selectedOrder.shipping_address?.street || 'No address available'}</p>
                    {selectedOrder.shipping_address?.city && selectedOrder.shipping_address?.state && (
                      <p>
                        {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.zip}
                      </p>
                    )}
                    {selectedOrder.shipping_address?.country && (
                      <p>{selectedOrder.shipping_address.country}</p>
                    )}
                  </div>
                </div>
                {selectedOrder.billing_address && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Billing Address</p>
                    <div className="p-3 border border-urban-purple/30 rounded-md">
                      {selectedOrder.billing_address.name && (
                        <p className="font-medium">{selectedOrder.billing_address.name}</p>
                      )}
                      <p>{selectedOrder.billing_address.street || 'No address available'}</p>
                      {selectedOrder.billing_address?.city && selectedOrder.billing_address?.state && (
                        <p>
                          {selectedOrder.billing_address.city}, {selectedOrder.billing_address.state} {selectedOrder.billing_address.zip}
                        </p>
                      )}
                      {selectedOrder.billing_address?.country && (
                        <p>{selectedOrder.billing_address.country}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Order Items</p>
                {isOrderItemsLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-urban-purple border-t-transparent"></div>
                  </div>
                ) : orderItems && orderItems.length > 0 ? (
                  <div className="border border-urban-purple/30 rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-urban-dark/50 border-b border-urban-purple/30">
                          <TableHead className="text-white">Product</TableHead>
                          <TableHead className="text-white text-center">Size</TableHead>
                          <TableHead className="text-white text-center">Quantity</TableHead>
                          <TableHead className="text-white text-right">Price</TableHead>
                          <TableHead className="text-white text-right">Subtotal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orderItems.map((item: any) => (
                          <TableRow key={item.id} className="border-b border-urban-purple/20">
                            <TableCell>
                              <div className="flex items-center">
                                {item.products?.image_url && (
                                  <img 
                                    src={item.products.image_url} 
                                    alt={item.products?.name || 'Product'} 
                                    className="w-10 h-10 object-cover rounded mr-3"
                                  />
                                )}
                                {item.products?.name || 'Product'}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              {item.size || '-'}
                            </TableCell>
                            <TableCell className="text-center">
                              {item.quantity}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(item.price)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(item.price * item.quantity)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-4 border border-urban-purple/30 rounded-md">
                    <p className="text-muted-foreground">No items found</p>
                  </div>
                )}
              </div>
              
              <div>
                <div className="flex justify-between py-2">
                  <p className="text-muted-foreground">Subtotal</p>
                  <p className="font-medium">{formatCurrency(selectedOrder.total - (selectedOrder.shipping_cost || 0) - (selectedOrder.tax || 0))}</p>
                </div>
                {selectedOrder.shipping_cost > 0 && (
                  <div className="flex justify-between py-2">
                    <p className="text-muted-foreground">Shipping</p>
                    <p className="font-medium">{formatCurrency(selectedOrder.shipping_cost)}</p>
                  </div>
                )}
                {selectedOrder.tax > 0 && (
                  <div className="flex justify-between py-2">
                    <p className="text-muted-foreground">Tax</p>
                    <p className="font-medium">{formatCurrency(selectedOrder.tax)}</p>
                  </div>
                )}
                <div className="flex justify-between py-2 border-t border-urban-purple/30 mt-2">
                  <p className="font-medium">Total</p>
                  <p className="font-bold text-urban-purple">{formatCurrency(selectedOrder.total)}</p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  className="bg-urban-purple hover:bg-urban-magenta"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
