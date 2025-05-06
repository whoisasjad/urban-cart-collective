
import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/context/StoreContext';
import ProductCard from './ProductCard';
import { Button } from '@/components/ui/button';

export default function FeaturedProducts() {
  const { products, isLoading } = useStore();
  const featuredProducts = products.filter(product => product.featured);
  
  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-graffiti text-white">Featured <span className="text-urban-purple">Products</span></h2>
          </div>
          <div className="product-grid">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="urban-card animate-pulse">
                <div className="aspect-square bg-muted-foreground/20"></div>
                <div className="p-4 space-y-2">
                  <div className="h-5 bg-muted-foreground/20 rounded w-3/4"></div>
                  <div className="h-4 bg-muted-foreground/20 rounded w-1/2"></div>
                  <div className="h-8 bg-muted-foreground/20 rounded w-full mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  // Show a message when no featured products are available
  if (featuredProducts.length === 0) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-graffiti text-white">Featured <span className="text-urban-purple">Products</span></h2>
            <Link to="/products">
              <Button variant="outline" className="border-urban-purple text-urban-purple hover:bg-urban-purple/10">
                View All
              </Button>
            </Link>
          </div>
          <div className="urban-card p-8 text-center">
            <p className="text-xl text-muted-foreground">No featured products available</p>
            <Link to="/products" className="mt-4 inline-block">
              <Button className="bg-urban-purple hover:bg-urban-magenta text-white">
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-graffiti text-white">Featured <span className="text-urban-purple">Products</span></h2>
          <Link to="/products">
            <Button variant="outline" className="border-urban-purple text-urban-purple hover:bg-urban-purple/10">
              View All
            </Button>
          </Link>
        </div>
        
        <div className="product-grid">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
