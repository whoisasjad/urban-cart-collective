
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1559834755-7d3a2975fc16?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
      
      <div className="absolute inset-0 bg-gradient-to-b from-urban-dark/90 via-urban-dark/70 to-urban-dark"></div>
      
      <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-graffiti mb-6">
            <span className="text-white">Urban Style.</span>
            <br />
            <span className="text-urban-purple">Street Culture.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl">
            Limited edition apparel inspired by urban art and street culture. 
            Exclusive designs that bring the energy and creativity of the streets to your wardrobe.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/products">
              <Button 
                size="lg" 
                className="bg-urban-purple hover:bg-urban-magenta text-white font-bold"
              >
                Shop Now
              </Button>
            </Link>
            
            <Link to="/about">
              <Button 
                variant="outline" 
                size="lg" 
                className="border-urban-purple text-urban-purple hover:bg-urban-purple/10"
              >
                About Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
