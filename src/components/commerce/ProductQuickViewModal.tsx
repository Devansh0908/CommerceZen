
"use client";

import type React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShoppingCart, ExternalLink, X, Tag, Info } from 'lucide-react';
import ProductDetailAddToCartButton from './ProductDetailAddToCartButton'; // Re-use existing button

interface ProductQuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function ProductQuickViewModal({ product, isOpen, onOpenChange }: ProductQuickViewModalProps) {
  const { addToCart } = useCart();

  if (!product) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="font-headline text-2xl text-primary truncate pr-10">{product.name}</DialogTitle>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>

        <ScrollArea className="flex-grow overflow-y-auto">
          <div className="grid md:grid-cols-2 gap-6 p-6">
            <div className="relative aspect-square bg-muted/30 rounded-lg overflow-hidden">
              <Image
                src={product.image}
                alt={product.name}
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 768px) 100vw, 50vw"
                data-ai-hint={product.imageHint}
              />
            </div>
            <div className="space-y-4 flex flex-col">
              <p className="text-3xl font-headline font-semibold text-accent">INR {product.price.toFixed(2)}</p>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tag className="h-4 w-4" />
                <span>Category: {product.category}</span>
              </div>

              <div className="space-y-1">
                <h4 className="font-semibold text-md text-primary flex items-center"><Info className="mr-2 h-4 w-4" />Description</h4>
                <DialogDescription className="font-body text-sm text-foreground/80 leading-relaxed max-h-40 overflow-y-auto">
                  {product.description}
                </DialogDescription>
              </div>
              
              <div className="mt-auto space-y-3 pt-4">
                <ProductDetailAddToCartButton product={product} />
                <Button variant="outline" asChild className="w-full font-body">
                  <Link href={`/product/${product.id}`} onClick={() => onOpenChange(false)}>
                    <ExternalLink className="mr-2 h-4 w-4" /> View Full Details
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
        
        {/* Footer can be empty or removed if actions are within content body */}
        {/* <DialogFooter className="p-6 pt-0">
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
}
