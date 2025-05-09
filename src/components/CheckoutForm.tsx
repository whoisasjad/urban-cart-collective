import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, Banknote, Building, MessageSquare, Home, PlusCircle } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import OrderConfirmation from './OrderConfirmation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Define the validation schema for shipping information
const shippingSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  phone: z.string().min(1, "Phone number is required"),
  useDefaultAddress: z.boolean().optional(),
});

export default function CheckoutForm() {
  const { cart, cartTotal, clearCart } = useStore();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [sendingEmails, setSendingEmails] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [addressChoice, setAddressChoice] = useState('default');
  
  // Initialize form with react-hook-form
  const form = useForm({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'United States',
      phone: '',
      useDefaultAddress: true,
    }
  });

  // Fetch the user's profile data on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (!error && data) {
          setUserProfile(data);
          
          // Pre-fill the form with the profile data if available
          if (data.first_name) form.setValue('firstName', data.first_name);
          if (data.last_name) form.setValue('lastName', data.last_name);
          if (data.address) form.setValue('address', data.address);
          if (data.city) form.setValue('city', data.city);
          if (data.state) form.setValue('state', data.state);
          if (data.postal_code) form.setValue('postalCode', data.postal_code);
          if (data.country) form.setValue('country', data.country);
          if (data.phone) form.setValue('phone', data.phone);
        }
      }
    };
    
    fetchUserProfile();
  }, [user, form]);
  
  // Handle address choice change
  useEffect(() => {
    if (addressChoice === 'default' && userProfile) {
      // Fill form with user's default address
      form.setValue('firstName', userProfile.first_name || '');
      form.setValue('lastName', userProfile.last_name || '');
      form.setValue('address', userProfile.address || '');
      form.setValue('city', userProfile.city || '');
      form.setValue('state', userProfile.state || '');
      form.setValue('postalCode', userProfile.postal_code || '');
      form.setValue('country', userProfile.country || 'United States');
      form.setValue('phone', userProfile.phone || '');
    } else if (addressChoice === 'new') {
      // Reset form fields for new address
      form.setValue('firstName', '');
      form.setValue('lastName', '');
      form.setValue('address', '');
      form.setValue('city', '');
      form.setValue('state', '');
      form.setValue('postalCode', '');
      form.setValue('country', 'United States');
      form.setValue('phone', '');
    }
  }, [addressChoice, userProfile, form]);

  // Function to send order confirmation emails
  const sendOrderEmails = async (orderDetails, userEmail) => {
    try {
      setSendingEmails(true);
      
      const response = await fetch(`https://blrbdhfzbjxxuntdulor.supabase.co/functions/v1/send-order-emails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderDetails,
          customerEmail: userEmail
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to send order confirmation emails');
      }
      
      console.log('Order emails sent successfully:', result);
      
      toast({
        title: "Order confirmation sent",
        description: "We've sent you an email with your order details.",
      });
      
    } catch (error) {
      console.error('Error sending order emails:', error);
      toast({
        title: "Email notification failed",
        description: "We couldn't send the order confirmation email. Please check your order in your account.",
        variant: "destructive"
      });
    } finally {
      setSendingEmails(false);
    }
  };
  
  const handleCheckout = async (formData) => {
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
      
      // If the user used a new address and wants to save it as their default
      if (addressChoice === 'new' && formData.useDefaultAddress) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            first_name: formData.firstName,
            last_name: formData.lastName,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            postal_code: formData.postalCode,
            country: formData.country,
            phone: formData.phone
          })
          .eq('id', user.id);
          
        if (updateError) {
          console.error("Error updating profile with new address:", updateError);
        }
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
      const completeOrderDetails = {
        id: order.id,
        created_at: order.created_at,
        total: order.total,
        payment_method: order.payment_method,
        shipping_address: shippingAddress,
        items: orderItemsWithDetails
      };
      
      setOrderDetails(completeOrderDetails);
      
      // Show the confirmation dialog
      setOrderSuccess(true);
      
      // Send order confirmation emails
      if (user.email) {
        await sendOrderEmails(completeOrderDetails, user.email);
      }
      
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "There was an error processing your order.",
        variant: "destructive"
      });
      setLoading(false);
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
  
  const hasDefaultAddress = userProfile && userProfile.address;

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
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleCheckout)} className="space-y-6">
          <div className="urban-card p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Shipping Information</h2>
            
            {/* Address selection - only show if user has a saved address */}
            {hasDefaultAddress && (
              <div className="mb-6 space-y-4">
                <h3 className="text-lg font-medium text-white">Choose Shipping Address</h3>
                
                <RadioGroup 
                  value={addressChoice} 
                  onValueChange={setAddressChoice}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
                >
                  <div className={`border p-4 rounded-md ${addressChoice === 'default' ? 'border-urban-purple' : 'border-gray-700'}`}>
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <RadioGroupItem value="default" id="default-address" className="mt-1" />
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <Home className="h-4 w-4 text-urban-purple mr-2" />
                          <p className="font-medium text-white">Use Your Default Address</p>
                        </div>
                        {userProfile && (
                          <div className="text-sm text-gray-400">
                            <p>{userProfile.first_name} {userProfile.last_name}</p>
                            <p>{userProfile.address}</p>
                            <p>{userProfile.city}, {userProfile.state} {userProfile.postal_code}</p>
                            <p>{userProfile.country}</p>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                  
                  <div className={`border p-4 rounded-md ${addressChoice === 'new' ? 'border-urban-purple' : 'border-gray-700'}`}>
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <RadioGroupItem value="new" id="new-address" className="mt-1" />
                      <div>
                        <div className="flex items-center">
                          <PlusCircle className="h-4 w-4 text-urban-purple mr-2" />
                          <p className="font-medium text-white">Use a New Address</p>
                        </div>
                        <p className="text-sm text-gray-400">Enter a new shipping address for this order</p>
                      </div>
                    </label>
                  </div>
                </RadioGroup>
              </div>
            )}
          
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">First Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={addressChoice === 'default'} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={addressChoice === 'default'} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel className="text-muted-foreground">Address</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={addressChoice === 'default'} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">City</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={addressChoice === 'default'} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">State/Province</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={addressChoice === 'default'} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">Postal Code</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={addressChoice === 'default'} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">Country</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={addressChoice === 'default'} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel className="text-muted-foreground">Phone Number</FormLabel>
                  <FormControl>
                    <Input {...field} type="tel" disabled={addressChoice === 'default'} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Option to save new address as default */}
            {addressChoice === 'new' && (
              <FormField
                control={form.control}
                name="useDefaultAddress"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-6">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-white">
                        Save as my default shipping address
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            )}
          </div>
          
          <div className="urban-card p-6">
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
            className="w-full bg-urban-purple hover:bg-urban-magenta mt-4"
            disabled={loading || sendingEmails}
          >
            {loading ? "Processing..." : sendingEmails ? "Sending Confirmation..." : "Complete Purchase"}
          </Button>
        </form>
      </Form>
      
      {/* Order confirmation dialog */}
      <OrderConfirmation 
        open={orderSuccess}
        onOpenChange={(open) => {
          setOrderSuccess(open);
          if (!open) {
            // Only clear the cart when closing the dialog
            clearCart();
            // If dialog is closed without continuing shopping, redirect to home
            navigate('/');
          }
        }}
        orderDetails={orderDetails}
      />
    </div>
  );
}
