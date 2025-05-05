
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import Categories from '@/components/Categories';
import FeaturedProducts from '@/components/FeaturedProducts';
import PromoSection from '@/components/PromoSection';
import Newsletter from '@/components/Newsletter';
import { useStore } from '@/context/StoreContext';

export default function Index() {
  const { refreshProducts } = useStore();

  // Refresh products when the homepage loads
  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  return (
    <div className="min-h-screen flex flex-col bg-urban-dark">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <Categories />
        <FeaturedProducts />
        <PromoSection />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
