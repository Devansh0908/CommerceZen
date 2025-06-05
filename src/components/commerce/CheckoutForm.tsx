
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useEffect } from "react";
import { Sparkles } from "lucide-react";
import type { Order, OrderItem, UserData, OrderStatus } from "@/lib/types";
import { addDays, formatISO } from 'date-fns';


const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  address: z.string().min(10, { message: "Address must be at least 10 characters." }),
  city: z.string().min(2, { message: "City must be at least 2 characters."}),
  postalCode: z.string().min(3, {message: "Postal code must be at least 3 characters."}),
  country: z.string().min(2, {message: "Country must be at least 2 characters."}),
});

export default function CheckoutForm() {
  const { toast } = useToast();
  const { cartItems, getCartTotal, clearCart, isCartInitialized } = useCart();
  const { user, isLoggedIn } = useAuth(); // Get user from AuthContext
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      address: "",
      city: "",
      postalCode: "",
      country: "",
    },
  });

  useEffect(() => {
    if (isCartInitialized && cartItems.length === 0) {
      toast({
        title: "Cart is Empty",
        description: "Redirecting you to the cart page.",
        variant: "default"
      });
      router.push("/cart");
    }
  }, [isCartInitialized, cartItems, router, toast]);

  // Pre-fill form with logged-in user's details if available
   useEffect(() => {
    if (isLoggedIn && user) {
      form.reset({
        name: user.name || "",
        email: user.email || "",
        // Address details are not in AuthUser, so these remain blank or could be fetched if stored elsewhere
        address: "", 
        city: "",
        postalCode: "",
        country: "",
      });
    }
  }, [isLoggedIn, user, form]);


  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!isLoggedIn || !user?.email) {
      toast({
        title: "Login Required",
        description: "Please log in to place an order.",
        variant: "destructive",
      });
      // Optionally redirect to login or show login modal
      return;
    }

    const orderShippingAddress: UserData = values;
    const orderDate = new Date();
    const estimatedDelivery = addDays(orderDate, 5); // Mock: 5 days for delivery

    const newOrder: Order = {
      id: `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: user.email, // Associate order with logged-in user's email
      date: orderDate.toISOString(),
      items: cartItems.map(item => ({
        productId: item.id,
        name: item.name,
        quantity: item.quantity,
        priceAtPurchase: item.price, // Capture price at time of order
      })),
      totalAmount: getCartTotal(),
      shippingAddress: orderShippingAddress,
      status: "Processing" as OrderStatus,
      estimatedDeliveryDate: formatISO(estimatedDelivery, { representation: 'date' }),
    };

    try {
      const storageKey = `commercezen_orders_${user.email}`;
      const existingOrdersJson = localStorage.getItem(storageKey);
      const existingOrders: Order[] = existingOrdersJson ? JSON.parse(existingOrdersJson) : [];
      existingOrders.push(newOrder);
      localStorage.setItem(storageKey, JSON.stringify(existingOrders));
      
      console.log("Simulated Order Data Saved:", newOrder);
      toast({
        title: "Order Placed (Simulated)!",
        description: "Thank you! Your order details have been saved to your mock order history.",
      });
      clearCart();
      router.push("/order-history"); // Redirect to order history page
    } catch (error) {
        console.error("Failed to save order to localStorage", error);
        toast({
            title: "Order Error",
            description: "There was an issue saving your order. Please try again.",
            variant: "destructive",
        });
    }
  }

  if (!isCartInitialized) {
    return (
      <div className="text-center py-10">
        <Sparkles className="mx-auto h-12 w-12 text-muted-foreground animate-spin" />
        <p className="mt-4 text-lg font-body text-muted-foreground">Loading checkout...</p>
      </div>
    );
  }
  
  if (cartItems.length === 0 && isCartInitialized) { // Check isCartInitialized here too
    return (
       <div className="text-center py-10">
        <p className="mt-4 text-lg font-body text-muted-foreground">Your cart is empty. Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-5 gap-8">
      <div className="lg:col-span-3">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-primary">Shipping Information</CardTitle>
            <CardDescription className="font-body text-muted-foreground">Please enter your shipping details.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-body">Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Amelia Pond" {...field} className="font-body" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-body">Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="thegirlwhowaited@example.com" {...field} className="font-body" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-body">Street Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Leadworth, UK" {...field} className="font-body" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-body">City</FormLabel>
                          <FormControl>
                            <Input placeholder="London" {...field} className="font-body" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-body">Postal Code</FormLabel>
                          <FormControl>
                            <Input placeholder="SW1A 1AA" {...field} className="font-body" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
                 <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-body">Country</FormLabel>
                      <FormControl>
                        <Input placeholder="United Kingdom" {...field} className="font-body" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-headline">
                  Place Simulated Order
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2 space-y-6">
        <Card className="shadow-lg sticky top-24">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-primary">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[50vh] overflow-y-auto">
            {cartItems.map(item => (
              <div key={item.id} className="flex justify-between items-start font-body border-b pb-3 last:border-b-0">
                <div className="flex-grow pr-2">
                  <p className="font-semibold leading-tight">{item.name} <span className="text-xs text-muted-foreground">x {item.quantity}</span></p>
                  <p className="text-sm text-muted-foreground">INR {item.price.toFixed(2)} each</p>
                </div>
                <p className="font-semibold shrink-0">INR {(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex justify-between items-center text-xl font-headline font-bold text-primary border-t pt-4 mt-4">
            <span>Total:</span>
            <span>INR {getCartTotal().toFixed(2)}</span>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

