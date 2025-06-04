import FeaturedProducts from '@/components/commerce/FeaturedProducts';
import ProductGrid from '@/components/commerce/ProductGrid';
import { mockProducts } from '@/lib/data'; 

export default function HomePage() {
  const products = mockProducts;

  return (
    <div className="space-y-12">
      <FeaturedProducts products={products} />
      <ProductGrid products={products} />
    </div>
  );
}
