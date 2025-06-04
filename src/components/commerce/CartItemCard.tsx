
"use client";

import Image from 'next/image';
import type { CartItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/hooks/useCart';
import { Trash2, Plus, Minus } from 'lucide-react';

interface CartItemCardProps {
  item: CartItem;
}

export default function CartItemCard({ item }: CartItemCardProps) {
  const { updateQuantity, removeFromCart } = useCart();

  const handleQuantityChange = (newQuantity: number) => {
    const numQuantity = parseInt(String(newQuantity), 10);
    if (!isNaN(numQuantity) && numQuantity > 0) {
      updateQuantity(item.id, numQuantity);
    } else if (!isNaN(numQuantity) && numQuantity <= 0) {
       updateQuantity(item.id, numQuantity);
    }
  };
  
  const incrementQuantity = () => {
    handleQuantityChange(item.quantity + 1);
  };

  const decrementQuantity = () => {
    if (item.quantity > 1) {
      handleQuantityChange(item.quantity - 1);
    } else {
      handleQuantityChange(0); 
    }
  };


  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-card rounded-lg shadow animate-subtle-fade-in">
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-md overflow-hidden shrink-0">
        <Image
          src={item.image}
          alt={item.name}
          fill
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 640px) 96px, 112px"
          data-ai-hint={item.imageHint}
        />
      </div>
      <div className="flex-grow text-center sm:text-left">
        <h3 className="text-lg font-headline font-semibold text-primary">{item.name}</h3>
        <p className="text-sm text-muted-foreground font-body">{item.category}</p>
        <p className="text-md font-headline font-semibold text-primary mt-1">INR {item.price.toFixed(2)}</p>
      </div>
      <div className="flex items-center gap-2 my-2 sm:my-0">
        <Button variant="outline" size="icon" onClick={decrementQuantity} aria-label="Decrease quantity">
          <Minus className="h-4 w-4" />
        </Button>
        <Input
          type="number"
          value={item.quantity}
          onChange={(e) => handleQuantityChange(Number(e.target.value))}
          min="1"
          className="w-16 text-center font-body appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          aria-label="Item quantity"
        />
        <Button variant="outline" size="icon" onClick={incrementQuantity} aria-label="Increase quantity">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-lg font-headline font-semibold text-primary w-24 text-center sm:text-right">
        INR {(item.price * item.quantity).toFixed(2)}
      </p>
      <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)} className="text-destructive hover:bg-destructive/10 hover:text-destructive" aria-label="Remove item">
        <Trash2 className="h-5 w-5" />
      </Button>
    </div>
  );
}
