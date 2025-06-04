import type { Product } from '@/lib/types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <section>
      <h2 className="text-3xl md:text-4xl font-headline font-bold text-primary mb-8 text-center">
        Our Products
      </h2>
      {products.length === 0 ? (
         <p className="text-center text-muted-foreground font-body">No products available at the moment. Please check back later!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
