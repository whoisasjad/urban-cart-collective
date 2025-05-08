
import React from 'react';
import { format } from 'date-fns';
import { Download, ShoppingBag, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  
  // Generate and download PDF invoice
  const downloadInvoice = () => {
    // Create new PDF document
    const doc = new jsPDF();
    
    // Add company logo/header
    doc.setFillColor(88, 86, 214); // Urban purple color
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('URBAN THREADS', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('INVOICE', 105, 30, { align: 'center' });
    
    // Add order information
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    
    const leftMargin = 15;
    let yPos = 50;
    
    doc.setFont('helvetica', 'bold');
    doc.text('ORDER DETAILS', leftMargin, yPos);
    yPos += 7;
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Order #: ${orderDetails.id}`, leftMargin, yPos);
    yPos += 7;
    
    doc.text(`Date: ${formattedDate}`, leftMargin, yPos);
    yPos += 15;
    
    // Add customer information
    doc.setFont('helvetica', 'bold');
    doc.text('CUSTOMER INFORMATION', leftMargin, yPos);
    yPos += 7;
    
    doc.setFont('helvetica', 'normal');
    doc.text(`${orderDetails.shipping_address.firstName} ${orderDetails.shipping_address.lastName}`, leftMargin, yPos);
    yPos += 7;
    
    doc.text(orderDetails.shipping_address.address, leftMargin, yPos);
    yPos += 7;
    
    doc.text(`${orderDetails.shipping_address.city}, ${orderDetails.shipping_address.state} ${orderDetails.shipping_address.postalCode}`, leftMargin, yPos);
    yPos += 7;
    
    doc.text(`Country: ${orderDetails.shipping_address.country}`, leftMargin, yPos);
    yPos += 7;
    
    doc.text(`Phone: ${orderDetails.shipping_address.phone}`, leftMargin, yPos);
    yPos += 15;
    
    // Add items table
    doc.setFont('helvetica', 'bold');
    doc.text('ORDER ITEMS', leftMargin, yPos);
    yPos += 10;
    
    // Create table for items
    const tableData = orderDetails.items.map(item => [
      item.product.name + (item.size ? ` (${item.size})` : ''),
      item.quantity.toString(),
      formatCurrency(item.price / 100),
      formatCurrency((item.price / 100) * item.quantity)
    ]);
    
    autoTable(doc, {
      startY: yPos,
      head: [['Product', 'Quantity', 'Unit Price', 'Total']],
      body: tableData,
      theme: 'striped',
      headStyles: { 
        fillColor: [88, 86, 214],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9
      },
      margin: { left: leftMargin }
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
    
    // Add payment information
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT INFORMATION', leftMargin, yPos);
    yPos += 7;
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Payment Method: ${
      orderDetails.payment_method === 'cash_on_delivery' ? 'Cash on Delivery' : 
      orderDetails.payment_method === 'bank_transfer' ? 'Bank Transfer' : 
      'Credit Card'
    }`, leftMargin, yPos);
    yPos += 7;
    
    // Total amount with tax
    doc.text(`Subtotal: ${formatCurrency(orderDetails.total / 100)}`, leftMargin, yPos);
    yPos += 7;
    
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: ${formatCurrency(orderDetails.total / 100)}`, leftMargin, yPos);
    yPos += 20;
    
    // Thank you note
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Thank you for shopping with Urban Threads!', 105, yPos, { align: 'center' });
    yPos += 7;
    
    doc.text('We look forward to seeing you again soon.', 105, yPos, { align: 'center' });
    
    // Footer
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Urban Threads Inc. • 123 Fashion Street • New York, NY 10001 • USA', 105, pageHeight - 10, { align: 'center' });
    
    // Save PDF
    doc.save(`urban-threads-invoice-${orderDetails.id.substring(0, 8)}.pdf`);
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
          <div className="flex items-center justify-center text-sm text-muted-foreground mt-2">
            <Mail className="h-4 w-4 mr-1" />
            <span>A confirmation email has been sent to your email address.</span>
          </div>
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
