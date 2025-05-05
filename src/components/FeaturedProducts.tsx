
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useStore } from '@/context/StoreContext';
import ProductCard from './ProductCard';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export default function FeaturedProducts() {
  const { products, refreshProducts } = useStore();
  const { toast } = useToast();
  
  // Use React Query to fetch featured products
  const { data: featuredProducts, isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('featured', true);
          
        if (error) {
          throw error;
        }
        
        console.log("Featured products fetched:", data);
        
        if (!data || data.length === 0) {
          // If no featured products, trigger a refresh
          console.log("No featured products found, refreshing from store");
          await refreshProducts();
        }
        
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
      } catch (error: any) {
        console.error("Error fetching featured products:", error);
        toast({
          title: "Error loading featured products",
          description: error.message || "Something went wrong",
          variant: "destructive"
        });
        return [];
      }
    },
    // Use the products from the store as a fallback
    placeholderData: () => {
      const fallbackProducts = products.filter(product => product.featured);
      console.log("Using fallback featured products:", fallbackProducts);
      return fallbackProducts;
    },
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
          {isLoading ? (
            <p className="text-center text-white col-span-full py-8">Loading featured products...</p>
          ) : featuredProducts && featuredProducts.length > 0 ? (
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
