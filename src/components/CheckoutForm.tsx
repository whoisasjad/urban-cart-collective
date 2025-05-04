
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency } from '@/lib/utils';

export default function CheckoutForm() {
  const { cart, cartTotal, clearCart } = useStore();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    phone: ''
  });
  
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You must be signed in to complete your purchase.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }
    
    if (cart.length === 0) {
      toast({
        title: "Empty cart",
        description: "Your cart is empty. Please add products to proceed.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Create the shipping address object
      const shippingAddress = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country,
        phone: formData.phone
      };
      
      // Create the order in the database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total: Math.round(cartTotal * 100), // Store in cents
          shipping_address: shippingAddress,
          status: 'pending'
        })
        .select()
        .single();
      
      if (orderError) throw orderError;
      
      // Create order items for each product in the cart
      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: Math.round((item.product.salePrice || item.product.price) * 100), // Store in cents
        size: item.size || null
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) throw itemsError;
      
      // Clear the cart after successful order
      clearCart();
      
      toast({
        title: "Order placed successfully!",
        description: "Thank you for your purchase. You will receive a confirmation email shortly.",
      });
      
      navigate('/');
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "There was an error processing your order.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Checkout</h1>
      
      <div className="urban-card mb-8 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Order Summary</h2>
        <div className="space-y-2">
          {cart.map((item, index) => (
            <div key={`${item.product.id}-${item.size}-${index}`} className="flex justify-between">
              <div>
                <span className="text-white">{item.product.name}</span>
                {item.size && (
                  <span className="text-sm text-muted-foreground ml-2">({item.size})</span>
                )}
                <span className="text-muted-foreground ml-2">×{item.quantity}</span>
              </div>
              <span className="text-white">
                {formatCurrency((item.product.salePrice || item.product.price) * item.quantity)}
              </span>
            </div>
          ))}
          <div className="border-t border-urban-purple/30 pt-2 mt-4">
            <div className="flex justify-between font-bold">
              <span className="text-white">Total</span>
              <span className="text-urban-purple">{formatCurrency(cartTotal)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="urban-card p-6">
        <h2 className="text-xl font-bold text-white mb-4">Shipping Information</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm text-muted-foreground mb-1">
                First Name
              </label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm text-muted-foreground mb-1">
                Last Name
              </label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="address" className="block text-sm text-muted-foreground mb-1">
              Address
            </label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm text-muted-foreground mb-1">
                City
              </label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="state" className="block text-sm text-muted-foreground mb-1">
                State/Province
              </label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="postalCode" className="block text-sm text-muted-foreground mb-1">
                Postal Code
              </label>
              <Input
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="country" className="block text-sm text-muted-foreground mb-1">
                Country
              </label>
              <Input
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm text-muted-foreground mb-1">
              Phone Number
            </label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
          
          <Button
            type="submit"
            className="w-full bg-urban-purple hover:bg-urban-magenta mt-4"
            disabled={loading}
          >
            {loading ? "Processing..." : "Complete Purchase"}
          </Button>
        </form>
      </div>
    </div>
  );
}
