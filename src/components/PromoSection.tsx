
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function PromoSection() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1570004147640-7d30b0426788?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>
          
          <div className="absolute inset-0 bg-gradient-to-r from-urban-dark to-transparent"></div>
          
          <div className="relative py-16 px-8 md:py-24 md:px-16 max-w-lg">
            <h2 className="text-4xl md:text-5xl font-graffiti text-white mb-4">
              Summer Sale <br/>
              <span className="text-urban-magenta">Up to 50% Off</span>
            </h2>
            
            <p className="text-muted-foreground mb-8">
              Limited time offer on our exclusive urban-inspired collection. Grab the hottest street styles before they're gone.
            </p>
            
            <Link to="/products?sale=true">
              <Button 
                size="lg" 
                className="bg-urban-magenta hover:bg-urban-purple text-white font-bold"
              >
                Shop Sale
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
