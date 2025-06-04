
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { Order } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ListOrdered, ShoppingBag, LogIn, CalendarDays, User } from 'lucide-react'; // Added CalendarDays and User

export default function OrderHistoryClientView() {
  const { user, isLoggedIn, isLoading: isAuthLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  useEffect(() => {
    if (isLoggedIn && user?.email) {
      setIsLoadingOrders(true);
      try {
        const storageKey = `commercezen_orders_${user.email}`;
        const storedOrdersJson = localStorage.getItem(storageKey);
        if (storedOrdersJson) {
          const parsedOrders: Order[] = JSON.parse(storedOrdersJson);
          // Sort orders by date, newest first
          parsedOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setOrders(parsedOrders);
        } else {
          setOrders([]);
        }
      } catch (error) {
        console.error("Failed to load or parse orders from localStorage", error);
        setOrders([]); 
      } finally {
        setIsLoadingOrders(false);
      }
    } else if (!isAuthLoading) { 
      // If not loading auth and not logged in, then stop loading orders
      setIsLoadingOrders(false);
      setOrders([]);
    }
  }, [isLoggedIn, user, isAuthLoading]);

  if (isAuthLoading || isLoadingOrders) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <ListOrdered className="h-16 w-16 text-muted-foreground animate-pulse mb-4" />
        <p className="text-xl font-body text-muted-foreground">Loading your order history...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <LogIn className="h-16 w-16 text-destructive mb-6" />
        <h2 className="text-3xl font-headline font-semibold text-primary mb-3">Access Denied</h2>
        <p className="text-lg text-muted-foreground font-body mb-8 max-w-md">
          You need to be logged in to view your order history.
        </p>
        <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-body">
          <Link href="/">Go to Login/Signup</Link>
        </Button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <ShoppingBag className="h-20 w-20 text-muted-foreground opacity-60 mb-6" />
        <h2 className="text-3xl font-headline font-semibold text-primary mb-3">No Orders Yet</h2>
        <p className="text-lg text-muted-foreground font-body mb-8 max-w-md">
          It looks like you haven't placed any orders with us. Time to start shopping!
        </p>
        <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-body">
          <Link href="/">Explore Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-10">
      <h1 className="text-4xl font-headline font-bold text-primary text-center">Your Order History</h1>
      
      <ScrollArea className="h-[calc(100vh-250px)]"> {/* Defined height for ScrollArea */}
        <div className="space-y-6 pr-4">
          {orders.map((order) => (
            <Card key={order.id} className="shadow-lg animate-subtle-fade-in bg-card">
              <CardHeader className="pb-3 border-b">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <CardTitle className="font-headline text-xl text-primary">Order ID: {order.id.substring(order.id.length - 7)}</CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground font-body">
                        <CalendarDays className="mr-1.5 h-4 w-4" />
                        <span>
                            {new Date(order.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                            {' at '}
                            {new Date(order.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </span>
                    </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div>
                  <h4 className="font-body font-semibold text-md text-primary mb-2">Items:</h4>
                  <ul className="space-y-3">
                    {order.items.map((item, index) => (
                      <li key={`${item.productId}-${index}`} className="flex justify-between items-start text-sm font-body border-b border-border/50 pb-3 last:border-b-0 last:pb-0">
                        <div className="flex-grow pr-2">
                          <Link href={`/product/${item.productId}`} className="font-medium text-primary hover:text-accent transition-colors">{item.name}</Link>
                          <span className="text-muted-foreground ml-1">(x{item.quantity})</span>
                          <p className="text-xs text-muted-foreground">INR {item.priceAtPurchase.toFixed(2)} each</p>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                            <p className="font-semibold text-foreground">INR {(item.priceAtPurchase * item.quantity).toFixed(2)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <Separator />
                 <div>
                  <h4 className="font-body font-semibold text-md text-primary mb-2 flex items-center">
                    <User className="mr-2 h-4 w-4 text-muted-foreground" /> Shipping Address:
                  </h4>
                  <address className="text-sm font-body text-muted-foreground not-italic leading-relaxed pl-6">
                    {order.shippingAddress.name}<br />
                    {order.shippingAddress.address}<br />
                    {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br />
                    {order.shippingAddress.country}<br />
                    Email: {order.shippingAddress.email}
                  </address>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 py-4 px-6 rounded-b-lg mt-4 border-t">
                <div className="flex justify-between items-center w-full">
                  <span className="font-body text-lg font-semibold text-primary">Order Total:</span>
                  <span className="font-headline text-xl font-bold text-accent">INR {order.totalAmount.toFixed(2)}</span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
