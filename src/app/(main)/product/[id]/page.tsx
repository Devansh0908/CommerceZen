
"use client";

import { useState, useEffect, type FormEvent } from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { mockProducts } from '@/lib/data';
import type { Product, Review } from '@/lib/types';
import { Tag, Info, Package, Star, MessageSquare, User, CalendarDays } from 'lucide-react';
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

// Simplified initial review data
const staticReviewData = {
  reviewCount: 15, // This will be a mix of mock and dynamic eventually
  averageRating: '4.5', // This would also be calculated if reviews were persistent
};

const getInitialMockReviews = (productId: string): Review[] => [
  { id: 'review-1', productId, author: 'Alice Wonderland', rating: 5, text: 'Absolutely fantastic product! Exceeded my expectations.', date: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 'review-2', productId, author: 'Bob The Builder', rating: 4, text: 'Very good quality, though a bit pricey. Would recommend.', date: new Date(Date.now() - 86400000 * 5).toISOString() },
];


export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = mockProducts.find(p => p.id === params.id);
  const { toast } = useToast();
  const { user, isLoggedIn } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewerName, setReviewerName] = useState('');
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setReviews(getInitialMockReviews(product.id));
    }
  }, [product]);

  useEffect(() => {
    if (isLoggedIn && user?.email) {
      // Attempt to extract a name part from email for prefill, or use full email
      const namePart = user.email.split('@')[0];
      setReviewerName(namePart.charAt(0).toUpperCase() + namePart.slice(1));
    } else {
      setReviewerName('');
    }
  }, [isLoggedIn, user]);


  if (!product) {
    notFound();
  }

  const handleReviewSubmit = async (e: FormEvent) => {
    e.preventDefault();
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
      id: `review-${Date.now()}`,
      productId: product.id,
      author: reviewerName.trim() || 'Anonymous',
      rating,
      text: reviewText.trim(),
      date: new Date().toISOString(),
    };

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    setReviews(prevReviews => [newReview, ...prevReviews]);
    toast({ title: 'Review Submitted!', description: 'Thank you for your feedback.' });

    // Reset form
    setRating(0);
    setReviewText('');
    // Keep reviewerName as is, or clear if preferred: setReviewerName(''); 
    setIsSubmitting(false);
  };
  
  const { reviewCount, averageRating } = staticReviewData; // Using static data for overall summary

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
          </div>
          
          <div className="p-6 lg:p-8 space-y-5 flex flex-col">
            <h1 className="text-3xl lg:text-4xl font-headline font-bold text-primary">{product.name}</h1>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-5 w-5 ${i < Math.floor(parseFloat(averageRating)) ? 'fill-current' : 'stroke-current opacity-50'}`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground font-body">({averageRating} based on {reviewCount + reviews.filter(r => !getInitialMockReviews(product.id).find(mr => mr.id === r.id)).length} reviews)</span>
            </div>

            <p className="text-3xl font-headline font-semibold text-accent">${product.price.toFixed(2)}</p>
            
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

      {/* Review Submission Form */}
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
                disabled={isSubmitting}
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
            <Button type="submit" size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-headline" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Display Reviews Section */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary">Customer Reviews</CardTitle>
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
                      {new Date(review.date).toLocaleDateString()}
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

// Need to re-add generateMetadata if it was removed by mistake during client conversion
export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = mockProducts.find(p => p.id === params.id);
  if (!product) {
    return { title: 'Product Not Found - CommerceZen' };
  }
  return { 
    title: `${product.name} - CommerceZen Reviews`, // Updated title slightly
    description: `Read reviews for ${product.name}. ${product.description}`,
   };
}
