
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useStore } from '@/context/StoreContext';
import { Button } from '@/components/ui/button';
import { Trash, Plus, Minus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function CartPage() {
  const { 
    cart, 
    removeFromCart, 
    updateCartItemQuantity, 
    clearCart, 
    cartTotal 
  } = useStore();

  // Hardcoded shipping options, could be dynamic in the future
  const shippingOptions = [
    { id: 'standard', name: 'Standard Shipping', price: 4.99 },
    { id: 'express', name: 'Express Shipping', price: 12.99 },
  ];

  const [selectedShipping, setSelectedShipping] = React.useState(shippingOptions[0]);

  // Calculate tax (assuming 8% tax rate)
  const taxRate = 0.08;
  const subtotal = cartTotal;
  const tax = subtotal * taxRate;
  const shippingCost = selectedShipping.price;
  const orderTotal = subtotal + tax + shippingCost;

  return (
    <div className="min-h-screen flex flex-col bg-urban-dark">
      <Navbar />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl sm:text-4xl font-graffiti text-white mb-8">Your <span className="text-urban-purple">Cart</span></h1>
          
          {cart.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cart.map((item, index) => (
                  <div 
                    key={`${item.product.id}-${item.size}-${index}`}
                    className="urban-card p-4 grid grid-cols-[80px,1fr,auto] gap-4"
                  >
                    <img 
                      src={item.product.imageUrl} 
                      alt={item.product.name} 
                      className="w-20 h-20 object-cover rounded-md" 
                    />
                    
                    <div>
                      <h3 className="font-medium text-white">{item.product.name}</h3>
                      {item.size && (
                        <p className="text-sm text-muted-foreground">Size: {item.size}</p>
                      )}
                      <p className="text-urban-purple font-bold mt-1">
                        {formatCurrency(item.product.salePrice || item.product.price)}
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.product.id, item.size)}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                      
                      <div className="flex items-center border border-muted rounded-md">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 p-0 rounded-none text-muted-foreground hover:text-white"
                          onClick={() => updateCartItemQuantity(
                            item.product.id, 
                            item.quantity - 1,
                            item.size
                          )}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        
                        <span className="w-8 text-center text-white">{item.quantity}</span>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 p-0 rounded-none text-muted-foreground hover:text-white"
                          onClick={() => updateCartItemQuantity(
                            item.product.id, 
                            item.quantity + 1,
                            item.size
                          )}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={clearCart}
                    className="border-destructive text-destructive hover:bg-destructive/10"
                  >
                    Clear Cart
                  </Button>
                </div>
              </div>
              
              {/* Order Summary */}
              <div className="urban-card p-6">
                <h2 className="text-xl font-medium text-white mb-4">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-white">{formatCurrency(subtotal)}</span>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground mb-2">Shipping</p>
                    <div className="space-y-2">
                      {shippingOptions.map(option => (
                        <div 
                          key={option.id}
                          className="flex items-center justify-between p-2 rounded-md cursor-pointer"
                          onClick={() => setSelectedShipping(option)}
                        >
                          <div className="flex items-center">
                            <input 
                              type="radio" 
                              checked={selectedShipping.id === option.id} 
                              onChange={() => setSelectedShipping(option)}
                              className="h-4 w-4 text-urban-purple"
                            />
                            <label className="ml-2 text-white">{option.name}</label>
                          </div>
                          <span className="text-muted-foreground">{formatCurrency(option.price)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (8%)</span>
                    <span className="text-white">{formatCurrency(tax)}</span>
                  </div>
                  
                  <div className="border-t border-urban-purple/30 pt-4">
                    <div className="flex justify-between font-bold">
                      <span className="text-white">Order Total</span>
                      <span className="text-urban-purple">{formatCurrency(orderTotal)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Button 
                    className="w-full bg-urban-purple hover:bg-urban-magenta text-white font-bold py-3"
                    asChild
                  >
                    <Link to="/checkout">
                      Proceed to Checkout
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="w-full border-urban-purple/50 text-urban-purple hover:bg-urban-purple/10"
                    asChild
                  >
                    <Link to="/products">
                      Continue Shopping
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="urban-card p-12 text-center">
              <h2 className="text-2xl font-medium text-white mb-4">Your cart is empty</h2>
              <p className="text-muted-foreground mb-8">
                Looks like you haven't added any products to your cart yet.
              </p>
              <Button 
                className="bg-urban-purple hover:bg-urban-magenta text-white font-bold"
                asChild
              >
                <Link to="/products">
                  Browse Products
                </Link>
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
