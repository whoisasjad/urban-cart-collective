
import React from 'react';
import { format } from 'date-fns';
import { Download, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface OrderItem {
  product_id: string;
  quantity: number;
  price: number;
  size?: string | null;
  product: {
    name: string;
    image_url: string;
  };
}

interface OrderAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

interface OrderDetails {
  id: string;
  created_at: string;
  total: number;
  payment_method: string;
  shipping_address: OrderAddress;
  items: OrderItem[];
}

interface OrderConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderDetails: OrderDetails | null;
}

const OrderConfirmation = ({ open, onOpenChange, orderDetails }: OrderConfirmationProps) => {
  const navigate = useNavigate();
  
  if (!orderDetails) return null;
  
  // Format date
  const orderDate = new Date(orderDetails.created_at);
  const formattedDate = format(orderDate, 'MMMM d, yyyy');
  
  // Handle continue shopping
  const handleContinueShopping = () => {
    onOpenChange(false);
    navigate('/');
  };
  
  // Generate and download invoice
  const downloadInvoice = () => {
    // Create invoice content
    const invoiceContent = `
      URBAN THREADS - ORDER INVOICE
      ============================
      
      Order #: ${orderDetails.id}
      Date: ${formattedDate}
      
      CUSTOMER INFORMATION
      -------------------
      Name: ${orderDetails.shipping_address.firstName} ${orderDetails.shipping_address.lastName}
      Address: ${orderDetails.shipping_address.address}
      City: ${orderDetails.shipping_address.city}, ${orderDetails.shipping_address.state} ${orderDetails.shipping_address.postalCode}
      Country: ${orderDetails.shipping_address.country}
      Phone: ${orderDetails.shipping_address.phone}
      
      ITEMS
      -----
      ${orderDetails.items.map(item => 
        `${item.product.name} ${item.size ? `(${item.size})` : ''} x ${item.quantity} - ${formatCurrency(item.price / 100 * item.quantity)}`
      ).join('\n      ')}
      
      TOTAL: ${formatCurrency(orderDetails.total / 100)}
      
      PAYMENT METHOD: ${orderDetails.payment_method === 'cash_on_delivery' ? 'Cash on Delivery' : 
                        orderDetails.payment_method === 'bank_transfer' ? 'Bank Transfer' : 
                        'Credit Card'}
      
      Thank you for shopping with Urban Threads!
    `;
    
    // Create a Blob with the invoice content
    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    
    // Create an object URL for the Blob
    const url = URL.createObjectURL(blob);
    
    // Create a temporary anchor element to trigger the download
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${orderDetails.id}.txt`;
    document.body.appendChild(link);
    
    // Trigger the download
    link.click();
    
    // Clean up the URL and remove the link
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-urban-purple/30 bg-background">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-white">
            Order Confirmed!
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex justify-center my-4">
          <div className="h-16 w-16 rounded-full bg-urban-purple/20 flex items-center justify-center animate-pulse">
            <ShoppingBag className="h-8 w-8 text-urban-purple" />
          </div>
        </div>
        
        <div className="text-center mb-4">
          <p className="text-white">Thank you for your purchase!</p>
          <p className="text-sm text-muted-foreground">
            Your order #{orderDetails.id.substring(0, 8)} has been placed successfully.
          </p>
        </div>
        
        <div className="space-y-4 mt-4">
          <div className="border border-urban-purple/20 rounded-md p-4">
            <h3 className="font-medium text-white mb-2">Order Summary</h3>
            <div className="space-y-2">
              {orderDetails.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <div className="text-white">
                    {item.product.name}
                    {item.size && <span className="text-muted-foreground"> ({item.size})</span>}
                    <span className="text-muted-foreground"> x{item.quantity}</span>
                  </div>
                  <span className="text-white">{formatCurrency(item.price / 100 * item.quantity)}</span>
                </div>
              ))}
              <div className="border-t border-urban-purple/20 pt-2 mt-2">
                <div className="flex justify-between font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-urban-purple">{formatCurrency(orderDetails.total / 100)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">
              {orderDetails.payment_method === 'cash_on_delivery' ? 
                'You will pay when your order is delivered.' : 
                orderDetails.payment_method === 'bank_transfer' ? 
                'Please complete the bank transfer using the details provided.' : 
                'Your payment has been processed.'}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <Button 
            className="flex-1 bg-urban-purple hover:bg-urban-magenta"
            onClick={handleContinueShopping}
          >
            Continue Shopping
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 border-urban-purple text-urban-purple hover:bg-urban-purple/10"
            onClick={downloadInvoice}
          >
            <Download className="mr-2 h-4 w-4" />
            Download Invoice
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderConfirmation;
