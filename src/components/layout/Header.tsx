"use client";

import Link from 'next/link';
import { ShoppingCart, Zap } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useEffect, useState } from 'react';

export default function Header() {
  const { getItemCount, isCartInitialized, cartItems } = useCart(); // cartItems added to deps for real-time update
  const [mounted, setMounted] = useState(false);
  const [currentCartItemCount, setCurrentCartItemCount] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isCartInitialized) {
        setCurrentCartItemCount(getItemCount());
    }
  }, [getItemCount, mounted, isCartInitialized, cartItems]);

  return (
    <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-2xl font-headline font-bold hover:opacity-80 transition-opacity">
          <Zap className="h-8 w-8 text-accent" />
          CommerceZen
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/" className="hover:text-accent transition-colors font-body">
            Home
          </Link>
          <Link href="/cart" className="relative flex items-center hover:text-accent transition-colors font-body">
            <ShoppingCart className="h-6 w-6" />
            {mounted && isCartInitialized && currentCartItemCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-accent text-accent-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                {currentCartItemCount}
              </span>
            )}
            <span className="sr-only">Cart ({currentCartItemCount} items)</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
