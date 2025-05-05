
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useStore } from '@/context/StoreContext';
import ProductCard from './ProductCard';
import { Button } from '@/components/ui/button';

export default function FeaturedProducts() {
  const { products } = useStore();
  
  // Use React Query to fetch featured products
  const { data: featuredProducts } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('featured', true);
        
      if (error) throw error;
      
      // Transform the data to match our Product interface
      return data.map((product: any) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        salePrice: product.sale_price,
        sale: product.sale_price !== null,
        featured: product.featured,
        category: product.category_id,
        imageUrl: product.image_url,
        sizes: product.sizes,
        inStock: product.in_stock
      }));
    },
    // Use the products from the store as a fallback
    placeholderData: () => products.filter(product => product.featured),
  });

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
          {featuredProducts && featuredProducts.length > 0 ? (
            featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <p className="text-center text-white col-span-full py-8">No featured products available.</p>
          )}
        </div>
      </div>
    </section>
  );
}
