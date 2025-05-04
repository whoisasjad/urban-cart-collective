
import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-urban-dark border-t border-urban-purple/20 py-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-2xl font-graffiti text-urban-purple mb-4">URBAN<span className="text-urban-magenta">CART</span></h3>
          <p className="text-muted-foreground">The ultimate urban street-art inspired fashion destination. Limited edition designs from the streets to your wardrobe.</p>
        </div>
        
        <div>
          <h4 className="text-lg font-medium text-white mb-4">Shop</h4>
          <ul className="space-y-2">
            <li><Link to="/products" className="text-muted-foreground hover:text-urban-purple transition-colors">All Products</Link></li>
            <li><Link to="/products?category=Hoodies" className="text-muted-foreground hover:text-urban-purple transition-colors">Hoodies</Link></li>
            <li><Link to="/products?category=T-Shirts" className="text-muted-foreground hover:text-urban-purple transition-colors">T-Shirts</Link></li>
            <li><Link to="/products?category=Accessories" className="text-muted-foreground hover:text-urban-purple transition-colors">Accessories</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-lg font-medium text-white mb-4">About</h4>
          <ul className="space-y-2">
            <li><Link to="/about" className="text-muted-foreground hover:text-urban-purple transition-colors">Our Story</Link></li>
            <li><Link to="/about#artists" className="text-muted-foreground hover:text-urban-purple transition-colors">Artists</Link></li>
            <li><Link to="/contact" className="text-muted-foreground hover:text-urban-purple transition-colors">Contact Us</Link></li>
            <li><Link to="/faq" className="text-muted-foreground hover:text-urban-purple transition-colors">FAQ</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-lg font-medium text-white mb-4">Follow</h4>
          <div className="flex space-x-4">
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noreferrer" 
              className="h-10 w-10 flex items-center justify-center rounded-full bg-secondary/50 text-white hover:bg-urban-purple transition-colors"
            >
              <span className="sr-only">Instagram</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noreferrer" 
              className="h-10 w-10 flex items-center justify-center rounded-full bg-secondary/50 text-white hover:bg-urban-purple transition-colors"
            >
              <span className="sr-only">Twitter</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
              </svg>
            </a>
            <a 
              href="https://tiktok.com" 
              target="_blank" 
              rel="noreferrer" 
              className="h-10 w-10 flex items-center justify-center rounded-full bg-secondary/50 text-white hover:bg-urban-purple transition-colors"
            >
              <span className="sr-only">TikTok</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"></path>
                <path d="M15 8v7a4 4 0 0 1-4 4H9"></path>
                <path d="M15 8a4 4 0 0 0 4 4h1"></path>
                <line x1="15" y1="2" x2="15" y2="8"></line>
              </svg>
            </a>
          </div>
          <div className="mt-4">
            <h5 className="text-white mb-2">Join our newsletter</h5>
            <form className="flex">
              <input 
                type="email" 
                placeholder="Your email" 
                className="flex-grow bg-secondary/50 border border-urban-purple/30 rounded-l-md px-3 py-2 text-white" 
              />
              <button 
                type="submit" 
                className="bg-urban-purple text-white px-4 py-2 rounded-r-md hover:bg-urban-magenta transition-colors"
              >
                Join
              </button>
            </form>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-8 pt-4 border-t border-urban-purple/20 flex flex-col md:flex-row justify-between items-center">
        <p className="text-muted-foreground text-sm">© 2023 UrbanCart. All rights reserved.</p>
        <div className="flex space-x-4 mt-4 md:mt-0">
          <Link to="/privacy" className="text-sm text-muted-foreground hover:text-urban-purple transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="text-sm text-muted-foreground hover:text-urban-purple transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
