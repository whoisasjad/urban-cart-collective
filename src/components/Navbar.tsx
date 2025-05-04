
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Search, User, Menu, X } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import CartSidebar from './CartSidebar';
import SearchOverlay from './SearchOverlay';
import { useState } from 'react';

export default function Navbar() {
  const { cartItemsCount, toggleCart, toggleSearch } = useStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-urban-dark/80 backdrop-blur-md border-b border-urban-purple/20">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <h1 className="text-2xl font-graffiti text-urban-purple">URBAN<span className="text-urban-magenta">CART</span></h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-white hover:text-urban-purple transition-colors">Home</Link>
          <Link to="/products" className="text-white hover:text-urban-purple transition-colors">Shop</Link>
          <Link to="/about" className="text-white hover:text-urban-purple transition-colors">About</Link>
          <Link to="/contact" className="text-white hover:text-urban-purple transition-colors">Contact</Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <Button
            onClick={toggleSearch}
            variant="ghost"
            size="icon"
            className="rounded-full text-white hover:text-urban-purple hover:bg-background/10"
          >
            <Search className="h-5 w-5" />
          </Button>

          <Link to="/account">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-white hover:text-urban-purple hover:bg-background/10"
            >
              <User className="h-5 w-5" />
            </Button>
          </Link>

          <Button
            onClick={toggleCart}
            variant="ghost"
            size="icon"
            className="rounded-full text-white hover:text-urban-purple hover:bg-background/10 relative"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-urban-purple text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {cartItemsCount}
              </span>
            )}
          </Button>

          {/* Mobile Menu Trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-full text-white hover:text-urban-purple hover:bg-background/10"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-urban-dark">
              <div className="flex flex-col gap-6 pt-10">
                <Link to="/" className="text-xl font-medium text-white hover:text-urban-purple transition-colors">Home</Link>
                <Link to="/products" className="text-xl font-medium text-white hover:text-urban-purple transition-colors">Shop</Link>
                <Link to="/about" className="text-xl font-medium text-white hover:text-urban-purple transition-colors">About</Link>
                <Link to="/contact" className="text-xl font-medium text-white hover:text-urban-purple transition-colors">Contact</Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Cart Sidebar */}
      <CartSidebar />
      
      {/* Search Overlay */}
      <SearchOverlay />
    </header>
  );
}
