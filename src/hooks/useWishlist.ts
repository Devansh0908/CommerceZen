
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Product } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { mockProducts } from '@/lib/data';

const getWishlistStorageKey = (userEmail: string | undefined): string => {
  if (!userEmail) return 'commercezen_wishlist_guest'; // Not actively used for guests currently
  return `commercezen_wishlist_${userEmail}`;
};

interface UseWishlistReturn {
  wishlistProductIds: string[];
  wishlistItems: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  getWishlistItemCount: () => number;
  isWishlistInitialized: boolean;
  toggleWishlist: (product: Product) => void;
}

export function useWishlist(): UseWishlistReturn {
  const { user, isLoggedIn } = useAuth();
  const [wishlistProductIds, setWishlistProductIds] = useState<string[]>([]);
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [isWishlistInitialized, setIsWishlistInitialized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsWishlistInitialized(false); // Reset initialization on user change
    if (isLoggedIn && user?.email) {
      const storageKey = getWishlistStorageKey(user.email);
      const storedWishlistIds = localStorage.getItem(storageKey);
      if (storedWishlistIds) {
        try {
          setWishlistProductIds(JSON.parse(storedWishlistIds));
        } catch (error) {
          console.error("Failed to parse wishlist from localStorage", error);
          localStorage.removeItem(storageKey);
          setWishlistProductIds([]);
        }
      } else {
        setWishlistProductIds([]);
      }
    } else {
      setWishlistProductIds([]); // Clear for logged-out users
    }
    setIsWishlistInitialized(true);
  }, [isLoggedIn, user]);

  useEffect(() => {
    if (isWishlistInitialized && isLoggedIn && user?.email) {
      const storageKey = getWishlistStorageKey(user.email);
      localStorage.setItem(storageKey, JSON.stringify(wishlistProductIds));
    }
    // No need to clear localStorage here if user logs out, handled by above useEffect
  }, [wishlistProductIds, isWishlistInitialized, isLoggedIn, user]);

  useEffect(() => {
    if (isWishlistInitialized) {
        const items = wishlistProductIds
        .map(id => mockProducts.find(p => p.id === id))
        .filter((p): p is Product => Boolean(p));
        setWishlistItems(items);
    } else {
        setWishlistItems([]);
    }
  }, [wishlistProductIds, isWishlistInitialized]);

  const addToWishlist = useCallback((product: Product) => {
    if (!isLoggedIn) {
      toast({ title: "Login Required", description: "Please log in to add items to your wishlist.", variant: "destructive" });
      return;
    }
    setWishlistProductIds(prevIds => {
      if (prevIds.includes(product.id)) {
        return prevIds;
      }
      return [...prevIds, product.id];
    });
    toast({
      title: "Added to Wishlist",
      description: `${product.name} has been added to your wishlist.`,
    });
  }, [isLoggedIn, toast]);

  const removeFromWishlist = useCallback((productId: string) => {
    if (!isLoggedIn) return;
    setWishlistProductIds(prevIds => prevIds.filter(id => id !== productId));
    toast({
      title: "Removed from Wishlist",
      description: `Item has been removed from your wishlist.`,
    });
  }, [isLoggedIn, toast]);

  const isInWishlist = useCallback((productId: string): boolean => {
    if (!isLoggedIn || !isWishlistInitialized) return false;
    return wishlistProductIds.includes(productId);
  }, [isLoggedIn, wishlistProductIds, isWishlistInitialized]);

  const getWishlistItemCount = useCallback((): number => {
    if (!isLoggedIn || !isWishlistInitialized) return 0;
    return wishlistProductIds.length;
  }, [isLoggedIn, wishlistProductIds, isWishlistInitialized]);

  const toggleWishlist = useCallback((product: Product) => {
    if (!isLoggedIn) {
      toast({ title: "Login Required", description: "Please log in to manage your wishlist.", variant: "destructive" });
      return;
    }
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  }, [isLoggedIn, isInWishlist, addToWishlist, removeFromWishlist, toast]);

  return {
    wishlistProductIds,
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    getWishlistItemCount,
    isWishlistInitialized,
    toggleWishlist,
  };
}
