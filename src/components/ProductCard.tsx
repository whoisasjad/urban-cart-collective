
import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/context/StoreContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import type { Product } from '@/context/StoreContext';
import { formatCurrency } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <Link to={`/products/${product.id}`} className="group">
      <div className="urban-card group-hover:scale-[1.02]">
        <div className="relative aspect-square overflow-hidden">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform group-hover:scale-105" 
          />
          
          {product.sale && (
            <div className="absolute top-2 right-2 bg-urban-magenta text-white font-bold text-xs px-2 py-1 rounded-md">
              SALE
            </div>
          )}
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-white font-medium">{product.name}</h3>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                {product.category}
              </p>
            </div>
            
            <div className="text-right">
              {product.salePrice ? (
                <div>
                  <span className="text-urban-purple font-bold">
                    {formatCurrency(product.salePrice)}
                  </span>
                  <span className="ml-2 text-muted-foreground line-through text-sm">
                    {formatCurrency(product.price)}
                  </span>
                </div>
              ) : (
                <span className="text-urban-purple font-bold">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>
          </div>
          
          <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              onClick={handleAddToCart}
              className="w-full bg-urban-purple hover:bg-urban-magenta text-white"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
