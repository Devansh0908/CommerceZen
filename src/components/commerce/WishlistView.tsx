
"use client";

import Link from 'next/link';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/contexts/AuthContext';
import WishlistItemCard from './WishlistItemCard';
import { Button } from '@/components/ui/button';
import { Heart, LogIn, ShoppingBag, Sparkles } from 'lucide-react';

export default function WishlistView() {
  const { wishlistItems, isWishlistInitialized, getWishlistItemCount } = useWishlist();
  const { isLoggedIn, isLoading: isAuthLoading } = useAuth();

  if (isAuthLoading || !isWishlistInitialized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Sparkles className="h-16 w-16 text-muted-foreground animate-pulse mb-4" />
        <p className="text-xl font-body text-muted-foreground">Loading your wishlist...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <LogIn className="h-16 w-16 text-destructive mb-6" />
        <h2 className="text-3xl font-headline font-semibold text-primary mb-3">Login Required</h2>
        <p className="text-lg text-muted-foreground font-body mb-8 max-w-md">
          Please log in to view your wishlist.
        </p>
        <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-body">
          <Link href="/">Go to Login/Signup</Link>
        </Button>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="text-center py-20">
        <Heart className="mx-auto h-24 w-24 text-muted-foreground opacity-50" />
        <h2 className="mt-6 text-3xl font-headline font-semibold text-primary">Your Wishlist is Empty</h2>
        <p className="mt-2 text-muted-foreground font-body">Looks like you haven't added anything to your wishlist yet.</p>
        <Button asChild variant="default" size="lg" className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90 font-body">
          <Link href="/">Discover Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-4xl font-headline font-bold text-primary">Your Wishlist ({getWishlistItemCount()})</h1>
      </div>
      
      <div className="space-y-6">
        {wishlistItems.map(item => (
          <WishlistItemCard key={item.id} item={item} />
        ))}
      </div>

      <div className="mt-12 text-center">
        <Button asChild size="lg" variant="outline" className="font-body border-primary text-primary hover:bg-primary/5">
          <Link href="/">
            <ShoppingBag className="mr-2 h-5 w-5" /> Continue Shopping
          </Link>
        </Button>
      </div>
    </div>
  );
}
