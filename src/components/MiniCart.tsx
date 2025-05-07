
import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/context/StoreContext';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function MiniCart() {
  const { cart, removeFromCart, cartTotal } = useStore();

  return (
    <div className="absolute right-0 mt-2 w-80 bg-urban-dark border border-urban-purple/30 rounded-md shadow-lg z-50 animate-fade-in overflow-hidden">
      <div className="p-4 border-b border-urban-purple/30">
        <h3 className="text-lg font-medium text-white">Your Cart ({cart.length})</h3>
      </div>
      
      <div className="max-h-72 overflow-y-auto">
        {cart.map((item, index) => (
          <div 
            key={`${item.product.id}-${item.size}-${index}`} 
            className="p-3 border-b border-urban-purple/20 flex gap-3"
          >
            <img 
              src={item.product.imageUrl} 
              alt={item.product.name} 
              className="w-16 h-16 object-cover rounded" 
            />
            <div className="flex-grow">
              <div className="flex justify-between">
                <h4 className="font-medium text-white text-sm">{item.product.name}</h4>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  onClick={() => removeFromCart(item.product.id, item.size)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
              {item.size && (
                <p className="text-xs text-muted-foreground">Size: {item.size}</p>
              )}
              <div className="flex justify-between items-center mt-1">
                <p className="text-sm text-urban-purple font-medium">
                  {formatCurrency(item.product.salePrice || item.product.price)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Qty: {item.quantity}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 bg-secondary/50">
        <div className="flex justify-between mb-3">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium text-white">{formatCurrency(cartTotal)}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Link to="/cart" className="w-full">
            <Button 
              variant="outline"
              className="w-full border-urban-purple/50 text-white"
            >
              View Cart
            </Button>
          </Link>
          <Link to="/cart" className="w-full">
            <Button 
              className="w-full bg-urban-purple hover:bg-urban-magenta"
            >
              Checkout
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
