
"use client";

import Image from 'next/image';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  return (
    <Link href={`/product/${product.id}`} className="block group h-full" aria-label={`View details for ${product.name}`}>
      <div className="bg-card rounded-lg shadow-lg overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl transform hover:-translate-y-1.5 flex flex-col h-full">
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
        </div>
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="text-lg font-headline font-semibold text-primary mb-1.5 truncate group-hover:text-accent transition-colors">
            {product.name}
          </h3>
          <p className="text-muted-foreground font-body text-sm mb-3 h-10 text-ellipsis leading-relaxed overflow-hidden line-clamp-2">
            {product.description}
          </p>
          <div className="flex justify-between items-center my-auto pt-2">
            <p className="text-xl font-headline font-bold text-primary">
              ${product.price.toFixed(2)}
            </p>
            <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full font-body">
              {product.category}
            </span>
          </div>
          <Button 
            variant="default" 
            className="w-full mt-4 bg-primary hover:bg-accent text-primary-foreground hover:text-accent-foreground transition-colors duration-300 font-body"
            onClick={(e) => {
              e.preventDefault(); // Prevent link navigation when clicking Add to Cart
              e.stopPropagation(); // Stop event bubbling
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
