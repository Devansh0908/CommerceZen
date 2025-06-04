
import FeaturedProducts from '@/components/commerce/FeaturedProducts';
import ProductGrid from '@/components/commerce/ProductGrid';
import SearchBar from '@/components/commerce/SearchBar'; // Import the SearchBar
import { mockProducts } from '@/lib/data'; 

export default function HomePage() {
  const products = mockProducts;

  return (
    <div className="space-y-12">
      <div className="flex justify-center py-8"> {/* Centering wrapper for the search bar */}
        <SearchBar />
      </div>
      <FeaturedProducts products={products} />
      <ProductGrid products={products} />
    </div>
  );
}
