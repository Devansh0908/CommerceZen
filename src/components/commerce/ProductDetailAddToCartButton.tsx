
"use client";

import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { ShoppingCart } from 'lucide-react';

interface ProductDetailAddToCartButtonProps {
  product: Product;
}

export default function ProductDetailAddToCartButton({ product }: ProductDetailAddToCartButtonProps) {
  const { addToCart } = useCart();

  return (
    <Button 
      size="lg" 
      className="w-full md:w-auto bg-primary hover:bg-accent text-primary-foreground hover:text-accent-foreground transition-colors duration-300 font-headline mt-4"
      onClick={() => addToCart(product)}
      aria-label={`Add ${product.name} to cart`}
    >
      <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
    </Button>
  );
}
