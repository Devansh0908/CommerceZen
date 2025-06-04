
import { notFound } from 'next/navigation';
import { mockProducts } from '@/lib/data';
import type { Product } from '@/lib/types';
import ProductDetailClientPage from '@/components/commerce/ProductDetailClientPage'; // New Client Component

export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = mockProducts.find(p => p.id === params.id);
  if (!product) {
    return { title: 'Product Not Found - CommerceZen' };
  }
  return { 
    title: `${product.name} - CommerceZen Reviews`,
    description: `Read reviews for ${product.name}. ${product.description}`,
   };
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const product = mockProducts.find(p => p.id === params.id);

  if (!product) {
    notFound();
  }

  return <ProductDetailClientPage product={product} />;
}
