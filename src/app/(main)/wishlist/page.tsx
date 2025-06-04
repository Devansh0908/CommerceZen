
import WishlistView from '@/components/commerce/WishlistView';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Wishlist - CommerceZen',
  description: 'Manage your saved items on CommerceZen.',
};

export default function WishlistPage() {
  return <WishlistView />;
}
