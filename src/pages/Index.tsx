
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import Categories from '@/components/Categories';
import FeaturedProducts from '@/components/FeaturedProducts';
import PromoSection from '@/components/PromoSection';
import Newsletter from '@/components/Newsletter';

export default function Index() {
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
