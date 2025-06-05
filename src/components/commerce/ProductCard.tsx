
"use client";

import React, { useState, useEffect } from 'react'; 
import Image from 'next/image';
import type { Product, Review } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { ShoppingCart, Heart, Star } from 'lucide-react'; // Added Star
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist, isWishlistInitialized } = useWishlist();
  const { isLoggedIn } = useAuth();
  
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [isLoadingRatings, setIsLoadingRatings] = useState(true);

  useEffect(() => {
    if (!product.id) {
      setIsLoadingRatings(false);
      return;
    }

    setIsLoadingRatings(true);
    try {
      const reviewsStorageKey = `commercezen_reviews_${product.id}`;
      const storedReviewsJson = localStorage.getItem(reviewsStorageKey);
      if (storedReviewsJson) {
        const loadedReviews: Review[] = JSON.parse(storedReviewsJson);
        if (loadedReviews.length > 0) {
          const sum = loadedReviews.reduce((acc, review) => acc + review.rating, 0);
          setAverageRating(sum / loadedReviews.length);
          setReviewCount(loadedReviews.length);
        } else {
          setAverageRating(0);
          setReviewCount(0);
        }
      } else {
        // No reviews in localStorage, could also fetch initial mock ones if needed
        // For now, treat as no reviews
        setAverageRating(0);
        setReviewCount(0);
      }
    } catch (error) {
      console.error(`Error loading reviews for product card ${product.id}:`, error);
      setAverageRating(0);
      setReviewCount(0);
    } finally {
      setIsLoadingRatings(false);
    }
  }, [product.id]);

  const isWishlisted = React.useMemo(() => {
      if (!isLoggedIn || !isWishlistInitialized) return false;
      return isInWishlist(product.id);
  }, [isLoggedIn, isWishlistInitialized, product.id, isInWishlist]);


  return (
    <Link href={`/product/${product.id}`} className="block group h-full" aria-label={`View details for ${product.name}`}>
      <div className="bg-card rounded-lg shadow-lg overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl transform hover:-translate-y-1.5 flex flex-col h-full animate-subtle-scale-up">
        <div className="relative w-full h-60">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: 'cover' }}
            className="transition-transform duration-500 group-hover:scale-105"
            data-ai-hint={product.imageHint}
          />
          {isLoggedIn && isWishlistInitialized && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-card/70 hover:bg-card text-primary rounded-full h-9 w-9 z-10"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleWishlist(product);
              }}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart className={`h-5 w-5 transition-colors duration-200 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-primary hover:text-red-400'}`} />
            </Button>
          )}
        </div>
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="text-lg font-headline font-semibold text-primary mb-1.5 truncate group-hover:text-accent transition-colors">
            {product.name}
          </h3>
          <p className="text-muted-foreground font-body text-sm mb-2 h-10 text-ellipsis leading-relaxed overflow-hidden line-clamp-2">
            {product.description}
          </p>

          {/* Star Rating Section */}
          {isLoadingRatings ? (
            <div className="flex items-center gap-1.5 mb-2">
              <Skeleton className="h-4 w-20" /> 
              <Skeleton className="h-4 w-8" />
            </div>
          ) : reviewCount > 0 ? (
            <div className="flex items-center gap-1.5 mb-2" title={`Rated ${averageRating.toFixed(1)} out of 5 stars by ${reviewCount} review${reviewCount !== 1 ? 's' : ''}`}>
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.round(averageRating) ? 'fill-current' : 'stroke-current opacity-60'}`} />
                ))}
              </div>
              <span className="text-xs text-muted-foreground font-body">({reviewCount})</span>
            </div>
          ) : (
            <div className="h-5 mb-2"></div> // Placeholder for height consistency if no reviews
          )}

          <div className="flex justify-between items-center mt-auto pt-2"> {/* Changed my-auto to mt-auto for ratings */}
            <p className="text-xl font-headline font-bold text-primary">
              INR {product.price.toFixed(2)}
            </p>
            <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full font-body">
              {product.category}
            </span>
          </div>
          <Button 
            variant="default" 
            className="w-full mt-4 bg-primary hover:bg-accent text-primary-foreground hover:text-accent-foreground transition-colors duration-300 font-body"
            onClick={(e) => {
              e.preventDefault(); 
              e.stopPropagation(); 
              addToCart(product);
            }}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
          </Button>
        </div>
      </div>
    </Link>
  );
}
