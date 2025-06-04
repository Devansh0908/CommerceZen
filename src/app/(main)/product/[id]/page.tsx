
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { mockProducts } from '@/lib/data';
import { Tag, Info, Package, Star } from 'lucide-react';
import ProductDetailAddToCartButton from '@/components/commerce/ProductDetailAddToCartButton';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = mockProducts.find(p => p.id === params.id);
  if (!product) {
    return { title: 'Product Not Found - CommerceZen' };
  }
  return { 
    title: `${product.name} - CommerceZen`,
    description: product.description,
   };
}

// Simplified review data
const staticReviewData = {
  reviewCount: 15,
  averageRating: '4.5',
};

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = mockProducts.find(p => p.id === params.id);

  if (!product) {
    notFound();
  }

  const { reviewCount, averageRating } = staticReviewData; // Using static data

  return (
    <div className="py-8">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
        <div className="relative aspect-square rounded-lg overflow-hidden shadow-2xl bg-card group">
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
            <Badge variant="default" className="absolute top-3 right-3 bg-accent text-accent-foreground shadow-md">FEATURED</Badge>
          )}
        </div>
        
        <div className="space-y-5">
          <h1 className="text-3xl lg:text-4xl font-headline font-bold text-primary">{product.name}</h1>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-5 w-5 ${i < Math.floor(parseFloat(averageRating)) ? 'fill-current' : 'stroke-current text-gray-400'}`} />
              ))}
            </div>
            <span className="text-sm text-muted-foreground font-body">({averageRating} based on {reviewCount} reviews)</span>
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

          <div className="flex items-center gap-2 text-green-700 dark:text-green-500 font-semibold font-body pt-2">
            <Package className="h-5 w-5" />
            <span>In Stock - Ships in 2-3 business days</span>
          </div>
          
          <ProductDetailAddToCartButton product={product} />
        </div>
      </div>

      {/* Potential future sections: Reviews, Related Products */}
    </div>
  );
}
