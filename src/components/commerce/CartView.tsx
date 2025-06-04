
"use client";

import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import CartItemCard from './CartItemCard';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Sparkles, Trash2 } from 'lucide-react'; // Corrected Trash icon
import { recommendProducts, RecommendProductsInput, RecommendProductsOutput } from '@/ai/flows/product-recommendations';
import { useEffect, useState } from 'react';
import type { Product } from '@/lib/types';
import ProductCard from './ProductCard'; 
import { Skeleton } from '@/components/ui/skeleton';

export default function CartView() {
  const { cartItems, getCartTotal, clearCart, isCartInitialized, getItemCount } = useCart();
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

  useEffect(() => {
    async function fetchRecommendations() {
      if (cartItems.length > 0 && isCartInitialized) {
        setIsLoadingRecommendations(true);
        try {
          const input: RecommendProductsInput = {
            cartItems: cartItems.map(item => ({
              name: item.name,
              description: item.description,
              price: item.price,
              category: item.category,
            })),
          };
          const result: RecommendProductsOutput = await recommendProducts(input);
          const recommendedProductsWithIdsAndHints = result.recommendedProducts.map((p, index) => ({
            ...p,
            id: `rec-${Date.now()}-${index}-${Math.random().toString(36).substring(7)}`, // More unique ID
            image: `https://placehold.co/600x400.png`,
            imageHint: p.category.toLowerCase().split('&')[0].trim().split(' ')[0] || 'product general',
          }));
          setRecommendations(recommendedProductsWithIdsAndHints);
        } catch (error) {
          console.error("Error fetching recommendations:", error);
          setRecommendations([]);
        } finally {
          setIsLoadingRecommendations(false);
        }
      } else {
        setRecommendations([]);
      }
    }

    if (isCartInitialized) { // Only fetch if cart is initialized
        fetchRecommendations();
    }
  }, [cartItems, isCartInitialized]); // cartItems dependency will re-trigger when cart changes

  if (!isCartInitialized) {
    return (
      <div className="text-center py-10">
        <Sparkles className="mx-auto h-12 w-12 text-muted-foreground animate-spin" />
        <p className="mt-4 text-lg font-body text-muted-foreground">Loading your cart...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-20">
        <ShoppingBag className="mx-auto h-24 w-24 text-muted-foreground opacity-50" />
        <h2 className="mt-6 text-3xl font-headline font-semibold text-primary">Your Cart is Empty</h2>
        <p className="mt-2 text-muted-foreground font-body">Looks like you haven't added anything to your cart yet.</p>
        <Button asChild variant="default" size="lg" className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90 font-body">
          <Link href="/">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-4xl font-headline font-bold text-primary">Your Shopping Cart</h1>
        {getItemCount() > 0 && (
           <Button variant="outline" onClick={clearCart} className="text-destructive border-destructive hover:bg-destructive/10 hover:text-destructive font-body">
            <Trash2 className="mr-2 h-4 w-4" /> Clear Cart
          </Button>
        )}
      </div>
      
      <div className="space-y-6">
        {cartItems.map(item => (
          <CartItemCard key={item.id} item={item} />
        ))}
      </div>

      <div className="mt-8 p-6 bg-card rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xl font-body text-muted-foreground">Subtotal:</span>
          <span className="text-2xl font-headline font-bold text-primary">INR {getCartTotal().toFixed(2)}</span>
        </div>
        <p className="text-sm text-muted-foreground font-body mb-6">Shipping and taxes calculated at checkout.</p>
        <Button asChild size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-headline">
          <Link href="/checkout">Proceed to Checkout</Link>
        </Button>
      </div>

      {(isLoadingRecommendations || recommendations.length > 0 || cartItems.length > 0) && ( // Show section if loading, or have recs, or have cart items (to show "no recs" message)
        <section className="mt-12">
          <h2 className="text-3xl font-headline font-bold text-primary mb-6 flex items-center">
            <Sparkles className="mr-3 h-7 w-7 text-accent" />
            You Might Also Like
          </h2>
          {isLoadingRecommendations && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-card rounded-lg shadow-lg p-6 space-y-4">
                  <Skeleton className="h-40 w-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          )}
          {!isLoadingRecommendations && recommendations.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          {!isLoadingRecommendations && recommendations.length === 0 && cartItems.length > 0 && (
             <p className="text-muted-foreground font-body">No specific recommendations for your current cart items.</p>
          )}
        </section>
      )}
    </div>
  );
}
