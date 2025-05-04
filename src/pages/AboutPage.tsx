
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-urban-dark">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">About UrbanCart</h1>
        
        <div className="urban-card p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Our Story</h2>
          <p className="text-muted-foreground mb-4">
            UrbanCart was founded in 2025 with a vision to bring authentic street art culture into everyday fashion. 
            We collaborate with local artists and designers to create unique apparel that represents urban creativity and expression.
          </p>
          <p className="text-muted-foreground mb-4">
            Our products are designed for those who appreciate the raw energy and artistic innovation of street culture. 
            Each piece tells a story and connects wearers to the vibrant world of urban art.
          </p>
        </div>
        
        <div className="urban-card p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Our Mission</h2>
          <p className="text-muted-foreground mb-4">
            We aim to support street artists by providing a platform for their work while delivering high-quality, 
            stylish apparel to customers who want to express their individuality through fashion.
          </p>
          <p className="text-muted-foreground mb-4">
            UrbanCart is committed to ethical manufacturing practices and uses sustainable materials whenever possible.
          </p>
        </div>
        
        <div className="urban-card p-6">
          <h2 className="text-xl font-bold text-white mb-4">Contact Us</h2>
          <p className="text-muted-foreground mb-2">
            Have questions or feedback? We'd love to hear from you!
          </p>
          <p className="text-muted-foreground">
            Email: contact@urbancart.com<br />
            Phone: (555) 123-4567<br />
            Address: 123 Street Art Avenue, Design District, Urbanville
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
