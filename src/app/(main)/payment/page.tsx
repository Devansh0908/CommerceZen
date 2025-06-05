
import MockPaymentForm from '@/components/commerce/MockPaymentForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Process Payment - CommerceZen',
  description: 'Complete your secure payment for CommerceZen.',
};

export default function PaymentPage() {
  return (
    <div className="py-8">
      <h1 className="text-3xl sm:text-4xl font-headline font-bold text-primary mb-10 text-center">
        Secure Payment Gateway
      </h1>
      <MockPaymentForm />
    </div>
  );
}

    