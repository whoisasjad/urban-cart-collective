
import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SearchOverlay() {
  const { products, showSearch, toggleSearch } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(products);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showSearch && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showSearch]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const results = products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults(products);
    }
  }, [searchQuery, products]);

  if (!showSearch) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col"
      onClick={toggleSearch}
    >
      <div 
        className="container mx-auto p-4 pt-24"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex items-center mb-8">
          <Input
            ref={inputRef}
            type="search"
            placeholder="Search products..."
            className="w-full rounded-full bg-background/10 border-urban-purple/30 text-white text-lg py-6 pl-6 pr-12"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-2 text-urban-purple hover:bg-transparent hover:text-urban-magenta"
            onClick={toggleSearch}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto max-h-[60vh]">
          {searchResults.length > 0 ? (
            searchResults.map(product => (
              <Link 
                key={product.id} 
                to={`/products/${product.id}`}
                onClick={toggleSearch}
                className="bg-secondary/50 hover:bg-secondary/70 border border-urban-purple/30 rounded-lg p-4 flex items-center gap-4 transition-colors"
              >
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-16 h-16 object-cover rounded-md" 
                />
                <div>
                  <h3 className="text-white font-medium">{product.name}</h3>
                  <p className="text-muted-foreground">${product.price.toFixed(2)}</p>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No results found for "{searchQuery}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
