
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useStore } from '@/context/StoreContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Minus, Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import FeaturedProducts from '@/components/FeaturedProducts';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addToCart } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  
  // Find the product
  const product = products.find(p => p.id === id);
  
  // If product not found, redirect to products page
  if (!product) {
    navigate('/products');
    return null;
  }
  
  const handleAddToCart = () => {
    if (product.sizes && !selectedSize) {
      // Show error toast if size is required but not selected
      return;
    }
    
    addToCart(product, quantity, selectedSize);
  };

  return (
    <div className="min-h-screen flex flex-col bg-urban-dark">
      <Navbar />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="urban-card overflow-hidden rounded-lg">
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full aspect-square object-cover" 
              />
            </div>
            
            {/* Product Details */}
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{product.name}</h1>
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-4">
                {product.category}
              </p>
              
              <div className="mb-6">
                {product.salePrice ? (
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-urban-purple mr-2">
                      {formatCurrency(product.salePrice)}
                    </span>
                    <span className="text-muted-foreground line-through text-lg">
                      {formatCurrency(product.price)}
                    </span>
                    <span className="ml-3 bg-urban-magenta text-white text-sm font-bold px-2 py-1 rounded">
                      SALE
                    </span>
                  </div>
                ) : (
                  <span className="text-2xl font-bold text-urban-purple">
                    {formatCurrency(product.price)}
                  </span>
                )}
              </div>
              
              <p className="text-muted-foreground mb-6">
                {product.description}
              </p>
              
              {/* Size Selection */}
              {product.sizes && (
                <div className="mb-6">
                  <h3 className="text-white font-medium mb-2">Size</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map(size => (
                      <Button
                        key={size}
                        variant={selectedSize === size ? 'default' : 'outline'}
                        onClick={() => setSelectedSize(size)}
                        className={selectedSize === size 
                          ? 'bg-urban-purple hover:bg-urban-magenta text-white w-12 h-12'
                          : 'border-urban-purple/50 text-muted-foreground hover:text-white hover:border-urban-purple w-12 h-12'
                        }
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Quantity Selector */}
              <div className="mb-6">
                <h3 className="text-white font-medium mb-2">Quantity</h3>
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="border-urban-purple/50 text-muted-foreground hover:text-white hover:border-urban-purple"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center text-white">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    className="border-urban-purple/50 text-muted-foreground hover:text-white hover:border-urban-purple"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Add to Cart Button */}
              <Button 
                onClick={handleAddToCart}
                className="w-full bg-urban-purple hover:bg-urban-magenta text-white font-bold py-6"
                disabled={product.sizes && !selectedSize}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>
          
          {/* Related Products */}
          <div className="mt-16">
            <h2 className="text-3xl font-graffiti text-white mb-8">You May Also <span className="text-urban-purple">Like</span></h2>
            <FeaturedProducts />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
