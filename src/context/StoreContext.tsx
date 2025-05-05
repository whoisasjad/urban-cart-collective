
import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Define the Product type
export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice: number | null;
  sale: boolean;
  featured: boolean;
  category: string;
  imageUrl: string;
  sizes: string[] | null;
  inStock: boolean;
};

// Define the CartItem type
export type CartItem = {
  product: Product;
  quantity: number;
  selectedSize?: string;
};

// Define the StoreContext type
type StoreContextType = {
  products: Product[];
  addToCart: (product: Product, quantity: number, selectedSize?: string) => void;
  removeFromCart: (productId: string, size?: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number, size?: string) => void;
  clearCart: () => void;
  cartItems: CartItem[];
  refreshProducts: () => Promise<void>;
  // Add missing properties
  cart: CartItem[];
  cartTotal: number;
  cartItemsCount: number;
  isCartOpen: boolean;
  toggleCart: () => void;
  showSearch: boolean;
  toggleSearch: () => void;
};

// Create the StoreContext
const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Create the StoreProvider component
type StoreProviderProps = {
  children: React.ReactNode;
};

export function StoreProvider({ children }: StoreProviderProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [showSearch, setShowSearch] = useState<boolean>(false);

  // Load cart items from local storage on component mount
  useEffect(() => {
    const storedCartItems = localStorage.getItem('cartItems');
    if (storedCartItems) {
      setCartItems(JSON.parse(storedCartItems));
    }
  }, []);

  // Save cart items to local storage whenever cartItems changes
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // Toggle cart visibility
  const toggleCart = () => {
    setIsCartOpen(prev => !prev);
  };

  // Toggle search visibility
  const toggleSearch = () => {
    setShowSearch(prev => !prev);
  };

  // Calculate cart total
  const cartTotal = cartItems.reduce(
    (total, item) => total + (item.product.salePrice || item.product.price) * item.quantity,
    0
  );

  // Calculate cart items count
  const cartItemsCount = cartItems.reduce(
    (count, item) => count + item.quantity,
    0
  );

  // Function to add a product to the cart
  const addToCart = (product: Product, quantity: number, selectedSize?: string) => {
    setCartItems(prevCartItems => {
      const existingCartItemIndex = prevCartItems.findIndex(item => item.product.id === product.id && item.selectedSize === selectedSize);

      if (existingCartItemIndex !== -1) {
        // If the item already exists in the cart, update the quantity
        const newCartItems = [...prevCartItems];
        newCartItems[existingCartItemIndex].quantity += quantity;
        return newCartItems;
      } else {
        // If the item doesn't exist in the cart, add it
        return [...prevCartItems, { product, quantity, selectedSize }];
      }
    });
  };

  // Function to remove a product from the cart
  const removeFromCart = (productId: string, size?: string) => {
    setCartItems(prevCartItems => {
      return prevCartItems.filter(item => item.product.id !== productId || item.selectedSize !== size);
    });
  };

  // Function to update the quantity of a product in the cart
  const updateCartItemQuantity = (productId: string, quantity: number, size?: string) => {
    setCartItems(prevCartItems => {
      return prevCartItems.map(item => {
        if (item.product.id === productId && item.selectedSize === size) {
          return { ...item, quantity };
        } else {
          return item;
        }
      });
    });
  };

  // Function to clear the cart
  const clearCart = () => {
    setCartItems([]);
  };
  
  // Add a refresh function that can be called when products need to be refreshed
  const refreshProducts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*');
        
      if (error) {
        console.error('Error fetching products:', error);
        return;
      }
      
      // Transform the data to match our Product interface
      const transformedProducts: Product[] = data.map((product: any) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        salePrice: product.sale_price,
        sale: product.sale_price !== null,
        featured: product.featured,
        category: product.category_id, // Would need to be joined with categories
        imageUrl: product.image_url,
        sizes: product.sizes,
        inStock: product.in_stock
      }));
      
      setProducts(transformedProducts);
    } catch (error) {
      console.error('Error refreshing products:', error);
    }
  }, []);

  // Fetch products from Supabase on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*');
          
        if (error) {
          console.error('Error fetching products:', error);
          return;
        }
        
        // Transform the data to match our Product interface
        const transformedProducts: Product[] = data.map((product: any) => ({
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          salePrice: product.sale_price,
          sale: product.sale_price !== null,
          featured: product.featured,
          category: product.category_id, // Would need to be joined with categories
          imageUrl: product.image_url,
          sizes: product.sizes,
          inStock: product.in_stock
        }));
        
        setProducts(transformedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);
  
  return (
    <StoreContext.Provider
      value={{
        products,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
        cartItems,
        refreshProducts,
        // Add missing properties to provider value
        cart: cartItems,
        cartTotal,
        cartItemsCount,
        isCartOpen,
        toggleCart,
        showSearch,
        toggleSearch
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

// Create a custom hook to use the StoreContext
export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
