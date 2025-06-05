
"use client";

import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import type { Order } from '@/lib/types';
import { Loader2, AlertTriangle, CreditCard, CalendarIcon, Lock } from 'lucide-react';

const PENDING_ORDER_SESSION_KEY = 'commercezen_pending_order';

const paymentFormSchema = z.object({
  cardNumber: z.string()
    .min(16, { message: "Card number must be 16 digits." })
    .max(16, { message: "Card number must be 16 digits." })
    .regex(/^\d+$/, { message: "Card number must contain only digits." }),
  expiryDate: z.string()
    .min(5, { message: "Expiry date must be MM/YY." })
    .max(5, { message: "Expiry date must be MM/YY." })
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, { message: "Invalid expiry date format (MM/YY)." }),
  cvv: z.string()
    .min(3, { message: "CVV must be 3 or 4 digits." })
    .max(4, { message: "CVV must be 3 or 4 digits." })
    .regex(/^\d+$/, { message: "CVV must contain only digits." }),
  cardHolderName: z.string().min(2, {message: "Card holder name is required."}),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

export default function MockPaymentForm() {
  const { toast } = useToast();
  const { clearCart } = useCart();
  const { user } = useAuth(); // Needed to key localStorage for orders
  const router = useRouter();
  
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true); // For loading order from session
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardHolderName: "",
    },
  });

  useEffect(() => {
    try {
      const storedOrderJson = sessionStorage.getItem(PENDING_ORDER_SESSION_KEY);
      if (storedOrderJson) {
        const parsedOrder = JSON.parse(storedOrderJson) as Order;
        setPendingOrder(parsedOrder);
        // Pre-fill card holder name if user exists from order
        if (parsedOrder.shippingAddress?.name) {
          form.setValue("cardHolderName", parsedOrder.shippingAddress.name);
        }
      } else {
        toast({
          title: "No Pending Order",
          description: "No order found to process. Redirecting to cart.",
          variant: "destructive",
        });
        router.replace("/cart");
      }
    } catch (error) {
      console.error("Error retrieving pending order from sessionStorage:", error);
      toast({
        title: "Error",
        description: "Could not retrieve order details. Please try checking out again.",
        variant: "destructive",
      });
      router.replace("/cart");
    } finally {
      setIsLoading(false);
    }
  }, [router, toast, form]);

  const handlePaymentSubmit = async (values: PaymentFormValues) => {
    if (!pendingOrder || !user?.email) {
      toast({ title: "Error", description: "Order details or user session missing.", variant: "destructive" });
      router.push("/checkout");
      return;
    }
    setIsProcessingPayment(true);

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock payment failure for specific card numbers
    if (values.cardNumber.startsWith("0000")) {
      toast({
        title: "Payment Failed (Mock)",
        description: "The mock payment processor declined this card. Please try different card details or check your input.",
        variant: "destructive",
      });
      setIsProcessingPayment(false);
      return;
    }

    // Simulate successful payment
    try {
      const storageKey = `commercezen_orders_${user.email}`;
      const existingOrdersJson = localStorage.getItem(storageKey);
      const existingOrders: Order[] = existingOrdersJson ? JSON.parse(existingOrdersJson) : [];
      existingOrders.unshift(pendingOrder); // Add new order to the beginning
      localStorage.setItem(storageKey, JSON.stringify(existingOrders));
      
      sessionStorage.removeItem(PENDING_ORDER_SESSION_KEY);
      clearCart();
      
      toast({
        title: "Payment Successful!",
        description: `Thank you, ${values.cardHolderName}! Your order #${pendingOrder.id.slice(-7)} has been placed.`,
      });
      router.push("/order-history");
    } catch (error) {
      console.error("Error saving order or clearing cart:", error);
      toast({
        title: "Post-Payment Error",
        description: "Payment was successful, but there was an issue finalizing your order. Please contact support.",
        variant: "destructive",
      });
      setIsProcessingPayment(false); // Allow retry or navigation
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="ml-4 text-lg font-body text-muted-foreground">Loading payment details...</p>
      </div>
    );
  }

  if (!pendingOrder) {
     return (
      <div className="flex flex-col items-center text-center py-20">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-lg font-body text-muted-foreground">Could not load order details for payment.</p>
        <Button onClick={() => router.push('/cart')} className="mt-4">Go to Cart</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-subtle-fade-in">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary">Complete Your Payment</CardTitle>
          <CardDescription className="font-body">
            Order Total: <span className="font-semibold text-accent">INR {pendingOrder.totalAmount.toFixed(2)}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handlePaymentSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="cardHolderName" className="font-body flex items-center"><CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />Cardholder Name</Label>
              <Input id="cardHolderName" {...form.register("cardHolderName")} placeholder="e.g., Amelia Pond" className="font-body" disabled={isProcessingPayment}/>
              {form.formState.errors.cardHolderName && <p className="text-sm text-destructive">{form.formState.errors.cardHolderName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardNumber" className="font-body flex items-center"><CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />Card Number</Label>
              <Input id="cardNumber" {...form.register("cardNumber")} placeholder="0000 0000 0000 0000" className="font-body" disabled={isProcessingPayment}/>
              {form.formState.errors.cardNumber && <p className="text-sm text-destructive">{form.formState.errors.cardNumber.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate" className="font-body flex items-center"><CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />Expiry Date (MM/YY)</Label>
                <Input id="expiryDate" {...form.register("expiryDate")} placeholder="MM/YY" className="font-body" disabled={isProcessingPayment}/>
                {form.formState.errors.expiryDate && <p className="text-sm text-destructive">{form.formState.errors.expiryDate.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv" className="font-body flex items-center"><Lock className="mr-2 h-4 w-4 text-muted-foreground" />CVV</Label>
                <Input id="cvv" {...form.register("cvv")} placeholder="123" className="font-body" disabled={isProcessingPayment}/>
                {form.formState.errors.cvv && <p className="text-sm text-destructive">{form.formState.errors.cvv.message}</p>}
              </div>
            </div>
            <p className="text-xs text-muted-foreground font-body">
              This is a mock payment form. No real transaction will occur. <br/>
              Use card number starting with `0000` to simulate a payment failure.
            </p>
            <Button type="submit" size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-headline" disabled={isProcessingPayment || isLoading}>
              {isProcessingPayment ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing Payment...</>
              ) : (
                `Pay INR ${pendingOrder.totalAmount.toFixed(2)} Securely`
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground/80 font-body text-center w-full">
                Your payment information is handled by our mock secure gateway.
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}

    