
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useStore } from '@/context/StoreContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

export default function ProductsPage() {
  const { products } = useStore();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category') || '';
  const initialSale = queryParams.get('sale') === 'true';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [saleOnly, setSaleOnly] = useState(initialSale);
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [sortBy, setSortBy] = useState('');
  
  // Get unique categories
  const categories = ['All', ...new Set(products.map(product => product.category))];
  
  // Filter products based on filters
  const filteredProducts = products.filter(product => {
    // Filter by search
    if (
      searchTerm && 
      !product.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
      !product.description.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    
    // Filter by category
    if (selectedCategory && selectedCategory !== 'All' && product.category !== selectedCategory) {
      return false;
    }
    
    // Filter by sale
    if (saleOnly && !product.sale) {
      return false;
    }
    
    // Filter by price
    const price = product.salePrice || product.price;
    if (price < priceRange[0] || price > priceRange[1]) {
      return false;
    }
    
    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.salePrice || a.price;
    const priceB = b.salePrice || b.price;
    
    switch (sortBy) {
      case 'price_asc':
        return priceA - priceB;
      case 'price_desc':
        return priceB - priceA;
      case 'name_asc':
        return a.name.localeCompare(b.name);
      case 'name_desc':
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  // Use effect to log products for debugging
  useEffect(() => {
    console.log("Products in ProductsPage:", products);
  }, [products]);

  return (
    <div className="min-h-screen flex flex-col bg-urban-dark">
      <Navbar />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl sm:text-4xl font-graffiti text-white mb-8">
            Our <span className="text-urban-purple">Products</span>
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters */}
            <div className="space-y-6 lg:sticky lg:top-20 lg:self-start">
              <div className="urban-card p-4">
                <h2 className="text-lg font-medium text-white mb-4">Search</h2>
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-background/50 border-urban-purple/30 text-white"
                />
              </div>
              
              <div className="urban-card p-4">
                <h2 className="text-lg font-medium text-white mb-4">Categories</h2>
                <div className="space-y-2">
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'ghost'}
                      onClick={() => setSelectedCategory(category)}
                      className={selectedCategory === category 
                        ? 'bg-urban-purple hover:bg-urban-magenta text-white w-full justify-start'
                        : 'text-muted-foreground hover:text-white hover:bg-secondary/50 w-full justify-start'
                      }
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="urban-card p-4">
                <h2 className="text-lg font-medium text-white mb-4">Price Range</h2>
                <Slider
                  defaultValue={priceRange}
                  min={0}
                  max={200}
                  step={10}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                  className="mb-6"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}+</span>
                </div>
              </div>
              
              <div className="urban-card p-4">
                <h2 className="text-lg font-medium text-white mb-4">Filters</h2>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="sale-only"
                    checked={saleOnly}
                    onChange={() => setSaleOnly(!saleOnly)}
                    className="mr-2 h-4 w-4 rounded border-urban-purple/30 text-urban-purple focus:ring-urban-purple/30"
                  />
                  <label htmlFor="sale-only" className="text-muted-foreground">
                    Sale items only
                  </label>
                </div>
              </div>
              
              <div className="urban-card p-4">
                <h2 className="text-lg font-medium text-white mb-4">Sort By</h2>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-background/50 border-urban-purple/30 text-white rounded-md p-2"
                >
                  <option value="">Default</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name_asc">Name: A to Z</option>
                  <option value="name_desc">Name: Z to A</option>
                </select>
              </div>
            </div>
            
            {/* Products */}
            <div className="lg:col-span-3">
              {sortedProducts.length > 0 ? (
                <div className="product-grid">
                  {sortedProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 urban-card">
                  <h3 className="text-xl text-white mb-2">No products found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your filters or search terms.
                  </p>
                  <Button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('');
                      setSaleOnly(false);
                      setPriceRange([0, 200]);
                    }}
                    className="mt-4 bg-urban-purple hover:bg-urban-magenta text-white"
                  >
                    Reset Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
