
import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import CheckoutForm from '@/components/CheckoutForm';
import { formatCurrency } from '@/lib/utils';

export default function CartPage() {
  const { cart, removeFromCart, updateCartItemQuantity, cartTotal } = useStore();
  const { user } = useAuth();
  
  const [isCheckingOut, setIsCheckingOut] = React.useState(false);
  
  return (
    <div className="min-h-screen flex flex-col bg-urban-dark">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Your Cart</h1>
        
        {cart.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl text-white font-medium mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8">Looks like you haven't added any products to your cart yet.</p>
            <Link to="/products">
              <Button className="bg-urban-purple hover:bg-urban-magenta">
                Continue Shopping
              </Button>
            </Link>
          </div>
        ) : isCheckingOut ? (
          <CheckoutForm />
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="urban-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-urban-purple/30">
                        <th className="text-left p-4 text-white">Product</th>
                        <th className="text-center p-4 text-white">Quantity</th>
                        <th className="text-right p-4 text-white">Price</th>
                        <th className="text-right p-4 text-white">Remove</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((item, index) => (
                        <tr 
                          key={`${item.product.id}-${item.size}-${index}`} 
                          className="border-b border-urban-purple/20"
                        >
                          <td className="p-4">
                            <div className="flex items-center">
                              <img 
                                src={item.product.imageUrl} 
                                alt={item.product.name} 
                                className="w-16 h-16 object-cover rounded mr-4" 
                              />
                              <div>
                                <h3 className="text-white font-medium">{item.product.name}</h3>
                                {item.size && (
                                  <p className="text-sm text-muted-foreground">Size: {item.size}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center">
                              <Button
                                variant="outline" 
                                size="icon"
                                className="h-8 w-8 rounded-full border-urban-purple/50"
                                onClick={() => updateCartItemQuantity(
                                  item.product.id, 
                                  Math.max(1, item.quantity - 1), 
                                  item.size
                                )}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="mx-3 min-w-[2rem] text-center text-white">{item.quantity}</span>
                              <Button 
                                variant="outline" 
                                size="icon"
                                className="h-8 w-8 rounded-full border-urban-purple/50"
                                onClick={() => updateCartItemQuantity(
                                  item.product.id, 
                                  item.quantity + 1, 
                                  item.size
                                )}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="text-urban-purple font-bold">
                              {formatCurrency((item.product.salePrice || item.product.price) * item.quantity)}
                            </div>
                            {item.product.salePrice && (
                              <div className="text-sm text-muted-foreground line-through">
                                {formatCurrency(item.product.price * item.quantity)}
                              </div>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFromCart(item.product.id, item.size)}
                              className="text-muted-foreground hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="urban-card p-6">
                <h2 className="text-xl font-bold text-white mb-4">Order Summary</h2>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-white">{formatCurrency(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-white">Free</span>
                  </div>
                  <div className="border-t border-urban-purple/30 pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                      <span className="text-white">Total</span>
                      <span className="text-urban-purple">{formatCurrency(cartTotal)}</span>
                    </div>
                  </div>
                </div>
                
                {user ? (
                  <Button 
                    className="w-full bg-urban-purple hover:bg-urban-magenta"
                    onClick={() => setIsCheckingOut(true)}
                  >
                    Proceed to Checkout
                  </Button>
                ) : (
                  <div>
                    <Link to="/auth">
                      <Button className="w-full bg-urban-purple hover:bg-urban-magenta">
                        Sign in to Checkout
                      </Button>
                    </Link>
                    <p className="text-center text-sm text-muted-foreground mt-2">
                      You need to be signed in to complete your purchase
                    </p>
                  </div>
                )}
                
                <div className="mt-4">
                  <Link to="/products">
                    <Button variant="outline" className="w-full border-urban-purple/50 text-white">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
