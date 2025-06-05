
"use client";

import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import ProductCard from './ProductCard';
import { Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function RecentlyViewedProducts() {
  const { recentlyViewedItems, isInitialized } = useRecentlyViewed();

  if (!isInitialized) {
    return (
      <section className="my-12">
        <h2 className="text-3xl md:text-4xl font-headline font-bold text-primary mb-8 text-center flex items-center justify-center">
          <Eye className="mr-3 h-8 w-8 text-accent" />
          Recently Viewed
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-card rounded-lg shadow-lg p-6 space-y-4">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (recentlyViewedItems.length === 0) {
    return null; // Don't render the section if there are no recently viewed items
  }

  return (
    <section className="my-12 animate-subtle-fade-in">
      <h2 className="text-3xl md:text-4xl font-headline font-bold text-primary mb-8 text-center flex items-center justify-center">
        <Eye className="mr-3 h-8 w-8 text-accent" />
        Recently Viewed
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {recentlyViewedItems.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
