
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Product } from '@/lib/types';
import { mockProducts } from '@/lib/data'; // To look up full product details

const RECENTLY_VIEWED_STORAGE_KEY = 'commercezen_recently_viewed_v1';
const MAX_RECENTLY_VIEWED_ITEMS = 5;

interface UseRecentlyViewedReturn {
  recentlyViewedItems: Product[];
  addRecentlyViewedProduct: (productId: string) => void;
  isInitialized: boolean;
}

export function useRecentlyViewed(): UseRecentlyViewedReturn {
  const [productIds, setProductIds] = useState<string[]>([]);
  const [recentlyViewedItems, setRecentlyViewedItems] = useState<Product[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load stored IDs on initial mount
  useEffect(() => {
    const storedIdsJson = localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY);
    if (storedIdsJson) {
      try {
        const parsedIds = JSON.parse(storedIdsJson) as string[];
        setProductIds(parsedIds);
      } catch (error) {
        console.error("Failed to parse recently viewed items from localStorage", error);
        localStorage.removeItem(RECENTLY_VIEWED_STORAGE_KEY);
      }
    }
    setIsInitialized(true);
  }, []);

  // Update localStorage when productIds change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(RECENTLY_VIEWED_STORAGE_KEY, JSON.stringify(productIds));
    }
  }, [productIds, isInitialized]);

  // Resolve productIds to full Product objects
  useEffect(() => {
    if (isInitialized) {
      const items = productIds
        .map(id => mockProducts.find(p => p.id === id))
        .filter((p): p is Product => Boolean(p)); // Filter out undefined if a product was removed
      setRecentlyViewedItems(items);
    }
  }, [productIds, isInitialized]);

  const addRecentlyViewedProduct = useCallback((productId: string) => {
    setProductIds(prevIds => {
      // Remove the product if it already exists to move it to the front
      const filteredIds = prevIds.filter(id => id !== productId);
      // Add the new product ID to the beginning of the array
      const newIds = [productId, ...filteredIds];
      // Limit the number of recently viewed items
      return newIds.slice(0, MAX_RECENTLY_VIEWED_ITEMS);
    });
  }, []);

  return {
    recentlyViewedItems,
    addRecentlyViewedProduct,
    isInitialized,
  };
}
