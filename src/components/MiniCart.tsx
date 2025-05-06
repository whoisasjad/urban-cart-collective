
import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/context/StoreContext';
import { Button } from '@/components/ui/button';
import { X, Trash, Plus, Minus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function MiniCart() {
  const { 
    cart, 
    isCartOpen, 
    toggleCart, 
    removeFromCart, 
    updateCartItemQuantity, 
    cartTotal 
  } = useStore();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end">
      <div 
        className="absolute inset-0"
        onClick={toggleCart}
      />
      <div className="relative w-full max-w-md bg-urban-dark border-l border-urban-purple/30 h-full overflow-hidden animate-slide-in-right flex flex-col">
        <div className="p-4 border-b border-urban-purple/30 flex justify-between items-center">
          <h2 className="text-xl font-graffiti text-white">Your Cart</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleCart}
            className="text-white hover:text-urban-purple hover:bg-background/20 rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {cart.length > 0 ? (
            cart.map((item, index) => (
              <div 
                key={`${item.product.id}-${item.size}-${index}`}
                className="bg-secondary/50 border border-urban-purple/20 rounded-lg p-3 flex gap-3"
              >
                <img 
                  src={item.product.imageUrl} 
                  alt={item.product.name} 
                  className="w-20 h-20 object-cover rounded-md" 
                />
                <div className="flex-grow">
                  <div className="flex justify-between">
                    <h3 className="font-medium text-white">{item.product.name}</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-muted-foreground hover:text-destructive"
                      onClick={() => removeFromCart(item.product.id, item.size)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {item.size && (
                    <p className="text-sm text-muted-foreground">Size: {item.size}</p>
                  )}
                  
                  <div className="mt-2 flex items-center justify-between">
                    <p className="font-medium text-urban-purple">
                      {formatCurrency(item.product.salePrice || item.product.price)}
                    </p>
                    
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
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-muted-foreground mb-4">Your cart is empty</p>
              <Button 
                variant="default"
                onClick={toggleCart}
                className="bg-urban-purple hover:bg-urban-magenta"
              >
                Continue Shopping
              </Button>
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-4 border-t border-urban-purple/30 bg-secondary/50">
            <div className="flex justify-between mb-4">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium text-white">{formatCurrency(cartTotal)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link to="/cart" onClick={toggleCart} className="w-full">
                <Button 
                  variant="outline"
                  className="w-full border-urban-purple/50 text-white"
                >
                  View Cart
                </Button>
              </Link>
              <Link to="/cart" onClick={toggleCart} className="w-full">
                <Button 
                  className="w-full bg-urban-purple hover:bg-urban-magenta"
                >
                  Checkout
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
