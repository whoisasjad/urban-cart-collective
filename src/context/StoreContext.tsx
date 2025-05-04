
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";

// Types
export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  imageUrl: string;
  featured?: boolean;
  sale?: boolean;
  salePrice?: number;
  sizes?: string[];
  inStock: boolean;
};

export type CartItem = {
  product: Product;
  quantity: number;
  size?: string;
};

type StoreContextType = {
  products: Product[];
  cart: CartItem[];
  addToCart: (product: Product, quantity: number, size?: string) => void;
  removeFromCart: (productId: string, size?: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number, size?: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartItemsCount: number;
  isCartOpen: boolean;
  toggleCart: () => void;
  showSearch: boolean;
  toggleSearch: () => void;
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Sample product data
const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Urban Graffiti Hoodie',
    price: 79.99,
    category: 'Hoodies',
    description: 'Bold street-art inspired hoodie with custom graffiti design.',
    imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aG9vZGllfGVufDB8fDB8fHww',
    featured: true,
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
  },
  {
    id: '2',
    name: 'Street Art Tee',
    price: 39.99,
    salePrice: 29.99,
    category: 'T-Shirts',
    description: 'Premium cotton t-shirt featuring original street artwork.',
    imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dHNoaXJ0fGVufDB8fDB8fHww',
    featured: true,
    sale: true,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    inStock: true,
  },
  {
    id: '3',
    name: 'Urban Cargo Pants',
    price: 89.99,
    category: 'Pants',
    description: 'Durable cargo pants with multiple pockets and urban styling.',
    imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2FyZ28lMjBwYW50c3xlbnwwfHwwfHx8MA%3D%3D',
    sizes: ['28', '30', '32', '34', '36'],
    inStock: true,
  },
  {
    id: '4',
    name: 'Graffiti Snapback',
    price: 34.99,
    category: 'Accessories',
    description: 'Adjustable snapback hat with custom graffiti embroidery.',
    imageUrl: 'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8aGF0fGVufDB8fDB8fHww',
    featured: true,
    inStock: true,
  },
  {
    id: '5',
    name: 'Street Style Sneakers',
    price: 119.99,
    salePrice: 89.99,
    category: 'Footwear',
    description: 'Limited edition sneakers with urban design elements.',
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c25lYWtlcnN8ZW58MHx8MHx8fDA%3D',
    sale: true,
    sizes: ['7', '8', '9', '10', '11', '12'],
    inStock: true,
  },
  {
    id: '6',
    name: 'Urban Bomber Jacket',
    price: 149.99,
    category: 'Jackets',
    description: 'Stylish bomber jacket with street art-inspired embroidery.',
    imageUrl: 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8Ym9tYmVyJTIwamFja2V0fGVufDB8fDB8fHww',
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
  },
  {
    id: '7',
    name: 'Graffiti Backpack',
    price: 69.99,
    category: 'Accessories',
    description: 'Durable backpack with custom spray paint design.',
    imageUrl: 'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fGJhY2twYWNrfGVufDB8fDB8fHww',
    inStock: true,
  },
  {
    id: '8',
    name: 'Street Art Beanie',
    price: 24.99,
    category: 'Accessories',
    description: 'Warm beanie with embroidered street art designs.',
    imageUrl: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YmVhbmllJTIwaGF0fGVufDB8fDB8fHww',
    featured: true,
    inStock: true,
  }
];

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const { toast } = useToast();

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error parsing cart data:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Calculate total
  const cartTotal = cart.reduce((total, item) => {
    const price = item.product.salePrice || item.product.price;
    return total + price * item.quantity;
  }, 0);

  // Calculate total items
  const cartItemsCount = cart.reduce((count, item) => count + item.quantity, 0);

  const addToCart = (product: Product, quantity: number, size?: string) => {
    setCart((prevCart) => {
      // Check if this product+size combo is already in the cart
      const existingItemIndex = prevCart.findIndex(
        (item) => item.product.id === product.id && item.size === size
      );

      if (existingItemIndex > -1) {
        // Update quantity of existing item
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + quantity,
        };
        return updatedCart;
      } else {
        // Add new item
        return [...prevCart, { product, quantity, size }];
      }
    });

    toast({
      title: "Added to cart",
      description: `${quantity} x ${product.name} added to your cart.`,
    });
  };

  const removeFromCart = (productId: string, size?: string) => {
    setCart((prevCart) => 
      prevCart.filter(
        (item) => !(item.product.id === productId && item.size === size)
      )
    );
  };

  const updateCartItemQuantity = (productId: string, quantity: number, size?: string) => {
    setCart((prevCart) => 
      prevCart.map((item) => {
        if (item.product.id === productId && item.size === size) {
          return { ...item, quantity };
        }
        return item;
      }).filter(item => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setCart([]);
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart.",
    });
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        cart,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
        cartTotal,
        cartItemsCount,
        isCartOpen,
        toggleCart,
        showSearch,
        toggleSearch,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
