
"use client";

import React, { useState, useEffect, type FormEvent } from 'react';
import Image from 'next/image';
import type { Product, Review } from '@/lib/types';
import { Tag, Info, Package, Star, MessageSquare, User, CalendarDays, Heart } from 'lucide-react';
import ProductDetailAddToCartButton from '@/components/commerce/ProductDetailAddToCartButton';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/hooks/useWishlist';

const getReviewsStorageKey = (productId: string) => `commercezen_reviews_${productId}`;

const getInitialMockReviews = (productId: string): Review[] => [
  // These can be kept as a fallback if no reviews are in localStorage for this product,
  // or removed if you prefer to start fresh.
  { id: 'review-1', productId, author: 'Alice Wonderland', rating: 5, text: 'Absolutely fantastic product! Exceeded my expectations.', date: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 'review-2', productId, author: 'Bob The Builder', rating: 4, text: 'Very good quality, though a bit pricey. Would recommend.', date: new Date(Date.now() - 86400000 * 5).toISOString() },
];

interface ProductDetailClientPageProps {
  product: Product;
}

export default function ProductDetailClientPage({ product }: ProductDetailClientPageProps) {
  const { toast } = useToast();
  const { user, isLoggedIn } = useAuth();
  const { isInWishlist, toggleWishlist, isWishlistInitialized } = useWishlist();
  
  const isWishlisted = React.useMemo(() => {
      if (!isLoggedIn || !isWishlistInitialized) return false;
      return isInWishlist(product.id);
  }, [isLoggedIn, isWishlistInitialized, product.id, isInWishlist]);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewerName, setReviewerName] = useState('');
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [averageRating, setAverageRating] = useState('0.0');
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    if (product) {
      const storageKey = getReviewsStorageKey(product.id);
      const storedReviewsJson = localStorage.getItem(storageKey);
      let loadedReviews: Review[] = [];
      if (storedReviewsJson) {
        try {
          loadedReviews = JSON.parse(storedReviewsJson);
        } catch (e) {
          console.error("Error parsing reviews from localStorage", e);
          // Potentially fallback to initial mocks or clear corrupted data
          localStorage.removeItem(storageKey);
          loadedReviews = getInitialMockReviews(product.id);
        }
      } else {
        // No reviews in storage, use initial mocks as a base (optional)
        loadedReviews = getInitialMockReviews(product.id);
        // Optionally save these initial mocks to localStorage for future consistency
        // localStorage.setItem(storageKey, JSON.stringify(loadedReviews));
      }
      setReviews(loadedReviews);
    }
  }, [product]);

  useEffect(() => {
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
      setAverageRating((sum / reviews.length).toFixed(1));
      setTotalReviews(reviews.length);
    } else {
      setAverageRating('0.0');
      setTotalReviews(0);
    }
  }, [reviews]);

  useEffect(() => {
    if (isLoggedIn && user?.name) {
      setReviewerName(user.name);
    } else if (isLoggedIn && user?.email) {
      const namePart = user.email.split('@')[0];
      setReviewerName(namePart.charAt(0).toUpperCase() + namePart.slice(1));
    } else {
      setReviewerName('');
    }
  }, [isLoggedIn, user]);

  const handleReviewSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast({ title: 'Login Required', description: 'Please log in to submit a review.', variant: 'destructive' });
      return;
    }
    if (rating === 0) {
      toast({ title: 'Rating Required', description: 'Please select a star rating.', variant: 'destructive' });
      return;
    }
    if (!reviewText.trim()) {
      toast({ title: 'Review Text Required', description: 'Please write your review.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);

    const newReview: Review = {
      id: `review-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,
      productId: product.id,
      author: reviewerName.trim() || 'Anonymous',
      rating,
      text: reviewText.trim(),
      date: new Date().toISOString(),
    };

    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call

    const updatedReviews = [newReview, ...reviews];
    setReviews(updatedReviews);
    const storageKey = getReviewsStorageKey(product.id);
    localStorage.setItem(storageKey, JSON.stringify(updatedReviews));

    toast({ title: 'Review Submitted!', description: 'Thank you for your feedback.' });

    setRating(0);
    setReviewText('');
    // Keep reviewerName prefilled if user is logged in
    if (!isLoggedIn) {
        setReviewerName('');
    }
    setIsSubmitting(false);
  };
  
  return (
    <div className="py-8 space-y-12">
      <Card className="shadow-xl overflow-hidden">
        <div className="grid md:grid-cols-2 items-start">
          <div className="relative aspect-square group bg-muted/30">
            <Image
              src={product.image}
              alt={product.name}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              className="transition-transform duration-500 group-hover:scale-105"
              data-ai-hint={product.imageHint}
            />
            {product.featured && (
              <Badge variant="default" className="absolute top-4 right-4 bg-accent text-accent-foreground shadow-md">FEATURED</Badge>
            )}
             {isLoggedIn && isWishlistInitialized && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 left-4 bg-card/80 hover:bg-card text-primary rounded-full h-10 w-10 z-10 shadow-md"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleWishlist(product);
                  }}
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart className={`h-6 w-6 transition-colors duration-200 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-primary hover:text-red-400'}`} />
                </Button>
              )}
          </div>
          
          <div className="p-6 lg:p-8 space-y-5 flex flex-col">
            <h1 className="text-3xl lg:text-4xl font-headline font-bold text-primary">{product.name}</h1>
            
            <div className="flex items-center gap-2">
              {totalReviews > 0 ? (
                <>
                  <div className="flex items-center text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-5 w-5 ${i < Math.round(parseFloat(averageRating)) ? 'fill-current' : 'stroke-current opacity-50'}`} />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground font-body">({averageRating} based on {totalReviews} review{totalReviews !== 1 ? 's' : ''})</span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground font-body">No reviews yet.</span>
              )}
            </div>

            <p className="text-3xl font-headline font-semibold text-accent">INR {product.price.toFixed(2)}</p>
            
            <Separator />

            <div className="space-y-3 font-body text-foreground/90">
              <div className="flex items-center gap-3">
                  <Tag className="h-5 w-5 text-muted-foreground" />
                  <span className="text-md"><strong className="font-semibold">Category:</strong> {product.category}</span>
              </div>
              <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                  <p className="text-md leading-relaxed"><strong className="font-semibold">Description:</strong> {product.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold font-body pt-2">
              <Package className="h-5 w-5" />
              <span>In Stock - Ships in 2-3 business days</span>
            </div>
            
            <div className="mt-auto pt-4">
              <ProductDetailAddToCartButton product={product} />
            </div>
          </div>
        </div>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary flex items-center"><MessageSquare className="mr-3 h-6 w-6 text-accent" />Write a Review</CardTitle>
          <CardDescription className="font-body">Share your thoughts about {product.name}.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReviewSubmit} className="space-y-6">
            <div>
              <Label htmlFor="reviewerName" className="font-body mb-1 block">Your Name</Label>
              <Input 
                id="reviewerName" 
                value={reviewerName} 
                onChange={(e) => setReviewerName(e.target.value)} 
                placeholder="e.g., Jane Doe or Anonymous" 
                className="font-body"
                disabled={isSubmitting || (isLoggedIn && !!user?.name)}
              />
            </div>
            <div>
              <Label className="font-body mb-1 block">Your Rating</Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((starValue) => (
                  <button
                    key={starValue}
                    type="button"
                    onClick={() => !isSubmitting && setRating(starValue)}
                    className={`p-1 rounded-full transition-colors ${isSubmitting ? 'cursor-not-allowed' : 'hover:bg-amber-100 dark:hover:bg-amber-900'}`}
                    aria-label={`Rate ${starValue} out of 5 stars`}
                    disabled={isSubmitting}
                  >
                    <Star className={`h-7 w-7 transition-colors ${rating >= starValue ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground hover:text-amber-400'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="reviewText" className="font-body mb-1 block">Your Review</Label>
              <Textarea 
                id="reviewText" 
                value={reviewText} 
                onChange={(e) => setReviewText(e.target.value)} 
                placeholder={`What did you like or dislike about ${product.name}?`} 
                rows={4}
                className="font-body"
                disabled={isSubmitting}
              />
            </div>
            <Button type="submit" size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-headline" disabled={isSubmitting || !isLoggedIn}>
              {isSubmitting ? 'Submitting...' : (isLoggedIn ? 'Submit Review' : 'Login to Review')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary">Customer Reviews ({totalReviews})</CardTitle>
          {reviews.length === 0 && <CardDescription className="font-body">No reviews yet for this product. Be the first to write one!</CardDescription>}
        </CardHeader>
        {reviews.length > 0 && (
          <CardContent className="space-y-6">
            {reviews.map(review => (
              <Card key={review.id} className="bg-muted/30 p-4 rounded-md shadow-sm animate-subtle-fade-in">
                <CardHeader className="p-0 mb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      <CardTitle className="text-md font-body font-semibold text-primary">{review.author}</CardTitle>
                    </div>
                    <div className="flex items-center text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'stroke-current opacity-40'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground pt-1">
                      <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
                      {new Date(review.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-sm font-body text-foreground/80 leading-relaxed">{review.text}</p>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        )}
      </Card>
    </div>
  );
}

