
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Product, CartItem } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

const CART_STORAGE_KEY = 'commercezen_cart';

interface UseCartReturn {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getItemCount: () => number;
  isCartInitialized: boolean;
}

export function useCart(): UseCartReturn {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartInitialized, setIsCartInitialized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (error) {
        console.error("Failed to parse cart from localStorage", error);
        localStorage.removeItem(CART_STORAGE_KEY); 
      }
    }
    setIsCartInitialized(true);
  }, []);

  useEffect(() => {
    if (isCartInitialized) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    }
  }, [cartItems, isCartInitialized]);

  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    setCartItems(currentItems => {
      const existingItemIndex = currentItems.findIndex(item => item.id === product.id);

      let newCartItems;
      if (existingItemIndex > -1) {
        // Item exists, update its quantity
        newCartItems = currentItems.map((item, index) => {
          if (index === existingItemIndex) {
            return { ...item, quantity: item.quantity + quantity };
          }
          return item;
        });
      } else {
        // Item is new, add it
        newCartItems = [...currentItems, { ...product, quantity }];
      }
      return newCartItems;
    });
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
  }, [toast]);

  const removeFromCart = useCallback((productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    toast({
      title: "Removed from Cart",
      description: `Item has been removed from your cart.`,
      variant: "default", 
    });
  }, [toast]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
      toast({
        title: "Cart Updated",
        description: `Item quantity updated.`,
      });
    }
  }, [removeFromCart, toast]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    toast({
      title: "Cart Cleared",
      description: "Your shopping cart is now empty.",
    });
  }, [toast]);

  const getCartTotal = useCallback((): number => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cartItems]);

  const getItemCount = useCallback((): number => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getItemCount,
    isCartInitialized
  };
}
