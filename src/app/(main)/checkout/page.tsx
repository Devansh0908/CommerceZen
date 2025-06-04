import CheckoutForm from '@/components/commerce/CheckoutForm';

export const metadata = {
  title: 'Checkout - CommerceZen',
};

export default function CheckoutPage() {
  return (
    <div className="pb-10">
      <h1 className="text-4xl font-headline font-bold text-primary mb-10 text-center">Secure Checkout</h1>
      <CheckoutForm />
    </div>
  );
}
