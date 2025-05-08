
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, Banknote, Building, MessageSquare } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import OrderConfirmation from './OrderConfirmation';

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
  
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  
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
          status: 'pending',
          payment_method: paymentMethod
        })
        .select()
        .single();
      
      if (orderError) {
        console.error("Order creation error:", orderError);
        throw orderError;
      }
      
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
      
      if (itemsError) {
        console.error("Order items creation error:", itemsError);
        throw itemsError;
      }
      
      // Fetch product details for the order items
      const productIds = cart.map(item => item.product.id);
      const { data: products } = await supabase
        .from('products')
        .select('id, name, image_url')
        .in('id', productIds);
      
      // Create complete order details for the confirmation
      const orderItemsWithDetails = orderItems.map(item => {
        const cartItem = cart.find(ci => ci.product.id === item.product_id);
        const product = products?.find(p => p.id === item.product_id);
        return {
          ...item,
          product: {
            name: product?.name || cartItem?.product.name || 'Product',
            image_url: product?.image_url || cartItem?.product.imageUrl || ''
          }
        };
      });
      
      // Save the order details for the confirmation dialog
      setOrderDetails({
        id: order.id,
        created_at: order.created_at,
        total: order.total,
        payment_method: order.payment_method,
        shipping_address: shippingAddress,
        items: orderItemsWithDetails
      });
      
      // Clear the cart after successful order
      clearCart();
      
      // Show the confirmation dialog
      setOrderSuccess(true);
      
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

  // Bank transfer details component
  const BankTransferDetails = () => (
    <div className="urban-card p-6 mt-6 border border-urban-purple/30 animate-fade-in">
      <h3 className="text-xl font-semibold text-white mb-4">Bank Transfer Details</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Bank Name</p>
            <p className="text-white">Urban Bank Ltd.</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Account Name</p>
            <p className="text-white">Urban Threads Inc.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Account Number</p>
            <p className="text-white font-medium">1234-5678-9012-3456</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Branch Code</p>
            <p className="text-white">005</p>
          </div>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground">Reference</p>
          <p className="text-white">Your Order # + Full Name</p>
        </div>
        
        <div className="bg-background/10 p-4 rounded-md">
          <h4 className="text-urban-purple flex items-center gap-2 mb-2">
            <MessageSquare className="h-5 w-5" />
            <span>Send Payment Confirmation</span>
          </h4>
          <p className="text-sm text-muted-foreground">
            After completing your payment, please send a screenshot of your payment confirmation to:
          </p>
          <p className="text-white font-medium mt-1">+1 (555) 123-4567</p>
          <p className="text-xs text-muted-foreground mt-2">
            Please include your order number and full name in your message.
          </p>
        </div>
      </div>
    </div>
  );
  
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
      
      <div className="urban-card p-6 mb-8">
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
          
          <div className="mt-6">
            <h3 className="text-lg font-medium text-white mb-3">Payment Method</h3>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
              <label className="flex items-center space-x-3 p-3 border border-urban-purple/30 rounded-md cursor-pointer hover:bg-secondary/20">
                <RadioGroupItem value="cash_on_delivery" id="cod" />
                <Banknote className="h-5 w-5 text-urban-purple mr-2" />
                <div>
                  <p className="font-medium text-white">Cash on Delivery</p>
                  <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
                </div>
              </label>
              
              <label className="flex items-center space-x-3 p-3 border border-urban-purple/30 rounded-md cursor-pointer hover:bg-secondary/20">
                <RadioGroupItem value="bank_transfer" id="bank" />
                <Building className="h-5 w-5 text-urban-purple mr-2" />
                <div>
                  <p className="font-medium text-white">Bank Transfer</p>
                  <p className="text-sm text-muted-foreground">Pay via bank transfer</p>
                </div>
              </label>
              
              <label className="flex items-center space-x-3 p-3 border border-urban-purple/30 rounded-md cursor-pointer hover:bg-secondary/20 opacity-60">
                <RadioGroupItem value="credit_card" id="card" disabled />
                <CreditCard className="h-5 w-5 text-urban-purple mr-2" />
                <div>
                  <p className="font-medium text-white">Credit Card</p>
                  <p className="text-sm text-muted-foreground">Coming soon</p>
                </div>
              </label>
            </RadioGroup>
          </div>
          
          {/* Show bank transfer details if that payment method is selected */}
          {paymentMethod === 'bank_transfer' && <BankTransferDetails />}
          
          <Button
            type="submit"
            className="w-full bg-urban-purple hover:bg-urban-magenta mt-8"
            disabled={loading}
          >
            {loading ? "Processing..." : "Complete Purchase"}
          </Button>
        </form>
      </div>
      
      {/* Order confirmation dialog */}
      <OrderConfirmation 
        open={orderSuccess}
        onOpenChange={(open) => {
          setOrderSuccess(open);
          if (!open) {
            // If dialog is closed without continuing shopping, redirect to home
            navigate('/');
          }
        }}
        orderDetails={orderDetails}
      />
    </div>
  );
}
