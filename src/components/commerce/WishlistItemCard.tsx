
"use client";

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/hooks/useCart';
import { X, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WishlistItemCardProps {
  item: Product;
}

export default function WishlistItemCard({ item }: WishlistItemCardProps) {
  const { removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  return (
    <div className={cn(
        "flex flex-col sm:flex-row items-center gap-4 p-4 bg-card rounded-lg shadow animate-subtle-fade-in",
        "transition-shadow duration-300 ease-in-out hover:shadow-xl"
      )}>
      <Link href={`/product/${item.id}`} className="shrink-0">
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-md overflow-hidden">
          <Image
            src={item.image}
            alt={item.name}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 640px) 96px, 112px"
            data-ai-hint={item.imageHint}
          />
        </div>
      </Link>
      <div className="flex-grow text-center sm:text-left">
        <Link href={`/product/${item.id}`}>
          <h3 className="text-lg font-headline font-semibold text-primary hover:text-accent transition-colors">{item.name}</h3>
        </Link>
        <p className="text-sm text-muted-foreground font-body">{item.category}</p>
        <p className="text-md font-headline font-semibold text-primary mt-1">INR {item.price.toFixed(2)}</p>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-2 mt-2 sm:mt-0">
        <Button 
          variant="default" 
          size="sm" 
          onClick={() => addToCart(item)}
          className="bg-primary hover:bg-accent text-primary-foreground hover:text-accent-foreground font-body w-full sm:w-auto"
          aria-label={`Add ${item.name} to cart`}
        >
          <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => removeFromWishlist(item.id)} 
          className="text-destructive border-destructive hover:bg-destructive/10 hover:text-destructive font-body w-full sm:w-auto"
          aria-label={`Remove ${item.name} from wishlist`}
        >
          <X className="mr-2 h-4 w-4" /> Remove
        </Button>
      </div>
    </div>
  );
}
