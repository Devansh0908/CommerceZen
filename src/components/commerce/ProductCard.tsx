"use client";

import Image from 'next/image';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  return (
    <div className="bg-card rounded-lg shadow-lg overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl transform hover:-translate-y-1 group flex flex-col">
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
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-headline font-semibold text-primary mb-2 truncate group-hover:text-accent transition-colors">
          {product.name}
        </h3>
        <p className="text-muted-foreground font-body text-sm mb-3 h-12 overflow-hidden text-ellipsis leading-relaxed">
          {product.description}
        </p>
        <div className="flex justify-between items-center my-auto pt-2">
          <p className="text-2xl font-headline font-bold text-primary">
            ${product.price.toFixed(2)}
          </p>
          <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full font-body">
            {product.category}
          </span>
        </div>
         <Button 
          variant="default" 
          className="w-full mt-4 bg-primary hover:bg-accent text-primary-foreground hover:text-accent-foreground transition-colors duration-300 font-body"
          onClick={() => addToCart(product)}
          aria-label={`Add ${product.name} to cart`}
        >
          <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
        </Button>
      </div>
    </div>
  );
}
