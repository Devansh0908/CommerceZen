
"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { Order, OrderStatus } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from "@/components/ui/progress";
import { ListOrdered, ShoppingBag, LogIn, CalendarDays, User, Clock, Truck, PackageSearch, PackageCheck, AlertCircle } from 'lucide-react';
import { format, parseISO, addDays, differenceInDays, isAfter, isEqual } from 'date-fns';

const getStatusProps = (status: OrderStatus): { icon: React.ElementType, color: string, progress: number, label: string } => {
  switch (status) {
    case "Processing":
      return { icon: Clock, color: "text-blue-500", progress: 20, label: "Processing" };
    case "Shipped":
      return { icon: Truck, color: "text-orange-500", progress: 50, label: "Shipped" };
    case "Out for Delivery":
      return { icon: PackageSearch, color: "text-yellow-500", progress: 75, label: "Out for Delivery" };
    case "Delivered":
      return { icon: PackageCheck, color: "text-green-500", progress: 100, label: "Delivered" };
    default:
      return { icon: AlertCircle, color: "text-gray-500", progress: 0, label: "Unknown Status" };
  }
};

const calculateOrderStatus = (order: Order, currentTime: Date): OrderStatus => {
  if (order.status === "Delivered") return "Delivered"; // Already delivered

  const orderCreationDate = parseISO(order.date);
  // Ensure estimatedDeliveryDate is parsed correctly. It's stored as 'YYYY-MM-DD'.
  // parseISO can handle this directly.
  const estimatedDeliveryDate = parseISO(order.estimatedDeliveryDate);


  if (isAfter(currentTime, estimatedDeliveryDate) || isEqual(currentTime, estimatedDeliveryDate)) {
    return "Delivered";
  }
  // Example: 5 day delivery window
  // Day 0: Order placed (Processing)
  // Day 1-2: Shipped (e.g., if diffInDays >= 1 from creation)
  // Day 3-4: Out for Delivery (e.g., if diffInDays >=3 from creation OR 2 days before ETA)

  const daysSinceCreation = differenceInDays(currentTime, orderCreationDate);

  if (daysSinceCreation >= 3 && differenceInDays(estimatedDeliveryDate, currentTime) <= 2) {
     // If it's within 2 days of ETA and at least 3 days have passed since creation
    return "Out for Delivery";
  }
  if (daysSinceCreation >= 1) {
    return "Shipped";
  }
  return "Processing";
};


export default function OrderHistoryClientView() {
  const { user, isLoggedIn, isLoading: isAuthLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const updateAndPersistOrders = useCallback((updatedOrders: Order[]) => {
    setOrders(updatedOrders);
    if (user?.email) {
      const storageKey = `commercezen_orders_${user.email}`;
      // To ensure we save the absolute latest, we should read, merge, and write.
      // However, for simulation, if this component is the only one modifying, direct save is okay.
      // For robustness in a real app, fetch from storage, apply these specific updates, then save.
      // For this prototype, direct save of the component's full `updatedOrders` list is simpler.
      const allUserOrdersFromStorage = localStorage.getItem(storageKey);
      let finalOrdersToSave: Order[];
      if (allUserOrdersFromStorage) {
          const parsedStoredOrders: Order[] = JSON.parse(allUserOrdersFromStorage);
          // Create a map of updated orders for quick lookup
          const updatedOrdersMap = new Map(updatedOrders.map(o => [o.id, o]));
          // Merge: update existing, keep others
          finalOrdersToSave = parsedStoredOrders.map(storedOrder => 
              updatedOrdersMap.get(storedOrder.id) || storedOrder
          );
          // Add any new orders from updatedOrders that weren't in storage (should not happen in this flow)
          updatedOrders.forEach(uo => {
              if (!finalOrdersToSave.find(fo => fo.id === uo.id)) {
                  finalOrdersToSave.push(uo);
              }
          });

      } else {
          finalOrdersToSave = updatedOrders;
      }
       finalOrdersToSave.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      localStorage.setItem(storageKey, JSON.stringify(finalOrdersToSave));
    }
  }, [user?.email]);


  const checkAndUpdateAllOrderStatuses = useCallback(() => {
    setOrders(currentOrders => {
      const currentTime = new Date();
      let hasChanges = false;
      const newUpdatedOrders = currentOrders.map(order => {
        if (order.status === "Delivered") return order; // Skip already delivered

        const newStatus = calculateOrderStatus(order, currentTime);
        if (newStatus !== order.status) {
          hasChanges = true;
          return { ...order, status: newStatus };
        }
        return order;
      });

      if (hasChanges) {
        updateAndPersistOrders(newUpdatedOrders); // Persist if changes were made
        return newUpdatedOrders; // Return updated state for setOrders
      }
      return currentOrders; // No changes, return current state
    });
  }, [updateAndPersistOrders]);


  useEffect(() => {
    if (isLoggedIn && user?.email) {
      setIsLoadingOrders(true);
      try {
        const storageKey = `commercezen_orders_${user.email}`;
        const storedOrdersJson = localStorage.getItem(storageKey);
        let loadedOrders: Order[] = [];
        if (storedOrdersJson) {
          loadedOrders = JSON.parse(storedOrdersJson);
          loadedOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }
        setOrders(loadedOrders); // Set initial orders
        // Perform initial status check and update
        if (loadedOrders.length > 0) {
            const currentTime = new Date();
            let hasInitialChanges = false;
            const initiallyUpdatedOrders = loadedOrders.map(order => {
                 if (order.status === "Delivered") return order;
                 const newStatus = calculateOrderStatus(order, currentTime);
                 if (newStatus !== order.status) {
                     hasInitialChanges = true;
                     return { ...order, status: newStatus };
                 }
                 return order;
            });
            if (hasInitialChanges) {
                updateAndPersistOrders(initiallyUpdatedOrders); // Persist if changes were made on load
            }
        }

      } catch (error) {
        console.error("Failed to load or parse orders from localStorage", error);
        setOrders([]); 
      } finally {
        setIsLoadingOrders(false);
      }
    } else if (!isAuthLoading) { 
      setIsLoadingOrders(false);
      setOrders([]);
    }
  }, [isLoggedIn, user, isAuthLoading, updateAndPersistOrders]);

  useEffect(() => {
    if (isLoggedIn && user?.email && orders.some(o => o.status !== "Delivered")) {
      if (intervalRef.current) clearInterval(intervalRef.current); // Clear existing interval
      intervalRef.current = setInterval(() => {
        checkAndUpdateAllOrderStatuses();
      }, 30000); // Check every 30 seconds
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isLoggedIn, user?.email, orders, checkAndUpdateAllOrderStatuses]);


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
      
      <ScrollArea className="h-[calc(100vh-250px)]">
        <div className="space-y-6 pr-4">
          {orders.map((order) => {
            const statusProps = getStatusProps(order.status);
            const StatusIcon = statusProps.icon;
            
            let formattedEstimatedDelivery = "N/A";
            if (order.estimatedDeliveryDate) {
                try {
                    // Stored as YYYY-MM-DD, format for display
                    formattedEstimatedDelivery = format(parseISO(order.estimatedDeliveryDate), 'EEE, MMM d, yyyy');
                } catch (e) {
                    console.warn("Could not parse estimatedDeliveryDate:", order.estimatedDeliveryDate, e);
                }
            }

            return (
              <Card key={order.id} className="shadow-lg animate-subtle-fade-in bg-card">
                <CardHeader className="pb-3 border-b">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
                      <div>
                        <CardTitle className="font-headline text-xl text-primary">Order ID: {order.id.substring(order.id.length - 7)}</CardTitle>
                        <div className="flex items-center text-sm text-muted-foreground font-body mt-1">
                            <CalendarDays className="mr-1.5 h-4 w-4" />
                            <span>
                                {format(parseISO(order.date), "MMM d, yyyy 'at' h:mm a")}
                            </span>
                        </div>
                      </div>
                      <div className={`text-sm font-semibold flex items-center gap-2 ${statusProps.color} mt-2 sm:mt-0`}>
                        <StatusIcon className="h-5 w-5" />
                        <span>{statusProps.label}</span>
                      </div>
                  </div>
                  <div className="mt-3">
                    <Progress value={statusProps.progress} className="h-2 [&>div]:bg-accent" />
                    {order.status !== "Delivered" && order.estimatedDeliveryDate && (
                      <p className="text-xs text-muted-foreground font-body mt-1.5 text-right">
                        Estimated Delivery: {formattedEstimatedDelivery}
                      </p>
                    )}
                     {order.status === "Delivered" && (
                      <p className="text-xs text-green-600 dark:text-green-400 font-body mt-1.5 text-right">
                        Delivered on: {formattedEstimatedDelivery} (Actual or Estimated)
                      </p>
                    )}
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
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

