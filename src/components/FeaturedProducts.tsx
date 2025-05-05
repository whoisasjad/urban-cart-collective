
import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/context/StoreContext';
import ProductCard from './ProductCard';
import { Button } from '@/components/ui/button';

export default function FeaturedProducts() {
  const { products } = useStore();
  const featuredProducts = products.filter(product => product.featured);

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
