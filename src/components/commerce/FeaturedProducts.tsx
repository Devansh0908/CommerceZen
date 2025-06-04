import type { Product } from '@/lib/types';
import ProductCard from './ProductCard';

interface FeaturedProductsProps {
  products: Product[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  const featured = products.filter(p => p.featured);
  if (featured.length === 0) return null;

  return (
    <section className="mb-16">
      <h2 className="text-3xl md:text-4xl font-headline font-bold text-primary mb-8 text-center">
        Featured Collections
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {featured.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
